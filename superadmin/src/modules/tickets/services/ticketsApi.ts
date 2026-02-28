export interface TicketDetalle {
  id: number;
  tenantId: number;
  tenantNombre: string;
  usuarioPlataformaId: number;
  atendidoPor: string;
  asunto: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  respuesta: string;
  fechaRespuesta: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetalleResponse {
  success: boolean;
  message: string;
  data: TicketDetalle;
}

export interface TicketEvento {
  id: string;
  ticketId: number;
  tipo: 'creacion' | 'cambio_estado' | 'respuesta';
  descripcion: string;
  usuario: string;
  fecha: string;
}

const STORAGE_TICKETS_KEY = 'frontend.tickets.mock.list';
const STORAGE_HISTORIAL_KEY = 'frontend.tickets.mock.historial';
const COOKIE_TICKETS_KEY = 'shared_tickets_mock_list';
const COOKIE_HISTORIAL_KEY = 'shared_tickets_mock_historial';

const DEFAULT_TICKETS: TicketDetalle[] = [
  {
    id: 9007199254740991,
    tenantId: 9007199254740991,
    tenantNombre: 'New Hype Boutique',
    usuarioPlataformaId: 9007199254740991,
    atendidoPor: 'soporte.n1@newhype.pe',
    asunto: 'No carga reporte de ventas mensual',
    descripcion: 'El reporte de ventas se queda en estado cargando desde ayer en la noche.',
    prioridad: 'alta',
    estado: 'en_proceso',
    respuesta: 'Se identificó incidencia en generación de reportes. Equipo técnico en corrección.',
    fechaRespuesta: '2026-02-26T21:17:44.872Z',
    createdAt: '2026-02-26T21:17:44.872Z',
    updatedAt: '2026-02-26T21:17:44.872Z',
  },
  {
    id: 9007199254740990,
    tenantId: 9007199254740991,
    tenantNombre: 'New Hype Boutique',
    usuarioPlataformaId: 9007199254741002,
    atendidoPor: 'soporte.n2@newhype.pe',
    asunto: 'Error al registrar nuevo usuario',
    descripcion: 'El formulario de alta de usuario devuelve mensaje de validación inesperado.',
    prioridad: 'media',
    estado: 'resuelto',
    respuesta: 'Se ajustaron validaciones en backend. Solicitud cerrada exitosamente.',
    fechaRespuesta: '2026-02-26T19:10:11.300Z',
    createdAt: '2026-02-25T17:35:22.112Z',
    updatedAt: '2026-02-26T19:10:11.300Z',
  },
  {
    id: 9007199254740989,
    tenantId: 9007199254741005,
    tenantNombre: 'Urban Style SAC',
    usuarioPlataformaId: 9007199254741009,
    atendidoPor: '',
    asunto: 'Solicitud de mejora para exportar inventario',
    descripcion: 'Se requiere descargar inventario en formato CSV con filtros por categoría.',
    prioridad: 'baja',
    estado: 'abierto',
    respuesta: '',
    fechaRespuesta: null,
    createdAt: '2026-02-24T11:08:07.901Z',
    updatedAt: '2026-02-24T11:08:07.901Z',
  },
];

const DEFAULT_HISTORIAL: Record<number, TicketEvento[]> = {
  9007199254740991: [
    {
      id: 'evt-001',
      ticketId: 9007199254740991,
      tipo: 'creacion',
      descripcion: 'Ticket creado por plataforma.',
      usuario: 'sistema',
      fecha: '2026-02-26T21:17:44.872Z',
    },
    {
      id: 'evt-002',
      ticketId: 9007199254740991,
      tipo: 'cambio_estado',
      descripcion: 'Estado actualizado a en_proceso.',
      usuario: 'soporte.n1@newhype.pe',
      fecha: '2026-02-26T21:20:10.000Z',
    },
  ],
  9007199254740990: [
    {
      id: 'evt-003',
      ticketId: 9007199254740990,
      tipo: 'creacion',
      descripcion: 'Ticket creado por plataforma.',
      usuario: 'sistema',
      fecha: '2026-02-25T17:35:22.112Z',
    },
    {
      id: 'evt-004',
      ticketId: 9007199254740990,
      tipo: 'respuesta',
      descripcion: 'Se registró respuesta de soporte.',
      usuario: 'soporte.n2@newhype.pe',
      fecha: '2026-02-26T19:10:11.300Z',
    },
  ],
  9007199254740989: [
    {
      id: 'evt-005',
      ticketId: 9007199254740989,
      tipo: 'creacion',
      descripcion: 'Ticket creado por plataforma.',
      usuario: 'sistema',
      fecha: '2026-02-24T11:08:07.901Z',
    },
  ],
};

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const key = `${name}=`;
  const items = document.cookie.split(';');
  for (const item of items) {
    const trimmed = item.trim();
    if (trimmed.startsWith(key)) {
      return decodeURIComponent(trimmed.substring(key.length));
    }
  }
  return null;
};

