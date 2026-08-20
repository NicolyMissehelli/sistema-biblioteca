# Sistema de Biblioteca — Backend/API

Backend REST para o Sistema de Biblioteca, conforme os requisitos do PDF.

## Stack
- Python 3.11+
- FastAPI
- SQLAlchemy
- SQLite por padrão (arquivo persistente no volume do Docker)
- PostgreSQL opcional via `DATABASE_URL`
- JWT para autenticação
- CORS configurado para permitir o frontend em outra máquina/IP

## Regras implementadas
- 3 perfis: ADMIN, BIBLIOTECARIO e LEITOR.
- Livro com título, autor, ISBN, editora, ano, categoria, quantidade e status.
- Controle de exemplares.
- Até 3 empréstimos ativos por leitor.
- Empréstimo por 14 dias.
- Usuário com empréstimo atrasado não pode fazer novo empréstimo.
- Empréstimo somente de exemplar disponível.
- Devolução.
- Renovação somente quando não houver reserva para o livro.
- Reserva de livro indisponível com fila.
- Multa de R$ 1,00 por dia de atraso, com status PENDENTE/PAGA.
- Histórico de empréstimos.
- Relatórios básicos.
- Autenticação JWT.
- API acessível por IP com `0.0.0.0`.
- CORS configurável para o endereço do frontend.

## Executar

### 1. Ambiente virtual
Windows PowerShell:
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Linux/macOS:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configuração
Copie `.env.example` para `.env`.

Para Docker, SQLite fica no arquivo persistente `data/biblioteca.db`:
`sqlite:////data/biblioteca.db`

O diretório `data/` é montado como volume no container, então o banco não é perdido quando o container é recriado. Para execução fora do Docker, você pode usar `sqlite:///./biblioteca.db`.

Para PostgreSQL:
```env
DATABASE_URL=postgresql+psycopg://usuario:senha@host:5432/biblioteca
```

### 3. Iniciar com Docker (recomendado)
```bash
docker compose up --build
```

O backend ficará em `http://localhost:8000`. O arquivo do banco ficará em `data/biblioteca.db` no projeto.

### 4. Iniciar API sem Docker
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

A API ficará em:
`http://IP_DA_MAQUINA_BACKEND:8000`

Documentação:
`http://IP_DA_MAQUINA_BACKEND:8000/docs`

### 5. Frontend em outra máquina
No frontend, use como base:
`http://IP_DA_MAQUINA_BACKEND:8000`

Exemplo:
```text
http://192.168.0.20:8000
```

Configure no `.env`:
```env
CORS_ORIGINS=http://192.168.0.30:3000
```

Para liberar mais de uma origem:
```env
CORS_ORIGINS=http://192.168.0.30:3000,http://localhost:3000
```

O DevOps poderá substituir essas variáveis por valores de produção.

## Banco de dados
O banco é criado automaticamente na primeira inicialização.

Também existe `database/schema.sql` com o esquema SQL principal.

## Usuário administrador inicial
Por segurança, o backend cria o administrador inicial somente quando:
`CREATE_INITIAL_ADMIN=true`

Exemplo no `.env`:
```env
CREATE_INITIAL_ADMIN=true
INITIAL_ADMIN_EMAIL=admin@biblioteca.local
INITIAL_ADMIN_PASSWORD=TroqueEstaSenha
```

Depois do primeiro uso, recomenda-se alterar:
`CREATE_INITIAL_ADMIN=false`

## API
Principais endpoints:
- `POST /auth/login`
- `POST /usuarios`
- `GET /usuarios`
- `POST /livros`
- `GET /livros`
- `POST /livros/{livro_id}/exemplares`
- `POST /emprestimos`
- `POST /emprestimos/{emprestimo_id}/devolver`
- `POST /emprestimos/{emprestimo_id}/renovar`
- `GET /emprestimos/me`
- `POST /reservas`
- `GET /reservas/me`
- `POST /multas/{multa_id}/pagar`
- `GET /relatorios/resumo`

## Observação para o DevOps
O projeto está preparado para containerização, mas o Docker/CI/CD, proxy reverso, TLS, domínio, secrets e banco PostgreSQL de produção devem ser definidos na etapa de DevOps.

## Testes

Depois de instalar as dependências:
```bash
pytest -q
```

Os testes cobrem health check e regras principais de empréstimos, devolução, atraso, limite de 3 empréstimos, reserva e renovação.
