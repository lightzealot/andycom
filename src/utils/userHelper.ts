import type { Usuario } from '../types';
import { parseBioEnvelope } from '../services/dbService';
import { formatearFechaRegistro } from './dateFormatter';

export function mapearPerfilAUsuario(p: any): Usuario {
  const nombreVal = p.nombre || p.full_name || p.email?.split('@')[0] || 'Trader';
  const nicknameVal = p.nickname || p.username || `@${nombreVal.toLowerCase().replace(/\s+/g, '')}`;
  const avatarVal = p.avatar || p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreVal)}&background=0D0D0D&color=38bdf8&size=128`;

  const envelope = parseBioEnvelope(p.bio);
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

  return {
    id: p.id,
    nombre: nombreVal,
    nickname: nicknameVal,
    avatar: avatarVal,
    nivel: nivelFinal,
    xp: xpFinal,
    rachaDias: Number(p.racha_dias) || 1,
    rol: p.rol || (p.role === 'admin' ? 'Admin' : 'Miembro'),
    bio: envelope.bio || '',
    fechaRegistro: formatearFechaRegistro(p.fecha_registro || p.created_at),
    insignias: [],
    publicacionesCount: 0,
    comentariosCount: 0,
  };
}
