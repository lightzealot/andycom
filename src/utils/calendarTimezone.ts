export const BOGOTA_TIME_ZONE = 'America/Bogota';

const bogotaParts = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOGOTA_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
};

export function bogotaDateKey(value: string | Date): string {
  const p = bogotaParts(value);
  return `${p.year}-${p.month}-${p.day}`;
}

export function toBogotaDateTimeLocal(value: string | Date): string {
  const p = bogotaParts(value);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function bogotaLocalToISOString(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new Error('Fecha y hora de Bogotá inválida');
  }
  return new Date(`${value}:00-05:00`).toISOString();
}

export function formatBogotaTime(value: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: BOGOTA_TIME_ZONE,
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(value));
}

export function formatBogotaDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat('es-CO', {
    ...options,
    timeZone: BOGOTA_TIME_ZONE,
  }).format(new Date(value));
}

export function bogotaCalendarDate(value: string | Date): Date {
  const [year, month, day] = bogotaDateKey(value).split('-').map(Number);
  return new Date(year, month - 1, day);
}
