import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import type { Curso, Leccion, RolUsuario } from '../../types';
import { readFileAsDataURL, isImageFile } from '../../utils/fileUploader';
import { RichTextEditor } from '../UI/RichTextEditor';
import { formatVideoEmbedUrl } from '../../utils/videoHelper';

export const AdminStudio: React.FC = () => {
  const {
    comunidad,
    cursos,
    crearNuevoCurso,
    editarCurso,
    eliminarCurso,
    agregarModulo,
    editarModulo,
    eliminarModulo,
    agregarLeccion,
    editarLeccion,
    eliminarLeccion,
    posts,
    eliminarPost,
    toggleFijarPost,
    miembros,
    cambiarRolMiembro,
    otorgarXPMiembro,
    actualizarAjustesComunidad,
    modoVistaAdmin,
    setModoVistaAdmin,
  } = useApp();

  const [pestanaAdmin, setPestanaAdmin] = useState<'metricas' | 'cursos' | 'miembros' | 'moderacion' | 'ajustes'>('cursos');
  const [leccionEditando, setLeccionEditando] = useState<Leccion | null>(null);
  const [moduloEditando, setModuloEditando] = useState<{ cursoId: string; moduloId: string; titulo: string } | null>(null);

  const fileInputBannerRef = useRef<HTMLInputElement>(null);
  const fileInputCursoRef = useRef<HTMLInputElement>(null);

  const [modalCurso, setModalCurso] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [tituloCurso, setTituloCurso] = useState('');
  const [descripcionCurso, setDescripcionCurso] = useState('');
  const [categoriaCurso, setCategoriaCurso] = useState('Análisis Técnico');
  const [nivelRequerido, setNivelRequerido] = useState(1);
  const [imagenCurso, setImagenCurso] = useState('');

  const [modalLeccion, setModalLeccion] = useState(false);
  const [cursoIdParaLeccion, setCursoIdParaLeccion] = useState<string>('');
  const [moduloIdParaLeccion, setModuloIdParaLeccion] = useState<string>('');
  const [tituloLeccion, setTituloLeccion] = useState('');
  const [duracionLeccion, setDuracionLeccion] = useState('15:00 min');
  const [videoUrlLeccion, setVideoUrlLeccion] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
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
      const dataUrl = await readFileAsDataURL(file);
      setBannerComunidad(dataUrl);
      actualizarAjustesComunidad({ banner: dataUrl });
      alert('¡Banner de portada actualizado!');
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

    if (cursoEditando) {
      editarCurso({
        ...cursoEditando,
        titulo: tituloCurso,
        descripcion: descripcionCurso,
        categoria: categoriaCurso,
        nivelRequerido: Number(nivelRequerido),
        imagen: imagenCurso.trim() || cursoEditando.imagen,
      });
      setCursoEditando(null);
    } else {
      crearNuevoCurso({
        titulo: tituloCurso,
        descripcion: descripcionCurso,
        categoria: categoriaCurso,
        nivelRequerido: Number(nivelRequerido),
        imagen: imagenCurso.trim() || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
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
  };

  const handleAbrirEditarCurso = (c: Curso) => {
    setCursoEditando(c);
    setTituloCurso(c.titulo);
    setDescripcionCurso(c.descripcion);
    setCategoriaCurso(c.categoria);
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

    const videoUrlFinal = formatVideoEmbedUrl(videoUrlLeccion.trim());

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

      {/* Admin Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'cursos', label: 'Constructor de Cursos (Aula)', icono: <BookOpen className="w-4 h-4" /> },
          { id: 'miembros', label: 'Gestión de Miembros & Roles', icono: <Users className="w-4 h-4" /> },
          { id: 'moderacion', label: 'Moderación de Feed', icono: <Pin className="w-4 h-4" /> },
          { id: 'metricas', label: 'Estadísticas de Comunidad', icono: <TrendingUp className="w-4 h-4" /> },
          { id: 'ajustes', label: 'Portada & Textos Oficiales', icono: <Settings className="w-4 h-4" /> },
        ].map((tab) => {
          const activo = pestanaAdmin === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPestanaAdmin(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activo
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icono}
              <span>{tab.label}</span>
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
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-black"
            >
              <Plus className="w-4 h-4" /> Crear Nuevo Curso
            </button>
          </div>

          <div className="space-y-6">
            {cursos.map((curso) => (
              <div key={curso.id} className="skool-card p-6 space-y-6 bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={curso.imagen}
                      alt={curso.titulo}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800';
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
                      className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Edit className="w-4 h-4" /> Editar
                    </button>
                    <button
                      onClick={() => {
                        setCursoIdParaModulo(curso.id);
                        setModalModulo(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Módulo
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de eliminar el curso "${curso.titulo}"?`)) {
                          eliminarCurso(curso.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-red-600 hover:bg-red-50 text-xs font-bold"
                      title="Eliminar Curso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pl-2 sm:pl-6">
                  {(curso.modulos || []).map((modulo) => (
                    <div key={modulo.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
                          {modulo.titulo}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAbrirEditarModulo(curso.id, modulo.id, modulo.titulo)}
                            className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-blue-600 text-xs font-bold flex items-center gap-1 shadow-xs"
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
                            className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-black text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3 h-3" /> Añadir Lección
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar el módulo "${modulo.titulo}" y todas sus lecciones?`)) {
                                eliminarModulo(curso.id, modulo.id);
                              }
                            }}
                            className="p-1 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-600 shadow-xs"
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
                          (modulo.lecciones || []).map((lec) => (
                            <div
                              key={lec.id}
                              className="p-3 rounded-lg bg-white border border-gray-200 flex items-center justify-between text-xs shadow-xs"
                            >
                              <div className="flex items-center gap-3">
                                <Video className="w-4 h-4 text-blue-600" />
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
                                  className="text-gray-400 hover:text-blue-600 p-1 rounded"
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
                                  className="text-red-500 hover:text-red-700 p-1 rounded"
                                  title="Eliminar lección"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MEMBER MANAGEMENT */}
      {pestanaAdmin === 'miembros' && (
        <div className="skool-card p-6 space-y-6 bg-white">
          <div>
            <h2 className="text-lg font-black text-gray-900">Gestión de Miembros ({miembros.length})</h2>
            <p className="text-xs text-gray-500 font-medium">Asigna roles y otorga bonos de XP.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase">
                  <th className="py-3 px-4">Miembro</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Puntos XP</th>
                  <th className="py-3 px-4">Cambiar Rol</th>
                  <th className="py-3 px-4 text-right">Bonificación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {miembros.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={m.avatar}
                        alt={m.nombre}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nombre)}&background=0D0D0D&color=38bdf8&size=128`;
                        }}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{m.nombre}</div>
                        <div className="text-[10px] text-gray-500">{m.nickname}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 font-bold">
                        {m.rol}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-700">{m.xp} XP</td>
                    <td className="py-3 px-4">
                      <select
                        value={m.rol}
                        onChange={(e) => cambiarRolMiembro(m.id, e.target.value as RolUsuario)}
                        className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-800 text-xs font-bold"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Moderador">Moderador</option>
                        <option value="Miembro">Miembro</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => otorgarXPMiembro(m.id, 100)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-800 font-bold hover:bg-gray-200"
                      >
                        +100 XP
                      </button>
                      <button
                        onClick={() => otorgarXPMiembro(m.id, 500)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                      >
                        +500 XP
                      </button>
                    </td>
                  </tr>
                ))}
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
              <span>Tipo de Membresía</span>
              <CheckCircle className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-gray-900">Membresía Activa</div>
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
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200';
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Categoría</label>
                  <select
                    value={categoriaCurso}
                    onChange={(e) => setCategoriaCurso(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                  >
                    <option value="Fundamentos">Fundamentos</option>
                    <option value="Análisis Técnico">Análisis Técnico</option>
                    <option value="Psicotrading & Riesgo">Psicotrading & Riesgo</option>
                    <option value="Estrategias Avanzadas">Estrategias Avanzadas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Nivel Requerido</label>
                  <select
                    value={nivelRequerido}
                    onChange={(e) => setNivelRequerido(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        Nivel {n}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Duración Estimada</label>
                  <input
                    type="text"
                    value={duracionLeccion}
                    onChange={(e) => setDuracionLeccion(e.target.value)}
                    placeholder="Ej: 15:00 min"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">URL de Video (Enlace directo de YouTube, Shorts o Loom)</label>
                  <input
                    type="url"
                    value={videoUrlLeccion}
                    onChange={(e) => setVideoUrlLeccion(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                  />
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
