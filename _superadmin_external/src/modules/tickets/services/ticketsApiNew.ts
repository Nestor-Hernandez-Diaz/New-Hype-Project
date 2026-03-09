// ============================================================================
// TICKETS SERVICE — Endpoints 2.1, 2.2, 2.3, 2.4
// Backend: /platform/tickets
// ============================================================================

import { apiFetch, buildQuery } from '../../../services/apiConfig';
import type { Ticket, TicketFilters, TicketUpdatePayload } from '../../../types/api';

// ── 2.1 LISTAR TICKETS ─────────────────────────────────────────────────────
// apiFetch desenvuelve ApiResponse.data → devuelve Ticket[] directo
export async function fetchTickets(filters?: TicketFilters): Promise<Ticket[]> {
  const query = buildQuery({
    estado: filters?.estado,
    prioridad: filters?.prioridad,
    tenantId: filters?.tenantId,
    page: filters?.page,
    size: filters?.size,
  });
  return apiFetch<Ticket[]>(`/tickets${query}`);
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

// ── 2.4 AGREGAR RESPUESTA AL HILO ─────────────────────────────────────────
export async function agregarRespuesta(ticketId: number, mensaje: string): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${ticketId}/respuestas`, {
    method: 'POST',
    body: JSON.stringify({ mensaje }),
  });
}
