import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
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
  Insignia,
  Comentario,
} from '../types';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/authService';
import { dbService, parseBioEnvelope, buildBioEnvelope } from '../services/dbService';
import { communityService, type ComunidadDisponible } from '../services/communityService';
import { setStorageCommunityId } from '../services/storageService';
import { formatearFechaRegistro } from '../utils/dateFormatter';
import { mapearPerfilAUsuario, deduplicarMiembros } from '../utils/userHelper';

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
  comunidadActivaId: string | null;
  comunidadesDisponibles: ComunidadDisponible[];
  seleccionarComunidad: (id: string) => void;
  crearComunidad: (nombre: string) => Promise<void>;
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
  preguntasRegistro: { pregunta1: string; pregunta2: string };
  guardarPreguntasRegistro: (preguntas: { pregunta1: string; pregunta2: string }) => Promise<void>;
  disclaimerRegistro: string;
  guardarDisclaimerRegistro: (nuevoTexto: string) => Promise<void>;

  // Feed & Posts (Supabase sync)
  posts: Post[];
  categoriaSeleccionada: CategoriaPost;
  setCategoriaSeleccionada: (cat: CategoriaPost) => void;
  categoriasLista: string[];
  agregarCategoria: (nombre: string) => Promise<void>;
  editarCategoria: (viejoNombre: string, nuevoNombre: string) => Promise<void>;
  eliminarCategoria: (nombre: string) => Promise<void>;
  busqueda: string;
  setBusqueda: (query: string) => void;
  crearPost: (nuevoPost: Omit<Post, 'id' | 'autor' | 'fecha' | 'likes' | 'usuariosLiked' | 'comentarios'>) => void;
  toggleLikePost: (postId: string) => void;
  votarEncuesta: (postId: string, opcionId: string) => void;
  agregarComentario: (postId: string, contenido: string) => void;
  toggleLikeComentario: (postId: string, comentarioId: string) => void;
  eliminarComentario: (postId: string, comentarioId: string) => Promise<void>;
  eliminarPost: (postId: string) => void;
  editarPost: (post: Post) => Promise<void>;
  toggleFijarPost: (postId: string) => void;

  // Cursos / Aula & Admin Builder (Supabase sync)
  cursos: Curso[];
  cursoSeleccionado: Curso | null;
  setCursoSeleccionado: (curso: Curso | null) => void;
  categoriasCursos: string[];
  agregarCategoriaCurso: (nombre: string) => Promise<void>;
  editarCategoriaCurso: (viejoNombre: string, nuevoNombre: string) => Promise<void>;
  eliminarCategoriaCurso: (nombre: string) => Promise<void>;
  completarLeccion: (cursoId: string, leccionId: string) => void;
  toggleTaskChecklist: (cursoId: string, leccionId: string, taskId: string) => void;
  crearNuevoCurso: (nuevoCurso: Omit<Curso, 'id' | 'progresoPorcentaje'>) => void;
  editarCurso: (cursoActualizado: Curso) => void;
  eliminarCurso: (cursoId: string) => void;
  reordenarCursos: (nuevosCursos: Curso[]) => void;
  agregarModulo: (cursoId: string, tituloModulo: string) => void;
  editarModulo: (cursoId: string, moduloId: string, nuevoTitulo: string) => void;
  eliminarModulo: (cursoId: string, moduloId: string) => void;
  reordenarModulos: (cursoId: string, origenIndex: number, destinoIndex: number) => void;
  agregarLeccion: (cursoId: string, moduloId: string, nuevaLeccion: Leccion) => void;
  editarLeccion: (cursoId: string, moduloId: string, leccionActualizada: Leccion) => void;
  eliminarLeccion: (cursoId: string, leccionId: string) => void;
  reordenarLecciones: (cursoId: string, moduloId: string, origenIndex: number, destinoIndex: number) => void;

  // Eventos / Calendario (Supabase sync)
  eventos: Evento[];
  toggleRSVPEvento: (eventoId: string) => void;
  crearNuevoEvento: (nuevoEvento: Omit<Evento, 'id' | 'rsvpUsuarios' | 'anfitrion'> & Partial<Pick<Evento, 'id' | 'rsvpUsuarios' | 'anfitrion'>>) => void;
  eliminarEvento: (eventoId: string) => void;

  // Miembros & Gestión de Roles
  miembros: Usuario[];
  setMiembros: React.Dispatch<React.SetStateAction<Usuario[]>>;
  cambiarRolMiembro: (usuarioId: string, nuevoRol: RolUsuario) => void;
  otorgarXPMiembro: (usuarioId: string, cantidad: number) => void;
  establecerXPMiembro: (usuarioId: string, nuevoXP: number) => Promise<void>;

  // Notificaciones & Chat
  notificaciones: Notificacion[];
  marcarNotificacionesLeidas: () => void;
  archivarNotificacion: (notifId: string) => void;
  archivarTodasNotificaciones: () => void;
  desarchivarNotificacion: (notifId: string) => void;
  agregarNotificacion: (notif: Notificacion) => void;
  mensajesDirectos: MensajeDirecto[];
  dmDrawerAbierto: boolean;
  setDmDrawerAbierto: (abierto: boolean) => void;
  usuarioChatActivo: Usuario | null;
  setUsuarioChatActivo: (usuario: Usuario | null) => void;
  enviarMensajeDirecto: (destinatarioId: string, texto: string) => void;
  eliminarMensajeDirecto: (mensajeId: string) => void;

  // Modal Perfil de Usuario
  usuarioPerfilModal: Usuario | null;
  setUsuarioPerfilModal: (usuario: Usuario | null) => void;

  // Ajustes de Comunidad
  actualizarAjustesComunidad: (ajustes: Partial<ComunidadMeta>) => void;

  // XP Feedback
  ganarXP: (cantidad: number, razon: string) => void;
  ultimoXPGanado: { cantidad: number; razon: string } | null;
}

// Placeholder temporal — se reemplaza inmediatamente con datos reales de Supabase al autenticar
const USUARIO_PLACEHOLDER: Usuario = {
  id: '',
  nombre: 'Cargando...',
  nickname: '',
  avatar: '/avatar-placeholder.svg',
  nivel: 1,
  xp: 0,
  rachaDias: 0,
  rol: 'Miembro',
  bio: '',
  fechaRegistro: '',
  insignias: [],
  publicacionesCount: 0,
  comentariosCount: 0,
};

// El perfil real del creador se carga desde Supabase.
const CREADOR_PREDETERMINADO: Usuario = {
  id: 'admin',
  nombre: 'Aquí va el nombre del creador',
  nickname: '@tu_usuario',
  avatar: '/avatar-placeholder.svg',
  nivel: 1,
  xp: 0,
  rachaDias: 0,
  rol: 'Admin',
  bio: 'Aquí va la presentación del creador de la comunidad.',
  fechaRegistro: '',
  insignias: [],
  publicacionesCount: 0,
  comentariosCount: 0,
};

// Los miembros reales se cargan directamente desde Supabase profiles
const MIEMBROS_INICIALES: Usuario[] = [];


const COMUNIDAD_META_BASE: ComunidadMeta = {
  nombre: 'Aquí va el nombre de tu comunidad',
  tagline: 'Aquí va la frase principal de tu comunidad',
  subtitulo: 'Aquí va un subtítulo que explique de qué trata este espacio',
  dominio: 'Aquí va el enlace de tu comunidad',
  descripcion: 'Aquí va la descripción de tu comunidad. Explica el tema, para quién es y qué encontrará cada miembro.',
  banner: '/community-banner.svg',
  logo: '/community-logo.svg',
  totalMiembros: 0,  // Se actualiza desde Supabase al cargar
  enLinea: 1,
  administradores: 1,
  creador: CREADOR_PREDETERMINADO,
  esGratuita: true,
  colorPrimario: '#0f172a',
  nombreAula: 'Recursos',
  nombreMiembros: 'Miembros',
  llamadaAccion: 'Escribe aquí tu llamada a la acción',
  tituloBienvenida: 'Aquí va el título de bienvenida',
  textoBienvenida: 'Aquí va el mensaje con el que presentarás tu comunidad a nuevos visitantes.',
  tituloAcerca: 'Aquí va el título de la sección Acerca de',
  filosofia: 'Aquí va la filosofía, propósito o promesa principal de tu comunidad.',
  beneficios: ['Aquí va el primer beneficio', 'Aquí va el segundo beneficio', 'Aquí va el tercer beneficio'],
};

