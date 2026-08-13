# Log de decisões

Ordem cronológica. Cada decisão aprovada gera uma entrada. Entradas não são editadas
depois de aprovadas — se algo muda, entra uma decisão nova que revoga a anterior.

---

## D-001 · Arquitetura do Diagnóstico por foto + IA

**Data:** 2026-08-13
**Estado:** `DIREÇÃO APROVADA`
**Tela/módulo:** Diagnóstico — [`app.diagnostico.tsx`](../src/routes/app.diagnostico.tsx) e
[`src/components/diagnosis/`](../src/components/diagnosis/)

### Decisão aprovada

Adotar a direção **C — Raciocínio visível** como base, executada em três fases:

| Fase | Escopo | Justificativa |
|---|---|---|
| 1 | Direção C: processamento honesto + resultado em streaming + diagnóstico diferencial | Maior ganho por esforço. Usa infraestrutura já instalada (`@ai-sdk/react`). |
| 2 | Direção B: captura guiada com verificação de qualidade | Única que ataca a causa-raiz da foto ruim, origem do `schema_mismatch`. |
| 3 | Direção A: regras de escrita e ritmo aplicadas às duas anteriores | Não é alternativa — é o esqueleto redacional que ambas herdam. |

A ordem é vinculante. Executar a fase 2 antes da 1 significaria capturar fotos excelentes
para alimentar uma tela que ainda mente sobre o progresso.

### Referência de origem

- **Perplexity, ChatGPT, Claude** — streaming como prova de trabalho.
- **Smashing Magazine, "Practical Interface Patterns For AI Transparency"** (maio/2026) —
  padrões Dynamic Checklist, Living Breadcrumb e Partial Success Messaging.
- **Ada Health** — hipóteses ranqueadas; severidade como eixo separado da hipótese.
- **Merlin Bird ID (Cornell Lab)** — perguntas visuais em vez de textuais.
- **AI SDK `streamObject` / `useObject`** — viabilidade técnica direta.

Registro completo em [`biblioteca-referencias.md`](biblioteca-referencias.md).

### Elementos aproveitados

- Checklist de passos com três estados (concluído / em execução / pendente).
- Fórmula de texto de status: **verbo de ação + item específico + limite aplicado**.
- Hipótese principal acompanhada de 2 alternativas com probabilidade.
- Confiança expressa como barra contínua, não apenas rótulo textual.
- Revelação progressiva do resultado, bloco a bloco, conforme o modelo gera.
- Falha parcial em lugar de falha total.

### Adaptações realizadas

- **Sem logs crus.** O padrão Thinking Toggle original expõe chamadas de API. O público é
  dono de orquídea, não engenheiro — o raciocínio é resumido em linguagem simples.
- **Sem tom clínico.** Ada Health carrega peso emocional adequado a sintoma humano.
  Planta não é gente; o registro é sereno e prático.
- **Sem animação token a token.** O conteúdo é estruturado, então animam-se blocos
  entrando, não letras aparecendo.
- **Passos refletem trabalho real.** Checklist falsa é a mesma desonestidade da barra
  falsa, com mais passos. Cada linha corresponde a uma etapa que de fato ocorre.

### Comportamento

1. Usuário envia fotos e contexto.
2. Tela de análise mostra a lista de passos. Cada passo passa de pendente → em execução →
   concluído conforme o servidor avança. Contador `n / total` visível.
3. Assim que o primeiro campo estruturado chega, a tela transiciona para o resultado.
4. Os blocos do resultado aparecem na ordem em que o modelo os preenche.
5. Se o schema falhar, apresentar o que foi obtido e nomear o que faltou. Nunca "Falha na
   análise".

### Motion

Especificação completa em [`motion-system.md`](motion-system.md), padrões `M-001` a `M-005`.

### Componentes envolvidos

| Componente | Ação |
|---|---|
| `DiagnosisProgress` | **Substituir.** A barra de passos com percentual sai. |
| `DiagnosisResult` | **Reescrever.** Oito seções planas → hierarquia com diferencial. |
| `app.diagnostico.tsx` | Remover o `setInterval` de progresso falso (linha ~198). |
| `api/diagnose-photo.ts` | `generateObject` → `streamObject`; emitir eventos de passo. |
| `GuidedPhotoUploader` | Intocado na fase 1. Reescrito na fase 2. |

### Motivo da decisão

Os dois maiores danos do fluxo atual são a barra de progresso falsa e a hipótese única que
produz falsa certeza. Ambos se resolvem com biblioteca que já está no `package.json`. A
direção B resolve um problema mais profundo, mas custa 1–2 semanas e esbarra em restrição
de câmera em PWA no iOS — não é o primeiro passo certo.

