-- =========================================================================
-- MULTI-TENANCY: varias comunidades aisladas dentro de un proyecto Supabase
-- =========================================================================

create schema if not exists private;
revoke all on schema private from public, anon;

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  name text not null default 'Aquí va el nombre de tu comunidad',
  settings jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint communities_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint communities_name_length check (char_length(name) between 1 and 120)
);

create table if not exists public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id),
  constraint community_members_role_check check (role in ('owner', 'admin', 'moderator', 'member')),
  constraint community_members_status_check check (status in ('active', 'invited', 'suspended'))
);

create index if not exists communities_owner_id_idx on public.communities(owner_id);
create index if not exists community_members_user_community_idx on public.community_members(user_id, community_id);
create index if not exists community_members_community_role_idx on public.community_members(community_id, role) where status = 'active';

create or replace function private.is_community_member(target_community_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.community_members cm
    where cm.community_id = target_community_id
      and cm.user_id = (select auth.uid())
      and cm.status = 'active'
  );
$$;

create or replace function private.has_community_role(target_community_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.community_members cm
    where cm.community_id = target_community_id
      and cm.user_id = (select auth.uid())
      and cm.status = 'active'
      and cm.role = any(allowed_roles)
  );
$$;

create or replace function private.shares_community(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_user_id = (select auth.uid()) or exists (
    select 1
    from public.community_members mine
    join public.community_members theirs using (community_id)
    where mine.user_id = (select auth.uid())
      and mine.status = 'active'
      and theirs.user_id = target_user_id
      and theirs.status = 'active'
  );
$$;

create or replace function private.can_manage_community_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.community_members manager
    join public.community_members target using (community_id)
    where manager.user_id = (select auth.uid())
      and manager.status = 'active'
      and manager.role in ('owner', 'admin')
      and target.user_id = target_user_id
      and target.status = 'active'
  );
$$;

