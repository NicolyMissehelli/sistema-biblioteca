locals {
  backend_dir  = abspath("${path.module}/../backendcombanco")
  frontend_dir = abspath("${path.module}/../frontend-biblioteca")

  backend_source_files  = sort(fileset(local.backend_dir, "**"))
  frontend_source_files = sort(fileset(local.frontend_dir, "**"))

  backend_source_hash = sha256(join("", [
    for file in local.backend_source_files : "${file}:${filesha256("${local.backend_dir}/${file}")}"
  ]))

  frontend_source_hash = sha256(join("", [
    for file in local.frontend_source_files : "${file}:${filesha256("${local.frontend_dir}/${file}")}"
  ]))
}

resource "docker_network" "biblioteca" {
  name = "biblioteca-network"
}

resource "docker_volume" "biblioteca_data" {
  name = "biblioteca-data"
}

# O build é executado pelo Docker CLI/BuildKit através do Terraform.
# Isso evita o legacy build do provider docker_image, que apresentou
# corrupção do stream gzip durante o build em WSL (/mnt/c).
resource "terraform_data" "backend_image" {
  input           = var.backend_image
  triggers_replace = [local.backend_source_hash]

  provisioner "local-exec" {
    command = "docker build -t '${var.backend_image}' -f '${local.backend_dir}/docker/Dockerfile' '${local.backend_dir}'"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "docker image rm -f '${self.input}' || true"
  }
}

resource "terraform_data" "frontend_image" {
  input           = var.frontend_image
  triggers_replace = [local.frontend_source_hash]

  provisioner "local-exec" {
    command = "docker build -t '${var.frontend_image}' -f '${local.frontend_dir}/Dockerfile' '${local.frontend_dir}'"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "docker image rm -f '${self.input}' || true"
  }
}

resource "docker_container" "backend" {
  name  = "biblioteca-backend"
  image = var.backend_image

  restart = "unless-stopped"

  ports {
    internal = 8000
    external = var.backend_port
  }

  env = [
    "APP_NAME=Sistema de Biblioteca API",
    "DATABASE_URL=sqlite:////data/biblioteca.db",
    "JWT_SECRET=troque-esta-chave-em-producao",
    "ACCESS_TOKEN_EXPIRE_MINUTES=60",
    "CORS_ORIGINS=*",
    "CREATE_INITIAL_ADMIN=true",
    "INITIAL_ADMIN_EMAIL=${var.initial_admin_email}",
    "INITIAL_ADMIN_PASSWORD=${var.initial_admin_password}",
    "FINE_PER_DAY=1.00"
  ]

  volumes {
    volume_name    = docker_volume.biblioteca_data.name
    container_path = "/data"
  }

  networks_advanced {
    name = docker_network.biblioteca.name
  }

  healthcheck {
    test         = ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)\""]
    interval     = "10s"
    timeout      = "3s"
    retries      = 10
    start_period = "10s"
  }

  wait         = true
  wait_timeout = 120

  depends_on = [
    docker_network.biblioteca,
    docker_volume.biblioteca_data,
    terraform_data.backend_image
  ]
}

resource "docker_container" "frontend" {
  name  = "biblioteca-frontend"
  image = var.frontend_image

  restart = "unless-stopped"

  ports {
    internal = 80
    external = var.frontend_port
  }

  networks_advanced {
    name = docker_network.biblioteca.name
  }

  healthcheck {
    test         = ["CMD-SHELL", "wget -q -O - http://127.0.0.1/ >/dev/null 2>&1"]
    interval     = "10s"
    timeout      = "3s"
    retries      = 10
    start_period = "5s"
  }

  wait         = true
  wait_timeout = 120

  depends_on = [
    docker_container.backend,
    terraform_data.frontend_image
  ]
}
