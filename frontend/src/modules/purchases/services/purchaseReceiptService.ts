/**
 * SERVICIO: Recepciones de Compra (Purchase Receipts)
 * Maneja todas las operaciones relacionadas con recepciones de órdenes de compra
 * Incluye mapeo bidireccional backend ↔ frontend
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  PurchaseReceipt,
  PurchaseReceiptItem,
  CreatePurchaseReceiptDto,
  ConfirmReceiptDto,
  FilterPurchaseReceiptDto,
  PaginatedResponse,
  ApiResponse,
  PurchaseReceiptStatus,
} from '../types/purchases.types';

const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// ==================== MAPEO BACKEND → FRONTEND ====================

function mapBackendReceiptItem(item: any): PurchaseReceiptItem {
  return {
    id: String(item.id),
    productoId: String(item.productoId),
    producto: item.productoNombre ? {
      id: String(item.productoId),
      codigo: '',
      nombre: item.productoNombre,
    } : undefined,
    ordenCompraItemId: String(item.detalleOrdenCompraId || ''),
    ordenCompraItem: item.cantidadOrdenada != null ? {
      cantidadOrdenada: item.cantidadOrdenada,
      cantidadRecibida: item.cantidadRecibidaOC || 0,
      cantidadPendiente: item.cantidadPendiente || 0,
    } : undefined,
    cantidadRecibida: item.cantidadRecibida || 0,
    cantidadAceptada: item.cantidadAceptada || 0,
    cantidadRechazada: item.cantidadRechazada || 0,
    observaciones: item.observaciones,
  };
}

function mapBackendReceipt(data: any): PurchaseReceipt {
  return {
    id: String(data.id),
    codigo: data.codigo,
    ordenCompraId: String(data.ordenCompraId),
    ordenCompra: data.ordenCompraCodigo ? {
      codigo: data.ordenCompraCodigo,
      estado: data.ordenCompraEstado || undefined,
      proveedor: data.proveedorNombre ? {
        razonSocial: data.proveedorNombre,
      } : undefined,
    } as any : undefined,
    almacenId: String(data.almacenId || ''),
    almacen: data.almacenNombre ? {
      id: String(data.almacenId),
      codigo: '',
      nombre: data.almacenNombre,
    } : undefined,
    fechaRecepcion: data.fechaRecepcion,
    fecha: data.fechaRecepcion,
    estado: data.estado as PurchaseReceiptStatus,
    observaciones: data.observaciones,
    recibidoPorId: String(data.recibidoPorId || ''),
    guiaRemision: data.guiaRemision,
    esRecepcionCompleta: data.esRecepcionCompleta,
    cantidadItems: data.cantidadItems || 0,
    items: (data.detalles || []).map(mapBackendReceiptItem),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt || data.createdAt,
  } as PurchaseReceipt;
}

/**
 * Mapea request de creación de recepción al formato del backend
 */
function mapCreateReceiptRequest(data: CreatePurchaseReceiptDto): any {
  return {
    ordenCompraId: Number(data.ordenCompraId),
    guiaRemision: data.guiaRemision || undefined,
    observaciones: data.observaciones || undefined,
    items: (data.items || []).map(item => ({
      detalleOrdenCompraId: Number(item.ordenCompraItemId),
      productoId: Number(item.productoId),
      cantidadRecibida: item.cantidadRecibida,
      cantidadAceptada: item.cantidadAceptada,
      cantidadRechazada: item.cantidadRechazada || 0,
      motivoRechazo: item.motivoRechazo || undefined,
      observaciones: item.observaciones || undefined,
    })),
  };
}

/**
 * Clase de servicio para gestión de recepciones de compra
 */
