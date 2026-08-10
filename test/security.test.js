import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('las politicas RLS no contienen escrituras abiertas', async () => {
  const sql = await read('supabase_admin_rls.sql');
  assert.doesNotMatch(sql, /FOR\s+ALL\s+(?:TO\s+\w+\s+)?USING\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(sql, /public\.is_admin\(\)\s+OR\s+true/i);
  assert.match(sql, /messages_select_participant/);
  assert.match(sql, /protect_profile_privileges/);
  assert.doesNotMatch(sql, /auth\.uid\(\)\)\s*::text\s*=\s*id(?!::text)/);
  assert.match(sql, /p\.id::text\s*=\s*\(SELECT auth\.uid\(\)\)::text/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.direct_messages/);
  assert.match(sql, /information_schema\.columns/);
  assert.doesNotMatch(sql, /\bautor_id\b/);
  assert.match(sql, /ADD COLUMN IF NOT EXISTS author_id/);
  assert.match(sql, /FROM pg_policies/);
  assert.match(sql, /existing_policy\.policyname/);
});

test('el esquema inicial no reinstala politicas abiertas', async () => {
  const sql = await read('supabase_schema.sql');
  assert.doesNotMatch(sql, /FOR\s+ALL\s+USING\s*\(\s*true\s*\)/i);
});

test('la autenticacion no se restaura desde localStorage', async () => {
  const context = await read('src/context/AppContext.tsx');
  const app = await read('src/App.tsx');
  assert.doesNotMatch(context, /getItem\(['"]raxen_auth['"]\)/);
  assert.doesNotMatch(context, /getItem\(['"]raxen_usuario['"]\)/);
  assert.doesNotMatch(app, /raxen_auth/);
});

test('el registro rechaza claves cortas en vez de inventarlas', async () => {
  const auth = await read('src/services/authService.ts');
  assert.match(auth, /passwordFinal\.length < 8/);
  assert.doesNotMatch(auth, /generarPasswordTemporal|Math\.random/);
});

test('XP usa una RPC controlada y el registro muestra confirmacion de correo', async () => {
  const sql = await read('supabase_admin_rls.sql');
  const context = await read('src/context/AppContext.tsx');
  const registro = await read('src/components/Auth/RegistroModal.tsx');
  const authModal = await read('src/components/Auth/AuthModal.tsx');
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.award_my_xp/);
  assert.match(sql, /REVOKE ALL ON FUNCTION public\.award_my_xp/);
  assert.match(sql, /No puedes modificar rol, nivel, puntos ni estado desde el cliente\./);
  assert.match(sql, /DROP TRIGGER IF EXISTS %I ON public\.profiles/);
  assert.match(sql, /current_setting\('app\.awarding_xp', true\)/);
  assert.match(context, /dbService\.otorgarXP/);
  assert.doesNotMatch(context, /dbService\.guardarPerfil\(actualizado\)/);
  assert.match(registro, /res\.requiereConfirmacionEmail/);
  assert.match(registro, /Revisa tu correo/);
  assert.match(registro, /Debes confirmar tu cuenta antes de iniciar sesi/);
  assert.match(registro, /spam, correo no deseado o promociones/);
  assert.match(registro, /role="status"/);
  assert.match(authModal, /res\.requiereConfirmacionEmail/);
  assert.match(authModal, /Revisa tu correo/);
});

test('solo administradores emiten notificaciones comunitarias', async () => {
  const context = await read('src/context/AppContext.tsx');
  assert.match(context, /if \(usuarioActual\.rol !== 'Admin'\) return/);
  assert.match(context, /payload\?\.emisorRol === 'Admin'/);
  assert.match(context, /guardadas\.filter\(\(n\) => n\.emisorRol === 'Admin'\)/);
});

test('los fallos de XP dejan un diagnostico copiable en consola', async () => {
  const context = await read('src/context/AppContext.tsx');
  assert.match(context, /\[XP_DEBUG\] ERROR AL GUARDAR XP/);
  assert.match(context, /code: detalleError\.code/);
  assert.match(context, /details: detalleError\.details/);
  assert.match(context, /hint: detalleError\.hint/);
});

test('guardar un perfil existente usa UPDATE sin reescribir privilegios', async () => {
  const service = await read('src/services/dbService.ts');
  const guardarPerfil = service.slice(
    service.indexOf('async guardarPerfil'),
    service.indexOf('// Guardar override de rol y XP')
  );
  assert.doesNotMatch(guardarPerfil, /\.upsert\(/);
  assert.match(guardarPerfil, /if \(currentProfile\)[\s\S]*?\.update\(payloadEditable\)/);
  assert.doesNotMatch(guardarPerfil, /payloadEditable[\s\S]*?xp:\s*xpFinal/);
  assert.doesNotMatch(guardarPerfil, /payloadEditable[\s\S]*?nivel:\s*nivelFinal/);
});
