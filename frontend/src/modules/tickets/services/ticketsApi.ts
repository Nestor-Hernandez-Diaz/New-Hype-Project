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

export interface TicketEvento {
  id: string;
  ticketId: number;
  tipo: 'creacion' | 'cambio_estado' | 'respuesta';
  descripcion: string;
  usuario: string;
  fecha: string;
}

export interface CrearTicketInput {
  asunto: string;
  descripcion: string;
  prioridad: TicketDetalle['prioridad'];
  tenantId?: number;
  tenantNombre?: string;
  usuarioPlataformaId?: number;
}

export interface EmpresaTicketOption {
  tenantId: number;
  tenantNombre: string;
  usuarioPlataformaId: number;
}

const STORAGE_TICKETS_KEY = 'frontend.tickets.mock.list';
const STORAGE_HISTORIAL_KEY = 'frontend.tickets.mock.historial';
const COOKIE_TICKETS_KEY = 'shared_tickets_mock_list';
const COOKIE_HISTORIAL_KEY = 'shared_tickets_mock_historial';

const DEFAULT_TICKETS: TicketDetalle[] = [
  {
    id: 9007199254740991,
    tenantId: 9007199254741004,
    tenantNombre: 'Urban Style SAC',
    usuarioPlataformaId: 9007199254741008,
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
  {
    id: 9007199254740990,
    tenantId: 9007199254741003,
    tenantNombre: 'New Hype Boutique',
    usuarioPlataformaId: 9007199254741007,
    atendidoPor: 'soporte.n1@newhype.pe',
    asunto: 'No carga reporte de ventas mensual',
    descripcion: 'El reporte de ventas se queda en estado cargando desde ayer en la noche.',
    prioridad: 'alta',
    estado: 'en_proceso',
    respuesta: 'Se identificó incidencia en generación de reportes. Equipo técnico en corrección.',
    fechaRespuesta: '2026-02-26T21:17:44.872Z',
    createdAt: '2026-02-26T21:17:44.872Z',
    updatedAt: '2026-02-26T21:20:10.000Z',
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
      fecha: '2026-02-24T11:08:07.901Z',
    },
  ],
  9007199254740990: [
    {
      id: 'evt-002',
      ticketId: 9007199254740990,
      tipo: 'creacion',
      descripcion: 'Ticket creado por plataforma.',
      usuario: 'sistema',
      fecha: '2026-02-26T21:17:44.872Z',
    },
    {
      id: 'evt-003',
      ticketId: 9007199254740990,
      tipo: 'cambio_estado',
      descripcion: 'Estado actualizado a en_proceso.',
      usuario: 'soporte.n1@newhype.pe',
      fecha: '2026-02-26T21:20:10.000Z',
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

const MOCK_EMPRESAS: EmpresaTicketOption[] = [
  {
    tenantId: 9007199254741004,
    tenantNombre: 'Urban Style SAC',
    usuarioPlataformaId: 9007199254741008,
  },
  {
    tenantId: 9007199254741003,
    tenantNombre: 'New Hype Boutique',
    usuarioPlataformaId: 9007199254741007,
  },
  {
    tenantId: 9007199254741002,
    tenantNombre: 'Moda Express EIRL',
    usuarioPlataformaId: 9007199254741006,
  },
];

export const fetchEmpresasTicket = async (): Promise<EmpresaTicketOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [...MOCK_EMPRESAS];
};

export const fetchTickets = async (): Promise<TicketDetalle[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  syncTicketsStateFromStorage();
  return [...MOCK_TICKETS].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const fetchTicketDetalle = async (id: number): Promise<TicketDetalle | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  syncTicketsStateFromStorage();
  return MOCK_TICKETS.find(item => item.id === id) ?? null;
};

export const fetchTicketHistorial = async (id: number): Promise<TicketEvento[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  syncTicketsStateFromStorage();
  return [...(MOCK_HISTORIAL[id] ?? [])];
};

export const crearTicket = async (input: CrearTicketInput): Promise<TicketDetalle> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const now = new Date().toISOString();
  const newId = Date.now();

  const nuevoTicket: TicketDetalle = {
    id: newId,
    tenantId: input.tenantId ?? 9007199254741004,
    tenantNombre: input.tenantNombre ?? 'Empresa Cliente',
    usuarioPlataformaId: input.usuarioPlataformaId ?? Date.now(),
    atendidoPor: '',
    asunto: input.asunto,
    descripcion: input.descripcion,
    prioridad: input.prioridad,
    estado: 'abierto',
    respuesta: '',
    fechaRespuesta: null,
    createdAt: now,
    updatedAt: now,
  };

  MOCK_TICKETS.unshift(nuevoTicket);
  MOCK_HISTORIAL[newId] = [
    {
      id: `evt-${newId}`,
      ticketId: newId,
      tipo: 'creacion',
      descripcion: 'Ticket creado por empresa.',
      usuario: 'empresa',
      fecha: now,
    },
  ];

  persistTicketsState();

  return nuevoTicket;
};
