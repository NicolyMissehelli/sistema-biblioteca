from datetime import datetime, date
from enum import Enum
from sqlalchemy import Boolean, Date, DateTime, Enum as SAEnum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Perfil(str, Enum):
    ADMIN = "ADMIN"
    BIBLIOTECARIO = "BIBLIOTECARIO"
    LEITOR = "LEITOR"


class StatusExemplar(str, Enum):
    DISPONIVEL = "DISPONIVEL"
    EMPRESTADO = "EMPRESTADO"
    MANUTENCAO = "MANUTENCAO"


class StatusEmprestimo(str, Enum):
    ATIVO = "ATIVO"
    DEVOLVIDO = "DEVOLVIDO"


class StatusReserva(str, Enum):
    ATIVA = "ATIVA"
    ATENDIDA = "ATENDIDA"
    CANCELADA = "CANCELADA"


class StatusMulta(str, Enum):
    PENDENTE = "PENDENTE"
    PAGA = "PAGA"


class Usuario(Base):
    __tablename__ = "USUARIO"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    perfil: Mapped[Perfil] = mapped_column(SAEnum(Perfil), nullable=False, default=Perfil.LEITOR)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    emprestimos = relationship("Emprestimo", back_populates="usuario")
    reservas = relationship("Reserva", back_populates="usuario")


class Categoria(Base):
    __tablename__ = "CATEGORIA"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    livros = relationship("Livro", back_populates="categoria")


class Livro(Base):
    __tablename__ = "LIVRO"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    autor: Mapped[str] = mapped_column(String(180), nullable=False)
    isbn: Mapped[str | None] = mapped_column(String(30), unique=True, nullable=True)
    editora: Mapped[str | None] = mapped_column(String(150), nullable=True)
    ano_publicacao: Mapped[int | None] = mapped_column(Integer, nullable=True)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("CATEGORIA.id"), nullable=False)

    categoria = relationship("Categoria", back_populates="livros")
    exemplares = relationship("Exemplar", back_populates="livro", cascade="all, delete-orphan")
    reservas = relationship("Reserva", back_populates="livro")


class Exemplar(Base):
    __tablename__ = "EXEMPLAR"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    livro_id: Mapped[int] = mapped_column(ForeignKey("LIVRO.id"), nullable=False, index=True)
    tombo: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    status: Mapped[StatusExemplar] = mapped_column(
        SAEnum(StatusExemplar), default=StatusExemplar.DISPONIVEL, nullable=False
    )

    livro = relationship("Livro", back_populates="exemplares")
    emprestimos = relationship("Emprestimo", back_populates="exemplar")


class Emprestimo(Base):
    __tablename__ = "EMPRESTIMO"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("USUARIO.id"), nullable=False, index=True)
    exemplar_id: Mapped[int] = mapped_column(ForeignKey("EXEMPLAR.id"), nullable=False, index=True)
    data_emprestimo: Mapped[date] = mapped_column(Date, nullable=False)
    data_prevista_devolucao: Mapped[date] = mapped_column(Date, nullable=False)
    data_devolucao: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[StatusEmprestimo] = mapped_column(
        SAEnum(StatusEmprestimo), default=StatusEmprestimo.ATIVO, nullable=False
    )
    renovacoes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    usuario = relationship("Usuario", back_populates="emprestimos")
    exemplar = relationship("Exemplar", back_populates="emprestimos")
    multa = relationship("Multa", back_populates="emprestimo", uselist=False)


class Reserva(Base):
    __tablename__ = "RESERVA"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("USUARIO.id"), nullable=False, index=True)
    livro_id: Mapped[int] = mapped_column(ForeignKey("LIVRO.id"), nullable=False, index=True)
    data_reserva: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    status: Mapped[StatusReserva] = mapped_column(
        SAEnum(StatusReserva), default=StatusReserva.ATIVA, nullable=False
    )

    usuario = relationship("Usuario", back_populates="reservas")
    livro = relationship("Livro", back_populates="reservas")


class Multa(Base):
    __tablename__ = "MULTA"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    emprestimo_id: Mapped[int] = mapped_column(ForeignKey("EMPRESTIMO.id"), unique=True, nullable=False)
    valor: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[StatusMulta] = mapped_column(
        SAEnum(StatusMulta), default=StatusMulta.PENDENTE, nullable=False
    )
    data_criacao: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    emprestimo = relationship("Emprestimo", back_populates="multa")
