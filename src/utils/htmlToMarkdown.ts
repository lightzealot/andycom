/**
 * htmlToMarkdown.ts
 * Convierte código HTML enriquecido (copiado desde Word, Google Docs, Notion, ChatGPT, páginas web)
 * a formato Markdown limpio y estándar para el editor.
 */

export function htmlToMarkdown(htmlString: string): string {
  if (!htmlString || typeof htmlString !== 'string') return '';

  // Usar DOMParser nativo del navegador
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const body = doc.body;

  if (!body) return '';

  return processNode(body).trim();
}

function processNode(node: Node, context: { listType?: 'ul' | 'ol'; listIndex?: number } = {}): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  // Ignorar scripts, styles, meta, etc.
  if (['script', 'style', 'meta', 'link', 'noscript'].includes(tag)) {
    return '';
  }

  // Detectar estilos inline comunes (Google Docs / Word / Office)
  const style = el.getAttribute('style') || '';
  const isBoldStyle = /font-weight:\s*(bold|[6-9]00)/i.test(style);
  const isItalicStyle = /font-style:\s*italic/i.test(style);
  const isStrikeStyle = /text-decoration:\s*[^;]*line-through/i.test(style);

  // Procesar hijos recursivamente
  const processChildren = (ctx = context): string => {
    let res = '';
    let index = 1;
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i];
      res += processNode(child, { ...ctx, listIndex: index });
      if (child.nodeName.toLowerCase() === 'li') {
        index++;
      }
    }
    return res;
  };

  let content = processChildren();

  // Aplicar formato de estilos inline en spans / divs
  if (isBoldStyle && !['b', 'strong', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag) && content.trim()) {
    content = wrapFormatting(content, '**');
  }
  if (isItalicStyle && !['i', 'em'].includes(tag) && content.trim()) {
    content = wrapFormatting(content, '*');
  }
  if (isStrikeStyle && !['s', 'del', 'strike'].includes(tag) && content.trim()) {
    content = wrapFormatting(content, '~~');
  }

  switch (tag) {
    // Encabezados
    case 'h1':
      return `\n\n# ${content.trim()}\n\n`;
    case 'h2':
      return `\n\n## ${content.trim()}\n\n`;
    case 'h3':
      return `\n\n### ${content.trim()}\n\n`;
    case 'h4':
      return `\n\n#### ${content.trim()}\n\n`;
    case 'h5':
    case 'h6':
      return `\n\n##### ${content.trim()}\n\n`;

    // Formato de texto
    case 'strong':
    case 'b':
      return content.trim() ? wrapFormatting(content, '**') : '';
    case 'em':
    case 'i':
      return content.trim() ? wrapFormatting(content, '*') : '';
    case 's':
    case 'del':
    case 'strike':
      return content.trim() ? wrapFormatting(content, '~~') : '';
    case 'u':
      return content.trim() ? `<u>${content.trim()}</u>` : '';

    // Enlaces
    case 'a': {
      const href = el.getAttribute('href');
      const text = content.trim() || href || '';
      if (!href) return text;
      return `[${text}](${href})`;
    }

    // Imágenes
    case 'img': {
      const src = el.getAttribute('src');
      const alt = el.getAttribute('alt') || 'Imagen';
      if (!src) return '';
      return `\n![${alt}](${src})\n`;
    }

    // Código
    case 'code':
      if (el.parentElement?.tagName.toLowerCase() === 'pre') {
        return content;
      }
      return content.trim() ? `\`${content.trim()}\`` : '';
    case 'pre': {
      const codeEl = el.querySelector('code');
      const lang = codeEl?.className.match(/language-(\w+)/)?.[1] || '';
      const codeText = el.textContent || '';
      return `\n\n\`\`\`${lang}\n${codeText.trim()}\n\`\`\`\n\n`;
    }

    // Bloques de cita
    case 'blockquote': {
      const lines = content.trim().split('\n');
      return '\n\n' + lines.map((l) => `> ${l}`).join('\n') + '\n\n';
    }

    // Listas
    case 'ul':
      return '\n' + processChildren({ listType: 'ul' }).trim() + '\n\n';
    case 'ol':
      return '\n' + processChildren({ listType: 'ol' }).trim() + '\n\n';
    case 'li': {
      const prefix = context.listType === 'ol' ? `${context.listIndex || 1}. ` : '- ';
      return `\n${prefix}${content.trim()}`;
    }

    // Párrafos y saltos
    case 'p':
      return `\n\n${content.trim()}\n\n`;
    case 'br':
      return '\n';
    case 'hr':
      return '\n\n---\n\n';
    case 'div':
      return `\n${content.trim()}\n`;

    // Tablas
    case 'table':
      return `\n\n${formatTable(el)}\n\n`;

    default:
      return content;
  }
}

