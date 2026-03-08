import { apiService } from '../../../utils/api';

export interface MovementReason {
  id: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  requiereDocumento: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    inventoryMovements: number;
  };
}

export interface MovementReasonFormData {
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  codigo: string;
  nombre: string;
  descripcion?: string;
  requiereDocumento?: boolean;
}

/** Map backend response (estado) to frontend interface (activo) */
function mapMovementReasonResponse(raw: any): MovementReason {
  return {
    id: String(raw.id),
    tipo: raw.tipo,
    codigo: raw.codigo,
    nombre: raw.nombre,
    descripcion: raw.descripcion || undefined,
    activo: raw.estado ?? raw.activo ?? true,
    requiereDocumento: raw.requiereDocumento ?? false,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    _count: raw._count || undefined,
  };
}

class MovementReasonsApiService {
  // Obtener todos los motivos
  async getMovementReasons(filters?: {
    tipo?: string;
    activo?: boolean;
  }): Promise<MovementReason[]> {
    const params = new URLSearchParams();

    // Backend only supports ?tipo filter, not ?activo
    if (filters?.tipo) params.append('tipo', filters.tipo);

    const queryString = params.toString();
    const url = `/configuracion/motivos-movimiento${queryString ? `?${queryString}` : ''}`;
    const response = await apiService.get<any[]>(url);

    const data = response.data;
    let rawItems: any[] = [];
    if (Array.isArray(data)) rawItems = data;
    else if (data && typeof data === 'object' && 'rows' in data) rawItems = (data as any).rows || [];

    // Map backend fields to frontend interface
    let items = rawItems.map(mapMovementReasonResponse);

    // Client-side filter by activo (backend doesn't support this filter)
    if (filters?.activo !== undefined) {
      items = items.filter(item => item.activo === filters.activo);
    }

    return items;
  }

  // Obtener motivo por ID
  async getMovementReasonById(id: string): Promise<MovementReason> {
    const response = await apiService.get<MovementReason>(`/configuracion/motivos-movimiento/${id}`);
    return response.data as MovementReason;
  }

  // Crear motivo
  async createMovementReason(
    data: MovementReasonFormData,
  ): Promise<MovementReason> {
    const response = await apiService.post<MovementReason>(`/configuracion/motivos-movimiento`, data);
    return response.data as MovementReason;
  }

  // Actualizar motivo
  async updateMovementReason(
    id: string,
    data: Partial<MovementReasonFormData>,
  ): Promise<MovementReason> {
    const response = await apiService.put<MovementReason>(`/configuracion/motivos-movimiento/${id}`, data);
    return response.data as MovementReason;
  }

  // Eliminar (desactivar) motivo - uses toggle endpoint
  async deleteMovementReason(id: string): Promise<void> {
    await this.toggleMovementReason(id);
  }

  // Activar/Desactivar motivo
  async toggleMovementReason(id: string): Promise<MovementReason> {
    const response = await apiService.patch<MovementReason>(
      `/configuracion/motivos-movimiento/${id}/estado`
    );
    return response.data as MovementReason;
  }
}

export const movementReasonsApi = new MovementReasonsApiService();
