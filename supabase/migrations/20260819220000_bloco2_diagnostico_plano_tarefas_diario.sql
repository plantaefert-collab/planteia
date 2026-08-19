-- Bloco 2: diagnósticos, planos de cuidado, tarefas e diário da planta,
-- mais o balde de fotos. Aplicado no banco em 2026-08-19; versionado depois.

create type public.care_type as enum ('regar','adubar','podar','pragas','fotografar','substrato');
create type public.task_priority as enum ('baixa','media','alta','critica');
create type public.timeline_type as enum ('rega','adubacao','poda','diagnostico','troca_vaso','floracao','foto');
create type public.plan_status as enum ('nao_iniciado','em_andamento','aguardando_reavaliacao','concluido','ajustado','interrompido');
create type public.confidence_level as enum ('baixa','moderada','moderada-alta','alta');

-- Diagnósticos gerados pela IA
create table public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid references public.plants(id) on delete set null,
  status public.plant_status not null default 'acompanhamento',
  main_suspicion text not null,
  confidence public.confidence_level not null default 'baixa',
  observed_signs text[] not null default '{}',
  other_possibilities text[] not null default '{}',
  immediate_actions text[] not null default '{}',
  avoid text[] not null default '{}',
  urgency_signs text[] not null default '{}',
  what_to_observe text[] not null default '{}',
  improvement_signs text[] not null default '{}',
  care_timeline jsonb not null default '[]',
  reevaluate_in_days integer not null default 7,
  photos text[] not null default '{}',
  symptom text,
  objective text,
  answers jsonb,
  created_at timestamptz not null default now()
);

-- Plano de cuidados nascido de um diagnóstico
create table public.care_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  diagnosis_id uuid references public.diagnoses(id) on delete set null,
  name text not null,
  status public.plan_status not null default 'nao_iniciado',
  priority public.task_priority not null default 'media',
  avoid text[] not null default '{}',
  next_reevaluation_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tarefas de cuidado (alimentam o calendário)
create table public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  care_plan_id uuid references public.care_plans(id) on delete cascade,
  type public.care_type not null,
  title text not null,
  description text,
  date timestamptz not null,
  done boolean not null default false,
  priority public.task_priority not null default 'media',
  origin text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Diário da planta
create table public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  type public.timeline_type not null,
  date timestamptz not null default now(),
  note text,
  photo text,
  created_at timestamptz not null default now()
);

create index diagnoses_user_idx on public.diagnoses(user_id, created_at desc);
create index diagnoses_plant_idx on public.diagnoses(plant_id);
create index care_plans_plant_idx on public.care_plans(plant_id);
create index care_tasks_user_date_idx on public.care_tasks(user_id, date);
create index care_tasks_plant_idx on public.care_tasks(plant_id);
create index timeline_plant_idx on public.timeline_entries(plant_id, date desc);

alter table public.diagnoses enable row level security;
alter table public.care_plans enable row level security;
alter table public.care_tasks enable row level security;
alter table public.timeline_entries enable row level security;

create policy "diagnoses_own" on public.diagnoses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "care_plans_own" on public.care_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "care_tasks_own" on public.care_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "timeline_entries_own" on public.timeline_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger care_plans_touch before update on public.care_plans
  for each row execute function public.touch_updated_at();
create trigger care_tasks_touch before update on public.care_tasks
  for each row execute function public.touch_updated_at();

-- Fotos das plantas. Leitura pública (a URL é aleatória e entra em <img>);
-- escrita e remoção só do dono, em pasta separada por usuário.
insert into storage.buckets (id, name, public)
values ('plant-photos', 'plant-photos', true)
on conflict (id) do nothing;

create policy "plant_photos_leitura" on storage.objects
  for select using (bucket_id = 'plant-photos');
create policy "plant_photos_envio" on storage.objects
  for insert with check (
    bucket_id = 'plant-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "plant_photos_remocao" on storage.objects
  for delete using (
    bucket_id = 'plant-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );
