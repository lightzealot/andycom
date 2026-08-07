import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { CategoriaPost } from '../../types';
import { X, Image as ImageIcon, BarChart2, Plus, Trash2 } from 'lucide-react';

export const CreatePostModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { crearPost } = useApp();

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState<CategoriaPost>('General');
  const [imagenUrl, setImagenUrl] = useState('');
  const [mostrarImagenInput, setMostrarImagenInput] = useState(false);

  // Poll state
  const [mostrarEncuesta, setMostrarEncuesta] = useState(false);
  const [preguntaEncuesta, setPreguntaEncuesta] = useState('');
  const [opcionesEncuesta, setOpcionesEncuesta] = useState<string[]>(['', '']);

  const handleAgregarOpcion = () => {
    if (opcionesEncuesta.length < 6) {
      setOpcionesEncuesta([...opcionesEncuesta, '']);
    }
  };

  const handleEliminarOpcion = (idx: number) => {
    if (opcionesEncuesta.length > 2) {
      setOpcionesEncuesta(opcionesEncuesta.filter((_, i) => i !== idx));
    }
  };

  const handleCambiarOpcion = (idx: number, val: string) => {
    const nuevas = [...opcionesEncuesta];
    nuevas[idx] = val;
    setOpcionesEncuesta(nuevas);
  };

  const handlePublicar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;

    let encuestaData;
    if (mostrarEncuesta && preguntaEncuesta.trim()) {
      const opcionesValidas = opcionesEncuesta
        .filter((o) => o.trim() !== '')
        .map((texto, i) => ({
          id: `op-${Date.now()}-${i}`,
          texto: texto.trim(),
          votos: 0,
          usuariosVotaron: [],
        }));

      if (opcionesValidas.length >= 2) {
        encuestaData = {
          id: `poll-${Date.now()}`,
          pregunta: preguntaEncuesta.trim(),
          opciones: opcionesValidas,
          totalVotos: 0,
        };
      }
    }

    crearPost({
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      categoria,
      fijado: false,
      imagen: imagenUrl.trim() || undefined,
      encuesta: encuestaData,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto bg-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 className="text-base font-black text-slate-900">Crear Nueva Publicación de Trading</h2>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePublicar} className="mt-6 space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">Título de la Publicación</label>
            <input
              type="text"
              placeholder="Ej: Análisis de Price Action en EUR/USD tras barrido de liquidez..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaPost)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold"
            >
              <option value="General">General</option>
              <option value="Anuncios">Anuncios</option>
              <option value="Preguntas y Respuestas">Preguntas y Respuestas</option>
              <option value="Victorias">Victorias (Fondeos & Retiros)</option>
              <option value="Recursos">Recursos & Plantillas</option>
              <option value="Feedback">Feedback de Gráficos</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Contenido / Análisis</label>
            <textarea
              rows={5}
              placeholder="Comparte tu proyección, marco temporal, zonas de oferta/demanda..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 leading-relaxed"
            />
          </div>

          {/* Image URL Input */}
          {mostrarImagenInput && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-slate-700">Enlace de Imagen o Captura de TradingView</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... o enlace de captura"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
              />
            </div>
          )}

          {/* Poll Builder */}
          {mostrarEncuesta && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-800">Pregunta de la Encuesta</label>
                <button
                  type="button"
                  onClick={() => setMostrarEncuesta(false)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="¿Hacia dónde crees que irá el Nasdaq hoy?"
                value={preguntaEncuesta}
                onChange={(e) => setPreguntaEncuesta(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
              />

              <div className="space-y-2 pt-1">
                {opcionesEncuesta.map((op, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Opción ${idx + 1}...`}
                      value={op}
                      onChange={(e) => handleCambiarOpcion(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
                    />
                    {opcionesEncuesta.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleEliminarOpcion(idx)}
                        className="p-2 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {opcionesEncuesta.length < 6 && (
                <button
                  type="button"
                  onClick={handleAgregarOpcion}
                  className="text-xs text-amber-700 hover:underline flex items-center gap-1 font-bold"
                >
                  <Plus className="w-3 h-3" /> Agregar otra opción
                </button>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMostrarImagenInput(!mostrarImagenInput)}
                className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                  mostrarImagenInput
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Imagen</span>
              </button>

              <button
                type="button"
                onClick={() => setMostrarEncuesta(!mostrarEncuesta)}
                className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                  mostrarEncuesta
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Encuesta</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-md hover:bg-amber-400"
              >
                Publicar (+15 XP)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
