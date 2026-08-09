import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CoursePlayer } from './CoursePlayer';
import {
  BookOpen,
  Lock,
  Play,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Loader2,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Curso } from '../../types';
import { uploadFile } from '../../services/storageService';
import { RichTextEditor } from '../UI/RichTextEditor';

export const ClassroomView: React.FC = () => {
  const {
    cursos,
    cursoSeleccionado,
    setCursoSeleccionado,
    usuarioActual,
    modoVistaAdmin,
    crearNuevoCurso,
    editarCurso,
    eliminarCurso,
    reordenarCursos,
  } = useApp();

  const [modalCurso, setModalCurso] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Fundamentos');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [modoNuevaCategoria, setModoNuevaCategoria] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todos');
  const [nivelRequerido, setNivelRequerido] = useState(1);
  const [imagen, setImagen] = useState('');
  const [subiendoPortada, setSubiendoPortada] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de arrastre (Drag & Drop) para reordenar cursos
  const [draggedCourseIndex, setDraggedCourseIndex] = useState<number | null>(null);
  const [dragOverCourseIndex, setDragOverCourseIndex] = useState<number | null>(null);

  const handleMoverCurso = (e: React.MouseEvent, index: number, direction: 'left' | 'right') => {
    e.stopPropagation();
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cursos.length) return;
    const nuevos = [...cursos];
    const [moved] = nuevos.splice(index, 1);
    nuevos.splice(targetIndex, 0, moved);
    reordenarCursos(nuevos);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!modoVistaAdmin) return;
    setDraggedCourseIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!modoVistaAdmin) return;
    e.preventDefault();
    setDragOverCourseIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!modoVistaAdmin || draggedCourseIndex === null || draggedCourseIndex === dropIndex) {
      setDraggedCourseIndex(null);
      setDragOverCourseIndex(null);
      return;
    }
    e.preventDefault();
    const nuevos = [...cursos];
    const [moved] = nuevos.splice(draggedCourseIndex, 1);
    nuevos.splice(dropIndex, 0, moved);
    reordenarCursos(nuevos);
    setDraggedCourseIndex(null);
    setDragOverCourseIndex(null);
  };

  // Lista combinada de categorías de cursos existentes
  const categoriasDisponibles = Array.from(
    new Set([
      'Fundamentos',
      'Análisis Técnico',
      'Psicotrading & Riesgo',
      'Estrategias Avanzadas',
      ...cursos.map((c) => c.categoria).filter(Boolean),
    ])
  );

  const handleSubirPortada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setSubiendoPortada(true);
    try {
      const { url } = await uploadFile(file, 'courses');
      setImagen(url);
    } catch (err) {
      console.warn('Error al subir portada del curso:', err);
      alert('No se pudo subir la imagen. Inténtalo de nuevo.');
    } finally {
      setSubiendoPortada(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGuardarCurso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const categoriaFinal = modoNuevaCategoria && nuevaCategoria.trim()
      ? nuevaCategoria.trim()
      : (categoria || 'Fundamentos');

    const imagenFinal = imagen.trim() || (cursoEditando ? cursoEditando.imagen : '/raxen-banner.png');

    if (cursoEditando) {
      editarCurso({
        ...cursoEditando,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: categoriaFinal,
        nivelRequerido: Number(nivelRequerido),
        imagen: imagenFinal,
      });
      setCursoEditando(null);
    } else {
      crearNuevoCurso({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: categoriaFinal,
        nivelRequerido: Number(nivelRequerido),
        imagen: imagenFinal,
        modulos: [
          {
            id: `mod-${Date.now()}`,
            titulo: 'Módulo 1: Introducción y Práctica',
            lecciones: [
              {
                id: `lec-${Date.now()}`,
                titulo: '1.1 Lección Inicial de Operativa',
                duracion: '15:00 min',
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                resumen: 'Aprende los conceptos iniciales y revisa tu gráfico en TradingView.',
                checklist: [
                  { id: `chk-1`, texto: 'Marcar zonas de soporte y resistencia en 4H', completado: false },
                ],
                completada: false,
              },
            ],
          },
        ],
      });
    }

    setModalCurso(false);
    setTitulo('');
    setDescripcion('');
    setImagen('');
  };

  const handleAbrirEditar = (e: React.MouseEvent, c: Curso) => {
    e.stopPropagation();
    setCursoEditando(c);
    setTitulo(c.titulo);
    setDescripcion(c.descripcion);
    setCategoria(c.categoria);
    setNivelRequerido(c.nivelRequerido);
    setImagen(c.imagen);
    setModalCurso(true);
  };

  const handleEliminar = (e: React.MouseEvent, cursoId: string) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este curso del Aula?')) {
      eliminarCurso(cursoId);
    }
  };

  if (cursoSeleccionado) {
    return <CoursePlayer curso={cursoSeleccionado} onVolver={() => setCursoSeleccionado(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="skool-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-blue-600" /> Aula de Trading & Formación
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Cursos & Módulos de Aprendizaje
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Completa lecciones, marca tus tareas prácticas de backtesting y gana +25 XP por lección.
          </p>
        </div>

        {modoVistaAdmin && (
          <button
            onClick={() => {
              setCursoEditando(null);
              setTitulo('');
              setDescripcion('');
              setImagen('');
              setModalCurso(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Crear Nuevo Curso
          </button>
        )}
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex flex-wrap items-center gap-2 py-1">
        {['Todos', ...categoriasDisponibles].map((catNombre) => {
          const activo = categoriaFiltro === catNombre;
          const count = catNombre === 'Todos'
            ? cursos.length
            : cursos.filter((c) => c.categoria === catNombre).length;

          return (
            <button
              key={catNombre}
              onClick={() => setCategoriaFiltro(catNombre)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                activo
                  ? 'bg-gray-900 text-white ring-1 ring-gray-900'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <span>{catNombre}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activo ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Courses Catalog Grid */}
      {(() => {
        const cursosFiltrados = categoriaFiltro === 'Todos'
          ? cursos
          : cursos.filter((c) => c.categoria === categoriaFiltro);

        if (cursosFiltrados.length === 0) {
          return (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto text-xl">
                📚
              </div>
              <h3 className="font-extrabold text-sm text-gray-900">No hay cursos en esta categoría</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Selecciona otra categoría o crea un nuevo curso para comenzar.
              </p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cursosFiltrados.map((curso, index) => {
              const estaBloqueado = !modoVistaAdmin && usuarioActual.nivel < curso.nivelRequerido;
              const esCompletado = curso.progresoPorcentaje === 100;
              const isBeingDragged = draggedCourseIndex === index;
              const isDragOver = dragOverCourseIndex === index;

              return (
                <div
                  key={curso.id}
                  draggable={modoVistaAdmin}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={() => {
                    setDraggedCourseIndex(null);
                    setDragOverCourseIndex(null);
                  }}
                  onClick={() => {
                    if (!estaBloqueado) setCursoSeleccionado(curso);
                  }}
                  className={`skool-card overflow-hidden transition-all group flex flex-col justify-between ${
                    isBeingDragged
                      ? 'opacity-40 scale-95 border-dashed border-blue-500'
                      : isDragOver
                      ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg'
                      : estaBloqueado
                      ? 'opacity-60 cursor-not-allowed bg-gray-50'
                      : 'hover:shadow-md hover:border-gray-300 cursor-pointer bg-white'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Admin Reorder Toolbar */}
                    {modoVistaAdmin && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-gray-900 text-white flex items-center justify-between text-[11px] font-bold"
                      >
                        <div className="flex items-center gap-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-white">
                          <GripVertical className="w-3.5 h-3.5" />
                          <span>Arrastrar orden</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleMoverCurso(e, index, 'left')}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Mover curso a la izquierda"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] text-gray-400 font-mono">#{index + 1}</span>
                          <button
                            type="button"
                            onClick={(e) => handleMoverCurso(e, index, 'right')}
                            disabled={index === cursosFiltrados.length - 1}
                            className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Mover curso a la derecha"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Course Cover Image */}
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={curso.imagen}
                        alt={curso.titulo}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 text-white text-[11px] font-black backdrop-blur-xs flex items-center gap-1">
                        <span>🏷️</span>
                        <span>{curso.categoria}</span>
                      </div>

                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-400 text-black text-[10px] font-black shadow-xs">
                        Nivel {curso.nivelRequerido}
                      </div>

                      {estaBloqueado ? (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                          <Lock className="w-6 h-6 text-amber-400" />
                          <span className="text-xs font-black">Nivel {curso.nivelRequerido} Requerido</span>
                          <span className="text-[10px] text-gray-300">Gana XP en la comunidad para desbloquear</span>
                        </div>
                      ) : esCompletado ? (
                        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-sm text-gray-900 leading-snug line-clamp-2">
                          {curso.titulo}
                        </h3>

                        {modoVistaAdmin && (
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleAbrirEditar(e, curso)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded-md cursor-pointer"
                              title="Editar curso"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleEliminar(e, curso.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded-md cursor-pointer"
                              title="Eliminar curso"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
                        {curso.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                      <span>Progreso</span>
                      <span>{curso.progresoPorcentaje}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                        style={{ width: `${curso.progresoPorcentaje}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Modal Crear / Editar Curso */}
      {modalCurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="raxen-card w-full max-w-2xl p-6 sm:p-8 relative bg-white space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900">
                {cursoEditando ? 'Editar Curso' : 'Crear Nuevo Curso en el Aula'}
              </h2>
              <button onClick={() => setModalCurso(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarCurso} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Título del Curso</label>
                <input
                  type="text"
                  placeholder="Ej: Estrategia de Liquidez Institucional & ICT..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <RichTextEditor
                  label="Descripción & Temario del Curso"
                  value={descripcion}
                  onChange={setDescripcion}
                  placeholder="Describe la estrategia, temario, reglas y recursos que aprenderán los alumnos..."
                  minHeight="140px"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-gray-700">Categoría del Curso</label>
                    <button
                      type="button"
                      onClick={() => setModoNuevaCategoria(!modoNuevaCategoria)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {modoNuevaCategoria ? '← Elegir existente' : '+ Crear nueva'}
                    </button>
                  </div>

                  {modoNuevaCategoria ? (
                    <input
                      type="text"
                      placeholder="Ej: Scalping de Cripto, Smart Money..."
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none"
                    >
                      {categoriasDisponibles.map((cat) => (
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

              {/* ── Subida de Portada del Curso ── */}
              <div className="space-y-2">
                <label className="block text-gray-700">Portada del Curso (Imagen)</label>

                {/* Vista previa de la portada */}
                {imagen && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-black group">
                    <img
                      src={imagen}
                      alt="Portada"
                      onError={(e) => {
                        e.currentTarget.src = '/raxen-banner.png';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImagen('')}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-red-600 transition-colors"
                      title="Quitar imagen"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Botón para subir archivo desde el ordenador */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSubirPortada}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={subiendoPortada}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {subiendoPortada ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Subiendo imagen...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>{imagen ? 'Cambiar imagen desde el ordenador' : 'Subir archivo de portada'}</span>
                      </>
                    )}
                  </button>

                  <span className="text-gray-400 text-[11px]">o ingresar URL abajo:</span>
                </div>

                {/* Input de URL alternativo */}
                <input
                  type="url"
                  placeholder="O pega una URL: https://images.unsplash.com/..."
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalCurso(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-900 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendoPortada}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black shadow-xs disabled:opacity-50"
                >
                  {cursoEditando ? 'Actualizar Curso' : 'Guardar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
