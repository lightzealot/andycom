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
  plan: 'mensual' | 'anual';
  bio: string;
}

interface AppContextType {
  tabActual: TabType;
  setTabActual: (tab: TabType) => void;
  usuarioActual: Usuario;
  comunidad: ComunidadMeta;
  niveles: NivelInfo[];
  
  // Modo de Vista (Admin vs Alumno)
  modoVistaAdmin: boolean;
  setModoVistaAdmin: (esAdmin: boolean) => void;

  // Registro de Nuevos Miembros
  modalRegistroAbierto: boolean;
  setModalRegistroAbierto: (abierto: boolean) => void;
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

  // Cursos / LMS & Admin Builder
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

  // Eventos
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

  // XP
  ganarXP: (cantidad: number, razon: string) => void;
}

const VERSION_DATA = 'andyontrade_clean_v4';

if (localStorage.getItem('skool_version') !== VERSION_DATA) {
  localStorage.removeItem('skool_usuario');
  localStorage.removeItem('skool_posts');
  localStorage.removeItem('skool_cursos');
  localStorage.removeItem('skool_eventos');
  localStorage.removeItem('skool_miembros');
  localStorage.removeItem('skool_comunidad');
  localStorage.setItem('skool_version', VERSION_DATA);
}

const NIVELES_INICIALES: NivelInfo[] = [
  { nivel: 1, nombre: 'Trader Novato', xpRequerido: 0, beneficios: ['Publicar análisis en el feed', 'Acceso al curso de Fundamentos'] },
  { nivel: 2, nombre: 'Analista Técnico', xpRequerido: 100, beneficios: ['Subir capturas de gráficos TradingView', 'Comentarios con formato rico'] },
  { nivel: 3, nombre: 'Trader Forex & Crypto', xpRequerido: 500, beneficios: ['Desbloquea el curso "Masterclass de Price Action"', 'Votar en encuestas de mercado'] },
  { nivel: 4, nombre: 'Operador de Velas', xpRequerido: 1200, beneficios: ['Enviar Mensajes Directos (DMs)', 'Crear encuestas de proyecciones'] },
  { nivel: 5, nombre: 'Trader Fondeado', xpRequerido: 2500, beneficios: ['Desbloquea el curso "Gestión de Riesgo & Psicotrading VIP"', 'Insignia de Fondeado'] },
  { nivel: 6, nombre: 'Mentor de Estrategias', xpRequerido: 5000, beneficios: ['Acceso a canal VIP de Análisis Diarios de Andy', 'Insignia Dorada'] },
  { nivel: 7, nombre: 'Máster de Mercados', xpRequerido: 10000, beneficios: ['Sesión 1-a-1 de revisión de Bitácora con Andy'] },
  { nivel: 8, nombre: 'Titán de Wall Street', xpRequerido: 25000, beneficios: ['Co-anfitrión en sesiones de Trading en Vivo de NY'] },
  { nivel: 9, nombre: 'Leyenda del Trading', xpRequerido: 50000, beneficios: ['Acceso Vitalicio a todas las salas y Certificación Pro'] },
];

const USUARIO_ADMIN_ANDY: Usuario = {
  id: 'usr-andy',
  nombre: 'Andy On Trade',
  nickname: '@andyontrade',
  avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250',
  nivel: 6,
  xp: 5450,
  rachaDias: 1,
  rol: 'Admin',
  bio: 'Trader Profesional de Forex & Crypto. Fundador de andyontrade. Ayudando a traders a pasar cuentas de fondeo con Price Action.',
  enlaces: {
    twitter: 'https://twitter.com/andyontrade',
    linkedin: 'https://linkedin.com/in/andyontrade',
    website: 'https://andyontrade.com',
  },
  fechaRegistro: 'Agosto 2026',
  insignias: [
    { id: 'b1', nombre: 'Fundador & Master Trader', descripcion: 'Creador de la comunidad andyontrade', icono: '👑', color: 'from-amber-500 to-yellow-300' },
    { id: 'b2', nombre: 'Trader Fondeado $200K', descripcion: 'Paso exitoso de cuenta de fondeo', icono: '💹', color: 'from-emerald-500 to-teal-400' },
  ],
  publicacionesCount: 1,
  comentariosCount: 0,
};

