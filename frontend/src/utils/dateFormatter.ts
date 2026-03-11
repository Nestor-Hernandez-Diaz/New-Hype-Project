/**
 * Normaliza un string de fecha del backend para que sea interpretado como UTC.
 * El backend envía fechas sin sufijo 'Z' (ej: "2026-03-11T04:41:18"),
 * lo cual JavaScript interpreta como hora local del navegador.
 * Esta función agrega 'Z' para forzar interpretación UTC.
 */
function parseAsUTC(dateString: string | Date): Date {
  if (dateString instanceof Date) return dateString;
  // Si el string no tiene indicador de timezone (Z, +, -), agregar Z para interpretar como UTC
  if (typeof dateString === 'string' && !dateString.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateString)) {
    return new Date(dateString + 'Z');
  }
  return new Date(dateString);
}

/**
 * Formatea una fecha UTC a hora local de Perú (UTC-5)
 * @param dateString - Fecha en formato ISO string desde backend
 * @returns Fecha formateada en formato DD/MM/YYYY HH:mm:ss
 */
export function formatDateToLocal(dateString: string | Date): string {
  if (!dateString) return '-';

  const date = parseAsUTC(dateString);
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return '-';
  
  // Opciones para formatear en timezone de Lima (UTC-5)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  
  const formatter = new Intl.DateTimeFormat('es-PE', options);
  const parts = formatter.formatToParts(date);
  
  // Extraer partes
  const day = parts.find(p => p.type === 'day')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const year = parts.find(p => p.type === 'year')?.value || '';
  const hour = parts.find(p => p.type === 'hour')?.value || '';
  const minute = parts.find(p => p.type === 'minute')?.value || '';
  const second = parts.find(p => p.type === 'second')?.value || '';
  
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

/**
 * Formatea solo la fecha (sin hora)
 */
export function formatDateOnly(dateString: string | Date): string {
  if (!dateString) return '-';

  const date = parseAsUTC(dateString);
  if (isNaN(date.getTime())) return '-';
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  
  const formatter = new Intl.DateTimeFormat('es-PE', options);
  const parts = formatter.formatToParts(date);
  
  const day = parts.find(p => p.type === 'day')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const year = parts.find(p => p.type === 'year')?.value || '';
  
  return `${day}/${month}/${year}`;
}

/**
 * Formatea solo la hora
 */
export function formatTimeOnly(dateString: string | Date): string {
  if (!dateString) return '-';

  const date = parseAsUTC(dateString);
  if (isNaN(date.getTime())) return '-';
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  
  return new Intl.DateTimeFormat('es-PE', options).format(date);
}
