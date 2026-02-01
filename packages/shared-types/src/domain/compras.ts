/**
 * 🛒 TIPOS COMPARTIDOS - MÓDULO DE COMPRAS
 * 
 * Órdenes de Compra, Recepciones, Items, Filtros y DTOs
 * Alineados con dominio de TIENDA DE ROPA Y ACCESORIOS
 * 
 * @packageDocumentation
 */

// ============= ENUMS / TIPOS UNIÓN =============

export enum EstadoOrdenCompra {
  PENDIENTE = 'PENDIENTE',
  ENVIADA = 'ENVIADA',
  CONFIRMADA = 'CONFIRMADA',
  EN_RECEPCION = 'EN_RECEPCION',
  PARCIAL = 'PARCIAL',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

export enum EstadoRecepcion {
  PENDIENTE = 'PENDIENTE',
  INSPECCION = 'INSPECCION',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
}

export type EstadoOrdenCompraType = keyof typeof EstadoOrdenCompra;
export type EstadoRecepcionType = keyof typeof EstadoRecepcion;

// ============= INTERFACES - ITEMS =============

/**
 * Item dentro de una Orden de Compra
 * Incluye información del producto y cantidades de compra
 */
export interface ItemOrdenCompra {
  id: string;
  productoId: string;
  codigoProducto: string;
  nombreProducto: string;
  
  // Cantidades
  cantidadOrdenada: number;
  cantidadRecibida: number;
  cantidadAceptada: number;
  cantidadRechazada: number;
  cantidadPendiente: number;
  
  // Precio y descuento
  precioUnitario: number;
  descuento: number;
  incluyeIGV: boolean;
  
  // Atributos de ropa (NUEVO)
  talla?: string;              // XS, S, M, L, XL, XXL
  color?: string;              // Rojo, Azul, Negro, etc.
  material?: string;           // Algodón, Poliéster, etc.
  marca?: string;              // Nike, Adidas, etc.
  
  // Especificaciones
  especificaciones?: string;
  observaciones?: string;
  
  // Cálculos
  subtotal: number;
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item dentro de una Recepción de Compra
 * Vinculado a un item de orden específica
 */
export interface ItemRecepcion {
  id: string;
  recepcionId: string;
  itemOrdenCompraId: string;
  productoId: string;
  codigoProducto: string;
  nombreProducto: string;
  
  // Cantidades recibidas
  cantidadRecibida: number;
  cantidadAceptada: number;
  cantidadRechazada: number;
  
  // Control de lote
  numeroLote?: string;
  fechaVencimiento?: string;
  
  // Atributos de ropa (NUEVO)
  talla?: string;
  color?: string;
  material?: string;
  marca?: string;
  
  // Inspección
  estadoQC: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE';
  observaciones?: string;
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
}

// ============= INTERFACES - ORDEN COMPRA =============

/**
 * Orden de Compra - Documento principal
 * Representa una solicitud de compra a un proveedor
 */
export interface OrdenCompra {
  id: string;
  codigo: string;
  
  // Proveedor
  proveedorId: string;
  proveedorNombre?: string;
  proveedorDocumento?: string;
  
  // Destino
  almacenDestinoId: string;
  almacenDestinoNombre?: string;
  
  // Usuario
  solicitadoPorId: string;
  solicitadoPorNombre?: string;
  
  // Fechas
  fecha: Date;
  fechaEntregaEsperada?: Date;
  
  // Estado
  estado: EstadoOrdenCompra;
  
  // Condiciones comerciales
  condicionesPago?: string;
  formaPago?: string;
  lugarEntrega?: string;
  moneda?: string;           // PEN, USD, etc.
  
  // Totales
  subtotal: number;
  descuento: number;
  igv: number;
  total: number;
  
  // Items
  items: ItemOrdenCompra[];
  
  // Observaciones
  observaciones?: string;
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// ============= INTERFACES - RECEPCIÓN =============

/**
 * Recepción de Compra - Documentación de ingreso
 * Vinculada a una Orden de Compra específica
 */
export interface Recepcion {
  id: string;
  codigo: string;
  
  // Orden de referencia
  ordenCompraId: string;
  ordenCompra?: OrdenCompra;
  
  // Destino
  almacenId: string;
  almacenNombre?: string;
  
  // Fechas
  fecha: Date;
  fechaRecepcion: Date;
  
  // Estado
  estado: EstadoRecepcion;
  
  // Documentos transportistas
  guiaRemision?: string;
  transportista?: string;
  condicionMercancia?: string;
  
  // Usuario receptor
  recibidoPorId: string;
  recibidoPorNombre?: string;
  
  // Items recibidos
  items: ItemRecepcion[];
  
