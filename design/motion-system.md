# Motion System · planteia

Movimento existe para tornar o produto compreensível, não para decorá-lo. Toda entrada
aqui responde a cinco perguntas: por que animar, o que a animação comunica, qual ação do
usuário dispara, qual a duração, e onde está o risco de exagero.

---

## 0. Fundações

### 0.1 A camada de motion é a plataforma

`DIREÇÃO APROVADA` implícita em D-001 · alvo PWA mobile-first

A base é CSS e as APIs nativas do navegador. Biblioteca de animação fica reservada a
gesto e física — arraste, swipe, pull-to-refresh.

| Recurso | Uso |
|---|---|
| View Transitions API | Transição entre rotas e shared element. |
| `@starting-style` + `transition-behavior: allow-discrete` | Entrada e saída de elementos sem JS. |
| `animation-timeline` | Animação dirigida por scroll. |
| `interpolate-size: allow-keywords` | Animar altura `auto` em expansão de card. |

**Motivo:** roda no compositor, não bloqueia a thread principal, e sai do bundle. Performance
é critério de aceitação, não detalhe.

### 0.2 Escala de duração

| Nome | Duração | Uso |
|---|---|---|
| `instant` | 100 ms | Feedback de toque, mudança de estado de controle. |
| `quick` | 200 ms | Hover, foco, troca de aba. |
| `base` | 300 ms | Mudança de estado em lista, transição de painel. |
| `enter` | 400 ms | Entrada de bloco de conteúdo. |
| `deliberate` | 900–1000 ms | Preenchimento de barra de dado. Pede ser notado. |
| `ambient` | 3600 ms | Respiração em espera longa. Loop. |

### 0.3 Easings

| Nome | Curva | Uso |
|---|---|---|
| `standard` | `cubic-bezier(.2, .8, .3, 1)` | Padrão. Sai rápido, assenta devagar. |
| `spring` | `cubic-bezier(.34, 1.56, .64, 1)` | Overshoot. Só para elemento que "aparece e fica". |
| `calm` | `ease-in-out` | Loops ambientes. |

`spring` é escasso. Usado em tudo, o produto vira brinquedo.

### 0.4 Movimento reduzido

`prefers-reduced-motion: reduce` é respeitado em todo componente. A regra **não** é remover
o feedback — é remover o deslocamento:

- Translações e escalas viram 0.
- Loops (respiração, ping, varredura) param.
- Opacidade e mudança de estado permanecem, com duração reduzida a ~10 ms.
- **A revelação progressiva continua acontecendo.** É informação, não decoração.

---

## M-001 · Entrada de bloco de conteúdo de IA

`PADRÃO OFICIAL` · dá forma a P-002

**Por que animar:** o conteúdo chega em ordem imprevisível. Sem movimento, blocos surgem
como falha de renderização.
**O que comunica:** "isto acabou de ser gerado, e há mais vindo".
**Gatilho:** chegada de um campo do schema pelo stream.
**Especificação:** `opacity 0 → 1`, `translateY(8px) → 0`, `enter` (400 ms), `standard`.
Escalonamento de 380 ms entre blocos consecutivos.
**Risco de exagero:** deslocamento maior que 8 px lê como carrossel. Escalonamento acima de
500 ms faz o resultado parecer mais lento do que é — anula o próprio ganho.

## M-002 · Mudança de estado em passo de checklist

`PADRÃO OFICIAL` · dá forma a P-001

**Por que animar:** a transição pendente → em execução → concluído é a única prova visível
de avanço real.
**O que comunica:** trabalho concluído, e trabalho em curso agora.
**Gatilho:** evento de passo vindo do servidor. Nunca temporizador local.
**Especificação:** cor e opacidade em `base` (300 ms), `standard`. O marcador em execução
gira em 700 ms linear. O concluído recebe o traço de confirmação sem overshoot.
**Risco de exagero:** animar a lista inteira a cada passo destrói a leitura. Só a linha que
mudou se move.

## M-003 · Preenchimento de barra de dado

`PADRÃO OFICIAL` · dá forma a P-003

**Por que animar:** o crescimento comunica magnitude melhor que um número parado.
**O que comunica:** o quanto de confiança, e como se compara às alternativas.
**Gatilho:** o bloco que contém a barra terminou de entrar (M-001 + 120 ms).
**Especificação:** `width 0 → n%`, `deliberate` (1000 ms para a principal, 900 ms para as
alternativas), `standard`.
**Risco de exagero:** com `reduce`, a barra assume o valor final imediatamente. A magnitude
já está no número ao lado.

## M-004 · Marcador de anotação sobre imagem

`PADRÃO OFICIAL` · reservado para a fase 2 (direção B)

**Por que animar:** o marcador precisa ser notado sobre uma imagem visualmente ruidosa.
**O que comunica:** "encontrei um sinal exatamente aqui".
**Gatilho:** detecção do sinal durante a leitura da foto.
**Especificação:** `scale(.4) → 1`, `opacity 0 → 1`, 420 ms, `spring`. Halo pulsante de
2200 ms apenas durante a captura ao vivo — **desligado** no resultado estático.
**Risco de exagero:** halo permanente na tela de resultado transforma informação em enfeite
e compete com a leitura.

## M-005 · Respiração de espera longa

`PADRÃO OFICIAL` · uso restrito

**Por que animar:** sinaliza que o sistema está vivo quando não há passo real a mostrar.
**O que comunica:** apenas "estou trabalhando". Não comunica progresso.
**Gatilho:** espera sem etapas discretas disponíveis.
**Especificação:** `scale(.9 → 1.1)` com `opacity(.75 → .12)`, `ambient` (3600 ms),
`calm`, em loop.
**Risco de exagero:** **este é o padrão de último recurso.** Se existe passo real a exibir,
P-001 tem precedência. Respiração onde caberia checklist é regressão disfarçada de calma.

---

## Pendentes

Especificar quando os módulos correspondentes forem aprovados:

- Transição entre rotas (View Transitions) e shared element foto → miniatura → resultado.
- Feedback de toque e resposta háptica simulada.
- Pull-to-refresh, swipe, arraste.
- Skeletons — distinguir de M-001; skeleton é para dado conhecido em rede lenta, streaming
  é para conteúdo sendo gerado. Não são intercambiáveis.
- Estado de sucesso e conclusão de tarefa.
- Contadores animados no dashboard.
