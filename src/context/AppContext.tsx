import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  TabType,
  Usuario,
  Post,
  Curso,
  Evento,
  NivelInfo,
  Notificacion,
  MensajeDirecto,
  CategoriaPost,
  ComunidadMeta,
  RolUsuario,
  Leccion,
} from '../types';
import { dbService } from '../services/dbService';

interface NuevoRegistroData {
  nombre: string;
  email: string;
  activoPrincipal: string;
  bio: string;
}

interface AppContextType {
  tabActual: TabType;
  setTabActual: (tab: TabType) => void;
  
  // Autenticación & Acceso Gratuito
  estaAutenticado: boolean;
  setEstaAutenticado: (autenticado: boolean) => void;
  usuarioActual: Usuario;
  cambiarUsuarioActivo: (usuario: Usuario) => void;
  cerrarSesion: () => void;

  comunidad: ComunidadMeta;
  niveles: NivelInfo[];
  
  // Modo de Vista (Admin vs Alumno)
  modoVistaAdmin: boolean;
  setModoVistaAdmin: (esAdmin: boolean) => void;

  // Registro de Nuevos Miembros & Auth
  modalRegistroAbierto: boolean;
  setModalRegistroAbierto: (abierto: boolean) => void;
  modalAuthAbierto: boolean;
  setModalAuthAbierto: (abierto: boolean) => void;
  registrarNuevoMiembro: (datos: NuevoRegistroData) => void;

  // Feed & Posts
  posts: Post[];
  categoriaSeleccionada: CategoriaPost;
  setCategoriaSeleccionada: (cat: CategoriaPost) => void;
  busqueda: string;
  setBusqueda: (query: string) => void;
  crearPost: (nuevoPost: Omit<Post, 'id' | 'autor' | 'fecha' | 'likes' | 'usuariosLiked' | 'comentarios'>) => void;
  toggleLikePost: (postId: string) => void;
  votarEncuesta: (postId: string, opcionId: string) => void;
  agregarComentario: (postId: string, contenido: string) => void;
  toggleLikeComentario: (postId: string, comentarioId: string) => void;
  eliminarPost: (postId: string) => void;
  toggleFijarPost: (postId: string) => void;

  // Cursos / Aula & Admin Builder
  cursos: Curso[];
  cursoSeleccionado: Curso | null;
  setCursoSeleccionado: (curso: Curso | null) => void;
  completarLeccion: (cursoId: string, leccionId: string) => void;
  toggleTaskChecklist: (cursoId: string, leccionId: string, taskId: string) => void;
  crearNuevoCurso: (nuevoCurso: Omit<Curso, 'id' | 'progresoPorcentaje'>) => void;
  editarCurso: (cursoActualizado: Curso) => void;
  eliminarCurso: (cursoId: string) => void;
  agregarModulo: (cursoId: string, tituloModulo: string) => void;
  agregarLeccion: (cursoId: string, moduloId: string, nuevaLeccion: Leccion) => void;
  eliminarLeccion: (cursoId: string, leccionId: string) => void;

  // Eventos / Calendario
  eventos: Evento[];
  toggleRSVPEvento: (eventoId: string) => void;
  crearNuevoEvento: (nuevoEvento: Omit<Evento, 'id' | 'rsvpUsuarios' | 'anfitrion'>) => void;
  eliminarEvento: (eventoId: string) => void;

  // Miembros & Gestión de Roles
  miembros: Usuario[];
  cambiarRolMiembro: (usuarioId: string, nuevoRol: RolUsuario) => void;
  otorgarXPMiembro: (usuarioId: string, cantidad: number) => void;

  // Notificaciones & Chat
  notificaciones: Notificacion[];
  marcarNotificacionesLeidas: () => void;
  mensajesDirectos: MensajeDirecto[];
  dmDrawerAbierto: boolean;
  setDmDrawerAbierto: (abierto: boolean) => void;
  usuarioChatActivo: Usuario | null;
  setUsuarioChatActivo: (usuario: Usuario | null) => void;
  enviarMensajeDirecto: (destinatarioId: string, texto: string) => void;

  // Modal Perfil de Usuario
  usuarioPerfilModal: Usuario | null;
  setUsuarioPerfilModal: (usuario: Usuario | null) => void;

  // Ajustes de Comunidad
  actualizarAjustesComunidad: (ajustes: Partial<ComunidadMeta>) => void;

  // XP Feedback
  ganarXP: (cantidad: number, razon: string) => void;
  ultimoXPGanado: { cantidad: number; razon: string } | null;
}

