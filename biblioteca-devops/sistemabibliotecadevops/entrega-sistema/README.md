# Sistema de Biblioteca — DevOps

Projeto com aplicação em dois containers, automação com Ansible e infraestrutura Docker gerenciada por Terraform.

## Arquitetura

```text
Git/GitHub
    |
    +--> Ansible ----> prepara/verifica Ubuntu + Docker
    |
    +--> Terraform --> cria rede + volume + imagens + containers
                            |
                       +----+----+
                       |         |
                  Frontend    Backend
                   :8080       :8000
                                  |
                             biblioteca.db
```

## Estrutura

- `frontend-biblioteca/` — interface web/Nginx;
- `backendcombanco/` — API FastAPI + SQLite;
- `ansible/` — preparação do ambiente;
- `terraform/` — provisionamento Docker;
- `deploy.sh` — execução automatizada do fluxo completo;
- `destroy.sh` — destruição dos recursos Terraform.

## Demonstração

Na pasta `terraform/`:

```bash
terraform init
terraform plan
terraform apply
```

Teste no navegador:

- http://localhost:8080
- http://localhost:8000/docs

Para o teste de reprodução:

```bash
terraform destroy
terraform apply
```
