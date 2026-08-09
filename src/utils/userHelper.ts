import type { Usuario } from '../types';
import { parseBioEnvelope } from '../services/dbService';
import { formatearFechaRegistro } from './dateFormatter';

export function mapearPerfilAUsuario(p: any): Usuario {
  const envelope = parseBioEnvelope(p.bio);
  const nombreVal = p.nombre || p.full_name || p.email?.split('@')[0] || 'Trader';
  const nicknameVal = envelope.nickname || p.nickname || p.username || `@${nombreVal.toLowerCase().replace(/\s+/g, '')}`;
  let localAvatar = '';
  try {
    const savedAvatar = localStorage.getItem(`raxen_avatar_${p.id}`);
    if (savedAvatar) localAvatar = savedAvatar;
  } catch (_) {}

  const avatarVal = p.avatar || p.avatar_url || envelope.avatar || localAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreVal)}&background=0D0D0D&color=38bdf8&size=128`;
  const envelopeXP = typeof envelope.xp === 'number' ? envelope.xp : 0;
  const dbXP = Number(p.xp ?? p.points ?? 0);

  let localXP = 0;
  try {
    const savedXP = localStorage.getItem(`raxen_xp_${p.id}`);
    if (savedXP) localXP = Number(savedXP) || 0;
  } catch (_) {}

  const xpFinal = Math.max(dbXP, envelopeXP, localXP);
  let nivelFinal = typeof envelope.nivel === 'number' ? envelope.nivel : 1;
  if (xpFinal >= 7500) nivelFinal = 9;
  else if (xpFinal >= 5000) nivelFinal = 8;
  else if (xpFinal >= 3500) nivelFinal = 7;
  else if (xpFinal >= 2000) nivelFinal = 6;
  else if (xpFinal >= 1000) nivelFinal = 5;
  else if (xpFinal >= 500) nivelFinal = 4;
  else if (xpFinal >= 250) nivelFinal = 3;
  else if (xpFinal >= 100) nivelFinal = 2;

  // Detección y normalización robusta del rol
  const rolRaw = (p.rol || p.role || (envelope as any).rol || '').toString().toLowerCase().trim();
  const esAdmin =
    rolRaw === 'admin' ||
    rolRaw === 'administrador' ||
    rolRaw === 'administrator' ||
    p.is_admin === true ||
    p.id === '155d43f8-9a80-4e5e-8713-3fc52708c1d0' ||
    p.id === 'admin' ||
    (p.email && (p.email.toLowerCase().includes('agomez87@gmail.com') || p.email.toLowerCase().includes('andyontrade'))) ||
    nombreVal.toLowerCase().includes('andres gomez') ||
    nicknameVal.toLowerCase().includes('andresgomez');

  let rolFinal: 'Admin' | 'Moderador' | 'VIP' | 'Miembro Pro' | 'Miembro' = 'Miembro';
  if (esAdmin) {
    rolFinal = 'Admin';
  } else if (rolRaw === 'moderador' || rolRaw === 'moderator') {
    rolFinal = 'Moderador';
  } else if (rolRaw === 'vip') {
    rolFinal = 'VIP';
  } else if (rolRaw === 'miembro pro' || rolRaw === 'pro') {
    rolFinal = 'Miembro Pro';
  } else if (p.rol && ['Admin', 'Moderador', 'VIP', 'Miembro Pro', 'Miembro'].includes(p.rol)) {
    rolFinal = p.rol as any;
  }

  return {
    id: p.id,
    nombre: nombreVal,
    nickname: nicknameVal,
    avatar: avatarVal,
    nivel: nivelFinal,
    xp: xpFinal,
    rachaDias: Number(p.racha_dias) || 1,
    rol: rolFinal,
    bio: envelope.bio || '',
    fechaRegistro: formatearFechaRegistro(p.fecha_registro || p.created_at),
    insignias: [],
    publicacionesCount: 0,
    comentariosCount: 0,
  };
}
