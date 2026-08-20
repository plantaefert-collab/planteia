# Design System · planteia

Cresce por aprovação. Nada entra aqui sem uma decisão correspondente em
[`decisoes.md`](decisoes.md).

---

## 1. Fundações

### 1.1 Cor

Fonte da verdade: [`src/styles.css`](../src/styles.css). Espaço OKLCH, tema claro e escuro.
Documentado aqui como **estado atual**, não como aprovado — a paleta ainda não passou por
pesquisa própria.

| Papel | Token | Valor (claro) | Uso |
|---|---|---|---|
| Fundo | `--background` | `oklch(0.985 0.012 95)` | Creme quente. Base de todas as telas. |
| Superfície | `--card` | `oklch(0.995 0.008 95)` | Cards e folhas elevadas. |
| Texto | `--foreground` | `oklch(0.24 0.03 155)` | Verde tão escuro que lê como preto. |
| Texto secundário | `--muted-foreground` | `oklch(0.48 0.02 145)` | Apoio, legendas. |
| Primária | `--primary` / `--leaf` | `oklch(0.36 0.08 155)` | Verde botânico. Ação principal. |
| Primária suave | `--leaf-soft` | `oklch(0.93 0.04 150)` | Fundo de destaque calmo. |
| Acento | `--accent` / `--bloom` | `oklch(0.62 0.19 350)` | Magenta. Uso escasso e deliberado. |
| Borda | `--border` | `oklch(0.9 0.015 100)` | Hairlines. |

**Semânticas** — separadas do acento, nunca reaproveitadas como decoração:

| Papel | Token | Significado |
|---|---|---|
| Sucesso | `--success` | Melhora confirmada, ação concluída. |
| Atenção | `--warning` | Requer acompanhamento, não é urgente. |
| Destrutivo | `--destructive` | Urgência real, ação irreversível. |

⚠️ **Dívida conhecida.** [`DiagnosisResult.tsx`](../src/components/DiagnosisResult.tsx)
referencia `text-success-dark`, que não existe em `styles.css`. A classe é silenciosamente
ignorada. Corrigir na fase 1.

### 1.2 Tipografia

| Papel | Família | Uso |
|---|---|---|
| Display | `Fraunces` | Veredito, nome da hipótese, título de planta. Serifada, humana. |
| Corpo | `Inter` | Todo o resto. |

Regra: display **só** para o objeto principal de uma tela. Nunca em rótulo, botão ou item
de lista — perde o peso justamente onde ele deveria funcionar.

### 1.3 Raio e espaçamento

`--radius: 1rem`, com a escala derivada de `sm` a `3xl` já definida em `styles.css`.
Espaçamento por `gap` de flex/grid, nunca por margens individuais que colapsam.

---

## 2. Padrões oficiais

Aprovados em D-001 e D-002. Reutilização **obrigatória** onde o padrão se aplica.

### P-001 · Status de processamento honesto

`PADRÃO OFICIAL` · origem: Smashing Magazine, maio/2026

Nunca exibir progresso que não mede trabalho real. Barra falsa, percentual estimado e
spinner mudo estão proibidos em qualquer operação de IA com espera perceptível.

**Forma:** lista de passos com três estados — concluído, em execução, pendente — e contador
`n / total`.

**Escrita do passo:** verbo de ação + item específico + limite aplicado.

| ✅ | ❌ |
|---|---|
| "Lendo foto 2 de 3 — folha, frente e verso" | "Analisando…" |
| "Comparando com Phalaenopsis e 4 espécies parecidas" | "Processando imagem" |
| "Conferindo suas regas — últimos 14 dias" | "Quase lá" |

**Condição de uso:** cada passo exibido corresponde a uma etapa que de fato ocorre no
servidor. Checklist inventada é a mesma desonestidade da barra falsa.

**Onde aplicar:** diagnóstico, jardineiro, recomendação de produtos, reavaliação.

### P-002 · Revelação progressiva de resultado de IA

`PADRÃO OFICIAL` · origem: Perplexity, Claude, AI SDK `streamObject`