const MIEMBROS_INICIALES: Usuario[] = [USUARIO_ADMIN_ANDY];

const POSTS_INICIALES: Post[] = [
  {
    id: 'post-bienvenida-oficial',
    autor: USUARIO_ADMIN_ANDY,
    titulo: '📈 ¡Bienvenidos a andyontrade! Hoja de ruta para Nuevos Miembros y traders que inician desde 0',
    contenido: `¡Hola Trader! 👋 Te doy la bienvenida oficial a **andyontrade**.

Nuestra misión es que dejes de depender de indicadores rezagados y domines el **Price Action puro**, para que puedas superar tus pruebas de fondeo (FTMO, FundedNext) y operar con disciplina.

📌 **Pasos para arrancar tu primer día**:
1. **Preséntate**: Deja un comentario abajo contando qué activo operas (EUR/USD, Nasdaq, BTC u Oro) y cuál es tu meta.
2. **Entra al Classroom**: Comienza con el Módulo 1 de *Estructura de Mercado & Acción del Precio*.
3. **Revisa el Calendario**: Confirma tu asistencia para la próxima sesión de Trading en Vivo de la apertura de New York.

¡Muchos éxitos en tus operaciones y bienvenido a la familia! 🚀`,
    categoria: 'Anuncios',
    fijado: true,
    fecha: 'Publicado hoy',
    likes: 1,
    usuariosLiked: ['usr-andy'],
    comentarios: [],
  },
];

