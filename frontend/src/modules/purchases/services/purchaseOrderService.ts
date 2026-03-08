/**
 * SERVICIO: Órdenes de Compra (Purchase Orders)
 * Maneja todas las operaciones CRUD relacionadas con órdenes de compra
 * Incluye mapeo bidireccional backend ↔ frontend
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  PurchaseOrder,
  PurchaseOrderItem,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  UpdatePurchaseOrderStatusDto,
  FilterPurchaseOrderDto,
  PaginatedResponse,
  ApiResponse,
  PurchaseOrderStatistics,
} from '../types/purchases.types';

const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// ==================== MAPEO BACKEND → FRONTEND ====================

/**
 * Mapea un detalle de OC del backend al formato del frontend
 */
function mapBackendItem(item: any): PurchaseOrderItem {
  const cantidadOrdenada = item.cantidadOrdenada || 0;
  const cantidadRecibida = item.cantidadRecibida || 0;
  return {
    id: String(item.id),
    productoId: String(item.productoId),
    producto: item.productoNombre ? {
      id: String(item.productoId),
      codigo: '',
      nombre: item.productoNombre,
      unidadMedida: item.unidadMedida,
    } : undefined,
    cantidadOrdenada,
    cantidadRecibida,
    cantidadAceptada: item.cantidadAceptada || 0,
    cantidadRechazada: item.cantidadRechazada || 0,
    cantidadPendiente: Math.max(0, cantidadOrdenada - cantidadRecibida),
    precioUnitario: Number(item.precioUnitario) || 0,
    descuento: Number(item.descuento) || 0,
    subtotal: Number(item.subtotal) || 0,
    cantidad: cantidadOrdenada,
    observaciones: item.observaciones,
  };
}

/**
 * Mapea una Orden de Compra del backend al formato del frontend
 */
function mapBackendOrder(data: any): PurchaseOrder {
  return {
    id: String(data.id),
    codigo: data.codigo,
    proveedorId: String(data.proveedorId),
    proveedor: data.proveedorNombre ? {
      id: String(data.proveedorId),
      razonSocial: data.proveedorNombre,
      numeroDocumento: '',
      tipoDocumento: '',
    } : undefined,
    almacenDestinoId: String(data.almacenDestinoId),
    almacenDestino: data.almacenDestinoNombre ? {
      id: String(data.almacenDestinoId),
      nombre: data.almacenDestinoNombre,
      codigo: '',
    } : undefined,
    solicitadoPorId: String(data.usuarioId || ''),
    fecha: data.fechaEmision || data.createdAt,
    fechaEmision: data.fechaEmision,
    fechaEntregaEsperada: data.fechaEntregaEstimada,
    estado: data.estado,
    condicionesPago: data.condicionesPago,
    formaPago: data.formaPago,
    moneda: data.moneda,
    observaciones: data.observaciones,
    subtotal: Number(data.subtotal) || 0,
    descuento: Number(data.descuento) || 0,
    igv: Number(data.igv) || 0,
    total: Number(data.total) || 0,
    items: (data.detalles || []).map(mapBackendItem),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt || data.createdAt,
  } as PurchaseOrder;
}

/**
 * Mapea un request de creación del frontend al formato del backend
 */
function mapCreateRequest(data: CreatePurchaseOrderDto): any {
  return {
    proveedorId: Number(data.proveedorId),
    almacenDestinoId: Number(data.almacenDestinoId),
    fechaEntregaEstimada: data.fechaEntregaEsperada || undefined,
    condicionesPago: data.condicionesPago,
    formaPago: data.formaPago,
    observaciones: data.observaciones,
    items: (data.items || []).map(item => ({
      productoId: Number(item.productoId),
      cantidadOrdenada: item.cantidadOrdenada || item.cantidad || 1,
      precioUnitario: item.precioUnitario || 0,
      descuento: item.descuento || 0,
      observaciones: item.observaciones || item.especificaciones,
    })),
  };
}

/**
 * Mapea un request de actualización del frontend al formato del backend
 */
function mapUpdateRequest(data: UpdatePurchaseOrderDto): any {
  return {
    proveedorId: data.proveedorId ? Number(data.proveedorId) : undefined,
    almacenDestinoId: data.almacenDestinoId ? Number(data.almacenDestinoId) : undefined,
    fechaEntregaEstimada: data.fechaEntregaEsperada || undefined,
    condicionesPago: data.condicionesPago,
    formaPago: data.formaPago,
    observaciones: data.observaciones,
    items: data.items ? data.items.map(item => ({
      productoId: Number(item.productoId),
      cantidadOrdenada: item.cantidadOrdenada || item.cantidad || 1,
      precioUnitario: item.precioUnitario || 0,
      descuento: item.descuento || 0,
      observaciones: item.observaciones || item.especificaciones,
    })) : undefined,
  };
}

