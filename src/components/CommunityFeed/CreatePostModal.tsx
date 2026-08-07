import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { CategoriaPost } from '../../types';
import { X, Image as ImageIcon, BarChart2, Pin, Sparkles, Plus, Trash2 } from 'lucide-react';

interface CreatePostModalProps {
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const { crearPost, usuarioActual } = useApp();

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState<CategoriaPost>('General');
  const [fijado, setFijado] = useState(false);
  const [imagenUrl, setImagenUrl] = useState('');
  const [mostrarImagenInput, setMostrarImagenInput] = useState(false);

  const [mostrarEncuesta, setMostrarEncuesta] = useState(false);
  const [preguntaEncuesta, setPreguntaEncuesta] = useState('');
  const [opcionesEncuesta, setOpcionesEncuesta] = useState(['', '']);

  const categoriasDisponibles: CategoriaPost[] = [
    'Anuncios',
    'General',
    'Preguntas y Respuestas',
    'Victorias',
    'Recursos',
    'Feedback',
  ];

  const handleAgregarOpcion = () => {
    if (opcionesEncuesta.length < 5) {
      setOpcionesEncuesta([...opcionesEncuesta, '']);
    }
  };

  const handleRemoverOpcion = (index: number) => {
    setOpcionesEncuesta(opcionesEncuesta.filter((_, i) => i !== index));
  };

  const handleOpcionChange = (index: number, valor: string) => {
    const copia = [...opcionesEncuesta];
    copia[index] = valor;
    setOpcionesEncuesta(copia);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;

    let encuestaFinal = undefined;
    if (mostrarEncuesta && preguntaEncuesta.trim()) {
      const opcionesValidas = opcionesEncuesta
        .filter((o) => o.trim() !== '')
        .map((texto, idx) => ({
          id: `op-${Date.now()}-${idx}`,
          texto,
          votos: 0,
          usuariosVotaron: [],
        }));

      if (opcionesValidas.length >= 2) {
        encuestaFinal = {
          id: `poll-${Date.now()}`,
          pregunta: preguntaEncuesta,
          opciones: opcionesValidas,
          totalVotos: 0,
        };
      }
    }

    crearPost({
      titulo,
      contenido,
      categoria,
      fijado: usuarioActual.rol === 'Admin' || usuarioActual.rol === 'Moderador' ? fijado : false,
      imagen: imagenUrl.trim() || undefined,
      encuesta: encuestaFinal,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-800 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Crear Publicación (+15 XP)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categoriasDisponibles.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoria(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    categoria === cat
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Título descriptivo de tu publicación..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-white font-bold text-base placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div>
            <textarea
              placeholder="Escribe el cuerpo de tu mensaje aquí. Puedes incluir aprendizajes, preguntas o novedades..."
              rows={6}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {mostrarImagenInput && (
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-400">URL de la Imagen</label>
              <input
                type="url"
                placeholder="https://ejemplo.com/mi-imagen.jpg"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {mostrarEncuesta && (
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Crear Encuesta Interactiva
              </h4>
              <input
                type="text"
                placeholder="Pregunta de la encuesta..."
                value={preguntaEncuesta}
                onChange={(e) => setPreguntaEncuesta(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
              <div className="space-y-2">
                {opcionesEncuesta.map((op, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Opción ${idx + 1}`}
                      value={op}
                      onChange={(e) => handleOpcionChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                    />
                    {opcionesEncuesta.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoverOpcion(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {opcionesEncuesta.length < 5 && (
                <button
                  type="button"
                  onClick={handleAgregarOpcion}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Opción
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMostrarImagenInput(!mostrarImagenInput)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  mostrarImagenInput || imagenUrl
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Imagen
              </button>

              <button
                type="button"
                onClick={() => setMostrarEncuesta(!mostrarEncuesta)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  mostrarEncuesta
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 className="w-4 h-4" /> Encuesta
              </button>

              {(usuarioActual.rol === 'Admin' || usuarioActual.rol === 'Moderador') && (
                <button
                  type="button"
                  onClick={() => setFijado(!fijado)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    fijado
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Pin className="w-4 h-4" /> Fijar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all"
              >
                Publicar Ahora
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
