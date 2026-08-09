/**
 * Convierte cualquier enlace directo de YouTube, Loom o Vimeo en una URL válida de inserción (Embed) para iframes.
 * Acepta enlaces estándar:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/live/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://www.loom.com/share/xxxx
 * - https://vimeo.com/xxxx
 */
export function formatVideoEmbedUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const url = rawUrl.trim();
  if (!url) return '';

  try {
    // 1. Enlace ya en formato embed de YouTube
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    // 2. YouTube shorts: https://youtube.com/shorts/VIDEO_ID
    if (url.includes('youtube.com/shorts/')) {
      const parts = url.split('youtube.com/shorts/');
      const videoId = parts[1]?.split(/[?&#/]/)[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // 3. YouTube live: https://youtube.com/live/VIDEO_ID
    if (url.includes('youtube.com/live/')) {
      const parts = url.split('youtube.com/live/');
      const videoId = parts[1]?.split(/[?&#/]/)[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // 4. YouTube estándar: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      const videoId = parsedUrl.searchParams.get('v');
      const time = parsedUrl.searchParams.get('t');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}${time ? `?start=${parseInt(time, 10) || 0}` : ''}`;
      }
    }

    // 5. YouTube corto: https://youtu.be/VIDEO_ID?t=10
    if (url.includes('youtu.be/')) {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      const videoId = parsedUrl.pathname.replace(/^\//, '').split('/')[0];
      const time = parsedUrl.searchParams.get('t');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}${time ? `?start=${parseInt(time, 10) || 0}` : ''}`;
      }
    }

    // 6. Loom: https://www.loom.com/share/ID -> https://www.loom.com/embed/ID
    if (url.includes('loom.com/share/')) {
      const loomId = url.split('loom.com/share/')[1]?.split(/[?&#/]/)[0];
      if (loomId) return `https://www.loom.com/embed/${loomId}`;
    }

    // 7. Vimeo: https://vimeo.com/ID -> https://player.vimeo.com/video/ID
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split(/[?&#/]/)[0];
      if (vimeoId && /^\d+$/.test(vimeoId)) {
        return `https://player.vimeo.com/video/${vimeoId}`;
      }
    }

    // 8. Dailymotion embed: https://www.dailymotion.com/embed/video/ID
    if (url.includes('dailymotion.com/embed/video/')) {
      return url;
    }

    // 9. Dailymotion estándar: https://www.dailymotion.com/video/ID
    if (url.includes('dailymotion.com/video/')) {
      const parts = url.split('dailymotion.com/video/');
      const videoId = parts[1]?.split(/[?&#/]/)[0];
      if (videoId) return `https://www.dailymotion.com/embed/video/${videoId}`;
    }

    // 10. Dailymotion corto: https://dai.ly/ID
    if (url.includes('dai.ly/')) {
      const parts = url.split('dai.ly/');
      const videoId = parts[1]?.split(/[?&#/]/)[0];
      if (videoId) return `https://www.dailymotion.com/embed/video/${videoId}`;
    }

    // Si ya tiene protocolo http/https y no coincide con patrones específicos, devolverlo tal cual
    return url;
  } catch (_) {
    return url;
  }
}

/**
 * Elimina parámetros de autoplay para forzar reproducción manual.
 */
export function disableAutoplayInUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const url = rawUrl.trim();
  if (!url) return '';

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    parsed.searchParams.delete('autoplay');
    parsed.searchParams.delete('auto_play');
    parsed.searchParams.delete('autostart');
    return parsed.toString();
  } catch {
    // Fallback defensivo por si la URL viene mal formada
    return url
      .replace(/([?&])autoplay=1(&|$)/gi, '$1')
      .replace(/([?&])auto_play=1(&|$)/gi, '$1')
      .replace(/([?&])autostart=1(&|$)/gi, '$1')
      .replace(/[?&]$/, '');
  }
}

/**
 * Detecta si una URL corresponde a un archivo de video directo (MP4, WebM, subido a Supabase Storage, Blob, etc.)
 */
export function isDirectVideoUrl(rawUrl?: string | null): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const url = rawUrl.trim().toLowerCase();
  return (
    url.startsWith('data:video') ||
    url.startsWith('blob:') ||
    url.includes('.mp4') ||
    url.includes('.webm') ||
    url.includes('.ogg') ||
    url.includes('.mov') ||
    url.includes('/community_media/') ||
    url.includes('/storage/v1/object/public/')
  );
}
