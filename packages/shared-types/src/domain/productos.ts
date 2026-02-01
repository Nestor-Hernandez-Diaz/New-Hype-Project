/**
 * 📦 TIPOS DE DOMINIO - PRODUCTOS
 * 
 * Interfaces TypeScript para el módulo de Productos del ERP.
 * Nomenclatura: camelCase consistente con JPA (futuro backend Spring Boot)
 * 
 * @module productos
 * @packageDocumentation
 */

// ============================================================================
// ENUMERACIONES
// ============================================================================

/**
 * Estados posibles de un producto en el sistema
 */
export enum EstadoProducto {
  /** Producto activo y disponible para venta */
  ACTIVO = 'ACTIVO',
  /** Producto desactivado temporalmente */
  INACTIVO = 'INACTIVO',
  /** Producto descontinuado permanentemente */
  DESCONTINUADO = 'DESCONTINUADO'
}

/**
 * Estados de disponibilidad de stock para productos
 */
export enum EstadoStockProducto {
  /** Stock disponible (cantidad > mínimo) */
  DISPONIBLE = 'DISPONIBLE',
  /** Stock bajo (cantidad <= mínimo) */
  BAJO = 'BAJO',
  /** Sin stock (cantidad = 0) */
  AGOTADO = 'AGOTADO'
}

/**
 * Tipos de producto según su naturaleza
 */
export enum TipoProducto {
  /** Producto físico inventariable */
  BIEN = 'BIEN',
  /** Servicio no inventariable */
  SERVICIO = 'SERVICIO',
  /** Combo o paquete de productos */
  COMBO = 'COMBO'
}

// ============================================================================
// ENUMERACIONES Y TIPOS ESPECÍFICOS DE ROPA Y ACCESORIOS
// ============================================================================

/**
 * Tallas disponibles para productos de ropa
 */
export type TallaRopa = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Único' | 'Ajustable';

/**
 * Género/Sección de la prenda
 */
export enum GeneroRopa {
  /** Ropa para mujer */
  MUJER = 'MUJER',
  /** Ropa para hombre */
  HOMBRE = 'HOMBRE',
  /** Ropa unisex */
  UNISEX = 'UNISEX',
  /** Ropa infantil */
  NINO = 'NIÑO'
}

// ============================================================================
// INTERFACES DE DOMINIO
// ============================================================================

/**
 * Categoría de productos (Tabla Maestra)
 */
export interface Categoria {
  /** ID único de la categoría */
  id: number;
  /** Código único de la categoría (ej: "ELECT", "COMPU") */
  codigoCategoria: string;
  /** Nombre de la categoría */
  nombreCategoria: string;
  /** Descripción de la categoría */
  descripcion?: string;
  /** Indica si la categoría está activa */
  activa: boolean;
  /** Fecha de creación */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
}

/**
 * Unidad de medida (Tabla Maestra)
 */
export interface UnidadMedida {
  /** ID único de la unidad de medida */
  id: number;
  /** Código único de la unidad (ej: "UNI", "KG", "LT") */
  codigoUnidad: string;
  /** Nombre de la unidad de medida */
  nombreUnidad: string;
  /** Símbolo de la unidad (ej: "kg", "m", "und") */
  simbolo: string;
  /** Indica si la unidad está activa */
  activa: boolean;
  /** Fecha de creación */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
}

/**
 * Producto principal del catálogo
 */
export interface Producto {
  /** ID único del producto */
  id: number;
  /** Código único del producto (ej: "PROD-001", "LAP-001") */
  codigoProducto: string;
  /** Nombre del producto */
  nombreProducto: string;
  /** Descripción detallada del producto */
  descripcion?: string;
  
  // Relaciones con tablas maestras
  /** ID de la categoría */
  categoriaId: number;
  /** Datos de la categoría (incluido en respuestas) */
  categoria?: Categoria;
  
  /** ID de la unidad de medida */
  unidadMedidaId: number;
  /** Datos de la unidad de medida (incluido en respuestas) */
  unidadMedida?: UnidadMedida;
  
  // Información comercial
  /** Precio de venta unitario */
  precioVenta: number;
  /** Precio de compra/costo unitario */
  precioCosto?: number;
  /** Margen de ganancia en porcentaje */
  margen?: number;
  
  // Control de stock
  /** Stock inicial registrado */
  stockInicial: number;
  /** Stock actual disponible */
  stockActual: number;
  /** Stock mínimo para alertas */
  stockMinimo: number;
  /** Stock máximo permitido */
  stockMaximo?: number;
  
