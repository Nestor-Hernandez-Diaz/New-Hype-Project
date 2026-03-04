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

class MovementReasonsApiService {
  // Obtener todos los motivos
  async getMovementReasons(filters?: {
    tipo?: string;
    activo?: boolean;
  }): Promise<MovementReason[]> {
    const params = new URLSearchParams();

    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.activo !== undefined)
      params.append('activo', String(filters.activo));

    const queryString = params.toString();
    const url = `/configuracion/motivos-movimiento${queryString ? `?${queryString}` : ''}`;
    const response = await apiService.get<MovementReason[]>(url);

    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'rows' in data) return (data as any).rows || [];
    return [];
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

  // Eliminar motivo
  async deleteMovementReason(id: string): Promise<void> {
    await apiService.delete(`/configuracion/motivos-movimiento/${id}`);
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
