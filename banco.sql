   create table if not exists public.favoritos (
     id            bigint generated always as identity primary key,
     criado_em     timestamptz not null default now(),
     id_time       text        not null unique,
     nome_time     text        not null,
     escudo_url    text,
     liga          text,
     esporte       text,
     pais          text,
     estadio       text,
     ano_fundacao  integer,
     anotacao      text check (char_length(anotacao) <= 500)
   );

   alter table public.favoritos enable row level security;

   drop policy if exists "anon pode ler favoritos"       on public.favoritos;
   drop policy if exists "anon pode criar favoritos"     on public.favoritos;
   drop policy if exists "anon pode excluir favoritos"   on public.favoritos;
   drop policy if exists "anon pode atualizar favoritos" on public.favoritos;

   create policy "anon pode ler favoritos"
     on public.favoritos for select to anon using (true);
   create policy "anon pode criar favoritos"
     on public.favoritos for insert to anon with check (true);
   create policy "anon pode excluir favoritos"
     on public.favoritos for delete to anon using (true);
   create policy "anon pode atualizar favoritos"
     on public.favoritos for update to anon using (true) with check (true);

   grant select, insert, update, delete on public.favoritos to anon;