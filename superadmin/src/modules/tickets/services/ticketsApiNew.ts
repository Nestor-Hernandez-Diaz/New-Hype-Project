// ============================================================================
// TICKETS SERVICE — Mock stub (Endpoints 2.1, 2.2, 2.3)
// TODO: Reemplazar mocks por fetch() reales al backend
// ============================================================================

import { simulateDelay } from '../../../services/apiConfig';
import type {
  Ticket,
  TicketFilters,
  TicketUpdatePayload,
  ApiResponse,
} from '../../../types/api';

// ── MOCK DATA ───────────────────────────────────────────────────────────────

const MOCK_TICKETS: Ticket[] = [
  {
    id: 1,
    tenantId: 1,
    tenantNombre: 'Boutique Fashion María',
    usuarioPlataformaId: 10,
    atendidoPor: 'soporte@newhype.pe',
    asunto: 'No carga reporte de ventas mensual',
    descripcion: 'El reporte de ventas se queda en estado cargando desde ayer.',
    prioridad: 'alta',
    estado: 'en_proceso',
    respuesta: 'Se identificó incidencia en generación de reportes. Equipo trabajando.',
    fechaRespuesta: '2026-02-28T10:30:00',
    createdAt: '2026-02-27T14:00:00',
    updatedAt: '2026-02-28T10:30:00',
  },
  {
    id: 2,
    tenantId: 2,
    tenantNombre: 'Urban Style Store',
    usuarioPlataformaId: 20,
    atendidoPor: '',
    asunto: 'Error al registrar producto con talla personalizada',
    descripcion: 'Cuando intento agregar una talla que no está en la lista, no guarda.',
    prioridad: 'media',
    estado: 'abierto',
    respuesta: null,
    fechaRespuesta: null,
    createdAt: '2026-03-01T08:15:00',
    updatedAt: '2026-03-01T08:15:00',
  },
  {
    id: 3,
    tenantId: 3,
    tenantNombre: 'Trendy Kids',
    usuarioPlataformaId: 30,
    atendidoPor: 'soporte@newhype.pe',
    asunto: 'Consulta sobre módulo de compras',
    descripcion: '¿Cómo activo el módulo de compras en mi plan?',
    prioridad: 'baja',
    estado: 'resuelto',
    respuesta: 'El módulo de compras está disponible en planes Pro y Enterprise. Puede cambiar su plan desde configuración.',
    fechaRespuesta: '2026-02-25T16:00:00',
    createdAt: '2026-02-24T09:00:00',
    updatedAt: '2026-02-25T16:00:00',
  },
  {
    id: 4,
    tenantId: 5,
    tenantNombre: 'Sport Zone Lima',
    usuarioPlataformaId: 50,
    atendidoPor: '',
    asunto: 'Importación masiva de productos falla',
    descripcion: 'Al subir un CSV con 200 productos, el sistema se cuelga a mitad del proceso.',
    prioridad: 'urgente',
    estado: 'abierto',
    respuesta: null,
    fechaRespuesta: null,
    createdAt: '2026-03-01T07:00:00',
    updatedAt: '2026-03-01T07:00:00',
  },
  {
    id: 5,
    tenantId: 1,
    tenantNombre: 'Boutique Fashion María',
    usuarioPlataformaId: 11,
    atendidoPor: 'soporte@newhype.pe',
    asunto: 'Solicitud de factura de febrero',
    descripcion: 'Necesito la factura electrónica de mi pago de febrero.',
    prioridad: 'baja',
    estado: 'cerrado',
    respuesta: 'Factura enviada al correo registrado.',
    fechaRespuesta: '2026-02-20T11:00:00',
    createdAt: '2026-02-19T15:30:00',
    updatedAt: '2026-02-20T11:00:00',
  },
];

// ── 2.1 LISTAR TICKETS ─────────────────────────────────────────────────────
export async function fetchTickets(_filters?: TicketFilters): Promise<ApiResponse<Ticket[]>> {
  await simulateDelay();
  return {
    success: true,
    message: 'Tickets listados correctamente',
    data: MOCK_TICKETS,
    pagination: { page: 0, size: 20, totalElements: MOCK_TICKETS.length, totalPages: 1 },
  };
}

// ── 2.2 DETALLE DE TICKET ──────────────────────────────────────────────────
export async function fetchTicketById(id: number): Promise<ApiResponse<Ticket>> {
  await simulateDelay();
  const ticket = MOCK_TICKETS.find(t => t.id === id) ?? MOCK_TICKETS[0];
  return { success: true, message: 'OK', data: ticket };
}

// ── 2.3 RESPONDER/CAMBIAR ESTADO/PRIORIDAD ─────────────────────────────────
export async function actualizarTicket(_id: number, _payload: TicketUpdatePayload): Promise<ApiResponse<Ticket>> {
  await simulateDelay();
  return { success: true, message: 'Ticket actualizado', data: MOCK_TICKETS[0] };
}
