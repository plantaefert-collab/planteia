# Design · planteia

Base de decisões de UX/UI do produto. Existe para que nenhuma tela seja desenhada por
escolha arbitrária, e para que um padrão já resolvido nunca seja re-pesquisado do zero.

## Os quatro estados

Toda referência, conceito ou solução está sempre em exatamente um destes estados.

| Estado | Significado | Quem promove |
|---|---|---|
| `REFERÊNCIA` | Estamos apenas estudando. Nenhum compromisso. | — |
| `CANDIDATA` | Proposta considerada boa, ainda **não** aprovada. | — |
| `DIREÇÃO APROVADA` | Conceito, comportamento ou estilo aprovado pelo Felipe. | Felipe |
| `PADRÃO OFICIAL` | Já incorporado ao Design System. Reutilização obrigatória. | Felipe |

Nada sobe de estado sozinho. `CANDIDATA` não vira `DIREÇÃO APROVADA` por ser boa.

## O ciclo obrigatório

```
entender o problema
  → pesquisar aquele problema específico
  → curar referências reais
  → analisar UX, UI, interação e motion
  → apresentar ao menos 3 direções
  → recomendar uma
  → Felipe avalia
  → Felipe aprova
  → documentar em decisoes.md
  → promover a PADRÃO OFICIAL quando aplicável
  → desenvolver
  → revisar o resultado contra a referência aprovada
```

**Regra de ouro:** a pesquisa é por *problema*, nunca pelo aplicativo inteiro. Cada tela é
um problema de produto próprio e gera a própria pesquisa. A identidade visual geral não
substitui a pesquisa específica de uma tela.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| [`decisoes.md`](decisoes.md) | Log de decisões aprovadas. Fonte da verdade. |
| [`design-system.md`](design-system.md) | Tokens, componentes e padrões oficiais. |
| [`motion-system.md`](motion-system.md) | Durações, easings, gatilhos e regras de movimento. |
| [`biblioteca-referencias.md`](biblioteca-referencias.md) | Referências por tema, com status de cada uma. |
| [`estado-atual.md`](estado-atual.md) | Auditoria do que existe hoje. Alvo de comparação. |

## Estado do projeto

- **Plataforma-alvo:** PWA mobile-first. Linguagem própria — não perseguimos iOS 26
  Liquid Glass nem Material 3 Expressive. Aproximar SO em PWA envelhece mal.
- **Módulo em desenvolvimento:** Diagnóstico por foto + IA.
- **Módulos não iniciados:** onboarding, home, plantas, calendário, diário, jardineiro,
  produtos, perfil, auth.
