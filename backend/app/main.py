from contextlib import asynccontextmanager
from datetime import date, timedelta, datetime
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from .config import settings
from .database import engine, get_db
from .models import Base, Usuario, Perfil, Categoria, Livro, Exemplar, StatusExemplar, Emprestimo, StatusEmprestimo, Reserva, StatusReserva, Multa, StatusMulta
from .schemas import *
from .security import hash_password, verify_password, create_access_token
from .deps import current_user, require_roles


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        if settings.create_initial_admin:
            existing = db.scalar(select(Usuario).where(Usuario.email == settings.initial_admin_email))
            if not existing:
                db.add(Usuario(
                    nome="Administrador",
                    email=settings.initial_admin_email,
                    senha_hash=hash_password(settings.initial_admin_password),
                    perfil=Perfil.ADMIN
                ))
                db.commit()
    finally:
        db.close()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

origins = [x.strip() for x in settings.cors_origins.split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "biblioteca-api"}


@app.post("/auth/login", response_model=TokenResponse)
def login(data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.scalar(select(Usuario).where(Usuario.email == data.username))
    if not user or not verify_password(data.password, user.senha_hash):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    return TokenResponse(access_token=create_access_token(str(user.id)))


@app.post("/usuarios", response_model=UsuarioOut, status_code=201)
def criar_usuario(data: UsuarioCreate, db: Session = Depends(get_db), _=Depends(require_roles(Perfil.ADMIN))):
    if db.scalar(select(Usuario).where(Usuario.email == data.email)):
        raise HTTPException(409, "Email já cadastrado")
    user = Usuario(
        nome=data.nome, email=data.email, senha_hash=hash_password(data.senha), perfil=data.perfil
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/usuarios", response_model=list[UsuarioOut])
def listar_usuarios(db: Session = Depends(get_db), _=Depends(require_roles(Perfil.ADMIN))):
    return list(db.scalars(select(Usuario).order_by(Usuario.nome)))


@app.post("/categorias", response_model=CategoriaOut, status_code=201)
def criar_categoria(data: CategoriaCreate, db: Session = Depends(get_db), _=Depends(require_roles(Perfil.ADMIN, Perfil.BIBLIOTECARIO))):
    if db.scalar(select(Categoria).where(Categoria.nome == data.nome)):
        raise HTTPException(409, "Categoria já cadastrada")
    obj = Categoria(nome=data.nome)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/categorias", response_model=list[CategoriaOut])
def listar_categorias(db: Session = Depends(get_db), _=Depends(current_user)):
    return list(db.scalars(select(Categoria).order_by(Categoria.nome)))


@app.post("/livros", response_model=LivroOut, status_code=201)
def criar_livro(data: LivroCreate, db: Session = Depends(get_db), _=Depends(require_roles(Perfil.ADMIN, Perfil.BIBLIOTECARIO))):
    if not db.get(Categoria, data.categoria_id):
        raise HTTPException(404, "Categoria não encontrada")
    if data.isbn and db.scalar(select(Livro).where(Livro.isbn == data.isbn)):
        raise HTTPException(409, "ISBN já cadastrado")
    livro = Livro(**data.model_dump())
    db.add(livro)
    db.commit()
    db.refresh(livro)
    return livro


@app.get("/livros", response_model=list[LivroOut])
def listar_livros(
    q: str | None = Query(None),
    db: Session = Depends(get_db),
    _=Depends(current_user)
):
    stmt = select(Livro).order_by(Livro.titulo)
    if q:
        stmt = stmt.where((Livro.titulo.ilike(f"%{q}%")) | (Livro.autor.ilike(f"%{q}%")))
    return list(db.scalars(stmt))


@app.post("/livros/{livro_id}/exemplares", response_model=ExemplarOut, status_code=201)
def criar_exemplar(livro_id: int, data: ExemplarCreate, db: Session = Depends(get_db), _=Depends(require_roles(Perfil.ADMIN, Perfil.BIBLIOTECARIO))):
    if not db.get(Livro, livro_id):
        raise HTTPException(404, "Livro não encontrado")
    if db.scalar(select(Exemplar).where(Exemplar.tombo == data.tombo)):
        raise HTTPException(409, "Tombo já cadastrado")
    exemplar = Exemplar(livro_id=livro_id, tombo=data.tombo)
    db.add(exemplar)
    db.commit()
    db.refresh(exemplar)
    return exemplar


@app.get("/livros/{livro_id}/exemplares", response_model=list[ExemplarOut])
def listar_exemplares(livro_id: int, db: Session = Depends(get_db), _=Depends(current_user)):
    return list(db.scalars(select(Exemplar).where(Exemplar.livro_id == livro_id).order_by(Exemplar.id)))


def has_overdue(db: Session, user_id: int) -> bool:
    return db.scalar(select(func.count(Emprestimo.id)).where(
        Emprestimo.usuario_id == user_id,
        Emprestimo.status == StatusEmprestimo.ATIVO,
        Emprestimo.data_prevista_devolucao < date.today()
    )) > 0


@app.post("/emprestimos", response_model=EmprestimoOut, status_code=201)
def criar_emprestimo(
    data: EmprestimoCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(current_user)
):
    target_user_id = data.usuario_id if data.usuario_id is not None else user.id
    if user.perfil == Perfil.LEITOR and target_user_id != user.id:
        raise HTTPException(403, "Leitor só pode criar empréstimo para si")
    target = db.get(Usuario, target_user_id)
    exemplar = db.get(Exemplar, data.exemplar_id)
    if not target or not target.ativo:
        raise HTTPException(404, "Usuário não encontrado")
    if not exemplar:
        raise HTTPException(404, "Exemplar não encontrado")
    if exemplar.status != StatusExemplar.DISPONIVEL:
        raise HTTPException(409, "Exemplar indisponível")

    ativos = db.scalar(select(func.count(Emprestimo.id)).where(
        Emprestimo.usuario_id == target.id,
        Emprestimo.status == StatusEmprestimo.ATIVO
    ))
    if ativos >= 3:
        raise HTTPException(409, "Usuário já possui 3 empréstimos ativos")
    if has_overdue(db, target.id):
        raise HTTPException(409, "Usuário possui empréstimo atrasado")

    reserva = db.scalar(select(Reserva).where(
        Reserva.livro_id == exemplar.livro_id,
        Reserva.usuario_id == target.id,
        Reserva.status == StatusReserva.ATIVA
    ).order_by(Reserva.data_reserva))
    fila = db.scalars(select(Reserva).where(
        Reserva.livro_id == exemplar.livro_id,
        Reserva.status == StatusReserva.ATIVA
    ).order_by(Reserva.data_reserva)).all()
    if fila and (not reserva or fila[0].id != reserva.id):
        raise HTTPException(409, "Livro reservado para outro usuário da fila")
    if reserva:
        reserva.status = StatusReserva.ATENDIDA

    emp = Emprestimo(
        usuario_id=target.id,
        exemplar_id=exemplar.id,
        data_emprestimo=date.today(),
        data_prevista_devolucao=date.today() + timedelta(days=14)
    )
    exemplar.status = StatusExemplar.EMPRESTADO
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


@app.get("/emprestimos/me", response_model=list[EmprestimoOut])
def meus_emprestimos(db: Session = Depends(get_db), user: Usuario = Depends(current_user)):
    return list(db.scalars(select(Emprestimo).where(Emprestimo.usuario_id == user.id).order_by(Emprestimo.data_emprestimo.desc())))


@app.get("/emprestimos", response_model=list[EmprestimoOut])
def listar_emprestimos(db: Session = Depends(get_db), _=Depends(require_roles(Perfil.ADMIN, Perfil.BIBLIOTECARIO))):
    return list(db.scalars(select(Emprestimo).order_by(Emprestimo.data_emprestimo.desc())))


@app.post("/emprestimos/{emprestimo_id}/devolver", response_model=EmprestimoOut)
def devolver(emprestimo_id: int, db: Session = Depends(get_db), user: Usuario = Depends(current_user)):
    emp = db.get(Emprestimo, emprestimo_id)
    if not emp:
        raise HTTPException(404, "Empréstimo não encontrado")
    if user.perfil == Perfil.LEITOR and emp.usuario_id != user.id:
        raise HTTPException(403, "Sem permissão")
    if emp.status != StatusEmprestimo.ATIVO:
        raise HTTPException(409, "Empréstimo já devolvido")

    hoje = date.today()
    emp.data_devolucao = hoje
    emp.status = StatusEmprestimo.DEVOLVIDO
    emp.exemplar.status = StatusExemplar.DISPONIVEL

    atraso = max((hoje - emp.data_prevista_devolucao).days, 0)
    if atraso > 0 and not emp.multa:
        db.add(Multa(emprestimo_id=emp.id, valor=round(atraso * settings.fine_per_day, 2)))

    db.commit()
    db.refresh(emp)
    return emp


@app.post("/emprestimos/{emprestimo_id}/renovar", response_model=EmprestimoOut)
def renovar(emprestimo_id: int, db: Session = Depends(get_db), user: Usuario = Depends(current_user)):
    emp = db.get(Emprestimo, emprestimo_id)
    if not emp:
        raise HTTPException(404, "Empréstimo não encontrado")
    if user.perfil == Perfil.LEITOR and emp.usuario_id != user.id:
        raise HTTPException(403, "Sem permissão")
    if emp.status != StatusEmprestimo.ATIVO:
        raise HTTPException(409, "Empréstimo não está ativo")

    has_reservation = db.scalar(select(func.count(Reserva.id)).where(
        Reserva.livro_id == emp.exemplar.livro_id,
        Reserva.status == StatusReserva.ATIVA
    )) > 0
    if has_reservation:
        raise HTTPException(409, "Não é possível renovar: há reserva para este livro")

    emp.data_prevista_devolucao = emp.data_prevista_devolucao + timedelta(days=14)
    emp.renovacoes += 1
    db.commit()
    db.refresh(emp)
    return emp


@app.post("/reservas", response_model=ReservaOut, status_code=201)
def criar_reserva(data: ReservaCreate, db: Session = Depends(get_db), user: Usuario = Depends(current_user)):
    livro = db.get(Livro, data.livro_id)
    if not livro:
        raise HTTPException(404, "Livro não encontrado")
    disponiveis = db.scalar(select(func.count(Exemplar.id)).where(
        Exemplar.livro_id == livro.id,
        Exemplar.status == StatusExemplar.DISPONIVEL
    ))
    if disponiveis > 0:
        raise HTTPException(409, "Livro possui exemplar disponível; reserva não é necessária")
    if db.scalar(select(Reserva).where(
        Reserva.livro_id == livro.id,
        Reserva.usuario_id == user.id,
        Reserva.status == StatusReserva.ATIVA
    )):
        raise HTTPException(409, "Usuário já possui reserva ativa para este livro")
    reserva = Reserva(usuario_id=user.id, livro_id=livro.id)
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return reserva


@app.get("/reservas/me", response_model=list[ReservaOut])
def minhas_reservas(db: Session = Depends(get_db), user: Usuario = Depends(current_user)):
    return list(db.scalars(select(Reserva).where(Reserva.usuario_id == user.id).order_by(Reserva.data_reserva.desc())))


@app.get("/reservas/livro/{livro_id}", response_model=list[ReservaOut])
def fila_reservas(livro_id: int, db: Session = Depends(get_db), _=Depends(require_roles(Perfil.ADMIN, Perfil.BIBLIOTECARIO))):
    return list(db.scalars(select(Reserva).where(
        Reserva.livro_id == livro_id,
        Reserva.status == StatusReserva.ATIVA
    ).order_by(Reserva.data_reserva)))


@app.get("/multas/me", response_model=list[MultaOut])
def minhas_multas(db: Session = Depends(get_db), user: Usuario = Depends(current_user)):
    stmt = select(Multa).join(Emprestimo).where(Emprestimo.usuario_id == user.id).order_by(Multa.data_criacao.desc())
    return list(db.scalars(stmt))


@app.post("/multas/{multa_id}/pagar", response_model=MultaOut)
def pagar_multa(multa_id: int, db: Session = Depends(get_db), user: Usuario = Depends(current_user)):
    multa = db.get(Multa, multa_id)
    if not multa:
        raise HTTPException(404, "Multa não encontrada")
    if user.perfil == Perfil.LEITOR and multa.emprestimo.usuario_id != user.id:
        raise HTTPException(403, "Sem permissão")
    multa.status = StatusMulta.PAGA
    db.commit()
    db.refresh(multa)
    return multa


@app.get("/relatorios/resumo")
def relatorio_resumo(db: Session = Depends(get_db), _=Depends(require_roles(Perfil.ADMIN, Perfil.BIBLIOTECARIO))):
    return {
        "usuarios": db.scalar(select(func.count(Usuario.id))),
        "livros": db.scalar(select(func.count(Livro.id))),
        "exemplares": db.scalar(select(func.count(Exemplar.id))),
        "exemplares_disponiveis": db.scalar(select(func.count(Exemplar.id)).where(Exemplar.status == StatusExemplar.DISPONIVEL)),
        "emprestimos_ativos": db.scalar(select(func.count(Emprestimo.id)).where(Emprestimo.status == StatusEmprestimo.ATIVO)),
        "reservas_ativas": db.scalar(select(func.count(Reserva.id)).where(Reserva.status == StatusReserva.ATIVA)),
        "multas_pendentes": db.scalar(select(func.count(Multa.id)).where(Multa.status == StatusMulta.PENDENTE)),
    }
