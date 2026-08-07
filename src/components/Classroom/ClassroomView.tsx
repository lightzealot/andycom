import React from 'react';
import { useApp } from '../../context/AppContext';
import { CoursePlayer } from './CoursePlayer';
import { BookOpen, Lock, Play, CheckCircle2 } from 'lucide-react';

export const ClassroomView: React.FC = () => {
  const { cursos, cursoSeleccionado, setCursoSeleccionado, usuarioActual, modoVistaAdmin } = useApp();

  if (cursoSeleccionado) {
    return <CoursePlayer curso={cursoSeleccionado} onVolver={() => setCursoSeleccionado(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-200 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Classroom de Trading
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cursos de Price Action & Cuentas de Fondeo
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium">
            Avanza lección por lección, marca las tareas prácticas de backtesting y gana +25 XP por cada lección completada para desbloquear nuevas salas.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <div className="text-3xl font-black text-amber-700">{cursos.length}</div>
          <div className="text-xs text-slate-600 font-bold">Cursos Disponibles</div>
        </div>
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
              className={`glass-panel rounded-3xl overflow-hidden border border-slate-200 flex flex-col justify-between transition-all shadow-xs ${
                estaBloqueado
                  ? 'opacity-65 cursor-not-allowed bg-slate-100'
                  : 'hover:border-amber-400 cursor-pointer hover:shadow-md bg-white'
              }`}
            >
              <div>
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={curso.imagen}
                    alt={curso.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-black">
                    {curso.categoria}
                  </div>

                  {estaBloqueado ? (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                      <Lock className="w-8 h-8 text-amber-400" />
                      <span className="font-extrabold text-xs">
                        Desbloquea en Nivel {curso.nivelRequerido} ({curso.nivelRequerido * 100} XP)
                      </span>
                    </div>
                  ) : esCompletado ? (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completado
                    </div>
                  ) : (
                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                      <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-black text-base text-slate-900 leading-snug line-clamp-2">
                    {curso.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                    {curso.descripcion}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Progreso del Curso</span>
                  <span className="text-amber-800 font-extrabold">{curso.progresoPorcentaje}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${curso.progresoPorcentaje}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
