import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CoursePlayer } from './CoursePlayer';
import { BookOpen, Lock, Play, CheckCircle2, Plus, Edit, Trash2, X } from 'lucide-react';
import type { Curso } from '../../types';

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

  const handleGuardarCurso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    if (cursoEditando) {
      editarCurso({
        ...cursoEditando,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
        nivelRequerido: Number(nivelRequerido),
        imagen: imagen.trim() || cursoEditando.imagen,
      });
      setCursoEditando(null);
    } else {
      crearNuevoCurso({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
        nivelRequerido: Number(nivelRequerido),
        imagen: imagen.trim() || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
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
              className={`skool-card overflow-hidden flex flex-col justify-between transition-all ${
                estaBloqueado
                  ? 'opacity-60 cursor-not-allowed bg-gray-100'
                  : 'hover:border-gray-300 cursor-pointer hover:shadow-md bg-white'
              }`}
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={curso.imagen}
                    alt={curso.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                    {curso.categoria}
                  </div>

                  {estaBloqueado ? (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                      <Lock className="w-7 h-7 text-amber-400" />
                      <span className="font-extrabold text-xs">
                        Desbloquea en Nivel {curso.nivelRequerido} ({curso.nivelRequerido * 100} XP)
                      </span>
                    </div>
                  ) : esCompletado ? (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completado
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
                  <span className="text-gray-900">{curso.progresoPorcentaje}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${curso.progresoPorcentaje}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Creator / Editor Modal */}
      {modalCurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="skool-card w-full max-w-lg p-6 relative bg-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h2 className="text-base font-black text-gray-900">
                {cursoEditando ? 'Editar Curso del Aula' : 'Crear Nuevo Curso para los Alumnos'}
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
                  placeholder="Ej: Scalping de Nasdaq en Apertura..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Descripción del Curso</label>
                <textarea
                  rows={3}
                  placeholder="Qué aprenderán los alumnos en este curso..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
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
                    <option value="Fondeo & Pro">Fondeo & Pro</option>
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

              <div>
                <label className="block text-gray-700 mb-1">URL de Portada</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCurso(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black shadow-xs"
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
