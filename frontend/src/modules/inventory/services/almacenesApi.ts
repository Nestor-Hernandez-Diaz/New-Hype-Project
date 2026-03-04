import { apiService } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

export interface Almacen {
  id: string;
  codigo: string;
  nombre: string;
  ubicacion: string | null;
  capacidad: number | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    stockByWarehouses: number;
    inventoryMovements: number;
  };
}

export interface AlmacenFormData {
  codigo: string;
  nombre: string;
  ubicacion?: string;
  capacidad?: number;
}

class AlmacenesApiService {
  /**
   * Obtener todos los almacenes
   * GET /almacenes
   */
  async getAlmacenes(params?: { activo?: boolean; q?: string }): Promise<Almacen[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.activo !== undefined) queryParams.append('activo', String(params.activo));
      if (params?.q) queryParams.append('q', params.q);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/almacenes?${queryString}` : '/almacenes';
      const response: ApiResponse<Almacen[]> = await apiService.get(endpoint);

      // Backend puede retornar data como array directo o con wrapper
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Compatibilidad con formato {rows: [...]}
      if (response.data && (response.data as any).rows) {
        return (response.data as any).rows;
      }
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching almacenes:', error);
      throw new Error(error.message || 'Error al cargar almacenes');
    }
  }

  /**
   * Obtener un almacén por ID
   * GET /almacenes/:id
   */
  async getAlmacenById(id: string): Promise<Almacen> {
    try {
      const response: ApiResponse<Almacen> = await apiService.get(`/almacenes/${id}`);
      return response.data as Almacen;
    } catch (error: any) {
      console.error('Error fetching almacén:', error);
      throw new Error(error.message || 'Error al cargar almacén');
    }
  }

  /**
   * Crear un nuevo almacén
   * POST /almacenes
   */
  async createAlmacen(data: AlmacenFormData): Promise<Almacen> {
    try {
      const response: ApiResponse<Almacen> = await apiService.post('/almacenes', data);
      return response.data as Almacen;
    } catch (error: any) {
      console.error('Error creating almacén:', error);
      throw new Error(error.message || 'Error al crear almacén');
    }
  }

  /**
   * Actualizar un almacén
   * PUT /almacenes/:id
   */
  async updateAlmacen(id: string, data: Partial<AlmacenFormData> & { activo?: boolean }): Promise<Almacen> {
    try {
      const response: ApiResponse<Almacen> = await apiService.put(`/almacenes/${id}`, data);
      return response.data as Almacen;
    } catch (error: any) {
      console.error('Error updating almacén:', error);
      throw new Error(error.message || 'Error al actualizar almacén');
    }
  }

  /**
   * Cambiar estado de un almacén (activar/desactivar)
   * PATCH /almacenes/:id/estado
   */
  async toggleAlmacenEstado(id: string): Promise<void> {
    try {
      await apiService.patch(`/almacenes/${id}/estado`);
    } catch (error: any) {
      console.error('Error toggling almacén estado:', error);
      throw new Error(error.message || 'Error al cambiar estado del almacén');
    }
  }

  /**
   * Desactivar un almacén (alias para compatibilidad)
   */
  async deleteAlmacen(id: string): Promise<void> {
    return this.toggleAlmacenEstado(id);
  }

  /**
   * Activar un almacén (alias para compatibilidad)
   */
  async activateAlmacen(id: string): Promise<void> {
    return this.toggleAlmacenEstado(id);
  }
}

// Instancia singleton
export const almacenesApi = new AlmacenesApiService();

export default AlmacenesApiService;
