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
