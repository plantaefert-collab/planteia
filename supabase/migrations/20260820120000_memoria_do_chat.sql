-- Histórico das conversas com o Jardineiro.
--
-- Sem isto a IA recomeça do zero a cada visita: a pessoa conta o caso da planta,
-- fecha o app, volta no dia seguinte e precisa contar tudo de novo.

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Sobre qual planta era a conversa (a pessoa troca de planta no mesmo chat).
  plant_id uuid references public.plants(id) on delete set null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  photo text,
  created_at timestamptz not null default now()
);

create index chat_messages_user_idx on public.chat_messages(user_id, created_at);

alter table public.chat_messages enable row level security;

create policy "chat_messages_own" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
