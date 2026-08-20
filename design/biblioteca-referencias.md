# Biblioteca de referências

Organizada por tema para que um padrão já pesquisado nunca seja re-pesquisado do zero.
Cada entrada carrega seu estado e o veredito — inclusive as descartadas, porque saber o que
já foi rejeitado e por quê vale tanto quanto saber o que foi aprovado.

---

## IA na interface

### Smashing Magazine — Practical Interface Patterns For AI Transparency
`DIREÇÃO APROVADA` · maio/2026 · tipo: interação
🔗 https://www.smashingmagazine.com/2026/05/practical-interface-patterns-ai-transparency/

Seis padrões nomeados: Living Breadcrumb, Dynamic Checklist, Thinking Toggle, Audit Trail,
Partial Success Messaging, Tool Disentanglement. Contribuição principal: a fórmula
operacional de texto de status — **verbo de ação + item específico + limite aplicado**.

- **Aproveitado:** Dynamic Checklist → `P-001`. Partial Success + Tool Disentanglement → `P-005`.
- **Rejeitado:** Thinking Toggle com logs crus. Público leigo.
- **Guardado para depois:** Audit Trail ("ver como cheguei aqui") — útil na reavaliação
  comparativa, quando houver histórico a auditar.

### Streaming de saída — Perplexity, ChatGPT, Claude, Cursor
`DIREÇÃO APROVADA` · tipo: interação + tecnológica
🔗 https://www.aiuxplayground.com/pattern/streaming/

Cinco estados obrigatórios: aguardando, transmitindo, interrompido, completo, falhou. Tempo
percebido cai 55–70% mesmo com tempo real idêntico.

- **Aproveitado:** revelação progressiva → `P-002`.
- **Rejeitado:** animação token a token. Conteúdo estruturado anima em blocos.
- **Nota:** o estado "interrompido" ainda não foi desenhado. Pendência da fase 1.

### UX Patterns for Developers — AI Loading States
`REFERÊNCIA` · tipo: interação
🔗 https://uxpatterns.dev/patterns/ai-intelligence/ai-loading-states

Ciclo de vida completo: idle → validando → enviando → transmitindo → completo/interrompido/
falhou. Antipadrões nomeados: estado de sistema oculto, tratamento genérico de falha.

- **Aproveitado:** o ciclo de estados como checklist de implementação.
- **Nota de acessibilidade:** transições de estado precisam ser anunciadas por ARIA live
  region. Ainda não implementado.

### AI SDK — `streamObject` / `useObject`
`DIREÇÃO APROVADA` · tipo: tecnológica
🔗 https://vercel.com/templates/ai/use-object

Streaming de objeto estruturado contra schema Zod, com objeto parcial disponível a cada
fragmento. `@ai-sdk/react` já está no `package.json`.

- **Aproveitado:** base técnica da fase 1.
- **Cuidado:** o objeto parcial tem todos os campos opcionais. A UI precisa tolerar campos
  ausentes sem quebrar layout.

### Adobe Project Indigo — crítica de foto por IA
`REFERÊNCIA` · julho/2026 · tipo: tecnológica
🔗 https://www.itechpost.com/articles/236767/20260721/adobe-project-indigo-camera-app-adds-ai-photo-critique-photo-guidance-features.htm

Marc Levoy abandonou prompt livre em favor de botões: formular o prompt certo é em si uma
habilidade que a maioria não tem. Crítica estruturada em enquadramento, luz e cor.

- **Guardado para a fase 2:** a lição de não pedir texto livre a quem não sabe nomear o
  problema, e o vocabulário de crítica de foto aplicável ao guia de captura.

---

## Diagnóstico e triagem sob incerteza

### Ada Health
`DIREÇÃO APROVADA` · tipo: UX + funcional
🔗 https://about.ada.com/editorial/how-could-online-symptom-assessment-tools-reduce-the-burden-on-primary-care/
🔗 https://www.medrxiv.org/content/10.1101/2025.08.21.25333628.full.pdf