const VERSION_DATA = 'raxen_free_clean_v5';

if (localStorage.getItem('skool_version') !== VERSION_DATA) {
  localStorage.removeItem('skool_usuario');
  localStorage.removeItem('skool_auth');
  localStorage.removeItem('skool_posts');
  localStorage.removeItem('skool_cursos');
  localStorage.removeItem('skool_eventos');
  localStorage.removeItem('skool_miembros');
  localStorage.removeItem('skool_comunidad');
  localStorage.setItem('skool_version', VERSION_DATA);
}

const USUARIO_ANDRES_GOMEZ: Usuario = {
  id: 'usr-andres',
  nombre: 'Andres Gomez',
  nickname: '@andresgomez',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  nivel: 3,
  xp: 780,
  rachaDias: 21,
  rol: 'Admin',
  bio: 'Aprende sobre criptomonedas, trading y gestión de riesgo desde cero. Formación práctica, clases en vivo y una comunidad enfocada en operar con criterio.',
  fechaRegistro: 'Hace 21 días',
  insignias: [
    { id: 'b1', nombre: 'Fundador Raxen', descripcion: 'Creador de la comunidad', icono: '👑', color: 'bg-amber-100 text-amber-800' },
    { id: 'b2', nombre: 'Trader con Criterio', descripcion: 'Gestión estricta de riesgo', icono: '📊', color: 'bg-blue-100 text-blue-800' },
  ],
  publicacionesCount: 12,
  comentariosCount: 38,
};

const MIEMBROS_INICIALES: Usuario[] = [
  USUARIO_ANDRES_GOMEZ,
  {
    id: 'usr-2',
    nombre: 'Sofia Trading',
    nickname: '@sofia_fx',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    nivel: 2,
    xp: 210,
    rachaDias: 14,
    rol: 'Miembro',
    bio: 'Operando criptomonedas y swing trading.',
    fechaRegistro: 'Hace 14 días',
    insignias: [],
    publicacionesCount: 4,
    comentariosCount: 15,
  },
  {
    id: 'usr-3',
    nombre: 'Mateo BTC',
    nickname: '@mateo_btc',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    nivel: 2,
    xp: 190,
    rachaDias: 8,
    rol: 'Miembro',
    bio: 'Enfocado en Bitcoin y gestión de riesgo.',
    fechaRegistro: 'Hace 10 días',
    insignias: [],
    publicacionesCount: 2,
    comentariosCount: 8,
  },
];

const POSTS_INICIALES: Post[] = [
  {
    id: 'post-1',
    autor: USUARIO_ANDRES_GOMEZ,
    titulo: 'Bienvenido - Antes que nada leer esto 🔽',
    contenido: `Esta comunidad fue creada para quienes quieren aprender a operar, gestionar correctamente el riesgo y dejar de depender de señales. Aquí encontrarás formación práctica, clases en vivo y una comunidad enfocada en operar con criterio.`,
    categoria: 'Empieza aquí',
    fijado: true,
    fecha: '21d',
    likes: 7,
    usuariosLiked: ['usr-andres', 'usr-2', 'usr-3'],
    videoThumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ultimoComentario: 'Último comentario hace 14d',
    avatarComentarios: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    ],
    comentarios: [
      {
        id: 'c-1',
        postId: 'post-1',
        autor: MIEMBROS_INICIALES[1],
        contenido: '¡Excelente inicio Andres! Con muchas ganas de aprender a gestionar el riesgo.',
        fecha: 'hace 14d',
        likes: 3,
        usuariosLiked: ['usr-andres'],
      },
    ],
  },
  {
    id: 'post-2',
    autor: USUARIO_ANDRES_GOMEZ,
    titulo: 'Bitcoin a punto de despegar 🤑',
    contenido: `Revisión del gráfico diario de Bitcoin: rompiendo la resistencia clave con volumen y liquidez institucional. No olviden colocar el Stop Loss por debajo de la zona de consolidación.`,
    categoria: 'Análisis de mercado',
    fijado: false,
    fecha: '6h',
    likes: 0,
    usuariosLiked: [],
    videoThumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    comentarios: [],
  },
];

