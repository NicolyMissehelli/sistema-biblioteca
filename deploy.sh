#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANSIBLE_DIR="$ROOT_DIR/ansible"
TERRAFORM_DIR="$ROOT_DIR/terraform"

cd "$ANSIBLE_DIR"
echo '==> 1/6 Preparando o ambiente com Ansible'
ansible-playbook -i inventory.ini playbook.yml

cd "$TERRAFORM_DIR"
echo '==> 2/6 Inicializando Terraform'
terraform init

echo '==> 3/6 Validando Terraform'
terraform validate

echo '==> 4/6 Gerando plano'
terraform plan

echo '==> 5/6 Aplicando infraestrutura'
terraform apply -auto-approve

echo '==> 6/6 Verificando recursos'
docker ps --filter 'name=^/biblioteca-backend$' --filter 'name=^/biblioteca-frontend$'
terraform output
