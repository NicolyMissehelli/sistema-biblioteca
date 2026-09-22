# 📚 Sistema de Biblioteca

Sistema web para gerenciamento de uma biblioteca, desenvolvido com foco no gerenciamento de livros, categorias, exemplares, usuários e empréstimos.

O projeto também possui uma estrutura de DevOps, utilizando Docker, Docker Compose, testes automatizados e GitHub Actions para implementar um fluxo de CI/CD.

---
 
## 🎯 Objetivo do Projeto

O Sistema de Biblioteca tem como objetivo disponibilizar uma aplicação para gerenciamento das principais operações de uma biblioteca.

## 🎯 Objetivo da Sprint

Implementar testes automatizados para as funcionalidades essenciais do sistema da biblioteca e executar esses testes no pipeline de CI/CD, garantindo o funcionamento do backend e frontend.

Entre as funcionalidades do sistema estão:

- Cadastro e gerenciamento de livros;
- Cadastro de categorias;
- Cadastro de exemplares;
- Cadastro de usuários;
- Autenticação de usuários;
- Controle de empréstimos;
- Renovação de empréstimos;
- Devolução de exemplares;
- Consulta das informações da biblioteca.

Além da aplicação, o projeto utiliza práticas de DevOps para automatizar a instalação, execução, testes e construção dos containers.

---

## 👥 Integrantes e Papéis

1. Gabriel - Analista de infraestrutura
2. Keroly - DevOps
3. Nicoly - Product Owner / Scrum Master
4. Pedro Paulo - Desenvolvedor
5. Rhoney - Desenvolvedor
6. Tacyo Henrique - Desenvolvedor Backend / Responsável por Testes / DevOps

---

## 📊 Quadro Kanban