const CURSOS_INICIALES: Curso[] = [
  {
    id: 'curso-trading-1',
    titulo: 'Fundamentos de Price Action & Estructura de Mercado',
    descripcion: 'Aprende a leer el gráfico limpio sin indicadores. Domina tendencias, impulsos, retrocesos y zonas de oferta y demanda.',
    imagen: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    nivelRequerido: 1,
    categoria: 'Análisis Técnico',
    progresoPorcentaje: 0,
    modulos: [
      {
        id: 'mod-t1',
        titulo: 'Módulo 1: Estructura de Mercado Profesional',
        lecciones: [
          {
            id: 'lec-t1',
            titulo: '1.1 Estructura Alcista y Bajista (BOS & CHoCH)',
            duracion: '16:40 min',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            resumen: 'En esta lección Andy te enseña a identificar rupturas de estructura reales vs falsos rompimientos en gráficos de 4H y 15M.',
            checklist: [
              { id: 'ch-t1', texto: 'Identificar 5 BOS en gráfico de 4 horas', completado: false },
              { id: 'ch-t2', texto: 'Marcar los máximos y mínimos relevantes de la sesión asiática', completado: false },
            ],
            completada: false,
            recursos: [
              { id: 'rec-t1', titulo: 'Guia_Estructura_Mercado_Andy.pdf', tipo: 'pdf', url: '#' },
            ],
          },
          {
            id: 'lec-t2',
            titulo: '1.2 Identificación de Zonas de Liquidez & Order Blocks',
            duracion: '24:15 min',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            resumen: 'Dónde se posicionan las instituciones bancarias y cómo entrar en los retrocesos profundos con Stop Loss ajustado.',
            checklist: [
              { id: 'ch-t3', texto: 'Localizar bloques de órdenes sin mitigar en 1H', completado: false },
            ],
            completada: false,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-trading-2',
    titulo: 'Gestión de Riesgo Profesional & Psicotrading Pro',
    descripcion: 'Control del FOMO, cálculo automático de lotaje, reglas de disciplina y bitácora de operaciones.',
    imagen: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    nivelRequerido: 2,
    categoria: 'Psicotrading & Riesgo',
    progresoPorcentaje: 0,
    modulos: [
      {
        id: 'mod-t3',
        titulo: 'Módulo 1: La Matemática del Trader Exitoso',
        lecciones: [
          {
            id: 'lec-t4',
            titulo: '1.1 Esperanza Matemática y Ratios Riesgo-Beneficio (1:3+)',
            duracion: '18:10 min',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            resumen: 'Por qué puedes tener sólo el 40% de aciertos y ser altamente rentable.',
            checklist: [
              { id: 'ch-t5', texto: 'Descargar calculadora de riesgo en Excel', completado: false },
            ],
            completada: false,
          },
        ],
      },
    ],
  },
  {
    id: 'curso-trading-3',
    titulo: 'Pase de Cuentas de Fondeo & Conceptos Institucionales ICT',
    descripcion: 'Estrategias diseñadas para superar los desafíos de empresas como FTMO, FundedNext y MyFundedFX.',
    imagen: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=800',
    nivelRequerido: 4,
    categoria: 'Fondeo & Pro',
    progresoPorcentaje: 0,
    modulos: [
      {
        id: 'mod-t4',
        titulo: 'Módulo 1: Reglas de Retos de Fondeo',
        lecciones: [
          {
            id: 'lec-t5',
            titulo: '1.1 Evitar el Drawdown Máximo Diario',
            duracion: '25:00 min',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            resumen: 'Plan de contingencia cuando sufres 2 pérdidas seguidas en el mismo día.',
            checklist: [
              { id: 'ch-t6', texto: 'Fijar el límite de pérdida diaria en el bot', completado: false },
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
    id: 'evt-t1',
    titulo: '📈 Trading en Vivo: Apertura de New York con Andy On Trade',
    descripcion: 'Analizamos y operamos el mercado en vivo durante la apertura de la bolsa de Nueva York. EUR/USD y Nasdaq.',
    anfitrion: USUARIO_ADMIN_ANDY,
    fechaInicio: new Date(Date.now() + 86400000 * 1).toISOString(),
    duracion: '90 min',
    tipo: 'Llamada en Vivo',
    rsvpUsuarios: ['usr-andy'],
    linkReunion: 'https://zoom.us/j/andyontrade-live-ny',
    banner: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
  },
];

const NOTIFICACIONES_INICIALES: Notificacion[] = [
  {
    id: 'notif-t1',
    tipo: 'sistema',
    titulo: '🎉 ¡Bienvenido a andyontrade!',
    mensaje: 'Has ingresado a la comunidad oficial de Trading. Comienza explorando los cursos y el calendario.',
    fecha: 'Hoy',
    leida: false,
    enlaceTab: 'classroom',
  },
];

const COMUNIDAD_META_INICIAL: ComunidadMeta = {
  nombre: 'andyontrade',
  tagline: 'La Comunidad N°1 de Trading, Análisis Técnico y Cuentas de Fondeo',
  descripcion: 'Aprende Price Action sin indicadores, opera en vivo junto a Andy, supera tus pruebas de fondeo y forma parte de una tribu de traders rentables.',
  banner: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200',
  logo: '📈',
  totalMiembros: 1,
  miembrosActivosHoy: 1,
  creador: USUARIO_ADMIN_ANDY,
  mrrEstimado: 49,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabActual, setTabActual] = useState<TabType>('comunidad');
  const [modoVistaAdmin, setModoVistaAdmin] = useState(true);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);

  const [usuarioActual, setUsuarioActual] = useState<Usuario>(() => {
    const local = localStorage.getItem('skool_usuario');
    return local ? JSON.parse(local) : USUARIO_ADMIN_ANDY;
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

  const registrarNuevoMiembro = (datos: NuevoRegistroData) => {
    const nuevoUsuario: Usuario = {
      id: `usr-${Date.now()}`,
      nombre: datos.nombre,
      nickname: `@${datos.nombre.toLowerCase().replace(/\s+/g, '_')}`,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
      nivel: 1,
      xp: 50,
      rachaDias: 1,
      rol: datos.plan === 'anual' ? 'VIP' : 'Miembro',
      bio: datos.bio,
      fechaRegistro: 'Hoy',
      insignias: [
        {
          id: `badge-${Date.now()}`,
          nombre: 'Trader Inscrito',
          descripcion: 'Inscripción confirmada en andyontrade',
          icono: '🎯',
          color: 'from-amber-500 to-yellow-300',
        },
      ],
      publicacionesCount: 0,
      comentariosCount: 0,
    };

    setMiembros((prev) => [...prev, nuevoUsuario]);
    setUsuarioActual(nuevoUsuario);
    setModoVistaAdmin(false);

    setComunidad((prev) => ({
      ...prev,
      totalMiembros: prev.totalMiembros + 1,
      miembrosActivosHoy: prev.miembrosActivosHoy + 1,
      mrrEstimado: prev.mrrEstimado + (datos.plan === 'anual' ? 33 : 49),
    }));

    dbService.guardarPerfil(nuevoUsuario);

    setNotificaciones((prev) => [
      {
        id: `notif-${Date.now()}`,
        tipo: 'sistema',
        titulo: '🎉 ¡Bienvenido a andyontrade!',
        mensaje: `Hola ${datos.nombre}, has ganado +50 XP por tu inscripción. ¡Comienza a estudiar en el Classroom!`,
        fecha: 'Justo ahora',
        leida: false,
        enlaceTab: 'classroom',
      },
      ...prev,
    ]);
  };

  const ganarXP = (cantidad: number, razon: string) => {
    setUsuarioActual((prev) => {
      const nuevoXP = prev.xp + cantidad;
      let nuevoNivel = prev.nivel;

      const nivelEncontrado = [...NIVELES_INICIALES]
        .reverse()
        .find((n) => nuevoXP >= n.xpRequerido);

      if (nivelEncontrado && nivelEncontrado.nivel > prev.nivel) {
        nuevoNivel = nivelEncontrado.nivel;
        setNotificaciones((nPrev) => [
          {
            id: `notif-${Date.now()}`,
            tipo: 'nivel_up',
            titulo: '🎉 ¡FELICITACIONES! ¡SUBISTE DE NIVEL!',
            mensaje: `Has alcanzado el Nivel ${nuevoNivel}: ${nivelEncontrado.nombre}.`,
            fecha: 'Justo ahora',
            leida: false,
            enlaceTab: 'leaderboard',
          },
          ...nPrev,
        ]);
      } else {
        setNotificaciones((nPrev) => [
          {
            id: `notif-${Date.now()}`,
            tipo: 'sistema',
            titulo: `+${cantidad} XP Ganados ⚡`,
            mensaje: `Motivo: ${razon}`,
            fecha: 'Justo ahora',
            leida: false,
          },
          ...nPrev,
        ]);
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
      fecha: 'Justo ahora',
      likes: 0,
      usuariosLiked: [],
      comentarios: [],
    };
    setPosts([nuevoPost, ...posts]);
    dbService.guardarPost(nuevoPost);
    ganarXP(15, 'Crear una publicación en la comunidad');
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
          const yaVoto = p.encuesta.opciones.some((op) =>
            op.usuariosVotaron.includes(usuarioActual.id)
          );

          if (yaVoto) return p;

          const nuevasOpciones = p.encuesta.opciones.map((op) => {
            if (op.id === opcionId) {
              return {
                ...op,
                votos: op.votos + 1,
                usuariosVotaron: [...op.usuariosVotaron, usuarioActual.id],
              };
            }
            return op;
          });

          ganarXP(10, 'Participar en una encuesta');

          return {
            ...p,
            encuesta: {
              ...p.encuesta,
              totalVotos: p.encuesta.totalVotos + 1,
              opciones: nuevasOpciones,
            },
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
      fecha: 'Justo ahora',
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
          const comentariosActualizados = p.comentarios.map((c) => {
            if (c.id === comentarioId) {
              const yaDioLike = c.usuariosLiked.includes(usuarioActual.id);
              const nuevosUsuarios = yaDioLike
                ? c.usuariosLiked.filter((id) => id !== usuarioActual.id)
                : [...c.usuariosLiked, usuarioActual.id];
              return {
                ...c,
                likes: yaDioLike ? c.likes - 1 : c.likes + 1,
                usuariosLiked: nuevosUsuarios,
              };
            }
            return c;
          });
          return { ...p, comentarios: comentariosActualizados };
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
    setCursos((prevCursos) =>
      prevCursos.map((curso) => {
        if (curso.id === cursoId) {
          let leccionesTotales = 0;
          let leccionesCompletadas = 0;

          const nuevosModulos = curso.modulos.map((modulo) => {
            const nuevasLecciones = modulo.lecciones.map((leccion) => {
              leccionesTotales++;
              if (leccion.id === leccionId || leccion.completada) {
                leccionesCompletadas++;
                if (leccion.id === leccionId && !leccion.completada) {
                  ganarXP(25, `Completar lección: ${leccion.titulo}`);
                }
                return { ...leccion, completada: true };
              }
              return leccion;
            });
            return { ...modulo, lecciones: nuevasLecciones };
          });

          const progreso = Math.round((leccionesCompletadas / leccionesTotales) * 100);

          const cursoActualizado = {
            ...curso,
            modulos: nuevosModulos,
            progresoPorcentaje: progreso,
          };

          if (cursoSeleccionado?.id === cursoId) {
            setCursoSeleccionado(cursoActualizado);
          }

          dbService.guardarCurso(cursoActualizado);
          return cursoActualizado;
        }
        return curso;
      })
    );
  };

  const toggleTaskChecklist = (cursoId: string, leccionId: string, taskId: string) => {
    setCursos((prevCursos) =>
      prevCursos.map((curso) => {
        if (curso.id === cursoId) {
          const nuevosModulos = curso.modulos.map((mod) => ({
            ...mod,
            lecciones: mod.lecciones.map((lec) => {
              if (lec.id === leccionId) {
                const nuevoChecklist = lec.checklist.map((task) =>
                  task.id === taskId ? { ...task, completado: !task.completado } : task
                );
                return { ...lec, checklist: nuevoChecklist };
              }
              return lec;
            }),
          }));

          const cursoActualizado = { ...curso, modulos: nuevosModulos };
          if (cursoSeleccionado?.id === cursoId) {
            setCursoSeleccionado(cursoActualizado);
          }
          return cursoActualizado;
        }
        return curso;
      })
    );
  };

  const crearNuevoCurso = (nuevoCursoData: Omit<Curso, 'id' | 'progresoPorcentaje'>) => {
    const nuevoCurso: Curso = {
      ...nuevoCursoData,
      id: `curso-${Date.now()}`,
      progresoPorcentaje: 0,
      modulos: nuevoCursoData.modulos || [],
    };
    setCursos([...cursos, nuevoCurso]);
    dbService.guardarCurso(nuevoCurso);
    ganarXP(50, 'Crear un nuevo curso en la plataforma');
  };

  const editarCurso = (cursoActualizado: Curso) => {
    setCursos((prev) => prev.map((c) => (c.id === cursoActualizado.id ? cursoActualizado : c)));
    if (cursoSeleccionado?.id === cursoActualizado.id) {
      setCursoSeleccionado(cursoActualizado);
    }
    dbService.guardarCurso(cursoActualizado);
  };

  const eliminarCurso = (cursoId: string) => {
    setCursos((prev) => prev.filter((c) => c.id !== cursoId));
    if (cursoSeleccionado?.id === cursoId) {
      setCursoSeleccionado(null);
    }
  };

  const agregarModulo = (cursoId: string, tituloModulo: string) => {
    setCursos((prev) =>
      prev.map((c) => {
        if (c.id === cursoId) {
          const nuevoMod = {
            id: `mod-${Date.now()}`,
            titulo: tituloModulo,
            lecciones: [],
          };
          const actualizado = { ...c, modulos: [...c.modulos, nuevoMod] };
          if (cursoSeleccionado?.id === cursoId) setCursoSeleccionado(actualizado);
          return actualizado;
        }
        return c;
      })
    );
  };

  const agregarLeccion = (cursoId: string, moduloId: string, nuevaLeccion: Leccion) => {
    setCursos((prev) =>
      prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) => {
            if (m.id === moduloId) {
              return { ...m, lecciones: [...m.lecciones, nuevaLeccion] };
            }
            return m;
          });
          const actualizado = { ...c, modulos: nuevosMod };
          if (cursoSeleccionado?.id === cursoId) setCursoSeleccionado(actualizado);
          return actualizado;
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
          const actualizado = { ...c, modulos: nuevosMod };
          if (cursoSeleccionado?.id === cursoId) setCursoSeleccionado(actualizado);
          return actualizado;
        }
        return c;
      })
    );
  };

  const toggleRSVPEvento = (eventoId: string) => {
    setEventos((prev) =>
      prev.map((evt) => {
        if (evt.id === eventoId) {
          const yaInscrito = evt.rsvpUsuarios.includes(usuarioActual.id);
          const nuevosRsvp = yaInscrito
            ? evt.rsvpUsuarios.filter((id) => id !== usuarioActual.id)
            : [...evt.rsvpUsuarios, usuarioActual.id];

          if (!yaInscrito) {
            ganarXP(15, 'Confirmar asistencia a evento');
          }

          const evtActualizado = { ...evt, rsvpUsuarios: nuevosRsvp };
          dbService.guardarEvento(evtActualizado);
          return evtActualizado;
        }
        return evt;
      })
    );
  };

  const crearNuevoEvento = (nuevoEventoData: Omit<Evento, 'id' | 'rsvpUsuarios' | 'anfitrion'>) => {
    const nuevoEvento: Evento = {
      ...nuevoEventoData,
      id: `evt-${Date.now()}`,
      anfitrion: usuarioActual,
      rsvpUsuarios: [usuarioActual.id],
    };
    setEventos([nuevoEvento, ...eventos]);
    dbService.guardarEvento(nuevoEvento);
    ganarXP(30, 'Programar nuevo evento en la comunidad');
  };

  const eliminarEvento = (eventoId: string) => {
    setEventos((prev) => prev.filter((e) => e.id !== eventoId));
  };

  const cambiarRolMiembro = (usuarioId: string, nuevoRol: RolUsuario) => {
    setMiembros((prev) =>
      prev.map((m) => {
        if (m.id === usuarioId) {
          const actualizado = { ...m, rol: nuevoRol };
          dbService.guardarPerfil(actualizado);
          return actualizado;
        }
        return m;
      })
    );
    if (usuarioActual.id === usuarioId) {
      setUsuarioActual((prev) => ({ ...prev, rol: nuevoRol }));
    }
  };

  const otorgarXPMiembro = (usuarioId: string, cantidad: number) => {
    setMiembros((prev) =>
      prev.map((m) => {
        if (m.id === usuarioId) {
          const actualizado = { ...m, xp: m.xp + cantidad };
          dbService.guardarPerfil(actualizado);
          return actualizado;
        }
        return m;
      })
    );
    if (usuarioActual.id === usuarioId) {
      ganarXP(cantidad, 'Bono manual otorgado por el Administrador');
    }
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leido: true,
    };
    setMensajesDirectos((prev) => [...prev, nuevoMsg]);
    dbService.guardarMensaje(nuevoMsg);
    ganarXP(5, 'Enviar mensaje directo a un miembro');
  };

  const actualizarAjustesComunidad = (nuevosAjustes: Partial<ComunidadMeta>) => {
    setComunidad((prev) => ({ ...prev, ...nuevosAjustes }));
  };

  return (
    <AppContext.Provider
      value={{
        tabActual,
        setTabActual,
        usuarioActual,
        comunidad,
        niveles,
        modoVistaAdmin,
        setModoVistaAdmin,
        modalRegistroAbierto,
        setModalRegistroAbierto,
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
