export type TabType = 
  | 'comunidad' 
  | 'classroom' 
  | 'calendario' 
  | 'leaderboard' 
  | 'miembros' 
  | 'about' 
  | 'admin';

export type CategoriaPost = 
  | 'Todos'
  | 'Anuncios' 
  | 'General' 
  | 'Preguntas y Respuestas' 
  | 'Victorias' 
  | 'Recursos' 
  | 'Feedback';

export type RolUsuario = 'Admin' | 'Moderador' | 'VIP' | 'Miembro Pro' | 'Miembro';

export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  nickname: string;
  avatar: string;
  nivel: number;
  xp: number;
  rachaDias: number;
  rol: RolUsuario;
  bio: string;
  enlaces?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  fechaRegistro: string;
  insignias: Insignia[];
  publicacionesCount: number;
  comentariosCount: number;
}

export interface EncuestaOpcion {
  id: string;
  texto: string;
  votos: number;
  usuariosVotaron: string[];
}

export interface Encuesta {
  id: string;
  pregunta: string;
  opciones: EncuestaOpcion[];
  totalVotos: number;
}

export interface Comentario {
  id: string;
  postId: string;
  autor: Usuario;
  contenido: string;
  fecha: string;
  likes: number;
  usuariosLiked: string[];
}

export interface Post {
  id: string;
  autor: Usuario;
  titulo: string;
  contenido: string;
  categoria: CategoriaPost;
  fijado: boolean;
  fecha: string;
  likes: number;
  usuariosLiked: string[];
  encuesta?: Encuesta;
  comentarios: Comentario[];
  imagen?: string;
}

export interface TareaChecklist {
  id: string;
  texto: string;
  completado: boolean;
}

export interface RecursoDescargable {
  id: string;
  titulo: string;
  tipo: 'pdf' | 'link' | 'zip' | 'doc';
  url: string;
}

export interface Leccion {
  id: string;
  titulo: string;
  duracion: string;
  videoUrl: string;
  resumen: string;
  checklist: TareaChecklist[];
  completada: boolean;
  recursos?: RecursoDescargable[];
}

export interface Modulo {
  id: string;
  titulo: string;
  lecciones: Leccion[];
}

export interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  nivelRequerido: number;
  categoria: string;
  modulos: Modulo[];
  progresoPorcentaje?: number;
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  anfitrion: Usuario;
  fechaInicio: string;
  duracion: string;
  tipo: 'Llamada en Vivo' | 'Taller' | 'Q&A Mentoría' | 'Masterclass';
  rsvpUsuarios: string[];
  linkReunion: string;
  banner: string;
}

export interface NivelInfo {
  nivel: number;
  nombre: string;
  xpRequerido: number;
  beneficios: string[];
}

export interface MensajeDirecto {
  id: string;
  remitenteId: string;
  destinatarioId: string;
  texto: string;
  timestamp: string;
  leido: boolean;
}

export interface Notificacion {
  id: string;
  tipo: 'like' | 'comentario' | 'nivel_up' | 'evento' | 'sistema';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  enlaceTab?: TabType;
}

export interface ComunidadMeta {
  nombre: string;
  tagline: string;
  descripcion: string;
  banner: string;
  logo: string;
  totalMiembros: number;
  miembrosActivosHoy: number;
  creador: Usuario;
  mrrEstimado: number;
}