revoke all on function private.is_community_member(uuid) from public, anon;
revoke all on function private.has_community_role(uuid, text[]) from public, anon;
revoke all on function private.shares_community(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_community_member(uuid) to authenticated;
grant execute on function private.has_community_role(uuid, text[]) to authenticated;
grant execute on function private.shares_community(uuid) to authenticated;
revoke all on function private.can_manage_community_user(uuid) from public, anon;
grant execute on function private.can_manage_community_user(uuid) to authenticated;

-- Extrae el tenant de una ruta sin fallar con archivos heredados.
create or replace function private.storage_community_id(object_name text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when split_part(object_name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then split_part(object_name, '/', 1)::uuid
    else null
  end;
$$;

revoke all on function private.storage_community_id(text) from public, anon;
grant execute on function private.storage_community_id(text) to authenticated;

create or replace function public.create_community(p_name text, p_slug text default null)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_id uuid;
  clean_name text := left(trim(p_name), 120);
  clean_slug text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if clean_name is null or clean_name = '' then
    raise exception 'Community name is required';
  end if;

  clean_slug := trim(both '-' from regexp_replace(lower(coalesce(nullif(trim(p_slug), ''), clean_name)), '[^a-z0-9]+', '-', 'g'));
  if clean_slug = '' then clean_slug := 'comunidad'; end if;
  clean_slug := left(clean_slug, 70) || '-' || substr(gen_random_uuid()::text, 1, 8);

  insert into public.communities (owner_id, slug, name, settings)
  values (
    (select auth.uid()),
    clean_slug,
    clean_name,
    jsonb_build_object(
      'nombre', clean_name,
      'tagline', 'Aquí va la frase principal de tu comunidad',
      'subtitulo', 'Aquí va un subtítulo que explique de qué trata este espacio',
      'dominio', 'Aquí va el enlace de tu comunidad',
      'descripcion', 'Aquí va la descripción de tu comunidad.',
      'banner', '/community-banner.svg',
      'logo', '/community-logo.svg',
      'colorPrimario', '#0f172a',
      'nombreAula', 'Recursos',
      'nombreMiembros', 'Miembros',
      'llamadaAccion', 'Unirse a la comunidad',
      'tituloBienvenida', 'Aquí va el título de bienvenida',
      'textoBienvenida', 'Aquí va el mensaje de bienvenida.',
      'tituloAcerca', 'Aquí va el título de la sección Acerca de',
      'filosofia', 'Aquí va el propósito de tu comunidad.',
      'beneficios', jsonb_build_array('Aquí va el primer beneficio', 'Aquí va el segundo beneficio', 'Aquí va el tercer beneficio')
    )
  ) returning id into new_id;

  insert into public.community_members (community_id, user_id, role)
  values (new_id, (select auth.uid()), 'owner');

  return new_id;
end;
$$;

revoke all on function public.create_community(text, text) from public, anon;
grant execute on function public.create_community(text, text) to authenticated;

-- Añade el tenant a todas las tablas que almacenan contenido comunitario.
alter table public.posts add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.comments add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.reactions add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.categories add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.courses add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.modules add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.lessons add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.lesson_progress add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.events add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.notifications add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.point_transactions add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.direct_messages add column if not exists community_id uuid references public.communities(id) on delete cascade;
alter table public.xp_awards add column if not exists community_id uuid references public.communities(id) on delete cascade;

do $$
declare
  first_community_id uuid;
  admin_user_id uuid;
  initial_settings jsonb;
begin
  select id into admin_user_id from auth.users where lower(email) = lower('agomez87@gmail.com') limit 1;
  if admin_user_id is null then raise exception 'Initial administrator was not found'; end if;

  select coalesce((bio::jsonb)->'__community_meta__', '{}'::jsonb)
    into initial_settings
  from public.profiles
  where id = admin_user_id and bio is not null and left(ltrim(bio), 1) = '{';

  select id into first_community_id from public.communities where owner_id = admin_user_id order by created_at limit 1;
  if first_community_id is null then
    insert into public.communities (owner_id, slug, name, settings)
    values (
      admin_user_id,
      'mi-comunidad-' || substr(gen_random_uuid()::text, 1, 8),
      coalesce(initial_settings->>'nombre', 'Aquí va el nombre de tu comunidad'),
      coalesce(initial_settings, '{}'::jsonb)
    ) returning id into first_community_id;
  end if;

  insert into public.community_members (community_id, user_id, role)
  values (first_community_id, admin_user_id, 'owner')
  on conflict (community_id, user_id) do update set role = 'owner', status = 'active';

  update public.posts set community_id = first_community_id where community_id is null;
  update public.comments set community_id = first_community_id where community_id is null;
  update public.reactions set community_id = first_community_id where community_id is null;
  update public.categories set community_id = first_community_id where community_id is null;
  update public.courses set community_id = first_community_id where community_id is null;
  update public.modules set community_id = first_community_id where community_id is null;
  update public.lessons set community_id = first_community_id where community_id is null;
  update public.lesson_progress set community_id = first_community_id where community_id is null;
  update public.events set community_id = first_community_id where community_id is null;
  update public.notifications set community_id = first_community_id where community_id is null;
  update public.point_transactions set community_id = first_community_id where community_id is null;
  update public.direct_messages set community_id = first_community_id where community_id is null;
  update public.xp_awards set community_id = first_community_id where community_id is null;
end $$;

alter table public.posts alter column community_id set not null;
alter table public.comments alter column community_id set not null;
alter table public.reactions alter column community_id set not null;
alter table public.categories alter column community_id set not null;
alter table public.courses alter column community_id set not null;
alter table public.modules alter column community_id set not null;
alter table public.lessons alter column community_id set not null;
alter table public.lesson_progress alter column community_id set not null;
alter table public.events alter column community_id set not null;
alter table public.notifications alter column community_id set not null;
alter table public.point_transactions alter column community_id set not null;
alter table public.direct_messages alter column community_id set not null;
alter table public.xp_awards alter column community_id set not null;

-- Distintas comunidades pueden reutilizar el mismo slug.
alter table public.categories drop constraint if exists categories_slug_key;
alter table public.courses drop constraint if exists courses_slug_key;
alter table public.categories add constraint categories_community_slug_key unique (community_id, slug);
alter table public.courses add constraint courses_community_slug_key unique (community_id, slug);
alter table public.xp_awards drop constraint if exists xp_awards_user_id_action_key_key;
alter table public.xp_awards add constraint xp_awards_community_user_action_key_key unique (community_id, user_id, action_key);

-- La recompensa pertenece a la comunidad activa, no al usuario de forma global.
drop function if exists public.award_my_xp(integer, text, text);
create function public.award_my_xp(p_amount integer, p_reason text, p_action_key text, p_community_id uuid)
returns table(xp integer, nivel integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id text := (select auth.uid())::text;
  expected_amount integer;
  inserted_count integer;
begin
  if current_user_id is null or not private.is_community_member(p_community_id) then
    raise exception 'Se requiere pertenecer a la comunidad';
  end if;
  expected_amount := case p_reason
    when 'Publicar en la comunidad' then 15
    when 'Dar Me Gusta a una publicación' then 5
    when 'Votar en encuesta' then 10
    when 'Comentar en una publicación' then 10
    when 'Dar Me Gusta a un comentario' then 3
    when 'Lección completada en el Aula' then 25
    when 'Crear nuevo curso' then 50
    when 'Confirmar asistencia a sesión en vivo' then 15
    when 'Enviar mensaje directo' then 5
    else null
  end;
  if expected_amount is null or p_amount <> expected_amount then raise exception 'Recompensa de XP no permitida'; end if;
  if p_reason = 'Crear nuevo curso' and not private.has_community_role(p_community_id, array['owner','admin']) then
    raise exception 'Solo un administrador puede recibir XP por crear cursos';
  end if;
  if p_action_key is null or char_length(trim(p_action_key)) < 3 or char_length(p_action_key) > 200 then
    raise exception 'Identificador de acción inválido';
  end if;
  if coalesce((select sum(a.amount) from public.xp_awards a where a.community_id=p_community_id and a.user_id=current_user_id and a.created_at >= date_trunc('day', now())),0) + p_amount > 200 then
    raise exception 'Límite diario de XP alcanzado';
  end if;
  insert into public.xp_awards(community_id,user_id,action_key,reason,amount)
  values(p_community_id,current_user_id,p_action_key,p_reason,p_amount)
  on conflict(community_id,user_id,action_key) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count > 0 then
    perform set_config('app.awarding_xp','true',true);
    update public.profiles p set
      xp=greatest(coalesce(p.xp,0)+p_amount,0), points=greatest(coalesce(p.xp,0)+p_amount,0),
      nivel=case when coalesce(p.xp,0)+p_amount>=7500 then 9 when coalesce(p.xp,0)+p_amount>=5000 then 8 when coalesce(p.xp,0)+p_amount>=3500 then 7 when coalesce(p.xp,0)+p_amount>=2000 then 6 when coalesce(p.xp,0)+p_amount>=1000 then 5 when coalesce(p.xp,0)+p_amount>=500 then 4 when coalesce(p.xp,0)+p_amount>=250 then 3 when coalesce(p.xp,0)+p_amount>=100 then 2 else 1 end,
      level=case when coalesce(p.xp,0)+p_amount>=7500 then 9 when coalesce(p.xp,0)+p_amount>=5000 then 8 when coalesce(p.xp,0)+p_amount>=3500 then 7 when coalesce(p.xp,0)+p_amount>=2000 then 6 when coalesce(p.xp,0)+p_amount>=1000 then 5 when coalesce(p.xp,0)+p_amount>=500 then 4 when coalesce(p.xp,0)+p_amount>=250 then 3 when coalesce(p.xp,0)+p_amount>=100 then 2 else 1 end,
      updated_at=now()
    where p.id::text=current_user_id;
  end if;
  return query select p.xp,p.nivel from public.profiles p where p.id::text=current_user_id;
end;
$$;
revoke all on function public.award_my_xp(integer,text,text,uuid) from public, anon;
grant execute on function public.award_my_xp(integer,text,text,uuid) to authenticated;

create index if not exists posts_community_created_idx on public.posts(community_id, created_at desc);
create index if not exists comments_community_post_idx on public.comments(community_id, post_id);
create index if not exists reactions_community_post_idx on public.reactions(community_id, post_id);
create index if not exists categories_community_position_idx on public.categories(community_id, position);
create index if not exists courses_community_position_idx on public.courses(community_id, position);
create index if not exists modules_community_course_idx on public.modules(community_id, course_id);
create index if not exists lessons_community_module_idx on public.lessons(community_id, module_id);
create index if not exists lesson_progress_community_user_idx on public.lesson_progress(community_id, user_id);
create index if not exists events_community_starts_idx on public.events(community_id, starts_at);
create index if not exists notifications_community_user_idx on public.notifications(community_id, user_id, created_at desc);
create index if not exists point_transactions_community_user_idx on public.point_transactions(community_id, user_id, created_at desc);
create index if not exists direct_messages_community_sender_idx on public.direct_messages(community_id, remitente_id, created_at desc);
create index if not exists direct_messages_community_recipient_idx on public.direct_messages(community_id, destinatario_id, created_at desc);
create index if not exists xp_awards_community_user_idx on public.xp_awards(community_id, user_id, created_at desc);

alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.profiles enable row level security;

-- Retira políticas anteriores de las tablas multiinquilino para que no exista
-- ninguna ruta que omita community_id.
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'communities','community_members','profiles','posts','comments','reactions','categories',
    'courses','modules','lessons','lesson_progress','events','notifications',
    'point_transactions','direct_messages','xp_awards'
  ] loop
    for policy_name in
      select pol.polname
      from pg_policy pol
      join pg_class cls on cls.oid = pol.polrelid
      join pg_namespace ns on ns.oid = cls.relnamespace
      where ns.nspname = 'public' and cls.relname = table_name
    loop
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    end loop;
  end loop;
end $$;

create policy communities_public_or_member_select on public.communities
for select to anon, authenticated
using (is_public or (select private.is_community_member(id)) or owner_id = (select auth.uid()));
create policy communities_owner_insert on public.communities
for insert to authenticated with check (owner_id = (select auth.uid()));
create policy communities_admin_update on public.communities
for update to authenticated
using (owner_id = (select auth.uid()) or (select private.has_community_role(id, array['owner','admin'])))
with check (owner_id = (select auth.uid()) or (select private.has_community_role(id, array['owner','admin'])));
create policy communities_owner_delete on public.communities
for delete to authenticated using (owner_id = (select auth.uid()));

create policy community_members_member_select on public.community_members
for select to authenticated using ((select private.is_community_member(community_id)));
create policy community_members_owner_bootstrap_insert on public.community_members
for insert to authenticated with check (
  (user_id = (select auth.uid()) and exists (
    select 1 from public.communities c where c.id = community_id and c.owner_id = (select auth.uid())
  )) or (select private.has_community_role(community_id, array['owner','admin']))
);
create policy community_members_admin_update on public.community_members
for update to authenticated
using ((select private.has_community_role(community_id, array['owner','admin'])))
with check ((select private.has_community_role(community_id, array['owner','admin'])));
create policy community_members_admin_delete on public.community_members
for delete to authenticated using (
  (user_id = (select auth.uid()) and role <> 'owner')
  or (select private.has_community_role(community_id, array['owner','admin']))
);

create policy profiles_shared_select on public.profiles
for select to authenticated using ((select private.shares_community(id)));
create policy profiles_self_insert on public.profiles
for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_self_update on public.profiles
for update to authenticated
using (id = (select auth.uid()) or (select private.can_manage_community_user(id)))
with check (id = (select auth.uid()) or (select private.can_manage_community_user(id)));

-- Lectura: solo miembros. Escritura administrativa: owner/admin/moderator.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['categories','courses','modules','lessons','events'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select private.is_community_member(community_id)))',
      table_name || '_tenant_select', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.has_community_role(community_id, array[''owner'',''admin'',''moderator''])))',
      table_name || '_tenant_insert', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.has_community_role(community_id, array[''owner'',''admin'',''moderator'']))) with check ((select private.has_community_role(community_id, array[''owner'',''admin'',''moderator''])))',
      table_name || '_tenant_update', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.has_community_role(community_id, array[''owner'',''admin'',''moderator''])))',
      table_name || '_tenant_delete', table_name
    );
  end loop;
