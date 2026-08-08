import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Curso, Leccion } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  PartyPopper,
  Edit3,
  Check,
  X,
  Video,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RichTextRenderer } from '../UI/RichTextRenderer';
import { RichTextEditor } from '../UI/RichTextEditor';
import { formatVideoEmbedUrl } from '../../utils/videoHelper';

export const CoursePlayer: React.FC<{ curso: Curso; onVolver: () => void }> = ({
  curso,
  onVolver,
}) => {
  const { completarLeccion, toggleTaskChecklist, modoVistaAdmin, editarLeccion, editarModulo } = useApp();

  const primeraLeccion =
    curso.modulos[0]?.lecciones[0] || {
      id: 'default',
      titulo: 'Sin lecciones',
      duracion: '0:00',
      videoUrl: '',
      checklist: [],
      completada: false,
    };

  const [leccionActiva, setLeccionActiva] = useState<Leccion>(primeraLeccion);
  const [editandoNotas, setEditandoNotas] = useState(false);
  const [resumenEditado, setResumenEditado] = useState(leccionActiva.resumen || '');

  const handleGuardarNotas = () => {
    // Find modulo containing this lesson
    let moduloIdEncontrado = curso.modulos[0]?.id;
    for (const m of curso.modulos) {
      if (m.lecciones.some((l) => l.id === leccionActiva.id)) {
        moduloIdEncontrado = m.id;
        break;
      }
    }

    if (moduloIdEncontrado) {
      const leccionActualizada: Leccion = {
        ...leccionActiva,
        resumen: resumenEditado,
      };
      editarLeccion(curso.id, moduloIdEncontrado, leccionActualizada);
      setLeccionActiva(leccionActualizada);
    }
    setEditandoNotas(false);
  };

  const handleMarcarCompletada = () => {
    completarLeccion(curso.id, leccionActiva.id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Breadcrumb */}
      <button
        onClick={onVolver}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo de cursos
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Video Frame & Notes (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video shadow-md flex items-center justify-center">
            {formatVideoEmbedUrl(leccionActiva.videoUrl) ? (
              <iframe
                src={formatVideoEmbedUrl(leccionActiva.videoUrl)}
                title={leccionActiva.titulo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-6 space-y-2 text-slate-400">
                <Video className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs font-bold text-slate-300">Esta lección no tiene video asignado.</p>
                <p className="text-[11px] text-slate-500">Pega un enlace directo de YouTube en la configuración de la lección.</p>
              </div>
            )}
          </div>

          {/* Lesson Title & Completion Button */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {leccionActiva.titulo}
                </h1>
                <div className="text-xs text-slate-500 font-bold mt-1">
                  ⏱️ Duración: {leccionActiva.duracion}
                </div>
              </div>

              <button
                onClick={handleMarcarCompletada}
                className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-xs ${
                  leccionActiva.completada
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md hover:scale-105'
                }`}
              >
                {leccionActiva.completada ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Lección Completada (+25 XP)
                  </>
                ) : (
                  <>
                    <PartyPopper className="w-4 h-4" /> Marcar como completada (+25 XP)
                  </>
                )}
              </button>
            </div>

            {/* Lesson Summary & Rich Content */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Notas y Contenido de la Lección
                </h3>

                {modoVistaAdmin && (
                  <div>
                    {editandoNotas ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditandoNotas(false)}
                          className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleGuardarNotas}
                          className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Guardar Notas
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setResumenEditado(leccionActiva.resumen || '');
                          setEditandoNotas(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Editar Notas con Editor
                      </button>
                    )}
                  </div>
                )}
              </div>

              {editandoNotas ? (
                <div className="p-1 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in">
                  <RichTextEditor
                    value={resumenEditado}
                    onChange={setResumenEditado}
                    placeholder="Escribe el contenido formateado de la lección, añade imágenes, videos y citas..."
                    minHeight="220px"
                  />
                  <div className="flex justify-end gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => setEditandoNotas(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleGuardarNotas}
                      className="px-4 py-1.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black shadow-xs"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              ) : leccionActiva.resumen ? (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <RichTextRenderer content={leccionActiva.resumen} />
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Esta lección aún no tiene notas redactadas.</p>
              )}
            </div>

            {/* Action Items / Checklist */}
            {leccionActiva.checklist && leccionActiva.checklist.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Checklist de Tareas Prácticas (Backtesting)
                </h3>
                <div className="space-y-2">
                  {leccionActiva.checklist.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskChecklist(curso.id, leccionActiva.id, task.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs font-medium transition-all ${
                        task.completado
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {task.completado ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={task.completado ? 'line-through text-slate-500' : 'text-slate-800 font-semibold'}>
                        {task.texto}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Downloadable Resources */}
            {leccionActiva.recursos && leccionActiva.recursos.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Recursos Descargables
                </h3>
                <div className="space-y-2">
                  {leccionActiva.recursos.map((rec) => (
                    <a
                      key={rec.id}
                      href={rec.url}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-800 hover:bg-slate-100 transition-all font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span>{rec.titulo}</span>
                      </div>
                      <Download className="w-4 h-4 text-slate-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Curriculum (1 col) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-6 h-fit shadow-xs">
          <div>
            <h2 className="text-base font-black text-slate-900">{curso.titulo}</h2>
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mt-2 mb-1">
              <span>Progreso Total</span>
              <span className="text-amber-800 font-black">{curso.progresoPorcentaje}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${curso.progresoPorcentaje}%` }}
              />
            </div>
          </div>

          {/* Modules List */}
          <div className="space-y-4">
            {(curso.modulos || []).map((modulo) => (
              <div key={modulo.id} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 px-1">
                  <span className="truncate">{modulo.titulo}</span>
                  {modoVistaAdmin && (
                    <button
                      onClick={() => {
                        const nuevoTitulo = prompt('Editar nombre del módulo:', modulo.titulo);
                        if (nuevoTitulo && nuevoTitulo.trim()) {
                          editarModulo(curso.id, modulo.id, nuevoTitulo.trim());
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Editar nombre del módulo"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {(modulo.lecciones || []).map((lec) => {
                    const esActiva = leccionActiva.id === lec.id;
                    return (
                      <button
                        key={lec.id}
                        onClick={() => setLeccionActiva(lec)}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          esActiva
                            ? 'bg-amber-100 border-amber-300 text-slate-950 font-black shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {lec.completada ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{lec.titulo}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {lec.duracion}
                        </span>
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
  );
};
