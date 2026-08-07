import { supabase } from '../lib/supabaseClient';

export const dbService = {
  // Subida de archivos con fallback a Base64
  async subirArchivo(file: File, carpeta = 'posts'): Promise<string> {
    try {
      if (!supabase) {
        return this.convertirABase64(file);
      }

      const extension = file.name.split('.').pop();
      const nombreArchivo = `${carpeta}/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
      
      const { data, error } = await supabase.storage
        .from('community_media')
        .upload(nombreArchivo, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        return this.convertirABase64(file);
      }

      const { data: urlData } = supabase.storage
        .from('community_media')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (err) {
      return this.convertirABase64(file);
    }
  },

  convertirABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  // Perfiles de Usuario
  async guardarPerfil(perfil: any) {
    try {
      if (!supabase) return;
      await supabase.from('profiles').upsert({
        id: perfil.id,
        nombre: perfil.nombre,
        nickname: perfil.nickname,
        avatar: perfil.avatar,
        nivel: perfil.nivel,
        xp: perfil.xp,
        rol: perfil.rol,
        bio: perfil.bio,
        fecha_registro: perfil.fechaRegistro,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase offline fallback:', err);
    }
  },

  // Publicaciones
  async guardarPost(post: any) {
    try {
      if (!supabase) return;
      await supabase.from('posts').upsert({
        id: post.id,
        autor_id: post.autor.id,
        titulo: post.titulo,
        contenido: post.contenido,
        categoria: post.categoria,
        fijado: post.fijado,
        imagen: post.imagen,
        video_url: post.videoUrl,
        video_thumbnail: post.videoThumbnail,
        likes: post.likes,
        fecha: post.fecha,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase offline fallback:', err);
    }
  },

  // Cursos
  async guardarCurso(curso: any) {
    try {
      if (!supabase) return;
      await supabase.from('courses').upsert({
        id: curso.id,
        titulo: curso.titulo,
        descripcion: curso.descripcion,
        imagen: curso.imagen,
        nivel_requerido: curso.nivelRequerido,
        categoria: curso.categoria,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase offline fallback:', err);
    }
  },

  // Eventos
  async guardarEvento(evento: any) {
    try {
      if (!supabase) return;
      await supabase.from('events').upsert({
        id: evento.id,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        anfitrion_id: evento.anfitrion.id,
        fecha_inicio: evento.fechaInicio,
        duracion: evento.duracion,
        tipo: evento.tipo,
        link_reunion: evento.linkReunion,
        banner: evento.banner,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase offline fallback:', err);
    }
  },

  // Mensajes
  async guardarMensaje(msg: any) {
    try {
      if (!supabase) return;
      await supabase.from('direct_messages').insert({
        id: msg.id,
        remitente_id: msg.remitenteId,
        destinatario_id: msg.destinatarioId,
        texto: msg.texto,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase offline fallback:', err);
    }
  },
};
