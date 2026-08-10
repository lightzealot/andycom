-- Politicas RLS de produccion para Raxen Capital.
-- Ejecutar con una cuenta propietaria del esquema.

-- Tablas funcionales requeridas por el frontend. En proyectos existentes no
-- modifica las tablas; en instalaciones incompletas evita fallos 42P01.
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'General',
  is_pinned boolean DEFAULT false,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  cover_url text,
  required_level integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  description text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  duration text DEFAULT '60 min',
  event_type text DEFAULT 'Llamada en Vivo',
  meeting_url text,
  cover_url text,
  rsvp_users jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- La mensajeria es usada por el frontend, pero no estaba creada en algunas
-- instalaciones antiguas. TEXT en los participantes mantiene compatibilidad
-- tanto con profiles.id UUID como con el esquema historico que usaba TEXT.
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remitente_id text NOT NULL,
  destinatario_id text NOT NULL,
  texto text NOT NULL,
  leido boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Contrato canonico utilizado por dbService.ts. ADD COLUMN IF NOT EXISTS hace
-- segura la ejecucion sobre proyectos antiguos y evita errores de cache de
-- PostgREST por columnas ausentes.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nivel integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rol text DEFAULT 'Miembro',
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS required_level integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS duration text DEFAULT '60 min',
  ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'Llamada en Vivo',
  ADD COLUMN IF NOT EXISTS meeting_url text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS rsvp_users jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id::text = (SELECT auth.uid())::text
      AND lower(COALESCE(p.rol, '')) = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Impide que un usuario se conceda rol, XP o nivel al editar su perfil.
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT public.is_admin() AND (
    NEW.rol IS DISTINCT FROM OLD.rol OR
    NEW.role IS DISTINCT FROM OLD.role OR
    NEW.xp IS DISTINCT FROM OLD.xp OR
    NEW.points IS DISTINCT FROM OLD.points OR
    NEW.nivel IS DISTINCT FROM OLD.nivel OR
    NEW.level IS DISTINCT FROM OLD.level
  ) THEN
    RAISE EXCEPTION 'No esta permitido modificar rol, XP o nivel';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_profile_privileges() FROM PUBLIC;
DROP TRIGGER IF EXISTS protect_profile_privileges ON public.profiles;
CREATE TRIGGER protect_profile_privileges BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Activa RLS en tablas opcionales solamente cuando existen. Sin politicas
-- quedan cerradas por defecto hasta que se implemente su funcionalidad.
DO $$
DECLARE optional_table text;
BEGIN
  FOREACH optional_table IN ARRAY ARRAY[
    'badges', 'polls', 'poll_options', 'modules', 'lessons',
    'lesson_tasks', 'user_lesson_progress', 'event_rsvps',
    'community_settings'
  ] LOOP
    IF to_regclass(format('public.%I', optional_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', optional_table);
    END IF;
  END LOOP;
END;
$$;

-- Elimina cualquier politica heredada, incluso si fue creada con un nombre
-- distinto en una version anterior. En PostgreSQL las politicas son aditivas:
-- una sola politica antigua USING (true) anularia todas las restricciones nuevas.
DO $$
DECLARE existing_policy record;
BEGIN
  FOR existing_policy IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'posts', 'comments', 'courses', 'events', 'direct_messages'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS "Permitir lectura publica de perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Permitir insercion y edicion de perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Permitir actualizar perfiles a propio usuario o admin" ON public.profiles;
DROP POLICY IF EXISTS "Permitir borrar perfiles a admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid())::text = id::text AND COALESCE(rol, 'Miembro') = 'Miembro');
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE TO authenticated
USING ((SELECT auth.uid())::text = id::text OR public.is_admin())
WITH CHECK ((SELECT auth.uid())::text = id::text OR public.is_admin());
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Permitir lectura publica de posts" ON public.posts;
DROP POLICY IF EXISTS "Permitir crear y editar posts" ON public.posts;
DROP POLICY IF EXISTS "Permitir crear posts" ON public.posts;
DROP POLICY IF EXISTS "Permitir editar posts a autor o admin" ON public.posts;
DROP POLICY IF EXISTS "Permitir borrar posts a autor o admin" ON public.posts;
DROP POLICY IF EXISTS "posts_select_authenticated" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own_or_admin" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_own_or_admin" ON public.posts;
CREATE POLICY "posts_select_authenticated" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid())::text = author_id::text);
CREATE POLICY "posts_update_own_or_admin" ON public.posts FOR UPDATE TO authenticated
USING ((SELECT auth.uid())::text = author_id::text OR public.is_admin())
WITH CHECK ((SELECT auth.uid())::text = author_id::text OR public.is_admin());
CREATE POLICY "posts_delete_own_or_admin" ON public.posts FOR DELETE TO authenticated
USING ((SELECT auth.uid())::text = author_id::text OR public.is_admin());

