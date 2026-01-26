// Re-export all module types
export * from './inventory.types';
export * from './sales.types';

// User types
export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  permissions?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Product types
export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria?: string;
  unidad?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Client/Entity types
export interface Client {
  id: string;
  tipo: 'CLIENTE' | 'PROVEEDOR' | 'AMBOS';
  tipoDocumento: 'DNI' | 'RUC' | 'PASAPORTE';
  numeroDocumento: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Inventory types
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
  updatedAt: string;
}

export interface MovimientoKardex {
  id: string;
  fecha: string;
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  motivo: string;
  usuario: string;
  documentoReferencia?: string;
}

// Pagination
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
  tipo?: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  limit?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationData;
}