const CURSOS_INICIALES: Curso[] = [
  {
    id: 'curso-1',
    titulo: 'Trading con Criterio & Gestión de Riesgo',
    descripcion: 'Aprende sobre criptomonedas, trading y gestión de riesgo desde cero. Formación práctica y clases en vivo.',
    imagen: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    nivelRequerido: 1,
    categoria: 'Fundamentos',
    progresoPorcentaje: 0,
    modulos: [
      {
        id: 'mod-1',
        titulo: 'Módulo 1: Fundamentos de Gestión de Riesgo',
        lecciones: [
          {
            id: 'lec-1',
            titulo: '1.1 Por qué el 90% de los traders pierde dinero y cómo evitarlo',
            duracion: '14:20 min',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            resumen: 'Reglas no negociables para proteger tu capital y operar con criterio profesional.',
            checklist: [
              { id: 'ch-1', texto: 'Definir el riesgo máximo por operación (máx 1%)', completado: false },
              { id: 'ch-2', texto: 'Crear tu bitácora de operaciones', completado: false },
            ],
            completada: false,
          },
        ],
      },
    ],
  },
];

const EVENTOS_INICIALES: Evento[] = [
  {
    id: 'evt-1',
    titulo: 'Clase en Vivo: Operativa & Gestión con Andres Gomez',
    descripcion: 'Análisis de mercado en vivo de Bitcoin y principales criptomonedas. Preguntas y respuestas.',
    anfitrion: USUARIO_ANDRES_GOMEZ,
    fechaInicio: new Date(Date.now() + 86400000 * 2).toISOString(),
    duracion: '60 min',
    tipo: 'Clase en Vivo Gratuita',
    rsvpUsuarios: ['usr-andres', 'usr-2'],
    linkReunion: 'https://zoom.us/j/raxen-capital-live',
    banner: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
  },
];

const NOTIFICACIONES_INICIALES: Notificacion[] = [
  {
    id: 'notif-1',
    tipo: 'like',
    titulo: 'Nuevo Me Gusta',
    mensaje: 'A Sofia Trading le gustó tu publicación en la comunidad.',
    fecha: 'hace 2h',
    leida: false,
    enlaceTab: 'comunidad',
  },
];

const COMUNIDAD_META_INICIAL: ComunidadMeta = {
  nombre: 'AndyOnTrade - Raxen Capital',
  tagline: 'Menos ruido. Más criterio.',
  subtitulo: 'Trading con criterio - Gestión de riesgo - Operativa en vivo',
  dominio: 'andyontrade.com',
  descripcion: 'Aprende sobre criptomonedas, trading y gestión de riesgo desde cero. Formación práctica, clases en vivo y una comunidad enfocada en operar con criterio.',
  banner: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200',
  logo: 'R',
  totalMiembros: 47,
  enLinea: 1,
  administradores: 1,
  creador: USUARIO_ANDRES_GOMEZ,
  esGratuita: true,
};