end $$;

alter table public.posts enable row level security;
create policy posts_tenant_select on public.posts for select to authenticated using ((select private.is_community_member(community_id)));
create policy posts_member_insert on public.posts for insert to authenticated with check (author_id = (select auth.uid()) and (select private.is_community_member(community_id)));
create policy posts_author_update on public.posts for update to authenticated
using (author_id = (select auth.uid()) or (select private.has_community_role(community_id, array['owner','admin','moderator'])))
with check ((select private.is_community_member(community_id)));
create policy posts_author_delete on public.posts for delete to authenticated
using (author_id = (select auth.uid()) or (select private.has_community_role(community_id, array['owner','admin','moderator'])));

alter table public.comments enable row level security;
create policy comments_tenant_select on public.comments for select to authenticated using ((select private.is_community_member(community_id)));
create policy comments_member_insert on public.comments for insert to authenticated with check (author_id = (select auth.uid()) and (select private.is_community_member(community_id)));
create policy comments_author_update on public.comments for update to authenticated
using (author_id = (select auth.uid()) or (select private.has_community_role(community_id, array['owner','admin','moderator'])))
with check ((select private.is_community_member(community_id)));
create policy comments_author_delete on public.comments for delete to authenticated
using (author_id = (select auth.uid()) or (select private.has_community_role(community_id, array['owner','admin','moderator'])));

