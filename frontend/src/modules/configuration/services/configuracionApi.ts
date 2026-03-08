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
  // Return policy fields
  diasDevolucionBoleta?: number;
  diasDevolucionFactura?: number;
  diasVigenciaVale?: number;
  requiereEtiquetasOriginales?: boolean;
  requiereProductoSinUso?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComprobanteData {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'factura' | 'boleta' | 'nota-credito' | 'nota-debito' | 'orden-compra' | 'recepcion-compra';
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

/** Generic catalog item returned by /configuracion/{tallas,colores,marcas,materiales,generos} */
export interface CatalogItem {
  id: number;
  codigo: string;
  nombre?: string;
  descripcion?: string;
  codigoHex?: string;
  logoUrl?: string;
  ordenVisualizacion?: number;
  estado: boolean;
  createdAt?: string;
}

/** Generic catalog input for POST/PUT */
export interface CatalogInput {
  codigo: string;
  nombre?: string;
  descripcion?: string;
  codigoHex?: string;
  logoUrl?: string;
  ordenVisualizacion?: number;
}

// =========== Mappers: backend 'estado' → frontend 'activo' ===========

function mapBackendCategory(raw: any): ProductCategory {
  return {
    ...raw,
    activo: raw.activo ?? raw.estado ?? true,
  };
}

function mapBackendUnit(raw: any): UnitOfMeasure {
  return {
    ...raw,
    activo: raw.activo ?? raw.estado ?? true,
  };
}

function mapBackendComprobante(raw: any): ComprobanteData {
  return {
    id: String(raw.id),
    codigo: raw.codigo || raw.serie || '',
    nombre: raw.nombre || `${raw.tipoComprobante || ''} ${raw.serie || ''}`.trim(),
    descripcion: raw.descripcion || '',
    tipo: mapTipoComprobante(raw.tipoComprobante),
    serie: raw.serie || '',
    numeroActual: raw.numeroActual ?? 0,
    numeroInicio: raw.numeroInicio ?? 1,
    numeroFin: raw.numeroFin ?? 99999999,
    activo: raw.activo ?? raw.estado ?? true,
    predeterminado: raw.predeterminado ?? false,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function mapTipoComprobante(tipo: string): ComprobanteData['tipo'] {
  const map: Record<string, ComprobanteData['tipo']> = {
    'BOLETA': 'boleta',
    'FACTURA': 'factura',
    'NOTA_CREDITO': 'nota-credito',
    'NOTA_DEBITO': 'nota-debito',
    'GUIA_REMISION': 'orden-compra',
  };
  return map[tipo] || (tipo?.toLowerCase().replace(/_/g, '-') as ComprobanteData['tipo']) || 'boleta';
}

function mapBackendMetodoPago(raw: any): MetodoPagoData {
  return {
    id: String(raw.id),
    codigo: raw.codigo || '',
    nombre: raw.nombre || '',
    descripcion: raw.descripcion || '',
    tipo: raw.tipo?.toLowerCase() as MetodoPagoData['tipo'] || 'otro',
    activo: raw.activo ?? raw.estado ?? true,
    predeterminado: raw.predeterminado ?? false,
    requiereReferencia: raw.requiereReferencia ?? false,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

const configuracionApi = {
  // Empresa
  getEmpresa: async (): Promise<EmpresaData> => {
    const response = await apiService.get<EmpresaData>('/configuracion/empresa');
    return response.data as EmpresaData;
  },

  updateEmpresa: async (data: Partial<EmpresaData>): Promise<EmpresaData> => {
    const response = await apiService.put<EmpresaData>('/configuracion/empresa', data);
    return response.data as EmpresaData;
  },

  // Series de Comprobantes (SUNAT)
  getComprobantes: async (): Promise<ComprobanteData[]> => {
    const response = await apiService.get<any[]>('/configuracion/series-comprobantes');
    const rawList = Array.isArray(response.data) ? response.data : [];
    return rawList.map(mapBackendComprobante);
  },

  createComprobante: async (data: ComprobanteData): Promise<ComprobanteData> => {
    const response = await apiService.post<ComprobanteData>('/configuracion/series-comprobantes', data);
    return response.data as ComprobanteData;
  },

  updateComprobante: async (id: string, data: Partial<ComprobanteData>): Promise<ComprobanteData> => {
    const response = await apiService.put<ComprobanteData>(`/configuracion/series-comprobantes/${id}`, data);
    return response.data as ComprobanteData;
  },

  toggleComprobanteEstado: async (id: string): Promise<void> => {
    await apiService.patch(`/configuracion/series-comprobantes/${id}/estado`);
  },

  deleteComprobante: async (id: string): Promise<void> => {
    await apiService.patch(`/configuracion/series-comprobantes/${id}/estado`);
  },

  // Métodos de Pago
  getMetodosPago: async (): Promise<MetodoPagoData[]> => {
    const response = await apiService.get<any[]>('/configuracion/metodos-pago');
    const rawList = Array.isArray(response.data) ? response.data : [];
    return rawList.map(mapBackendMetodoPago);
  },

  createMetodoPago: async (data: MetodoPagoData): Promise<MetodoPagoData> => {
    const response = await apiService.post<MetodoPagoData>('/configuracion/metodos-pago', data);
    return response.data as MetodoPagoData;
  },

  updateMetodoPago: async (id: string, data: Partial<MetodoPagoData>): Promise<MetodoPagoData> => {
    const response = await apiService.put<MetodoPagoData>(`/configuracion/metodos-pago/${id}`, data);
    return response.data as MetodoPagoData;
  },

  toggleMetodoPagoEstado: async (id: string): Promise<void> => {
    await apiService.patch(`/configuracion/metodos-pago/${id}/estado`);
  },

  deleteMetodoPago: async (id: string): Promise<void> => {
    await apiService.patch(`/configuracion/metodos-pago/${id}/estado`);
  },

  // Categorías
  getAllCategories: async (filters?: { activo?: boolean; q?: string }): Promise<ProductCategory[]> => {
    const params = new URLSearchParams();
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters?.q) params.append('q', filters.q);
    const url = `/configuracion/categorias${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<any[]>(url);
    const rawList = Array.isArray(response.data) ? response.data : [];
    return rawList.map(mapBackendCategory);
  },

  getActiveCategories: async (): Promise<ProductCategory[]> => {
    return configuracionApi.getAllCategories({ activo: true });
  },

  getCategoryById: async (id: string): Promise<ProductCategory> => {
    const response = await apiService.get<ProductCategory>(`/configuracion/categorias/${id}`);
    return response.data as ProductCategory;
  },

  createCategory: async (data: CategoryInput): Promise<ProductCategory> => {
    const response = await apiService.post<ProductCategory>('/configuracion/categorias', data);
    return response.data as ProductCategory;
  },

  updateCategory: async (id: string, data: Partial<CategoryInput>): Promise<ProductCategory> => {
    const response = await apiService.put<ProductCategory>(`/configuracion/categorias/${id}`, data);
    return response.data as ProductCategory;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiService.delete(`/configuracion/categorias/${id}`);
  },

  hardDeleteCategory: async (id: string): Promise<void> => {
    await apiService.delete(`/configuracion/categorias/${id}/hard`);
  },

  // Unidades de Medida
  getAllUnits: async (filters?: { activo?: boolean; q?: string }): Promise<UnitOfMeasure[]> => {
    const params = new URLSearchParams();
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters?.q) params.append('q', filters.q);
    const url = `/configuracion/unidades-medida${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<any[]>(url);
    const rawList = Array.isArray(response.data) ? response.data : [];
    return rawList.map(mapBackendUnit);
  },

  getActiveUnits: async (): Promise<UnitOfMeasure[]> => {
    return configuracionApi.getAllUnits({ activo: true });
  },

  getUnitById: async (id: string): Promise<UnitOfMeasure> => {
    const response = await apiService.get<UnitOfMeasure>(`/configuracion/unidades-medida/${id}`);
    return response.data as UnitOfMeasure;
  },

  createUnit: async (data: UnitInput): Promise<UnitOfMeasure> => {
    const response = await apiService.post<UnitOfMeasure>('/configuracion/unidades-medida', data);
    return response.data as UnitOfMeasure;
  },

  updateUnit: async (id: string, data: Partial<UnitInput>): Promise<UnitOfMeasure> => {
    const response = await apiService.put<UnitOfMeasure>(`/configuracion/unidades-medida/${id}`, data);
    return response.data as UnitOfMeasure;
  },

  deleteUnit: async (id: string): Promise<void> => {
    await apiService.delete(`/configuracion/unidades-medida/${id}`);
  },

  hardDeleteUnit: async (id: string): Promise<void> => {
    await apiService.delete(`/configuracion/unidades-medida/${id}/hard`);
  },

  // ========== Generic Catalog CRUD (tallas, colores, marcas, materiales, generos) ==========

  getCatalogItems: async (catalogType: string): Promise<CatalogItem[]> => {
    const response = await apiService.get<CatalogItem[]>(`/configuracion/${catalogType}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  createCatalogItem: async (catalogType: string, data: CatalogInput): Promise<CatalogItem> => {
    const response = await apiService.post<CatalogItem>(`/configuracion/${catalogType}`, data);
    return response.data as CatalogItem;
  },

  updateCatalogItem: async (catalogType: string, id: number, data: CatalogInput): Promise<CatalogItem> => {
    const response = await apiService.put<CatalogItem>(`/configuracion/${catalogType}/${id}`, data);
    return response.data as CatalogItem;
  },

  deleteCatalogItem: async (catalogType: string, id: number): Promise<void> => {
    await apiService.delete(`/configuracion/${catalogType}/${id}`);
  },

  // Convenience methods for each catalog type
  getTallas: async (): Promise<CatalogItem[]> => configuracionApi.getCatalogItems('tallas'),
  getColores: async (): Promise<CatalogItem[]> => configuracionApi.getCatalogItems('colores'),
  getMarcas: async (): Promise<CatalogItem[]> => configuracionApi.getCatalogItems('marcas'),
  getMateriales: async (): Promise<CatalogItem[]> => configuracionApi.getCatalogItems('materiales'),
  getGeneros: async (): Promise<CatalogItem[]> => configuracionApi.getCatalogItems('generos'),

  // ========== Activate/Reactivate methods ==========

  activateCategory: async (id: string): Promise<void> => {
    // Try PATCH estado first; if backend doesn't support it, use PUT with estado:true
    try {
      await apiService.patch(`/configuracion/categorias/${id}/estado`, { estado: true });
    } catch {
      await apiService.put(`/configuracion/categorias/${id}`, { estado: true });
    }
  },

  activateUnit: async (id: string): Promise<void> => {
    try {
      await apiService.patch(`/configuracion/unidades-medida/${id}/estado`, { estado: true });
    } catch {
      await apiService.put(`/configuracion/unidades-medida/${id}`, { estado: true });
    }
  },

  activateCatalogItem: async (catalogType: string, id: number): Promise<void> => {
    try {
      await apiService.patch(`/configuracion/${catalogType}/${id}/estado`, { estado: true });
    } catch {
      await apiService.put(`/configuracion/${catalogType}/${id}`, { estado: true });
    }
  },
};

export default configuracionApi;