const writeCookie = (name: string, value: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

const readTicketsFromStorage = (): TicketDetalle[] => {
  if (typeof window === 'undefined') return [...DEFAULT_TICKETS];
  const cookieValue = readCookie(COOKIE_TICKETS_KEY);
  if (cookieValue) {
    return safeParse<TicketDetalle[]>(cookieValue, [...DEFAULT_TICKETS]);
  }

  return safeParse<TicketDetalle[]>(
    window.localStorage.getItem(STORAGE_TICKETS_KEY),
    [...DEFAULT_TICKETS],
  );
};

const readHistorialFromStorage = (): Record<number, TicketEvento[]> => {
  if (typeof window === 'undefined') return { ...DEFAULT_HISTORIAL };
  const cookieValue = readCookie(COOKIE_HISTORIAL_KEY);
  if (cookieValue) {
    return safeParse<Record<number, TicketEvento[]>>(cookieValue, { ...DEFAULT_HISTORIAL });
  }

  return safeParse<Record<number, TicketEvento[]>>(
    window.localStorage.getItem(STORAGE_HISTORIAL_KEY),
    { ...DEFAULT_HISTORIAL },
  );
};

let MOCK_TICKETS: TicketDetalle[] = readTicketsFromStorage();
let MOCK_HISTORIAL: Record<number, TicketEvento[]> = readHistorialFromStorage();

const syncTicketsStateFromStorage = () => {
  MOCK_TICKETS = readTicketsFromStorage();
  MOCK_HISTORIAL = readHistorialFromStorage();
};

const persistTicketsState = () => {
  if (typeof window === 'undefined') return;
  const ticketsValue = JSON.stringify(MOCK_TICKETS);
  const historialValue = JSON.stringify(MOCK_HISTORIAL);

  window.localStorage.setItem(STORAGE_TICKETS_KEY, ticketsValue);
  window.localStorage.setItem(STORAGE_HISTORIAL_KEY, historialValue);
  writeCookie(COOKIE_TICKETS_KEY, ticketsValue);
  writeCookie(COOKIE_HISTORIAL_KEY, historialValue);
};

const buildEventId = () => `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const fetchTickets = async (): Promise<TicketDetalle[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  syncTicketsStateFromStorage();
  return [...MOCK_TICKETS].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const fetchTicketHistorial = async (id: number): Promise<TicketEvento[]> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  syncTicketsStateFromStorage();
  return [...(MOCK_HISTORIAL[id] ?? [])].sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });
};

export const fetchTicketDetalle = async (id: number): Promise<TicketDetalleResponse | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  syncTicketsStateFromStorage();

  const ticket = MOCK_TICKETS.find(item => item.id === id);
  if (!ticket) {
    return null;
  }

  return {
    success: true,
    message: 'Ticket encontrado correctamente',
    data: ticket,
  };
};

export const cambiarEstadoTicket = async (
  id: number,
  estado: TicketDetalle['estado'],
): Promise<TicketDetalleResponse | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const index = MOCK_TICKETS.findIndex(item => item.id === id);
  if (index === -1) {
    return null;
  }

  const previousEstado = MOCK_TICKETS[index].estado;

  MOCK_TICKETS[index] = {
    ...MOCK_TICKETS[index],
    estado,
    updatedAt: new Date().toISOString(),
  };

  if (previousEstado !== estado) {
    const event: TicketEvento = {
      id: buildEventId(),
      ticketId: id,
      tipo: 'cambio_estado',
      descripcion: `Estado actualizado de ${previousEstado} a ${estado}.`,
      usuario: MOCK_TICKETS[index].atendidoPor || 'soporte',
      fecha: MOCK_TICKETS[index].updatedAt,
    };
    MOCK_HISTORIAL[id] = [event, ...(MOCK_HISTORIAL[id] ?? [])];
  }

  persistTicketsState();

  return {
    success: true,
    message: 'Estado de ticket actualizado',
    data: MOCK_TICKETS[index],
  };
};

export const responderTicket = async (
  id: number,
  respuesta: string,
  atendidoPor: string,
): Promise<TicketDetalleResponse | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const index = MOCK_TICKETS.findIndex(item => item.id === id);
  if (index === -1) {
    return null;
  }

  MOCK_TICKETS[index] = {
    ...MOCK_TICKETS[index],
    respuesta,
    atendidoPor,
    fechaRespuesta: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const event: TicketEvento = {
    id: buildEventId(),
    ticketId: id,
    tipo: 'respuesta',
    descripcion: 'Se registró una nueva respuesta de soporte.',
    usuario: atendidoPor,
    fecha: MOCK_TICKETS[index].updatedAt,
  };
  MOCK_HISTORIAL[id] = [event, ...(MOCK_HISTORIAL[id] ?? [])];

  persistTicketsState();

  return {
    success: true,
    message: 'Respuesta registrada correctamente',
    data: MOCK_TICKETS[index],
  };
};
