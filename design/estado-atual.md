# Estado atual — auditoria

Registro do que existe **antes** das decisões aprovadas. Serve de alvo de comparação na
etapa final do ciclo: revisar o resultado contra a referência aprovada.

Auditado em 2026-08-13, commit `0f54a16`.

---

## Módulo: Diagnóstico por foto + IA

### Fluxo implementado

`intro → select → objective → symptom → photos → questions → review → loading → result`

Definido em [`app.diagnostico.tsx:59`](../src/routes/app.diagnostico.tsx). Há um atalho de
captura direta (`pendingCapture`) que entra em `symptom` com a primeira foto já salva.

### Problemas identificados

| # | Problema | Onde | Endereçado por |
|---|---|---|---|
| 1 | Progresso falso — `setInterval` incrementa 3–5% a cada 200 ms até travar em 90%. Não mede trabalho. | [`app.diagnostico.tsx:198`](../src/routes/app.diagnostico.tsx) | `P-001` · fase 1 |
| 2 | "Passo 1 de 6" anuncia o custo total na entrada. | [`DiagnosisProgress.tsx`](../src/components/diagnosis/DiagnosisProgress.tsx) | `P-004` · fase 1 |
| 3 | Fotos "guiadas" são slots de upload com legenda. Nada verifica foco, luz ou enquadramento. | [`GuidedPhotoUploader.tsx`](../src/components/diagnosis/GuidedPhotoUploader.tsx) | fase 2 |
| 4 | Hipótese única (`mainSuspicion`). Produz falsa certeza em domínio incerto. | [`DiagnosisResult.tsx:32`](../src/components/DiagnosisResult.tsx) | `P-003` · fase 1 |
| 5 | Resultado monolítico: 8 seções, todas abertas, mesmo peso visual. | [`DiagnosisResult.tsx`](../src/components/DiagnosisResult.tsx) | `P-002` · fase 1 |
| 6 | Questionário roda antes da análise; pergunta o que a foto responderia. | [`app.diagnostico.tsx`](../src/routes/app.diagnostico.tsx) | fase 2 |
| 7 | Classe `text-success-dark` referenciada mas inexistente em `styles.css`. Ignorada silenciosamente. | [`DiagnosisResult.tsx:98`](../src/components/DiagnosisResult.tsx) | fase 1 |

### O que já está certo e deve ser preservado

- **Requisitos de foto variam por sintoma.** `requirementsBySymptom` em
  `GuidedPhotoUploader` já adapta os slots ao sintoma escolhido. O conceito é bom; falta a
  verificação de qualidade.
- **Fallback tipado na API.** O tratamento de `schema_mismatch` documentado em
  [`.lovable/plan.md`](../.lovable/plan.md) impede que o usuário chegue a uma tela morta.
  Trata o sintoma corretamente e **deve permanecer** — a causa só é atacada na fase 2.
- **Histórico local com miniatura e reexecução.** `diagnosisHistory` já guarda fotos,
  respostas e diagnóstico. É a base da reavaliação comparativa.
- **`reevaluateInDays` no schema.** Já existe o dado que torna a reavaliação possível.
- **Linguagem simples.** Os textos evitam jargão botânico. Preservar.

### Métricas de comparação pós-fase 1

Verificar contra este documento quando a fase 1 estiver pronta:

- [ ] Nenhum temporizador local governando indicador de progresso.
- [ ] Nenhuma tela exibindo denominador de passos.
- [ ] Resultado apresenta ao menos 3 hipóteses com probabilidade.
- [ ] Primeiro conteúdo visível antes de a geração terminar.
- [ ] Falha de schema produz resultado parcial nomeado, nunca tela genérica de erro.
- [ ] Uso de histórico declarado na interface quando ocorre.
- [ ] `text-success-dark` resolvido.

---

## Fundações do produto

**Stack:** TanStack Start · React · Vite · Tailwind v4 (`@theme` CSS-first) · shadcn/ui
sobre Radix · Supabase · AI SDK (`@ai-sdk/react`, `@ai-sdk/openai-compatible`) ·
Lovable Cloud.

**Consequência para o design:** a biblioteca base é Radix — acessibilidade de teclado e foco
já vêm resolvidas nos primitivos. Componentes novos devem ser construídos sobre eles em vez
de do zero.

**Sincronização:** o repositório sincroniza com o Lovable. Reescrever histórico publicado
corrompe o projeto no editor. Nunca fazer force push, rebase ou amend de commit já enviado.

## Inventário de telas

| Rota | Módulo | Auditado |
|---|---|---|
| [`app.diagnostico.tsx`](../src/routes/app.diagnostico.tsx) | Diagnóstico | ✅ |
| [`onboarding.tsx`](../src/routes/onboarding.tsx) | Onboarding | — |
| [`app.inicio.tsx`](../src/routes/app.inicio.tsx) | Home | — |
| [`app.plantas.tsx`](../src/routes/app.plantas.tsx) | Plantas | — |
| [`app.calendario.tsx`](../src/routes/app.calendario.tsx) | Calendário | — |
| [`app.diario.tsx`](../src/routes/app.diario.tsx) | Diário | — |
| [`app.jardineiro.tsx`](../src/routes/app.jardineiro.tsx) | Chat IA | — |
| [`app.produtos.tsx`](../src/routes/app.produtos.tsx) | Produtos | — |
| [`app.perfil.tsx`](../src/routes/app.perfil.tsx) | Perfil | — |
| [`auth.login.tsx`](../src/routes/auth.login.tsx) | Auth | — |

Existe também [`src/wireframe/`](../src/wireframe/), com telas de wireframe já mapeadas —
inclusive `ReassessmentFlow.tsx`, que antecipa a reavaliação comparativa de D-002.
