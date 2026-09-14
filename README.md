# 📚 Sistema de Biblioteca

Sistema web para gerenciamento de uma biblioteca, desenvolvido com foco no gerenciamento de livros, categorias, exemplares, usuários e empréstimos.

O projeto também possui uma estrutura de DevOps, utilizando Docker, Docker Compose, testes automatizados e GitHub Actions para implementar um fluxo de CI/CD.

---

## 🎯 Objetivo do Projeto

O Sistema de Biblioteca tem como objetivo disponibilizar uma aplicação para gerenciamento das principais operações de uma biblioteca.

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

## 👥 Integrantes

1. Gabriel
2. Keroly
3. Nicoly
4. Pedro Paulo
5. Rhoney

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
⚙️ Pré-requisitos

Para executar o projeto localmente, é necessário possuir:

Git;
Node.js 20 ou superior;
npm;
Python 3.13 ou compatível;
Docker;
Docker Compose.
📥 Instalação

Após clonar o repositório, entre na pasta do projeto:

cd entrega-sistema

A instalação das dependências pode ser realizada através de um único comando:

npm install

O comando npm install executa o script postinstall, responsável por instalar as dependências do backend e do frontend.

As dependências do backend são instaladas a partir do arquivo:

backendcombanco/requirements.txt

As dependências do frontend são instaladas a partir do arquivo:

frontend-biblioteca/package.json
▶️ Executando o Sistema

Para iniciar o sistema utilizando Docker Compose:

npm start

Esse comando realiza o build das imagens e inicia os serviços do projeto.

Frontend

O frontend pode ser acessado em:

http://localhost:8080
Backend

A API pode ser acessada em:

http://localhost:8000
Documentação da API

A documentação interativa da API pode ser acessada em:

http://localhost:8000/docs
🐳 Docker

O projeto utiliza containers Docker para executar seus componentes.

Dockerfile do Backend

O Dockerfile do backend está localizado em:

backendcombanco/docker/Dockerfile
Dockerfile do Frontend

O Dockerfile do frontend está localizado em:

frontend-biblioteca/Dockerfile
Docker Compose

O arquivo responsável pela execução dos serviços está localizado em:

backendcombanco/docker-compose.yml

O Docker Compose realiza a execução dos serviços de backend e frontend.

Construir as imagens

Para construir as imagens Docker:

npm run docker:build
Iniciar o sistema

Para iniciar os containers:

npm start
Iniciar em segundo plano

Para iniciar os containers em segundo plano:

npm run start:background
Visualizar os logs

Para acompanhar os logs dos containers:

npm run logs
Parar os containers

Para parar os containers:

npm run stop
🧪 Testes Automatizados

O projeto possui testes automatizados para o frontend e para o backend.

Todos os testes podem ser executados através de um único comando:

npm test

O comando executa os testes do frontend e, em seguida, os testes do backend.

Frontend

O frontend utiliza Vitest para os testes automatizados.

Atualmente são executados 2 testes:

Geração das iniciais do título do livro;
Normalização dos dados de um livro.

Para executar somente os testes do frontend:

npm run test:frontend
Backend

O backend utiliza Pytest.

Os testes verificam o funcionamento da API e um fluxo básico das operações da biblioteca, incluindo:

Endpoint /health;
Autenticação;
Criação de categorias;
Criação de livros;
Criação de exemplares;
Criação de usuários;
Criação de empréstimos;
Renovação de empréstimos;
Devolução de exemplares.

Para executar somente os testes do backend:

npm run test:backend
Resultado dos testes

Os testes atualmente apresentam o seguinte resultado:

Frontend: 2 testes passando
Backend: 3 testes passando

Total:

5 testes passando
🔄 CI/CD com GitHub Actions

O projeto utiliza GitHub Actions para automatizar a integração contínua e a construção das imagens Docker.

O workflow está localizado em:

.github/workflows/ci-cd.yml

O pipeline segue o seguinte fluxo:

Código
  ↓
GitHub Actions
  ↓
Configuração do Python
  ↓
Configuração do Node.js
  ↓
Instalação das dependências
  ↓
Execução dos testes
  ↓
Testes aprovados?
  ↓
   SIM
  ↓
Docker Build

O pipeline executa:

npm install

e depois:

npm test

Somente após a conclusão bem-sucedida dos testes é executado o build das imagens Docker.

❌ Falha nos testes

Caso algum teste falhe, o pipeline é interrompido e a etapa de Docker Build não é executada.

✅ Testes aprovados

Caso todos os testes sejam aprovados, o pipeline prossegue para a construção das imagens Docker.

Essa estratégia garante que uma versão com testes quebrados não avance para a etapa de construção dos containers.

🌿 Fluxo de Branches

O projeto utiliza o seguinte fluxo de desenvolvimento:

develop
   ↓
Pull Request
   ↓
main

As alterações devem ser desenvolvidas na branch develop.

Após a implementação e validação dos testes, é realizada uma Pull Request para a branch main.

A branch main representa a versão principal do projeto.

Não devem ser realizadas alterações diretamente na main.

🔐 Boas Práticas

O projeto utiliza um arquivo .gitignore para evitar o versionamento de arquivos que não devem ser enviados ao repositório.

Entre eles:

node_modules/;
arquivos .env;
bancos de dados locais;
caches do Python;
arquivos temporários;
banco de dados utilizado nos testes.

As dependências do projeto são declaradas nos arquivos de configuração correspondentes, permitindo que o ambiente seja reproduzido pelos integrantes da equipe.

🚀 Comandos Principais
Comando	Função
npm install	Instala as dependências do projeto
npm test	Executa todos os testes
npm run test:frontend	Executa os testes do frontend
npm run test:backend	Executa os testes do backend
npm start	Inicia o sistema com Docker
npm run start:background	Inicia os containers em segundo plano
npm run docker:build	Constrói as imagens Docker
npm run logs	Exibe os logs dos containers
npm run stop	Para os containers
📌 Status do Projeto

Atualmente, o projeto possui:

✅ Backend FastAPI;
✅ Frontend web;
✅ Banco de dados SQLite;
✅ Autenticação;
✅ Testes automatizados;
✅ Testes do frontend;
✅ Testes do backend;
✅ Docker;
✅ Docker Compose;
✅ GitHub Actions;
✅ Pipeline CI/CD;
✅ Terraform;
✅ Ansible;
✅ Fluxo de branches develop → Pull Request → main.
📄 Licença

Projeto desenvolvido para fins acadêmicos.


