import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Post } from '../../types';
import { CommentsSection } from './CommentsSection';
import {
  Heart,
  MessageSquare,
  Pin,
  Share2,
  Bookmark,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { usuarioActual, toggleLikePost, votarEncuesta, setUsuarioPerfilModal } = useApp();
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const yaDioLike = post.usuariosLiked.includes(usuarioActual.id);

  return (
    <div
      className={`glass-panel rounded-3xl p-6 border transition-all ${
        post.fijado
          ? 'border-amber-500/40 bg-slate-900/80 shadow-lg shadow-amber-500/5'
          : 'border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {post.fijado && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-3 uppercase tracking-wider">
          <Pin className="w-3.5 h-3.5 fill-amber-400" />
          <span>Publicación Fijada por la Comunidad</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={post.autor.avatar}
            alt={post.autor.nombre}
            onClick={() => setUsuarioPerfilModal(post.autor)}
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-800 cursor-pointer hover:ring-amber-500 transition-all"
          />
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => setUsuarioPerfilModal(post.autor)}
                className="font-bold text-sm text-white cursor-pointer hover:underline"
              >
                {post.autor.nombre}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Nivel {post.autor.nivel}
              </span>
              {post.autor.rol !== 'Miembro' && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-800 text-slate-300">
                  {post.autor.rol}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{post.autor.nickname}</span>
              <span>•</span>
              <span className="font-mono text-[11px]">{post.fecha}</span>
            </div>
          </div>
        </div>

        <span className="px-3 py-1 text-xs font-bold rounded-xl bg-slate-900 border border-slate-800 text-amber-400">
          {post.categoria}
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
        {post.titulo}
      </h3>
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-4">
        {post.contenido}
      </p>

      {post.imagen && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-slate-800">
          <img
            src={post.imagen}
            alt="Adjunto de publicación"
            className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {post.encuesta && (
        <div className="my-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <BarChart2 className="w-4 h-4" />
            <span>Encuesta de la Comunidad ({post.encuesta.totalVotos} votos)</span>
          </div>
          <h4 className="font-bold text-sm text-white mb-2">{post.encuesta.pregunta}</h4>

          <div className="space-y-2">
            {post.encuesta.opciones.map((opcion) => {
              const yaVotoEnEsta = opcion.usuariosVotaron.includes(usuarioActual.id);
              const porcentaje =
                post.encuesta!.totalVotos > 0
                  ? Math.round((opcion.votos / post.encuesta!.totalVotos) * 100)
                  : 0;

              return (
                <button
                  key={opcion.id}
                  onClick={() => votarEncuesta(post.id, opcion.id)}
                  className={`w-full relative overflow-hidden p-3 rounded-xl border text-left transition-all ${
                    yaVotoEnEsta
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-amber-500/15 transition-all duration-500"
                    style={{ width: `${porcentaje}%` }}
                  />

                  <div className="relative flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2 font-semibold">
                      {yaVotoEnEsta && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      {opcion.texto}
                    </span>
                    <span className="font-bold text-amber-400">{porcentaje}% ({opcion.votos})</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleLikePost(post.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              yaDioLike
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-sm shadow-rose-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${yaDioLike ? 'fill-rose-500' : ''}`} />
            <span>{post.likes}</span>
          </button>

          <button
            onClick={() => setMostrarComentarios(!mostrarComentarios)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              mostrarComentarios
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comentarios.length} Comentarios</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setGuardado(!guardado)}
            className={`p-2 rounded-xl border text-xs transition-all ${
              guardado
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Guardar publicación"
          >
            <Bookmark className={`w-4 h-4 ${guardado ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('¡Enlace de la publicación copiado al portapapeles!');
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Compartir"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {mostrarComentarios && (
        <CommentsSection postId={post.id} comentarios={post.comentarios} />
      )}
    </div>
  );
};