const NIVELES_INICIALES: NivelInfo[] = [
  { nivel: 1, nombre: 'Nivel 1', xpRequerido: 0, beneficios: ['Acceso al Feed y Aula'] },
  { nivel: 2, nombre: 'Nivel 2', xpRequerido: 100, beneficios: ['Publicar imágenes y análisis'] },
  { nivel: 3, nombre: 'Nivel 3', xpRequerido: 500, beneficios: ['Votar en encuestas y enviar DMs'] },
  { nivel: 4, nombre: 'Nivel 4', xpRequerido: 1200, beneficios: ['Acceso a salas VIP'] },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabActual, setTabActual] = useState<TabType>('comunidad');
  
  // Control de Acceso: los no autenticados ven la página de preview inicial
  const [estaAutenticado, setEstaAutenticado] = useState<boolean>(() => {
    return localStorage.getItem('skool_auth') === 'true';
  });

  const [modoVistaAdmin, setModoVistaAdmin] = useState(true);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
  const [ultimoXPGanado, setUltimoXPGanado] = useState<{ cantidad: number; razon: string } | null>(null);

  const [usuarioActual, setUsuarioActual] = useState<Usuario>(() => {
    const local = localStorage.getItem('skool_usuario');
    return local ? JSON.parse(local) : USUARIO_ANDRES_GOMEZ;
  });

  const [comunidad, setComunidad] = useState<ComunidadMeta>(() => {
    const local = localStorage.getItem('skool_comunidad');
    return local ? JSON.parse(local) : COMUNIDAD_META_INICIAL;
  });

  const [niveles] = useState<NivelInfo[]>(NIVELES_INICIALES);

  const [posts, setPosts] = useState<Post[]>(() => {
    const local = localStorage.getItem('skool_posts');
    return local ? JSON.parse(local) : POSTS_INICIALES;
  });

  const [cursos, setCursos] = useState<Curso[]>(() => {
    const local = localStorage.getItem('skool_cursos');
    return local ? JSON.parse(local) : CURSOS_INICIALES;
  });

  const [eventos, setEventos] = useState<Evento[]>(() => {
    const local = localStorage.getItem('skool_eventos');
    return local ? JSON.parse(local) : EVENTOS_INICIALES;
  });

  const [miembros, setMiembros] = useState<Usuario[]>(() => {
    const local = localStorage.getItem('skool_miembros');
    return local ? JSON.parse(local) : MIEMBROS_INICIALES;
  });

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(NOTIFICACIONES_INICIALES);
  const [mensajesDirectos, setMensajesDirectos] = useState<MensajeDirecto[]>([]);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaPost>('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);

  const [dmDrawerAbierto, setDmDrawerAbierto] = useState(false);
  const [usuarioChatActivo, setUsuarioChatActivo] = useState<Usuario | null>(null);
  const [usuarioPerfilModal, setUsuarioPerfilModal] = useState<Usuario | null>(null);

  useEffect(() => {
    localStorage.setItem('skool_auth', estaAutenticado ? 'true' : 'false');
  }, [estaAutenticado]);

  useEffect(() => {
    localStorage.setItem('skool_usuario', JSON.stringify(usuarioActual));
  }, [usuarioActual]);

  useEffect(() => {
    localStorage.setItem('skool_comunidad', JSON.stringify(comunidad));
  }, [comunidad]);

  useEffect(() => {
    localStorage.setItem('skool_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('skool_cursos', JSON.stringify(cursos));
  }, [cursos]);

  useEffect(() => {
    localStorage.setItem('skool_eventos', JSON.stringify(eventos));
  }, [eventos]);

  useEffect(() => {
    localStorage.setItem('skool_miembros', JSON.stringify(miembros));
  }, [miembros]);

  const cambiarUsuarioActivo = (usuario: Usuario) => {
    setUsuarioActual(usuario);
    setEstaAutenticado(true);
    setModoVistaAdmin(usuario.rol === 'Admin');
    ganarXP(10, 'Sesión iniciada');
  };

  const cerrarSesion = () => {
    setEstaAutenticado(false);
  };

  const registrarNuevoMiembro = (datos: NuevoRegistroData) => {
    const nuevoUsuario: Usuario = {
      id: `usr-${Date.now()}`,
      nombre: datos.nombre,
      nickname: `@${datos.nombre.toLowerCase().replace(/\s+/g, '')}`,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
      nivel: 1,
      xp: 50,
      rachaDias: 1,
      rol: 'Miembro',
      bio: datos.bio,
      fechaRegistro: 'Hoy',
      insignias: [],
      publicacionesCount: 0,
      comentariosCount: 0,
    };

    setMiembros((prev) => [...prev, nuevoUsuario]);
    setUsuarioActual(nuevoUsuario);
    setEstaAutenticado(true);
    setModoVistaAdmin(false);

    setComunidad((prev) => ({
      ...prev,
      totalMiembros: prev.totalMiembros + 1,
      enLinea: prev.enLinea + 1,
    }));

    dbService.guardarPerfil(nuevoUsuario);
    ganarXP(50, 'Registro en la comunidad');
  };

  const ganarXP = (cantidad: number, razon: string) => {
    setUltimoXPGanado({ cantidad, razon });
    setTimeout(() => setUltimoXPGanado(null), 4000);

    setUsuarioActual((prev) => {
      const nuevoXP = prev.xp + cantidad;
      let nuevoNivel = prev.nivel;

      const nivelEncontrado = [...NIVELES_INICIALES]
        .reverse()
        .find((n) => nuevoXP >= n.xpRequerido);

      if (nivelEncontrado && nivelEncontrado.nivel > prev.nivel) {
        nuevoNivel = nivelEncontrado.nivel;
      }

      const actualizado = { ...prev, xp: nuevoXP, nivel: nuevoNivel };
      dbService.guardarPerfil(actualizado);
      return actualizado;
    });
  };

  const crearPost = (nuevoPostData: Omit<Post, 'id' | 'autor' | 'fecha' | 'likes' | 'usuariosLiked' | 'comentarios'>) => {
    const nuevoPost: Post = {
      ...nuevoPostData,
      id: `post-${Date.now()}`,
      autor: usuarioActual,
      fecha: 'Ahora',
      likes: 0,
      usuariosLiked: [],
      comentarios: [],
    };
    setPosts([nuevoPost, ...posts]);
    dbService.guardarPost(nuevoPost);
    ganarXP(15, 'Publicar en la comunidad');
  };

  const toggleLikePost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const yaDioLike = p.usuariosLiked.includes(usuarioActual.id);
          const nuevosUsuarios = yaDioLike
            ? p.usuariosLiked.filter((id) => id !== usuarioActual.id)
            : [...p.usuariosLiked, usuarioActual.id];
          const nuevosLikes = yaDioLike ? p.likes - 1 : p.likes + 1;

          if (!yaDioLike) {
            ganarXP(5, 'Dar Me Gusta a una publicación');
          }

          const postActualizado = { ...p, likes: nuevosLikes, usuariosLiked: nuevosUsuarios };
          dbService.guardarPost(postActualizado);
          return postActualizado;
        }
        return p;
      })
    );
  };

  const votarEncuesta = (postId: string, opcionId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId && p.encuesta) {
          const nuevasOpciones = p.encuesta.opciones.map((op) =>
            op.id === opcionId ? { ...op, votos: op.votos + 1 } : op
          );
          ganarXP(10, 'Votar en encuesta');
          return {
            ...p,
            encuesta: { ...p.encuesta, totalVotos: p.encuesta.totalVotos + 1, opciones: nuevasOpciones },
          };
        }
        return p;
      })
    );
  };

  const agregarComentario = (postId: string, contenido: string) => {
    const nuevoComentario = {
      id: `c-${Date.now()}`,
      postId,
      autor: usuarioActual,
      contenido,
      fecha: 'Ahora',
      likes: 0,
      usuariosLiked: [],
    };

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          return { ...p, comentarios: [...p.comentarios, nuevoComentario] };
        }
        return p;
      })
    );

    ganarXP(10, 'Comentar en una publicación');
  };

  const toggleLikeComentario = (postId: string, comentarioId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const nuevosComentarios = p.comentarios.map((c) =>
            c.id === comentarioId ? { ...c, likes: c.likes + 1 } : c
          );
          return { ...p, comentarios: nuevosComentarios };
        }
        return p;
      })
    );
  };

  const eliminarPost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const toggleFijarPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, fijado: !p.fijado } : p))
    );
  };

  const completarLeccion = (cursoId: string, leccionId: string) => {
    setCursos((prev) =>
      prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) => ({
            ...m,
            lecciones: m.lecciones.map((l) => (l.id === leccionId ? { ...l, completada: true } : l)),
          }));
          ganarXP(25, 'Lección completada en el Aula');
          return { ...c, modulos: nuevosMod };
        }
        return c;
      })
    );
  };

  const toggleTaskChecklist = (cursoId: string, leccionId: string, taskId: string) => {
    setCursos((prev) =>
      prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) => ({
            ...m,
            lecciones: m.lecciones.map((l) =>
              l.id === leccionId
                ? {
                    ...l,
                    checklist: l.checklist?.map((t) => (t.id === taskId ? { ...t, completado: !t.completado } : t)),
                  }
                : l
            ),
          }));
          return { ...c, modulos: nuevosMod };
        }
        return c;
      })
    );
  };

  const crearNuevoCurso = (nuevoCursoData: Omit<Curso, 'id' | 'progresoPorcentaje'>) => {
    const nuevoCurso: Curso = { ...nuevoCursoData, id: `curso-${Date.now()}`, progresoPorcentaje: 0 };
    setCursos([...cursos, nuevoCurso]);
    dbService.guardarCurso(nuevoCurso);
    ganarXP(50, 'Crear nuevo curso como Administrador');
  };

  const editarCurso = (cursoActualizado: Curso) => {
    setCursos((prev) => prev.map((c) => (c.id === cursoActualizado.id ? cursoActualizado : c)));
    dbService.guardarCurso(cursoActualizado);
  };

  const eliminarCurso = (cursoId: string) => {
    setCursos((prev) => prev.filter((c) => c.id !== cursoId));
  };

  const agregarModulo = (cursoId: string, tituloModulo: string) => {
    setCursos((prev) =>
      prev.map((c) =>
        c.id === cursoId
          ? { ...c, modulos: [...c.modulos, { id: `mod-${Date.now()}`, titulo: tituloModulo, lecciones: [] }] }
          : c
      )
    );
  };

  const agregarLeccion = (cursoId: string, moduloId: string, nuevaLeccion: Leccion) => {
    setCursos((prev) =>
      prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) =>
            m.id === moduloId ? { ...m, lecciones: [...m.lecciones, nuevaLeccion] } : m
          );
          return { ...c, modulos: nuevosMod };
        }
        return c;
      })
    );
  };

  const eliminarLeccion = (cursoId: string, leccionId: string) => {
    setCursos((prev) =>
      prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) => ({
            ...m,
            lecciones: m.lecciones.filter((l) => l.id !== leccionId),
          }));
          return { ...c, modulos: nuevosMod };
        }
        return c;
      })
    );
  };

  const toggleRSVPEvento = (eventoId: string) => {
    setEventos((prev) =>
      prev.map((e) =>
        e.id === eventoId
          ? {
              ...e,
              rsvpUsuarios: e.rsvpUsuarios.includes(usuarioActual.id)
                ? e.rsvpUsuarios.filter((id) => id !== usuarioActual.id)
                : [...e.rsvpUsuarios, usuarioActual.id],
            }
          : e
      )
    );
    ganarXP(15, 'Confirmar asistencia a sesión en vivo');
  };

  const crearNuevoEvento = (nuevoEventoData: Omit<Evento, 'id' | 'rsvpUsuarios' | 'anfitrion'>) => {
    const nuevoEvento: Evento = {
      ...nuevoEventoData,
      id: `evt-${Date.now()}`,
      anfitrion: usuarioActual,
      rsvpUsuarios: [usuarioActual.id],
    };
    setEventos([...eventos, nuevoEvento]);
  };

  const eliminarEvento = (eventoId: string) => {
    setEventos((prev) => prev.filter((e) => e.id !== eventoId));
  };

  const cambiarRolMiembro = (usuarioId: string, nuevoRol: RolUsuario) => {
    setMiembros((prev) => prev.map((m) => (m.id === usuarioId ? { ...m, rol: nuevoRol } : m)));
  };

  const otorgarXPMiembro = (usuarioId: string, cantidad: number) => {
    setMiembros((prev) => prev.map((m) => (m.id === usuarioId ? { ...m, xp: m.xp + cantidad } : m)));
  };

  const marcarNotificacionesLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const enviarMensajeDirecto = (destinatarioId: string, texto: string) => {
    const nuevoMsg: MensajeDirecto = {
      id: `msg-${Date.now()}`,
      remitenteId: usuarioActual.id,
      destinatarioId,
      texto,
      timestamp: 'Ahora',
      leido: true,
    };
    setMensajesDirectos((prev) => [...prev, nuevoMsg]);
    ganarXP(5, 'Enviar mensaje directo');
  };

  const actualizarAjustesComunidad = (nuevosAjustes: Partial<ComunidadMeta>) => {
    setComunidad((prev) => ({ ...prev, ...nuevosAjustes }));
  };

  return (
    <AppContext.Provider
      value={{
        tabActual,
        setTabActual,
        estaAutenticado,
        setEstaAutenticado,
        usuarioActual,
        cambiarUsuarioActivo,
        cerrarSesion,
        comunidad,
        niveles,
        modoVistaAdmin,
        setModoVistaAdmin,
        modalRegistroAbierto,
        setModalRegistroAbierto,
        modalAuthAbierto,
        setModalAuthAbierto,
        registrarNuevoMiembro,
        posts,
        categoriaSeleccionada,
        setCategoriaSeleccionada,
        busqueda,
        setBusqueda,
        crearPost,
        toggleLikePost,
        votarEncuesta,
        agregarComentario,
        toggleLikeComentario,
        eliminarPost,
        toggleFijarPost,
        cursos,
        cursoSeleccionado,
        setCursoSeleccionado,
        completarLeccion,
        toggleTaskChecklist,
        crearNuevoCurso,
        editarCurso,
        eliminarCurso,
        agregarModulo,
        agregarLeccion,
        eliminarLeccion,
        eventos,
        toggleRSVPEvento,
        crearNuevoEvento,
        eliminarEvento,
        miembros,
        cambiarRolMiembro,
        otorgarXPMiembro,
        notificaciones,
        marcarNotificacionesLeidas,
        mensajesDirectos,
        dmDrawerAbierto,
        setDmDrawerAbierto,
        usuarioChatActivo,
        setUsuarioChatActivo,
        enviarMensajeDirecto,
        usuarioPerfilModal,
        setUsuarioPerfilModal,
        actualizarAjustesComunidad,
        ganarXP,
        ultimoXPGanado,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
