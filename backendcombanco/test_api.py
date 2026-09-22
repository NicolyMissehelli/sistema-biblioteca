# ============================================================
# TESTES DA API DO SISTEMA DA BIBLIOTECA
# ============================================================

# Importa o módulo os para configurar variáveis de ambiente
# e verificar/excluir o banco de dados utilizado nos testes.
import os


# ============================================================
# CONFIGURAÇÃO DO BANCO DE DADOS DE TESTE
# ============================================================

# Nome do banco que será utilizado SOMENTE pelos testes.
# Não usamos o biblioteca.db original para não alterar
# os dados reais da aplicação.
TEST_DB = "test_biblioteca.db"


# Se já existir um banco de teste de uma execução anterior,
# ele será apagado antes dos testes.
#
# Isso é importante porque nossos testes criam:
# - categoria
# - livro
# - exemplar
# - usuário
#
# Se o banco antigo permanecesse, poderíamos receber erros
# como 409 Conflict dizendo que "Tecnologia" já existe.
if os.path.exists(TEST_DB):
    os.remove(TEST_DB)


# Diz para a aplicação utilizar o banco de teste.
os.environ["DATABASE_URL"] = f"sqlite:///./{TEST_DB}"


# ============================================================
# CONFIGURAÇÕES ESPECÍFICAS PARA OS TESTES
# ============================================================

# Chave secreta utilizada para gerar os tokens JWT durante
# os testes.
os.environ["JWT_SECRET"] = "test-secret"


# Solicita que a aplicação crie automaticamente o usuário
# administrador inicial.
os.environ["CREATE_INITIAL_ADMIN"] = "true"


# E-mail do administrador utilizado pelo teste de login.
os.environ["INITIAL_ADMIN_EMAIL"] = "admin@test.local"


# Senha do administrador utilizada pelo teste de login.
os.environ["INITIAL_ADMIN_PASSWORD"] = "senha123"


# Origem permitida para o CORS durante os testes.
os.environ["CORS_ORIGINS"] = "http://localhost:3000"


# ============================================================
# IMPORTAÇÃO DA APLICAÇÃO
# ============================================================

# O TestClient permite executar requisições HTTP contra a
# aplicação FastAPI sem precisar iniciar o servidor Uvicorn.
from fastapi.testclient import TestClient

# Importa a aplicação FastAPI que será testada.
from app.main import app


# ============================================================
# TESTE 1 — HEALTH CHECK
# ============================================================

def test_health():
    """
    Verifica se a API está funcionando corretamente.

    O endpoint /health deve:
    - responder HTTP 200;
    - retornar um JSON contendo status = "ok".
    """

    # Cria um cliente de teste para a aplicação.
    with TestClient(app) as client:

        # Faz uma requisição GET para /health.
        response = client.get("/health")

        # Verifica se a API respondeu HTTP 200.
        assert response.status_code == 200

        # Verifica se o campo "status" possui o valor "ok".
        assert response.json()["status"] == "ok"


# ============================================================
# TESTE 2 — FLUXO BÁSICO DA BIBLIOTECA
# ============================================================

def test_login_and_basic_library_flow():
    """
    Testa um fluxo completo da API:

    1. Login do administrador
    2. Criação de categoria
    3. Criação de livro
    4. Criação de exemplar
    5. Criação de usuário leitor
    6. Login do leitor
    7. Criação de empréstimo
    8. Renovação do empréstimo
    9. Devolução do empréstimo
    """

    # Cria o cliente de teste.
    with TestClient(app) as client:

        # ====================================================
        # 1. LOGIN DO ADMINISTRADOR
        # ====================================================

        # Envia as credenciais do administrador.
        login = client.post(
            "/auth/login",
            data={
                "username": "admin@test.local",
                "password": "senha123"
            }
        )

        # O login deve retornar HTTP 200.
        assert login.status_code == 200

        # Extrai o token JWT retornado pela API.
        token = login.json()["access_token"]

        # Cria o cabeçalho Authorization.
        #
        # Esse cabeçalho será utilizado nas operações
        # que exigem autenticação.
        headers = {
            "Authorization": f"Bearer {token}"
        }


        # ====================================================
        # 2. CRIAÇÃO DA CATEGORIA
        # ====================================================

        # Cria uma categoria chamada "Tecnologia".
        category = client.post(
            "/categorias",
            json={
                "nome": "Tecnologia"
            },
            headers=headers
        )

        # A criação deve retornar HTTP 201.
        assert category.status_code == 201

        # Guarda o ID da categoria criada.
        category_id = category.json()["id"]


        # ====================================================
        # 3. CRIAÇÃO DO LIVRO
        # ====================================================

        # Cria um livro associado à categoria criada.
        book = client.post(
            "/livros",
            json={
                "titulo": "Livro Teste",
                "autor": "Autor",
                "isbn": "TEST-001",
                "editora": "Editora",
                "ano_publicacao": 2026,
                "categoria_id": category_id
            },
            headers=headers
        )

        # A criação do livro deve retornar HTTP 201.
        assert book.status_code == 201

        # Guarda o ID do livro.
        book_id = book.json()["id"]


        # ====================================================
        # 4. CRIAÇÃO DO EXEMPLAR
        # ====================================================

        # Cria um exemplar físico do livro.
        exemplar = client.post(
            f"/livros/{book_id}/exemplares",
            json={
                "tombo": "T-001"
            },
            headers=headers
        )

        # A criação deve retornar HTTP 201.
        assert exemplar.status_code == 201

        # Guarda o ID do exemplar.
        exemplar_id = exemplar.json()["id"]


        # ====================================================
        # 5. CRIAÇÃO DO USUÁRIO LEITOR
        # ====================================================

        # Cria um usuário com perfil LEITOR.
        reader = client.post(
            "/usuarios",
            json={
                "nome": "Leitor",
                "email": "leitor@example.com",
                "senha": "senha123",
                "perfil": "LEITOR"
            },
            headers=headers
        )

        # ----------------------------------------------------
        # DEBUG TEMPORÁRIO
        # ----------------------------------------------------
        #
        
        # A criação do usuário deve retornar HTTP 201.
        assert reader.status_code == 201


        # ====================================================
        # 6. LOGIN DO LEITOR
        # ====================================================

        # Faz login utilizando o usuário recém-criado.
        reader_login = client.post(
            "/auth/login",
            data={
                "username": "leitor@example.com",
                "password": "senha123"
            }
        )

        # O login deve retornar HTTP 200.
        assert reader_login.status_code == 200

        # Cria o cabeçalho Authorization usando o token
        # do usuário leitor.
        reader_headers = {
            "Authorization": f"Bearer {reader_login.json()['access_token']}"
        }


        # ====================================================
        # 7. CRIAÇÃO DO EMPRÉSTIMO
        # ====================================================

        # O leitor realiza um empréstimo do exemplar.
        loan = client.post(
            "/emprestimos",
            json={
                "exemplar_id": exemplar_id
            },
            headers=reader_headers
        )

        # A criação do empréstimo deve retornar HTTP 201.
        assert loan.status_code == 201

        # Verifica se o empréstimo foi criado com status ATIVO.
        assert loan.json()["status"] == "ATIVO"


        # ====================================================
        # 8. RENOVAÇÃO DO EMPRÉSTIMO
        # ====================================================

        # Renova o empréstimo criado anteriormente.
        renew = client.post(
            f"/emprestimos/{loan.json()['id']}/renovar",
            headers=reader_headers
        )

        # A renovação deve retornar HTTP 200.
        assert renew.status_code == 200


        # ====================================================
        # 9. DEVOLUÇÃO DO EXEMPLAR
        # ====================================================

        # Realiza a devolução do empréstimo.
        returned = client.post(
            f"/emprestimos/{loan.json()['id']}/devolver",
            headers=reader_headers
        )

        # A devolução deve retornar HTTP 200.
        assert returned.status_code == 200

        # Depois da devolução, o status deve ser DEVOLVIDO.
        assert returned.json()["status"] == "DEVOLVIDO"


