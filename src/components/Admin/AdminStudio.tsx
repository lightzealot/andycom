import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Pin,
  Settings,
  Sparkles,
  Video,
  X,
  ToggleLeft,
  ToggleRight,
  Upload,
  CheckCircle,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Tag,
  HelpCircle,
  Check,
} from 'lucide-react';
import type { Curso, Leccion, RolUsuario } from '../../types';
import { readFileAsDataURL, isImageFile } from '../../utils/fileUploader';
import { RichTextEditor } from '../UI/RichTextEditor';
import { formatVideoEmbedUrl, isDirectVideoUrl } from '../../utils/videoHelper';
import { uploadFile, uploadVideoFile } from '../../services/storageService';

export const AdminStudio: React.FC = () => {
  const {
    comunidad,
    cursos,
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
    posts,
    eliminarPost,
    toggleFijarPost,
    miembros,
    cambiarRolMiembro,
    otorgarXPMiembro,
    establecerXPMiembro,
    actualizarAjustesComunidad,
    modoVistaAdmin,
    setModoVistaAdmin,
    categoriasLista,
    agregarCategoria,
    editarCategoria,
    eliminarCategoria,
    categoriasCursos,
    agregarCategoriaCurso,
    editarCategoriaCurso,
    eliminarCategoriaCurso,
    preguntasRegistro,
    guardarPreguntasRegistro,
    disclaimerRegistro,
    guardarDisclaimerRegistro,
  } = useApp();

  // Estados de Drag & Drop para Cursos, Módulos y Lecciones en AdminStudio
  const [draggedCourseIdx, setDraggedCourseIdx] = useState<number | null>(null);
  const [dragOverCourseIdx, setDragOverCourseIdx] = useState<number | null>(null);

  const [draggedModInfo, setDraggedModInfo] = useState<{ cursoId: string; index: number } | null>(null);
  const [dragOverModInfo, setDragOverModInfo] = useState<{ cursoId: string; index: number } | null>(null);

  const [draggedLecInfo, setDraggedLecInfo] = useState<{ cursoId: string; moduloId: string; index: number } | null>(null);
  const [dragOverLecInfo, setDragOverLecInfo] = useState<{ cursoId: string; moduloId: string; index: number } | null>(null);

  // ── Estados para Edición de XP en Miembros ──
  const [editandoXPUsuarioId, setEditandoXPUsuarioId] = useState<string | null>(null);
  const [valorXPEdit, setValorXPEdit] = useState<number>(0);
  const [guardandoXP, setGuardandoXP] = useState(false);
  const [xpGuardadoFeedback, setXpGuardadoFeedback] = useState<string | null>(null);

  const handleMoverCursoAdmin = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= cursos.length) return;
    const nuevos = [...cursos];
    const [moved] = nuevos.splice(index, 1);
    nuevos.splice(target, 0, moved);
    reordenarCursos(nuevos);
  };

  const handleMoverModuloAdmin = (cursoId: string, modulos: any[], index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= modulos.length) return;
    reordenarModulos(cursoId, index, target);
  };

  const handleMoverLeccionAdmin = (cursoId: string, moduloId: string, lecciones: any[], index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= lecciones.length) return;
    reordenarLecciones(cursoId, moduloId, index, target);
  };

  const [pestanaAdmin, setPestanaAdmin] = useState<'metricas' | 'cursos' | 'miembros' | 'moderacion' | 'ajustes' | 'etiquetas'>('cursos');

  // ── Estados para Etiquetas & Onboarding ──
  const [nuevaCatFeed, setNuevaCatFeed] = useState('');
  const [editandoCatFeed, setEditandoCatFeed] = useState<{ viejoNombre: string; nuevoNombre: string } | null>(null);

  const [nuevaCatCursoStudio, setNuevaCatCursoStudio] = useState('');
  const [editandoCatCurso, setEditandoCatCurso] = useState<{ viejoNombre: string; nuevoNombre: string } | null>(null);

  const [pregunta1Edit, setPregunta1Edit] = useState('');
  const [pregunta2Edit, setPregunta2Edit] = useState('');
  const [guardandoPreguntas, setGuardandoPreguntas] = useState(false);
  const [guardadoPreguntasOk, setGuardadoPreguntasOk] = useState(false);

  const [disclaimerEdit, setDisclaimerEdit] = useState('');
  const [guardandoDisclaimer, setGuardandoDisclaimer] = useState(false);
  const [guardadoDisclaimerOk, setGuardadoDisclaimerOk] = useState(false);

  useEffect(() => {
    if (preguntasRegistro) {
      setPregunta1Edit(preguntasRegistro.pregunta1 || '');
      setPregunta2Edit(preguntasRegistro.pregunta2 || '');
    }
  }, [preguntasRegistro]);

  useEffect(() => {
    if (disclaimerRegistro) {
      setDisclaimerEdit(disclaimerRegistro);
    }
  }, [disclaimerRegistro]);

  const [leccionEditando, setLeccionEditando] = useState<Leccion | null>(null);
  const [moduloEditando, setModuloEditando] = useState<{ cursoId: string; moduloId: string; titulo: string } | null>(null);

  const fileInputBannerRef = useRef<HTMLInputElement>(null);
  const fileInputCursoRef = useRef<HTMLInputElement>(null);

  const [modalCurso, setModalCurso] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [tituloCurso, setTituloCurso] = useState('');
  const [descripcionCurso, setDescripcionCurso] = useState('');
  const [categoriaCurso, setCategoriaCurso] = useState('Análisis Técnico');
  const [nuevaCatCurso, setNuevaCatCurso] = useState('');
  const [modoNuevaCatCurso, setModoNuevaCatCurso] = useState(false);
  const [nivelRequerido, setNivelRequerido] = useState(1);
  const [imagenCurso, setImagenCurso] = useState('');

  const categoriasCursosAdmin = Array.from(
    new Set([
      'Fundamentos',
      'Análisis Técnico',
      'Psicotrading & Riesgo',
      'Estrategias Avanzadas',
      ...cursos.map((c) => c.categoria).filter(Boolean),
    ])
  );

  const [modalLeccion, setModalLeccion] = useState(false);
  const [cursoIdParaLeccion, setCursoIdParaLeccion] = useState<string>('');
  const [moduloIdParaLeccion, setModuloIdParaLeccion] = useState<string>('');
  const [tituloLeccion, setTituloLeccion] = useState('');
  const [duracionLeccion, setDuracionLeccion] = useState('15:00 min');
  const [videoUrlLeccion, setVideoUrlLeccion] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [subiendoVideoLeccion, setSubiendoVideoLeccion] = useState(false);
  const [tipoFuenteVideo, setTipoFuenteVideo] = useState<'link' | 'subir'>('link');
  const fileInputVideoRef = useRef<HTMLInputElement>(null);
  const [resumenLeccion, setResumenLeccion] = useState('');
  const [tareasTexto, setTareasTexto] = useState('Revisar gráfico en TradingView\nAnotar trade en la bitácora');

  const [modalModulo, setModalModulo] = useState(false);
  const [cursoIdParaModulo, setCursoIdParaModulo] = useState<string>('');
  const [tituloModulo, setTituloModulo] = useState('');

  const [nombreComunidad, setNombreComunidad] = useState(comunidad.nombre);
  const [taglineComunidad, setTaglineComunidad] = useState(comunidad.tagline);
  const [descComunidad, setDescComunidad] = useState(comunidad.descripcion);
  const [bannerComunidad, setBannerComunidad] = useState(comunidad.banner);

  const handleFileUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isImageFile(file)) return;
    try {
      const { url } = await uploadFile(file, 'banners');
      setBannerComunidad(url);
      await actualizarAjustesComunidad({ banner: url });
      alert('¡Banner de portada actualizado exitosamente para todos los miembros y visitantes!');
    } catch (err) {
      alert('Error al cargar la imagen de portada.');
    }
  };

  const handleFileUploadCurso = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isImageFile(file)) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      setImagenCurso(dataUrl);
    } catch (err) {
      alert('Error al cargar la portada del curso.');
    }
  };

  const handleGuardarCurso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloCurso.trim()) return;

    const categoriaFinal = modoNuevaCatCurso && nuevaCatCurso.trim()
      ? nuevaCatCurso.trim()
      : (categoriaCurso || 'Análisis Técnico');

    if (cursoEditando) {
      editarCurso({
        ...cursoEditando,
        titulo: tituloCurso,
        descripcion: descripcionCurso,
        categoria: categoriaFinal,
        nivelRequerido: Number(nivelRequerido),
        imagen: imagenCurso.trim() || cursoEditando.imagen,
      });
      setCursoEditando(null);
    } else {
      crearNuevoCurso({
        titulo: tituloCurso,
        descripcion: descripcionCurso,
        categoria: categoriaFinal,
        nivelRequerido: Number(nivelRequerido),
        imagen: imagenCurso.trim() || '/raxen-banner.png',
        modulos: [
          {
            id: `mod-${Date.now()}`,
            titulo: 'Módulo 1: Introducción a la Estrategia',
            lecciones: [],
          },
        ],
      });
    }

    setModalCurso(false);
    setTituloCurso('');
    setDescripcionCurso('');
    setNuevaCatCurso('');
    setModoNuevaCatCurso(false);
  };

  const handleAbrirEditarCurso = (c: Curso) => {
    setCursoEditando(c);
    setTituloCurso(c.titulo);
    setDescripcionCurso(c.descripcion);
    setCategoriaCurso(c.categoria);
    setModoNuevaCatCurso(false);
    setNuevaCatCurso('');
    setNivelRequerido(c.nivelRequerido);
    setImagenCurso(c.imagen);
    setModalCurso(true);
  };

  const handleAbrirEditarModulo = (cursoId: string, moduloId: string, titulo: string) => {
    setCursoIdParaModulo(cursoId);
    setModuloEditando({ cursoId, moduloId, titulo });
    setTituloModulo(titulo);
    setModalModulo(true);
  };

  const handleGuardarModulo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloModulo.trim()) return;

    if (moduloEditando) {
      editarModulo(moduloEditando.cursoId, moduloEditando.moduloId, tituloModulo.trim());
      setModuloEditando(null);
    } else if (cursoIdParaModulo) {
      agregarModulo(cursoIdParaModulo, tituloModulo.trim());
    }

    setModalModulo(false);
    setTituloModulo('');
  };

  const handleAbrirEditarLeccion = (cursoId: string, moduloId: string, lec: Leccion) => {
    setCursoIdParaLeccion(cursoId);
    setModuloIdParaLeccion(moduloId);
    setLeccionEditando(lec);
    setTituloLeccion(lec.titulo);
    setDuracionLeccion(lec.duracion);
    setVideoUrlLeccion(lec.videoUrl);
    setResumenLeccion(lec.resumen || '');
    setTareasTexto(lec.checklist?.map((c) => c.texto).join('\n') || '');
    setModalLeccion(true);
  };

  const handleGuardarLeccion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloLeccion.trim() || !cursoIdParaLeccion || !moduloIdParaLeccion) return;

    const checklistItems = tareasTexto
      .split('\n')
      .filter((t) => t.trim() !== '')
      .map((t, idx) => ({
        id: `chk-${Date.now()}-${idx}`,
        texto: t.trim(),
        completado: false,
      }));

    const videoUrlFinal = isDirectVideoUrl(videoUrlLeccion.trim())
      ? videoUrlLeccion.trim()
      : formatVideoEmbedUrl(videoUrlLeccion.trim());

    if (leccionEditando) {
      editarLeccion(cursoIdParaLeccion, moduloIdParaLeccion, {
        ...leccionEditando,
        titulo: tituloLeccion.trim(),
        duracion: duracionLeccion.trim(),
        videoUrl: videoUrlFinal,
        resumen: resumenLeccion.trim(),
        checklist: checklistItems,
      });
      setLeccionEditando(null);
    } else {
      const nuevaLeccion: Leccion = {
        id: `lec-${Date.now()}`,
        titulo: tituloLeccion.trim(),
        duracion: duracionLeccion.trim(),
        videoUrl: videoUrlFinal,
        resumen: resumenLeccion.trim(),
        checklist: checklistItems,
        completada: false,
        recursos: [
          { id: `rec-${Date.now()}`, titulo: 'Plantilla_Trading_Andy.pdf', tipo: 'pdf', url: '#' },
        ],
      };

      agregarLeccion(cursoIdParaLeccion, moduloIdParaLeccion, nuevaLeccion);
    }

    setModalLeccion(false);
    setTituloLeccion('');
    setResumenLeccion('');
    setTareasTexto('Revisar gráfico en TradingView\nAnotar trade en la bitácora');
  };

  const handleGuardarAjustes = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarAjustesComunidad({
      nombre: nombreComunidad,
      tagline: taglineComunidad,
      descripcion: descComunidad,
      banner: bannerComunidad,
    });
    alert('¡Ajustes de la comunidad actualizados exitosamente!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner with View Mode Switcher */}
      <div className="skool-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-black text-sky-400 flex items-center justify-center font-black text-2xl shadow-sm">
            R
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              Creator Studio & Superpoderes de Administrador
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Gestiona cursos, sube fotos de portada y modera {comunidad.nombre}.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModoVistaAdmin(!modoVistaAdmin)}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
            modoVistaAdmin
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {modoVistaAdmin ? (
            <>
              <ToggleRight className="w-5 h-5 text-blue-600" />
              <span>👑 Modo Admin Activo</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-gray-400" />
              <span>🎓 Modo Alumno</span>
            </>
          )}
        </button>
      </div>

      {/* Admin Tabs - Grid Responsivo organizado (Sin desplazamiento excesivo ni menús perdidos) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {[
          { id: 'cursos', label: 'Cursos & Aula', badge: `${cursos.length}`, icono: <BookOpen className="w-4 h-4" /> },
          { id: 'etiquetas', label: 'Etiquetas & Onboarding', badge: `${categoriasLista.length + categoriasCursos.length}`, icono: <Tag className="w-4 h-4" /> },
          { id: 'miembros', label: 'Miembros & Roles', badge: `${miembros.length}`, icono: <Users className="w-4 h-4" /> },
          { id: 'moderacion', label: 'Moderación Feed', badge: `${posts.length}`, icono: <Pin className="w-4 h-4" /> },
          { id: 'metricas', label: 'Estadísticas', badge: 'En vivo', icono: <TrendingUp className="w-4 h-4" /> },
          { id: 'ajustes', label: 'Portada & Ajustes', badge: 'Config', icono: <Settings className="w-4 h-4" /> },
        ].map((tab) => {
          const activo = pestanaAdmin === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPestanaAdmin(tab.id as any)}
              className={`p-3 rounded-2xl text-left flex flex-col justify-between gap-2 transition-all cursor-pointer border ${
                activo
                  ? 'bg-slate-950 text-white border-slate-900 shadow-md ring-2 ring-amber-400'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-xl ${activo ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.icono}
                </div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  activo ? 'bg-white/20 text-amber-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              </div>
              <div className="font-extrabold text-xs tracking-tight line-clamp-1">
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CURRICULUM BUILDER */}
      {pestanaAdmin === 'cursos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900">Cursos en el Aula ({cursos.length})</h2>
              <p className="text-xs text-gray-500 font-medium">Crea nuevos cursos, sube fotos de portada y añade lecciones.</p>
            </div>

            <button
              onClick={() => {
                setCursoEditando(null);
                setTituloCurso('');
                setDescripcionCurso('');
                setImagenCurso('');
                setModalCurso(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-black cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Crear Nuevo Curso
            </button>
          </div>

          <div className="space-y-6">
            {cursos.map((curso, cursoIdx) => {
              const isCourseDragging = draggedCourseIdx === cursoIdx;
              const isCourseDragOver = dragOverCourseIdx === cursoIdx;

              return (
                <div
                  key={curso.id}
                  draggable={true}
                  onDragStart={(e) => {
                    setDraggedCourseIdx(cursoIdx);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCourseIdx(cursoIdx);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedCourseIdx !== null && draggedCourseIdx !== cursoIdx) {
                      const nuevos = [...cursos];
                      const [moved] = nuevos.splice(draggedCourseIdx, 1);
                      nuevos.splice(cursoIdx, 0, moved);
                      reordenarCursos(nuevos);
                    }
                    setDraggedCourseIdx(null);
                    setDragOverCourseIdx(null);
                  }}
                  onDragEnd={() => {
                    setDraggedCourseIdx(null);
                    setDragOverCourseIdx(null);
                  }}
                  className={`skool-card p-6 space-y-6 bg-white transition-all ${
                    isCourseDragging
                      ? 'opacity-40 border-2 border-dashed border-blue-500 bg-blue-50/40'
                      : isCourseDragOver
                      ? 'border-2 border-blue-500 ring-2 ring-blue-300 shadow-md'
                      : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Course Drag Handle & Order Arrows */}
                      <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
                        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-900" title="Arrastrar curso">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoverCursoAdmin(cursoIdx, 'up')}
                            disabled={cursoIdx === 0}
                            className="p-0.5 text-gray-500 hover:text-gray-900 disabled:opacity-20 cursor-pointer rounded hover:bg-gray-200"
                            title="Mover curso arriba"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoverCursoAdmin(cursoIdx, 'down')}
                            disabled={cursoIdx === cursos.length - 1}
                            className="p-0.5 text-gray-500 hover:text-gray-900 disabled:opacity-20 cursor-pointer rounded hover:bg-gray-200"
                            title="Mover curso abajo"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <img
                        src={curso.imagen}
                        alt={curso.titulo}
                        onError={(e) => {
                          e.currentTarget.src = '/raxen-banner.png';
                        }}
                        className="w-20 h-14 rounded-xl object-cover ring-1 ring-gray-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-gray-900">{curso.titulo}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
                            Nivel N{curso.nivelRequerido}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-normal">{curso.descripcion}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAbrirEditarCurso(curso)}
                        className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => {
                          setCursoIdParaModulo(curso.id);
                          setModalModulo(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar Módulo
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Estás seguro de eliminar el curso "${curso.titulo}"?`)) {
                            eliminarCurso(curso.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
                        title="Eliminar Curso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pl-2 sm:pl-6">
                    {(curso.modulos || []).map((modulo, modIdx) => {
                      const isModDragging = draggedModInfo?.cursoId === curso.id && draggedModInfo.index === modIdx;
                      const isModDragOver = dragOverModInfo?.cursoId === curso.id && dragOverModInfo.index === modIdx;

                      return (
                        <div
                          key={modulo.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDraggedModInfo({ cursoId: curso.id, index: modIdx });
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragOverModInfo({ cursoId: curso.id, index: modIdx });
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (draggedModInfo && draggedModInfo.cursoId === curso.id && draggedModInfo.index !== modIdx) {
                              reordenarModulos(curso.id, draggedModInfo.index, modIdx);
                            }
                            setDraggedModInfo(null);
                            setDragOverModInfo(null);
                          }}
                          onDragEnd={() => {
                            setDraggedModInfo(null);
                            setDragOverModInfo(null);
                          }}
                          className={`p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3 transition-all ${
                            isModDragging
                              ? 'opacity-40 border-dashed border-blue-400 bg-blue-50/50'
                              : isModDragOver
                              ? 'border-2 border-blue-500 bg-blue-50/80 shadow-xs'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {/* Module Drag Handle & Order Arrows */}
                              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-2xs" onClick={(e) => e.stopPropagation()}>
                                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-800" title="Arrastrar módulo">
                                  <GripVertical className="w-3.5 h-3.5" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleMoverModuloAdmin(curso.id, curso.modulos, modIdx, 'up')}
                                  disabled={modIdx === 0}
                                  className="p-0.5 text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                                  title="Mover módulo arriba"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoverModuloAdmin(curso.id, curso.modulos, modIdx, 'down')}
                                  disabled={modIdx === (curso.modulos?.length || 0) - 1}
                                  className="p-0.5 text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                                  title="Mover módulo abajo"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
                                {modulo.titulo}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleAbrirEditarModulo(curso.id, modulo.id, modulo.titulo)}
                                className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-blue-600 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                title="Editar nombre del módulo"
                              >
                                <Edit className="w-3 h-3" /> Editar
                              </button>
                              <button
                                onClick={() => {
                                  setCursoIdParaLeccion(curso.id);
                                  setModuloIdParaLeccion(modulo.id);
                                  setLeccionEditando(null);
                                  setTituloLeccion('');
                                  setResumenLeccion('');
                                  setModalLeccion(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-black text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Añadir Lección
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de eliminar el módulo "${modulo.titulo}" y todas sus lecciones?`)) {
                                    eliminarModulo(curso.id, modulo.id);
                                  }
                                }}
                                className="p-1 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-600 shadow-xs cursor-pointer"
                                title="Eliminar módulo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {(!modulo.lecciones || modulo.lecciones.length === 0) ? (
                              <p className="text-[11px] text-gray-400 italic">No hay lecciones en este módulo aún.</p>
                            ) : (
                              (modulo.lecciones || []).map((lec, lecIdx) => {
                                const isLecDragging =
                                  draggedLecInfo?.cursoId === curso.id &&
                                  draggedLecInfo.moduloId === modulo.id &&
                                  draggedLecInfo.index === lecIdx;
                                const isLecDragOver =
                                  dragOverLecInfo?.cursoId === curso.id &&
                                  dragOverLecInfo.moduloId === modulo.id &&
                                  dragOverLecInfo.index === lecIdx;

                                return (
                                  <div
                                    key={lec.id}
                                    draggable={true}
                                    onDragStart={(e) => {
                                      e.stopPropagation();
                                      setDraggedLecInfo({ cursoId: curso.id, moduloId: modulo.id, index: lecIdx });
                                      e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDragOverLecInfo({ cursoId: curso.id, moduloId: modulo.id, index: lecIdx });
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (
                                        draggedLecInfo &&
                                        draggedLecInfo.cursoId === curso.id &&
                                        draggedLecInfo.moduloId === modulo.id &&
                                        draggedLecInfo.index !== lecIdx
                                      ) {
                                        reordenarLecciones(curso.id, modulo.id, draggedLecInfo.index, lecIdx);
                                      }
                                      setDraggedLecInfo(null);
                                      setDragOverLecInfo(null);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedLecInfo(null);
                                      setDragOverLecInfo(null);
                                    }}
                                    className={`p-3 rounded-lg bg-white border border-gray-200 flex items-center justify-between text-xs shadow-xs transition-all ${
                                      isLecDragging
                                        ? 'opacity-40 border-dashed border-amber-400 bg-amber-50/50'
                                        : isLecDragOver
                                        ? 'border-2 border-amber-500 shadow-md'
                                        : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {/* Lesson Drag Handle & Up/Down Arrows */}
                                      <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200" onClick={(e) => e.stopPropagation()}>
                                        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-800" title="Arrastrar lección">
                                          <GripVertical className="w-3 h-3" />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleMoverLeccionAdmin(curso.id, modulo.id, modulo.lecciones, lecIdx, 'up')}
                                          disabled={lecIdx === 0}
                                          className="p-0.5 text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                                          title="Mover lección arriba"
                                        >
                                          <ChevronUp className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleMoverLeccionAdmin(curso.id, modulo.id, modulo.lecciones, lecIdx, 'down')}
                                          disabled={lecIdx === (modulo.lecciones?.length || 0) - 1}
                                          className="p-0.5 text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                                          title="Mover lección abajo"
                                        >
                                          <ChevronDown className="w-2.5 h-2.5" />
                                        </button>
                                      </div>

                                      <Video className="w-4 h-4 text-blue-600 shrink-0" />
                                      <div>
                                        <div className="font-bold text-gray-900">{lec.titulo}</div>
                                        <div className="text-[10px] text-gray-500 font-mono font-medium">
                                          ⏱️ {lec.duracion} • {lec.checklist?.length || 0} tareas prácticas
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleAbrirEditarLeccion(curso.id, modulo.id, lec)}
                                        className="text-gray-400 hover:text-blue-600 p-1 rounded cursor-pointer"
                                        title="Editar lección"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(`¿Eliminar la lección "${lec.titulo}"?`)) {
                                            eliminarLeccion(curso.id, lec.id);
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1 rounded cursor-pointer"
                                        title="Eliminar lección"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MEMBER MANAGEMENT */}
      {pestanaAdmin === 'miembros' && (
        <div className="skool-card p-6 sm:p-7 space-y-6 bg-white border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" /> Miembros & Gamificación
              </div>
              <h2 className="text-lg font-black text-gray-900">Gestión de Miembros & Control de XP ({miembros.length})</h2>
              <p className="text-xs text-gray-500 font-medium">Asigna roles, ajusta puntos XP de forma exacta o mediante bonificaciones instantáneas.</p>
            </div>

            {xpGuardadoFeedback && (
              <div className="p-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-2 animate-in fade-in shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{xpGuardadoFeedback}</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Miembro</th>
                  <th className="py-3 px-4">Rol en Comunidad</th>
                  <th className="py-3 px-4">Puntos XP & Nivel</th>
                  <th className="py-3 px-4">Cambiar Rol</th>
                  <th className="py-3 px-4 text-right">Modificar / Bonificar XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {miembros.map((m) => {
                  const esAdminProtegido =
                    (m.email && m.email.toLowerCase() === 'agomez87@gmail.com') ||
                    m.id === 'admin' ||
                    m.id === '155d43f8-9a80-4e5e-8713-3fc52708c1d0';

                  const estaEditandoXP = editandoXPUsuarioId === m.id;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Miembro */}
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={m.avatar}
                          alt={m.nombre}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nombre)}&background=0D0D0D&color=38bdf8&size=128`;
                          }}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200 shadow-2xs"
                        />
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span>{m.nombre}</span>
                            {esAdminProtegido && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.2 rounded-md border border-amber-300">
                                Fundador
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono font-medium">{m.nickname}</div>
                        </div>
                      </td>

                      {/* Rol Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1 shadow-2xs ${
                            m.rol === 'Admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : m.rol === 'Moderador'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : m.rol === 'VIP'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : m.rol === 'Miembro Pro'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {m.rol}
                        </span>
                      </td>

                      {/* XP & Nivel actual / Formulario de edición directa */}
                      <td className="py-3 px-4">
                        {estaEditandoXP ? (
                          <div className="flex items-center gap-1.5 bg-blue-50/80 p-1.5 rounded-xl border border-blue-200 w-fit">
                            <input
                              type="number"
                              min="0"
                              value={valorXPEdit}
                              onChange={(e) => setValorXPEdit(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-24 px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              placeholder="XP"
                              autoFocus
                            />
                            <button
                              type="button"
                              disabled={guardandoXP}
                              onClick={async () => {
                                setGuardandoXP(true);
                                await establecerXPMiembro(m.id, valorXPEdit);
                                setGuardandoXP(false);
                                setEditandoXPUsuarioId(null);
                                setXpGuardadoFeedback(`¡XP de ${m.nombre} actualizado a ${valorXPEdit} XP!`);
                                setTimeout(() => setXpGuardadoFeedback(null), 3500);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                              title="Guardar XP exacto"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditandoXPUsuarioId(null)}
                              className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs shadow-2xs">
                              <span>⚡ {m.xp} XP</span>
                              <span className="text-[10px] bg-amber-200/80 text-amber-950 px-1.5 py-0.2 rounded-md font-extrabold">
                                Nv. {m.nivel}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditandoXPUsuarioId(m.id);
                                setValorXPEdit(m.xp);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Editar XP de este usuario"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Cambiar Rol */}
                      <td className="py-3 px-4">
                        {esAdminProtegido ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            🔒 Fundador
                          </span>
                        ) : (
                          <select
                            value={m.rol}
                            onChange={async (e) => {
                              const nuevoRol = e.target.value as RolUsuario;
                              await cambiarRolMiembro(m.id, nuevoRol);
                              setXpGuardadoFeedback(`¡Rol de ${m.nombre} actualizado a ${nuevoRol}!`);
                              setTimeout(() => setXpGuardadoFeedback(null), 3500);
                            }}
                            className="px-2.5 py-1 bg-white border border-gray-300 hover:border-blue-500 rounded-lg text-gray-800 text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs transition-colors"
                          >
                            <option value="Admin">👑 Admin</option>
                            <option value="Moderador">🛡️ Moderador</option>
                            <option value="VIP">⭐ VIP</option>
                            <option value="Miembro Pro">⚡ Miembro Pro</option>
                            <option value="Miembro">👤 Miembro</option>
                          </select>
                        )}
                      </td>

                      {/* Modificar / Bonificar XP */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditandoXPUsuarioId(m.id);
                              setValorXPEdit(m.xp);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold hover:bg-black cursor-pointer text-xs shadow-2xs flex items-center gap-1"
                            title="Establecer XP personalizado"
                          >
                            <Edit className="w-3 h-3 text-amber-400" />
                            <span>Ajustar XP</span>
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              await establecerXPMiembro(m.id, Math.max(0, m.xp - 100));
                              setXpGuardadoFeedback(`-100 XP aplicados a ${m.nombre}`);
                              setTimeout(() => setXpGuardadoFeedback(null), 3000);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold hover:bg-rose-100 cursor-pointer text-xs"
                            title="Restar 100 XP"
                          >
                            -100
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              await otorgarXPMiembro(m.id, 100);
                              setXpGuardadoFeedback(`+100 XP otorgados a ${m.nombre}`);
                              setTimeout(() => setXpGuardadoFeedback(null), 3000);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold hover:bg-slate-200 cursor-pointer text-xs"
                            title="Sumar 100 XP"
                          >
                            +100
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              await otorgarXPMiembro(m.id, 500);
                              setXpGuardadoFeedback(`+500 XP otorgados a ${m.nombre}`);
                              setTimeout(() => setXpGuardadoFeedback(null), 3000);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black cursor-pointer text-xs shadow-2xs"
                            title="Sumar 500 XP"
                          >
                            +500
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FEED MODERATION */}
      {pestanaAdmin === 'moderacion' && (
        <div className="skool-card p-6 space-y-6 bg-white">
          <div>
            <h2 className="text-lg font-black text-gray-900">Moderación de Publicaciones ({posts.length})</h2>
            <p className="text-xs text-gray-500 font-medium">Fija anuncios prioritarios o elimina publicaciones.</p>
          </div>

          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {p.fijado && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-900 text-white font-bold text-[10px] uppercase">
                        Fijado
                      </span>
                    )}
                    <span className="font-extrabold text-xs text-gray-900 truncate">{p.titulo}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">Por {p.autor.nombre} • {p.categoria}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFijarPost(p.id)}
                    className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      p.fijado
                        ? 'bg-gray-200 border-gray-300 text-gray-900'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                    <span>{p.fijado ? 'Desfijar' : 'Fijar'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la publicación "${p.titulo}"?`)) {
                        eliminarPost(p.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: METRICS */}
      {pestanaAdmin === 'metricas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="skool-card p-6 space-y-2 bg-white">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase">
              <span>Traders Totales</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-gray-900">{comunidad.totalMiembros}</div>
            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Miembros Registrados
            </p>
          </div>

          <div className="skool-card p-6 space-y-2 bg-white">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase">
              <span>En Línea Hoy</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-gray-900">{comunidad.enLinea}</div>
            <p className="text-[11px] text-gray-500 font-medium">Activos en este momento</p>
          </div>

          <div className="skool-card p-6 space-y-2 bg-white">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase">
              <span>Tipo de Experiencia</span>
              <CheckCircle className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-gray-900">Experiencia Activa</div>
            <p className="text-[11px] text-gray-500 font-medium">Comunidad oficial</p>
          </div>

          <div className="skool-card p-6 space-y-2 bg-white">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase">
              <span>Cursos Publicados</span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-gray-900">{cursos.length}</div>
            <p className="text-[11px] text-blue-700 font-bold">100% Price Action</p>
          </div>
        </div>
      )}

      {/* TAB: ETIQUETAS & ONBOARDING */}
      {pestanaAdmin === 'etiquetas' && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="skool-card p-6 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white border border-amber-200/60">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" /> Configuración de Etiquetas & Bienvenida
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Gestión de Etiquetas del Feed, Categorías del Aula y Preguntas de Registro
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Personaliza las etiquetas de publicaciones, las categorías temáticas de los cursos y las 2 preguntas de bienvenida obligatorias al registrarse.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ── 1. Categorías del Feed (Publicaciones) ── */}
            <div className="skool-card p-6 space-y-5 bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>💬</span>
                    <span>Categorías del Feed ({categoriasLista.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Etiquetas disponibles para clasificar análisis, anuncios y debates.
                  </p>
                </div>
              </div>

              {/* Agregar nueva categoría al Feed */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!nuevaCatFeed.trim()) return;
                  await agregarCategoria(nuevaCatFeed.trim());
                  setNuevaCatFeed('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Nueva etiqueta (Ej: Scalping, Preguntas...)"
                  value={nuevaCatFeed}
                  onChange={(e) => setNuevaCatFeed(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!nuevaCatFeed.trim()}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </form>

              {/* Lista de categorías del Feed */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {categoriasLista.map((cat) => {
                  const countPosts = posts.filter((p) => p.categoria === cat || (!p.categoria && cat === 'General')).length;
                  const isEditing = editandoCatFeed?.viejoNombre === cat;

                  return (
                    <div
                      key={cat}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editandoCatFeed.nuevoNombre}
                            onChange={(e) =>
                              setEditandoCatFeed({ ...editandoCatFeed, nuevoNombre: e.target.value })
                            }
                            className="flex-1 px-2.5 py-1 bg-white border border-amber-400 rounded-lg text-xs font-bold text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (editandoCatFeed.nuevoNombre.trim()) {
                                await editarCategoria(cat, editandoCatFeed.nuevoNombre.trim());
                              }
                              setEditandoCatFeed(null);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                            title="Guardar cambio"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditandoCatFeed(null)}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-extrabold text-xs text-slate-900 truncate">
                              🏷️ {cat}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0">
                              {countPosts} {countPosts === 1 ? 'post' : 'posts'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditandoCatFeed({ viejoNombre: cat, nuevoNombre: cat })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Editar nombre"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {categoriasLista.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`¿Eliminar la categoría "${cat}"?`)) {
                                    eliminarCategoria(cat);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Eliminar categoría"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 2. Categorías del Aula (Cursos) ── */}
            <div className="skool-card p-6 space-y-5 bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>📚</span>
                    <span>Categorías del Aula ({categoriasCursos.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Módulos y categorías temáticas para organizar los cursos y lecciones.
                  </p>
                </div>
              </div>

              {/* Agregar nueva categoría al Aula */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!nuevaCatCursoStudio.trim()) return;
                  await agregarCategoriaCurso(nuevaCatCursoStudio.trim());
                  setNuevaCatCursoStudio('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Nueva categoría de curso (Ej: Psicotrading, Crypto...)"
                  value={nuevaCatCursoStudio}
                  onChange={(e) => setNuevaCatCursoStudio(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!nuevaCatCursoStudio.trim()}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </form>

              {/* Lista de categorías del Aula */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {categoriasCursos.map((cat) => {
                  const countCursos = cat === 'Todos' ? cursos.length : cursos.filter((c) => c.categoria === cat).length;
                  const isEditing = editandoCatCurso?.viejoNombre === cat;

                  return (
                    <div
                      key={cat}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editandoCatCurso.nuevoNombre}
                            onChange={(e) =>
                              setEditandoCatCurso({ ...editandoCatCurso, nuevoNombre: e.target.value })
                            }
                            className="flex-1 px-2.5 py-1 bg-white border border-amber-400 rounded-lg text-xs font-bold text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (editandoCatCurso.nuevoNombre.trim()) {
                                await editarCategoriaCurso(cat, editandoCatCurso.nuevoNombre.trim());
                              }
                              setEditandoCatCurso(null);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                            title="Guardar cambio"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditandoCatCurso(null)}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-extrabold text-xs text-slate-900 truncate">
                              📁 {cat}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold shrink-0">
                              {countCursos} {countCursos === 1 ? 'curso' : 'cursos'}
                            </span>
                          </div>

                          {cat !== 'Todos' && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setEditandoCatCurso({ viejoNombre: cat, nuevoNombre: cat })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Editar nombre"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`¿Eliminar la categoría "${cat}" del Aula?`)) {
                                    eliminarCategoriaCurso(cat);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Eliminar categoría"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ── 3. Preguntas de Registro / Onboarding ── */}
            <div className="skool-card p-6 sm:p-7 bg-white border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                    <HelpCircle className="w-3.5 h-3.5" /> Preguntas de Registro
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Preguntas de Bienvenida
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Estas 2 preguntas se le formularán a cada usuario al momento de crear su cuenta y se mostrarán en su perfil.
                  </p>
                </div>
              </div>

              {guardadoPreguntasOk && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Preguntas de registro guardadas y sincronizadas!</span>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!pregunta1Edit.trim() || !pregunta2Edit.trim()) return;
                  setGuardandoPreguntas(true);
                  await guardarPreguntasRegistro({
                    pregunta1: pregunta1Edit.trim(),
                    pregunta2: pregunta2Edit.trim(),
                  });
                  setGuardandoPreguntas(false);
                  setGuardadoPreguntasOk(true);
                  setTimeout(() => setGuardadoPreguntasOk(false), 3500);
                }}
                className="space-y-4 text-xs font-bold"
              >
                <div>
                  <label className="block text-slate-800 mb-1.5 font-black">
                    Pregunta 1 de Registro (Ej: Experiencia)
                  </label>
                  <input
                    type="text"
                    value={pregunta1Edit}
                    onChange={(e) => setPregunta1Edit(e.target.value)}
                    placeholder="¿Cuál es tu nivel de experiencia en trading?"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 mb-1.5 font-black">
                    Pregunta 2 de Registro (Ej: Objetivo)
                  </label>
                  <input
                    type="text"
                    value={pregunta2Edit}
                    onChange={(e) => setPregunta2Edit(e.target.value)}
                    placeholder="¿Cuál es tu principal objetivo en la comunidad?"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={guardandoPreguntas || !pregunta1Edit.trim() || !pregunta2Edit.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-black text-xs hover:bg-black transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {guardandoPreguntas ? (
                      <span>Guardando...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        <span>Guardar Preguntas</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ── 4. Disclaimer & Aviso Legal Obligatorio ── */}
            <div className="skool-card p-6 sm:p-7 bg-white border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-black uppercase tracking-wider">
                    <span>⚠️</span>
                    <span>Descargo de Responsabilidad (Disclaimer)</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Aviso Legal Obligatorio al Registrarse
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Texto que el usuario debe leer y confirmar escribiendo obligatoriamente la palabra <strong className="text-slate-900">"ACEPTO"</strong> antes de crear su cuenta.
                  </p>
                </div>
              </div>

              {guardadoDisclaimerOk && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Disclaimer legal de registro actualizado exitosamente!</span>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!disclaimerEdit.trim()) return;
                  setGuardandoDisclaimer(true);
                  await guardarDisclaimerRegistro(disclaimerEdit.trim());
                  setGuardandoDisclaimer(false);
                  setGuardadoDisclaimerOk(true);
                  setTimeout(() => setGuardadoDisclaimerOk(false), 3500);
                }}
                className="space-y-4 text-xs font-bold"
              >
                <div>
                  <label className="block text-slate-800 mb-1.5 font-black">
                    Texto del Disclaimer de Registro
                  </label>
                  <textarea
                    rows={4}
                    value={disclaimerEdit}
                    onChange={(e) => setDisclaimerEdit(e.target.value)}
                    placeholder='Escribe "ACEPTO" para confirmar que entiendes que Raxen Capital no garantiza rentabilidad y que eres responsable de tus decisiones.'
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                  💡 <strong>Regla:</strong> El usuario deberá escribir exactamente <code>ACEPTO</code> en el formulario de registro para habilitar el botón de crear cuenta.
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={guardandoDisclaimer || !disclaimerEdit.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-black text-xs hover:bg-black transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {guardandoDisclaimer ? (
                      <span>Guardando...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        <span>Guardar Disclaimer Legal</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PORTADA & AJUSTES */}
      {pestanaAdmin === 'ajustes' && (
        <div className="skool-card p-6 space-y-6 max-w-3xl bg-white">
          <div>
            <h2 className="text-lg font-black text-gray-900">Foto de Portada & Ajustes de {comunidad.nombre}</h2>
            <p className="text-xs text-gray-500 font-medium">Sube una foto de portada desde tu ordenador o edita los textos.</p>
          </div>

          {/* Banner Upload Card */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700">Foto de Portada / Banner Actual</label>
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black aspect-video max-h-52">
              <img
                src={bannerComunidad}
                alt="Banner"
                onError={(e) => {
                  e.currentTarget.src = '/raxen-banner.png';
                }}
                className="w-full h-full object-cover"
              />
              <input
                type="file"
                ref={fileInputBannerRef}
                onChange={handleFileUploadBanner}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputBannerRef.current?.click()}
                className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-black/80 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-all shadow-md"
              >
                <Upload className="w-4 h-4" /> Subir Nueva Foto de Portada
              </button>
            </div>
          </div>

          <form onSubmit={handleGuardarAjustes} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-gray-700 mb-1">Nombre de la Comunidad</label>
              <input
                type="text"
                value={nombreComunidad}
                onChange={(e) => setNombreComunidad(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={taglineComunidad}
                onChange={(e) => setTaglineComunidad(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Descripción</label>
              <textarea
                rows={3}
                value={descComunidad}
                onChange={(e) => setDescComunidad(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black shadow-xs"
              >
                Guardar Ajustes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CREAR/EDITAR CURSO */}
      {modalCurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="skool-card w-full max-w-2xl p-6 shadow-2xl relative bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h2 className="text-base font-black text-gray-900">
                {cursoEditando ? 'Editar Curso' : 'Crear Nuevo Curso para el Aula'}
              </h2>
              <button onClick={() => setModalCurso(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarCurso} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Título del Curso</label>
                <input
                  type="text"
                  placeholder="Ej: Scalping de Nasdaq en Apertura..."
                  value={tituloCurso}
                  onChange={(e) => setTituloCurso(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                />
              </div>

              <div>
                <RichTextEditor
                  label="Descripción & Temario del Curso"
                  value={descripcionCurso}
                  onChange={setDescripcionCurso}
                  placeholder="Resumen del temario, reglas clave y estrategia para los alumnos..."
                  minHeight="140px"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-gray-700">Categoría del Curso</label>
                    <button
                      type="button"
                      onClick={() => setModoNuevaCatCurso(!modoNuevaCatCurso)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {modoNuevaCatCurso ? '← Elegir existente' : '+ Crear nueva'}
                    </button>
                  </div>

                  {modoNuevaCatCurso ? (
                    <input
                      type="text"
                      placeholder="Ej: Scalping de Cripto, Smart Money..."
                      value={nuevaCatCurso}
                      onChange={(e) => setNuevaCatCurso(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <select
                      value={categoriaCurso}
                      onChange={(e) => setCategoriaCurso(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none"
                    >
                      {categoriasCursosAdmin.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Nivel de Desbloqueo</label>
                  <select
                    value={nivelRequerido}
                    onChange={(e) => setNivelRequerido(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none"
                  >
                    {[
                      { n: 1, xp: 0 },
                      { n: 2, xp: 100 },
                      { n: 3, xp: 250 },
                      { n: 4, xp: 500 },
                      { n: 5, xp: 1000 },
                      { n: 6, xp: 2000 },
                      { n: 7, xp: 3500 },
                      { n: 8, xp: 5000 },
                      { n: 9, xp: 7500 },
                    ].map(({ n, xp }) => (
                      <option key={n} value={n}>
                        Nivel {n} ({xp} XP Requeridos)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course Cover Photo File Upload */}
              <div className="space-y-1.5">
                <label className="block text-gray-700">Foto de Portada del Curso</label>
                <input
                  type="file"
                  ref={fileInputCursoRef}
                  onChange={handleFileUploadCurso}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputCursoRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 hover:bg-gray-200"
                  >
                    <Upload className="w-3.5 h-3.5" /> Subir desde Ordenador
                  </button>
                  <input
                    type="url"
                    placeholder="o pega una URL de imagen..."
                    value={imagenCurso}
                    onChange={(e) => setImagenCurso(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCurso(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold"
                >
                  {cursoEditando ? 'Actualizar Curso' : 'Guardar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR MÓDULO */}
      {modalModulo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="skool-card w-full max-w-md p-6 shadow-2xl relative bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h2 className="text-base font-black text-gray-900">
                {moduloEditando ? 'Editar Nombre del Módulo' : 'Añadir Nuevo Módulo al Temario'}
              </h2>
              <button
                onClick={() => {
                  setModalModulo(false);
                  setModuloEditando(null);
                  setTituloModulo('');
                }}
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarModulo} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Título del Módulo</label>
                <input
                  type="text"
                  placeholder="Ej: Módulo 3: Entradas de Alta Probabilidad..."
                  value={tituloModulo}
                  onChange={(e) => setTituloModulo(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalModulo(false);
                    setModuloEditando(null);
                    setTituloModulo('');
                  }}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold hover:bg-black"
                >
                  {moduloEditando ? 'Guardar Nombre' : 'Crear Módulo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR LECCIÓN */}
      {modalLeccion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="skool-card w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h2 className="text-base font-black text-gray-900">
                {leccionEditando ? 'Editar Lección' : 'Añadir Lección con Video & Notas'}
              </h2>
              <button
                onClick={() => {
                  setModalLeccion(false);
                  setLeccionEditando(null);
                }}
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarLeccion} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Título de la Lección</label>
                <input
                  type="text"
                  placeholder="Ej: 2.1 Identificación de Liquidez en Gráfico de 15m..."
                  value={tituloLeccion}
                  onChange={(e) => setTituloLeccion(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Duración Estimada</label>
                    <input
                      type="text"
                      value={duracionLeccion}
                      onChange={(e) => setDuracionLeccion(e.target.value)}
                      placeholder="Ej: 15:00 min"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-700">Video de la Lección</label>
                      <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setTipoFuenteVideo('link')}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            tipoFuenteVideo === 'link' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                          }`}
                        >
                          🔗 YouTube / Dailymotion / Loom
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoFuenteVideo('subir')}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            tipoFuenteVideo === 'subir' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                          }`}
                        >
                          📁 Subir Video (.mp4)
                        </button>
                      </div>
                    </div>

                    {tipoFuenteVideo === 'link' ? (
                      <input
                        type="url"
                        value={videoUrlLeccion}
                        onChange={(e) => setVideoUrlLeccion(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... o https://www.dailymotion.com/video/..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium text-xs"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputVideoRef}
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setSubiendoVideoLeccion(true);
                            try {
                              const { url } = await uploadVideoFile(file, 'courses');
                              setVideoUrlLeccion(url);
                            } catch (err) {
                              console.warn('Error al subir video:', err);
                              alert('No se pudo subir el archivo de video.');
                            } finally {
                              setSubiendoVideoLeccion(false);
                            }
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={subiendoVideoLeccion}
                          onClick={() => fileInputVideoRef.current?.click()}
                          className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{subiendoVideoLeccion ? 'Subiendo video...' : 'Seleccionar Video del Disco'}</span>
                        </button>
                        {videoUrlLeccion && isDirectVideoUrl(videoUrlLeccion) && (
                          <span className="text-[11px] font-bold text-emerald-600 truncate flex-1">
                            ✓ Video cargado
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <RichTextEditor
                  label="Notas y Contenido de la Lección (Editor Enriquecido)"
                  value={resumenLeccion}
                  onChange={setResumenLeccion}
                  placeholder="Explica los conceptos clave, reglas de entrada/salida, capturas del gráfico y recomendaciones..."
                  minHeight="160px"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Action Items / Checklist (1 tarea por línea)
                </label>
                <textarea
                  rows={3}
                  value={tareasTexto}
                  onChange={(e) => setTareasTexto(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalLeccion(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold"
                >
                  Guardar Lección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
