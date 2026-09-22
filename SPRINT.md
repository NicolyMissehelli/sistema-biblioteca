# 🏃 Sprint 1 — Sistema da Biblioteca

**Período:** 16/09/2026 a 21/09/2026

---

## 👥 Equipe

| Papel | Integrante |
| --- | --- |
| Product Owner / Scrum Master | Nicoly Missehelli |
| Desenvolvedor Backend | Tacyo Henrique |
| Desenvolvedor | Pedro Paulo |
| Desenvolvedor | Rhoney Thiago |
| DevOps | Kerolyn |
| Analista de Requisitos | Gabriel Alves |

---

## 🎯 1. Objetivo da Sprint

Organizar e validar o trabalho já desenvolvido no Sistema da Biblioteca, considerando que o frontend e o backend já foram implementados, os testes já foram realizados e o projeto foi apresentado até a etapa de CI/CD.

Nesta Sprint, o foco é: levantar o que já foi feito, identificar pendências, classificar os testes automatizados, conferir o pipeline e organizar as evidências necessárias para as Atividades Integradoras 1 e 2.

---

## 🔍 2. Levantamento Inicial da Equipe

Durante o planejamento, verificamos:

- [x] Testes automatizados existentes no backend.
- [x] Testes automatizados existentes no frontend.
- [x] Quantidade de testes implementados em cada parte.
- [x] Finalidade e classificação de cada teste.
- [x] Execução dos testes por um único comando.
- [x] Funcionamento do GitHub Actions.
- [x] Execução do build Docker após os testes.
- [x] Simulação de falha no pipeline.
- [x] Atualização do README e das evidências.
- [ ] Commits identificados de todos os integrantes.

---

## 📋 3. Product Backlog

| ID | Item | Prioridade |
| --- | --- | --- |
| PB01 | Levantar testes do backend | Alta |
| PB02 | Levantar testes do frontend | Alta |
| PB03 | Classificar os testes automatizados | Alta |
| PB04 | Conferir execução por comando único | Alta |
| PB05 | Validar GitHub Actions | Alta |
| PB06 | Conferir build Docker | Alta |
| PB07 | Realizar simulação de falha | Alta |
| PB08 | Atualizar README | Média |
| PB09 | Atualizar Kanban | Alta |
| PB10 | Conferir commits dos integrantes | Alta |

---

## 📌 4. Sprint Backlog e Responsabilidades

| ID | Tarefa | Responsável |
| --- | --- | --- |
| SB01 | Levantar o que já foi realizado | Equipe |
| SB02 | Conferir testes do backend | DevOps |
| SB03 | Conferir testes do frontend | DevOps |
| SB04 | Classificar cada teste | Analista de Requisitos |
| SB05 | Conferir comando de execução | Desenvolvedores |
| SB06 | Validar GitHub Actions e Docker | DevOps |
| SB07 | Simular falha e corrigir pipeline | DevOps + equipe |
| SB08 | Atualizar o Kanban | Scrum Master |
| SB09 | Atualizar README e evidências | Product Owner + Analista |
| SB10 | Conferir commits individuais | Scrum Master |

> A distribuição dos integrantes foi confirmada durante a reunião da equipe, conforme os papéis e a disponibilidade de cada membro.

---

## 📅 5. Cronograma da Sprint

### 16/09 — Quarta-feira · Levantamento e Diagnóstico

- Reunir a equipe.
- Levantar as funcionalidades e testes já realizados.
- Conferir o que foi apresentado sobre CI/CD.
- Identificar pendências.
- Atualizar o Kanban.

**Entrega esperada:** lista do que foi concluído, está pendente ou precisa de validação.

---

### 17/09 — Quinta-feira · Conferência e Classificação dos Testes

- Verificar os testes do backend e frontend.
- Confirmar o mínimo exigido de 2 testes no backend e 2 no frontend.
- Classificar os testes como Smoke, Sanidade ou Regressão.
- Executar os testes localmente.

**Entrega esperada:** tabela de testes com classificação e resultados.

---

### 18/09 — Sexta-feira · Validação do CI/CD

- Conferir o workflow do GitHub Actions.
- Verificar a execução dos testes.
- Conferir a ordem do build Docker.
- Corrigir possíveis problemas.
- Realizar commits e push no GitHub.

