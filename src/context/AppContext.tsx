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
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/authService';
import { dbService } from '../services/dbService';
import confetti from 'canvas-confetti';

interface NuevoRegistroData {
  nombre: string;
  email: string;
  activoPrincipal: string;
  bio: string;
}

interface AppContextType {
  tabActual: TabType;
  setTabActual: (tab: TabType) => void;
  
  // Autenticación Real de Supabase
  estaAutenticado: boolean;
  setEstaAutenticado: (autenticado: boolean) => void;
  usuarioActual: Usuario;
  cambiarUsuarioActivo: (usuario: Usuario) => void;
  cerrarSesion: () => void;
  cargandoAuth: boolean;

  comunidad: ComunidadMeta;
  niveles: NivelInfo[];
  
  // Modo de Vista (Admin vs Alumno)
  modoVistaAdmin: boolean;
  setModoVistaAdmin: (esAdmin: boolean) => void;

  // Modales de Registro & Auth
  modalRegistroAbierto: boolean;
  setModalRegistroAbierto: (abierto: boolean) => void;
  modalAuthAbierto: boolean;
  setModalAuthAbierto: (abierto: boolean) => void;
  registrarNuevoMiembro: (datos: NuevoRegistroData) => void;

  // Feed & Posts (Supabase sync)
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

  // Cursos / Aula & Admin Builder (Supabase sync)
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