alter table public.reactions enable row level security;
create policy reactions_tenant_select on public.reactions for select to authenticated using ((select private.is_community_member(community_id)));
create policy reactions_self_insert on public.reactions for insert to authenticated with check (user_id = (select auth.uid()) and (select private.is_community_member(community_id)));
create policy reactions_self_delete on public.reactions for delete to authenticated using (user_id = (select auth.uid()) and (select private.is_community_member(community_id)));

alter table public.lesson_progress enable row level security;
create policy lesson_progress_tenant_select on public.lesson_progress for select to authenticated using ((select private.is_community_member(community_id)));
create policy lesson_progress_self_insert on public.lesson_progress for insert to authenticated with check (user_id = (select auth.uid()) and (select private.is_community_member(community_id)));
create policy lesson_progress_self_update on public.lesson_progress for update to authenticated
using (user_id = (select auth.uid()) and (select private.is_community_member(community_id)))
with check (user_id = (select auth.uid()) and (select private.is_community_member(community_id)));

alter table public.notifications enable row level security;
create policy notifications_self_select on public.notifications for select to authenticated using (user_id = (select auth.uid()) and (select private.is_community_member(community_id)));
create policy notifications_admin_insert on public.notifications for insert to authenticated with check ((select private.has_community_role(community_id, array['owner','admin','moderator'])));
create policy notifications_self_update on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter table public.point_transactions enable row level security;
create policy point_transactions_self_select on public.point_transactions for select to authenticated using (user_id = (select auth.uid()) and (select private.is_community_member(community_id)));

