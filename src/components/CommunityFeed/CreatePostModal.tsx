import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Video, BarChart2, Upload, Sparkles, Film, Mail } from 'lucide-react';
import type { CategoriaPost } from '../../types';
import { isImageFile, isVideoFile } from '../../utils/fileUploader';
import { uploadFile, uploadVideoFile } from '../../services/storageService';
import { disableAutoplayInUrl, formatVideoEmbedUrl } from '../../utils/videoHelper';
import { handleRichPaste } from '../../utils/htmlToMarkdown';

export const CreatePostModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { crearPost, usuarioActual, categoriasLista, miembros } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState<CategoriaPost>('General');
  const [enviarPorEmail, setEnviarPorEmail] = useState(false);
  
  // Media attachments
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoInputVisible, setVideoInputVisible] = useState(false);
  const [videoUrlTexto, setVideoUrlTexto] = useState('');
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  // Encuestas
  const [mostrarEncuesta, setMostrarEncuesta] = useState(false);
  const [preguntaEncuesta, setPreguntaEncuesta] = useState('');
  const [opciones] = useState(['Subida con volumen (Bullish)', 'Ruptura falsa de liquidez (Bearish)']);

  const procesarArchivo = async (file: File) => {
    setSubiendoArchivo(true);
    try {
      const uploadResult = isVideoFile(file)
        ? await uploadVideoFile(file, 'videos')
        : await uploadFile(file, 'posts');
      const { url, isLocal } = uploadResult;

      if (!isLocal) {
        console.info('[Post] Archivo subido a Supabase Storage:', url);
      } else {
        console.info('[Post] Usando base64 local (Storage no disponible)');
      }

      if (isImageFile(file)) {
        setImagenUrl(url);
        setVideoUrl(null);
      } else if (isVideoFile(file)) {
        setVideoUrl(url);
        setImagenUrl(null);
      }
    } catch (err) {
      console.warn('Error al procesar el archivo:', err);
      alert('No se pudo procesar el archivo. Inténtalo de nuevo.');
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await procesarArchivo(file);
  };

  // Soporte para Arrastrar y Soltar (Drag & Drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setEstaArrastrando(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setEstaArrastrando(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setEstaArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await procesarArchivo(file);
    }
  };

  // Soporte para Pegar capturas de pantalla y texto con formato enriquecido (Word, Docs, Notion, Web)
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 1. Si es imagen o video desde portapapeles
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('video') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          await procesarArchivo(file);
          return;
        }
      }
    }

    // 2. Si es texto con formato enriquecido (Word, Docs, Notion, Web)
    const handled = handleRichPaste(e, contenido, setContenido);
    if (handled) {
      return;
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
      enviarPorEmail: Boolean(enviarPorEmail),
      imagen: imagenUrl || undefined,
      videoThumbnail: videoUrl ? (imagenUrl || '/raxen-banner.png') : undefined,
      videoUrl: videoUrl || undefined,
      encuesta: encuestaData,
    });

    onClose();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className={`raxen-card w-full max-w-xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto bg-white space-y-6 shadow-2xl transition-all ${
        estaArrastrando ? 'ring-4 ring-blue-500 bg-blue-50/50' : ''
      }`}>
        
        {/* Drag Overlay Notification */}
        {estaArrastrando && (
          <div className="absolute inset-0 bg-blue-600/90 text-white z-50 flex flex-col items-center justify-center rounded-2xl p-6 text-center animate-in fade-in">
            <Upload className="w-12 h-12 mb-3 animate-bounce" />
            <div className="text-lg font-black">Suelta tu imagen o video aquí</div>
            <div className="text-xs text-blue-100 mt-1">Se subirá y adjuntará automáticamente a tu análisis</div>
          </div>
        )}

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
              <div className="text-xs text-sky-700 font-mono font-bold">comunidad.raxen.capital</div>
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
              {categoriasLista.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
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

          {/* Content Body with Paste & Drag Support */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-gray-700">Escribe tu análisis o pregunta</label>
              <span className="text-[10px] text-gray-400 font-normal">Puedes arrastrar o pegar capturas (Ctrl+V)</span>
            </div>
            <textarea
              rows={4}
              onPaste={handlePaste}
              placeholder="Comparte tu proyección, tus niveles de entrada y tu gestión de riesgo... (puedes arrastrar imágenes/videos aquí)"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 placeholder-gray-400"
            />
          </div>

          {/* Loading indicator during upload */}
          {subiendoArchivo && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Procesando archivo...</span>
            </div>
          )}

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
              <img
                src={imagenUrl}
                alt="Adjunto"
                onError={(e) => {
                  e.currentTarget.src = '/raxen-banner.png';
                }}
                className="w-full max-h-60 object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => setImagenUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                title="Eliminar imagen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {videoUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black p-2">
              <div className="text-xs text-sky-400 font-mono mb-1 truncate flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" />
                <span>Video adjunto:</span>
              </div>
              {videoUrl.startsWith('data:video') || videoUrl.includes('.mp4') ? (
                <video src={videoUrl} controls className="w-full max-h-60 rounded-xl" />
              ) : (
                <iframe
                  src={disableAutoplayInUrl(formatVideoEmbedUrl(videoUrl))}
                  title="Video preview"
                  className="w-full aspect-video rounded-xl"
                  allowFullScreen
                />
              )}
              <button
                type="button"
                onClick={() => setVideoUrl(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                title="Eliminar video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Video URL Input Overlay */}
          {videoInputVisible && (
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <label className="block text-gray-700">Enlace de Video (YouTube, Dailymotion, Vimeo, Loom)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... o https://www.dailymotion.com/video/..."
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

          {/* Admin Email Broadcast Toggle Option */}
          {usuarioActual.rol === 'Admin' && (
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/70 cursor-pointer select-none hover:bg-amber-500/15 transition-all">
              <input
                type="checkbox"
                checked={enviarPorEmail}
                onChange={(e) => setEnviarPorEmail(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Enviar por correo a todos los miembros ({miembros.length})</span>
                </div>
                <p className="text-[10px] text-amber-800 font-medium mt-0.5">
                  Se enviará automáticamente una copia al correo electrónico registrado de cada trader.
                </p>
              </div>
            </label>
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
                title="Subir foto o video desde tu ordenador o arrastrar"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Subir Foto / Video</span>
                <span className="sm:hidden">Subir</span>
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
              disabled={subiendoArchivo}
              className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-black hover:bg-black transition-all shadow-sm disabled:opacity-50"
            >
              Publicar (+15 XP)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
