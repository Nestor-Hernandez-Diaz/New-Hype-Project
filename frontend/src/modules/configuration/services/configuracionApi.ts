import { apiService } from '../../../utils/api';
import type {
  ProductCategory,
  CategoryInput,
  UnitOfMeasure,
  UnitInput
} from '../types/configuracion';

export interface EmpresaData {
  id?: string;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  telefono: string;
  email: string;
  website?: string;
  logo?: string;
  igvActivo: boolean;
  igvPorcentaje: number;
  moneda: string;
  pais: string;
  departamento: string;
  provincia: string;
  distrito: string;
  codigoPostal?: string;
  sunatUsuario?: string;
  sunatClave?: string;
  sunatServidor: 'produccion' | 'homologacion';
  createdAt?: string;
  updatedAt?: string;
}

export interface ComprobanteData {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'factura' | 'boleta' | 'nota-credito' | 'nota-debito';
  serie: string;
  numeroActual: number;
  numeroInicio: number;
  numeroFin: number;
  activo: boolean;
  predeterminado: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MetodoPagoData {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'efectivo' | 'tarjeta' | 'transferencia' | 'yape' | 'plin' | 'otro';
  activo: boolean;
  predeterminado: boolean;
  requiereReferencia: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const configuracionApi = {
  // Empresa
  getEmpresa: async (): Promise<EmpresaData> => {
    const response = await apiService.get<EmpresaData>('/configuracion/empresa');
    return (response as any).data ?? (response as any);
  },

  updateEmpresa: async (data: Partial<EmpresaData>): Promise<EmpresaData> => {
    const response = await apiService.request<EmpresaData>('/configuracion/empresa', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (response as any).data ?? (response as any);
  },

  // Comprobantes
  getComprobantes: async (): Promise<ComprobanteData[]> => {
    const response = await apiService.get<ComprobanteData[]>('/configuracion/comprobantes');
    const result = (response as any).data ?? (response as any);
    return Array.isArray(result) ? result : [];
  },

  createComprobante: async (data: ComprobanteData): Promise<ComprobanteData> => {
    const response = await apiService.request<ComprobanteData>('/configuracion/comprobantes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (response as any).data ?? (response as any);
  },

  updateComprobante: async (id: string, data: Partial<ComprobanteData>): Promise<ComprobanteData> => {
    const response = await apiService.request<ComprobanteData>(`/configuracion/comprobantes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (response as any).data ?? (response as any);
  },

  deleteComprobante: async (id: string): Promise<void> => {
    await apiService.request(`/configuracion/comprobantes/${id}`, { method: 'DELETE' });
  },

  // Métodos de Pago
  getMetodosPago: async (): Promise<MetodoPagoData[]> => {
    const response = await apiService.get<MetodoPagoData[]>('/configuracion/metodos-pago');
    const result = (response as any).data ?? (response as any);
    return Array.isArray(result) ? result : [];
  },

  createMetodoPago: async (data: MetodoPagoData): Promise<MetodoPagoData> => {
    const response = await apiService.request<MetodoPagoData>('/configuracion/metodos-pago', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (response as any).data ?? (response as any);
  },

  updateMetodoPago: async (id: string, data: Partial<MetodoPagoData>): Promise<MetodoPagoData> => {
    const response = await apiService.request<MetodoPagoData>(`/configuracion/metodos-pago/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (response as any).data ?? (response as any);
  },

  deleteMetodoPago: async (id: string): Promise<void> => {
    await apiService.request(`/configuracion/metodos-pago/${id}`, { method: 'DELETE' });
  },

  // Categorías
  getAllCategories: async (filters?: { activo?: boolean; q?: string }): Promise<ProductCategory[]> => {
    const params = new URLSearchParams();
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters?.q) params.append('q', filters.q);
    const url = `/configuracion/categorias${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<{ success: boolean; data: ProductCategory[] }>(url);
    return (response as any).data?.data || (response as any).data || [];
  },

  getActiveCategories: async (): Promise<ProductCategory[]> => {
    return configuracionApi.getAllCategories({ activo: true });
  },

  getCategoryById: async (id: string): Promise<ProductCategory> => {
    const response = await apiService.get<{ success: boolean; data: ProductCategory }>(`/configuracion/categorias/${id}`);
    return (response as any).data?.data || (response as any).data;
  },

  createCategory: async (data: CategoryInput): Promise<ProductCategory> => {
    const response = await apiService.request<{ success: boolean; data: ProductCategory }>('/configuracion/categorias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (response as any).data?.data || (response as any).data;
  },

  updateCategory: async (id: string, data: Partial<CategoryInput>): Promise<ProductCategory> => {
    const response = await apiService.request<{ success: boolean; data: ProductCategory }>(`/configuracion/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (response as any).data?.data || (response as any).data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiService.request(`/configuracion/categorias/${id}`, { method: 'DELETE' });
  },

  hardDeleteCategory: async (id: string): Promise<void> => {
    await apiService.request(`/configuracion/categorias/${id}/hard`, { method: 'DELETE' });
  },

  // Unidades de Medida
  getAllUnits: async (filters?: { activo?: boolean; q?: string }): Promise<UnitOfMeasure[]> => {
    const params = new URLSearchParams();
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters?.q) params.append('q', filters.q);
    const url = `/configuracion/unidades${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<{ success: boolean; data: UnitOfMeasure[] }>(url);
    return (response as any).data?.data || (response as any).data || [];
  },

  getActiveUnits: async (): Promise<UnitOfMeasure[]> => {
    return configuracionApi.getAllUnits({ activo: true });
  },

  getUnitById: async (id: string): Promise<UnitOfMeasure> => {
    const response = await apiService.get<{ success: boolean; data: UnitOfMeasure }>(`/configuracion/unidades/${id}`);
    return (response as any).data?.data || (response as any).data;
  },

  createUnit: async (data: UnitInput): Promise<UnitOfMeasure> => {
    const response = await apiService.request<{ success: boolean; data: UnitOfMeasure }>('/configuracion/unidades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (response as any).data?.data || (response as any).data;
  },

  updateUnit: async (id: string, data: Partial<UnitInput>): Promise<UnitOfMeasure> => {
    const response = await apiService.request<{ success: boolean; data: UnitOfMeasure }>(`/configuracion/unidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (response as any).data?.data || (response as any).data;
  },

  deleteUnit: async (id: string): Promise<void> => {
    await apiService.request(`/configuracion/unidades/${id}`, { method: 'DELETE' });
  },

  hardDeleteUnit: async (id: string): Promise<void> => {
    await apiService.request(`/configuracion/unidades/${id}/hard`, { method: 'DELETE' });
  },
};

export default configuracionApi;