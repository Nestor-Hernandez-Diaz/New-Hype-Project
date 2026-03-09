export interface StockItem {
  stockByWarehouseId: string;
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  warehouseId: string;
  cantidad: number;
  stockMinimo: number | null;
  estado: 'NORMAL' | 'BAJO' | 'CRITICO';
  // ❌ REMOVIDO: updatedAt (backend no lo devuelve, era fake)
}

export interface MovimientoKardex {
  id: string;
  fecha: string;
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE_INGRESO' | 'AJUSTE_EGRESO'; // ⭐ ACTUALIZADO (Sprint Inventario)
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  motivo: string;
  usuario: string;
  documentoReferencia?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Filter interfaces
export interface StockFilters {
  almacenId?: string;
  productId?: string;
  estado?: 'NORMAL' | 'BAJO' | 'CRITICO';
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface KardexFilters {
  warehouseId: string;
  productId?: string;
  tipoMovimiento?: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'AJUSTE_INGRESO' | 'AJUSTE_EGRESO'; // ⭐ ACTUALIZADO (Sprint Inventario)
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// API Response interfaces
export interface StockResponse {
  data: StockItem[];
  pagination: PaginationData;
}

export interface KardexResponse {
  data: MovimientoKardex[];
  pagination: PaginationData;
}

// Adjustment interfaces
export interface AjusteData {
  productId: string;
  warehouseId: string;
  cantidadAjuste: number;
  adjustmentReason?: string; // Deprecado: mantener para compatibilidad
  reasonId?: string; // Nuevo: ID del motivo de movimiento
  observaciones?: string;
}

// Stats interface
export interface StockStats {
  totalProductos: number;
  stockBajo: number;
  stockCritico: number;
}

// Warehouse interface
export interface Warehouse {
  id: string;
  label: string;
}

// Adjustment reasons
export const ADJUSTMENT_REASONS = [
  'Merma por daño',
  'Merma por rotura', 
  'Devolución',
  'Error de conteo'
] as const;

export type AdjustmentReason = typeof ADJUSTMENT_REASONS[number];
export type AjusteFormData = AjusteData;

// Alias for compatibility with imports expecting AjusteInventarioRequest
export type AjusteInventarioRequest = AjusteData;

export interface AlertasStock {
  stockBajo: StockItem[];
  stockCritico: StockItem[];
}
