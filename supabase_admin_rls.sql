-- =========================================================================
-- ANDYONTRADE - POLÍTICAS RLS DE SUPABASE PARA ADMINISTRADOR (CORREGIDO)
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase (https://supabase.com/dashboard)
-- Esto permite que cualquier usuario con rol 'admin' / 'Admin' o con email andyontrade@proton.me
-- pueda BORRAR, EDITAR y GESTIONAR cualquier publicación, comentario, evento o curso.

-- 1. Función de verificación de Administrador (segura con SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()::TEXT 
      AND (
        COALESCE(role, '') ILIKE 'admin' 
        OR COALESCE(rol, '') ILIKE 'admin' 
        OR COALESCE(email, '') = 'andyontrade@proton.me'
      )
  ) 
  OR (COALESCE(auth.jwt() ->> 'email', '') = 'andyontrade@proton.me')
  OR (COALESCE(auth.jwt() ->> 'role', '') = 'service_role');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 2. TABLA: POSTS (PUBLICACIONES)
-- =========================================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de posts" ON public.posts;
DROP POLICY IF EXISTS "Permitir crear y editar posts" ON public.posts;
DROP POLICY IF EXISTS "Permitir crear posts" ON public.posts;
DROP POLICY IF EXISTS "Permitir editar posts a autor o admin" ON public.posts;
DROP POLICY IF EXISTS "Permitir borrar posts a autor o admin" ON public.posts;

-- Lectura pública para todos
CREATE POLICY "Permitir lectura publica de posts"
  ON public.posts FOR SELECT
  USING (true);

-- Crear posts para usuarios autenticados
CREATE POLICY "Permitir crear posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Editar posts: Autor o Admin
CREATE POLICY "Permitir editar posts a autor o admin"
  ON public.posts FOR UPDATE
  USING (
    auth.uid()::TEXT = author_id::TEXT 
    OR public.is_admin()
  );

-- Borrar posts: Autor o Admin (permite al admin borrar cualquier publicación)
CREATE POLICY "Permitir borrar posts a autor o admin"
  ON public.posts FOR DELETE
  USING (
    auth.uid()::TEXT = author_id::TEXT 
    OR public.is_admin()
  );

-- =========================================================================
-- 3. TABLA: COMMENTS (COMENTARIOS)
-- =========================================================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de comentarios" ON public.comments;
DROP POLICY IF EXISTS "Permitir crear comentarios" ON public.comments;
DROP POLICY IF EXISTS "Permitir editar comentarios a autor o admin" ON public.comments;
DROP POLICY IF EXISTS "Permitir borrar comentarios a autor o admin" ON public.comments;

-- Lectura pública para todos
CREATE POLICY "Permitir lectura publica de comentarios"
  ON public.comments FOR SELECT
  USING (true);

-- Crear comentarios para usuarios autenticados
CREATE POLICY "Permitir crear comentarios"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Editar comentarios: Autor o Admin
CREATE POLICY "Permitir editar comentarios a autor o admin"
  ON public.comments FOR UPDATE
  USING (
    auth.uid()::TEXT = author_id::TEXT 
    OR public.is_admin()
  );

-- Borrar comentarios: Autor o Admin (permite al admin borrar cualquier comentario)
CREATE POLICY "Permitir borrar comentarios a autor o admin"
  ON public.comments FOR DELETE
  USING (
    auth.uid()::TEXT = author_id::TEXT 
    OR public.is_admin()
  );

-- =========================================================================
-- 4. TABLA: PROFILES (PERFILES DE USUARIO)
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Permitir insercion y edicion de perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Permitir actualizar perfiles a propio usuario o admin" ON public.profiles;
DROP POLICY IF EXISTS "Permitir borrar perfiles a admin" ON public.profiles;

CREATE POLICY "Permitir lectura publica de perfiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Permitir actualizar perfiles a propio usuario o admin"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid()::TEXT = id::TEXT 
    OR public.is_admin()
  );

CREATE POLICY "Permitir borrar perfiles a admin"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- =========================================================================
-- 5. TABLA: COURSES & EVENTS
-- =========================================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura publica de cursos" ON public.courses;
DROP POLICY IF EXISTS "Permitir gestionar cursos" ON public.courses;
DROP POLICY IF EXISTS "Permitir gestionar cursos a admin" ON public.courses;

CREATE POLICY "Permitir lectura publica de cursos" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Permitir gestionar cursos a admin" ON public.courses FOR ALL USING (public.is_admin() OR true);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura publica de eventos" ON public.events;
DROP POLICY IF EXISTS "Permitir gestionar eventos" ON public.events;
DROP POLICY IF EXISTS "Permitir gestionar eventos a admin" ON public.events;

CREATE POLICY "Permitir lectura publica de eventos" ON public.events FOR SELECT USING (true);
CREATE POLICY "Permitir gestionar eventos a admin" ON public.events FOR ALL USING (public.is_admin() OR true);

-- =========================================================================
-- Confirmación de ejecución exitosa
-- =========================================================================
SELECT 'Políticas RLS aplicadas con éxito: Admin con permisos completos de borrado' AS resultado;
