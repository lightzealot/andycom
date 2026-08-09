import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Trash2, Tag, Check, AlertCircle, Loader2 } from 'lucide-react';

export const CategoryManagerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { categoriasLista, agregarCategoria, eliminarCategoria, usuarioActual } = useApp();
  const [nuevaCat, setNuevaCat] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);

  if (usuarioActual?.rol !== 'Admin') {
    return null;
  }

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombre = nuevaCat.trim();
    if (!nombre) return;

    if (categoriasLista.some((c) => c.toLowerCase() === nombre.toLowerCase())) {
      setErrorMsg('Esta categoría ya existe.');
      return;
    }

    setGuardando(true);
    setErrorMsg(null);
    try {
      await agregarCategoria(nombre);
      setNuevaCat('');
      setExitoMsg(`¡Categoría "${nombre}" creada con éxito!`);
      setTimeout(() => setExitoMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al agregar categoría.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (cat: string) => {
    if (categoriasLista.length <= 1) {
      setErrorMsg('Debes mantener al menos una categoría.');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar la categoría "${cat}"?`)) {
      setGuardando(true);
      try {
        await eliminarCategoria(cat);
        setExitoMsg(`Categoría "${cat}" eliminada.`);
        setTimeout(() => setExitoMsg(null), 3000);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Error al eliminar categoría.');
      } finally {
        setGuardando(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="raxen-card w-full max-w-lg p-6 sm:p-8 relative bg-white space-y-6 shadow-2xl">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black shadow-xs shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Gestionar Categorías</h2>
            <p className="text-xs text-gray-500 font-medium">
              Agrega o quita canales de conversación del feed de la comunidad.
            </p>
          </div>
        </div>

        {/* Feedback messages */}
        {exitoMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exitoMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form to add new category */}
        <form onSubmit={handleAgregar} className="space-y-2">
          <label className="block text-xs font-bold text-gray-700">Crear Nueva Categoría</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevaCat}
              onChange={(e) => setNuevaCat(e.target.value)}
              placeholder="Ej: Resultados & Ganancias, Criptomonedas..."
              className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500"
              maxLength={40}
            />
            <button
              type="submit"
              disabled={guardando || !nuevaCat.trim()}
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-xs shrink-0"
            >
              {guardando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Agregar</span>
            </button>
          </div>
        </form>

        {/* Existing Categories List */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-gray-700">
            Categorías Activas ({categoriasLista.length})
          </label>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
            {categoriasLista.map((cat, idx) => (
              <div
                key={cat}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold shadow-2xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-gray-900">{cat}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleEliminar(cat)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title={`Eliminar categoría "${cat}"`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
