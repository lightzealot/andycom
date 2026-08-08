import React, { useState, useRef } from 'react';
import {
  List,
  ListOrdered,
  Quote,
  Code2,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
  Video,
  Eye,
  Edit3,
  Upload,
  Loader2,
  X,
} from 'lucide-react';
import { uploadFile } from '../../services/storageService';
import { RichTextRenderer } from './RichTextRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe el contenido aquí...',
  minHeight = '180px',
  label,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modoVistaPrevia, setModoVistaPrevia] = useState(false);

  // Modales interactivos
  const [modalLink, setModalLink] = useState(false);
  const [linkTexto, setLinkTexto] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const [modalVideo, setModalVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const [modalImagen, setModalImagen] = useState(false);
  const [imagenUrl, setImagenUrl] = useState('');
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Helper para insertar o envolver texto en el cursor
  const insertarTexto = (antes: string, despues: string = '', textoPorDefecto: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textoActual = value;
    const seleccion = textoActual.substring(start, end);
    const textoAInsertar = seleccion || textoPorDefecto;

    const nuevoTexto =
      textoActual.substring(0, start) +
      antes +
      textoAInsertar +
      despues +
      textoActual.substring(end);

    onChange(nuevoTexto);

    setTimeout(() => {
      textarea.focus();
      const nuevoCursorPos = start + antes.length + textoAInsertar.length;
      textarea.setSelectionRange(nuevoCursorPos, nuevoCursorPos);
    }, 10);
  };

  const insertarEncabezado = (nivel: 1 | 2 | 3 | 4) => {
    const prefijo = '#'.repeat(nivel) + ' ';
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const textoActual = value;
    // Verificar si estamos al inicio de línea
    const ultimoSalto = textoActual.lastIndexOf('\n', start - 1);
    const inicioLinea = ultimoSalto === -1 ? 0 : ultimoSalto + 1;
    const esInicioLinea = start === inicioLinea;

    insertarTexto(esInicioLinea ? prefijo : '\n' + prefijo, '', `Encabezado H${nivel}`);
  };

  const handleSubirImagenLocal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      const { url } = await uploadFile(file, 'courses');
      insertarTexto(`\n![${file.name.replace(/\.[^/.]+$/, '')}](${url})\n`);
      setModalImagen(false);
      setImagenUrl('');
    } catch (err) {
      console.warn('Error al subir imagen:', err);
      alert('No se pudo subir la imagen.');
    } finally {
      setSubiendoImagen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmarImagenUrl = () => {
    if (!imagenUrl.trim()) return;
    insertarTexto(`\n![Imagen](${imagenUrl.trim()})\n`);
    setModalImagen(false);
    setImagenUrl('');
  };

  const handleConfirmarLink = () => {
    if (!linkUrl.trim()) return;
    const texto = linkTexto.trim() || linkUrl.trim();
    insertarTexto(`[${texto}](${linkUrl.trim()})`);
    setModalLink(false);
    setLinkTexto('');
    setLinkUrl('');
  };

  const handleConfirmarVideo = () => {
    if (!videoUrl.trim()) return;
    insertarTexto(`\n\n[video](${videoUrl.trim()})\n\n`);
    setModalVideo(false);
    setVideoUrl('');
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-gray-700 font-bold text-xs">{label}</label>
          <button
            type="button"
            onClick={() => setModoVistaPrevia(!modoVistaPrevia)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              modoVistaPrevia
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {modoVistaPrevia ? (
              <>
                <Edit3 className="w-3 h-3" /> Modo Edición
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" /> Vista Previa
              </>
            )}
          </button>
        </div>
      )}

      {/* Editor Container */}
      <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
        
        {/* Top Toolbar matching screenshot exactly */}
        <div className="bg-[#f8fafc] border-b border-gray-200 px-2 py-1.5 flex flex-wrap items-center gap-1 select-none">
          
          {/* Headings: H1, H2, H3, H4 */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => insertarEncabezado(1)}
              title="Encabezado 1"
              className="px-2 py-1 hover:bg-gray-200 active:bg-gray-300 rounded text-xs font-black text-gray-700 transition-colors flex items-baseline"
            >
              H<span className="text-[10px] font-bold">1</span>
            </button>
            <button
              type="button"
              onClick={() => insertarEncabezado(2)}
              title="Encabezado 2"
              className="px-2 py-1 hover:bg-gray-200 active:bg-gray-300 rounded text-xs font-black text-gray-700 transition-colors flex items-baseline"
            >
              H<span className="text-[10px] font-bold">2</span>
            </button>
            <button
              type="button"
              onClick={() => insertarEncabezado(3)}
              title="Encabezado 3"
              className="px-2 py-1 hover:bg-gray-200 active:bg-gray-300 rounded text-xs font-black text-gray-700 transition-colors flex items-baseline"
            >
              H<span className="text-[10px] font-bold">3</span>
            </button>
            <button
              type="button"
              onClick={() => insertarEncabezado(4)}
              title="Encabezado 4"
              className="px-2 py-1 hover:bg-gray-200 active:bg-gray-300 rounded text-xs font-black text-gray-700 transition-colors flex items-baseline"
            >
              H<span className="text-[10px] font-bold">4</span>
            </button>
          </div>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Formats: B, I, S, <> */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => insertarTexto('**', '**', 'negrita')}
              title="Negrita (Ctrl+B)"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-xs font-black text-gray-800 transition-colors"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertarTexto('*', '*', 'cursiva')}
              title="Cursiva (Ctrl+I)"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-xs font-serif italic font-bold text-gray-800 transition-colors"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => insertarTexto('~~', '~~', 'tachado')}
              title="Tachado"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-xs line-through font-bold text-gray-800 transition-colors"
            >
              S
            </button>
            <button
              type="button"
              onClick={() => insertarTexto('`', '`', 'código')}
              title="Código en línea"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-xs font-mono font-bold text-gray-700 transition-colors"
            >
              &lt;&gt;
            </button>
          </div>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Lists & Quotes & Code Block */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => insertarTexto('\n- ', '', 'Elemento de lista')}
              title="Lista con viñetas"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertarTexto('\n1. ', '', 'Elemento numerado')}
              title="Lista numerada"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 transition-colors"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertarTexto('\n> ', '', 'Cita de texto o regla clave...')}
              title="Cita / Bloque destacado"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 transition-colors"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertarTexto('\n```typescript\n', '\n```\n', '// Tu código o estrategia aquí')}
              title="Bloque de código"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 transition-colors"
            >
              <Code2 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Media & Links: Image, Link, Divider, Video */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setModalImagen(true)}
              title="Insertar imagen"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const textarea = textareaRef.current;
                if (textarea) {
                  const seleccion = value.substring(textarea.selectionStart, textarea.selectionEnd);
                  setLinkTexto(seleccion);
                }
                setModalLink(true);
              }}
              title="Insertar enlace"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertarTexto('\n---\n')}
              title="Línea divisoria horizontal"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setModalVideo(true)}
              title="Insertar video de YouTube o Loom"
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 hover:text-red-600 transition-colors"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>

          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={() => setModoVistaPrevia(!modoVistaPrevia)}
              title={modoVistaPrevia ? 'Volver al editor' : 'Ver resultado formateado'}
              className="px-2 py-1 text-[11px] font-bold text-gray-600 hover:text-blue-600 flex items-center gap-1 rounded hover:bg-gray-200"
            >
              {modoVistaPrevia ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{modoVistaPrevia ? 'Editar' : 'Previa'}</span>
            </button>
          </div>
        </div>

        {/* Content Area: Editor or Live Preview */}
        {modoVistaPrevia ? (
          <div
            style={{ minHeight }}
            className="p-4 bg-white prose prose-sm max-w-none text-gray-800 overflow-y-auto"
          >
            {value.trim() ? (
              <RichTextRenderer content={value} />
            ) : (
              <p className="text-gray-400 italic text-xs">Sin contenido para previsualizar.</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full p-4 bg-white text-gray-900 text-xs sm:text-sm font-normal leading-relaxed outline-none resize-y border-none"
          />
        )}
      </div>

      {/* MODAL INSERTAR ENLACE */}
      {modalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-blue-600" /> Insertar Enlace
              </h4>
              <button onClick={() => setModalLink(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div>
                <label className="block text-gray-600 mb-1">Texto a mostrar</label>
                <input
                  type="text"
                  placeholder="Ej: TradingView Gráfico"
                  value={linkTexto}
                  onChange={(e) => setLinkTexto(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">URL del enlace</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalLink(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarLink}
                className="px-4 py-1.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black"
              >
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSERTAR VIDEO */}
      {modalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-red-600" /> Insertar Video (YouTube / Loom)
              </h4>
              <button onClick={() => setModalVideo(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div>
                <label className="block text-gray-600 mb-1">URL del Video</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... o Loom"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalVideo(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarVideo}
                className="px-4 py-1.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black"
              >
                Insertar Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSERTAR IMAGEN */}
      {modalImagen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" /> Insertar Imagen
              </h4>
              <button onClick={() => setModalImagen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold">
              {/* Subir archivo */}
              <div>
                <label className="block text-gray-700 mb-1">Subir desde tu ordenador</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSubirImagenLocal}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={subiendoImagen}
                  className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                >
                  {subiendoImagen ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Subiendo imagen...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">Haz clic para seleccionar archivo</span>
                      <span className="text-[10px] text-gray-400 font-normal">PNG, JPG, GIF, WebP</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] text-gray-400 font-normal">o ingresar URL directa</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* URL directa */}
              <div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalImagen(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarImagenUrl}
                disabled={!imagenUrl.trim()}
                className="px-4 py-1.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black disabled:opacity-50"
              >
                Insertar URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
