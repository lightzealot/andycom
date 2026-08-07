import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Post } from '../../types';
import { ThumbsUp, MessageSquare, Pin, Play } from 'lucide-react';
import { CommentsSection } from './CommentsSection';

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const { usuarioActual, toggleLikePost, setUsuarioPerfilModal } = useApp();
  const [comentariosAbiertos, setComentariosAbiertos] = useState(false);

  const yaDioLike = post.usuariosLiked.includes(usuarioActual.id);
  const totalComentarios = post.comentarios.length;

  return (
    <article className="skool-card-hover p-6 space-y-4">
      
      {/* Post Top Row */}
      <div className="flex items-start justify-between gap-4">
        <div
          onClick={() => setUsuarioPerfilModal(post.autor)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img
              src={post.autor.avatar}
              alt={post.autor.nombre}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center border border-white">
              {post.autor.nivel}
            </span>
          </div>

          <div>
            <div className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
              {post.autor.nombre}
            </div>
            <div className="text-xs text-gray-500 font-normal">
              {post.fecha} • {post.categoria === 'Empieza aquí' ? '📌' : '📊'} {post.categoria}
            </div>
          </div>
        </div>

        {post.fijado && (
          <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
            <Pin className="w-3.5 h-3.5 fill-gray-700" />
            <span>Fijado</span>
          </div>
        )}
      </div>

      {/* Post Title & Content */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h2 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
              {post.titulo}
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-line">
              {post.contenido}
            </p>
          </div>

          {/* Right Video Thumbnail if present */}
          {post.videoThumbnail && !post.imagen && (
            <div className="relative w-full sm:w-36 h-24 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-black group cursor-pointer">
              <img
                src={post.videoThumbnail}
                alt="Video preview"
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Large Attached Image Display */}
        {post.imagen && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black max-h-[480px] flex items-center justify-center mt-3">
            <img
              src={post.imagen}
              alt={post.titulo}
              className="w-full h-full max-h-[480px] object-contain hover:scale-[1.01] transition-transform duration-300"
            />
          </div>
        )}

        {/* Video Player if videoUrl is attached */}
        {post.videoUrl && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black aspect-video mt-3">
            {post.videoUrl.startsWith('data:video') ? (
              <video src={post.videoUrl} controls className="w-full h-full rounded-2xl" />
            ) : (
              <iframe
                src={post.videoUrl.replace('watch?v=', 'embed/')}
                title={post.titulo}
                className="w-full h-full"
                allowFullScreen
              />
            )}
          </div>
        )}
      </div>

      {/* Post Footer Row: Likes, Comments, Avatars, Last Comment */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-4">
          
          {/* Likes */}
          <button
            onClick={() => toggleLikePost(post.id)}
            className={`flex items-center gap-1.5 hover:text-gray-900 transition-colors ${
              yaDioLike ? 'text-blue-600 font-bold' : ''
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${yaDioLike ? 'fill-blue-600' : ''}`} />
            <span>{post.likes}</span>
          </button>

          {/* Comments Count */}
          <button
            onClick={() => setComentariosAbiertos(!comentariosAbiertos)}
            className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{totalComentarios}</span>
          </button>

          {/* Avatar Pile */}
          {post.avatarComentarios && post.avatarComentarios.length > 0 && (
            <div className="flex -space-x-1.5 overflow-hidden">
              {post.avatarComentarios.map((av, idx) => (
                <img
                  key={idx}
                  src={av}
                  alt="Commenter"
                  className="inline-block h-5 w-5 rounded-full ring-1 ring-white object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Last comment timestamp */}
        {post.ultimoComentario && (
          <div className="text-[11px] text-gray-400 font-normal">
            {post.ultimoComentario}
          </div>
        )}
      </div>

      {/* Comments Expansion */}
      {comentariosAbiertos && (
        <div className="pt-2 border-t border-gray-100">
          <CommentsSection postId={post.id} comentarios={post.comentarios} />
        </div>
      )}
    </article>
  );
};
