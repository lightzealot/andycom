import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Comentario } from '../../types';
import { Heart, Send } from 'lucide-react';

interface CommentsSectionProps {
  postId: string;
  comentarios: Comentario[];
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, comentarios }) => {
  const { usuarioActual, agregarComentario, toggleLikeComentario, setUsuarioPerfilModal } = useApp();
  const [nuevoComentarioText, setNuevoComentarioText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentarioText.trim()) return;

    agregarComentario(postId, nuevoComentarioText.trim());
    setNuevoComentarioText('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <img
          src={usuarioActual.avatar}
          alt={usuarioActual.nombre}
          className="w-8 h-8 rounded-xl object-cover ring-1 ring-amber-500/40"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Escribe un comentario respetuoso... (+10 XP)"
            value={nuevoComentarioText}
            onChange={(e) => setNuevoComentarioText(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <button
            type="submit"
            disabled={!nuevoComentarioText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:hover:text-amber-400 p-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comentarios.map((comentario) => {
          const yaDioLike = comentario.usuariosLiked.includes(usuarioActual.id);
          return (
            <div key={comentario.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <img
                src={comentario.autor.avatar}
                alt={comentario.autor.nombre}
                onClick={() => setUsuarioPerfilModal(comentario.autor)}
                className="w-8 h-8 rounded-xl object-cover cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => setUsuarioPerfilModal(comentario.autor)}
                      className="font-bold text-xs text-white cursor-pointer hover:underline"
                    >
                      {comentario.autor.nombre}
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      N{comentario.autor.nivel}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{comentario.fecha}</span>
                  </div>

                  <button
                    onClick={() => toggleLikeComentario(postId, comentario.id)}
                    className={`flex items-center gap-1 text-[11px] font-bold transition-all ${
                      yaDioLike ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${yaDioLike ? 'fill-rose-500' : ''}`} />
                    <span>{comentario.likes > 0 && comentario.likes}</span>
                  </button>
                </div>
                
                <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-line">
                  {comentario.contenido}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