# ============================================================
# TESTE 3 — RESTRIÇÕES DE ACESSO (ALUNO / LEITOR)
# ============================================================

def test_leitor_permissions():
    """
    Testa se o sistema bloqueia o acesso indevido para usuários do tipo LEITOR.
    Atendendo as seguintes tarefas:
    - Separar permissões de aluno e administrador
    - Restringir cadastro de livros para alunos
    - Definir acesso dos alunos ao sistema
    - Impedir empréstimos envolvendo alunos
    """
    with TestClient(app) as client:
        # 1. Login como Administrador para criar os dados base
        login_admin = client.post("/auth/login", data={"username": "admin@test.local", "password": "senha123"})
        admin_headers = {"Authorization": f"Bearer {login_admin.json()['access_token']}"}

        # Cria a categoria para o livro
        cat_resp = client.post("/categorias", json={"nome": "Ficção"}, headers=admin_headers)
        cat_id = cat_resp.json()["id"]

        # Cria um livro (que o admin pode)
        livro_resp = client.post("/livros", json={"titulo": "1984", "autor": "George Orwell", "categoria_id": cat_id}, headers=admin_headers)
        livro_id = livro_resp.json()["id"]

        # Cria o exemplar
        ex_resp = client.post(f"/livros/{livro_id}/exemplares", json={"tombo": "T-1984"}, headers=admin_headers)
        ex_id = ex_resp.json()["id"]

        # Cria o Usuário Leitor e Outro Usuário Leitor
        client.post("/usuarios", json={"nome": "Leitor 1", "email": "l1@example.com", "senha": "123", "perfil": "LEITOR"}, headers=admin_headers)
        resp_l2 = client.post("/usuarios", json={"nome": "Leitor 2", "email": "l2@example.com", "senha": "123", "perfil": "LEITOR"}, headers=admin_headers)
        id_l2 = resp_l2.json()["id"]

        # 2. Login como Leitor 1
        login_leitor = client.post("/auth/login", data={"username": "l1@example.com", "password": "123"})
        leitor_headers = {"Authorization": f"Bearer {login_leitor.json()['access_token']}"}

        # 3. Testa Restrição de Cadastro de Livros
        # Leitor não pode criar livros
        forbid_book = client.post("/livros", json={"titulo": "Livro Proibido", "autor": "Autor", "categoria_id": cat_id}, headers=leitor_headers)
        assert forbid_book.status_code == 403

        # Leitor não pode criar categorias
        forbid_cat = client.post("/categorias", json={"nome": "Nova Cat"}, headers=leitor_headers)
        assert forbid_cat.status_code == 403

        # 4. Testa Restrição de Empréstimos Envolvendo (Outros) Alunos
        # Leitor 1 tenta criar um empréstimo informando o ID do Leitor 2
        forbid_emp = client.post("/emprestimos", json={"exemplar_id": ex_id, "usuario_id": id_l2}, headers=leitor_headers)
        assert forbid_emp.status_code == 403

        # 5. Acesso liberado apenas para leitura
        # Leitor consegue ver os livros cadastrados
        allow_get_livros = client.get("/livros", headers=leitor_headers)
        assert allow_get_livros.status_code == 200
        assert len(allow_get_livros.json()) > 0