  // Observaciones
  observaciones?: string;
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// ============= DTOs - CREAR =============

export interface CrearItemOrdenCompraDTO {
  productoId: string;
  codigoProducto: string;
  nombreProducto: string;
  cantidadOrdenada: number;
  precioUnitario: number;
  descuento?: number;
  incluyeIGV?: boolean;
  talla?: string;
  color?: string;
  material?: string;
  marca?: string;
  especificaciones?: string;
  observaciones?: string;
}

export interface CrearOrdenCompraDTO {
  proveedorId: string;
  almacenDestinoId: string;
  fechaEntregaEsperada?: Date;
  condicionesPago?: string;
  formaPago?: string;
  lugarEntrega?: string;
  moneda?: string;
  observaciones?: string;
  items: CrearItemOrdenCompraDTO[];
}

export interface ActualizarOrdenCompraDTO {
  proveedorId?: string;
  almacenDestinoId?: string;
  fechaEntregaEsperada?: Date;
  condicionesPago?: string;
  formaPago?: string;
  lugarEntrega?: string;
  moneda?: string;
  observaciones?: string;
  items?: CrearItemOrdenCompraDTO[];
}

export interface CambiarEstadoOrdenDTO {
  estado: EstadoOrdenCompra;
  observaciones?: string;
}

// ============= DTOs - RECEPCIONES =============

export interface CrearItemRecepcionDTO {
  itemOrdenCompraId: string;
  productoId: string;
  codigoProducto: string;
  nombreProducto: string;
  cantidadRecibida: number;
  cantidadAceptada: number;
  cantidadRechazada: number;
  estadoQC: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE';
  numeroLote?: string;
  fechaVencimiento?: string;
  talla?: string;
  color?: string;
  material?: string;
  marca?: string;
  observaciones?: string;
}

export interface CrearRecepcionDTO {
  ordenCompraId: string;
  almacenId: string;
  guiaRemision?: string;
  transportista?: string;
  condicionMercancia?: string;
  observaciones?: string;
  items: CrearItemRecepcionDTO[];
}

export interface ActualizarRecepcionDTO {
  almacenId?: string;
  guiaRemision?: string;
  transportista?: string;
  condicionMercancia?: string;
  observaciones?: string;
  items?: CrearItemRecepcionDTO[];
}

export interface CambiarEstadoRecepcionDTO {
  estado: EstadoRecepcion;
  observaciones?: string;
}

// ============= FILTROS =============

export interface FiltrosOrdenCompra {
  pagina?: number;
  limite?: number;
  estado?: EstadoOrdenCompra;
  proveedorId?: string;
  almacenDestinoId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  busqueda?: string;
}

export interface FiltrosRecepcion {
  pagina?: number;
  limite?: number;
  estado?: EstadoRecepcion;
  ordenCompraId?: string;
  almacenId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  busqueda?: string;
}

// ============= RESPUESTAS PAGINADAS =============

export interface OrdenesPaginadas {
  ordenes: OrdenCompra[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

export interface RecepcionesPaginadas {
  recepciones: Recepcion[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

// ============= MAPEOS Y CONSTANTES =============

export const ETIQUETAS_ESTADO_ORDEN: Record<EstadoOrdenCompra, string> = {
  [EstadoOrdenCompra.PENDIENTE]: '⏳ Pendiente',
  [EstadoOrdenCompra.ENVIADA]: '📤 Enviada',
  [EstadoOrdenCompra.CONFIRMADA]: '✅ Confirmada',
  [EstadoOrdenCompra.EN_RECEPCION]: '📦 En Recepción',
  [EstadoOrdenCompra.PARCIAL]: '⚠️ Parcial',
  [EstadoOrdenCompra.COMPLETADA]: '🎉 Completada',
  [EstadoOrdenCompra.CANCELADA]: '❌ Cancelada',
};

export const COLORES_ESTADO_ORDEN: Record<EstadoOrdenCompra, string> = {
  [EstadoOrdenCompra.PENDIENTE]: '#ffc107',
  [EstadoOrdenCompra.ENVIADA]: '#17a2b8',
  [EstadoOrdenCompra.CONFIRMADA]: '#007bff',
  [EstadoOrdenCompra.EN_RECEPCION]: '#6f42c1',
  [EstadoOrdenCompra.PARCIAL]: '#fd7e14',
  [EstadoOrdenCompra.COMPLETADA]: '#28a745',
  [EstadoOrdenCompra.CANCELADA]: '#dc3545',
};

export const ETIQUETAS_ESTADO_RECEPCION: Record<EstadoRecepcion, string> = {
  [EstadoRecepcion.PENDIENTE]: '⏳ Pendiente',
  [EstadoRecepcion.INSPECCION]: '🔍 En Inspección',
  [EstadoRecepcion.CONFIRMADA]: '✅ Confirmada',
  [EstadoRecepcion.CANCELADA]: '❌ Cancelada',
};

export const COLORES_ESTADO_RECEPCION: Record<EstadoRecepcion, string> = {
  [EstadoRecepcion.PENDIENTE]: '#ffc107',
  [EstadoRecepcion.INSPECCION]: '#17a2b8',
  [EstadoRecepcion.CONFIRMADA]: '#28a745',
  [EstadoRecepcion.CANCELADA]: '#dc3545',
};

export const TALLAS_ROPA = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
export const COLORES_DISPONIBLES = ['Negro', 'Blanco', 'Gris', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Morado', 'Rosa', 'Marrón', 'Beige'];
export const MATERIALES = ['Algodón 100%', 'Poliéster', 'Mezcla Algodón-Poliéster', 'Lana', 'Seda', 'Denim', 'Lino'];
export const MARCAS_ROPA = ['Nike', 'Adidas', 'Puma', 'Calvin Klein', 'Lacoste', 'Gucci', 'Louis Vuitton', 'Local', 'Genérico'];
