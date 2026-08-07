import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Video, BarChart2, Upload } from 'lucide-react';
import type { CategoriaPost } from '../../types';
import { readFileAsDataURL, isImageFile, isVideoFile } from '../../utils/fileUploader';

export const CreatePostModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { crearPost, usuarioActual } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState<CategoriaPost>('General');
  
  // Media attachments
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoInputVisible, setVideoInputVisible] = useState(false);
  const [videoUrlTexto, setVideoUrlTexto] = useState('');

  // Encuestas
  const [mostrarEncuesta, setMostrarEncuesta] = useState(false);
  const [preguntaEncuesta, setPreguntaEncuesta] = useState('');
  const [opciones] = useState(['Subida con volumen (Bullish)', 'Ruptura falsa de liquidez (Bearish)']);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataURL(file);
      if (isImageFile(file)) {
        setImagenUrl(dataUrl);
        setVideoUrl(null);
      } else if (isVideoFile(file)) {
        setVideoUrl(dataUrl);
        setImagenUrl(null);
      }
    } catch (err) {
      alert('Error al cargar el archivo.');
    }
  };

  const handleAplicarVideoUrl = () => {
    if (videoUrlTexto.trim()) {
      setVideoUrl(videoUrlTexto.trim());
      setImagenUrl(null);
      setVideoInputVisible(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;

    let encuestaData;
    if (mostrarEncuesta && preguntaEncuesta.trim()) {
      encuestaData = {
        id: `enc-${Date.now()}`,
        pregunta: preguntaEncuesta.trim(),
        totalVotos: 0,
        opciones: opciones
          .filter((op) => op.trim() !== '')
          .map((op, idx) => ({
            id: `op-${Date.now()}-${idx}`,
            texto: op.trim(),
            votos: 0,
            usuariosVotaron: [],
          })),
      };
    }

    crearPost({
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      categoria,
      fijado: false,
      imagen: imagenUrl || undefined,
      videoThumbnail: videoUrl ? (imagenUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600') : undefined,
      videoUrl: videoUrl || undefined,
      encuesta: encuestaData,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="skool-card w-full max-w-xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto bg-white space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={usuarioActual.avatar}
              alt={usuarioActual.nombre}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-300"
            />
            <div>
              <div className="font-extrabold text-sm text-gray-900">{usuarioActual.nombre}</div>
              <div className="text-xs text-gray-500 font-medium">Publicando en andyontrade</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          
          {/* Category Selector */}
          <div>
            <label className="block text-gray-700 mb-1">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaPost)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="General">🟢 General</option>
              <option value="Empieza aquí">📌 Empieza aquí</option>
              <option value="Anuncios">📢 Anuncios</option>
              <option value="Presentaciones">👏 Presentaciones</option>
              <option value="Análisis de mercado">📊 Análisis de mercado</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-700 mb-1">Título de la Publicación</label>
            <input
              type="text"
              placeholder="Ej: Análisis de liquidez en EUR/USD antes de New York..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 placeholder-gray-400"
            />
          </div>

          {/* Content Body */}
          <div>
            <label className="block text-gray-700 mb-1">Escribe tu análisis o pregunta</label>
            <textarea
              rows={4}
              placeholder="Comparte tu proyección, tus niveles de entrada y tu gestión de riesgo..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 placeholder-gray-400"
            />
          </div>

          {/* Poll question input */}
          {mostrarEncuesta && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <label className="block text-amber-900">Pregunta de la Encuesta</label>
              <input
                type="text"
                placeholder="¿Hacia dónde romperá el precio hoy?"
                value={preguntaEncuesta}
                onChange={(e) => setPreguntaEncuesta(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-gray-900"
              />
            </div>
          )}

          {/* Media Previews */}
          {imagenUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black">
              <img src={imagenUrl} alt="Adjunto" className="w-full max-h-60 object-contain mx-auto" />
              <button
                type="button"
                onClick={() => setImagenUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {videoUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black p-2">
              <div className="text-xs text-sky-400 font-mono mb-1 truncate">🎬 Video adjunto: {videoUrl}</div>
              {videoUrl.startsWith('data:video') ? (
                <video src={videoUrl} controls className="w-full max-h-60 rounded-xl" />
              ) : (
                <iframe
                  src={videoUrl.replace('watch?v=', 'embed/')}
                  title="Video preview"
                  className="w-full aspect-video rounded-xl"
                  allowFullScreen
                />
              )}
              <button
                type="button"
                onClick={() => setVideoUrl(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Video URL Input Overlay */}
          {videoInputVisible && (
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <label className="block text-gray-700">Enlace de Video (YouTube, Vimeo, Loom o Directo)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrlTexto}
                  onChange={(e) => setVideoUrlTexto(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium"
                />
                <button
                  type="button"
                  onClick={handleAplicarVideoUrl}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold"
                >
                  Adjuntar
                </button>
              </div>
            </div>
          )}

          {/* Attachments Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              
              {/* File Upload Image/Video Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 text-xs font-bold transition-all"
                title="Subir foto o video desde tu ordenador"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Subir Foto / Video</span>
              </button>

              {/* Video URL Button */}
              <button
                type="button"
                onClick={() => setVideoInputVisible(!videoInputVisible)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 text-xs font-bold transition-all"
                title="Pegar URL de YouTube o Loom"
              >
                <Video className="w-4 h-4 text-emerald-600" />
                <span>Video Link</span>
              </button>

              {/* Poll Button */}
              <button
                type="button"
                onClick={() => setMostrarEncuesta(!mostrarEncuesta)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 text-xs font-bold transition-all"
              >
                <BarChart2 className="w-4 h-4 text-amber-600" />
                <span>Encuesta</span>
              </button>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-black hover:bg-black transition-all shadow-sm"
            >
              Publicar (+15 XP)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
