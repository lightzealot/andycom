/**
 * storageService.ts
 * Servicio centralizado para subida de archivos.
 * Intenta subir a Supabase Storage; si el bucket no existe o hay error de permisos,
 * usa base64 como fallback local (funciona aunque el bucket no esté configurado).
 */

import { supabase } from '../lib/supabaseClient';

const BUCKET = 'community_media';

/** Comprime una imagen via Canvas y retorna un Data URL JPEG */
export const compressImage = (
  file: File,
  maxDimension = 800,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      // No es imagen, devolver Data URL directo
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(evt.target!.result as string);
        }
      };
      img.onerror = () => resolve(evt.target!.result as string);
      img.src = evt.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Sube un archivo a Supabase Storage.
 * Retorna la URL pública si tiene éxito, o un Data URL base64 como fallback.
 */
export const uploadFile = async (
  file: File,
  folder: 'avatars' | 'posts' | 'banners' | 'courses' = 'posts'
): Promise<{ url: string; isLocal: boolean }> => {
  // 1. Comprimir imagen primero (o leer como base64 si es video)
  const compressed = await compressImage(file, folder === 'avatars' ? 600 : 1200, 0.85);

  // 2. Si no hay Supabase, fallback inmediato
  if (!supabase) {
    console.info('[Storage] Supabase no configurado, usando base64 local');
    return { url: compressed, isLocal: true };
  }

  try {
    // 3. Intentar subir a Supabase Storage
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '31536000', // 1 año de caché
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.warn('[Storage] Error al subir a Supabase, usando base64:', error.message);
      return { url: compressed, isLocal: true };
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    console.info('[Storage] ✅ Subido a Supabase Storage:', publicData.publicUrl);
    return { url: publicData.publicUrl, isLocal: false };
  } catch (err) {
    console.warn('[Storage] Excepción al subir, usando base64:', err);
    return { url: compressed, isLocal: true };
  }
};

/**
 * Sube un archivo de video (MP4, WebM, MOV) a Supabase Storage o retorna un Data URL local
 */
export const uploadVideoFile = async (
  file: File,
  folder: 'courses' | 'videos' = 'courses'
): Promise<{ url: string; isLocal: boolean }> => {
  if (!supabase) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string, isLocal: true });
      reader.readAsDataURL(file);
    });
  }

  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'video/mp4',
      });

    if (error) {
      console.warn('[Storage] Error al subir video a Supabase, usando Data URL local:', error.message);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: reader.result as string, isLocal: true });
        reader.readAsDataURL(file);
      });
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    console.info('[Storage] ✅ Video subido con éxito a Supabase Storage:', publicData.publicUrl);
    return { url: publicData.publicUrl, isLocal: false };
  } catch (err) {
    console.warn('[Storage] Excepción al subir video:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string, isLocal: true });
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Script SQL para crear el bucket en Supabase.
 * Ejecutar esto en el SQL Editor de tu dashboard de Supabase:
 *
 * insert into storage.buckets (id, name, public)
 * values ('community_media', 'community_media', true);
 *
 * create policy "Imágenes públicas" on storage.objects
 *   for select using (bucket_id = 'community_media');
 *
 * create policy "Subida autenticada" on storage.objects
 *   for insert with check (bucket_id = 'community_media' and auth.role() = 'authenticated');
 *
 * create policy "Eliminar propio" on storage.objects
 *   for delete using (bucket_id = 'community_media' and auth.uid() = owner);
 */
