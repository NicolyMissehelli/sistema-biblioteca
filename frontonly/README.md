# Frontend — Sistema de Biblioteca

Frontend estático (HTML/CSS/JavaScript), separado do backend Node.js.

## Estrutura

- `index.html` — interface
- `style.css` — estilos
- `script.js` — lógica e chamadas à API
- `config.js` — endereço do backend
- `assets/` — imagens
- `Dockerfile` — imagem Nginx para servir o frontend
- `docker-compose.yml` — execução local do container

## GitHub

Este diretório pode ser colocado em um repositório separado, por exemplo:

`biblioteca-frontend`

Não há `package.json` porque este frontend não precisa de Node.js para ser servido. O container usa Nginx.

## Backend em outro PC

Edite `config.js` e informe o endereço acessível do backend:

```js
window.APP_CONFIG = {
  API_URL: "http://IP_DO_BACKEND:3000/api"
};
```

Exemplo:

```js
window.APP_CONFIG = {
  API_URL: "http://192.168.1.50:3000/api"
};
```

O backend precisa aceitar requisições CORS e a porta 3000 precisa estar acessível a partir do PC que roda o frontend.

## Docker

```powershell
docker build -t biblioteca-frontend .
docker run -d --name biblioteca-frontend -p 8080:80 biblioteca-frontend
```

Acesse:

`http://localhost:8080`

## Arquitetura planejada

PC 1:

`Docker -> Nginx -> Frontend`

PC 2:

`Docker -> Node.js -> Backend/API`

Terraform pode ser usado para provisionar a infraestrutura e recursos necessários, enquanto Ansible pode configurar os PCs/servidores e fazer o deploy. O frontend não precisa compartilhar o mesmo computador do backend.
