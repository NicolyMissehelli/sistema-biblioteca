terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "biblioteca" {
  name = "biblioteca-network"
}

resource "docker_container" "backend" {
  name  = "biblioteca-backend"
  image = "biblioteca-backend:latest"

  ports {
    internal = 3000
    external = 3000
  }

  networks_advanced {
    name = docker_network.biblioteca.name
  }
}

resource "docker_container" "frontend" {
  name  = "biblioteca-frontend"
  image = "biblioteca-frontend:latest"

  ports {
    internal = 80
    external = 8080
  }

  networks_advanced {
    name = docker_network.biblioteca.name
  }

  depends_on = [
    docker_container.backend
  ]
}