**Entrega esperada:** pipeline validado ou pendências registradas.

---

### 19/09 — Sábado · Simulação de Falha

1. Provocar temporariamente uma falha em um teste.
2. Executar o pipeline.
3. Registrar o erro.
4. Confirmar a reprovação do pipeline.
5. Corrigir o problema.
6. Executar novamente.
7. Confirmar a aprovação do pipeline.

**Entrega esperada:** evidência da falha, correção e aprovação.

---

### 20/09 — Domingo · Documentação e Organização

- Atualizar o README.
- Conferir o Product Backlog e Sprint Backlog.
- Atualizar o Kanban.
- Organizar os registros dos testes.
- Reunir prints e links do GitHub Actions.
- Conferir os commits de todos os integrantes.

**Entrega esperada:** documentação e evidências organizadas.

---

### 21/09 — Segunda-feira · Revisão e Encerramento da Sprint

- Revisar as tarefas concluídas.
- Conferir a Definition of Done.
- Verificar o pipeline aprovado.
- Conferir os commits dos integrantes.
- Identificar pendências.
- Preparar a apresentação final.

**Entrega esperada:** Sprint revisada e materiais organizados para entrega.

---

## 🗂️ 6. Organização do Kanban

Quadro no Trello: [Biblioteca Novaris Tech](https://trello.com/b/tseoOgOv/biblioteca-novaris-tech)

As colunas do quadro são organizadas da seguinte forma:

| Coluna | Significado |
| --- | --- |
| Backlog | Tarefas ainda não selecionadas |
| A Fazer | Tarefas selecionadas para a Sprint |
| Em Andamento | Tarefas em execução |
| Em Teste | Tarefas aguardando validação |
| Concluído | Tarefas aprovadas |

Cada cartão deve conter:
- Nome e descrição da tarefa.
- Responsável.
- Prioridade.
- Estimativa.
- Tipo de teste, quando aplicável.
- Critério de aceitação.
- Situação atual.

---

## 🧪 7. Classificação dos Testes

| Arquivo | Funcionalidade | Classificação | Resultado esperado |
| --- | --- | --- | --- |
| `test_health.py` | Disponibilidade da API | Smoke Test | API responde com HTTP 200 |
| `test_health.py` | Versão do build/deploy | Sanidade / Smoke | Versão 1.0.0 ativa |
| `test_api.py` | Fluxo completo (Login, Livros, Empréstimo) | Regressão / E2E | Regras de negócio executadas sem erro |
| `test_api.py` | Restrições de permissões (RBAC) de Aluno | Sanidade / Regressão | Bloqueio 403 para operações indevidas |
| `frontend.test.js` | Utilitários (Iniciais e Normalização de livros) | Unitário | Funções retornam dados formatados corretamente |

> A classificação foi confirmada de acordo com a finalidade real dos testes implementados pela equipe.

---

## ✅ 8. Definition of Done

Uma tarefa será considerada concluída quando:

- [x] A funcionalidade estiver implementada, quando aplicável.
- [x] O teste automatizado estiver criado, quando aplicável.
- [x] O teste executar localmente.
- [x] O código estiver no GitHub.
- [x] O pipeline estiver aprovado.
- [x] O critério de aceitação for atendido.
- [x] O cartão do Kanban estiver atualizado.

---

## 📦 9. Entregas Obrigatórias

- [x] Link do repositório GitHub.
- [x] Link ou imagem do quadro Kanban.
- [x] Product Backlog e Sprint Backlog.
- [x] Código dos testes automatizados.
- [x] Workflow do GitHub Actions.
- [x] README.md atualizado.
- [x] Pipeline executado com sucesso.
- [ ] Histórico de commits dos integrantes.
- [x] Evidência da simulação de falha e correção.

---

## 🏁 10. Resultado Esperado

Ao final da Sprint, a equipe deverá ter uma visão clara do que foi realizado, do que foi validado e do que ainda precisa ser corrigido.

O objetivo é concluir as pendências prioritárias, classificar os testes, validar o CI/CD, atualizar a documentação e organizar as evidências para a entrega das Atividades Integradoras 1 e 2.

---

**Responsável pela organização:** Nicoly Missehelli Lima de Oliveira
**Funções:** Product Owner e Scrum Master
