import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Post } from '../../types';
import { Heart, MessageSquare, Pin, BarChart2, CheckCircle2 } from 'lucide-react';
import { CommentsSection } from './CommentsSection';

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const { usuarioActual, toggleLikePost, votarEncuesta, setUsuarioPerfilModal } = useApp();
  const [comentariosAbiertos, setComentariosAbiertos] = useState(false);

  const yaDioLike = post.usuariosLiked.includes(usuarioActual.id);
  const totalComentarios = post.comentarios.length;

  const handleVotar = (opcionId: string) => {
    votarEncuesta(post.id, opcionId);
  };

  const yaVotoEnEncuesta = post.encuesta?.opciones.some((op) =>
    op.usuariosVotaron.includes(usuarioActual.id)
  );

  return (
    <article className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-4 hover:border-slate-300 transition-all shadow-xs">
      
      {/* Post Header */}
      <div className="flex items-start justify-between gap-4">
        <div
          onClick={() => setUsuarioPerfilModal(post.autor)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={post.autor.avatar}
            alt={post.autor.nombre}
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-200 group-hover:ring-amber-500 transition-all"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                {post.autor.nombre}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-bold">
                Nivel {post.autor.nivel}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {post.autor.nickname} • {post.fecha}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.fijado && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black">
              <Pin className="w-3 h-3 fill-amber-700 text-amber-800" /> Fijado
            </span>
          )}
          <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            {post.categoria}
          </span>
        </div>
      </div>

      {/* Post Body */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
          {post.titulo}
        </h2>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
          {post.contenido}
        </div>

        {/* Post Image */}
        {post.imagen && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <img src={post.imagen} alt="Contenido del trade" className="w-full h-auto object-cover max-h-96" />
          </div>
        )}

        {/* Poll Component */}
        {post.encuesta && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <BarChart2 className="w-4 h-4 text-amber-600" />
              <span>{post.encuesta.pregunta}</span>
            </div>

            <div className="space-y-2">
              {post.encuesta.opciones.map((opcion) => {
                const porcentaje =
                  post.encuesta!.totalVotos > 0
                    ? Math.round((opcion.votos / post.encuesta!.totalVotos) * 100)
                    : 0;
                const estaVotado = opcion.usuariosVotaron.includes(usuarioActual.id);

                return (
                  <button
                    key={opcion.id}
                    onClick={() => handleVotar(opcion.id)}
                    disabled={yaVotoEnEncuesta}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-bold relative overflow-hidden transition-all ${
                      estaVotado
                        ? 'border-amber-500 bg-amber-50/80 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {/* Percentage background fill */}
                    {yaVotoEnEncuesta && (
                      <div
                        className="absolute inset-0 bg-amber-200/50 -z-0 transition-all duration-700"
                        style={{ width: `${porcentaje}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {estaVotado && <CheckCircle2 className="w-4 h-4 text-amber-700" />}
                        {opcion.texto}
                      </span>
                      {yaVotoEnEncuesta && (
                        <span className="font-mono text-slate-900 font-extrabold">{porcentaje}%</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 font-semibold text-right">
              {post.encuesta.totalVotos} votos totales
            </div>
          </div>
        )}
      </div>

      {/* Post Actions (Likes & Comments) */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs">
        <button
          onClick={() => toggleLikePost(post.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            yaDioLike
              ? 'bg-rose-50 border-rose-200 text-rose-700 font-black'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 font-bold'
          }`}
        >
          <Heart className={`w-4 h-4 ${yaDioLike ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{post.likes}</span>
        </button>

        <button
          onClick={() => setComentariosAbiertos(!comentariosAbiertos)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{totalComentarios} comentarios</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {comentariosAbiertos && (
        <div className="pt-2 border-t border-slate-100">
          <CommentsSection postId={post.id} comentarios={post.comentarios} />
        </div>
      )}
    </article>
  );
};
