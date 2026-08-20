-- Catálogo PlantaeFert no banco.
--
-- Antes vivia em dois lugares desencontrados: prosa dentro do prompt da IA
-- (ai-persona.ts) e uma lista fixa no código (produtos.ts). Mudar preço, nome
-- ou link exigia editar código e publicar.
--
-- `url` fica nulo de propósito: a loja estava fora do ar quando isto foi
-- escrito, e inventar endereço de produto seria pior que não ter — a tela cai
-- para o site principal enquanto o link exato não existe.

create table public.products (
  id text primary key,
  name text not null,
  category text not null check (category in ('base', 'especifico', 'outro')),
  goal text,
  moment text,
  formats text[] not null default '{}',
  url text,
  image text,
  active boolean not null default true,
  sort_order integer not null default 0
);

-- Catálogo é informação pública: qualquer visitante pode ler, ninguém escreve
-- pelo app (a manutenção é feita direto no banco).
alter table public.products enable row level security;

create policy "products_leitura_publica" on public.products
  for select using (true);

insert into public.products (id, name, category, goal, moment, formats, sort_order) values
  ('bokashi-premium', 'Bokashi Líquido Premium', 'base',
   'Nutre a planta e reativa a vida do solo', 'Todas as plantas, em todas as fases',
   '{pronto_uso,concentrado}', 1),
  ('bokashi-orquideas', 'Bokashi Orquídeas', 'especifico',
   'Floração mais forte e resistente', 'Orquídeas em crescimento ou preparando para florir',
   '{pronto_uso,concentrado}', 2),
  ('bokashi-rosa-do-deserto', 'Bokashi Rosa do Deserto', 'especifico',
   'Floração exuberante', 'Rosa do deserto em qualquer fase',
   '{pronto_uso,concentrado}', 3),
  ('bokashi-frutas', 'Bokashi Frutas', 'especifico',
   'Mais produtividade e sabor', 'Frutíferas e pomares',
   '{pronto_uso,concentrado}', 4),
  ('bokashi-flores', 'Bokashi Flores', 'especifico',
   'Mais flores e cor', 'Plantas floríferas',
   '{pronto_uso,concentrado}', 5),
  ('bokashi-cactos', 'Bokashi Cactos e Suculentas', 'especifico',
   'Crescimento robusto', 'Cactos e suculentas',
   '{pronto_uso,concentrado}', 6),
  ('bokashi-samambaias', 'Bokashi Samambaias e Ornamentais', 'especifico',
   'Folhagem verde e saudável', 'Samambaias e folhagens',
   '{pronto_uso,concentrado}', 7),
  ('enraizador', 'Enraizador Orgânico', 'outro',
   'Raízes fortes — a base da recuperação', 'Mudas, estacas, replantio e plantas debilitadas',
   '{pronto_uso,concentrado}', 8),
  ('humus', 'Húmus de Minhoca', 'outro',
   'Melhora a estrutura e a retenção de água do solo', 'No plantio e na manutenção do substrato',
   '{solido}', 9),
  ('neem', 'Óleo de Neem', 'outro',
   'Defensivo natural contra pragas', 'Pulgão, cochonilha e lagartas',
   '{pronto_uso,concentrado}', 10),
  ('calda-bordalesa', 'Calda Bordalesa', 'outro',
   'Preventivo contra fungos e bactérias', 'Manchas e doenças fúngicas (usar luvas)',
   '{solido}', 11);
