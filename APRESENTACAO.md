# Entrega Docker e GHCR

## Roteiro (5 a 8 minutos)

1. Trello: responsáveis, critérios e evidências dos cards. https://trello.com/b/tseoOgOv/biblioteca-novaris-tech
2. Repositório: histórico de commits, Dockerfiles e testes. https://github.com/NicolyMissehelli/sistema-biblioteca
3. Pipeline aprovado: https://github.com/NicolyMissehelli/sistema-biblioteca/actions/runs/37359820924
4. Falha nos testes com publicação bloqueada: https://github.com/NicolyMissehelli/sistema-biblioteca/actions/runs/37331264938
5. Pacotes: https://github.com/NicolyMissehelli?tab=packages — backend e frontend, versões 1.0.0 e 1.0.1.
6. Containers publicados: abrir http://localhost:18080 e http://localhost:18080/api/health.

## Reprodução das imagens publicadas

Na raiz do repositório, com Docker ativo:

```bash
docker --context desktop-linux compose -p biblioteca-evidencias -f docker-compose.ghcr.yml pull
docker --context desktop-linux compose -p biblioteca-evidencias -f docker-compose.ghcr.yml up -d
docker --context desktop-linux compose -p biblioteca-evidencias -f docker-compose.ghcr.yml ps
curl -f http://localhost:18080/api/health
```

Em máquinas com Docker Engine sem Desktop, omitir `--context desktop-linux`.
O Compose usa imagens do GHCR, portas separadas e volume próprio; não substitui o banco da aplicação local.
O administrador é configurado pelo `.env` local, que não deve ser mostrado nem enviado ao Git.

Para consultar a versão anterior sem apagar dados:

```bash
docker pull ghcr.io/nicolymissehelli/biblioteca-backend:1.0.0
docker pull ghcr.io/nicolymissehelli/biblioteca-frontend:1.0.0
```

## Publicação daqui em diante

Um único workflow executa testes e build em pushes/PRs. Publicação só acontece em tags `v*`.
Exemplo: uma nova tag `v1.0.2` publica as imagens com tag `1.0.2`.
Não mover nem recriar tags de versões já publicadas. As versões anteriores não são republicadas em pushes de documentação.

## Perguntas para a apresentação

## Divisão de fala sugerida

| Integrante | Demonstração e fala |
| --- | --- |
| Nicoly | Abrir Trello e explicar tarefas/responsáveis. Apresentar objetivo e fechar com entregas. |
| Tacyo | Mostrar testes e Dockerfiles. Explicar imagem versus container e build local. |
| Kerolyn | Mostrar workflow, `needs`, permissões e falha bloqueando publicação. |
| Vinicius | Mostrar GHCR e as versões; explicar GitHub versus registro e tags. |
| Pedro Paulo | Mostrar Compose GHCR, pull, containers ativos e navegador. |
| Gabriel | Validar health e login; explicar implantação, persistência e rollback. |

Cada integrante deve saber responder às sete perguntas abaixo, mesmo quando outra pessoa apresenta a seção.

1. **GitHub e GHCR:** GitHub guarda código, commits e workflows; GHCR guarda os pacotes Docker produzidos.
2. **Imagem como artefato:** é o resultado do build, contendo aplicação e dependências. Imagem é o pacote; container é uma execução dele.
3. **Falha nos testes:** o job falha e `needs` impede build/publicação. A aplicação já implantada não é derrubada por isso.
4. **1.0.0 e latest:** são tags. 1.0.0 comunica uma versão; latest é um alias convencional, não uma seleção automática da maior versão. Tags podem ser sobrescritas; o digest SHA-256 identifica o conteúdo.
5. **Versões anteriores:** permitem rollback, comparação e reprodução de problemas. É preciso preservar o conteúdo anterior.
6. **GHCR na implantação:** o servidor baixa um pacote pronto com docker pull; ainda configura variáveis, rede, portas e volumes.
7. **Produção:** deve receber a imagem validada. Testar o código antes do build e verificar a execução do container são etapas complementares.

## Precisões importantes

- Git tag e Docker tag são objetos diferentes, associados pelo workflow.
- Duas imagens compõem o sistema: API Python e frontend Nginx.
- Uma resposta HTTP 200 em /health comprova disponibilidade, não todas as regras de negócio.
- A publicação inicial foi realizada pelo Vinicius; workflow, alteração do login e publicação posterior têm commits da Kerolyn. Responsável planejado e autor efetivo podem ser diferentes.
- Os checks antigos do SPRINT são registros históricos; o relatório de validação desta preparação registra a situação atual.
