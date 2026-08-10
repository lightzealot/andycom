-- Reparacion puntual de XP: elimina solamente el trigger legado que bloquea
-- la RPC award_my_xp. No modifica politicas RLS, tablas ni otros triggers.
DO $$
DECLARE legacy_trigger record;
BEGIN
  FOR legacy_trigger IN
    SELECT t.tgname
    FROM pg_trigger AS t
    JOIN pg_proc AS p ON p.oid = t.tgfoid
    WHERE t.tgrelid = 'public.profiles'::regclass
      AND NOT t.tgisinternal
      AND position(
        'No puedes modificar rol, nivel, puntos ni estado desde el cliente.'
        IN pg_get_functiondef(p.oid)
      ) > 0
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON public.profiles',
      legacy_trigger.tgname
    );
  END LOOP;
END;
$$;

-- Confirma que el trigger vigente reconoce las escrituras internas de XP.
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(current_setting('app.awarding_xp', true), '') <> 'true'
    AND NOT public.is_admin() AND (
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
CREATE TRIGGER protect_profile_privileges
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

SELECT 'Trigger legado de XP eliminado; proteccion vigente reinstalada' AS resultado;
