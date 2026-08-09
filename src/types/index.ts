export type TabType =
  | 'comunidad'
  | 'aula'
  | 'calendario'
  | 'miembros'
  | 'clasificacion'
  | 'acerca'
  | 'configuracion';

export type RolUsuario = 'Admin' | 'Moderador' | 'VIP' | 'Miembro Pro' | 'Miembro';

export type CategoriaPost =
  | 'Todos'
  | 'General'
  | 'Empieza aquí'
  | 'Anuncios'
  | 'Presentaciones'
  | 'Análisis de mercado'
  | string;

export interface CategoriaPostItem {
  id: string;
  nombre: string;
  icono?: string;
  color?: string;
}

export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

export interface RespuestasOnboarding {
  pregunta1?: string;
  respuesta1?: string;
  pregunta2?: string;
  respuesta2?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email?: string;
  nickname: string;
  avatar: string;
  nivel: number;
  xp: number;
  rachaDias: number;
  rol: RolUsuario;
  bio?: string;
  respuestasOnboarding?: RespuestasOnboarding;
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

export interface Comentario {
  id: string;
  postId: string;
  autor: Usuario;
  contenido: string;
  fecha: string;
  likes: number;
  usuariosLiked: string[];
}

export interface OpcionEncuesta {
  id: string;
  texto: string;
  votos: number;
  usuariosVotaron: string[];
}

export interface Encuesta {
  id: string;
  pregunta: string;
  opciones: OpcionEncuesta[];
  totalVotos: number;
}

export interface Post {
  id: string;
  autor: Usuario;
  titulo: string;
  contenido: string;
  categoria: string;
  fijado: boolean;
  enviarPorEmail?: boolean;
  fecha: string;
  likes: number;
  usuariosLiked: string[];
  imagen?: string;
  videoThumbnail?: string;
  videoUrl?: string;
  encuesta?: Encuesta;
  comentarios: Comentario[];
  ultimoComentario?: string;
  avatarComentarios?: string[];
}

export interface RecursoDescargable {
  id: string;
  titulo: string;
  tipo: 'pdf' | 'excel' | 'zip';
  url: string;
}

export interface TareaChecklist {
  id: string;
  texto: string;
  completado: boolean;
}

export interface Leccion {
  id: string;
  titulo: string;
  duracion: string;
  videoUrl: string;
  resumen?: string;
  checklist?: TareaChecklist[];
  recursos?: RecursoDescargable[];
  completada: boolean;
}

export interface ModuloCurso {
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
  modulos: ModuloCurso[];
  progresoPorcentaje: number;
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  anfitrion: Usuario;
  fechaInicio: string;
  duracion: string;
  tipo: string;
  rsvpUsuarios: string[];
  linkReunion: string;
  banner: string;
}

export interface Notificacion {
  id: string;
  tipo: 'like' | 'comentario' | 'nivel_up' | 'evento' | 'sistema';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  archivada?: boolean;
  enlaceTab?: TabType;
}

export interface MensajeDirecto {
  id: string;
  remitenteId: string;
  destinatarioId: string;
  texto: string;
  timestamp: string;
  leido: boolean;
}

export interface NivelInfo {
  nivel: number;
  nombre: string;
  xpRequerido: number;
  beneficios: string[];
}

export interface ComunidadMeta {
  nombre: string;
  tagline: string;
  subtitulo: string;
  dominio: string;
  descripcion: string;
  banner: string;
  logo: string;
  totalMiembros: number;
  enLinea: number;
  administradores: number;
  creador: Usuario;
  esGratuita: boolean;
}