/**
 * Envuelve el contenido en un delimitador Markdown preservando los espacios iniciales/finales
 */
function wrapFormatting(text: string, delim: string): string {
  const match = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) return `${delim}${text}${delim}`;
  const [, leading, inner, trailing] = match;
  if (!inner) return text;
  return `${leading}${delim}${inner}${delim}${trailing}`;
}

/**
 * Formatea una tabla HTML en formato Markdown
 */
function formatTable(tableEl: HTMLElement): string {
  const rows = Array.from(tableEl.querySelectorAll('tr'));
  if (rows.length === 0) return '';

  const tableData: string[][] = [];
  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('th, td')).map((c) =>
      (c.textContent || '').trim().replace(/\|/g, '\\|')
    );
    if (cells.length > 0) {
      tableData.push(cells);
    }
  }

  if (tableData.length === 0) return '';

  const colCount = Math.max(...tableData.map((r) => r.length));
  // Rellenar celdas faltantes
  const normalizedRows = tableData.map((r) => {
    while (r.length < colCount) r.push('');
    return r;
  });

  const header = `| ${normalizedRows[0].join(' | ')} |`;
  const separator = `| ${normalizedRows[0].map(() => '---').join(' | ')} |`;
  const body = normalizedRows
    .slice(1)
    .map((r) => `| ${r.join(' | ')} |`)
    .join('\n');

  return body ? `${header}\n${separator}\n${body}` : `${header}\n${separator}`;
}

/**
 * Función que maneja el evento onPaste en un textarea o input y transforma HTML a Markdown automáticamente
 */
export function handleRichPaste(
  e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  currentValue: string,
  onUpdate: (newValue: string) => void
): boolean {
  const clipboardData = e.clipboardData;
  if (!clipboardData) return false;

  const htmlData = clipboardData.getData('text/html');
  const plainText = clipboardData.getData('text/plain');

  // Si hay datos HTML con formato estructurado
  if (htmlData && (
    htmlData.includes('<b>') ||
    htmlData.includes('<strong>') ||
    htmlData.includes('<i>') ||
    htmlData.includes('<em>') ||
    htmlData.includes('<h1>') ||
    htmlData.includes('<h2>') ||
    htmlData.includes('<h3>') ||
    htmlData.includes('<h4>') ||
    htmlData.includes('<ul>') ||
    htmlData.includes('<ol>') ||
    htmlData.includes('<li>') ||
    htmlData.includes('<a ') ||
    htmlData.includes('<table>') ||
    htmlData.includes('<blockquote>') ||
    htmlData.includes('<code>') ||
    htmlData.includes('<pre') ||
    /font-weight:\s*(bold|[6-9]00)/i.test(htmlData) ||
    /font-style:\s*italic/i.test(htmlData) ||
    /text-decoration:\s*[^;]*line-through/i.test(htmlData)
  )) {
    const markdown = htmlToMarkdown(htmlData);
    if (markdown && markdown.trim() !== plainText.trim()) {
      e.preventDefault();

      const target = e.currentTarget as HTMLTextAreaElement;
      const start = target.selectionStart ?? currentValue.length;
      const end = target.selectionEnd ?? currentValue.length;

      const nuevoValor =
        currentValue.substring(0, start) +
        markdown +
        currentValue.substring(end);

      onUpdate(nuevoValor);

      setTimeout(() => {
        target.focus();
        const nuevoCursor = start + markdown.length;
        target.setSelectionRange(nuevoCursor, nuevoCursor);
      }, 10);

      return true;
    }
  }

  return false;
}
