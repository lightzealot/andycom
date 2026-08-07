import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Users,
  DollarSign,
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
} from 'lucide-react';
import type { Curso, Leccion, RolUsuario } from '../../types';

export const AdminStudio: React.FC = () => {
  const {
    comunidad,
    cursos,
    crearNuevoCurso,
    editarCurso,
    eliminarCurso,
    agregarModulo,
    agregarLeccion,
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
  const [precioMensual, setPrecioMensual] = useState(comunidad.mrrEstimado ? 49 : 49);
  const [precioAnual, setPrecioAnual] = useState(399);

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

  const handleGuardarModulo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloModulo.trim() || !cursoIdParaModulo) return;
    agregarModulo(cursoIdParaModulo, tituloModulo.trim());
    setModalModulo(false);
    setTituloModulo('');
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

    const nuevaLeccion: Leccion = {
      id: `lec-${Date.now()}`,
      titulo: tituloLeccion.trim(),
      duracion: duracionLeccion.trim(),
      videoUrl: videoUrlLeccion.trim(),
      resumen: resumenLeccion.trim(),
      checklist: checklistItems,
      completada: false,
      recursos: [
        { id: `rec-${Date.now()}`, titulo: 'Plantilla_Trading_Andy.pdf', tipo: 'pdf', url: '#' },
      ],
    };

    agregarLeccion(cursoIdParaLeccion, moduloIdParaLeccion, nuevaLeccion);
    setModalLeccion(false);
    setTituloLeccion('');
    setResumenLeccion('');
  };

  const handleGuardarAjustes = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarAjustesComunidad({
      nombre: nombreComunidad,
      tagline: taglineComunidad,
      descripcion: descComunidad,
      mrrEstimado: precioMensual * comunidad.totalMiembros,
    });
    alert('¡Ajustes de la comunidad actualizados exitosamente!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner with View Mode Switcher */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-sm">
            👑
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Creator Studio & Superpoderes de Administrador
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Gestiona los cursos de trading, módulos, lecciones, roles de miembros y configuración de {comunidad.nombre}.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModoVistaAdmin(!modoVistaAdmin)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all border ${
            modoVistaAdmin
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          {modoVistaAdmin ? (
            <>
              <ToggleRight className="w-5 h-5 text-slate-950" />
              <span>Modo Vista: Administrador (Total)</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-amber-700" />
              <span>Modo Vista: Alumno (Nivel 1)</span>
            </>
          )}
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'cursos', label: 'Constructor de Cursos (LMS)', icono: <BookOpen className="w-4 h-4" /> },
          { id: 'miembros', label: 'Gestión de Miembros & Roles', icono: <Users className="w-4 h-4" /> },
          { id: 'moderacion', label: 'Moderación de Feed', icono: <Pin className="w-4 h-4" /> },
          { id: 'metricas', label: 'Analíticas & Finanzas (MRR)', icono: <TrendingUp className="w-4 h-4" /> },
          { id: 'ajustes', label: 'Ajustes & Precios', icono: <Settings className="w-4 h-4" /> },
        ].map((tab) => {
          const activo = pestanaAdmin === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPestanaAdmin(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                activo
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
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
              <h2 className="text-lg font-black text-slate-900">Cursos en el Classroom ({cursos.length})</h2>
              <p className="text-xs text-slate-600 font-medium">Crea nuevos cursos, añade módulos y sube lecciones con checklists.</p>
            </div>

            <button
              onClick={() => {
                setCursoEditando(null);
                setTituloCurso('');
                setDescripcionCurso('');
                setModalCurso(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xs hover:bg-amber-400"
            >
              <Plus className="w-4 h-4" /> Crear Nuevo Curso
            </button>
          </div>

          <div className="space-y-6">
            {cursos.map((curso) => (
              <div key={curso.id} className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-6 bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <img src={curso.imagen} alt={curso.titulo} className="w-20 h-14 rounded-2xl object-cover ring-1 ring-slate-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-slate-900">{curso.titulo}</h3>
                        <span className="px-2.5 py-0.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                          Nivel Requerido: N{curso.nivelRequerido}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-normal">{curso.descripcion}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAbrirEditarCurso(curso)}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-amber-800 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Edit className="w-4 h-4" /> Editar Curso
                    </button>
                    <button
                      onClick={() => {
                        setCursoIdParaModulo(curso.id);
                        setModalModulo(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Módulo
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de eliminar el curso "${curso.titulo}"?`)) {
                          eliminarCurso(curso.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-red-600 hover:bg-red-50 text-xs font-bold"
                      title="Eliminar Curso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pl-2 sm:pl-6">
                  {curso.modulos.map((modulo) => (
                    <div key={modulo.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-amber-900 uppercase tracking-wider">
                          {modulo.titulo}
                        </span>

                        <button
                          onClick={() => {
                            setCursoIdParaLeccion(curso.id);
                            setModuloIdParaLeccion(modulo.id);
                            setModalLeccion(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-amber-800 text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3 h-3" /> Añadir Lección
                        </button>
                      </div>

                      <div className="space-y-2">
                        {modulo.lecciones.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">No hay lecciones en este módulo aún.</p>
                        ) : (
                          modulo.lecciones.map((lec) => (
                            <div
                              key={lec.id}
                              className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs"
                            >
                              <div className="flex items-center gap-3">
                                <Video className="w-4 h-4 text-amber-600" />
                                <div>
                                  <div className="font-bold text-slate-900">{lec.titulo}</div>
                                  <div className="text-[10px] text-slate-500 font-mono font-medium">
                                    ⏱️ {lec.duracion} • {lec.checklist.length} tareas prácticas
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  if (confirm(`¿Eliminar la lección "${lec.titulo}"?`)) {
                                    eliminarLeccion(curso.id, lec.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Eliminar lección"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-6 bg-white shadow-xs">
          <div>
            <h2 className="text-lg font-black text-slate-900">Gestión de Miembros ({miembros.length})</h2>
            <p className="text-xs text-slate-600 font-medium">Asigna roles de moderación, membresía VIP y otorga bonos de XP.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-black uppercase">
                  <th className="py-3 px-4">Miembro</th>
                  <th className="py-3 px-4">Rol Actual</th>
                  <th className="py-3 px-4">Puntos XP</th>
                  <th className="py-3 px-4">Cambiar Rol</th>
                  <th className="py-3 px-4 text-right">Bonificación XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {miembros.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img src={m.avatar} alt={m.nombre} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">{m.nombre}</div>
                        <div className="text-[10px] text-slate-500">{m.nickname}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-black">
                        {m.rol}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-amber-800">{m.xp} XP</td>
                    <td className="py-3 px-4">
                      <select
                        value={m.rol}
                        onChange={(e) => cambiarRolMiembro(m.id, e.target.value as RolUsuario)}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs font-bold"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Moderador">Moderador</option>
                        <option value="VIP">VIP</option>
                        <option value="Miembro Pro">Miembro Pro</option>
                        <option value="Miembro">Miembro</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => otorgarXPMiembro(m.id, 100)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-amber-800 font-black hover:bg-amber-500 hover:text-slate-950 transition-all"
                      >
                        +100 XP
                      </button>
                      <button
                        onClick={() => otorgarXPMiembro(m.id, 500)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-emerald-800 font-black hover:bg-emerald-600 hover:text-white transition-all"
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
        <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-6 bg-white shadow-xs">
          <div>
            <h2 className="text-lg font-black text-slate-900">Moderación de Publicaciones del Feed ({posts.length})</h2>
            <p className="text-xs text-slate-600 font-medium">Fija anuncios prioritarios en la cima del feed o elimina posts inapropiados.</p>
          </div>

          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {p.fijado && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                        Fijado
                      </span>
                    )}
                    <span className="font-extrabold text-xs text-slate-900 truncate">{p.titulo}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1">Por {p.autor.nombre} • {p.categoria}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFijarPost(p.id)}
                    className={`p-2 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all ${
                      p.fijado
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
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
                    className="p-2 rounded-xl bg-white border border-slate-200 text-red-600 hover:bg-red-50"
                    title="Eliminar publicación"
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
          <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-2 bg-white shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
              <span>Traders Totales</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{comunidad.totalMiembros}</div>
            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18% este mes
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-2 bg-white shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
              <span>Activos en NY</span>
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{comunidad.miembrosActivosHoy}</div>
            <p className="text-[11px] text-slate-500 font-medium">31.3% de tasa de actividad diaria</p>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-2 bg-white shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
              <span>MRR Estimado</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-700">${comunidad.mrrEstimado} USD</div>
            <p className="text-[11px] text-slate-500 font-medium">Ingresos mensuales recurrentes</p>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-2 bg-white shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
              <span>Cursos Publicados</span>
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{cursos.length}</div>
            <p className="text-[11px] text-amber-800 font-black">100% Price Action</p>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {pestanaAdmin === 'ajustes' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-6 max-w-3xl bg-white shadow-xs">
          <div>
            <h2 className="text-lg font-black text-slate-900">Configuración General de andyontrade</h2>
            <p className="text-xs text-slate-600 font-medium">Actualiza el nombre, descripción y precios de membresía.</p>
          </div>

          <form onSubmit={handleGuardarAjustes} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">Nombre de la Comunidad</label>
              <input
                type="text"
                value={nombreComunidad}
                onChange={(e) => setNombreComunidad(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={taglineComunidad}
                onChange={(e) => setTaglineComunidad(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Descripción de la Comunidad</label>
              <textarea
                rows={3}
                value={descComunidad}
                onChange={(e) => setDescComunidad(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-1">Precio Mensual ($ USD)</label>
                <input
                  type="number"
                  value={precioMensual}
                  onChange={(e) => setPrecioMensual(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Precio Anual VIP ($ USD)</label>
                <input
                  type="number"
                  value={precioAnual}
                  onChange={(e) => setPrecioAnual(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-xs"
              >
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CREAR/EDITAR CURSO */}
      {modalCurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 relative bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-black text-slate-900">
                {cursoEditando ? 'Editar Curso' : 'Crear Nuevo Curso para el Classroom'}
              </h2>
              <button onClick={() => setModalCurso(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarCurso} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Título del Curso</label>
                <input
                  type="text"
                  placeholder="Ej: Scalping de Nasdaq en Apertura..."
                  value={tituloCurso}
                  onChange={(e) => setTituloCurso(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Descripción</label>
                <textarea
                  placeholder="Resumen de lo que aprenderán los alumnos..."
                  rows={3}
                  value={descripcionCurso}
                  onChange={(e) => setDescripcionCurso(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Categoría</label>
                  <select
                    value={categoriaCurso}
                    onChange={(e) => setCategoriaCurso(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="Análisis Técnico">Análisis Técnico</option>
                    <option value="Psicotrading & Riesgo">Psicotrading & Riesgo</option>
                    <option value="Fondeo & Pro">Fondeo & Pro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Nivel Requerido</label>
                  <select
                    value={nivelRequerido}
                    onChange={(e) => setNivelRequerido(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        Nivel {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">URL de Portada</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imagenCurso}
                  onChange={(e) => setImagenCurso(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCurso(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
                >
                  {cursoEditando ? 'Actualizar Curso' : 'Guardar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR MÓDULO */}
      {modalModulo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 relative bg-white">
            <h2 className="text-base font-black text-slate-900 pb-3 border-b border-slate-200">
              Añadir Nuevo Módulo al Temario
            </h2>

            <form onSubmit={handleGuardarModulo} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Título del Módulo</label>
                <input
                  type="text"
                  placeholder="Ej: Módulo 3: Entradas de Alta Probabilidad..."
                  value={tituloModulo}
                  onChange={(e) => setTituloModulo(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalModulo(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
                >
                  Crear Módulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR LECCIÓN */}
      {modalLeccion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto bg-white">
            <h2 className="text-base font-black text-slate-900 pb-3 border-b border-slate-200">
              Añadir Lección con Video & Action Checklist
            </h2>

            <form onSubmit={handleGuardarLeccion} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Título de la Lección</label>
                <input
                  type="text"
                  placeholder="Ej: 2.1 Identificación de Liquidez en Gráfico de 15m..."
                  value={tituloLeccion}
                  onChange={(e) => setTituloLeccion(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Duración</label>
                  <input
                    type="text"
                    value={duracionLeccion}
                    onChange={(e) => setDuracionLeccion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">URL de Video (Embed)</label>
                  <input
                    type="url"
                    value={videoUrlLeccion}
                    onChange={(e) => setVideoUrlLeccion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Resumen de la Lección</label>
                <textarea
                  rows={3}
                  placeholder="Puntos clave explicados en el video..."
                  value={resumenLeccion}
                  onChange={(e) => setResumenLeccion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  Action Items / Checklist (1 tarea por línea)
                </label>
                <textarea
                  rows={3}
                  value={tareasTexto}
                  onChange={(e) => setTareasTexto(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalLeccion(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
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