class PurchaseReceiptService {
  private api: AxiosInstance;
  private baseEndpoint = '/compras/recepciones';

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
   * Obtener listado de recepciones con filtros y paginación
   */
  async getPurchaseReceipts(
    filters?: FilterPurchaseReceiptDto
  ): Promise<PaginatedResponse<PurchaseReceipt>> {
    try {
      const params = new URLSearchParams();

      if (filters?.page) params.append('page', String(Math.max(0, filters.page - 1)));
      if (filters?.limit) params.append('size', filters.limit.toString());
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.ordenCompraId) params.append('ordenCompraId', filters.ordenCompraId);

      const response = await this.api.get(`${this.baseEndpoint}?${params.toString()}`);
      const raw = response.data;

      const data = (raw.data || []).map(mapBackendReceipt);
      const pagination = raw.pagination || {};

      return {
        success: true,
        data,
        pagination: {
          total: pagination.totalElements || data.length,
          page: (pagination.page || 0) + 1,
          limit: pagination.size || filters?.limit || 20,
          totalPages: pagination.totalPages || 1,
        },
      };
    } catch (error: any) {
      console.error('Error fetching purchase receipts:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener una recepción por ID
   */
  async getPurchaseReceiptById(id: string): Promise<ApiResponse<PurchaseReceipt>> {
    try {
      const response = await this.api.get(`${this.baseEndpoint}/${id}`);
      const raw = response.data;

      return {
        success: true,
        data: mapBackendReceipt(raw.data),
        message: raw.message,
      };
    } catch (error: any) {
      console.error(`Error fetching purchase receipt ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear nueva recepción de compra
   */
  async createPurchaseReceipt(
    data: CreatePurchaseReceiptDto
  ): Promise<ApiResponse<PurchaseReceipt>> {
    try {
      const backendData = mapCreateReceiptRequest(data);
      const response = await this.api.post(this.baseEndpoint, backendData);
      const raw = response.data;

      return {
        success: true,
        data: mapBackendReceipt(raw.data),
        message: raw.message,
      };
    } catch (error: any) {
      console.error('Error creating purchase receipt:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Confirmar recepción (actualiza inventario: stock + kardex)
   */
  async confirmPurchaseReceipt(
    id: string,
    _data?: ConfirmReceiptDto
  ): Promise<ApiResponse<PurchaseReceipt>> {
    try {
      const response = await this.api.patch(`${this.baseEndpoint}/${id}/confirmar`);
      const raw = response.data;

      return {
        success: true,
        data: mapBackendReceipt(raw.data),
        message: raw.message,
      };
    } catch (error: any) {
      console.error(`Error confirming purchase receipt ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Anular recepción (solo PENDIENTE)
   */
  async cancelPurchaseReceipt(
    id: string,
    motivo?: string
  ): Promise<ApiResponse<PurchaseReceipt>> {
    try {
      const response = await this.api.patch(
        `${this.baseEndpoint}/${id}/anular`,
        { motivo }
      );
      const raw = response.data;

      return {
        success: true,
        data: mapBackendReceipt(raw.data),
        message: raw.message,
      };
    } catch (error: any) {
      console.error(`Error canceling purchase receipt ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener recepciones pendientes de una orden de compra
   */
  async getPendingReceiptsByOrderId(
    ordenCompraId: string
  ): Promise<PaginatedResponse<PurchaseReceipt>> {
    try {
      return await this.getPurchaseReceipts({
        ordenCompraId,
        estado: 'PENDIENTE' as PurchaseReceiptStatus,
        limit: 100,
      });
    } catch (error: any) {
      console.error(`Error fetching pending receipts for order ${ordenCompraId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar recepción de compra como documento HTML
   */
  async exportToPDF(id: string): Promise<Blob> {
    try {
      const response = await this.api.get(`${this.baseEndpoint}/${id}/pdf`, {
        responseType: 'blob',
      });

      return new Blob([response.data], { type: 'text/html' });
    } catch (error: any) {
      console.error(`Error exporting purchase receipt ${id} to PDF:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Descargar documento de recepción de compra
   */
  async downloadPDF(id: string, filename?: string): Promise<void> {
    try {
      const blob = await this.exportToPDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `recepcion-compra-${id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(`Error downloading purchase receipt PDF ${id}:`, error);
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
export const purchaseReceiptService = new PurchaseReceiptService();

// Exportar clase para testing
export default PurchaseReceiptService;
