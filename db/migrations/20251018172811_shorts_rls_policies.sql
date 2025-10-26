-- db/shorts_policies.sql
-- (Fragmento de la Sección III)

alter table public.shorts enable row level security;

-- Política 1: Lectura pública (solo items visibles)
drop policy if exists shorts_public_select on public.shorts;
create policy shorts_public_select on public.shorts
for select using (mod_status = 'visible' and is_public = true);

-- Política 2: Escritura/Inserción: solo el creador (auth.uid() debe coincidir con creator_id)
drop policy if exists shorts_insert_creator on public.shorts;
create policy shorts_insert_creator on public.shorts
for insert with check (auth.uid() = creator_id);

-- Política 3: Actualización: solo el dueño puede editar su short
drop policy if exists shorts_update_creator on public.shorts;
create policy shorts_update_creator on public.shorts
for update using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
