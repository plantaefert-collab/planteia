-- Fundação: perfil do usuário e plantas.
-- Aplicado no banco em 2026-07-26; versionado depois (ver AVISO no README das migrations).

create type public.plant_status as enum ('saudavel','atencao','acompanhamento');
create type public.plant_environment as enum ('interno','externo');
create type public.light_level as enum ('baixa','media','alta','indireta');

-- Perfil (1:1 com a conta de login)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  city text,
  level text check (level in ('iniciante','intermediario','avancado')),
  goal text check (goal in ('recuperar','florescer','organizar','aprender')),
  plant_types text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Plantas do usuário
create table public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  species text,
  scientific text,
  photo text,
  status public.plant_status not null default 'acompanhamento',
  environment public.plant_environment,
  light public.light_level,
  pot_size text,
  watering_frequency_days integer,
  acquired_at date,
  last_watered timestamptz,
  last_fertilized timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index plants_user_id_idx on public.plants(user_id);

-- Cada usuário só enxerga o que é dele
alter table public.profiles enable row level security;
alter table public.plants enable row level security;

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "plants_own" on public.plants
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cria o perfil automaticamente quando uma conta é criada
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantém updated_at atual
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger plants_touch before update on public.plants
  for each row execute function public.touch_updated_at();
