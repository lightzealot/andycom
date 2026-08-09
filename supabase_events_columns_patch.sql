-- Parche de compatibilidad de columnas para la tabla public.events
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS titulo TEXT,
  ADD COLUMN IF NOT EXISTS descripcion TEXT,
  ADD COLUMN IF NOT EXISTS anfitrion_id TEXT,
  ADD COLUMN IF NOT EXISTS fecha_inicio TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS duracion TEXT,
  ADD COLUMN IF NOT EXISTS tipo TEXT,
  ADD COLUMN IF NOT EXISTS link_reunion TEXT,
  ADD COLUMN IF NOT EXISTS banner TEXT,
  ADD COLUMN IF NOT EXISTS rsvp_usuarios JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS host_id TEXT,
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS duration TEXT,
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS rsvp_users JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Normalización mínima para columnas principales en español
UPDATE public.events
SET
  titulo = COALESCE(titulo, title, 'Sesion en vivo'),
  descripcion = COALESCE(descripcion, description, ''),
  anfitrion_id = COALESCE(anfitrion_id, host_id),
  created_by = COALESCE(created_by, anfitrion_id, host_id, '155d43f8-9a80-4e5e-8713-3fc52708c1d0'),
  fecha_inicio = COALESCE(fecha_inicio, start_time, NOW()),
  starts_at = COALESCE(starts_at, fecha_inicio, start_time, NOW()),
  ends_at = COALESCE(
    ends_at,
    starts_at + INTERVAL '60 minutes',
    fecha_inicio + INTERVAL '60 minutes',
    start_time + INTERVAL '60 minutes',
    NOW() + INTERVAL '60 minutes'
  ),
  duracion = COALESCE(duracion, duration, '60 min'),
  tipo = COALESCE(tipo, event_type, 'Llamada en Vivo'),
  link_reunion = COALESCE(link_reunion, meeting_url, 'https://zoom.us/j/andyontrade-live'),
  banner = COALESCE(banner, cover_url, '/raxen-banner.png'),
  rsvp_usuarios = COALESCE(rsvp_usuarios, rsvp_users, '[]'::jsonb),
  updated_at = COALESCE(updated_at, NOW());

-- Opcional: asegurar defaults para nuevas filas
ALTER TABLE public.events
  ALTER COLUMN duracion SET DEFAULT '60 min',
  ALTER COLUMN tipo SET DEFAULT 'Llamada en Vivo',
  ALTER COLUMN banner SET DEFAULT '/raxen-banner.png',
  ALTER COLUMN rsvp_usuarios SET DEFAULT '[]'::jsonb,
  ALTER COLUMN created_by SET DEFAULT '155d43f8-9a80-4e5e-8713-3fc52708c1d0',
  ALTER COLUMN ends_at SET DEFAULT (NOW() + INTERVAL '60 minutes'),
  ALTER COLUMN updated_at SET DEFAULT NOW();

SELECT 'Patch events aplicado' AS resultado;
