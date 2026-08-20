-- Registro de dose no diário da planta.
--
-- Por que: a PlantaeFert vende fertilizante, então faz sentido o app registrar
-- o que foi aplicado — coisa que os apps concorrentes não fazem. Com a dose
-- gravada, o ciclo fecha: a IA recomenda → o usuário registra → a foto do
-- diagnóstico seguinte mostra a resposta → a IA ajusta.
--
-- Antes, "adubei com meia dose" ficava perdido no texto livre de `note`,
-- impossível de consultar.
--
-- Colunas anuláveis: preenchidas quando `type = 'adubacao'`, nulas no resto.

alter table public.timeline_entries
  add column product_id text,
  add column dose_amount numeric,
  add column dose_unit text,
  add column dose_form text;

-- 'borrifadas' existe porque o pronto uso NÃO se mede em ml: o catálogo conta
-- borrifadas por tamanho de vaso (1 borrifada ≈ 1 ml).
alter table public.timeline_entries
  add constraint timeline_dose_unit_valida
    check (dose_unit is null or dose_unit in ('ml','ml/L','g','borrifadas'));

-- A distinção que o catálogo trata como regra fundamental: concentrado dilui,
-- pronto uso nunca.
alter table public.timeline_entries
  add constraint timeline_dose_form_valida
    check (dose_form is null or dose_form in ('pronto_uso','concentrado'));

create index timeline_adubacao_idx
  on public.timeline_entries(plant_id, date desc)
  where type = 'adubacao';
