import type { Usuario } from '../types';
import { parseBioEnvelope } from '../services/dbService';
import { formatearFechaRegistro } from './dateFormatter';

export function mapearPerfilAUsuario(p: any, adminOverrides?: Record<string, any>): Usuario {
  const esSuperAdminProtegido =
    (p.email && p.email.toLowerCase() === 'agomez87@gmail.com') ||
    p.id === 'admin' ||
    p.id === '155d43f8-9a80-4e5e-8713-3fc52708c1d0';

  const envelope = parseBioEnvelope(p.bio);
  let nombreVal = p.nombre || p.full_name || p.email?.split('@')[0] || 'Trader';
  let nicknameVal = envelope.nickname || p.nickname || p.username || `@${nombreVal.toLowerCase().replace(/\s+/g, '')}`;

  if (esSuperAdminProtegido) {
    if (!nombreVal || nombreVal === 'Trader' || nombreVal === 'Miembro') {
      nombreVal = 'Andy On Trade';
      nicknameVal = '@andyontrade';
    }
  }

  let localAvatar = '';
  try {
    const savedAvatar = localStorage.getItem(`raxen_avatar_${p.id}`);
    if (savedAvatar) localAvatar = savedAvatar;
  } catch (_) {}

  const avatarVal = p.avatar || p.avatar_url || envelope.avatar || localAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreVal)}&background=0D0D0D&color=38bdf8&size=128`;

  // Leer overrides de XP y Rol del Administrador
  let overrideXP: number | undefined = undefined;
  let overrideRol: string | undefined = undefined;
  let overrideNivel: number | undefined = undefined;

  try {
    const overridesLocalesStr = localStorage.getItem('raxen_admin_member_overrides');
    if (overridesLocalesStr) {
      const overridesLocales = JSON.parse(overridesLocalesStr);
      if (overridesLocales[p.id]) {
        if (typeof overridesLocales[p.id].xp === 'number') overrideXP = overridesLocales[p.id].xp;
        if (typeof overridesLocales[p.id].nivel === 'number') overrideNivel = overridesLocales[p.id].nivel;
        if (overridesLocales[p.id].rol) overrideRol = overridesLocales[p.id].rol;
      }
    }
  } catch (_) {}

  if (adminOverrides && adminOverrides[p.id]) {
    if (typeof adminOverrides[p.id].xp === 'number') overrideXP = adminOverrides[p.id].xp;
    if (typeof adminOverrides[p.id].nivel === 'number') overrideNivel = adminOverrides[p.id].nivel;
    if (adminOverrides[p.id].rol) overrideRol = adminOverrides[p.id].rol;
  }

  const envelopeXP = typeof envelope.xp === 'number' ? envelope.xp : 0;
  const dbXP = Number(p.xp ?? p.points ?? 0);

  let localXP = 0;
  try {
    const savedXP = localStorage.getItem(`raxen_xp_${p.id}`);
    if (savedXP) localXP = Number(savedXP) || 0;
  } catch (_) {}

  const xpFinal = overrideXP !== undefined ? overrideXP : (localXP > 0 ? localXP : Math.max(dbXP, envelopeXP));
  let nivelFinal = overrideNivel !== undefined ? overrideNivel : (typeof envelope.nivel === 'number' ? envelope.nivel : 1);
  if (xpFinal >= 7500) nivelFinal = 9;
  else if (xpFinal >= 5000) nivelFinal = 8;
  else if (xpFinal >= 3500) nivelFinal = 7;
  else if (xpFinal >= 2000) nivelFinal = 6;
  else if (xpFinal >= 1000) nivelFinal = 5;
  else if (xpFinal >= 500) nivelFinal = 4;
  else if (xpFinal >= 250) nivelFinal = 3;
  else if (xpFinal >= 100) nivelFinal = 2;
  else if (xpFinal < 100) nivelFinal = 1;

  // Detección y normalización precisa del rol
  let localRol: string | null = null;
  try {
    localRol = localStorage.getItem(`raxen_rol_${p.id}`);
  } catch (_) {}

  const rolRaw = (overrideRol || localRol || p.rol || p.role || (envelope as any).rol || '').toString().toLowerCase().trim();

  let rolFinal: 'Admin' | 'Moderador' | 'VIP' | 'Miembro Pro' | 'Miembro' = 'Miembro';

  if (esSuperAdminProtegido) {
    rolFinal = 'Admin';
  } else if (overrideRol && ['Admin', 'Moderador', 'VIP', 'Miembro Pro', 'Miembro'].includes(overrideRol)) {
    rolFinal = overrideRol as any;
  } else if (localRol && ['Admin', 'Moderador', 'VIP', 'Miembro Pro', 'Miembro'].includes(localRol)) {
    rolFinal = localRol as any;
  } else if (p.rol && ['Admin', 'Moderador', 'VIP', 'Miembro Pro', 'Miembro'].includes(p.rol)) {
    rolFinal = p.rol as any;
  } else if (envelope.rol && ['Admin', 'Moderador', 'VIP', 'Miembro Pro', 'Miembro'].includes(envelope.rol)) {
    rolFinal = envelope.rol as any;
  } else if (rolRaw === 'admin' || rolRaw === 'administrador') {
    rolFinal = 'Admin';
  } else if (rolRaw === 'moderador' || rolRaw === 'moderator') {
    rolFinal = 'Moderador';
  } else if (rolRaw === 'vip') {
    rolFinal = 'VIP';
  } else if (rolRaw === 'miembro pro' || rolRaw === 'pro') {
    rolFinal = 'Miembro Pro';
  }

  // Respuestas del onboarding de preguntas configuradas
  const respuestasOnboardingFinal = envelope.respuestasOnboarding || p.respuestasOnboarding || undefined;

  // Bio real guardada por el usuario
  const bioFinal = envelope.bio !== undefined ? envelope.bio : (p.bio || '');
  const enlacesFinal = envelope.enlaces || {
    twitter: p.twitter || undefined,
    linkedin: p.linkedin || undefined,
    website: p.website || undefined,
  };

  return {
    id: p.id,
    nombre: nombreVal,
    email: p.email || undefined,
    nickname: nicknameVal,
    avatar: avatarVal,
    nivel: nivelFinal,
    xp: xpFinal,
    rachaDias: Number(p.racha_dias) || 1,
    rol: rolFinal,
    bio: bioFinal,
    respuestasOnboarding: respuestasOnboardingFinal,
    enlaces: Object.keys(enlacesFinal || {}).length > 0 ? enlacesFinal : undefined,
    fechaRegistro: formatearFechaRegistro(p.fecha_registro || p.created_at),
    insignias: [],
    publicacionesCount: 0,
    comentariosCount: 0,
  };
}

/**
 * Deduplica la lista de miembros evitando duplicados del usuario Administrador principal
 * (como mezclar la fila fallback id: 'admin' con el UUID real de Supabase)
 */
export function deduplicarMiembros(lista: Usuario[]): Usuario[] {
  if (!Array.isArray(lista) || lista.length === 0) return [];

  const mapa = new Map<string, Usuario>();
  const emailMap = new Map<string, string>(); // email normalizado -> id en mapa
  const adminIds = new Set<string>();

  for (const m of lista) {
    if (!m || !m.id) continue;

    const emailNorm = m.email ? m.email.toLowerCase().trim() : '';
    const nombreNorm = m.nombre ? m.nombre.toLowerCase().trim() : '';

    const esAdminPrincipal =
      emailNorm === 'agomez87@gmail.com' ||
      m.id === '155d43f8-9a80-4e5e-8713-3fc52708c1d0' ||
      m.id === 'admin' ||
      m.nickname === '@andyontrade' ||
      nombreNorm === 'andy on trade' ||
      nombreNorm === 'andres gomez';

    // Fusión para evitar que el Admin principal aparezca duplicado
    if (esAdminPrincipal) {
      if (adminIds.size > 0) {
        const existingAdminId = Array.from(adminIds)[0];
        const existing = mapa.get(existingAdminId);
        if (existing) {
          // Si el actual es UUID real y el existente era el placeholder 'admin', reemplazamos el placeholder
          if (m.id !== 'admin' && existing.id === 'admin') {
            mapa.delete(existingAdminId);
            adminIds.delete(existingAdminId);
            mapa.set(m.id, {
              ...existing,
              ...m,
              rol: 'Admin',
              xp: Math.max(existing.xp, m.xp),
              nivel: Math.max(existing.nivel, m.nivel),
            });
            adminIds.add(m.id);
          } else {
            mapa.set(existingAdminId, {
              ...existing,
              ...m,
              rol: 'Admin',
              xp: Math.max(existing.xp, m.xp),
              nivel: Math.max(existing.nivel, m.nivel),
              bio: m.bio || existing.bio,
              respuestasOnboarding: m.respuestasOnboarding || existing.respuestasOnboarding,
            });
          }
          continue;
        }
      }
      adminIds.add(m.id);
    }

    // Deduplicación por email si coincide
    if (emailNorm) {
      if (emailMap.has(emailNorm)) {
        const existingId = emailMap.get(emailNorm)!;
        const existing = mapa.get(existingId);
        if (existing) {
          mapa.set(existingId, {
            ...existing,
            ...m,
            xp: Math.max(existing.xp, m.xp),
            nivel: Math.max(existing.nivel, m.nivel),
            bio: m.bio || existing.bio,
            respuestasOnboarding: m.respuestasOnboarding || existing.respuestasOnboarding,
          });
          continue;
        }
      }
      emailMap.set(emailNorm, m.id);
    }

    // Deduplicación por ID directo
    if (mapa.has(m.id)) {
      const existing = mapa.get(m.id)!;
      mapa.set(m.id, {
        ...existing,
        ...m,
        xp: Math.max(existing.xp, m.xp),
        nivel: Math.max(existing.nivel, m.nivel),
        bio: m.bio || existing.bio,
        respuestasOnboarding: m.respuestasOnboarding || existing.respuestasOnboarding,
      });
    } else {
      mapa.set(m.id, m);
    }
  }

  return Array.from(mapa.values());
}
