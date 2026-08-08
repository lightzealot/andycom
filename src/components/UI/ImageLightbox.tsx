/**
 * ImageLightbox.tsx
 * Modal de imagen a pantalla completa con zoom y cierre.
 * Se muestra al hacer clic en cualquier imagen del feed.
 */

import React, { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface Props {
  src: string;
  alt?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<Props> = ({ src, alt = 'Imagen', onClose }) => {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/25 transition-all z-10"
        title="Cerrar (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Image */}
      <div
        className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // No cerrar al clicar la imagen
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          style={{ userSelect: 'none' }}
        />
        <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/50 text-white">
          <ZoomIn className="w-4 h-4" />
        </div>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-medium">
        Haz clic fuera o presiona Esc para cerrar
      </div>
    </div>
  );
};