DROP POLICY IF EXISTS "Permitir lectura publica de comentarios" ON public.comments;
DROP POLICY IF EXISTS "Permitir crear comentarios" ON public.comments;
DROP POLICY IF EXISTS "Permitir editar comentarios a autor o admin" ON public.comments;
DROP POLICY IF EXISTS "Permitir borrar comentarios a autor o admin" ON public.comments;
DROP POLICY IF EXISTS "comments_select_authenticated" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;
DROP POLICY IF EXISTS "comments_update_own_or_admin" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own_or_admin" ON public.comments;
CREATE POLICY "comments_select_authenticated" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid())::text = author_id::text);
CREATE POLICY "comments_update_own_or_admin" ON public.comments FOR UPDATE TO authenticated
USING ((SELECT auth.uid())::text = author_id::text OR public.is_admin())
WITH CHECK ((SELECT auth.uid())::text = author_id::text OR public.is_admin());
CREATE POLICY "comments_delete_own_or_admin" ON public.comments FOR DELETE TO authenticated
USING ((SELECT auth.uid())::text = author_id::text OR public.is_admin());

DROP POLICY IF EXISTS "Permitir lectura publica de cursos" ON public.courses;
DROP POLICY IF EXISTS "Permitir gestionar cursos" ON public.courses;
DROP POLICY IF EXISTS "Permitir gestionar cursos a admin" ON public.courses;
DROP POLICY IF EXISTS "courses_select_authenticated" ON public.courses;
DROP POLICY IF EXISTS "courses_manage_admin" ON public.courses;
CREATE POLICY "courses_select_authenticated" ON public.courses FOR SELECT TO authenticated
USING (
  public.is_admin() OR COALESCE(required_level, 1) <= COALESCE((
    SELECT p.nivel FROM public.profiles AS p
    WHERE p.id::text = (SELECT auth.uid())::text
  ), 1)
);
CREATE POLICY "courses_manage_admin" ON public.courses FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Permitir lectura publica de eventos" ON public.events;
DROP POLICY IF EXISTS "Permitir gestionar eventos" ON public.events;
DROP POLICY IF EXISTS "Permitir gestionar eventos a admin" ON public.events;
DROP POLICY IF EXISTS "events_select_authenticated" ON public.events;
DROP POLICY IF EXISTS "events_manage_admin" ON public.events;
CREATE POLICY "events_select_authenticated" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_manage_admin" ON public.events FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Permitir gestionar mensajes" ON public.direct_messages;
DROP POLICY IF EXISTS "messages_select_participant" ON public.direct_messages;
DROP POLICY IF EXISTS "messages_insert_sender" ON public.direct_messages;
DROP POLICY IF EXISTS "messages_update_recipient" ON public.direct_messages;
DROP POLICY IF EXISTS "messages_delete_participant" ON public.direct_messages;
CREATE POLICY "messages_select_participant" ON public.direct_messages FOR SELECT TO authenticated
USING ((SELECT auth.uid())::text = remitente_id::text OR (SELECT auth.uid())::text = destinatario_id::text);
CREATE POLICY "messages_insert_sender" ON public.direct_messages FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid())::text = remitente_id::text);
CREATE POLICY "messages_update_recipient" ON public.direct_messages FOR UPDATE TO authenticated
USING ((SELECT auth.uid())::text = destinatario_id::text)
WITH CHECK ((SELECT auth.uid())::text = destinatario_id::text);
CREATE POLICY "messages_delete_participant" ON public.direct_messages FOR DELETE TO authenticated
USING ((SELECT auth.uid())::text = remitente_id::text OR (SELECT auth.uid())::text = destinatario_id::text);


-- Contrato de longitudes para texto introducido por usuarios. Se aplica solo
-- a columnas que existan, pues hay instalaciones con nombres ES y otras EN.
-- NOT VALID conserva filas historicas fuera de rango, pero protege escrituras nuevas.
DO $$
DECLARE
  item record;
  constraint_name text;
BEGIN
  FOR item IN
    SELECT * FROM (VALUES
      ('profiles','nombre',120), ('profiles','full_name',120),
      ('profiles','nickname',60), ('profiles','username',60),
      ('profiles','bio',20000),
      ('posts','titulo',200), ('posts','title',200),
      ('posts','contenido',20000), ('posts','content',20000),
      ('posts','categoria',80), ('posts','category',80),
      ('comments','contenido',5000), ('comments','content',5000),
      ('courses','titulo',200), ('courses','title',200),
      ('courses','descripcion',50000), ('courses','description',50000),
      ('events','titulo',200), ('events','title',200),
      ('events','descripcion',10000), ('events','description',10000),
      ('direct_messages','texto',5000)
    ) AS limits(table_name, column_name, max_length)
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = item.table_name
        AND column_name = item.column_name
    ) THEN
      constraint_name := format('input_%s_%s_length', item.table_name, item.column_name);
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = constraint_name
      ) THEN
        EXECUTE format(
          'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (char_length(%I) <= %s) NOT VALID',
          item.table_name, constraint_name, item.column_name, item.max_length
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

SELECT 'Politicas RLS seguras aplicadas' AS resultado;
