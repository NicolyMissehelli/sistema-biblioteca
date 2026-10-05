# Validação para apresentação — 05/10/2026

## Resultados executados nesta máquina

- `npm ci --prefix frontend-biblioteca --no-audit --no-fund`: instalação concluída.
- `npm test --prefix frontend-biblioteca`: 2 testes passaram.
- Pytest executado dentro da imagem backend, com arquivos de teste montados somente para leitura: 5 testes passaram em 4,36 segundos; banco de teste isolado no container descartável.
- `docker --context desktop-linux compose -f backendcombanco/docker-compose.yml build`: backend e frontend construídos localmente.
- Compose `docker-compose.ghcr.yml`: pull e execução das duas imagens `1.0.1` concluídos.
- Pull das imagens `1.0.0` concluído; backend digest `sha256:effdde267d009e80e4849e08f1b5f40f2d75a38e0084ad86937f26c33a3c213a`, frontend digest `sha256:470944e7a1aef8c568b8b56965fa86dc6fc51ac3234f7055d7d39eff50cc7bc3`.
- GET `http://localhost:18080/`: HTML da aplicação recebido.
- GET `http://localhost:18080/api/health`: status ok, comprovando encaminhamento do Nginx ao backend.
- Login e GET /auth/me: admin@biblioteca.com, perfil ADMIN, ativo true. Token e senha omitidos das evidências.

## Correções desta preparação

- Workflow duplicado removido; publicação somente em tags `v*`, convertendo `v1.0.2` em tag Docker `1.0.2`.
- Push em branch executa testes e build, sem republicar as versões antigas.
- Nome da execução acompanha a referência Git real.
- Frontend exclui node_modules, testes e arquivos de ambiente do contexto Docker.
- Compose de demonstração utiliza imagens publicadas e banco separado, nas portas 18000/18080.

## Limites e evidências históricas

- Pipelines aprovados e falha bloqueando publicação estão linkados em APRESENTACAO.md.
- Tags anteriores existem no GHCR; o workflow antigo podia sobrescrevê-las, portanto não se deve afirmar imutabilidade histórica sem comparar digests.
- A execução atual confirma o funcionamento da versão publicada, mas não prova quem realizou uma demonstração anterior. Atribuições do Trello representam planejamento; commits registram autoria efetiva.
- O estado atual do Trello não foi modificado nesta preparação. Anexar este relatório aos cards ou colar o link do commit como evidência.
- Alteração local preexistente em backendcombanco/.env.example foi preservada e não incluída no commit.
