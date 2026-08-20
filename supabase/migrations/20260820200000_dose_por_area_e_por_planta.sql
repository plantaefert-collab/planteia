-- A dose só sabia medir por vaso.
--
-- O check original aceitava ml, ml/L, g e borrifadas — todas por vaso ou por
-- volume. Mas GRAMADO se aduba por ÁREA e frutífera adulta por PLANTA. Como o
-- catálogo vende Biofertilizante para Gramados, o app aceitava o produto e
-- depois recusava registrar a dose dele.

alter table public.timeline_entries drop constraint timeline_dose_unit_valida;

alter table public.timeline_entries
  add constraint timeline_dose_unit_valida
    check (dose_unit is null or dose_unit in (
      'ml', 'ml/L', 'g', 'borrifadas',   -- por vaso / por volume
      'ml/m²', 'g/m²',                    -- por área (gramados, canteiros)
      'g/planta'                          -- por planta (frutíferas adultas)
    ));

-- Quais medidas fazem sentido para cada produto. Sem isto a tela teria de
-- adivinhar pela categoria, e ofereceria "borrifadas" para gramado.
alter table public.products add column dose_units text[] not null default '{}';

update public.products set dose_units = '{borrifadas,ml,ml/L}' where formats && '{pronto_uso,concentrado}';
update public.products set dose_units = '{g}' where formats = '{solido}';
update public.products set dose_units = '{ml/m²,g/m²,ml/L}' where id = 'biofertilizante-gramados';
update public.products set dose_units = '{ml/L,ml,g/planta}' where id = 'bokashi-frutas';
