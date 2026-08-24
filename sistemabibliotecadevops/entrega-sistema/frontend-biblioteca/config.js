// A API usa o mesmo endereco do frontend e o Nginx encaminha /api/ para o backend.
// Isso permite acessar o sistema de outro computador da rede sem alterar o IP no JavaScript.
window.APP_CONFIG = {
  API_URL: "/api"
};
