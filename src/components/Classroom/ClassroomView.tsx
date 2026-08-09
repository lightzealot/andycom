import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CoursePlayer } from './CoursePlayer';
import { BookOpen, Lock, Play, CheckCircle2, Plus, Edit, Trash2, X, Upload, Loader2 } from 'lucide-react';
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
  } = useApp();

  const [modalCurso, setModalCurso] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Fundamentos');
  const [nivelRequerido, setNivelRequerido] = useState(1);
  const [imagen, setImagen] = useState('');
  const [subiendoPortada, setSubiendoPortada] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const imagenFinal = imagen.trim() || (cursoEditando ? cursoEditando.imagen : '/raxen-banner.png');

    if (cursoEditando) {
      editarCurso({
        ...cursoEditando,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
        nivelRequerido: Number(nivelRequerido),
        imagen: imagenFinal,
      });
      setCursoEditando(null);
    } else {
      crearNuevoCurso({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
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

      {/* Courses Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cursos.map((curso) => {
          const estaBloqueado = !modoVistaAdmin && usuarioActual.nivel < curso.nivelRequerido;
          const esCompletado = curso.progresoPorcentaje === 100;

          return (
            <div
              key={curso.id}
              onClick={() => {
                if (!estaBloqueado) setCursoSeleccionado(curso);
              }}
              className={`skool-card overflow-hidden transition-all group flex flex-col justify-between ${
                estaBloqueado
                  ? 'opacity-60 cursor-not-allowed bg-gray-50'
                  : 'hover:shadow-md hover:border-gray-300 cursor-pointer bg-white'
              }`}
            >
              <div className="space-y-3">
                {/* Course Cover Image */}
                <div className="relative aspect-video overflow-hidden bg-black rounded-t-2xl">
                  <img
                    src={curso.imagen}
                    alt={curso.titulo}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />

                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold backdrop-blur-xs">
                    {curso.categoria}
                  </div>

                  {estaBloqueado ? (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                      <Lock className="w-6 h-6 text-amber-400" />
                      <span className="text-xs font-black">Nivel {curso.nivelRequerido} Requerido</span>
                      <span className="text-[10px] text-gray-300">Gana XP participando en la comunidad para desbloquear</span>
                    </div>
                  ) : esCompletado ? (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
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
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handleAbrirEditar(e, curso)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded-md"
                          title="Editar curso"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleEliminar(e, curso.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-md"
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
                    className={`h-full transition-all duration-500 ${
                      esCompletado ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${curso.progresoPorcentaje}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Categoría</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                  >
                    <option value="Fundamentos">Fundamentos</option>
                    <option value="Análisis Técnico">Análisis Técnico</option>
                    <option value="Psicotrading & Riesgo">Psicotrading & Riesgo</option>
                    <option value="Estrategias Avanzadas">Estrategias Avanzadas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Nivel Desbloqueo</label>
                  <select
                    value={nivelRequerido}
                    onChange={(e) => setNivelRequerido(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        Nivel {n} ({n * 100} XP)
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