O acompanhamento das tarefas da Sprint (Sprint Backlog) é realizado no nosso quadro do Trello.
🔗 **Link do Quadro:** [Trello - Biblioteca Novaris Tech](https://trello.com/b/tseoOgOv)

---

## 🛠️ Tecnologias Utilizadas

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT
- Uvicorn
- Pytest

### Frontend

- HTML5
- CSS3
- JavaScript
- Nginx
- Vitest

### DevOps

- Git
- GitHub
- GitHub Actions
- Docker
- Docker Compose
- Terraform
- Ansible

---

## 📁 Estrutura do Projeto

```text
entrega-sistema/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── ansible/
│
├── backendcombanco/
│   ├── app/
│   ├── data/
│   ├── database/
│   ├── docker/
│   │   └── Dockerfile
│   ├── requirements.txt
│   ├── test_api.py
│   ├── test_health.py
│   └── docker-compose.yml
│
├── frontend-biblioteca/
│   ├── assets/
│   ├── nginx/
│   ├── tests/
│   │   └── frontend.test.js
│   ├── Dockerfile
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── package.json
│
├── terraform/
│
├── package.json
├── package-lock.json
├── README.md
├── deploy.sh
├── destroy.sh
└── .gitignore
## ⚙️ Pré-requisitos

Para executar o projeto localmente, é necessário possuir:

- Git;
- Node.js 20 ou superior;
- npm;
- Python 3.13 ou compatível;
- Docker;
- Docker Compose.

---

## 📥 Instalação

Após clonar o repositório, entre na pasta do projeto:

```bash
cd entrega-sistema
```

A instalação das dependências pode ser realizada através de um único comando:

```bash
npm install
```

O comando `npm install` executa o script `postinstall`, responsável por instalar as dependências do backend e do frontend.

As dependências do backend são instaladas a partir do arquivo:
`backendcombanco/requirements.txt`

As dependências do frontend são instaladas a partir do arquivo:
`frontend-biblioteca/package.json`

---

## ▶️ Executando o Sistema

Para iniciar o sistema utilizando Docker Compose:

```bash
npm start
```

Esse comando realiza o build das imagens e inicia os serviços do projeto.

### Frontend
O frontend pode ser acessado em:
http://localhost:8080

### Backend
A API pode ser acessada em:
http://localhost:8000

### Documentação da API
A documentação interativa da API pode ser acessada em:
http://localhost:8000/docs

---

## 🐳 Docker

O projeto utiliza containers Docker para executar seus componentes.

- **Dockerfile do Backend:** `backendcombanco/docker/Dockerfile`
- **Dockerfile do Frontend:** `frontend-biblioteca/Dockerfile`
- **Docker Compose:** `backendcombanco/docker-compose.yml`

O Docker Compose realiza a execução dos serviços de backend e frontend.

### Comandos Docker:

- **Construir as imagens:**
  ```bash
  npm run docker:build
  ```
- **Iniciar o sistema:**
  ```bash
  npm start
  ```
- **Iniciar em segundo plano:**
  ```bash
  npm run start:background
  ```
- **Visualizar os logs:**
  ```bash
  npm run logs
  ```
- **Parar os containers:**
  ```bash
  npm run stop
  ```

---

## 🧪 Testes Automatizados

O projeto possui testes automatizados para o frontend e para o backend.

Todos os testes podem ser executados através de um único comando:

```bash
npm test
```

O comando executa os testes do frontend e, em seguida, os testes do backend.

### Frontend

O frontend utiliza **Vitest** para os testes automatizados. Atualmente são executados 2 testes:

- Geração das iniciais do título do livro;
- Normalização dos dados de um livro.

Para executar somente os testes do frontend:
```bash
npm run test:frontend
```

### Backend

O backend utiliza **Pytest**.

#### Classificação dos Testes

| Arquivo de Teste | Funcionalidade | Classificação | Resultado esperado |
| --- | --- | --- | --- |
| `test_health.py` | Disponibilidade da API | Smoke Test | API responde com HTTP 200 |
| `test_health.py` | Versão do build/deploy | Sanidade / Smoke | Versão 1.0.0 ativa |
| `test_api.py` | Fluxo completo (Login, Livros, Empréstimo) | Regressão / E2E | Regras de negócio executadas sem erro |
| `test_api.py` | Restrições de permissões (RBAC) de Aluno | Sanidade / Regressão | Bloqueio 403 para operações indevidas |
| `frontend.test.js` | Utilitários (Iniciais e Normalização de livros) | Unitário | Funções retornam dados formatados corretamente |

Os testes verificam o funcionamento da API e um fluxo básico das operações da biblioteca, incluindo:
- Endpoint `/health`
- Autenticação
- Criação de categorias
- Criação de livros
- Criação de exemplares
- Criação de usuários
- Criação de empréstimos
- Renovação de empréstimos
- Devolução de exemplares

Para executar somente os testes do backend:
```bash
npm run test:backend
```

**Resultado dos testes:**
- Frontend: 2 testes passando
- Backend: 5 testes passando
- **Total:** 7 testes passando

---

## 🔄 CI/CD com GitHub Actions

O projeto utiliza GitHub Actions para automatizar a integração contínua e a construção das imagens Docker.

O workflow está localizado em:
`.github/workflows/ci-cd.yml`

**O pipeline segue o seguinte fluxo:**
`Código` → `GitHub Actions` → `Configuração do Python` → `Configuração do Node.js` → `Instalação das dependências` → `Execução dos testes` → `Docker Build`

O pipeline executa `npm install` e depois `npm test`. Somente após a conclusão bem-sucedida dos testes é executado o build das imagens Docker.

- ❌ **Falha nos testes:** Caso algum teste falhe, o pipeline é interrompido e a etapa de Docker Build não é executada.
- ✅ **Testes aprovados:** Caso todos os testes sejam aprovados, o pipeline prossegue para a construção das imagens. Essa estratégia garante que uma versão com testes quebrados não avance.

---

## 🌿 Fluxo de Branches

O projeto utiliza o seguinte fluxo de desenvolvimento:

`develop` → `Pull Request` → `main`

- As alterações devem ser desenvolvidas na branch `develop`.
- Após a implementação e validação, é realizada uma **Pull Request** para a branch `main`.
- A branch `main` representa a versão principal do projeto (nenhuma alteração deve ser feita diretamente nela).

---

## 🔐 Boas Práticas

O projeto utiliza um arquivo `.gitignore` para evitar o versionamento de arquivos que não devem ser enviados ao repositório, como `node_modules/`, arquivos `.env`, bancos de dados locais, caches do Python, etc. As dependências são declaradas nos arquivos de configuração correspondentes.

---

## 🚀 Comandos Principais

| Comando | Função |
| --- | --- |
| `npm install` | Instala as dependências do projeto |
| `npm test` | Executa todos os testes |
| `npm run test:frontend` | Executa os testes do frontend |
| `npm run test:backend` | Executa os testes do backend |
| `npm start` | Inicia o sistema com Docker |
| `npm run start:background` | Inicia os containers em segundo plano |
| `npm run docker:build` | Constrói as imagens Docker |
| `npm run logs` | Exibe os logs dos containers |
| `npm run stop` | Para os containers |

---

## 📌 Status do Projeto

Atualmente, o projeto possui:

- ✅ Backend FastAPI
- ✅ Frontend web
- ✅ Banco de dados SQLite
- ✅ Autenticação
- ✅ Testes automatizados (Frontend e Backend)
- ✅ Docker & Docker Compose
- ✅ GitHub Actions & Pipeline CI/CD
- ✅ Terraform & Ansible
- ✅ Fluxo de branches estruturado

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos.
