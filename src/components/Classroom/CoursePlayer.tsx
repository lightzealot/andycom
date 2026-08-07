import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Curso, Leccion } from '../../types';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Play,
  Lock,
  Download,
  FileText,
  Sparkles,
  CheckSquare,
  Square,
  BookOpen,
} from 'lucide-react';

interface CoursePlayerProps {
  curso: Curso;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ curso, onBack }) => {
  const { usuarioActual, completarLeccion, toggleTaskChecklist } = useApp();

  const todasLasLecciones: { moduloId: string; leccion: Leccion }[] = [];
  curso.modulos.forEach((m) => {
    m.lecciones.forEach((l) => {
      todasLasLecciones.push({ moduloId: m.id, leccion: l });
    });
  });

  const [leccionActivaId, setLeccionActivaId] = useState<string>(
    todasLasLecciones[0]?.leccion.id || ''
  );
  const [tabInfo, setTabInfo] = useState<'resumen' | 'tareas' | 'descargas'>('resumen');

  const leccionActualObj = todasLasLecciones.find((item) => item.leccion.id === leccionActivaId)?.leccion;

  const handleCompletarLeccion = () => {
    if (!leccionActualObj) return;

    completarLeccion(curso.id, leccionActualObj.id);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  };

  const progreso = curso.progresoPorcentaje ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Classroom
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl overflow-hidden glass-panel border border-slate-800 aspect-video relative bg-slate-950 flex items-center justify-center shadow-2xl">
            {leccionActualObj ? (
              <iframe
                src={leccionActualObj.videoUrl}
                title={leccionActualObj.titulo}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-8">
                <Play className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Selecciona una lección para comenzar</p>
              </div>
            )}
          </div>

          {leccionActualObj && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  {curso.titulo}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-2 leading-tight">
                  {leccionActualObj.titulo}
                </h2>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>⏱️ Duración: {leccionActualObj.duracion}</span>
                  <span>•</span>
                  <span>⚡ +25 XP al completar</span>
                </div>
              </div>

              <button
                onClick={handleCompletarLeccion}
                disabled={leccionActualObj.completada}
                className={`px-6 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all ${
                  leccionActualObj.completada
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105'
                }`}
              >
                {leccionActualObj.completada ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Lección Completada
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Marcar como Completada (+25 XP)
                  </>
                )}
              </button>
            </div>
          )}

          {leccionActualObj && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setTabInfo('resumen')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    tabInfo === 'resumen'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Resumen de la Lección
                </button>
                <button
                  onClick={() => setTabInfo('tareas')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tabInfo === 'tareas'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Action Items / Checklist ({leccionActualObj.checklist.length})
                </button>
                {leccionActualObj.recursos && leccionActualObj.recursos.length > 0 && (
                  <button
                    onClick={() => setTabInfo('descargas')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      tabInfo === 'descargas'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Materiales y Recursos ({leccionActualObj.recursos.length})
                  </button>
                )}
              </div>

              {tabInfo === 'resumen' && (
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {leccionActualObj.resumen}
                </div>
              )}

              {tabInfo === 'tareas' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Completa estas tareas prácticas antes de pasar al siguiente tema:
                  </p>
                  {leccionActualObj.checklist.length === 0 ? (
                    <p className="text-xs text-slate-500">No hay tareas asociadas a esta lección.</p>
                  ) : (
                    leccionActualObj.checklist.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskChecklist(curso.id, leccionActualObj.id, task.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          task.completado
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {task.completado ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-500" />
                        )}
                        <span className={`text-xs font-medium ${task.completado ? 'line-through' : ''}`}>
                          {task.texto}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tabInfo === 'descargas' && (
                <div className="space-y-2">
                  {leccionActualObj.recursos?.map((rec) => (
                    <a
                      key={rec.id}
                      href={rec.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-bold text-white group-hover:underline">
                          {rec.titulo}
                        </span>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Progreso del Curso
            </h3>
            <div className="flex items-center justify-between text-sm font-extrabold text-white mb-2">
              <span>{progreso}% Completado</span>
              <span className="text-xs font-bold text-amber-400">
                Nivel Requerido: N{curso.nivelRequerido}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 transition-all duration-500"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-4 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider px-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" /> Temario del Curso
            </h3>

            <div className="space-y-4">
              {curso.modulos.map((modulo) => (
                <div key={modulo.id} className="space-y-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs font-bold text-amber-400">
                    {modulo.titulo}
                  </div>

                  <div className="space-y-1.5 pl-1">
                    {modulo.lecciones.map((leccion) => {
                      const esSeleccionada = leccion.id === leccionActivaId;
                      const bloqueadaPorNivel = usuarioActual.nivel < curso.nivelRequerido;

                      return (
                        <button
                          key={leccion.id}
                          disabled={bloqueadaPorNivel}
                          onClick={() => setLeccionActivaId(leccion.id)}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            esSeleccionada
                              ? 'bg-amber-500/20 border-amber-500/50 text-white font-bold'
                              : leccion.completada
                              ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                              : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {bloqueadaPorNivel ? (
                              <Lock className="w-4 h-4 text-slate-600" />
                            ) : leccion.completada ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600" />
                            )}
                            <div>
                              <div className="text-xs leading-snug">{leccion.titulo}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {leccion.duracion}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
