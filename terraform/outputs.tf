output "frontend_url" {
  description = "URL para acessar o sistema de biblioteca."
  value       = "http://localhost:8080"
}

output "backend_url" {
  description = "URL da API FastAPI."
  value       = "http://localhost:8000"
}

output "backend_api_docs" {
  description = "Documentacao Swagger da API."
  value       = "http://localhost:8000/docs"
}

output "network_name" {
  description = "Rede Docker compartilhada pela aplicacao."
  value       = docker_network.biblioteca.name
}

output "volume_name" {
  description = "Volume Docker persistente usado pelo SQLite."
  value       = docker_volume.biblioteca_data.name
}

output "backend_container" {
  description = "Nome do container do backend."
  value       = docker_container.backend.name
}

output "frontend_container" {
  description = "Nome do container do frontend."
  value       = docker_container.frontend.name
}
