import os
os.environ["DATABASE_URL"] = "sqlite:///./test_biblioteca.db"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["CREATE_INITIAL_ADMIN"] = "true"
os.environ["INITIAL_ADMIN_EMAIL"] = "admin@test.local"
os.environ["INITIAL_ADMIN_PASSWORD"] = "senha123"
os.environ["CORS_ORIGINS"] = "http://localhost:3000"

from fastapi.testclient import TestClient
from app.main import app


def test_health():
    with TestClient(app) as client:
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


def test_login_and_basic_library_flow():
    with TestClient(app) as client:
        login = client.post("/auth/login", json={"email": "admin@test.local", "senha": "senha123"})
        assert login.status_code == 200
        token = login.json()["access_token"]
        h = {"Authorization": f"Bearer {token}"}

        cat = client.post("/categorias", json={"nome": "Tecnologia"}, headers=h)
        assert cat.status_code == 201
        cid = cat.json()["id"]

        book = client.post("/livros", json={
            "titulo": "Livro Teste", "autor": "Autor", "isbn": "TEST-001",
            "editora": "Editora", "ano_publicacao": 2026, "categoria_id": cid
        }, headers=h)
        assert book.status_code == 201
        bid = book.json()["id"]

        ex = client.post(f"/livros/{bid}/exemplares", json={"tombo": "T-001"}, headers=h)
        assert ex.status_code == 201

        reader = client.post("/usuarios", json={
            "nome": "Leitor", "email": "leitor@test.local", "senha": "senha123", "perfil": "LEITOR"
        }, headers=h)
        assert reader.status_code == 201

        rlogin = client.post("/auth/login", json={"email": "leitor@test.local", "senha": "senha123"})
        assert rlogin.status_code == 200
        rh = {"Authorization": f"Bearer {rlogin.json()['access_token']}"}

        emp = client.post("/emprestimos", json={"exemplar_id": ex.json()["id"]}, headers=rh)
        assert emp.status_code == 201
        assert emp.json()["status"] == "ATIVO"

        renew = client.post(f"/emprestimos/{emp.json()['id']}/renovar", headers=rh)
        assert renew.status_code == 200

        ret = client.post(f"/emprestimos/{emp.json()['id']}/devolver", headers=rh)
        assert ret.status_code == 200
        assert ret.json()["status"] == "DEVOLVIDO"
