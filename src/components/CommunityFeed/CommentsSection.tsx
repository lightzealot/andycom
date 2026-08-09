import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Comentario } from '../../types';
import { Heart, Send, Trash2 } from 'lucide-react';
import { handleRichPaste } from '../../utils/htmlToMarkdown';

export const CommentsSection: React.FC<{ postId: string; comentarios: Comentario[] }> = ({
  postId,
  comentarios,
}) => {
  const { usuarioActual, agregarComentario, toggleLikeComentario, eliminarComentario, setUsuarioPerfilModal, miembros } = useApp();
  const [nuevoTexto, setNuevoTexto] = useState('');

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;
    agregarComentario(postId, nuevoTexto.trim());
    setNuevoTexto('');
  };

  return (
    <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in">
      <form onSubmit={handleEnviar} className="flex gap-2">
        <input
          type="text"
          placeholder="Escribe un comentario o pregunta..."
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          onPaste={(e) => handleRichPaste(e, nuevoTexto, setNuevoTexto)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:bg-white focus:border-amber-400"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-1 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="space-y-3">
        {(comentarios || []).map((c) => {
          const dioLike = (c.usuariosLiked || []).includes(usuarioActual.id);
          const puedeEliminar = c.autor?.id === usuarioActual.id || usuarioActual.rol === 'Admin';
          const autorLive = miembros.find((m) => m.id === c.autor?.id) || c.autor;

          return (
            <div key={c.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 group">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => setUsuarioPerfilModal(autorLive)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <img
                    src={autorLive?.avatar || c.autor?.avatar}
                    alt={autorLive?.nombre || c.autor?.nombre}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(autorLive?.nombre || c.autor?.nombre || 'Trader')}&background=0D0D0D&color=38bdf8&size=128`;
                    }}
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                  <span className="font-bold text-xs text-slate-900">{autorLive?.nombre || c.autor?.nombre || 'Trader'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{c.fecha}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLikeComentario(postId, c.id)}
                    className={`flex items-center gap-1 text-[11px] font-bold ${
                      dioLike ? 'text-rose-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${dioLike ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{c.likes}</span>
                  </button>

                  {puedeEliminar && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarComentario(postId, c.id);
                      }}
                      title="Eliminar comentario"
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed pl-8 font-normal">{c.contenido}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
