/**
 * ============================================
 * TIPOS DEL MÓDULO DE INVENTARIO
 * Diseñados para mapear directamente a JPA
 * ============================================
 */

// ========== ENUMS ==========
export enum EstadoStock {
  NORMAL = 'NORMAL',
  BAJO = 'BAJO',
  CRITICO = 'CRITICO'
}

export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE'
}

// ========== STOCK ==========
export interface StockItem {
  /** ID del registro de stock por almacén */
  stockByWarehouseId: string;
  
  /** ID del producto */
  productId: string;
  
  /** Código único del producto */
  codigo: string;
  
  /** Nombre del producto */
  nombre: string;
  
  /** Nombre del almacén */
  almacen: string;
  
  /** ID del almacén */
  warehouseId: string;
  
  /** Cantidad actual en stock */
  cantidad: number;
  
  /** Stock mínimo configurado (puede ser null) */
  stockMinimo: number | null;
  
  /** Estado calculado del stock */
  estado: EstadoStock;
  
  /** Fecha de última actualización */
  updatedAt: string; // ISO 8601 format
}

// ========== KARDEX (Movimientos) ==========
export interface MovimientoKardex {
  /** ID único del movimiento */
  id: string;
  
  /** Fecha y hora del movimiento */
  fecha: string; // ISO 8601 format
  
  /** ID del producto */
  productId: string;
  
  /** Código del producto */
  codigo: string;
  
  /** Nombre del producto */
  nombre: string;
  
  /** Nombre del almacén */
  almacen: string;
  
  /** Tipo de movimiento */
  tipo: TipoMovimiento;
  
  /** Cantidad del movimiento (positivo o negativo) */
  cantidad: number;
  
  /** Stock antes del movimiento */
  stockAntes: number;
  
  /** Stock después del movimiento */
  stockDespues: number;
  
  /** Motivo del movimiento */
  motivo: string;
  
  /** Usuario que realizó el movimiento */
  usuario: string;
  
  /** Referencia a documento origen (opcional) */
  documentoReferencia?: string;
}

// ========== AJUSTES ==========
export interface AjusteInventarioRequest {
  /** ID del producto a ajustar */
  productId: string;
  
  /** ID del almacén */
  warehouseId: string;
  
  /** Cantidad a ajustar (puede ser negativa) */
  cantidadAjuste: number;
  
  /** ID del motivo de ajuste */
  reasonId: string;
  
  /** Observaciones adicionales */
  observaciones?: string;
}

// ========== FILTROS ==========
export interface StockFilters {
  /** ID del almacén para filtrar */
  almacenId?: string;
  
  /** Búsqueda por código o nombre */
  q?: string;
  
  /** Filtrar por estado */
  estado?: EstadoStock;
  
  /** Página actual */
  page?: number;
  
  /** Items por página */
  limit?: number;
  
  /** Campo para ordenar */
  sortBy?: string;
  
  /** Dirección del ordenamiento */
  order?: 'asc' | 'desc';
}

export interface KardexFilters {
  /** ID del almacén */
  warehouseId?: string;
  
  /** ID del producto */
  productId?: string;
  
  /** Tipo de movimiento */
  tipo?: TipoMovimiento;
  
  /** Fecha desde */
  fechaDesde?: string;
  
  /** Fecha hasta */
  fechaHasta?: string;
  
  /** Página actual */
  page?: number;
  
  /** Items por página */
  pageSize?: number;
  
  /** Campo para ordenar */
  sortBy?: string;
  
  /** Dirección del ordenamiento */
  order?: 'asc' | 'desc';
}

// ========== PAGINACIÓN ==========
export interface PaginationData {
  /** Total de registros */
  total: number;
  
  /** Página actual */
  page: number;
  
  /** Items por página */
  limit: number;
  
  /** Total de páginas */
  pages: number;
}

// ========== RESPUESTAS API ==========
export interface StockResponse {
  data: StockItem[];
  pagination: PaginationData;
}

export interface KardexResponse {
  data: MovimientoKardex[];
  pagination: PaginationData;
}

export interface AlertasStock {
  stockBajo: StockItem[];
  stockCritico: StockItem[];
}

// ========== ESTADÍSTICAS ==========
export interface StockStats {
  /** Total de productos en inventario */
  totalProductos: number;
  
  /** Productos con stock bajo */
  stockBajo: number;
  
  /** Productos con stock crítico */
  stockCritico: number;
}
