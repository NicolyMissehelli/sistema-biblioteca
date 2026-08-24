# Terraform - Sistema de Biblioteca

O Terraform provisiona a infraestrutura Docker da aplicação. Os builds das imagens são executados pelo Docker CLI via `terraform_data`, evitando o legacy build do recurso `docker_image` que apresentou problemas no ambiente WSL.

## Fluxo da demonstração

```text
terraform init
terraform validate
terraform plan
terraform apply
```

O `apply` executa automaticamente os builds do backend e frontend e cria:

- rede `biblioteca-network`;
- volume `biblioteca-data`;
- container `biblioteca-backend` na porta 8000;
- container `biblioteca-frontend` na porta 8080.

Para reprodução:

```text
terraform destroy
terraform apply
```

Não é necessário criar containers manualmente.
