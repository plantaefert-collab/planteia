-- Links reais dos produtos: a loja voltou ao ar e os endereços foram colhidos
-- de plantaefert.com.br. A migration anterior deixou `url` nulo de propósito
-- porque a loja estava fora do ar.
--
-- Critério: onde existem os dois formatos, aponta o "pronto uso" — é o mais
-- direto para quem está começando, que é o público principal do app.

update public.products set url = 'https://plantaefert.com.br/produtos/bokashi-liquido-concentrado-o-poder-da-natureza-em-cada-gota-1-litro-rende-ate-200-litros/' where id = 'bokashi-premium';
update public.products set url = 'https://plantaefert.com.br/produtos/adubo-bokashi-orquideas-enriquecido-com-fosforo-organico-500ml-pronto-para-uso/' where id = 'bokashi-orquideas';
update public.products set url = 'https://plantaefert.com.br/produtos/adubo-bokashi-rosa-do-deserto-enriquecido-com-fosforo-organico-500ml-pronto-para-uso/' where id = 'bokashi-rosa-do-deserto';
update public.products set url = 'https://plantaefert.com.br/produtos/bokashi-liquido-frutas-enriquecido-com-potassio-1-litro-concentrado-rende-ate-200-litros/' where id = 'bokashi-frutas';
update public.products set url = 'https://plantaefert.com.br/produtos/adubo-para-suculentas-e-cactos-bokashi-liquido-enriquecido-com-potassio-e-fosforo-organico-500ml-pronto-para-uso/' where id = 'bokashi-cactos';
update public.products set url = 'https://plantaefert.com.br/produtos/adubo-para-samambaia-ornamentais-bokashi-liquido-500ml-pronto-para-uso/' where id = 'bokashi-samambaias';
update public.products set url = 'https://plantaefert.com.br/produtos/hormonio-enraizador-organico-a-base-de-algas-marinhas-500ml-pronto-uso-enriquecido-com-acidos-humicos-e-fulvicos/' where id = 'enraizador';
update public.products set url = 'https://plantaefert.com.br/produtos/humus-de-minhoca-premium-1-kg-adubo-organico-para-todos-os-tipos-de-plantas/' where id = 'humus';
update public.products set url = 'https://plantaefert.com.br/produtos/oleo-de-neem-500ml-pronto-uso-defensivo-contra-pulgao-cochonilha-lagartas/' where id = 'neem';
update public.products set url = 'https://plantaefert.com.br/produtos/calda-bordaleza-fungicida-e-bactericida-pronta-900g/' where id = 'calda-bordalesa';

-- Produtos que a loja vende e o catálogo do app não tinha.
insert into public.products (id, name, category, goal, moment, formats, url, sort_order) values
  ('bokashi-farelado', 'Adubo Bokashi Premium Farelado', 'base',
   'Nutrição completa aplicada direto no substrato', 'Todos os tipos de planta, na manutenção',
   '{solido}', 'https://plantaefert.com.br/produtos/adubo-bokashi-premium-farelado-1kg-para-todos-os-tipos-de-plantas/', 12),
  ('enraizador-forte', 'Enraizador Forte', 'outro',
   'Enraizamento vigoroso', 'Mudas, estacas e plantas com raiz fraca',
   '{pronto_uso,concentrado}', 'https://plantaefert.com.br/produtos/enraizador-forte-500ml-pronto-para-uso/', 13),
  ('biofertilizante-gramados', 'Biofertilizante para Gramados', 'especifico',
   'Enraizamento e revitalização do gramado', 'Todas as fases do crescimento da grama',
   '{concentrado}', 'https://plantaefert.com.br/produtos/aduboparagrama/', 14)
on conflict (id) do nothing;

-- ATENÇÃO: `bokashi-flores` fica SEM link de propósito. Ele consta no catálogo
-- que a IA usa (ai-persona.ts), mas NÃO existe na loja — a IA pode estar
-- recomendando um produto que não dá para comprar. Decisão do dono do catálogo:
-- ou o produto volta para a loja, ou sai do prompt da IA.
