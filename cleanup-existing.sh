#!/usr/bin/env bash
set -euo pipefail

# Use este script somente na primeira migração dos containers criados manualmente.
# Ele remove apenas os recursos com os nomes que o Terraform passará a gerenciar.

for container in biblioteca-frontend biblioteca-backend; do
  if docker container inspect "$container" >/dev/null 2>&1; then
    echo "Removendo container existente: $container"
    docker rm -f "$container"
  fi
done

if docker network inspect biblioteca-network >/dev/null 2>&1; then
  echo 'Removendo rede existente: biblioteca-network'
  docker network rm biblioteca-network >/dev/null || true
fi

echo 'Limpeza concluída. O Terraform pode criar os recursos do zero.'