### Onde este padrão deve ser reutilizado

Todo ponto do app em que a IA processa algo com espera perceptível: jardineiro, recomendação
de produtos, reavaliação comparativa. Os padrões `P-001` a `P-006` do
[`design-system.md`](design-system.md) são de aplicação obrigatória nesses lugares.

### Consequência registrada

O `schema_mismatch` tratado em [`.lovable/plan.md`](../.lovable/plan.md) tem raiz de UX, não
de backend: foto ruim entra, modelo não estrutura a saída. O fallback implementado trata o
sintoma corretamente e deve permanecer. A causa só é atacada na fase 2.

### Adendo 1 — correção de mecanismo (2026-08-13, durante a implementação)

**O que estava errado nesta decisão:** a tabela de fases dizia trocar `generateObject` por
`streamObject`. Ao abrir o código, o comentário em
[`api/diagnose-photo.ts`](../src/routes/api/diagnose-photo.ts) registrava que
`generateObject` **já havia sido tentado e removido** — o structured output não é honrado
pelo AI Gateway com `google/gemini-3.6-flash`, e fazia todo diagnóstico cair no fallback
genérico. `streamObject` depende da mesma maquinaria e falharia igual.

**Mecanismo adotado no lugar:** `streamText` + parser tolerante de JSON parcial no cliente
([`partial-json.ts`](../src/lib/partial-json.ts)), com o protocolo em
[`diagnosis-stream.ts`](../src/lib/diagnosis-stream.ts). Mantém intacto o que já funcionava
— JSON instruído por prompt, parseado e validado no servidor — e troca apenas o transporte.

**O que não mudou:** a direção aprovada. Streaming, revelação progressiva, diferencial e
status honesto seguem exatamente como decidido. Só o meio mudou.

**Consequência nova:** a ordem das chaves no schema virou decisão de UX, porque os passos de
`P-001` derivam de qual campo acabou de chegar. Reordenar o schema sem reordenar
`ANALYSIS_STEPS` quebra a semântica dos passos. Ambos têm comentário avisando disso.

### Adendo 2 — dois defeitos encontrados ao testar (2026-08-13)

Nenhum dos dois foi introduzido por esta decisão; ambos ficaram visíveis por causa dela.

1. **`investigacao_necessaria` e `observacao` eram rotulados como planta saudável.** O mapa
   de `priority` para `status` em `services.ts` jogava tudo que não fosse ação prioritária em
   `saudavel`. Passava despercebido enquanto o status não aparecia em destaque; com o selo ao
   lado da hipótese, a tela dizia "Investigação necessária · Saudável". Corrigido para
   `acompanhamento`.
2. **O caminho sem foto não mostrava alternativa nenhuma**, porque só o diagnóstico vindo da
   API traz `differential` estruturado. Isso reintroduzia a hipótese única justamente onde a
   confiança é mais baixa. `DifferentialList` passou a cair para `otherPossibilities`,
   renderizadas sem barra — inventar probabilidade seria pior que não ter, mas omitir a
   alternativa é pior ainda.

---

## D-002 · Contexto sem perguntar

**Data:** 2026-08-13
**Estado:** `DIREÇÃO APROVADA`
**Tela/módulo:** Diagnóstico, com alcance a todo o app

### Decisão aprovada

O diagnóstico consulta o histórico da planta já armazenado — regas, plano de cuidado,
diagnósticos anteriores — em vez de perguntar ao usuário o que o banco já sabe. O uso do
contexto é **sempre revelado** na interface.

### Referência de origem

Contraste entre **PictureThis** (não pergunta nada, resultado genérico) e **Growli**
(pergunta contexto, fluxo lento). Ambos escolheram lados opostos do mesmo trade-off.

### Motivo da decisão

Nenhum dos dois concorrentes tem a planta cadastrada com histórico. É a única vantagem
estrutural identificada no produto, e estava inexplorada. O padrão **remove** passos em vez
de adicionar.

### Comportamento

- A IA recebe o histórico no prompt sem custo de interface.
- A interface exibe o que foi usado: *"Usei seu diário: 4 regas em 14 dias"*.
- Sem histórico disponível, o app pergunta — mas só o que faltou.

### Onde este padrão deve ser reutilizado

Jardineiro, calendário, recomendação de produtos. Formalizado como `P-006`.

### Revelação é obrigatória

Usar dados do usuário sem dizer que usou é a armadilha do sistema de memória oculto do
ChatGPT citada pelo Smashing: o usuário percebe que o sistema sabe algo que não contou, e a
confiança cai em vez de subir.
