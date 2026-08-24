# Ansible — preparação do servidor Ubuntu

Este playbook prepara o Ubuntu antes do Terraform provisionar os containers Docker.

## 1. Testar o inventário

```bash
ansible-inventory -i inventory.ini --graph
ansible servidor -i inventory.ini -m ping
```

## 2. Executar o playbook

Como a instalação do Docker exige privilégios administrativos:

```bash
ansible-playbook -i inventory.ini playbook.yml --ask-become-pass
```

O playbook é idempotente: se o Docker já estiver disponível (por exemplo, via Docker Desktop/WSL), ele não tenta reinstalar o Docker desnecessariamente.

## 3. Depois do Ansible

Se o Docker foi instalado no Ubuntu, abra uma nova sessão para aplicar a associação ao grupo `docker` ou use:

```bash
newgrp docker
```

Depois entre em `../terraform` e execute:

```bash
terraform init
terraform validate
terraform plan
terraform apply
```
