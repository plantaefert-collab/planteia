# Migrations

Estrutura do banco versionada. Cada arquivo corresponde ao SQL aplicado no
Supabase do projeto (Lovable Cloud).

**Aviso:** os dois primeiros arquivos foram escritos *depois* de o SQL já ter
sido aplicado no banco — foram extraídos por introspecção do schema real, e
conferem com ele. Deste ponto em diante, **toda alteração de estrutura deve
entrar como migration no mesmo commit da mudança de código.**

Ordem:

1. `20260726120000_fundacao_profiles_plants.sql` — perfil, plantas, RLS,
   criação automática do perfil no cadastro.
2. `20260819220000_bloco2_diagnostico_plano_tarefas_diario.sql` — diagnósticos,
   planos, tarefas, diário e o balde `plant-photos`.
