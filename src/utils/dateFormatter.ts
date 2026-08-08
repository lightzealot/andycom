/**
 * dateFormatter.ts
 * Formatea fechas de forma 100% segura para evitar 'Invalid Date' en la interfaz.
 */

export const formatearFechaRegistro = (raw?: string | null): string => {
  if (!raw || typeof raw !== 'string') return 'Miembro reciente';

  // Si ya es un texto corto en español válido
  const textoLimpio = raw.trim();
  if (textoLimpio === 'Hoy' || textoLimpio === 'Reciente' || textoLimpio.startsWith('Hace ')) {
    return textoLimpio;
  }

  // Intentar parsear como fecha real
  const parsed = Date.parse(textoLimpio);
  if (isNaN(parsed)) {
    return 'Miembro reciente';
  }

  try {
    const d = new Date(parsed);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Miembro reciente';
  }
};
