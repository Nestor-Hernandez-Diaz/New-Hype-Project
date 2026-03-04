/**
 * ============================================
 * MOCK API SERVICE - INVENTARIO
 * Simula backend con datos de prueba
 * ============================================
 */

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

// ========== DATOS MOCK ==========

const MOCK_STOCK_ITEMS: StockItem[] = [
  {
    stockByWarehouseId: 'SBW-001',
    productId: 'PRD-001',
    codigo: 'LAP-001',
    nombre: 'Laptop Dell Inspiron 15',
    almacen: 'Almacén Principal',
    warehouseId: 'WH-PRINCIPAL',
    cantidad: 45,
    stockMinimo: 10,
    estado: 'NORMAL',
    updatedAt: '2025-01-15T10:30:00.000Z',
  },
  {
    stockByWarehouseId: 'SBW-002',
    productId: 'PRD-002',
    codigo: 'MOU-001',
    nombre: 'Mouse Logitech MX Master 3',
    almacen: 'Almacén Principal',
    warehouseId: 'WH-PRINCIPAL',
    cantidad: 8,
    stockMinimo: 15,
    estado: 'BAJO',
    updatedAt: '2025-01-14T14:20:00.000Z',
  },
  {
    stockByWarehouseId: 'SBW-003',
    productId: 'PRD-003',
    codigo: 'TEC-001',
    nombre: 'Teclado Mecánico Razer',
    almacen: 'Almacén Principal',
    warehouseId: 'WH-PRINCIPAL',
    cantidad: 2,
    stockMinimo: 5,
    estado: 'CRITICO',
    updatedAt: '2025-01-13T09:15:00.000Z',
  },
  {
    stockByWarehouseId: 'SBW-004',
    productId: 'PRD-004',
    codigo: 'MON-001',
    nombre: 'Monitor LG 27" 4K',
    almacen: 'Almacén Secundario',
    warehouseId: 'WH-SECUNDARIO',
    cantidad: 12,
    stockMinimo: 5,
    estado: 'NORMAL',
    updatedAt: '2025-01-12T16:45:00.000Z',
  },
  {
    stockByWarehouseId: 'SBW-005',
    productId: 'PRD-005',
    codigo: 'HDD-001',
    nombre: 'Disco Duro Externo 1TB',
    almacen: 'Almacén Principal',
    warehouseId: 'WH-PRINCIPAL',
    cantidad: 30,
    stockMinimo: 20,
    estado: 'NORMAL',
    updatedAt: '2025-01-11T11:00:00.000Z',
  },
  {
    stockByWarehouseId: 'SBW-006',
    productId: 'PRD-006',
    codigo: 'CAM-001',
    nombre: 'Cámara Web Logitech C920',
    almacen: 'Almacén Principal',
    warehouseId: 'WH-PRINCIPAL',
    cantidad: 1,
    stockMinimo: 8,
    estado: 'CRITICO',
    updatedAt: '2025-01-10T08:00:00.000Z',
  },
];

