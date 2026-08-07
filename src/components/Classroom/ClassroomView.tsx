import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CoursePlayer } from './CoursePlayer';
import { BookOpen, Lock, Play, Sparkles } from 'lucide-react';

export const ClassroomView: React.FC = () => {
  const { cursos, cursoSeleccionado, setCursoSeleccionado, usuarioActual, busqueda } = useApp();
  const [categoriaSel, setCategoriaSel] = useState('Todos');

  if (cursoSeleccionado) {
    return <CoursePlayer curso={cursoSeleccionado} onBack={() => setCursoSeleccionado(null)} />;
  }

  const categorias = ['Todos', 'Estrategia & Comunidad', 'Desarrollo Personal', 'Monetización & Negocios'];

  const cursosFiltrados = cursos.filter((c) => {
    const coincideCat = categoriaSel === 'Todos' || c.categoria === categoriaSel;
    const query = busqueda.toLowerCase().trim();
    const coincideBusqueda =
      !query ||
      c.titulo.toLowerCase().includes(query) ||
      c.descripcion.toLowerCase().includes(query);
    return coincideCat && coincideBusqueda;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Classroom Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-amber-400" /> Classroom de Aprendizaje
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Accede a cursos prácticos en video, guías descargables y gana XP completando módulos.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSel(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                categoriaSel === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cursosFiltrados.map((curso) => {
          const bloqueado = usuarioActual.nivel < curso.nivelRequerido;
          const leccionesCount = curso.modulos.reduce((acc, m) => acc + m.lecciones.length, 0);
          const progreso = curso.progresoPorcentaje ?? 0;

          return (
            <div
              key={curso.id}
              onClick={() => {
                if (!bloqueado) setCursoSeleccionado(curso);
              }}
              className={`glass-panel rounded-3xl overflow-hidden border flex flex-col justify-between transition-all group ${
                bloqueado
                  ? 'border-slate-800/60 opacity-75 cursor-not-allowed'
                  : 'border-slate-800 hover:border-amber-500/50 hover:-translate-y-1 cursor-pointer shadow-xl'
              }`}
            >
              {/* Cover Image */}
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <img
                  src={curso.imagen}
                  alt={curso.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-400 text-xs font-black shadow-lg">
                    Nivel {curso.nivelRequerido}+
                  </span>
                </div>

                {bloqueado && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                    <Lock className="w-8 h-8 text-amber-400 mb-2" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Desbloquea al alcanzar el Nivel {curso.nivelRequerido}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Publica y comenta en la comunidad para ganar XP
                    </span>
                  </div>
                )}
              </div>

              {/* Body Info */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {curso.categoria}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 group-hover:text-amber-400 transition-colors leading-snug">
                    {curso.titulo}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {curso.descripcion}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{leccionesCount} Lecciones totales</span>
                    <span className="font-bold text-white">{progreso}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                      style={{ width: `${progreso}%` }}
                    />
                  </div>

                  <button
                    disabled={bloqueado}
                    className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      bloqueado
                        ? 'bg-slate-900 text-slate-600 border border-slate-800'
                        : 'bg-slate-900 border border-slate-800 text-amber-400 hover:bg-amber-500 hover:text-slate-950'
                    }`}
                  >
                    {bloqueado ? (
                      <>
                        <Lock className="w-4 h-4" /> Bloqueado por Nivel
                      </>
                    ) : progreso > 0 ? (
                      <>
                        <Play className="w-4 h-4 fill-current" /> Continuar Curso
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Empezar Curso
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
