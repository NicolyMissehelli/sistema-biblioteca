variable "backend_image" {
  description = "Nome da imagem Docker do backend."
  type        = string
  default     = "biblioteca-backend:latest"
}

variable "frontend_image" {
  description = "Nome da imagem Docker do frontend."
  type        = string
  default     = "biblioteca-frontend:latest"
}

variable "backend_port" {
  description = "Porta publicada do backend."
  type        = number
  default     = 8000
}

variable "frontend_port" {
  description = "Porta publicada do frontend."
  type        = number
  default     = 8080
}

variable "initial_admin_email" {
  description = "E-mail do administrador inicial da demonstração."
  type        = string
  default     = "admin@biblioteca.com"
}

variable "initial_admin_password" {
  description = "Senha do administrador inicial da demonstração."
  type        = string
  sensitive   = true
  default     = "Devops"
}
