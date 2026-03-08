/**
 * ============================================
 * API SERVICE - INVENTARIO
 * Llamadas al backend via apiService.
 * ============================================
 */

import { apiService, toBackendPage, fromBackendPage } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

import type {
  StockItem,
  MovimientoKardex,
  StockFilters,
  KardexFilters,
  StockResponse,
  KardexResponse,
  AjusteData as AjusteInventarioRequest,
} from '../types/inventario';

// AlertasStock is not in the local types file
interface AlertasStock {
  stockBajo: StockItem[];
  stockCritico: StockItem[];
}

// ============= BACKEND TYPES =============

/** Shape of a stock record returned by GET /inventario/stock */
interface BackendStockItem {
  id: number;
  productoId: number;
  productoNombre: string | null;
  productoSku: string | null;
  almacenId: number;
  almacenNombre: string | null;
  cantidad: number;
  stockMinimo: number | null;
  stockBajo: boolean | null;
}

/** Shape of a kardex record returned by GET /inventario/kardex */
interface BackendKardexItem {
  id: number;
  tipo: string;
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  documentoReferencia: string | null;
  almacenId: number;
  usuarioId: number;
  createdAt: string;
}

/** Shape of the nested data object returned by GET /inventario/kardex */
interface BackendKardexData {
  movimientos: BackendKardexItem[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

/** Shape of a product returned by GET /productos/buscar */
interface BackendProductoSearchResult {
  id: number;
  sku: string | null;
  nombre: string;
}

// ============= MAPPING: BACKEND -> FRONTEND =============

/**
 * Derive the frontend EstadoStock enum from backend fields.
 * - cantidad === 0 => CRITICO
 * - stockBajo === true (cantidad <= stockMinimo) => BAJO
 * - otherwise => NORMAL
 */
function deriveEstadoStock(cantidad: number, stockMinimo: number | null, stockBajo: boolean | null): 'NORMAL' | 'BAJO' | 'CRITICO' {
  if (cantidad <= 0) return 'CRITICO';
  if (stockBajo) return 'BAJO';
  return 'NORMAL';
}

function mapBackendStockItem(b: BackendStockItem): StockItem {
  return {
    stockByWarehouseId: String(b.id),
    productId: String(b.productoId),
    codigo: b.productoSku || '',
    nombre: b.productoNombre || '',
    almacen: b.almacenNombre || '',
    warehouseId: String(b.almacenId),
    cantidad: b.cantidad ?? 0,
    stockMinimo: b.stockMinimo ?? null,
    estado: deriveEstadoStock(b.cantidad ?? 0, b.stockMinimo, b.stockBajo),
    updatedAt: new Date().toISOString(),
  };
}

function mapBackendKardexItem(b: BackendKardexItem, filters: KardexFilters): MovimientoKardex {
  return {
    id: String(b.id),
    fecha: b.createdAt,
    // productId comes from the filter since the backend kardex endpoint requires productoId
    productId: filters.productId || '',
    codigo: '',
    nombre: '',
    almacen: '',
    tipo: b.tipo as MovimientoKardex['tipo'],
    cantidad: b.cantidad,
    stockAntes: b.stockAntes,
    stockDespues: b.stockDespues,
    motivo: b.documentoReferencia || '',
    usuario: String(b.usuarioId),
    documentoReferencia: b.documentoReferencia || undefined,
  };
}

// ============= CLIENT-SIDE FILTERING & PAGINATION =============

/**
 * The GET /inventario/stock endpoint does NOT support pagination or text
 * search on the backend — it returns all stock records, optionally filtered
 * by almacenId. We apply the remaining StockFilters on the client side so the
 * context code works unchanged.
 */
function applyClientSideStockFilters(items: StockItem[], filters: StockFilters): StockItem[] {
  let filtered = [...items];

  // Text search (codigo / nombre)
  if (filters.q) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(
      item =>
        item.codigo.toLowerCase().includes(query) ||
        item.nombre.toLowerCase().includes(query),
    );
  }

  // Filter by estado
  if (filters.estado) {
    filtered = filtered.filter(item => item.estado === filters.estado);
  }

  // Sort
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof StockItem];
      const bValue = b[filters.sortBy as keyof StockItem];
      const comparison = aValue! > bValue! ? 1 : aValue! < bValue! ? -1 : 0;
      return filters.order === 'desc' ? -comparison : comparison;
    });
  }

  return filtered;
}

function paginateArray<T>(items: T[], page: number = 1, limit: number = 10): { data: T[]; total: number; pages: number } {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: items.slice(start, end),
    total: items.length,
    pages: Math.ceil(items.length / limit),
  };
}

// ============= EXPORTED API OBJECT =============

/**
 * Real backend API for the Inventory module.
 */
