import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Post, Curso, Evento, Usuario, MensajeDirecto } from '../types';

export const dbService = {
  // Guardar publicación en Supabase
  async guardarPost(post: Post) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('posts').upsert({
        id: post.id,
        autor_id: post.autor.id,
        titulo: post.titulo,
        contenido: post.contenido,
        categoria: post.categoria,
        fijado: post.fijado,
        imagen: post.imagen,
        likes: post.likes,
        usuarios_liked: post.usuariosLiked,
      });
    } catch (err) {
      console.warn('Sync a Supabase pospuesto:', err);
    }
  },

  // Guardar curso en Supabase
  async guardarCurso(curso: Curso) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('courses').upsert({
        id: curso.id,
        titulo: curso.titulo,
        descripcion: curso.descripcion,
        imagen: curso.imagen,
        nivel_requerido: curso.nivelRequerido,
        categoria: curso.categoria,
      });
    } catch (err) {
      console.warn('Sync de curso a Supabase pospuesto:', err);
    }
  },

  // Guardar evento en Supabase
  async guardarEvento(evento: Evento) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
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
      });
    } catch (err) {
      console.warn('Sync de evento a Supabase pospuesto:', err);
    }
  },

  // Guardar mensaje de chat en Supabase
  async guardarMensaje(msg: MensajeDirecto) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('direct_messages').insert({
        id: msg.id,
        remitente_id: msg.remitenteId,
        destinatario_id: msg.destinatarioId,
        texto: msg.texto,
        leido: msg.leido,
      });
    } catch (err) {
      console.warn('Sync de mensaje a Supabase pospuesto:', err);
    }
  },

  // Guardar perfil de usuario
  async guardarPerfil(usr: Usuario) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('profiles').upsert({
        id: usr.id,
        nombre: usr.nombre,
        nickname: usr.nickname,
        avatar: usr.avatar,
        nivel: usr.nivel,
        xp: usr.xp,
        racha_dias: usr.rachaDias,
        rol: usr.rol,
        bio: usr.bio,
        twitter: usr.enlaces?.twitter,
        linkedin: usr.enlaces?.linkedin,
      });
    } catch (err) {
      console.warn('Sync de perfil a Supabase pospuesto:', err);
    }
  },
};