Perguntas adaptativas, uma por tela. Hipóteses ranqueadas. **Severidade apresentada como
eixo separado da hipótese** — a urgência é a decisão real do usuário. No estudo do NHS
Paxton Green, 97,9% classificaram como fácil de usar.

- **Aproveitado:** diferencial ranqueado e separação severidade/hipótese → `P-003`.
  Uma pergunta por tela → `P-004`.
- **Rejeitado:** tom clínico. Peso emocional errado para planta.

### Merlin Bird ID — Cornell Lab
`DIREÇÃO APROVADA` (parcial) · tipo: UX + funcional
🔗 https://merlin.allaboutbirds.org/
🔗 https://ixd.prattsi.org/2023/09/design-critique-merlin-bird-id-app/

Cinco perguntas **visuais**: tamanho por escala de silhuetas familiares, cor por cartela de
swatches, comportamento por ilustração. O leigo não sabe nomear, mas sabe reconhecer.

- **Aproveitado:** o princípio de pergunta visual → reescrita do `SymptomSelector`.
- **Rejeitado:** as cinco perguntas fixas. Nosso questionário é adaptativo.
- **Pendente:** a reescrita do `SymptomSelector` ainda não foi especificada. Precisa de
  pesquisa própria antes de virar decisão.

### PictureThis × Growli — concorrentes diretos
`REFERÊNCIA` · tipo: funcional
🔗 https://www.getgrowli.app/blog/whats-wrong-with-my-plant-app
🔗 https://unstar.app/blog/plant-identification-apps-ranked-picturethis-plantin-plantnet-2026

PictureThis identifica a espécie e devolve FAQ estático — rápido, genérico. Growli pergunta
contexto antes — contextual, lento. Lados opostos do mesmo trade-off.

- **Descartado como modelo:** nenhum dos dois. O valor está no espaço vazio entre eles.
- **Gerou:** D-002 / `P-006` — contexto vindo do banco, sem custo de interface.
- ⚠️ Circula a afirmação de que o feedback em tempo real do PictureThis eleva o acerto de
  primeira tentativa em ~40%. Fonte é conteúdo de marketing, não estudo. **Não citar como dado.**

### Progressive disclosure em resultado clínico
`REFERÊNCIA` · tipo: UX
🔗 https://www.themomentum.ai/blog/healthcare-ux-design-principles-patient-provider-apps

Princípio: mostrar primeiro o item mais acionável; contexto completo na expansão. Expor tudo
de uma vez leva à rejeição da ferramenta.

- **Aproveitado:** justifica desmontar as oito seções planas do `DiagnosisResult`.

---

## Captura de foto guiada

`REFERÊNCIA` · pesquisa **preliminar** — a fase 2 exige rodada própria

- Verificação em tempo real de enquadramento, reflexo, desfoque e presença do objeto antes
  do envio: https://help.socure.com/riskos/docs/capture-app
- Feedback de posicionamento por IA em imagem médica auto-administrada:
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12712050/
- Confiabilidade de imagem médica e percepção de qualidade: https://arxiv.org/pdf/2105.12651

Padrões recorrentes observados: guia visual sobreposto, escore de nitidez calculado no
dispositivo, e realimentação sonora que aumenta de frequência conforme a qualidade sobe.

**Ainda não pesquisado e necessário antes da fase 2:** limites reais de `getUserMedia` em
PWA no iOS, e caminho alternativo para quem escolhe foto da galeria.

---

## Temas ainda não pesquisados

Cada um exigirá sua própria rodada quando o módulo entrar em desenvolvimento.

`onboarding` · `home` · `navegação` · `menu` · `formulários` · `chat` · `calendário` ·
`progresso` · `gamificação` · `perfil` · `notificações` · `cards` · `gráficos` ·
`upload` · `empty states` · `confirmação` · `erro` · `pagamentos` · `planos` · `configurações`