Resultado estruturado de IA aparece bloco a bloco conforme o modelo preenche o schema.
Nunca esperar o objeto completo para então renderizar tudo de uma vez.

**Forma:** cada bloco entra com `M-001`. A ordem de entrada segue a ordem de geração.

**Proibido:** animar token a token. O conteúdo é estruturado — animam-se blocos, não letras.

**Estabilidade de layout:** reservar altura antes do conteúdo chegar. Blocos que empurram os
anteriores para baixo anulam o ganho de tempo percebido.

### P-003 · Comunicação de incerteza

`PADRÃO OFICIAL` · origem: Ada Health

Saída de IA em domínio incerto nunca se apresenta como resposta única.

**Obrigatório:**
- Hipótese principal + no mínimo 2 alternativas com probabilidade.
- Confiança como barra contínua, acompanhada do rótulo textual.
- **Severidade é eixo separado da hipótese.** "O que pode ser" e "quão urgente é" são
  decisões diferentes e não podem ser fundidas num só indicador.

**Escrita:** nomear a limitação, não o fracasso do sistema.

| ✅ | ❌ |
|---|---|
| "Poucas fotos da raiz para ter certeza" | "A IA não conseguiu analisar" |
| "Confiança moderada" | "Resultado impreciso" |

### P-004 · Uma pergunta por tela, sem contador total

`PADRÃO OFICIAL` · origem: Ada Health, Merlin Bird ID

Fluxos com múltiplas etapas apresentam uma decisão por tela e **não** anunciam o total de
passos na entrada. Declarar o custo completo na porta é convite ao abandono.

**Permitido:** progresso relativo, sem denominador ("mais duas coisas e terminamos").
**Proibido:** "Passo 1 de 6".

**Onde aplicar:** diagnóstico, onboarding, cadastro de planta.

### P-005 · Falha parcial, nunca falha total

`PADRÃO OFICIAL` · origem: Smashing Magazine — Partial Success Messaging

Quando parte de uma operação de IA falha, apresentar o que foi obtido e nomear
especificamente o que faltou. Tela genérica de erro é proibida quando existe resultado
parcial utilizável.

**Também obrigatório separar a origem da falha** (Tool Disentanglement): erro do modelo,
erro de rede e entrada insuficiente produzem mensagens e ações de recuperação diferentes.

| ✅ | ❌ |
|---|---|
| "Identifiquei os sinais na folha, mas não consegui avaliar a raiz — a foto ficou escura. Refazer só essa foto?" | "Falha na análise" |

### P-006 · Contexto sem perguntar

`PADRÃO OFICIAL` · origem: D-002

Antes de perguntar algo ao usuário, verificar se o dado já existe no banco. Perguntar
apenas o que falta.

**Revelação obrigatória.** Todo uso de histórico é declarado na interface: *"Usei seu
diário: 4 regas em 14 dias"*. Usar dado do usuário sem dizer que usou reduz a confiança em
vez de aumentar.

---

## 3. Componentes

Documentados conforme entram em produção.

| Componente | Estado | Origem |
|---|---|---|
| `StepList` | a construir — fase 1 | P-001 |
| `HypothesisCard` | a construir — fase 1 | P-003 |
| `ConfidenceBar` | a construir — fase 1 | P-003 |
| `DifferentialList` | a construir — fase 1 | P-003 |
| `ContextPill` | a construir — fase 1 | P-006 |
| `PartialFailure` | a construir — fase 1 | P-005 |
| `DiagnosisProgress` | **a remover** — fase 1 | substituído por `StepList` |
| Base shadcn/Radix | em uso | — |

---

## 4. Pendências de sistema

Itens que ainda não passaram por pesquisa própria e **não** devem ser tratados como
resolvidos:

- Paleta e tipografia — herdadas, nunca validadas contra pesquisa de módulo.
- Navegação e arquitetura geral — `BottomNavigation` existe, não foi estudada.
- Onde a IA vive. Hoje o jardineiro é aba separada, padrão de 2023. Levantado como
  oportunidade, ainda em `REFERÊNCIA`.
- Grid, sombras, tabs, accordions, tooltips, modais.
- Padrões desktop e responsividade.
