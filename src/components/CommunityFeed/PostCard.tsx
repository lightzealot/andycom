import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import type { Post, CategoriaPost } from '../../types';
import {
  ThumbsUp, MessageSquare, Pin, Play, Trash2, Maximize2,
  Edit, Check, X, Loader2, Image as ImageIcon
} from 'lucide-react';
import { CommentsSection } from './CommentsSection';
import { ImageLightbox } from '../UI/ImageLightbox';
import { uploadFile } from '../../services/storageService';

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const {
    usuarioActual,
    toggleLikePost,
    setUsuarioPerfilModal,
    eliminarPost,
    editarPost,
    toggleFijarPost,
    miembros,
  } = useApp();

  const [comentariosAbiertos, setComentariosAbiertos] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // ── Estados de Edición ──
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tituloEdit, setTituloEdit] = useState(post.titulo);
  const [contenidoEdit, setContenidoEdit] = useState(post.contenido);
  const [categoriaEdit, setCategoriaEdit] = useState<CategoriaPost>(post.categoria as any || 'General');
  const [imagenEdit, setImagenEdit] = useState(post.imagen || '');
  const [guardando, setGuardando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const yaDioLike = post.usuariosLiked.includes(usuarioActual.id);
  const totalComentarios = post.comentarios.length;

  const esAdmin = usuarioActual.rol === 'Admin';
  const esMiPost = post.autor.id === usuarioActual.id;
  const puedeEditar = esAdmin || esMiPost;
  const puedeEliminar = esAdmin || esMiPost;

  const categorias: CategoriaPost[] = ['General', 'Empieza aquí', 'Análisis de mercado', 'Anuncios', 'Presentaciones'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setGuardando(true);
    try {
      const { url } = await uploadFile(file, 'posts');
      setImagenEdit(url);
    } catch (err) {
      console.warn('Error subiendo imagen de post:', err);
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloEdit.trim()) return;

    setGuardando(true);
    try {
      const postActualizado: Post = {
        ...post,
        titulo: tituloEdit.trim(),
        contenido: contenidoEdit.trim(),
        categoria: categoriaEdit,
        imagen: imagenEdit.trim() || undefined,
      };

      await editarPost(postActualizado);
      setModoEdicion(false);
    } catch (err) {
      console.warn('Error al guardar edición de post:', err);
    } finally {
      setGuardando(false);
    }
  };

  const autorEnVivo = miembros.find((m) => m.id === post.autor?.id) || post.autor;

  return (
    <article className={`skool-card-hover p-6 space-y-4 bg-white transition-all ${
      post.fijado ? 'border-2 border-amber-400 bg-gradient-to-b from-amber-50/30 to-white shadow-md ring-1 ring-amber-300/60' : ''
    }`}>
      
      {/* Post Top Row */}
      <div className="flex items-start justify-between gap-4">
        <div
          onClick={() => setUsuarioPerfilModal(autorEnVivo)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img
              src={autorEnVivo.avatar || post.autor.avatar}
              alt={autorEnVivo.nombre || post.autor.nombre}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(autorEnVivo.nombre || 'Trader')}&background=0D0D0D&color=38bdf8&size=128`;
              }}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center border border-white">
              {autorEnVivo.nivel || 1}
            </span>
          </div>

          <div>
            <div className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <span>{autorEnVivo.nombre || post.autor.nombre}</span>
              {autorEnVivo.rol === 'Admin' ? (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                  Admin
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/60">
                  ⚡ Nv. {autorEnVivo.nivel || 1}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 font-normal flex items-center gap-2 mt-0.5">
              <span>{post.fecha}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                post.categoria === 'Empieza aquí'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : post.categoria === 'Anuncios'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : post.categoria === 'Presentaciones'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {post.categoria === 'Empieza aquí' ? '📌 Empieza aquí' : post.categoria === 'Anuncios' ? '📢 Anuncios' : post.categoria === 'Presentaciones' ? '👏 Presentaciones' : '🟢 General'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.fijado && (
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full shadow-xs">
              <Pin className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
              <span>📌 Fijado</span>
            </div>
          )}

          {/* Admin Pin Button */}
          {esAdmin && (
            <button
              onClick={() => toggleFijarPost(post.id)}
              className={`px-2.5 py-1 rounded-xl transition-all text-xs flex items-center gap-1.5 ${
                post.fijado
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs hover:bg-amber-300'
                  : 'text-gray-500 hover:text-amber-800 hover:bg-amber-50 border border-gray-200'
              }`}
              title={post.fijado ? 'Desfijar post de la parte superior' : 'Fijar post arriba en el Feed'}
            >
              <Pin className={`w-3.5 h-3.5 ${post.fijado ? 'fill-slate-950' : ''}`} />
              <span className="text-[11px] font-bold">{post.fijado ? 'Desfijar' : 'Fijar arriba'}</span>
            </button>
          )}

          {/* Edit Button for Author or Admin */}
          {puedeEditar && !modoEdicion && (
            <button
              onClick={() => setModoEdicion(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-xs flex items-center gap-1"
              title="Editar publicación"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold hidden sm:inline">Editar</span>
            </button>
          )}

          {/* Delete Button for Admin or Post Owner */}
          {puedeEliminar && (
            <button
              onClick={() => {
                if (confirm('¿Eliminar esta publicación?')) {
                  eliminarPost(post.id);
                }
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all text-xs"
              title="Eliminar publicación"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Formulario de Edición de Post ── */}
      {modoEdicion ? (
        <form onSubmit={handleGuardarCambios} className="space-y-3 pt-2 border-t border-gray-100 animate-in fade-in">
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            <span className="text-xs font-bold text-gray-500 mr-1">Categoría:</span>
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaEdit(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  categoriaEdit === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Título de la publicación</label>
            <input
              type="text"
              value={tituloEdit}
              onChange={(e) => setTituloEdit(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-sm focus:outline-none focus:bg-white focus:border-blue-500"
              placeholder="Título del análisis o post..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Contenido / Análisis</label>
            <textarea
              rows={4}
              value={contenidoEdit}
              onChange={(e) => setContenidoEdit(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-xs font-normal focus:outline-none focus:bg-white focus:border-blue-500"
              placeholder="Explica tu análisis técnico o mensaje..."
            />
          </div>

          {/* Imagen adjunta */}
          <div className="space-y-2">
            {imagenEdit && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 max-h-48 bg-black/5">
                <img
                  src={imagenEdit}
                  alt="Preview"
                  onError={(e) => {
                    e.currentTarget.src = '/raxen-banner.png';
                  }}
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagenEdit('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={guardando}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{imagenEdit ? 'Cambiar imagen' : 'Adjuntar imagen'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setModoEdicion(false);
                setTituloEdit(post.titulo);
                setContenidoEdit(post.contenido);
                setImagenEdit(post.imagen || '');
              }}
              className="px-3 py-1.5 text-xs text-gray-500 font-bold hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !tituloEdit.trim()}
              className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <>
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

            {/* Large Attached Image Display — click opens lightbox */}
            {post.imagen && (
              <div
                onClick={() => setLightboxSrc(post.imagen!)}
                className="relative rounded-xl overflow-hidden border border-gray-200 bg-black/5 cursor-pointer group max-h-96"
              >
                <img
                  src={post.imagen}
                  alt={post.titulo}
                  className="w-full h-auto max-h-96 object-contain bg-slate-950/5 group-hover:scale-[1.01] transition-transform"
                />
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Ver gráfico completo</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Row: Likes, Comments, Share */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleLikePost(post.id)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                  yaDioLike ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${yaDioLike ? 'fill-blue-600' : ''}`} />
                <span>{post.likes} Me gusta</span>
              </button>

              <button
                onClick={() => setComentariosAbiertos(!comentariosAbiertos)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{totalComentarios} Comentarios</span>
              </button>
            </div>
          </div>

          {/* Comments Section Drawer / Expand */}
          {comentariosAbiertos && (
            <CommentsSection
              postId={post.id}
              comentarios={post.comentarios}
            />
          )}
        </>
      )}

      {/* Lightbox for Full-screen Image Viewing */}
      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </article>
  );
};
