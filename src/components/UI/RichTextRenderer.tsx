import React from 'react';
import { formatVideoEmbedUrl } from '../../utils/videoHelper';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Renderizar bloques de contenido (encabezados, párrafos, listas, imágenes, videos, citas, etc.)
  const renderFormattedContent = () => {
    const lineas = content.split('\n');
    const elementos: React.ReactNode[] = [];
    let enBloqueCodigo = false;
    let codigoActual: string[] = [];
    let enListaDesordenada = false;
    let itemsListaDesordenada: string[] = [];
    let enListaOrdenada = false;
    let itemsListaOrdenada: string[] = [];

    const flushListas = (keyPrefix: string) => {
      if (enListaDesordenada && itemsListaDesordenada.length > 0) {
        elementos.push(
          <ul key={`${keyPrefix}-ul`} className="list-disc list-inside space-y-1 my-2 text-gray-700 font-normal">
            {itemsListaDesordenada.map((item, idx) => (
              <li key={idx} className="text-xs sm:text-sm leading-relaxed">
                {renderInlineStyles(item)}
              </li>
            ))}
          </ul>
        );
        enListaDesordenada = false;
        itemsListaDesordenada = [];
      }
      if (enListaOrdenada && itemsListaOrdenada.length > 0) {
        elementos.push(
          <ol key={`${keyPrefix}-ol`} className="list-decimal list-inside space-y-1 my-2 text-gray-700 font-normal">
            {itemsListaOrdenada.map((item, idx) => (
              <li key={idx} className="text-xs sm:text-sm leading-relaxed">
                {renderInlineStyles(item)}
              </li>
            ))}
          </ol>
        );
        enListaOrdenada = false;
        itemsListaOrdenada = [];
      }
    };

    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i];

      // Bloque de código ```
      if (linea.trim().startsWith('```')) {
        if (enBloqueCodigo) {
          elementos.push(
            <pre key={`code-${i}`} className="p-3.5 my-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-xs font-mono border border-slate-800">
              <code>{codigoActual.join('\n')}</code>
            </pre>
          );
          codigoActual = [];
          enBloqueCodigo = false;
        } else {
          flushListas(`pre-code-${i}`);
          enBloqueCodigo = true;
        }
        continue;
      }

      if (enBloqueCodigo) {
        codigoActual.push(linea);
        continue;
      }

      // Regla horizontal ---
      if (linea.trim() === '---' || linea.trim() === '***') {
        flushListas(`hr-${i}`);
        elementos.push(<hr key={`hr-${i}`} className="my-4 border-gray-200" />);
        continue;
      }

      // Encabezados H1 - H4
      if (linea.startsWith('# ')) {
        flushListas(`h1-${i}`);
        elementos.push(
          <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-black text-gray-900 mt-4 mb-2 tracking-tight">
            {renderInlineStyles(linea.substring(2))}
          </h1>
        );
        continue;
      }
      if (linea.startsWith('## ')) {
        flushListas(`h2-${i}`);
        elementos.push(
          <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-extrabold text-gray-900 mt-3.5 mb-1.5 tracking-tight">
            {renderInlineStyles(linea.substring(3))}
          </h2>
        );
        continue;
      }
      if (linea.startsWith('### ')) {
        flushListas(`h3-${i}`);
        elementos.push(
          <h3 key={`h3-${i}`} className="text-base sm:text-lg font-bold text-gray-900 mt-3 mb-1">
            {renderInlineStyles(linea.substring(4))}
          </h3>
        );
        continue;
      }
      if (linea.startsWith('#### ')) {
        flushListas(`h4-${i}`);
        elementos.push(
          <h4 key={`h4-${i}`} className="text-sm sm:text-base font-bold text-gray-800 mt-2.5 mb-1">
            {renderInlineStyles(linea.substring(5))}
          </h4>
        );
        continue;
      }

      // Bloque de Cita >
      if (linea.startsWith('> ')) {
        flushListas(`quote-${i}`);
        elementos.push(
          <blockquote key={`quote-${i}`} className="pl-4 py-1.5 my-2.5 border-l-4 border-blue-500 bg-blue-50/60 rounded-r-xl text-xs sm:text-sm text-gray-800 italic font-medium">
            {renderInlineStyles(linea.substring(2))}
          </blockquote>
        );
        continue;
      }

      // Listas con viñetas -
      if (linea.trim().startsWith('- ') || linea.trim().startsWith('* ')) {
        if (!enListaDesordenada) {
          flushListas(`ul-start-${i}`);
          enListaDesordenada = true;
        }
        itemsListaDesordenada.push(linea.trim().substring(2));
        continue;
      }

      // Listas numeradas 1.
      const matchNum = linea.trim().match(/^(\d+)\.\s+(.*)$/);
      if (matchNum) {
        if (!enListaOrdenada) {
          flushListas(`ol-start-${i}`);
          enListaOrdenada = true;
        }
        itemsListaOrdenada.push(matchNum[2]);
        continue;
      }

      // Video Embed [video](url) o enlaces directos de youtube
      const matchVideo = linea.trim().match(/^\[video\]\((https?:\/\/[^\s)]+)\)$/i);
      if (matchVideo) {
        flushListas(`vid-${i}`);
        const embedUrl = formatVideoEmbedUrl(matchVideo[1]);
        if (embedUrl) {
          elementos.push(
            <div key={`vid-${i}`} className="my-4 aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-black shadow-sm">
              <iframe
                src={embedUrl}
                title="Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        continue;
      }

      // Imagen ![alt](url)
      const matchImg = linea.trim().match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+)\)$/);
      if (matchImg) {
        flushListas(`img-${i}`);
        elementos.push(
          <div key={`img-${i}`} className="my-3 rounded-2xl overflow-hidden border border-gray-200 bg-black/5">
            <img
              src={matchImg[2]}
              alt={matchImg[1] || 'Imagen del curso'}
              className="max-h-96 w-full object-contain mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {matchImg[1] && (
              <div className="text-[11px] text-center text-gray-500 py-1 font-medium bg-gray-50 border-t border-gray-100">
                {matchImg[1]}
              </div>
            )}
          </div>
        );
        continue;
      }

      // Si es una línea vacía
      if (!linea.trim()) {
        flushListas(`empty-${i}`);
        continue;
      }

      // Párrafo normal
      flushListas(`p-${i}`);
      elementos.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal my-1.5">
          {renderInlineStyles(linea)}
        </p>
      );
    }

    flushListas('final');
    return elementos;
  };

  // Helper para estilos inline: **negrita**, *cursiva*, ~~tachado~~, `código`, [link](url)
  const renderInlineStyles = (texto: string): React.ReactNode => {
    // Parser simple y seguro para estilos en línea
    const partes: React.ReactNode[] = [];
    let restante = texto;
    let keyIdx = 0;

    while (restante.length > 0) {
      // 1. Imagen inline ![alt](url)
      const imgMatch = restante.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+)\)/);
      if (imgMatch) {
        partes.push(
          <img
            key={`img-${keyIdx++}`}
            src={imgMatch[2]}
            alt={imgMatch[1]}
            className="inline-block max-h-40 rounded-lg border border-gray-200 my-1"
          />
        );
        restante = restante.substring(imgMatch[0].length);
        continue;
      }

      // 2. Link [texto](url)
      const linkMatch = restante.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)/);
      if (linkMatch) {
        partes.push(
          <a
            key={`link-${keyIdx++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors"
          >
            {linkMatch[1] || linkMatch[2]}
          </a>
        );
        restante = restante.substring(linkMatch[0].length);
        continue;
      }

      // 3. Negrita **texto**
      const boldMatch = restante.match(/^\*\*(.+?)\*\*/);
      if (boldMatch) {
        partes.push(
          <strong key={`b-${keyIdx++}`} className="font-extrabold text-gray-900">
            {boldMatch[1]}
          </strong>
        );
        restante = restante.substring(boldMatch[0].length);
        continue;
      }

      // 4. Cursiva *texto*
      const italicMatch = restante.match(/^\*(.+?)\*/);
      if (italicMatch) {
        partes.push(
          <em key={`i-${keyIdx++}`} className="italic font-medium">
            {italicMatch[1]}
          </em>
        );
        restante = restante.substring(italicMatch[0].length);
        continue;
      }

      // 5. Tachado ~~texto~~
      const strikeMatch = restante.match(/^~~(.+?)~~/);
      if (strikeMatch) {
        partes.push(
          <span key={`s-${keyIdx++}`} className="line-through text-gray-400">
            {strikeMatch[1]}
          </span>
        );
        restante = restante.substring(strikeMatch[0].length);
        continue;
      }

      // 6. Código en línea `codigo`
      const codeMatch = restante.match(/^`([^`]+)`/);
      if (codeMatch) {
        partes.push(
          <code key={`c-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-gray-100 text-pink-600 font-mono text-xs font-bold border border-gray-200">
            {codeMatch[1]}
          </code>
        );
        restante = restante.substring(codeMatch[0].length);
        continue;
      }

      // Carácter normal
      const proximoEspecial = restante.search(/(\!\[|\[|\*\*|\*|~~|`)/);
      if (proximoEspecial === -1) {
        partes.push(restante);
        break;
      } else if (proximoEspecial === 0) {
        partes.push(restante[0]);
        restante = restante.substring(1);
      } else {
        partes.push(restante.substring(0, proximoEspecial));
        restante = restante.substring(proximoEspecial);
      }
    }

    return partes;
  };

  return <div className={`rich-text-content space-y-1 ${className}`}>{renderFormattedContent()}</div>;
};
