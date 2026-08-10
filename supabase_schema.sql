-- =========================================================================
-- ANDYONTRADE - ESQUEMA DE BASE DE DATOS SUPABASE / POSTGRESQL (1-CLIC)
-- =========================================================================
-- Copia y pega este script en el SQL Editor de tu proyecto en https://supabase.com

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar TEXT NOT NULL,
  nivel INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  racha_dias INTEGER DEFAULT 1,
  rol TEXT DEFAULT 'Miembro', -- 'Admin', 'Moderador', 'VIP', 'Miembro Pro', 'Miembro'
  bio TEXT,
  full_name TEXT,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  role TEXT DEFAULT 'member',
  twitter TEXT,
  linkedin TEXT,
  website TEXT,
  fecha_registro TEXT DEFAULT 'Enero 2026',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE INSIGNIAS
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  usuario_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  icono TEXT NOT NULL,
  color TEXT DEFAULT 'from-amber-500 to-yellow-300',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE PUBLICACIONES DEL FEED
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  author_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  is_pinned BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  usuarios_liked TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE COMENTARIOS
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  usuarios_liked TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA DE ENCUESTAS
CREATE TABLE IF NOT EXISTS public.polls (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  total_votos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE OPCIONES DE ENCUESTAS
CREATE TABLE IF NOT EXISTS public.poll_options (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  poll_id TEXT REFERENCES public.polls(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  votos INTEGER DEFAULT 0,
  usuarios_votaron TEXT[] DEFAULT '{}'
);

-- 8. TABLA DE CURSOS (CLASSROOM)
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  required_level INTEGER DEFAULT 1,
  categoria TEXT DEFAULT 'Análisis Técnico',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLA DE MÓDULOS DE CURSO
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  orden INTEGER DEFAULT 0
);

-- 10. TABLA DE LECCIONES
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  duracion TEXT DEFAULT '15:00 min',
  video_url TEXT NOT NULL,
  resumen TEXT,
  orden INTEGER DEFAULT 0
);

-- 11. TABLA DE CHECKLIST DE LECCIÓN (ACTION ITEMS)
CREATE TABLE IF NOT EXISTS public.lesson_tasks (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  texto TEXT NOT NULL
);

-- 12. TABLA DE PROGRESO DE LECCIÓN POR USUARIO
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  usuario_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  completada BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, lesson_id)
);

-- 13. TABLA DE EVENTOS EN VIVO
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  anfitrion_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion TEXT DEFAULT '60 min',
  tipo TEXT DEFAULT 'Llamada en Vivo',
  link_reunion TEXT NOT NULL,
  banner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. TABLA DE RSVP DE EVENTOS
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  usuario_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, usuario_id)
);

-- 15. TABLA DE MENSAJES DIRECTOS (CHAT EN TIEMPO REAL)
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  remitente_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  destinatario_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. TABLA DE AJUSTES GENERALES DE LA COMUNIDAD
CREATE TABLE IF NOT EXISTS public.community_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_settings',
  nombre TEXT DEFAULT 'andyontrade',
  tagline TEXT DEFAULT 'La Comunidad N°1 de Trading, Análisis Técnico y Cuentas de Fondeo',
  descripcion TEXT DEFAULT 'Aprende Price Action sin indicadores, opera en vivo junto a Andy, supera tus pruebas de fondeo y forma parte de una tribu de traders rentables.',
  banner TEXT DEFAULT 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200',
  logo TEXT DEFAULT '📈',
  precio_mensual NUMERIC DEFAULT 49,
  precio_anual NUMERIC DEFAULT 399
);

-- =========================================================================
-- HABILITAR SEGURIDAD POR FILAS (ROW LEVEL SECURITY - RLS)
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de lectura y escritura para pruebas rápidas
-- Las politicas de produccion se mantienen en supabase_admin_rls.sql.
-- No se crean politicas abiertas de prueba: RLS deniega el acceso por defecto
-- hasta que se aplica ese archivo inmediatamente despues del esquema.

-- =========================================================================
-- DATOS SEMILLA INICIALES (SEED DATA ANDYONTRADE)
-- =========================================================================
INSERT INTO public.profiles (id, nombre, nickname, avatar, nivel, xp, racha_dias, rol, bio, twitter)
VALUES 
  ('usr-1', 'Andy On Trade', '@andyontrade', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250', 6, 5450, 18, 'Admin', 'Trader Profesional de Forex & Crypto. Fundador de andyontrade. Ayudando a traders a pasar cuentas de fondeo con Price Action.', 'https://twitter.com/andyontrade'),
  ('usr-2', 'Valeria FX', '@valeria_trader', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250', 5, 3420, 14, 'Moderador', 'Trader de Forex (EUR/USD & GBP/JPY). Especialista en zonas de oferta/demanda y liquidez previa a New York.', 'https://twitter.com'),
  ('usr-3', 'Carlos Scalper', '@carlos_scalp', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', 4, 1890, 9, 'VIP', 'Scalper de Nasdaq & Bitcoin. Operando en gráfico de 1 min y 5 min.', 'https://twitter.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.community_settings (id, nombre, tagline, descripcion, logo, precio_mensual, precio_anual)
VALUES ('main_settings', 'andyontrade', 'La Comunidad N°1 de Trading, Análisis Técnico y Cuentas de Fondeo', 'Aprende Price Action sin indicadores, opera en vivo junto a Andy, supera tus pruebas de fondeo y forma parte de una tribu de traders rentables.', '📈', 49, 399)
ON CONFLICT (id) DO NOTHING;
