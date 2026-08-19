from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db
from .models import Usuario, Perfil
from .security import get_subject

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    subject = get_subject(token)
    user = db.get(Usuario, int(subject))
    if not user or not user.ativo:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário inválido")
    return user


def require_roles(*roles: Perfil):
    def dependency(user: Usuario = Depends(current_user)):
        if user.perfil not in roles:
            raise HTTPException(status_code=403, detail="Sem permissão para esta operação")
        return user
    return dependency
