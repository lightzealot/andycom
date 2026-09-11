import type { Usuario } from '../types';
import { parseBioEnvelope } from '../services/dbService';
import { formatearFechaRegistro } from './dateFormatter';

export function mapearPerfilAUsuario(p: any, _adminOverrides?: Record<string, any>): Usuario {
  const envelope = parseBioEnvelope(p.bio);
  let nombreVal = p.nombre || p.full_name || p.email?.split('@')[0] || 'Miembro';
  let nicknameVal = envelope.nickname || p.nickname || p.username || `@${nombreVal.toLowerCase().replace(/\s+/g, '')}`;

  let localAvatar = '';
  try {
    const savedAvatar = localStorage.getItem(`community_avatar_${p.id}`);
    if (savedAvatar) localAvatar = savedAvatar;
  } catch (_) {}

  const avatarVal = p.avatar || p.avatar_url || envelope.avatar || localAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreVal)}&background=0D0D0D&color=38bdf8&size=128`;

  const dbXP = Number(p.xp ?? p.points ?? 0);
  const xpFinal = Number.isFinite(dbXP) && dbXP >= 0 ? dbXP : 0;
  let nivelFinal = Number(p.nivel ?? p.level ?? 1);
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
  const rolRaw = (p.rol || p.role || '').toString().toLowerCase().trim();

  let rolFinal: 'Admin' | 'Moderador' | 'VIP' | 'Miembro Pro' | 'Miembro' = 'Miembro';

  if (p.rol && ['Admin', 'Moderador', 'VIP', 'Miembro Pro', 'Miembro'].includes(p.rol)) {
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

/** Deduplica miembros por correo e identificador sin asumir una cuenta propietaria. */
export function deduplicarMiembros(lista: Usuario[]): Usuario[] {
  if (!Array.isArray(lista) || lista.length === 0) return [];

  const mapa = new Map<string, Usuario>();
  const emailMap = new Map<string, string>(); // email normalizado -> id en mapa

  for (const m of lista) {
    if (!m || !m.id) continue;

    const emailNorm = m.email ? m.email.toLowerCase().trim() : '';
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
