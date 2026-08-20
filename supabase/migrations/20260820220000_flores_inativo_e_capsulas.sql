-- Bokashi Flores desativado; Bokashi em Cápsulas acrescentado.
--
-- Duas leituras independentes da loja (a home e a página /produtos/) não trazem
-- nenhum produto "Flores". Ele consta no catálogo que a IA usa para recomendar,
-- com dados específicos (composição e dose), então pode existir e estar fora de
-- estoque — por isso `active = false` em vez de apagar: voltar é um UPDATE.
--
-- Recomendar o que não dá para comprar é pior que não recomendar; foi o critério.
update public.products set active = false where id = 'bokashi-flores';

-- Estava na loja e faltava aqui.
insert into public.products (id, name, category, goal, moment, formats, dose_units, url, sort_order)
values ('bokashi-capsulas', 'Adubo Bokashi em Cápsulas', 'base',
        'Nutrição prática, sem preparo', 'Manutenção do dia a dia, direto no substrato',
        '{solido}', '{g}',
        'https://plantaefert.com.br/produtos/adubo-bokashi-em-capsulas-70g/', 15)
on conflict (id) do nothing;