  // ===== CAMPOS ESPECÍFICOS DE ROPA Y ACCESORIOS =====
  /** Talla de la prenda (XS, S, M, L, XL, XXL, Único) */
  talla: TallaRopa;
  /** Color del producto (ej: "Negro", "Blanco", "Rojo") */
  color: string;
  /** Marca del producto (ej: "Zara", "H&M", "Forever 21") */
  marca: string;
  /** Material principal (ej: "Algodón 100%", "Poliéster", "Mezclilla") */
  material: string;
  /** Género/Sección de la prenda */
  genero: GeneroRopa;
  /** Composición detallada opcional (ej: "80% Algodón, 20% Poliéster") */
  composicion?: string;
  
  // Estado y tipo
  /** Tipo de producto */
  tipoProducto: TipoProducto;
  /** Estado del producto */
  estadoProducto: EstadoProducto;
  /** Estado calculado del stock */
  estadoStock: EstadoStockProducto;
  
  // Campos de auditoría
  /** Indica si el producto está activo */
  activo: boolean;
  /** Usuario que creó el registro */
  usuarioCreacion?: string;
  /** Usuario que realizó la última modificación */
  usuarioModificacion?: string;
  /** Fecha de creación del registro */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
}

/**
 * DTO para crear un nuevo producto
 */
export interface CrearProductoDTO {
  codigoProducto: string;
  nombreProducto: string;
  descripcion?: string;
  categoriaId: number;
  unidadMedidaId: number;
  precioVenta: number;
  precioCosto?: number;
  stockInicial: number;
  stockMinimo: number;
  stockMaximo?: number;
  tipoProducto: TipoProducto;
  
  // ===== CAMPOS DE ROPA (OBLIGATORIOS) =====
  talla: TallaRopa;
  color: string;
  marca: string;
  material: string;
  genero: GeneroRopa;
  composicion?: string;
}

/**
 * DTO para actualizar un producto existente
 */
export interface ActualizarProductoDTO {
  nombreProducto?: string;
  descripcion?: string;
  categoriaId?: number;
  unidadMedidaId?: number;
  precioVenta?: number;
  precioCosto?: number;
  stockMinimo?: number;
  stockMaximo?: number;
  tipoProducto?: TipoProducto;
  estadoProducto?: EstadoProducto;
  activo?: boolean;
}

/**
 * Filtros para búsqueda de productos
 */
export interface ProductoFiltros {
  /** Búsqueda por código o nombre */
  busqueda?: string;
  /** Filtrar por categoría */
  categoriaId?: number;
  /** Filtrar por estado del producto */
  estadoProducto?: EstadoProducto;
  /** Filtrar por estado del stock */
  estadoStock?: EstadoStockProducto;
  /** Filtrar por tipo de producto */
  tipoProducto?: TipoProducto;
  /** Filtrar solo activos */
  soloActivos?: boolean;
  /** Precio mínimo */
  precioMinimo?: number;
  /** Precio máximo */
  precioMaximo?: number;
  /** Stock mínimo */
  stockMinimo?: number;
  /** Stock máximo */
  stockMaximo?: number;
  /** Número de página (para paginación) */
  pagina?: number;
  /** Tamaño de página */
  tamañoPagina?: number;
  /** Campo para ordenar */
  ordenarPor?: 'nombreProducto' | 'precioVenta' | 'stockActual' | 'fechaCreacion';
  /** Dirección de ordenamiento */
  direccion?: 'ASC' | 'DESC';
}

/**
 * Respuesta paginada de productos
 */
export interface ProductosPaginados {
  /** Lista de productos */
  productos: Producto[];
  /** Número total de productos */
  total: number;
  /** Página actual */
  pagina: number;
  /** Tamaño de página */
  tamañoPagina: number;
  /** Total de páginas */
  totalPaginas: number;
}

/**
 * Estadísticas del catálogo de productos
 */
export interface EstadisticasProductos {
  /** Total de productos */
  totalProductos: number;
  /** Productos activos */
  productosActivos: number;
  /** Productos inactivos */
  productosInactivos: number;
  /** Productos con stock bajo */
  productosStockBajo: number;
  /** Productos agotados */
  productosAgotados: number;
  /** Valor total del inventario */
  valorInventario: number;
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

/**
 * Validación de código de producto
 */
export type CodigoProductoValido = string; // Regex: /^[A-Z]{3,4}-\d{3,5}$/

/**
 * Estado de carga de productos
 */
export interface EstadoProductos {
  /** Lista de productos cargados */
  productos: Producto[];
  /** Indica si se está cargando */
  cargando: boolean;
  /** Error si existe */
  error: string | null;
  /** Metadata de paginación */
  paginacion: ProductosPaginados | null;
}