const MOCK_KARDEX_MOVIMIENTOS: MovimientoKardex[] = [
  {
    id: 'MOV-001',
    fecha: '2025-01-15T10:30:00.000Z',
    productId: 'PRD-001',
    codigo: 'LAP-001',
    nombre: 'Laptop Dell Inspiron 15',
    almacen: 'Almacén Principal',
    tipo: 'ENTRADA',
    cantidad: 10,
    stockAntes: 35,
    stockDespues: 45,
    motivo: 'Compra a proveedor',
    usuario: 'Juan Pérez',
    documentoReferencia: 'OC-2025-001',
  },
  {
    id: 'MOV-002',
    fecha: '2025-01-14T14:20:00.000Z',
    productId: 'PRD-002',
    codigo: 'MOU-001',
    nombre: 'Mouse Logitech MX Master 3',
    almacen: 'Almacén Principal',
    tipo: 'SALIDA',
    cantidad: -5,
    stockAntes: 13,
    stockDespues: 8,
    motivo: 'Venta',
    usuario: 'María García',
    documentoReferencia: 'VNT-2025-045',
  },
  {
    id: 'MOV-003',
    fecha: '2025-01-13T09:15:00.000Z',
    productId: 'PRD-003',
    codigo: 'TEC-001',
    nombre: 'Teclado Mecánico Razer',
    almacen: 'Almacén Principal',
    tipo: 'AJUSTE',
    cantidad: -3,
    stockAntes: 5,
    stockDespues: 2,
    motivo: 'Merma por daño',
    usuario: 'Carlos López',
  },
  {
    id: 'MOV-004',
    fecha: '2025-01-12T16:45:00.000Z',
    productId: 'PRD-004',
    codigo: 'MON-001',
    nombre: 'Monitor LG 27" 4K',
    almacen: 'Almacén Secundario',
    tipo: 'ENTRADA',
    cantidad: 7,
    stockAntes: 5,
    stockDespues: 12,
    motivo: 'Transferencia entre almacenes',
    usuario: 'Ana Martínez',
    documentoReferencia: 'TRF-2025-012',
  },
  {
    id: 'MOV-005',
    fecha: '2025-01-11T11:00:00.000Z',
    productId: 'PRD-005',
    codigo: 'HDD-001',
    nombre: 'Disco Duro Externo 1TB',
    almacen: 'Almacén Principal',
    tipo: 'ENTRADA',
    cantidad: 30,
    stockAntes: 0,
    stockDespues: 30,
    motivo: 'Compra inicial',
    usuario: 'Juan Pérez',
    documentoReferencia: 'OC-2025-002',
  },
];

// ========== UTILIDADES ==========

/**
 * Simula delay de red
 */
const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Filtra items de stock según criterios
 */
const filterStockItems = (items: StockItem[], filters: StockFilters): StockItem[] => {
  let filtered = [...items];

  if (filters.almacenId) {
    filtered = filtered.filter(item => item.warehouseId === filters.almacenId);
  }

  if (filters.q) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(
      item =>
        item.codigo.toLowerCase().includes(query) ||
        item.nombre.toLowerCase().includes(query)
    );
  }

  if (filters.estado) {
    filtered = filtered.filter(item => item.estado === filters.estado);
  }

  // Ordenamiento
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof StockItem];
      const bValue = b[filters.sortBy as keyof StockItem];
      
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return filters.order === 'desc' ? -comparison : comparison;
    });
  }

  return filtered;
};

/**
 * Filtra movimientos kardex según criterios
 */
const filterKardexMovimientos = (
  items: MovimientoKardex[],
  filters: KardexFilters
): MovimientoKardex[] => {
  let filtered = [...items];

  if (filters.warehouseId) {
    filtered = filtered.filter(item => {
      const stockItem = MOCK_STOCK_ITEMS.find(s => s.productId === item.productId);
      return stockItem?.warehouseId === filters.warehouseId;
    });
  }

  if (filters.productId) {
    filtered = filtered.filter(item => item.productId === filters.productId);
  }

  if (filters.tipoMovimiento) {
    filtered = filtered.filter(item => item.tipo === filters.tipoMovimiento);
  }

  if (filters.fechaDesde) {
    filtered = filtered.filter(item => new Date(item.fecha) >= new Date(filters.fechaDesde!));
  }

  if (filters.fechaHasta) {
    filtered = filtered.filter(item => new Date(item.fecha) <= new Date(filters.fechaHasta!));
  }

  // Ordenamiento por fecha descendente por defecto
  filtered.sort((a, b) => {
    const dateA = new Date(a.fecha).getTime();
    const dateB = new Date(b.fecha).getTime();
    return dateB - dateA;
  });

  return filtered;
};

/**
 * Pagina un array
 */
const paginate = <T,>(items: T[], page: number = 1, limit: number = 10): { data: T[]; total: number; pages: number } => {
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    data: items.slice(start, end),
    total: items.length,
    pages: Math.ceil(items.length / limit),
  };
};

// ========== MOCK API CLASS ==========

