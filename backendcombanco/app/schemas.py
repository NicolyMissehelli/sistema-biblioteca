from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from .models import Perfil, StatusExemplar, StatusEmprestimo, StatusReserva, StatusMulta


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    email: EmailStr
    senha: str = Field(min_length=6)
    perfil: Perfil = Perfil.LEITOR


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    email: EmailStr
    perfil: Perfil
    ativo: bool


class CategoriaCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=100)


class CategoriaOut(CategoriaCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class LivroCreate(BaseModel):
    titulo: str
    autor: str
    isbn: str | None = None
    editora: str | None = None
    ano_publicacao: int | None = None
    categoria_id: int


class LivroOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    titulo: str
    autor: str
    isbn: str | None = None
    editora: str | None = None
    ano_publicacao: int | None = None
    categoria_id: int
    categoria_nome: str | None = None
    quantidade: int = 0
    disponiveis: int = 0


class ExemplarCreate(BaseModel):
    tombo: str


class ExemplarOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    livro_id: int
    tombo: str
    status: StatusExemplar


class EmprestimoCreate(BaseModel):
    exemplar_id: int
    usuario_id: int | None = None


class EmprestimoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    usuario_id: int
    exemplar_id: int
    data_emprestimo: date
    data_prevista_devolucao: date
    data_devolucao: date | None
    status: StatusEmprestimo
    renovacoes: int


class ReservaCreate(BaseModel):
    livro_id: int


class ReservaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    usuario_id: int
    livro_id: int
    data_reserva: datetime
    status: StatusReserva


class MultaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    emprestimo_id: int
    valor: float
    status: StatusMulta
    data_criacao: datetime
