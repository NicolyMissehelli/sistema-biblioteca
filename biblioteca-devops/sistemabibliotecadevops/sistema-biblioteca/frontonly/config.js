// O Nginx do frontend encaminha /api para o backend.
// Isso permite que outros PCs da rede usem o IP do servidor sem alterar este arquivo.
window.APP_CONFIG = {
  API_URL: "/api"
};