class InventoryMockApiService {
  /**
   * Obtener stock de productos
   */
  async getStock(filters: StockFilters = {}): Promise<StockResponse> {
    await simulateNetworkDelay();

    const filtered = filterStockItems(MOCK_STOCK_ITEMS, filters);
    const paginated = paginate(filtered, filters.page, filters.limit);

    return {
      data: paginated.data,
      pagination: {
        total: paginated.total,
        page: filters.page || 1,
        limit: filters.limit || 10,
        pages: paginated.pages,
      },
    };
  }

  /**
   * Obtener movimientos del kardex
   */
  async getKardex(filters: KardexFilters): Promise<KardexResponse> {
    await simulateNetworkDelay();

    const filtered = filterKardexMovimientos(MOCK_KARDEX_MOVIMIENTOS, filters);
    const paginated = paginate(filtered, filters.page, filters.pageSize || 20);

    return {
      data: paginated.data,
      pagination: {
        total: paginated.total,
        page: filters.page || 1,
        limit: filters.pageSize || 20,
        pages: paginated.pages,
      },
    };
  }

  /**
   * Crear ajuste de inventario
   */
  async createAjuste(ajusteData: AjusteInventarioRequest): Promise<{ success: boolean; message: string }> {
    await simulateNetworkDelay();

    console.log('📝 Ajuste creado (MOCK):', ajusteData);

    // Actualizar stock local (solo para demo)
    const stockItem = MOCK_STOCK_ITEMS.find(
      item => item.productId === ajusteData.productId && item.warehouseId === ajusteData.warehouseId
    );

    if (stockItem) {
      const stockAntes = stockItem.cantidad;
      stockItem.cantidad += ajusteData.cantidadAjuste;
      stockItem.updatedAt = new Date().toISOString();

      // Recalcular estado
      if (stockItem.stockMinimo) {
        if (stockItem.cantidad <= stockItem.stockMinimo * 0.2) {
          stockItem.estado = 'CRITICO';
        } else if (stockItem.cantidad <= stockItem.stockMinimo) {
          stockItem.estado = 'BAJO';
        } else {
          stockItem.estado = 'NORMAL';
        }
      }

      // Agregar movimiento kardex
      MOCK_KARDEX_MOVIMIENTOS.unshift({
        id: `MOV-${Date.now()}`,
        fecha: new Date().toISOString(),
        productId: ajusteData.productId,
        codigo: stockItem.codigo,
        nombre: stockItem.nombre,
        almacen: stockItem.almacen,
        tipo: 'AJUSTE',
        cantidad: ajusteData.cantidadAjuste,
        stockAntes,
        stockDespues: stockItem.cantidad,
        motivo: ajusteData.observaciones || 'Ajuste manual',
        usuario: 'Usuario Demo',
      });
    }

    return {
      success: true,
      message: 'Ajuste de inventario creado exitosamente',
    };
  }

  /**
   * Obtener alertas de stock
   */
  async getAlertas(): Promise<AlertasStock> {
    await simulateNetworkDelay();

    return {
      stockBajo: MOCK_STOCK_ITEMS.filter(item => item.estado === 'BAJO'),
      stockCritico: MOCK_STOCK_ITEMS.filter(item => item.estado === 'CRITICO'),
    };
  }

  /**
   * Buscar productos para autocomplete
   */
  async searchProducts(query: string): Promise<Array<{ id: string; codigo: string; nombre: string }>> {
    await simulateNetworkDelay(200);

    const lowerQuery = query.toLowerCase();
    return MOCK_STOCK_ITEMS
      .filter(
        item =>
          item.codigo.toLowerCase().includes(lowerQuery) ||
          item.nombre.toLowerCase().includes(lowerQuery)
      )
      .map(item => ({
        id: item.productId,
        codigo: item.codigo,
        nombre: item.nombre,
      }))
      .slice(0, 10); // Limitar a 10 resultados
  }
}

// Exportar instancia singleton
export const inventoryMockApi = new InventoryMockApiService();