export const inventoryApi = {

  // ----- Stock ------------------------------------------------------------

  /**
   * Fetch stock items.
   * GET /inventario/stock?almacenId
   *
   * Backend returns all items (no server-side pagination), so we filter
   * and paginate on the client.
   */
  async getStock(filters: StockFilters = {}): Promise<StockResponse> {
    const params = new URLSearchParams();

    if (filters.almacenId) {
      params.append('almacenId', filters.almacenId);
    }

    const qs = params.toString();
    const endpoint = qs ? `/inventario/stock?${qs}` : '/inventario/stock';

    const res: ApiResponse<BackendStockItem[]> = await apiService.get(endpoint);

    if (!res.success || !res.data) {
      throw new Error(res.message || res.error || 'Error al cargar el stock');
    }

    // Map backend records to frontend StockItem[]
    const allItems = res.data.map(mapBackendStockItem);

    // Apply client-side search / estado filter / sort
    const filtered = applyClientSideStockFilters(allItems, filters);

    // Paginate
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const paginated = paginateArray(filtered, page, limit);

    return {
      data: paginated.data,
      pagination: {
        total: paginated.total,
        page,
        limit,
        pages: paginated.pages,
      },
    };
  },

  // ----- Kardex -----------------------------------------------------------

  /**
   * Fetch kardex (inventory movements).
   * GET /inventario/kardex?productoId&almacenId&page&size
   *
   * The backend nests the pagination object inside `data` (not at root).
   */
  async getKardex(filters: KardexFilters): Promise<KardexResponse> {
    // Backend requires productoId - return empty if not provided
    if (!filters.productId) {
      return {
        data: [],
        pagination: { total: 0, page: filters.page || 1, limit: filters.pageSize || 20, pages: 0 },
      };
    }

    const frontendPage = filters.page || 1;
    const frontendLimit = filters.pageSize || 20;
    const { page, size } = toBackendPage(frontendPage, frontendLimit);

    const params = new URLSearchParams();

    if (filters.productId) {
      params.append('productoId', filters.productId);
    }
    if (filters.warehouseId) {
      params.append('almacenId', filters.warehouseId);
    }
    if (filters.tipoMovimiento) {
      params.append('tipo', filters.tipoMovimiento);
    }

    params.append('page', String(page));
    params.append('size', String(size));

    const endpoint = `/inventario/kardex?${params.toString()}`;

    // The controller wraps movimientos + pagination inside ApiResponse.data
    const res: ApiResponse<BackendKardexData> = await apiService.get(endpoint);

    if (!res.success || !res.data) {
      throw new Error(res.message || res.error || 'Error al cargar el kardex');
    }

    const backendMovimientos = res.data.movimientos || [];
    const backendPag = res.data.pagination;

    const movimientos: MovimientoKardex[] = backendMovimientos.map(m =>
      mapBackendKardexItem(m, filters),
    );

    // Convert backend 0-based pagination to frontend 1-based
    const pag = backendPag
      ? {
          total: backendPag.totalElements,
          page: backendPag.page + 1,
          limit: backendPag.size,
          pages: backendPag.totalPages,
        }
      : { total: movimientos.length, page: frontendPage, limit: frontendLimit, pages: 1 };

    return {
      data: movimientos,
      pagination: pag,
    };
  },

  // ----- Ajuste de Inventario ---------------------------------------------

  /**
   * Create an inventory adjustment.
   * POST /inventario/ajustes
   *
   * The frontend's AjusteInventarioRequest uses `cantidadAjuste` (signed)
   * and `reasonId`, while the backend expects `tipo` (AJUSTE_INGRESO /
   * AJUSTE_EGRESO), `cantidad` (always positive), and `motivo`.
   */
  async createAjuste(
    ajusteData: AjusteInventarioRequest,
  ): Promise<{ success: boolean; message: string }> {
    const isIngreso = ajusteData.cantidadAjuste >= 0;

    const body = {
      productoId: Number(ajusteData.productId),
      almacenId: Number(ajusteData.warehouseId),
      tipo: isIngreso ? 'AJUSTE_INGRESO' : 'AJUSTE_EGRESO',
      cantidad: Math.abs(ajusteData.cantidadAjuste),
      motivo: ajusteData.observaciones || '',
      documentoReferencia: ajusteData.observaciones || '',
    };

    const res: ApiResponse<unknown> = await apiService.post('/inventario/ajustes', body);

    if (!res.success) {
      throw new Error(res.message || res.error || 'Error al crear ajuste de inventario');
    }

    return {
      success: true,
      message: res.message || 'Ajuste de inventario creado exitosamente',
    };
  },

  // ----- Alertas ----------------------------------------------------------

  /**
   * Fetch stock alerts.
   * GET /inventario/alertas
   *
   * Backend returns all items with cantidad <= stockMinimo.
   * We split them into `stockBajo` and `stockCritico` on the client using
   * the derived estado.
   */
  async getAlertas(): Promise<AlertasStock> {
    const res: ApiResponse<BackendStockItem[]> = await apiService.get('/inventario/alertas');

    if (!res.success || !res.data) {
      return { stockBajo: [], stockCritico: [] };
    }

    const items = res.data.map(mapBackendStockItem);

    return {
      stockBajo: items.filter(item => item.estado === 'BAJO'),
      stockCritico: items.filter(item => item.estado === 'CRITICO'),
    };
  },

  // ----- Product Search ---------------------------------------------------

  /**
   * Search products for autocomplete.
   * GET /productos/buscar?q=X&size=10
   */
  async searchProducts(
    query: string,
  ): Promise<Array<{ id: string; codigo: string; nombre: string }>> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const params = new URLSearchParams();
    params.append('q', query);
    params.append('size', '10');

    const endpoint = `/productos/buscar?${params.toString()}`;
    const res: ApiResponse<BackendProductoSearchResult[]> = await apiService.get(endpoint);

    if (!res.success || !res.data) {
      return [];
    }

    return res.data.map(p => ({
      id: String(p.id),
      codigo: p.sku || '',
      nombre: p.nombre,
    }));
  },
};