/**
 * Clase de servicio para gestión de órdenes de compra
 */
class PurchaseOrderService {
  private api: AxiosInstance;
  private baseEndpoint = '/compras/ordenes';

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Interceptor para agregar token de autenticación
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejo de errores globales
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('alexatech_token');
          localStorage.removeItem('alexatech_refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtener listado de órdenes de compra con filtros y paginación
   */
  async getPurchaseOrders(
    filters?: FilterPurchaseOrderDto
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    try {
      const params = new URLSearchParams();

      // Backend uses 0-based pages, frontend 1-based
      if (filters?.page) params.append('page', String(Math.max(0, filters.page - 1)));
      if (filters?.limit) params.append('size', filters.limit.toString());
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.proveedorId) params.append('proveedorId', filters.proveedorId);
      if (filters?.search) params.append('search', filters.search);

      const response = await this.api.get(`${this.baseEndpoint}?${params.toString()}`);
      const raw = response.data;

      // Map backend paginated response
      const data = (raw.data || []).map(mapBackendOrder);
      const pagination = raw.pagination || {};

      return {
        success: true,
        data,
        pagination: {
          total: pagination.totalElements || data.length,
          page: (pagination.page || 0) + 1, // Convert 0-based → 1-based
          limit: pagination.size || filters?.limit || 20,
          totalPages: pagination.totalPages || 1,
        },
      };
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener una orden de compra por ID
   */
  async getPurchaseOrderById(id: string): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const response = await this.api.get(`${this.baseEndpoint}/${id}`);
      const raw = response.data;

      return {
        success: true,
        data: mapBackendOrder(raw.data),
        message: raw.message,
      };
    } catch (error: any) {
      console.error(`Error fetching purchase order ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear nueva orden de compra
   */
  async createPurchaseOrder(
    data: CreatePurchaseOrderDto
  ): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const backendData = mapCreateRequest(data);
      const response = await this.api.post(this.baseEndpoint, backendData);
      const raw = response.data;

      return {
        success: true,
        data: mapBackendOrder(raw.data),
        message: raw.message,
      };
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar orden de compra existente
   */
  async updatePurchaseOrder(
    id: string,
    data: UpdatePurchaseOrderDto
  ): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const backendData = mapUpdateRequest(data);
      const response = await this.api.put(`${this.baseEndpoint}/${id}`, backendData);
      const raw = response.data;

      return {
        success: true,
        data: mapBackendOrder(raw.data),
        message: raw.message,
      };
    } catch (error: any) {
      console.error(`Error updating purchase order ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar estado de orden de compra
   */
  async updatePurchaseOrderStatus(
    id: string,
    data: UpdatePurchaseOrderStatusDto
  ): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const response = await this.api.patch(
        `${this.baseEndpoint}/${id}/estado`,
        { estado: data.estado }
      );
      const raw = response.data;

      return {
        success: true,
        data: mapBackendOrder(raw.data),
        message: raw.message,
      };
    } catch (error: any) {
      console.error(`Error updating purchase order status ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar orden de compra (soft delete → CANCELADA)
   */
  async deletePurchaseOrder(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.delete(`${this.baseEndpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting purchase order ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener estadísticas de órdenes de compra
   */
  async getPurchaseOrderStatistics(): Promise<ApiResponse<PurchaseOrderStatistics>> {
    try {
      const response = await this.api.get(`${this.baseEndpoint}/../estadisticas`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching purchase order statistics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar orden de compra (HTML)
   */
  async exportToPDF(id: string): Promise<Blob> {
    try {
      const response = await this.api.get(`${this.baseEndpoint}/${id}/pdf`, {
        responseType: 'blob',
      });

      return new Blob([response.data], { type: 'text/html' });
    } catch (error: any) {
      console.error(`Error exporting purchase order ${id} to PDF:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Descargar el documento generado
   */
  async downloadPDF(id: string, filename?: string): Promise<void> {
    try {
      const blob = await this.exportToPDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `orden-compra-${id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(`Error downloading purchase order PDF ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'Error en la operación';
      return new Error(`${message} (Status: ${error.response.status})`);
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      return new Error(error.message || 'Error desconocido');
    }
  }
}

// Exportar instancia única (singleton)
export const purchaseOrderService = new PurchaseOrderService();

// Exportar clase para testing
export default PurchaseOrderService;
