import { apiService } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Ticket {
  id: number;
  tenantId: number;
  tenantNombre?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  usuarioPlataformaId?: number;
  atendidoPor?: string;
  asunto: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  respuesta?: string;
  fechaRespuesta?: string;
  createdAt: string;
  updatedAt: string;
  respuestas?: RespuestaTicket[];
}

export interface RespuestaTicket {
  id: number;
  ticketId: number;
  autorTipo: 'TENANT' | 'PLATFORM';
  autorId: number;
  autorNombre?: string;
  mensaje: string;
  createdAt: string;
}

export interface CrearTicketData {
  asunto: string;
  descripcion: string;
  prioridad?: string;
}

// ============================================================================
// API SERVICE
// ============================================================================

class SoporteApiService {

  /**
   * POST /api/v1/soporte/tickets - Crear nuevo ticket
   */
  async crearTicket(data: CrearTicketData): Promise<Ticket> {
    const response: ApiResponse<Ticket> = await apiService.post('/soporte/tickets', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al crear ticket');
    }
    return response.data;
  }

  /**
   * GET /api/v1/soporte/tickets - Listar mis tickets (paginado)
   */
  async listarTickets(page: number = 0, size: number = 20): Promise<{
    tickets: Ticket[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const response: ApiResponse<any> = await apiService.get(
      `/soporte/tickets?page=${page}&size=${size}`
    );

    if (!response.success || !response.data) {
      return { tickets: [], totalElements: 0, totalPages: 0, currentPage: 0 };
    }

    const data = response.data;

    // The backend returns a Spring Page<TicketResponse> wrapped in ApiResponse
    if (data.content) {
      return {
        tickets: data.content,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.number || 0,
      };
    }

    // Fallback: if it's already a list
    if (Array.isArray(data)) {
      return { tickets: data, totalElements: data.length, totalPages: 1, currentPage: 0 };
    }

    return { tickets: [], totalElements: 0, totalPages: 0, currentPage: 0 };
  }

  /**
   * GET /api/v1/soporte/tickets/{id} - Detalle con conversación
   */
  async obtenerTicket(id: number): Promise<Ticket> {
    const response: ApiResponse<Ticket> = await apiService.get(`/soporte/tickets/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al obtener ticket');
    }
    return response.data;
  }

  /**
   * POST /api/v1/soporte/tickets/{id}/respuestas - Enviar respuesta
   */
  async responderTicket(ticketId: number, mensaje: string): Promise<RespuestaTicket> {
    const response: ApiResponse<RespuestaTicket> = await apiService.post(
      `/soporte/tickets/${ticketId}/respuestas`,
      { mensaje }
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al enviar respuesta');
    }
    return response.data;
  }
}

export const soporteApi = new SoporteApiService();