  // Eventos / Calendario (Supabase sync)
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

const USUARIO_ANDRES_GOMEZ: Usuario = {
  id: 'usr-andres',
  nombre: 'Andres Gomez',
  nickname: '@andresgomez',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  nivel: 3,
  xp: 780,
  rachaDias: 21,
  rol: 'Admin',
  bio: 'Trader profesional de Criptomonedas y Forex. Fundador de AndyOnTrade & Raxen Capital.',
  fechaRegistro: 'Hace 21 días',
  insignias: [],
  publicacionesCount: 12,
  comentariosCount: 38,
};

const COMUNIDAD_META_BASE: ComunidadMeta = {
  nombre: 'AndyOnTrade - Raxen Capital',
  tagline: 'Menos ruido. Más criterio.',
  subtitulo: 'Trading con criterio - Gestión de riesgo - Operativa en vivo',
  dominio: 'https://comunidad.raxen.capital',
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
  
  // Estado real de autenticación persistido para evitar parpadeos al refrescar
  const [estaAutenticado, setEstaAutenticado] = useState<boolean>(() => {
    return localStorage.getItem('raxen_auth') === 'true';
  });

  const [usuarioActual, setUsuarioActual] = useState<Usuario>(() => {
    const local = localStorage.getItem('raxen_usuario');
    return local ? JSON.parse(local) : USUARIO_ANDRES_GOMEZ;
  });

  const [cargandoAuth, setCargandoAuth] = useState<boolean>(false);

  const [modoVistaAdmin, setModoVistaAdmin] = useState(() => {
    return usuarioActual.rol === 'Admin';
  });

  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
  const [ultimoXPGanado, setUltimoXPGanado] = useState<{ cantidad: number; razon: string } | null>(null);

  const [comunidad, setComunidad] = useState<ComunidadMeta>(COMUNIDAD_META_BASE);
  const [niveles] = useState<NivelInfo[]>(NIVELES_INICIALES);

  // Estados de datos sincronizados con la Base de Datos
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [miembros, setMiembros] = useState<Usuario[]>([]);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [mensajesDirectos, setMensajesDirectos] = useState<MensajeDirecto[]>([]);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaPost>('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);

  const [dmDrawerAbierto, setDmDrawerAbierto] = useState(false);
  const [usuarioChatActivo, setUsuarioChatActivo] = useState<Usuario | null>(null);
  const [usuarioPerfilModal, setUsuarioPerfilModal] = useState<Usuario | null>(null);

  useEffect(() => {
    localStorage.setItem('raxen_auth', estaAutenticado ? 'true' : 'false');
  }, [estaAutenticado]);

  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem('raxen_usuario', JSON.stringify(usuarioActual));
    }
  }, [usuarioActual]);

  // 1. Efecto para escuchar la sesión real de Supabase Auth
  useEffect(() => {
    let montado = true;

    async function verificarSesionSupabase() {
      if (!supabase) return;

      try {
        setCargandoAuth(true);
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=recovery'))) {
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.4 } });
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && montado) {
          const usuario = await authService.obtenerPerfil(session.user.id, session.user);
          setUsuarioActual(usuario);
          setEstaAutenticado(true);
          setModoVistaAdmin(usuario.rol === 'Admin');
        } else if (montado && !localStorage.getItem('raxen_auth')) {
          setEstaAutenticado(false);
        }
      } catch (err) {
        console.warn('Error verificando sesión con Supabase:', err);
      } finally {
        if (montado) setCargandoAuth(false);
      }
    }

    verificarSesionSupabase();

    // Suscripción a cambios de autenticación
    let suscripcion: any = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const usuario = await authService.obtenerPerfil(session.user.id, session.user);
          setUsuarioActual(usuario);
          setEstaAutenticado(true);
          setModoVistaAdmin(usuario.rol === 'Admin');
          if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
            confetti({ particleCount: 100, spread: 70 });
          }
        } else if (_event === 'SIGNED_OUT') {
          setEstaAutenticado(false);
          localStorage.removeItem('raxen_auth');
          localStorage.removeItem('raxen_usuario');
        }
      });
      suscripcion = data.subscription;
    }

    return () => {
      montado = false;
      if (suscripcion) suscripcion.unsubscribe();
    };
  }, []);

  // 2. Cargar datos reales desde las tablas de Supabase
  useEffect(() => {
    async function cargarDatosDesdeSupabase() {
      if (!supabase) return;

      try {
        // Cargar perfiles de miembros
        const { data: profilesData } = await supabase.from('profiles').select('*');
        if (profilesData && profilesData.length > 0) {
          const miembrosMapeados: Usuario[] = profilesData.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            nickname: p.nickname || `@${p.nombre.toLowerCase().replace(/\s+/g, '')}`,
            avatar: p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            nivel: p.nivel || 1,
            xp: p.xp || 50,
            rachaDias: p.racha_dias || 1,
            rol: p.rol || 'Miembro',
            bio: p.bio || '',
            fechaRegistro: p.fecha_registro || 'Hoy',
            insignias: [],
            publicacionesCount: 0,
            comentariosCount: 0,
          }));
          setMiembros(miembrosMapeados);
          setComunidad((prev) => ({ ...prev, totalMiembros: miembrosMapeados.length }));
        }

        // Cargar posts
        const { data: postsData } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (postsData && postsData.length > 0) {
          const postsMapeados: Post[] = postsData.map((p) => ({
            id: p.id,
            autor: {
              id: p.autor_id || 'usr-andres',
              nombre: p.autor_nombre || 'Andres Gomez',
              nickname: '@andresgomez',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
              nivel: 3,
              xp: 780,
              rachaDias: 21,
              rol: 'Admin',
              fechaRegistro: 'Hace 21 días',
              insignias: [],
              publicacionesCount: 1,
              comentariosCount: 0,
            },
            titulo: p.titulo,
            contenido: p.contenido,
            categoria: p.categoria || 'General',
            fijado: Boolean(p.fijado),
            fecha: p.fecha || 'Reciente',
            likes: p.likes || 0,
            usuariosLiked: [],
            imagen: p.imagen,
            videoThumbnail: p.video_thumbnail,
            videoUrl: p.video_url,
            comentarios: [],
          }));
          setPosts(postsMapeados);
        } else {
          setPosts([
            {
              id: 'post-bienvenida',
              autor: COMUNIDAD_META_BASE.creador,
              titulo: 'Bienvenido - Antes que nada leer esto 🔽',
              contenido: `Esta comunidad fue creada para quienes quieren aprender a operar, gestionar correctamente el riesgo y dejar de depender de señales. Aquí encontrarás formación práctica, clases en vivo y una comunidad enfocada en operar con criterio.`,
              categoria: 'Empieza aquí',
              fijado: true,
              fecha: '21d',
              likes: 7,
              usuariosLiked: ['usr-andres'],
              videoThumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600',
              videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              ultimoComentario: 'Último comentario hace 14d',
              avatarComentarios: [
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
              ],
              comentarios: [],
            },
          ]);
        }

        // Cargar cursos
        const { data: coursesData } = await supabase.from('courses').select('*');
        if (coursesData && coursesData.length > 0) {
          const cursosMapeados: Curso[] = coursesData.map((c) => ({
            id: c.id,
            titulo: c.titulo,
            descripcion: c.descripcion,
            imagen: c.imagen || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
            nivelRequerido: c.nivel_requerido || 1,
            categoria: c.categoria || 'Fundamentos',
            progresoPorcentaje: 0,
            modulos: [],
          }));
          setCursos(cursosMapeados);
        } else {
          setCursos([
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
          ]);
        }
      } catch (err) {
        console.warn('Error sincronizando datos con Supabase:', err);
      }
    }

    cargarDatosDesdeSupabase();
  }, []);

  const cambiarUsuarioActivo = (usuario: Usuario) => {
    setUsuarioActual(usuario);
    setEstaAutenticado(true);
    setModoVistaAdmin(usuario.rol === 'Admin');
    localStorage.setItem('raxen_auth', 'true');
    localStorage.setItem('raxen_usuario', JSON.stringify(usuario));
    ganarXP(10, 'Sesión activa en Supabase');
  };

  const cerrarSesion = async () => {
    await authService.cerrarSesion();
    setEstaAutenticado(false);
    localStorage.removeItem('raxen_auth');
    localStorage.removeItem('raxen_usuario');
  };

  const registrarNuevoMiembro = (datos: NuevoRegistroData) => {
    authService.registrar(datos.email, 'password123', datos.nombre, datos.activoPrincipal);
  };

  const ganarXP = (cantidad: number, razon: string) => {
    setUltimoXPGanado({ cantidad, razon });
    setTimeout(() => setUltimoXPGanado(null), 4000);

    const nuevoXP = usuarioActual.xp + cantidad;
    const actualizado = { ...usuarioActual, xp: nuevoXP };
    setUsuarioActual(actualizado);
    dbService.guardarPerfil(actualizado);
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
      prevPosts.map((p) =>
        p.id === postId ? { ...p, comentarios: [...p.comentarios, nuevoComentario] } : p
      )
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
    ganarXP(50, 'Crear nuevo curso');
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
        cargandoAuth,
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
