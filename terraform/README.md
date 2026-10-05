# Terraform - Sistema de Biblioteca

O Terraform provisiona a infraestrutura Docker da aplicação.

Os builds das imagens são executados automaticamente pelo Docker CLI/BuildKit através do Terraform (`terraform_data`). Isso evita depender do build legado do provider Docker, que apresentou problemas no ambiente WSL.

## Pré-requisitos no PC novo

Instale/configure:

1. Docker Desktop com o WSL 2 habilitado e Docker funcionando no Ubuntu/WSL.
2. Terraform (>= 1.5).
3. Git, se o projeto for obtido de um repositório.

Teste:

```bash
docker --version
docker info
terraform --version
```

## Subir o projeto em um PC novo

Entre nesta pasta:

```bash
cd entrega-sistema/terraform
```

Inicialize o Terraform:

```bash
terraform init
```

Valide:

```bash
terraform validate
```

Veja o plano:

```bash
terraform plan
```

Aplique:

```bash
terraform apply
```

Quando perguntar `Do you want to perform these actions?`, responda:

```text
yes
```

O `apply` faz automaticamente:

```text
Terraform
  -> cria a rede biblioteca-network
  -> cria o volume biblioteca-data
  -> executa docker build do backend
  -> executa docker build do frontend
  -> cria o container biblioteca-backend
  -> cria o container biblioteca-frontend
  -> aguarda os healthchecks
```

Não é necessário executar `docker build` manualmente.

## Importante: não distribua o estado local

Os arquivos abaixo são específicos da máquina e não devem ser copiados para um PC novo:

```text
terraform/.terraform/
terraform/terraform.tfstate
terraform/terraform.tfstate.backup
```

Por isso eles não fazem parte deste pacote.

Em um PC novo, `terraform init` cria o ambiente local novamente e `terraform apply` cria as imagens e os containers naquele computador.

## Acessar

Frontend:

```text
http://localhost:8080
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

## Reconstruir do zero

Para remover a infraestrutura criada pelo Terraform:

```bash
terraform destroy
```

e confirme com:

```text
yes
```

Depois:

```bash
terraform apply
```

O Terraform construirá novamente as imagens.

## Observação sobre o `main.tf`

O `main.tf` usa hashes dos arquivos do backend/frontend em `triggers_replace`. Assim, quando o código-fonte ou Dockerfile mudar, o Terraform pode reconstruir a imagem correspondente.

O estado (`terraform.tfstate`) deve permanecer local à máquina ou ser armazenado em um backend remoto apropriado. Não copie um `tfstate` de outra máquina para tentar reproduzir o ambiente Docker.