const NIVELES_INICIALES: NivelInfo[] = [
  { nivel: 1, nombre: 'Nivel 1', xpRequerido: 0, beneficios: ['Acceso al Feed y Aula'] },
  { nivel: 2, nombre: 'Nivel 2', xpRequerido: 100, beneficios: ['Publicar imágenes y análisis'] },
  { nivel: 3, nombre: 'Nivel 3', xpRequerido: 500, beneficios: ['Votar en encuestas y debates'] },
  { nivel: 4, nombre: 'Nivel 4', xpRequerido: 1200, beneficios: ['Acceso a salas VIP'] },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabActual, setTabActual] = useState<TabType>(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    const validTabs: TabType[] = ['comunidad', 'aula', 'calendario', 'miembros', 'clasificacion', 'acerca', 'configuracion'];
    return validTabs.includes(requestedTab as TabType) ? requestedTab as TabType : 'comunidad';
  });
  
  // Estado real de autenticación persistido para evitar parpadeos al refrescar
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  const [usuarioActual, setUsuarioActual] = useState<Usuario>(USUARIO_PLACEHOLDER);

  const [cargandoAuth, setCargandoAuth] = useState<boolean>(true);
  const [comunidadActivaId, setComunidadActivaId] = useState<string | null>(null);
  const [comunidadesDisponibles, setComunidadesDisponibles] = useState<ComunidadDisponible[]>([]);

  const [modoVistaAdmin, setModoVistaAdmin] = useState(() => {
    return usuarioActual.rol === 'Admin';
  });

  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
  const [ultimoXPGanado, setUltimoXPGanado] = useState<{ cantidad: number; razon: string } | null>(null);

  const [comunidad, setComunidad] = useState<ComunidadMeta>(() => {
    try {
      const versionPlantilla = 'white_label_template_v2';
      if (localStorage.getItem('community_template_version') !== versionPlantilla) {
        localStorage.removeItem('community_comunidad_meta');
        localStorage.setItem('community_template_version', versionPlantilla);
        return COMUNIDAD_META_BASE;
      }
      const local = localStorage.getItem('community_comunidad_meta');
      if (!local) return COMUNIDAD_META_BASE;
      return { ...COMUNIDAD_META_BASE, ...JSON.parse(local) };
    } catch {
      return COMUNIDAD_META_BASE;
    }
  });
  const [niveles] = useState<NivelInfo[]>(NIVELES_INICIALES);

  // Estados de datos sincronizados con la Base de Datos
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [miembros, setMiembros] = useState<Usuario[]>(MIEMBROS_INICIALES);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    try {
      const localNotifs = localStorage.getItem('community_notificaciones');
      if (localNotifs) {
        const guardadas: Notificacion[] = JSON.parse(localNotifs);
        return guardadas.filter((n) => n.emisorRol === 'Admin');
      }
    } catch (_) {}
    return [
      {
        id: 'notif-1',
        tipo: 'sistema',
        titulo: '¡Bienvenido a la comunidad!',
        mensaje: 'Lee la publicación fijada en el inicio para conocer el espacio y comenzar.',
        fecha: 'Ahora',
        leida: false,
        enlaceTab: 'comunidad',
        emisorId: 'system-admin',
        emisorRol: 'Admin',
      },
      {
        id: 'notif-2',
        tipo: 'evento',
        titulo: 'Sesión en Vivo Programada',
        mensaje: 'Revisa las fechas y transmisiones disponibles en el Calendario.',
        fecha: 'Hoy',
        leida: false,
        enlaceTab: 'calendario',
        emisorId: 'system-admin',
        emisorRol: 'Admin',
      },
      {
        id: 'notif-3',
        tipo: 'nivel_up',
        titulo: 'Sistema de Niveles & XP',
        mensaje: 'Participa, comenta y completa contenido para subir de nivel.',
        fecha: 'Hoy',
        leida: false,
        enlaceTab: 'clasificacion',
        emisorId: 'system-admin',
        emisorRol: 'Admin',
      },
    ];
  });
  const [mensajesDirectos, setMensajesDirectos] = useState<MensajeDirecto[]>([]);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaPost>('Todos');
  const [categoriasLista, setCategoriasLista] = useState<string[]>(() => {
    try {
      const guardadas = localStorage.getItem('community_categorias');
      if (guardadas) return JSON.parse(guardadas);
    } catch (_) {}
    return ['General', 'Empieza aquí', 'Preguntas', 'Anuncios', 'Presentaciones'];
  });

  const [categoriasCursos, setCategoriasCursos] = useState<string[]>(() => {
    try {
      const guardadas = localStorage.getItem('community_categorias_cursos');
      if (guardadas) return JSON.parse(guardadas);
    } catch (_) {}
    return ['Todos', 'Introducción', 'Fundamentos', 'Recursos', 'Talleres', 'Avanzado'];
  });

  const [preguntasRegistro, setPreguntasRegistro] = useState<{ pregunta1: string; pregunta2: string }>(() => {
    try {
      const guardadas = localStorage.getItem('community_preguntas_registro');
      if (guardadas) return JSON.parse(guardadas);
    } catch (_) {}
    return {
      pregunta1: '¿Cuál es tu experiencia con este tema?',
      pregunta2: '¿Cuál es tu principal objetivo en la comunidad?',
    };
  });

  const [disclaimerRegistro, setDisclaimerRegistro] = useState<string>(() => {
    try {
      const guardado = localStorage.getItem('community_disclaimer_registro');
      if (guardado) return guardado;
    } catch (_) {}
    return 'Escribe "ACEPTO" para confirmar que conoces y aceptas las normas de esta comunidad.';
  });
  const [busqueda, setBusqueda] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);

  const [dmDrawerAbierto, setDmDrawerAbierto] = useState(false);
  const [usuarioChatActivo, setUsuarioChatActivo] = useState<Usuario | null>(null);
  const [usuarioPerfilModal, setUsuarioPerfilModal] = useState<Usuario | null>(null);

  useEffect(() => {
    document.title = comunidad.nombre;
    document.querySelector('meta[name="description"]')?.setAttribute('content', comunidad.descripcion);
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon && comunidad.logo) favicon.href = comunidad.logo;
    document.documentElement.style.setProperty('--community-primary', comunidad.colorPrimario || '#0f172a');
  }, [comunidad.nombre, comunidad.descripcion, comunidad.logo, comunidad.colorPrimario]);

  // 1. Efecto para escuchar la sesión real de Supabase Auth
  useEffect(() => {
    let montado = true;

    async function verificarSesionSupabase() {
      if (!supabase) return;

      try {
        setCargandoAuth(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && montado) {
          const usuario = await authService.obtenerPerfil(session.user.id, session.user);
          setUsuarioActual(usuario);
          setEstaAutenticado(true);
          setModoVistaAdmin(usuario.rol === 'Admin');
        } else if (montado) {
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
        } else if (_event === 'SIGNED_OUT') {
          setEstaAutenticado(false);
          localStorage.removeItem('community_auth');
          localStorage.removeItem('community_usuario');
        }
      });
      suscripcion = data.subscription;
    }

    return () => {
      montado = false;
      if (suscripcion) suscripcion.unsubscribe();
    };
  }, []);

  // Cada sesión trabaja dentro de una comunidad explícita. Si el usuario todavía
  // no pertenece a ninguna, se crea su primera comunidad mediante el RPC seguro.
  useEffect(() => {
    let vigente = true;
    if (!estaAutenticado || !supabase) {
      setComunidadActivaId(null);
      dbService.configurarComunidadActiva(null);
      setStorageCommunityId(null);
      return;
    }

    communityService.listarOCrear(comunidad.nombre)
      .then((lista) => {
        if (!vigente) return;
        const activa = communityService.elegirActiva(lista);
        setComunidadesDisponibles(lista);
        setComunidadActivaId(activa?.id || null);
        dbService.configurarComunidadActiva(activa?.id || null);
        setStorageCommunityId(activa?.id || null);
        if (activa) setComunidad((prev) => ({ ...prev, ...activa.settings, nombre: activa.name || prev.nombre }));
      })
      .catch((err) => console.warn('[Comunidad] No se pudo inicializar:', err));

    return () => { vigente = false; };
  }, [estaAutenticado]);

  // 2. Cargar datos reales desde las tablas de Supabase
  useEffect(() => {
    // If the user is not authenticated (e.g., visiting the landing page),
    // we clear any cached post data to avoid showing stale "ghost" posts.
    // The eliminated‑posts list is kept so deletions still apply.
    if (!estaAutenticado) {
      localStorage.removeItem('community_posts');
      setPosts([]);
    }
    async function cargarDatosDesdeSupabase() {
      if (!supabase || !estaAutenticado || !comunidadActivaId) return;

      try {
        // Cargar perfiles reales desde Supabase profiles
        const idsMiembros = await communityService.idsMiembros(comunidadActivaId);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', idsMiembros.length ? idsMiembros : ['00000000-0000-0000-0000-000000000000'])
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.warn('[Miembros] Error al cargar perfiles:', profilesError.message);
        }

        if (profilesData && profilesData.length > 0) {
          // Extraer overrides guardados por el Administrador en todos los bio envelopes y cache local
          const adminOverrides: Record<string, any> = {};
          try {
            const overridesLocalesStr = localStorage.getItem('community_admin_member_overrides');
            if (overridesLocalesStr) {
              Object.assign(adminOverrides, JSON.parse(overridesLocalesStr));
            }
          } catch (_) {}
          for (const p of profilesData) {
            const env = parseBioEnvelope(p.bio);
            if (env.memberOverrides) {
              Object.assign(adminOverrides, env.memberOverrides);
            }
          }

          const miembrosMapeados: Usuario[] = deduplicarMiembros(profilesData.map((p) => mapearPerfilAUsuario(p, adminOverrides)));
          miembrosMapeados.sort((a, b) => b.xp - a.xp);
          setMiembros(miembrosMapeados);

          // Sincronizar el creador real (Admin) y los ajustes globales de la comunidad
          const adminProfile = profilesData.find(
            (p) =>
              p.rol === 'Admin' ||
              p.role === 'admin' ||
              p.is_admin === true
          );
          const env = parseBioEnvelope(adminProfile?.bio);
          const totalAdmins = miembrosMapeados.filter((m) => m.rol === 'Admin').length || 1;

          if (adminProfile) {
            const adminMapeado = mapearPerfilAUsuario(adminProfile, adminOverrides);

            setComunidad((prev) => {
              const metaGuardada = env.communityMeta || {};
              const actualizado = {
                ...prev,
                creador: adminMapeado,
                totalMiembros: miembrosMapeados.length,
                administradores: totalAdmins,
                ...metaGuardada,
                // Asegurar que si hay banner en Supabase, se aplique
                banner: metaGuardada.banner || prev.banner,
              };
              try {
                localStorage.setItem('community_comunidad_meta', JSON.stringify(actualizado));
              } catch (_) {}
              return actualizado;
            });

            if (env.categorias && env.categorias.length > 0) {
              setCategoriasLista(env.categorias);
              try {
                localStorage.setItem('community_categorias', JSON.stringify(env.categorias));
              } catch (_) {}
            }

            if (env.categoriasCursos && env.categoriasCursos.length > 0) {
              setCategoriasCursos(env.categoriasCursos);
              try {
                localStorage.setItem('community_categorias_cursos', JSON.stringify(env.categoriasCursos));
              } catch (_) {}
            }

            if (env.preguntasRegistro && env.preguntasRegistro.pregunta1) {
              setPreguntasRegistro(env.preguntasRegistro);
              try {
                localStorage.setItem('community_preguntas_registro', JSON.stringify(env.preguntasRegistro));
              } catch (_) {}
            }

            if (env.disclaimerRegistro) {
              setDisclaimerRegistro(env.disclaimerRegistro);
              try {
                localStorage.setItem('community_disclaimer_registro', env.disclaimerRegistro);
              } catch (_) {}
            }
          } else {
            setComunidad((prev) => ({ ...prev, totalMiembros: miembrosMapeados.length }));
          }
        } else {
          setMiembros(MIEMBROS_INICIALES);
          setComunidad((prev) => ({ ...prev, totalMiembros: 1 }));
        }

        // Perfiles de autores para resolver cada post
        const { data: perfilesParaPosts } = await supabase
          .from('profiles')
          .select('*')
          .in('id', idsMiembros.length ? idsMiembros : ['00000000-0000-0000-0000-000000000000']);

        const perfilesMap = new Map(
          (perfilesParaPosts || []).map((p) => {
            const n = p.nombre || p.full_name || 'Miembro';
            return [
              p.id,
              {
                id: p.id,
                nombre: n,
                nickname: p.nickname || p.username || `@${n.toLowerCase().replace(/\s+/g, '')}`,
                avatar: p.avatar || p.avatar_url || '/avatar-placeholder.svg',
                nivel: p.nivel || p.level || 1,
                xp: p.xp || p.points || 0,
                rachaDias: p.racha_dias || 0,
                rol: p.rol || (p.role === 'admin' ? 'Admin' : 'Miembro'),
                fechaRegistro: formatearFechaRegistro(p.fecha_registro || p.created_at),
                insignias: [] as any[],
                publicacionesCount: 0,
                comentariosCount: 0,
              },
            ];
          })
        );

        // Cargar posts y comentarios persistentes
        const postsConComentarios = await dbService.cargarPosts(perfilesMap);
        setPosts(postsConComentarios);

        // Cargar cursos desde Supabase con temario completo (módulos, lecciones, notas y videos)
        const cursosCargados = await dbService.cargarCursos();
        if (cursosCargados && cursosCargados.length > 0) {
          setCursos(cursosCargados);
          localStorage.setItem('community_cursos', JSON.stringify(cursosCargados));
        } else {
          // Respaldo local si no hay conexión
          const cursosLocalesStr = localStorage.getItem('community_cursos');
          if (cursosLocalesStr) {
            try {
              const guardados: Curso[] = JSON.parse(cursosLocalesStr);
              if (guardados && guardados.length > 0) {
                setCursos(guardados);
              }
            } catch {}
          }
        }

        // Cargar eventos del calendario persistentes
        const eventosCargados = await dbService.cargarEventos(perfilesMap);
        if (eventosCargados && eventosCargados.length > 0) {
          setEventos(eventosCargados);
          localStorage.setItem('community_eventos', JSON.stringify(eventosCargados));
        }
      } catch (err) {
        console.warn('Error sincronizando datos con Supabase:', err);
        const cursosLocalesStr = localStorage.getItem('community_cursos');
        if (cursosLocalesStr) {
          try {
            setCursos(JSON.parse(cursosLocalesStr));
          } catch {}
        }
        const eventosLocalesStr = localStorage.getItem('community_eventos');
        if (eventosLocalesStr) {
          try {
            setEventos(JSON.parse(eventosLocalesStr));
          } catch {}
        }
      }
    }

    cargarDatosDesdeSupabase();

    // ── Suscripción en Tiempo Real (Realtime) ──
    // Cuando cualquier usuario o el admin crea, edita o borra algo, todos los usuarios conectados reciben el cambio al instante
    let canalRealtime: any = null;
    if (supabase) {
      canalRealtime = supabase
        .channel('realtime-sync-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'posts' },
          (payload: any) => {
            console.info('[Realtime] Nuevo post creado en Supabase:', payload.new.id);
            const eliminadosStr = localStorage.getItem('community_posts_eliminados') || '[]';
            const eliminadosIds: string[] = JSON.parse(eliminadosStr);
            setPosts((prev) => {
              if (eliminadosIds.includes(payload.new.id) || prev.some((p) => p.id === payload.new.id || (p.titulo?.trim().toLowerCase() === payload.new.title?.trim().toLowerCase() && p.contenido?.trim() === payload.new.content?.trim()))) {
                return prev;
              }
              const autorEncontrado = miembros.find((m) => m.id === payload.new.author_id) || {
                id: payload.new.author_id || 'desconocido',
                nombre: 'Miembro',
                nickname: '@miembro',
                avatar: '/avatar-placeholder.svg',
                nivel: 1,
                xp: 0,
                rachaDias: 0,
                rol: 'Miembro',
                fechaRegistro: 'Reciente',
                insignias: [],
                publicacionesCount: 0,
                comentariosCount: 0,
              };
              const nuevoPost: Post = {
                id: payload.new.id,
                autor: autorEncontrado,
                titulo: payload.new.title || 'Publicación',
                contenido: payload.new.content || '',
                categoria: payload.new.category || 'General',
                fijado: Boolean(payload.new.is_pinned),
                fecha: 'Ahora',
                likes: 0,
                usuariosLiked: [],
                imagen: payload.new.image_url || undefined,
                comentarios: [],
              };
              return [nuevoPost, ...prev];
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'posts' },
          (payload: any) => {
            console.info('[Realtime] Post actualizado en Supabase:', payload.new.id);
            const eliminadosStr = localStorage.getItem('community_posts_eliminados') || '[]';
            const eliminadosIds: string[] = JSON.parse(eliminadosStr);
            if (eliminadosIds.includes(payload.new.id)) return;
            setPosts((prev) =>
              prev.map((p) => {
                if (p.id === payload.new.id) {
                  return {
                    ...p,
                    titulo: payload.new.title || p.titulo,
                    contenido: payload.new.content !== undefined ? payload.new.content : p.contenido,
                    fijado: payload.new.is_pinned !== undefined ? Boolean(payload.new.is_pinned) : p.fijado,
                    imagen: payload.new.image_url !== undefined ? payload.new.image_url : p.imagen,
                  };
                }
                return p;
              })
            );
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles' },
          (payload: any) => {
            if (payload?.new?.bio && payload.new.bio.startsWith('[')) {
              try {
                const shared = JSON.parse(payload.new.bio);
                const eliminadosStr = localStorage.getItem('community_posts_eliminados') || '[]';
                const eliminadosIds: string[] = JSON.parse(eliminadosStr);
                setPosts((prev) => {
                  let copia = [...prev];
                  for (const sp of shared) {
                    // Never resurrect an eliminated post
                    if (eliminadosIds.includes(sp.id)) continue;
                    const idx = copia.findIndex((p) => p.id === sp.id);
                    if (idx >= 0) {
                      copia[idx] = { ...copia[idx], ...sp };
                    } else {
                      // Build a proper autor object from inline data
                      const postConAutor = {
                        ...sp,
                        autor: sp.autor || {
                          id: sp.autorId || payload.new.id,
                          nombre: sp.autorNombre || 'Miembro',
                          nickname: sp.autorNickname || '@miembro',
                          avatar: sp.autorAvatar || '',
                          rol: sp.autorRol || 'Miembro',
                          nivel: 1, xp: 0, rachaDias: 0,
                          fechaRegistro: 'Reciente', insignias: [],
                          publicacionesCount: 0, comentariosCount: 0,
                        },
                        comentarios: sp.comentarios || [],
                        usuariosLiked: sp.usuariosLiked || [],
                      };
                      copia.unshift(postConAutor);
                    }
                  }
                  return copia;
                });
              } catch (_) {}
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'posts' },
          (payload: any) => {
            console.info('[Realtime] Post eliminado en Supabase por Admin:', payload.old.id);
            const eliminadosStr = localStorage.getItem('community_posts_eliminados') || '[]';
            const eliminadosIds: string[] = JSON.parse(eliminadosStr);
            if (!eliminadosIds.includes(payload.old.id)) {
              eliminadosIds.push(payload.old.id);
              localStorage.setItem('community_posts_eliminados', JSON.stringify(eliminadosIds));
            }
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        )
        .on('broadcast', { event: 'nuevo_post' }, ({ payload }: any) => {
          if (payload && payload.id) {
            const eliminadosStr = localStorage.getItem('community_posts_eliminados') || '[]';
            const eliminadosIds: string[] = JSON.parse(eliminadosStr);
            if (eliminadosIds.includes(payload.id)) return;
            setPosts((prev) => {
              if (prev.some((p) => p.id === payload.id || (p.titulo?.trim().toLowerCase() === payload.titulo?.trim().toLowerCase() && p.contenido?.trim() === payload.contenido?.trim()))) {
                return prev;
              }
              return [payload, ...prev];
            });
          }
        })
        .on('broadcast', { event: 'eliminar_post' }, ({ payload }: any) => {
          const postId = typeof payload === 'string' ? payload : payload?.id;
          if (!postId) return;
          try {
            const eliminadosStr = localStorage.getItem('community_posts_eliminados') || '[]';
            const eliminadosIds: string[] = JSON.parse(eliminadosStr);
            if (!eliminadosIds.includes(postId)) {
              eliminadosIds.push(postId);
              localStorage.setItem('community_posts_eliminados', JSON.stringify(eliminadosIds));
            }
          } catch (_) {}
          setPosts((prev) => {
            const filtrado = prev.filter((p) => p.id !== postId);
            localStorage.setItem('community_posts', JSON.stringify(filtrado));
            return filtrado;
          });
        })
        .on('broadcast', { event: 'like_comentario' }, ({ payload }: any) => {
          if (!payload?.postId || !payload?.comentarioId) return;
          setPosts((prev) => {
            const actualizados = prev.map((p) => {
              if (p.id !== payload.postId) return p;
              const comentarios = (p.comentarios || []).map((c) => {
                if (c.id !== payload.comentarioId) return c;
                const usuarios = Array.isArray(payload.usuariosLiked) ? payload.usuariosLiked : [];
                return {
                  ...c,
                  usuariosLiked: usuarios,
                  likes: usuarios.length,
                };
              });
              return { ...p, comentarios };
            });
            localStorage.setItem('community_posts', JSON.stringify(actualizados));
            return actualizados;
          });
          try {
            const mapStr = localStorage.getItem('community_comment_likes_map') || '{}';
            const mapObj = JSON.parse(mapStr);
            mapObj[payload.comentarioId] = Array.isArray(payload.usuariosLiked) ? payload.usuariosLiked : [];
            localStorage.setItem('community_comment_likes_map', JSON.stringify(mapObj));
          } catch (_) {}
        })
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          async (payload: any) => {
            console.info('[Realtime] Perfil / XP actualizado en Supabase:', payload.new?.id);
            if (!supabase) return;
            try {
              const { data: profilesData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
              if (profilesData && profilesData.length > 0) {
                const adminOverrides: Record<string, any> = {};
                try {
                  const overridesLocalesStr = localStorage.getItem('community_admin_member_overrides');
                  if (overridesLocalesStr) {
                    Object.assign(adminOverrides, JSON.parse(overridesLocalesStr));
                  }
                } catch (_) {}
                for (const p of profilesData) {
                  const env = parseBioEnvelope(p.bio);
                  if (env.memberOverrides) {
                    Object.assign(adminOverrides, env.memberOverrides);
                  }
                }

                const miembrosMapeados = deduplicarMiembros(profilesData.map((p) => mapearPerfilAUsuario(p, adminOverrides)));
                miembrosMapeados.sort((a, b) => b.xp - a.xp);
                setMiembros(miembrosMapeados);
                setComunidad((prev) => ({ ...prev, totalMiembros: miembrosMapeados.length }));
              }
            } catch (_) {}
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'courses' },
          async (payload: any) => {
            console.info('[Realtime] Cambio en courses de Supabase:', payload.eventType);
            const cursosActualizados = await dbService.cargarCursos();
            if (cursosActualizados && cursosActualizados.length > 0) {
              setCursos(cursosActualizados);
              localStorage.setItem('community_cursos', JSON.stringify(cursosActualizados));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'events' },
          (payload: any) => {
            console.info('[Realtime] Evento eliminado en Supabase por Admin:', payload.old.id);
            try {
              const eliminadosStr = localStorage.getItem('community_eventos_eliminados') || '[]';
              const eliminadosIds: string[] = JSON.parse(eliminadosStr);
              if (!eliminadosIds.includes(payload.old.id)) {
                eliminadosIds.push(payload.old.id);
                localStorage.setItem('community_eventos_eliminados', JSON.stringify(eliminadosIds));
              }
            } catch (_) {}
            setEventos((prev) => {
              const filtrados = prev.filter((e) => e.id !== payload.old.id);
              localStorage.setItem('community_eventos', JSON.stringify(filtrados));
              return filtrados;
            });
          }
        )
        .on('broadcast', { event: 'eliminar_evento' }, ({ payload }: any) => {
          const eventoId = typeof payload === 'string' ? payload : payload?.id;
          if (!eventoId) return;
          try {
            const eliminadosStr = localStorage.getItem('community_eventos_eliminados') || '[]';
            const eliminadosIds: string[] = JSON.parse(eliminadosStr);
            if (!eliminadosIds.includes(eventoId)) {
              eliminadosIds.push(eventoId);
              localStorage.setItem('community_eventos_eliminados', JSON.stringify(eliminadosIds));
            }
          } catch (_) {}
          setEventos((prev) => {
            const filtrados = prev.filter((e) => e.id !== eventoId);
            localStorage.setItem('community_eventos', JSON.stringify(filtrados));
            return filtrados;
          });
        })
        .subscribe();
    }

    // Soporte para BroadcastChannel entre pestañas del navegador (Admin <-> Usuario Normal)
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('community_sync_channel');
        bc.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'sync_xp' && payload) {
            setMiembros((prev) => {
              const actualizados = prev.map((m) =>
                m.id === payload.usuarioId
                  ? { ...m, xp: payload.xp, nivel: payload.nivel }
                  : m
              );
              return actualizados.sort((a, b) => b.xp - a.xp);
            });
          } else if (type === 'sync_cursos' && Array.isArray(payload)) {
            setCursos(payload);
            localStorage.setItem('community_cursos', JSON.stringify(payload));
          } else if (type === 'eliminar_evento' && payload) {
            setEventos((prev) => {
              const eventoId = typeof payload === 'string' ? payload : payload?.id;
              if (!eventoId) return prev;
              try {
                const eliminadosStr = localStorage.getItem('community_eventos_eliminados') || '[]';
                const eliminadosIds: string[] = JSON.parse(eliminadosStr);
                if (!eliminadosIds.includes(eventoId)) {
                  eliminadosIds.push(eventoId);
                  localStorage.setItem('community_eventos_eliminados', JSON.stringify(eliminadosIds));
                }
              } catch (_) {}
              const filtrados = prev.filter((e) => e.id !== eventoId);
              localStorage.setItem('community_eventos', JSON.stringify(filtrados));
              return filtrados;
            });
          } else if (type === 'reemplazar_feed' && Array.isArray(payload)) {
            setPosts(payload);
            localStorage.setItem('community_posts', JSON.stringify(payload));
          } else if (type === 'nuevo_post' && payload) {
            setPosts((prev) => {
              if (prev.some((p) => p.id === payload.id || (p.titulo?.trim().toLowerCase() === payload.titulo?.trim().toLowerCase() && p.contenido?.trim() === payload.contenido?.trim()))) {
                return prev;
              }
              const nuevo = [payload, ...prev];
              localStorage.setItem('community_posts', JSON.stringify(nuevo));
              return nuevo;
            });
          } else if (type === 'editar_post' && payload) {
            setPosts((prev) => {
              const editado = prev.map((p) => {
                if (p.id === payload.id || (p.titulo && payload.titulo && p.titulo.toLowerCase().trim() === payload.titulo.toLowerCase().trim())) {
                  return { ...p, ...payload };
                }
                return p;
              });
              localStorage.setItem('community_posts', JSON.stringify(editado));
              return editado;
            });
          } else if (type === 'eliminar_post' && payload) {
            // Remove the post from state and persist the removal list
            setPosts((prev) => {
              const filtrado = prev.filter((p) => p.id !== payload);
              try {
                const eliminadosStr = localStorage.getItem('community_posts_eliminados') || '[]';
                const eliminados = JSON.parse(eliminadosStr);
                if (!eliminados.includes(payload)) {
                  eliminados.push(payload);
                  localStorage.setItem('community_posts_eliminados', JSON.stringify(eliminados));
                }
              } catch (_) {}
              localStorage.setItem('community_posts', JSON.stringify(filtrado));
              return filtrado;
            });
          } else if (type === 'eliminar_comentario' && payload) {
            setPosts((prev) => {
              const filtrado = prev.map((p) =>
                p.id === payload.postId
                  ? { ...p, comentarios: (p.comentarios || []).filter((c) => c.id !== payload.comentarioId) }
                  : p
              );
              localStorage.setItem('community_posts', JSON.stringify(filtrado));
              return filtrado;
            });
          } else if (type === 'like_comentario' && payload) {
            setPosts((prev) => {
              const actualizados = prev.map((p) => {
                if (p.id !== payload.postId) return p;
                const comentarios = (p.comentarios || []).map((c) =>
                  c.id === payload.comentarioId
                    ? {
                        ...c,
                        usuariosLiked: Array.isArray(payload.usuariosLiked) ? payload.usuariosLiked : [],
                        likes: Array.isArray(payload.usuariosLiked) ? payload.usuariosLiked.length : 0,
                      }
                    : c
                );
                return { ...p, comentarios };
              });
              localStorage.setItem('community_posts', JSON.stringify(actualizados));
              return actualizados;
            });
          } else if (type === 'nuevo_dm' && payload) {
            setMensajesDirectos((prev) => {
              if (prev.some((m) => m.id === payload.id)) return prev;
              const actualizados = [...prev, payload];
              localStorage.setItem('community_dms', JSON.stringify(actualizados));
              return actualizados;
            });
          } else if (type === 'eliminar_dm' && payload) {
            setMensajesDirectos((prev) => {
              const actualizados = prev.filter((m) => m.id !== payload);
              localStorage.setItem('community_dms', JSON.stringify(actualizados));
              return actualizados;
            });
          } else if (type === 'nueva_notificacion' && payload?.emisorRol === 'Admin') {
            setNotificaciones((prev) => {
              if (prev.some((n) => n.id === payload.id)) return prev;
              const actualizadas = [payload, ...prev];
              try {
                localStorage.setItem('community_notificaciones', JSON.stringify(actualizadas));
              } catch (_) {}
              return actualizadas;
            });
          } else if (type === 'sync_rol' && payload) {
            setMiembros((prev) =>
              prev.map((m) => (m.id === payload.usuarioId ? { ...m, rol: payload.nuevoRol } : m))
            );
            setUsuarioActual((prev) => {
              if (prev.id === payload.usuarioId) {
                setModoVistaAdmin(payload.nuevoRol === 'Admin');
                return { ...prev, rol: payload.nuevoRol };
              }
              return prev;
            });
          }
        };
      }
    } catch (_) {}

    const handleLocalNuevoPost = (e: any) => {
      const p = e.detail;
      if (p && p.id) {
        setPosts((prev) => {
          if (prev.some((existing) => existing.id === p.id || (existing.titulo?.trim().toLowerCase() === p.titulo?.trim().toLowerCase() && existing.contenido?.trim() === p.contenido?.trim()))) {
            return prev;
          }
          return [p, ...prev];
        });
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('community_nuevo_post_local', handleLocalNuevoPost);
    }

    // Sincronización periódica en segundo plano para capturar cualquier post, curso o XP de usuarios modificado en cualquier navegador
    const syncInterval = setInterval(async () => {
      try {
        const mapa = new Map(miembros.map((m) => [m.id, m]));
        const postsActualizados = await dbService.cargarPosts(mapa);
        if (postsActualizados && postsActualizados.length > 0) {
          setPosts((prev) => {
            if (
              postsActualizados.length !== prev.length ||
              postsActualizados.some((p, idx) => prev[idx]?.id !== p.id || prev[idx]?.titulo !== p.titulo || prev[idx]?.fijado !== p.fijado)
            ) {
              return postsActualizados;
            }
            return prev;
          });
        }

        // Sincronización periódica de perfiles y XP de todos los usuarios para el Admin y Leaderboard
        if (supabase) {
          const { data: profilesSync } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
          if (profilesSync && profilesSync.length > 0) {
            const adminOverrides: Record<string, any> = {};
            try {
              const overridesLocalesStr = localStorage.getItem('community_admin_member_overrides');
              if (overridesLocalesStr) {
                Object.assign(adminOverrides, JSON.parse(overridesLocalesStr));
              }
            } catch (_) {}
            for (const p of profilesSync) {
              const env = parseBioEnvelope(p.bio);
              if (env.memberOverrides) {
                Object.assign(adminOverrides, env.memberOverrides);
              }
            }

            const miembrosSync = deduplicarMiembros(profilesSync.map((p) => mapearPerfilAUsuario(p, adminOverrides)));
            miembrosSync.sort((a, b) => b.xp - a.xp);
            setMiembros((prev) => {
              const prevKey = prev.map((m) => `${m.id}:${m.xp}:${m.nivel}:${m.rol}`).join('|');
              const nextKey = miembrosSync.map((m) => `${m.id}:${m.xp}:${m.nivel}:${m.rol}`).join('|');
              if (prevKey !== nextKey) {
                return miembrosSync;
              }
              return prev;
            });
            setComunidad((prev) => ({ ...prev, totalMiembros: miembrosSync.length }));
          }
        }

        // Sincronización periódica de cursos para que los no-administradores vean cambios del admin
        const cursosSync = await dbService.cargarCursos();
        if (cursosSync && cursosSync.length > 0) {
          setCursos((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cursosSync)) {
              localStorage.setItem('community_cursos', JSON.stringify(cursosSync));
              return cursosSync;
            }
            return prev;
          });
        }
      } catch (_) {}
    }, 3500);

    return () => {
      clearInterval(syncInterval);
      if (canalRealtime && supabase) {
        supabase.removeChannel(canalRealtime);
      }
      if (bc) {
        bc.close();
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('community_nuevo_post_local', handleLocalNuevoPost);
      }
    };
  }, [estaAutenticado, comunidadActivaId]);

  const cambiarUsuarioActivo = (usuario: Usuario) => {
    setUsuarioActual(usuario);
    setEstaAutenticado(true);
    setModoVistaAdmin(usuario.rol === 'Admin');
    
    // 1. Actualizar en la lista de miembros y agregarlo si es nuevo
    setMiembros((prev) => {
      const yaExiste = prev.some((m) => m.id === usuario.id);
      if (!yaExiste) {
        return [...prev, usuario].sort((a, b) => b.xp - a.xp);
      }
      return prev.map((m) => (m.id === usuario.id ? usuario : m)).sort((a, b) => b.xp - a.xp);
    });

    // 2. Actualizar autor en los posts en vivo
    setPosts((prev) =>
      prev.map((p) =>
        p.autor.id === usuario.id || (usuario.rol === 'Admin' && p.autor.rol === 'Admin')
          ? { ...p, autor: usuario }
          : p
      )
    );

    // 3. Si es admin, actualizar el creador de la comunidad
    if (usuario.rol === 'Admin') {
      setComunidad((prev) => ({ ...prev, creador: usuario }));
    }
  };

  const cerrarSesion = async () => {
    await authService.cerrarSesion();
    setEstaAutenticado(false);
  };

  const registrarNuevoMiembro = (datos: NuevoRegistroData) => {
    authService.registrar(datos.email, 'password123', datos.nombre, datos.activoPrincipal);
  };

  const ganarXP = (cantidad: number, razon: string, actionKey?: string) => {
    setUltimoXPGanado({ cantidad, razon });
    setTimeout(() => setUltimoXPGanado(null), 4500);

    const xpActual = usuarioActual?.xp || 0;
    const nuevoXP = xpActual + cantidad;

    // Calcular el nivel según la tabla de progresión
    let nuevoNivel = 1;
    if (nuevoXP >= 7500) nuevoNivel = 9;
    else if (nuevoXP >= 5000) nuevoNivel = 8;
    else if (nuevoXP >= 3500) nuevoNivel = 7;
    else if (nuevoXP >= 2000) nuevoNivel = 6;
    else if (nuevoXP >= 1000) nuevoNivel = 5;
    else if (nuevoXP >= 500) nuevoNivel = 4;
    else if (nuevoXP >= 250) nuevoNivel = 3;
    else if (nuevoXP >= 100) nuevoNivel = 2;

    const subioDeNivel = nuevoNivel > (usuarioActual?.nivel || 1);

    // Otorgar insignias automáticas
    const insigniasActuales = usuarioActual?.insignias || [];
    const idsActuales = insigniasActuales.map((i) => (typeof i === 'string' ? i : i.id));
    const nuevasInsignias: Insignia[] = [...insigniasActuales];

    if (nuevoXP >= 15 && !idsActuales.includes('primer-aporte')) {
      nuevasInsignias.push({
        id: 'primer-aporte',
        nombre: 'Primer Aporte',
        descripcion: 'Publicaste tu primer análisis en el Feed',
        icono: '✍️',
        color: 'bg-blue-500',
      });
    }
    if (nuevoNivel >= 2 && !idsActuales.includes('miembro-activo')) {
      nuevasInsignias.push({
        id: 'miembro-activo',
        nombre: 'Miembro activo',
        descripcion: 'Alcanzaste el Nivel 2 en la comunidad',
        icono: '🥉',
        color: 'bg-amber-500',
      });
    }
    if (nuevoNivel >= 3 && !idsActuales.includes('backtester-pro')) {
      nuevasInsignias.push({
        id: 'backtester-pro',
        nombre: 'Backtester Pro',
        descripcion: 'Alcanzaste el Nivel 3 en la comunidad',
        icono: '🥈',
        color: 'bg-slate-400',
      });
    }
    if (nuevoNivel >= 4 && !idsActuales.includes('analista-avanzado')) {
      nuevasInsignias.push({
        id: 'analista-avanzado',
        nombre: 'Analista Avanzado',
        descripcion: 'Alcanzaste el Nivel 4 en la comunidad',
        icono: '🥇',
        color: 'bg-yellow-500',
      });
    }
    if (nuevoNivel >= 5 && !idsActuales.includes('miembro-destacado')) {
      nuevasInsignias.push({
        id: 'miembro-destacado',
        nombre: 'Miembro destacado',
        descripcion: 'Alcanzaste el Nivel 5+ y eres un Pro',
        icono: '💎',
        color: 'bg-sky-500',
      });
    }

    const actualizado: Usuario = {
      ...usuarioActual,
      xp: nuevoXP,
      nivel: nuevoNivel,
      insignias: nuevasInsignias,
    };

    setUsuarioActual(actualizado);
    localStorage.setItem('community_usuario', JSON.stringify(actualizado));
    try {
      localStorage.setItem(`community_xp_${usuarioActual.id}`, String(nuevoXP));
      localStorage.setItem(`community_nivel_${usuarioActual.id}`, String(nuevoNivel));
    } catch (_) {}

    // Transmitir actualización de XP a otras pestañas/admin en vivo
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('community_sync_channel');
        bc.postMessage({
          type: 'sync_xp',
          payload: { usuarioId: usuarioActual.id, xp: nuevoXP, nivel: nuevoNivel },
        });
        bc.close();
      }
    } catch (_) {}

    // Mostrar el Toast animado de XP ganado y auto-cerrarlo a los 3.5s
    setUltimoXPGanado({ cantidad, razon });
    setTimeout(() => {
      setUltimoXPGanado(null);
    }, 3500);

    // Actualizar en la lista de miembros y reordenar por XP descendente para el Leaderboard en vivo
    setMiembros((prev) => {
      const actualizados = prev.map((m) => (m.id === usuarioActual.id ? actualizado : m));
      return actualizados.sort((a, b) => b.xp - a.xp);
    });

    // Si subió de nivel, lanzar confeti
    if (subioDeNivel) {
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {}
    }

    // Persistir mediante RPC controlada. El trigger bloquea cambios directos
    // de XP, pero permite esta operacion validada y atomica.
    const claveAccion = actionKey || `${razon}:${crypto.randomUUID()}`;
    console.info('[XP_DEBUG] Solicitando recompensa', {
      cantidad,
      razon,
      actionKey: claveAccion,
      usuarioId: usuarioActual.id,
      xpAntes: xpActual,
      nivelAntes: usuarioActual.nivel,
    });
    void dbService.otorgarXP(cantidad, razon, claveAccion).then(({ data, error }) => {
      if (error) {
        const detalleError = error as {
          message?: string;
          code?: string;
          details?: string;
          hint?: string;
        };
        console.error('[XP_DEBUG] ERROR AL GUARDAR XP', {
          message: detalleError.message ?? String(error),
          code: detalleError.code,
          details: detalleError.details,
          hint: detalleError.hint,
          cantidad,
          razon,
          actionKey: claveAccion,
          usuarioId: usuarioActual.id,
        });
        return;
      }
      if (data) {
        console.info('[XP_DEBUG] XP GUARDADA CORRECTAMENTE', {
          xp: data.xp,
          nivel: data.nivel,
          cantidad,
          razon,
          actionKey: claveAccion,
        });
        setUsuarioActual((prev) => ({ ...prev, xp: data.xp, nivel: data.nivel }));
        setMiembros((prev) => prev
          .map((m) => m.id === usuarioActual.id ? { ...m, xp: data.xp, nivel: data.nivel } : m)
          .sort((a, b) => b.xp - a.xp));
      } else {
        console.error('[XP_DEBUG] RPC SIN ERROR PERO SIN DATOS', {
          cantidad,
          razon,
          actionKey: claveAccion,
          usuarioId: usuarioActual.id,
        });
      }
    }).catch((error) => {
      console.error('[XP_DEBUG] EXCEPCION INESPERADA', {
        message: error instanceof Error ? error.message : String(error),
        cantidad,
        razon,
        actionKey: claveAccion,
        usuarioId: usuarioActual.id,
      });
    });
  };

  // Helper anti-farming: garantiza que una acción específica sólo otorgue XP una única vez por usuario
  const puedeGanarXP = (accionKey: string): boolean => {
    if (!usuarioActual?.id) return false;
    try {
      const key = `community_claimed_xp_${usuarioActual.id}`;
      const guardadasStr = localStorage.getItem(key) || '[]';
      const guardadas: string[] = JSON.parse(guardadasStr);
      if (guardadas.includes(accionKey)) {
        return false;
      }
      guardadas.push(accionKey);
      localStorage.setItem(key, JSON.stringify(guardadas.slice(-500)));
      return true;
    } catch {
      return true;
    }
  };

  const crearPost = async (nuevoPostData: Omit<Post, 'id' | 'autor' | 'fecha' | 'likes' | 'usuariosLiked' | 'comentarios'>) => {
    const postUUID = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `a0eebc99-9c0b-4ef8-bb6d-${String(Date.now()).slice(-12).padStart(12, '0')}`;

    const nuevoPost: Post = {
      ...nuevoPostData,
      id: postUUID,
      autor: usuarioActual,
      fecha: 'Ahora',
      likes: 0,
      usuariosLiked: [],
      comentarios: [],
      fijado: Boolean(nuevoPostData.fijado),
    };
    const actualizados = [nuevoPost, ...posts];
    setPosts(actualizados);
    await dbService.guardarPost(nuevoPost);
    await dbService.sincronizarFeedCompleto(actualizados);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bcOut = new BroadcastChannel('community_sync_channel');
        bcOut.postMessage({ type: 'reemplazar_feed', payload: actualizados });
        bcOut.close();
      }
    } catch (_) {}

    // Emitir notificación a toda la comunidad
    const tituloNotif = nuevoPost.titulo ? `"${nuevoPost.titulo}"` : 'nueva publicación';
    agregarNotificacion({
      id: `notif-post-${Date.now()}`,
      tipo: 'sistema',
      titulo: nuevoPostData.enviarPorEmail ? '📧 Publicación Destacada por Correo' : 'Nueva Publicación en la Comunidad',
      mensaje: `${usuarioActual.nombre} publicó ${tituloNotif}. ¡Únete al debate!`,
      fecha: 'Ahora',
      leida: false,
      enlaceTab: 'comunidad',
    });

    if (nuevoPostData.enviarPorEmail) {
      dbService.enviarEmailBroadcast(nuevoPost, miembros);
    }

    ganarXP(15, 'Publicar en la comunidad', `post:${nuevoPost.id}`);
  };

  const toggleLikePost = (postId: string) => {
    setPosts((prevPosts) => {
      const actualizados = prevPosts.map((p) => {
        if (p.id === postId) {
          const yaDioLike = p.usuariosLiked.includes(usuarioActual.id);
          const nuevosUsuarios = yaDioLike
            ? p.usuariosLiked.filter((id) => id !== usuarioActual.id)
            : [...p.usuariosLiked, usuarioActual.id];
          const nuevosLikes = yaDioLike ? p.likes - 1 : p.likes + 1;

          // Solo otorga XP la primera vez que da Like a este post
          if (!yaDioLike && puedeGanarXP(`like_post_${postId}`)) {
            ganarXP(5, 'Dar Me Gusta a una publicación', `like_post:${postId}`);
          }

          const postActualizado = { ...p, likes: nuevosLikes, usuariosLiked: nuevosUsuarios };
          dbService.guardarPost(postActualizado);
          try {
            if (typeof BroadcastChannel !== 'undefined') {
              const bcOut = new BroadcastChannel('community_sync_channel');
              bcOut.postMessage({ type: 'editar_post', payload: postActualizado });
              bcOut.close();
            }
          } catch (_) {}

          try {
            const likesMapStr = localStorage.getItem('community_post_likes_map') || '{}';
            const likesMap = JSON.parse(likesMapStr);
            likesMap[postId] = nuevosUsuarios;
            localStorage.setItem('community_post_likes_map', JSON.stringify(likesMap));
          } catch (_) {}

          return postActualizado;
        }
        return p;
      });

      try {
        localStorage.setItem('community_posts', JSON.stringify(actualizados));
      } catch (_) {}
      return actualizados;
    });
  };

  const votarEncuesta = (postId: string, opcionId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId && p.encuesta) {
          const yaVoto = p.encuesta.opciones.some((op) => op.usuariosVotaron.includes(usuarioActual.id));
          if (yaVoto) return p;

          const nuevasOpciones = p.encuesta.opciones.map((op) =>
            op.id === opcionId
              ? { ...op, votos: op.votos + 1, usuariosVotaron: [...op.usuariosVotaron, usuarioActual.id] }
              : op
          );

          if (puedeGanarXP(`votar_encuesta_${postId}`)) {
            ganarXP(10, 'Votar en encuesta', `poll:${postId}`);
          }

          return {
            ...p,
            encuesta: { ...p.encuesta, totalVotos: p.encuesta.totalVotos + 1, opciones: nuevasOpciones },
          };
        }
        return p;
      })
    );
  };

  const agregarComentario = async (postId: string, contenido: string) => {
    if (!contenido.trim()) return;

    const nuevoComentario: Comentario = {
      id: `c-${Date.now()}`,
      postId,
      autor: usuarioActual,
      contenido: contenido.trim(),
      fecha: 'Ahora',
      likes: 0,
      usuariosLiked: [],
    };

    // 1. Actualización optimista instantánea
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, comentarios: [...p.comentarios, nuevoComentario] } : p
      )
    );

    // 2. Persistencia en Supabase y almacenamiento local
    await dbService.guardarComentario(postId, nuevoComentario);

    // 3. Otorgar XP de gamificación
    ganarXP(10, 'Comentar en una publicación', `comment:${nuevoComentario.id}`);
  };

  const toggleLikeComentario = (postId: string, comentarioId: string) => {
    let usuariosLikedFinal: string[] = [];
    setPosts((prevPosts) => {
      const actualizados = prevPosts.map((p) => {
        if (p.id === postId) {
          const nuevosComentarios = p.comentarios.map((c) => {
            if (c.id === comentarioId) {
              const yaDioLike = (c.usuariosLiked || []).includes(usuarioActual.id);
              const nuevosUsuariosLiked = yaDioLike
                ? (c.usuariosLiked || []).filter((id) => id !== usuarioActual.id)
                : Array.from(new Set([...(c.usuariosLiked || []), usuarioActual.id]));
              const nuevosLikes = Math.max(0, nuevosUsuariosLiked.length);

              if (!yaDioLike && puedeGanarXP(`like_comentario_${comentarioId}`)) {
                ganarXP(3, 'Dar Me Gusta a un comentario', `like_comment:${comentarioId}`);
              }

              usuariosLikedFinal = nuevosUsuariosLiked;
              return {
                ...c,
                likes: nuevosLikes,
                usuariosLiked: nuevosUsuariosLiked,
              };
            }
            return c;
          });
          return { ...p, comentarios: nuevosComentarios };
        }
        return p;
      });

      try {
        localStorage.setItem('community_posts', JSON.stringify(actualizados));
      } catch (_) {}

      return actualizados;
    });

    try {
      const mapStr = localStorage.getItem('community_comment_likes_map') || '{}';
      const mapObj = JSON.parse(mapStr);
      mapObj[comentarioId] = usuariosLikedFinal;
      localStorage.setItem('community_comment_likes_map', JSON.stringify(mapObj));
    } catch (_) {}

    try {
      if (supabase) {
        const canal = supabase.channel('realtime-sync-channel');
        canal.send({
          type: 'broadcast',
          event: 'like_comentario',
          payload: {
            postId,
            comentarioId,
            usuariosLiked: usuariosLikedFinal,
          },
        });
      }
    } catch (_) {}

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bcOut = new BroadcastChannel('community_sync_channel');
        bcOut.postMessage({
          type: 'like_comentario',
          payload: { postId, comentarioId, usuariosLiked: usuariosLikedFinal },
        });
        bcOut.close();
      }
    } catch (_) {}
  };

  const eliminarComentario = async (postId: string, comentarioId: string) => {
    setPosts((prevPosts) => {
      const actualizados = prevPosts.map((p) =>
        p.id === postId
          ? { ...p, comentarios: (p.comentarios || []).filter((c) => c.id !== comentarioId) }
          : p
      );
      localStorage.setItem('community_posts', JSON.stringify(actualizados));
      return actualizados;
    });

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bcOut = new BroadcastChannel('community_sync_channel');
        bcOut.postMessage({ type: 'eliminar_comentario', payload: { postId, comentarioId } });
        bcOut.close();
      }
    } catch (_) {}

    await dbService.eliminarComentario(postId, comentarioId);
  };

  const eliminarPost = async (postId: string) => {
    const postAEliminar = posts.find((p) => p.id === postId);
    const authorId = postAEliminar?.autor?.id || (postAEliminar as any)?.autorId;
    const actualizados = posts.filter((p) => p.id !== postId);
    setPosts(actualizados);
    await dbService.eliminarPost(postId, usuarioActual?.id, authorId);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bcOut = new BroadcastChannel('community_sync_channel');
        bcOut.postMessage({ type: 'eliminar_post', payload: postId });
        bcOut.close();
      }
    } catch (_) {}
  };

  const editarPost = async (postActualizado: Post) => {
    const actualizados = posts.map((p) => (p.id === postActualizado.id ? postActualizado : p));
    setPosts(actualizados);
    await dbService.guardarPost(postActualizado);
    await dbService.sincronizarFeedCompleto(actualizados);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bcOut = new BroadcastChannel('community_sync_channel');
        bcOut.postMessage({ type: 'reemplazar_feed', payload: actualizados });
        bcOut.close();
      }
    } catch (_) {}
  };

  const toggleFijarPost = (postId: string) => {
    let nuevoFijado = false;
    setPosts((prev) => {
      const target = prev.find((p) => p.id === postId);
      if (!target) return prev;
      nuevoFijado = !target.fijado;
      const actualizados = prev.map((p) =>
        p.id === postId ? { ...p, fijado: nuevoFijado } : p
      );
      localStorage.setItem('community_posts', JSON.stringify(actualizados));
      return actualizados;
    });

    // Guardar en la lista de posts fijados en localStorage y emitir por BroadcastChannel
    try {
      const fijadosStr = localStorage.getItem('community_posts_fijados') || '[]';
      const fijados: string[] = JSON.parse(fijadosStr);
      let nuevosFijados: string[];
      if (nuevoFijado) {
        nuevosFijados = Array.from(new Set([...fijados, postId]));
      } else {
        nuevosFijados = fijados.filter((id) => id !== postId);
      }
      localStorage.setItem('community_posts_fijados', JSON.stringify(nuevosFijados));

      if (typeof BroadcastChannel !== 'undefined') {
        const bcOut = new BroadcastChannel('community_sync_channel');
        bcOut.postMessage({
          type: 'editar_post',
          payload: { id: postId, fijado: nuevoFijado },
        });
        bcOut.close();
      }
    } catch (_) {}

    if (supabase) {
      supabase
        .from('posts')
        .update({ is_pinned: nuevoFijado, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .then(() => console.info('[Admin] Post fijado/desfijado en Supabase'));
    }
  };

  const completarLeccion = (cursoId: string, leccionId: string) => {
    let yaCompletadaAntes = false;
    setCursos((prev) =>
      prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) => ({
            ...m,
            lecciones: m.lecciones.map((l) => {
              if (l.id === leccionId) {
                if (l.completada) yaCompletadaAntes = true;
                return { ...l, completada: true };
              }
              return l;
            }),
          }));
          return { ...c, modulos: nuevosMod };
        }
        return c;
      })
    );

    // Solo otorga XP la primera vez que se completa esta lección específica
    if (!yaCompletadaAntes && puedeGanarXP(`leccion_${cursoId}_${leccionId}`)) {
      ganarXP(25, 'Lección completada en el Aula', `lesson:${cursoId}:${leccionId}`);
    }
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

  const broadcastCursos = (cursosActualizados: Curso[]) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('community_sync_channel');
        bc.postMessage({ type: 'sync_cursos', payload: cursosActualizados });
        bc.close();
      }
    } catch (_) {}
  };

  const crearNuevoCurso = (nuevoCursoData: Omit<Curso, 'id' | 'progresoPorcentaje'>) => {
    const nuevoCurso: Curso = { ...nuevoCursoData, id: `curso-${Date.now()}`, progresoPorcentaje: 0 };
    const nuevosCursos = [...cursos, nuevoCurso];
    setCursos(nuevosCursos);
    localStorage.setItem('community_cursos', JSON.stringify(nuevosCursos));
    broadcastCursos(nuevosCursos);
    dbService.guardarCurso(nuevoCurso);

    // Notificación comunitaria de nuevo curso disponible
    agregarNotificacion({
      id: `notif-curso-${Date.now()}`,
      tipo: 'nivel_up',
      titulo: '¡Nuevo Curso Disponible en el Aula!',
      mensaje: `Se ha publicado el curso "${nuevoCurso.titulo}" (${nuevoCurso.categoria} · Nivel ${nuevoCurso.nivelRequerido}).`,
      fecha: 'Ahora',
      leida: false,
      enlaceTab: 'aula',
    });

    ganarXP(50, 'Crear nuevo curso', `course:${nuevoCurso.id}`);
  };

  const editarCurso = (cursoActualizado: Curso) => {
    setCursos((prev) => {
      const actualizados = prev.map((c) => (c.id === cursoActualizado.id ? cursoActualizado : c));
      localStorage.setItem('community_cursos', JSON.stringify(actualizados));
      broadcastCursos(actualizados);
      return actualizados;
    });
    dbService.guardarCurso(cursoActualizado);
  };

  const eliminarCurso = async (cursoId: string) => {
    setCursos((prev) => {
      const filtrados = prev.filter((c) => c.id !== cursoId);
      localStorage.setItem('community_cursos', JSON.stringify(filtrados));
      broadcastCursos(filtrados);
      return filtrados;
    });
    if (cursoSeleccionado?.id === cursoId) setCursoSeleccionado(null);
    await dbService.eliminarCurso(cursoId);
  };

  const reordenarCursos = (nuevosCursos: Curso[]) => {
    setCursos(nuevosCursos);
    localStorage.setItem('community_cursos', JSON.stringify(nuevosCursos));
    broadcastCursos(nuevosCursos);
    nuevosCursos.forEach((c) => {
      dbService.guardarCurso(c);
    });
  };

  const agregarModulo = (cursoId: string, tituloModulo: string) => {
    setCursos((prev) => {
      const actualizados = prev.map((c) => {
        if (c.id === cursoId) {
          const cursoAct = {
            ...c,
            modulos: [...c.modulos, { id: `mod-${Date.now()}`, titulo: tituloModulo, lecciones: [] }],
          };
          dbService.guardarCurso(cursoAct);
          return cursoAct;
        }
        return c;
      });
      localStorage.setItem('community_cursos', JSON.stringify(actualizados));
      broadcastCursos(actualizados);
      return actualizados;
    });
  };

  const editarModulo = (cursoId: string, moduloId: string, nuevoTitulo: string) => {
    setCursos((prev) => {
      const actualizados = prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) =>
            m.id === moduloId ? { ...m, titulo: nuevoTitulo.trim() } : m
          );
          const cursoAct = { ...c, modulos: nuevosMod };
          dbService.guardarCurso(cursoAct);
          return cursoAct;
        }
        return c;
      });
      localStorage.setItem('community_cursos', JSON.stringify(actualizados));
      broadcastCursos(actualizados);
      return actualizados;
    });
  };

  const eliminarModulo = (cursoId: string, moduloId: string) => {
    setCursos((prev) => {
      const actualizados = prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.filter((m) => m.id !== moduloId);
          const cursoAct = { ...c, modulos: nuevosMod };
          dbService.guardarCurso(cursoAct);
          return cursoAct;
        }
        return c;
      });
      localStorage.setItem('community_cursos', JSON.stringify(actualizados));
      broadcastCursos(actualizados);
      return actualizados;
    });
  };

  const reordenarModulos = (cursoId: string, origenIndex: number, destinoIndex: number) => {
    setCursos((prev) => {
      const actualizados = prev.map((c) => {
        if (c.id === cursoId) {
          if (origenIndex < 0 || origenIndex >= c.modulos.length || destinoIndex < 0 || destinoIndex >= c.modulos.length) {
            return c;
          }
          const modulosCopy = [...c.modulos];
          const [movido] = modulosCopy.splice(origenIndex, 1);
          modulosCopy.splice(destinoIndex, 0, movido);
          const cursoAct = { ...c, modulos: modulosCopy };
          dbService.guardarCurso(cursoAct);
          setCursoSeleccionado((prevSel) => (prevSel?.id === cursoId ? cursoAct : prevSel));
          return cursoAct;
        }
        return c;
      });
      localStorage.setItem('community_cursos', JSON.stringify(actualizados));
      broadcastCursos(actualizados);
      return actualizados;
    });
  };

  const agregarLeccion = (cursoId: string, moduloId: string, nuevaLeccion: Leccion) => {
    setCursos((prev) => {
      const actualizados = prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) =>
            m.id === moduloId ? { ...m, lecciones: [...m.lecciones, nuevaLeccion] } : m
          );
          const cursoAct = { ...c, modulos: nuevosMod };
          dbService.guardarCurso(cursoAct);
          return cursoAct;
        }
        return c;
      });
      localStorage.setItem('community_cursos', JSON.stringify(actualizados));
      broadcastCursos(actualizados);
      return actualizados;
    });
  };

  const editarLeccion = (cursoId: string, moduloId: string, leccionActualizada: Leccion) => {
    setCursos((prev) => {
      const actualizados = prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) => {
            if (m.id === moduloId) {
              return {
                ...m,
                lecciones: m.lecciones.map((l) =>
                  l.id === leccionActualizada.id ? leccionActualizada : l
                ),
              };
            }
            return m;
          });
          const cursoAct = { ...c, modulos: nuevosMod };
          dbService.guardarCurso(cursoAct);
          return cursoAct;
        }
        return c;
      });
      localStorage.setItem('community_cursos', JSON.stringify(actualizados));
      broadcastCursos(actualizados);
      return actualizados;
    });
  };

  const eliminarLeccion = (cursoId: string, leccionId: string) => {
    setCursos((prev) => {
      const actualizados = prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) => ({
            ...m,
            lecciones: m.lecciones.filter((l) => l.id !== leccionId),
          }));
          const cursoAct = { ...c, modulos: nuevosMod };
          dbService.guardarCurso(cursoAct);
          return cursoAct;
        }
        return c;
      });
      localStorage.setItem('community_cursos', JSON.stringify(actualizados));
      broadcastCursos(actualizados);
      return actualizados;
    });
  };

  const reordenarLecciones = (
    cursoId: string,
    moduloId: string,
    origenIndex: number,
    destinoIndex: number
  ) => {
    setCursos((prev) => {
      const actualizados = prev.map((c) => {
        if (c.id === cursoId) {
          const nuevosMod = c.modulos.map((m) => {
            if (m.id === moduloId) {
              if (origenIndex < 0 || origenIndex >= m.lecciones.length || destinoIndex < 0 || destinoIndex >= m.lecciones.length) {
                return m;
              }
              const leccionesCopy = [...m.lecciones];
              const [movida] = leccionesCopy.splice(origenIndex, 1);
              leccionesCopy.splice(destinoIndex, 0, movida);
              return { ...m, lecciones: leccionesCopy };
            }
            return m;
          });
          const cursoAct = { ...c, modulos: nuevosMod };
          dbService.guardarCurso(cursoAct);
          setCursoSeleccionado((prevSel) => (prevSel?.id === cursoId ? cursoAct : prevSel));
          return cursoAct;
        }
        return c;
      });
      localStorage.setItem('community_cursos', JSON.stringify(actualizados));
      broadcastCursos(actualizados);
      return actualizados;
    });
  };

  const toggleRSVPEvento = (eventoId: string) => {
    if (usuarioActual.rol === 'Admin' || modoVistaAdmin) return;
    let seUnio = false;
    setEventos((prev) => {
      const actualizados = prev.map((e) => {
        if (e.id === eventoId) {
          const yaEstaba = e.rsvpUsuarios.includes(usuarioActual.id);
          seUnio = !yaEstaba;
          const rsvps = yaEstaba
            ? e.rsvpUsuarios.filter((id) => id !== usuarioActual.id)
            : [...e.rsvpUsuarios, usuarioActual.id];
          const eventoAct = { ...e, rsvpUsuarios: rsvps };
          dbService.guardarEvento(eventoAct);
          return eventoAct;
        }
        return e;
      });
      localStorage.setItem('community_eventos', JSON.stringify(actualizados));
      return actualizados;
    });

    // Solo otorga XP la primera vez que confirma asistencia a ESTE evento
    if (seUnio && puedeGanarXP(`rsvp_evento_${eventoId}`)) {
      ganarXP(15, 'Confirmar asistencia a sesión en vivo', `rsvp:${eventoId}`);
    }
  };

  const crearNuevoEvento = async (nuevoEventoData: Omit<Evento, 'id' | 'rsvpUsuarios' | 'anfitrion'> & Partial<Pick<Evento, 'id' | 'rsvpUsuarios' | 'anfitrion'>>) => {
    let idValido = nuevoEventoData.id || '';
    const esUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idValido);
    if (!esUuid) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        idValido = crypto.randomUUID();
      } else {
        idValido = 'b0eebc99-9c0b-4ef8-bb6d-' + String(Date.now()).slice(-12).padStart(12, '0');
      }
    }

    const nuevoEvento: Evento = {
      ...nuevoEventoData,
      id: idValido,
      anfitrion: nuevoEventoData.anfitrion || usuarioActual,
      rsvpUsuarios: Array.isArray(nuevoEventoData.rsvpUsuarios) ? nuevoEventoData.rsvpUsuarios : [usuarioActual.id],
    };

    setEventos((prev) => {
      const idx = prev.findIndex((e) => e.id === nuevoEvento.id);
      const actualizados = idx >= 0
        ? prev.map((e) => (e.id === nuevoEvento.id ? nuevoEvento : e))
        : [...prev, nuevoEvento];
      localStorage.setItem('community_eventos', JSON.stringify(actualizados));
      return actualizados;
    });

    try {
      await dbService.guardarEvento(nuevoEvento);
    } catch (err) {
      // Revertir estado optimista si no se pudo persistir globalmente
      setEventos((prev) => {
        const filtrados = prev.filter((e) => e.id !== nuevoEvento.id);
        localStorage.setItem('community_eventos', JSON.stringify(filtrados));
        return filtrados;
      });
      throw err;
    }

    // Notificación de nueva sesión en el Calendario
    agregarNotificacion({
      id: `notif-evt-${Date.now()}`,
      tipo: 'evento',
      titulo: 'Nueva Sesión en Vivo Programada',
      mensaje: `${nuevoEvento.tipo}: "${nuevoEvento.titulo}". ¡Confirma tu asistencia en el Calendario!`,
      fecha: 'Ahora',
      leida: false,
      enlaceTab: 'calendario',
    });
  };

  const eliminarEvento = async (eventoId: string) => {
    setEventos((prev) => {
      const filtrados = prev.filter((e) => e.id !== eventoId);
      localStorage.setItem('community_eventos', JSON.stringify(filtrados));
      return filtrados;
    });

    try {
      const eliminadosStr = localStorage.getItem('community_eventos_eliminados') || '[]';
      const eliminadosIds: string[] = JSON.parse(eliminadosStr);
      if (!eliminadosIds.includes(eventoId)) {
        eliminadosIds.push(eventoId);
        localStorage.setItem('community_eventos_eliminados', JSON.stringify(eliminadosIds));
      }
    } catch (_) {}

    try {
      await dbService.eliminarEvento(eventoId);

      try {
        if (supabase) {
          const canal = supabase.channel('realtime-sync-channel');
          canal.send({
            type: 'broadcast',
            event: 'eliminar_evento',
            payload: { id: eventoId },
          });
        }
      } catch (_) {}

      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bcOut = new BroadcastChannel('community_sync_channel');
          bcOut.postMessage({ type: 'eliminar_evento', payload: { id: eventoId } });
          bcOut.close();
        }
      } catch (_) {}
    } catch (err: any) {
      alert(`No se pudo eliminar globalmente el evento. Posible problema de permisos/RLS en Supabase: ${err?.message || 'sin detalle'}`);

      try {
        if (supabase) {
          const perfilesMap = new Map(
            miembros.map((m) => [m.id, m])
          );
          const recargados = await dbService.cargarEventos(perfilesMap as any);
          setEventos(recargados || []);
          localStorage.setItem('community_eventos', JSON.stringify(recargados || []));
        }
      } catch (_) {}
    }
  };

  const cambiarRolMiembro = async (usuarioId: string, nuevoRol: RolUsuario) => {
    try {
      localStorage.setItem(`community_rol_${usuarioId}`, nuevoRol);
    } catch (_) {}

    setMiembros((prev) =>
      prev.map((m) => {
        if (m.id === usuarioId) {
          const actualizado = { ...m, rol: nuevoRol };
          if (usuarioActual.id === usuarioId) {
            setUsuarioActual(actualizado);
            setModoVistaAdmin(nuevoRol === 'Admin');
            localStorage.setItem('community_usuario', JSON.stringify(actualizado));
          }
          return actualizado;
        }
        return m;
      })
    );

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('community_sync_channel');
        bc.postMessage({ type: 'sync_rol', payload: { usuarioId, nuevoRol } });
        bc.close();
      }
    } catch (_) {}

    await dbService.guardarAdminMemberOverride(usuarioId, { rol: nuevoRol });
  };

  const calcularNivelDeXP = (xp: number): number => {
    if (xp >= 7500) return 9;
    if (xp >= 5000) return 8;
    if (xp >= 3500) return 7;
    if (xp >= 2000) return 6;
    if (xp >= 1000) return 5;
    if (xp >= 500) return 4;
    if (xp >= 250) return 3;
    if (xp >= 100) return 2;
    return 1;
  };

  const establecerXPMiembro = async (usuarioId: string, nuevoXP: number) => {
    const xpSeguro = Math.max(0, Math.round(Number(nuevoXP) || 0));
    const nuevoNivel = calcularNivelDeXP(xpSeguro);

    setMiembros((prev) => {
      const actualizados = prev.map((m) => {
        if (m.id === usuarioId) {
          const mActualizado = { ...m, xp: xpSeguro, nivel: nuevoNivel };
          if (usuarioActual.id === usuarioId) {
            setUsuarioActual(mActualizado);
            try {
              localStorage.setItem('community_usuario', JSON.stringify(mActualizado));
            } catch (_) {}
          }
          return mActualizado;
        }
        return m;
      });
      return actualizados.sort((a, b) => b.xp - a.xp);
    });

    try {
      localStorage.setItem(`community_xp_${usuarioId}`, String(xpSeguro));
      localStorage.setItem(`community_nivel_${usuarioId}`, String(nuevoNivel));
    } catch (_) {}

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('community_sync_channel');
        bc.postMessage({
          type: 'sync_xp',
          payload: { usuarioId, xp: xpSeguro, nivel: nuevoNivel },
        });
        bc.close();
      }
    } catch (_) {}

    // Persistir usando el sistema de override global del Admin y actualización directa
    await dbService.guardarAdminMemberOverride(usuarioId, { xp: xpSeguro, nivel: nuevoNivel });
  };

  const otorgarXPMiembro = (usuarioId: string, cantidad: number) => {
    const miembro = miembros.find((m) => m.id === usuarioId);
    const xpActual = miembro ? miembro.xp : 0;
    establecerXPMiembro(usuarioId, xpActual + cantidad);
  };

  const marcarNotificacionesLeidas = () => {
    setNotificaciones((prev) => {
      const actualizadas = prev.map((n) => ({ ...n, leida: true }));
      try {
        localStorage.setItem('community_notificaciones', JSON.stringify(actualizadas));
      } catch (_) {}
      return actualizadas;
    });
  };

  const archivarNotificacion = (notifId: string) => {
    setNotificaciones((prev) => {
      const actualizadas = prev.map((n) =>
        n.id === notifId ? { ...n, leida: true, archivada: true } : n
      );
      try {
        localStorage.setItem('community_notificaciones', JSON.stringify(actualizadas));
      } catch (_) {}
      return actualizadas;
    });
  };

  const archivarTodasNotificaciones = () => {
    setNotificaciones((prev) => {
      const actualizadas = prev.map((n) => ({ ...n, leida: true, archivada: true }));
      try {
        localStorage.setItem('community_notificaciones', JSON.stringify(actualizadas));
      } catch (_) {}
      return actualizadas;
    });
  };

  const desarchivarNotificacion = (notifId: string) => {
    setNotificaciones((prev) => {
      const actualizadas = prev.map((n) =>
        n.id === notifId ? { ...n, archivada: false } : n
      );
      try {
        localStorage.setItem('community_notificaciones', JSON.stringify(actualizadas));
      } catch (_) {}
      return actualizadas;
    });
  };

  const agregarNotificacion = (notif: Notificacion) => {
    // Las notificaciones comunitarias solo pueden originarse desde una cuenta
    // que la base de datos reconoce como administradora.
    if (usuarioActual.rol !== 'Admin') return;
    const notifAdmin: Notificacion = {
      ...notif,
      emisorId: usuarioActual.id,
      emisorRol: 'Admin',
    };
    setNotificaciones((prev) => {
      const filtradas = prev.filter((n) => n.id !== notifAdmin.id && n.emisorRol === 'Admin');
      const actualizadas = [notifAdmin, ...filtradas];
      try {
        localStorage.setItem('community_notificaciones', JSON.stringify(actualizadas));
      } catch (_) {}
      return actualizadas;
    });
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('community_sync_channel');
        bc.postMessage({ type: 'nueva_notificacion', payload: notifAdmin });
        bc.close();
      }
    } catch (_) {}
  };

  const enviarMensajeDirecto = (destinatarioId: string, texto: string) => {
    const nuevoMsg: MensajeDirecto = {
      id: crypto.randomUUID(),
      remitenteId: usuarioActual.id,
      destinatarioId,
      texto,
      timestamp: 'Ahora',
      leido: true,
    };
    setMensajesDirectos((prev) => {
      const actualizados = [...prev, nuevoMsg];
      localStorage.setItem('community_dms', JSON.stringify(actualizados));
      return actualizados;
    });
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bcOut = new BroadcastChannel('community_sync_channel');
        bcOut.postMessage({ type: 'nuevo_dm', payload: nuevoMsg });
        bcOut.close();
      }
    } catch (_) {}
    void dbService.guardarMensaje(nuevoMsg);
    ganarXP(5, 'Enviar mensaje directo', `message:${nuevoMsg.id}`);
  };

  const eliminarMensajeDirecto = (mensajeId: string) => {
    setMensajesDirectos((prev) => {
      const actualizados = prev.filter((m) => m.id !== mensajeId);
      localStorage.setItem('community_dms', JSON.stringify(actualizados));
      return actualizados;
    });
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bcOut = new BroadcastChannel('community_sync_channel');
        bcOut.postMessage({ type: 'eliminar_dm', payload: mensajeId });
        bcOut.close();
      }
    } catch (_) {}
  };

  const seleccionarComunidad = (id: string) => {
    const elegida = comunidadesDisponibles.find((item) => item.id === id);
    if (!elegida) return;
    communityService.guardarActiva(id);
    dbService.configurarComunidadActiva(id);
    setStorageCommunityId(id);
    setComunidadActivaId(id);
    setComunidad((prev) => ({ ...prev, ...elegida.settings, nombre: elegida.name || prev.nombre }));
  };

  const crearComunidad = async (nombre: string) => {
    const id = await communityService.crear(nombre);
    const lista = await communityService.listarOCrear(nombre);
    setComunidadesDisponibles(lista);
    const creada = lista.find((item) => item.id === id);
    communityService.guardarActiva(id);
    dbService.configurarComunidadActiva(id);
    setStorageCommunityId(id);
    setComunidadActivaId(id);
    if (creada) setComunidad((prev) => ({ ...prev, ...creada.settings, nombre: creada.name || nombre }));
  };

  const actualizarAjustesComunidad = async (nuevosAjustes: Partial<ComunidadMeta>) => {
    let actualizadoMeta: ComunidadMeta;
    setComunidad((prev) => {
      actualizadoMeta = { ...prev, ...nuevosAjustes };
      try {
        localStorage.setItem('community_comunidad_meta', JSON.stringify(actualizadoMeta));
      } catch (_) {}
      return actualizadoMeta;
    });

    if (supabase) {
      try {
        if (comunidadActivaId) {
          await communityService.actualizar(comunidadActivaId, { ...comunidad, ...nuevosAjustes });
        }
        const { data: { session } } = await supabase.auth.getSession();
        const adminId = session?.user?.id || usuarioActual?.id;
        if (adminId) {
          const { data: currentProfile } = await supabase.from('profiles').select('bio').eq('id', adminId).single();
          const currentEnvelope = parseBioEnvelope(currentProfile?.bio);
          const bioEnvelopeFinal = buildBioEnvelope(
            currentEnvelope.bio,
            currentEnvelope.posts,
            currentEnvelope.xp,
            currentEnvelope.nivel,
            currentEnvelope.deletedPosts,
            currentEnvelope.deletedComments,
            currentEnvelope.avatar,
            { ...comunidad, ...nuevosAjustes },
            categoriasLista
          );
          await supabase.from('profiles').update({ bio: bioEnvelopeFinal, updated_at: new Date().toISOString() }).eq('id', adminId);
          console.info('[Admin] Ajustes de comunidad sincronizados en Supabase:', nuevosAjustes);
        }
      } catch (err) {
        console.warn('Error sincronizando ajustes de comunidad en Supabase:', err);
      }
    }
  };

  const agregarCategoria = async (nombreCat: string) => {
    const limpia = nombreCat.trim();
    if (!limpia || categoriasLista.includes(limpia)) return;
    const nuevas = [...categoriasLista, limpia];
    setCategoriasLista(nuevas);
    try {
      localStorage.setItem('community_categorias', JSON.stringify(nuevas));
    } catch (_) {}

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminId = session?.user?.id || usuarioActual?.id;
        if (adminId) {
          const { data: currentProfile } = await supabase.from('profiles').select('bio').eq('id', adminId).single();
          const currentEnvelope = parseBioEnvelope(currentProfile?.bio);
          const bioEnvelopeFinal = buildBioEnvelope(
            currentEnvelope.bio,
            currentEnvelope.posts,
            currentEnvelope.xp,
            currentEnvelope.nivel,
            currentEnvelope.deletedPosts,
            currentEnvelope.deletedComments,
            currentEnvelope.avatar,
            currentEnvelope.communityMeta || comunidad,
            nuevas,
            currentEnvelope.nickname,
            currentEnvelope.rol,
            currentEnvelope.eventos,
            currentEnvelope.preguntasRegistro || preguntasRegistro,
            currentEnvelope.respuestasOnboarding,
            categoriasCursos
          );
          await supabase.from('profiles').update({ bio: bioEnvelopeFinal, updated_at: new Date().toISOString() }).eq('id', adminId);
        }
      } catch (err) {
        console.warn('Error guardando categoría en Supabase:', err);
      }
    }
  };

  const editarCategoria = async (viejoNombre: string, nuevoNombre: string) => {
    const limpia = nuevoNombre.trim();
    if (!limpia || limpia === viejoNombre) return;
    const nuevas = categoriasLista.map((c) => (c === viejoNombre ? limpia : c));
    setCategoriasLista(nuevas);
    if (categoriaSeleccionada === viejoNombre) {
      setCategoriaSeleccionada(limpia);
    }
    // Actualizar posts que tenían esta categoría
    setPosts((prev) =>
      prev.map((p) => (p.categoria === viejoNombre ? { ...p, categoria: limpia } : p))
    );
    try {
      localStorage.setItem('community_categorias', JSON.stringify(nuevas));
    } catch (_) {}

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminId = session?.user?.id || usuarioActual?.id;
        if (adminId) {
          const { data: currentProfile } = await supabase.from('profiles').select('bio').eq('id', adminId).single();
          const currentEnvelope = parseBioEnvelope(currentProfile?.bio);
          const bioEnvelopeFinal = buildBioEnvelope(
            currentEnvelope.bio,
            currentEnvelope.posts,
            currentEnvelope.xp,
            currentEnvelope.nivel,
            currentEnvelope.deletedPosts,
            currentEnvelope.deletedComments,
            currentEnvelope.avatar,
            currentEnvelope.communityMeta || comunidad,
            nuevas,
            currentEnvelope.nickname,
            currentEnvelope.rol,
            currentEnvelope.eventos,
            currentEnvelope.preguntasRegistro || preguntasRegistro,
            currentEnvelope.respuestasOnboarding,
            categoriasCursos
          );
          await supabase.from('profiles').update({ bio: bioEnvelopeFinal, updated_at: new Date().toISOString() }).eq('id', adminId);
        }
      } catch (err) {
        console.warn('Error actualizando categoría en Supabase:', err);
      }
    }
  };

  const eliminarCategoria = async (nombreCat: string) => {
    const nuevas = categoriasLista.filter((c) => c !== nombreCat);
    setCategoriasLista(nuevas);
    if (categoriaSeleccionada === nombreCat) {
      setCategoriaSeleccionada('Todos');
    }
    try {
      localStorage.setItem('community_categorias', JSON.stringify(nuevas));
    } catch (_) {}

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminId = session?.user?.id || usuarioActual?.id;
        if (adminId) {
          const { data: currentProfile } = await supabase.from('profiles').select('bio').eq('id', adminId).single();
          const currentEnvelope = parseBioEnvelope(currentProfile?.bio);
          const bioEnvelopeFinal = buildBioEnvelope(
            currentEnvelope.bio,
            currentEnvelope.posts,
            currentEnvelope.xp,
            currentEnvelope.nivel,
            currentEnvelope.deletedPosts,
            currentEnvelope.deletedComments,
            currentEnvelope.avatar,
            currentEnvelope.communityMeta || comunidad,
            nuevas,
            currentEnvelope.nickname,
            currentEnvelope.rol,
            currentEnvelope.eventos,
            currentEnvelope.preguntasRegistro || preguntasRegistro,
            currentEnvelope.respuestasOnboarding,
            categoriasCursos
          );
          await supabase.from('profiles').update({ bio: bioEnvelopeFinal, updated_at: new Date().toISOString() }).eq('id', adminId);
        }
      } catch (err) {
        console.warn('Error eliminando categoría en Supabase:', err);
      }
    }
  };

  const agregarCategoriaCurso = async (nombreCat: string) => {
    const limpia = nombreCat.trim();
    if (!limpia || categoriasCursos.includes(limpia)) return;
    const nuevas = [...categoriasCursos, limpia];
    setCategoriasCursos(nuevas);
    try {
      localStorage.setItem('community_categorias_cursos', JSON.stringify(nuevas));
    } catch (_) {}

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminId = session?.user?.id || usuarioActual?.id;
        if (adminId) {
          const { data: currentProfile } = await supabase.from('profiles').select('bio').eq('id', adminId).single();
          const currentEnvelope = parseBioEnvelope(currentProfile?.bio);
          const bioEnvelopeFinal = buildBioEnvelope(
            currentEnvelope.bio,
            currentEnvelope.posts,
            currentEnvelope.xp,
            currentEnvelope.nivel,
            currentEnvelope.deletedPosts,
            currentEnvelope.deletedComments,
            currentEnvelope.avatar,
            currentEnvelope.communityMeta || comunidad,
            categoriasLista,
            currentEnvelope.nickname,
            currentEnvelope.rol,
            currentEnvelope.eventos,
            currentEnvelope.preguntasRegistro || preguntasRegistro,
            currentEnvelope.respuestasOnboarding,
            nuevas
          );
          await supabase.from('profiles').update({ bio: bioEnvelopeFinal, updated_at: new Date().toISOString() }).eq('id', adminId);
        }
      } catch (err) {
        console.warn('Error guardando categoría de curso en Supabase:', err);
      }
    }
  };

  const editarCategoriaCurso = async (viejoNombre: string, nuevoNombre: string) => {
    const limpia = nuevoNombre.trim();
    if (!limpia || limpia === viejoNombre) return;
    const nuevas = categoriasCursos.map((c) => (c === viejoNombre ? limpia : c));
    setCategoriasCursos(nuevas);
    // Actualizar cursos que tenían esta categoría
    setCursos((prev) =>
      prev.map((c) => (c.categoria === viejoNombre ? { ...c, categoria: limpia } : c))
    );
    try {
      localStorage.setItem('community_categorias_cursos', JSON.stringify(nuevas));
    } catch (_) {}

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminId = session?.user?.id || usuarioActual?.id;
        if (adminId) {
          const { data: currentProfile } = await supabase.from('profiles').select('bio').eq('id', adminId).single();
          const currentEnvelope = parseBioEnvelope(currentProfile?.bio);
          const bioEnvelopeFinal = buildBioEnvelope(
            currentEnvelope.bio,
            currentEnvelope.posts,
            currentEnvelope.xp,
            currentEnvelope.nivel,
            currentEnvelope.deletedPosts,
            currentEnvelope.deletedComments,
            currentEnvelope.avatar,
            currentEnvelope.communityMeta || comunidad,
            categoriasLista,
            currentEnvelope.nickname,
            currentEnvelope.rol,
            currentEnvelope.eventos,
            currentEnvelope.preguntasRegistro || preguntasRegistro,
            currentEnvelope.respuestasOnboarding,
            nuevas
          );
          await supabase.from('profiles').update({ bio: bioEnvelopeFinal, updated_at: new Date().toISOString() }).eq('id', adminId);
        }
      } catch (err) {
        console.warn('Error actualizando categoría de curso en Supabase:', err);
      }
    }
  };

  const eliminarCategoriaCurso = async (nombreCat: string) => {
    const nuevas = categoriasCursos.filter((c) => c !== nombreCat);
    setCategoriasCursos(nuevas);
    try {
      localStorage.setItem('community_categorias_cursos', JSON.stringify(nuevas));
    } catch (_) {}

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminId = session?.user?.id || usuarioActual?.id;
        if (adminId) {
          const { data: currentProfile } = await supabase.from('profiles').select('bio').eq('id', adminId).single();
          const currentEnvelope = parseBioEnvelope(currentProfile?.bio);
          const bioEnvelopeFinal = buildBioEnvelope(
            currentEnvelope.bio,
            currentEnvelope.posts,
            currentEnvelope.xp,
            currentEnvelope.nivel,
            currentEnvelope.deletedPosts,
            currentEnvelope.deletedComments,
            currentEnvelope.avatar,
            currentEnvelope.communityMeta || comunidad,
            categoriasLista,
            currentEnvelope.nickname,
            currentEnvelope.rol,
            currentEnvelope.eventos,
            currentEnvelope.preguntasRegistro || preguntasRegistro,
            currentEnvelope.respuestasOnboarding,
            nuevas
          );
          await supabase.from('profiles').update({ bio: bioEnvelopeFinal, updated_at: new Date().toISOString() }).eq('id', adminId);
        }
      } catch (err) {
        console.warn('Error eliminando categoría de curso en Supabase:', err);
      }
    }
  };

  const guardarPreguntasRegistro = async (nuevas: { pregunta1: string; pregunta2: string }) => {
    setPreguntasRegistro(nuevas);
    try {
      localStorage.setItem('community_preguntas_registro', JSON.stringify(nuevas));
    } catch (_) {}

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminId = session?.user?.id || usuarioActual?.id;
        if (adminId) {
          const { data: currentProfile } = await supabase.from('profiles').select('bio').eq('id', adminId).single();
          const currentEnvelope = parseBioEnvelope(currentProfile?.bio);
          const bioEnvelopeFinal = buildBioEnvelope(
            currentEnvelope.bio,
            currentEnvelope.posts,
            currentEnvelope.xp,
            currentEnvelope.nivel,
            currentEnvelope.deletedPosts,
            currentEnvelope.deletedComments,
            currentEnvelope.avatar,
            currentEnvelope.communityMeta || comunidad,
            categoriasLista,
            currentEnvelope.nickname,
            currentEnvelope.rol,
            currentEnvelope.eventos,
            nuevas,
            currentEnvelope.respuestasOnboarding,
            categoriasCursos,
            disclaimerRegistro
          );
          await supabase.from('profiles').update({ bio: bioEnvelopeFinal, updated_at: new Date().toISOString() }).eq('id', adminId);
        }
      } catch (err) {
        console.warn('Error guardando preguntas de registro en Supabase:', err);
      }
    }
  };

  const guardarDisclaimerRegistro = async (nuevoTexto: string) => {
    setDisclaimerRegistro(nuevoTexto);
    try {
      localStorage.setItem('community_disclaimer_registro', nuevoTexto);
    } catch (_) {}

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminId = session?.user?.id || usuarioActual?.id;
        if (adminId) {
          const { data: currentProfile } = await supabase.from('profiles').select('bio').eq('id', adminId).single();
          const currentEnvelope = parseBioEnvelope(currentProfile?.bio);
          const bioEnvelopeFinal = buildBioEnvelope(
            currentEnvelope.bio,
            currentEnvelope.posts,
            currentEnvelope.xp,
            currentEnvelope.nivel,
            currentEnvelope.deletedPosts,
            currentEnvelope.deletedComments,
            currentEnvelope.avatar,
            currentEnvelope.communityMeta || comunidad,
            categoriasLista,
            currentEnvelope.nickname,
            currentEnvelope.rol,
            currentEnvelope.eventos,
            preguntasRegistro,
            currentEnvelope.respuestasOnboarding,
            categoriasCursos,
            nuevoTexto
          );
          await supabase.from('profiles').update({ bio: bioEnvelopeFinal, updated_at: new Date().toISOString() }).eq('id', adminId);
        }
      } catch (err) {
        console.warn('Error guardando disclaimer de registro en Supabase:', err);
      }
    }
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
        comunidadActivaId,
        comunidadesDisponibles,
        seleccionarComunidad,
        crearComunidad,
        niveles,
        modoVistaAdmin,
        setModoVistaAdmin,
        modalRegistroAbierto,
        setModalRegistroAbierto,
        modalAuthAbierto,
        setModalAuthAbierto,
        registrarNuevoMiembro,
        preguntasRegistro,
        guardarPreguntasRegistro,
        disclaimerRegistro,
        guardarDisclaimerRegistro,
        posts,
        categoriaSeleccionada,
        setCategoriaSeleccionada,
        categoriasLista,
        agregarCategoria,
        editarCategoria,
        eliminarCategoria,
        busqueda,
        setBusqueda,
        crearPost,
        toggleLikePost,
        votarEncuesta,
        agregarComentario,
        toggleLikeComentario,
        eliminarComentario,
        eliminarPost,
        editarPost,
        toggleFijarPost,
        cursos,
        cursoSeleccionado,
        setCursoSeleccionado,
        categoriasCursos,
        agregarCategoriaCurso,
        editarCategoriaCurso,
        eliminarCategoriaCurso,
        completarLeccion,
        toggleTaskChecklist,
        crearNuevoCurso,
        editarCurso,
        eliminarCurso,
        reordenarCursos,
        agregarModulo,
        editarModulo,
        eliminarModulo,
        reordenarModulos,
        agregarLeccion,
        editarLeccion,
        eliminarLeccion,
        reordenarLecciones,
        eventos,
        toggleRSVPEvento,
        crearNuevoEvento,
        eliminarEvento,
        miembros,
        setMiembros,
        cambiarRolMiembro,
        otorgarXPMiembro,
        establecerXPMiembro,
        notificaciones,
        marcarNotificacionesLeidas,
        archivarNotificacion,
        archivarTodasNotificaciones,
        desarchivarNotificacion,
        agregarNotificacion,
        mensajesDirectos,
        dmDrawerAbierto,
        setDmDrawerAbierto,
        usuarioChatActivo,
        setUsuarioChatActivo,
        enviarMensajeDirecto,
        eliminarMensajeDirecto,
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
