// ============================================================================
// TICKETS SERVICE — Endpoints 2.1, 2.2, 2.3
// Backend: /platform/tickets
// ============================================================================

import { apiFetch, buildQuery } from '../../../services/apiConfig';
import type { Ticket, TicketFilters, TicketUpdatePayload } from '../../../types/api';

// Respuesta paginada del backend
interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── 2.1 LISTAR TICKETS ─────────────────────────────────────────────────────
export async function fetchTickets(filters?: TicketFilters): Promise<PagedResponse<Ticket>> {
  const query = buildQuery({
    estado: filters?.estado,
    prioridad: filters?.prioridad,
    tenantId: filters?.tenantId,
    page: filters?.page,
    size: filters?.size,
  });
  return apiFetch<PagedResponse<Ticket>>(`/tickets${query}`);
}

// ── 2.2 DETALLE DE TICKET ──────────────────────────────────────────────────
export async function fetchTicketById(id: number): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}`);
}

// ── 2.3 RESPONDER/CAMBIAR ESTADO/PRIORIDAD ─────────────────────────────────
export async function actualizarTicket(id: number, payload: TicketUpdatePayload): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