alter table public.xp_awards enable row level security;
create policy xp_awards_self_select on public.xp_awards for select to authenticated using (user_id = (select auth.uid())::text and (select private.is_community_member(community_id)));

alter table public.direct_messages enable row level security;
create policy direct_messages_participant_select on public.direct_messages for select to authenticated
using ((remitente_id = (select auth.uid())::text or destinatario_id = (select auth.uid())::text) and (select private.is_community_member(community_id)));
create policy direct_messages_sender_insert on public.direct_messages for insert to authenticated
with check (remitente_id = (select auth.uid())::text and (select private.is_community_member(community_id)));
create policy direct_messages_participant_delete on public.direct_messages for delete to authenticated
using ((remitente_id = (select auth.uid())::text or destinatario_id = (select auth.uid())::text) and (select private.is_community_member(community_id)));

grant select, insert, update, delete on public.communities, public.community_members to authenticated;
grant select on public.communities to anon;

-- Los archivos se guardan como <community_id>/<carpeta>/<archivo>.
drop policy if exists "Subida autenticada" on storage.objects;
drop policy if exists "Eliminar archivos propios" on storage.objects;
drop policy if exists community_media_tenant_insert on storage.objects;
drop policy if exists community_media_tenant_update on storage.objects;
drop policy if exists community_media_tenant_delete on storage.objects;
create policy community_media_tenant_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'community_media'
  and (select private.is_community_member(private.storage_community_id(name)))
);
create policy community_media_tenant_update on storage.objects for update to authenticated
using (bucket_id = 'community_media' and owner_id = (select auth.uid())::text)
with check (bucket_id = 'community_media' and (select private.is_community_member(private.storage_community_id(name))));
create policy community_media_tenant_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'community_media'
  and (
    owner_id = (select auth.uid())::text
    or (select private.has_community_role(private.storage_community_id(name), array['owner','admin']))
  )
);
