/**
 * ============================================
 * TIPOS DEL MÓDULO DE VENTAS (Sales)
 * Diseñados para mapear directamente a DTOs de Spring Boot
 * ============================================
 */

// ========== ENUMS ==========
export enum EstadoVenta {
  PENDIENTE = 'Pendiente',
  COMPLETADA = 'Completada',
  CANCELADA = 'Cancelada'
}

export enum TipoComprobante {
  BOLETA = 'Boleta',
  FACTURA = 'Factura',
  NOTA_VENTA = 'NotaVenta'
}

export enum FormaPago {
  EFECTIVO = 'Efectivo',
  TARJETA = 'Tarjeta',
  TRANSFERENCIA = 'Transferencia',
  YAPE = 'Yape',
  PLIN = 'Plin'
}

export enum TipoMetodoPago {
  EFECTIVO = 'Efectivo',
  TARJETA = 'Tarjeta',
  TRANSFERENCIA = 'Transferencia',
  YAPE = 'Yape',
  PLIN = 'Plin'
}

export enum EstadoCaja {
  ABIERTA = 'Abierta',
  CERRADA = 'Cerrada'
}

export enum TipoMovimientoCaja {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO'
}

// ========== CAJA REGISTRADORA ==========
export interface CajaRegistradora {
  /** ID de la caja registradora */
  id: string;
  
  /** Nombre de la caja */
  nombre: string;
  
  /** Ubicación física (opcional) */
  ubicacion?: string;
  
  /** Estado activo/inactivo */
  activo: boolean;
  
  /** Fecha de creación */
  createdAt: string; // ISO 8601
  
  /** Fecha de última actualización */
  updatedAt: string; // ISO 8601
}

// ========== SESIÓN DE CAJA ==========
export interface SesionCaja {
  /** ID de la sesión */
  id: string;
  
  /** ID de la caja registradora */
  cashRegisterId: string;
  
  /** ID del usuario que abrió la sesión */
  userId: string;
  
  /** Fecha y hora de apertura */
  fechaApertura: string; // ISO 8601
  
  /** Fecha y hora de cierre (opcional) */
  fechaCierre?: string; // ISO 8601
  
  /** Monto inicial de apertura */
  montoApertura: number;
  
  /** Monto final al cerrar (opcional) */
  montoCierre?: number;
  
  /** Total de ventas durante la sesión */
  totalVentas: number;
  
  /** Diferencia entre esperado y real (opcional) */
  diferencia?: number;
  
  /** Estado de la sesión */
  estado: EstadoCaja;
  
  /** Observaciones de apertura/cierre */
  observaciones?: string;
  
  /** Fecha de creación */
  createdAt: string;
  
  /** Fecha de actualización */
  updatedAt: string;
  
  /** Información de la caja registradora (nested) */
  cashRegister?: CajaRegistradora;
  
  /** Información del usuario (nested) */
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

// ========== MOVIMIENTOS DE CAJA ==========
export interface MovimientoCaja {
  /** ID del movimiento */
  id: string;
  
  /** ID de la sesión de caja */
  cashSessionId: string;
  
  /** Tipo de movimiento */
  tipo: TipoMovimientoCaja;
  
  /** Monto del movimiento */
  monto: number | string; // Prisma Decimal como string
  
  /** Motivo del movimiento */
  motivo: string;
  
  /** Descripción adicional */
  descripcion?: string;
  
  /** ID del usuario que registró el movimiento */
  usuarioId: string;
  
  /** Fecha de creación */
  createdAt: string;
  
  /** Fecha de actualización */
  updatedAt: string;
  
  /** Información del usuario (nested) */
  usuario?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ========== RESUMEN DE CAJA ==========
export interface ResumenCaja {
  /** Monto de apertura */
  montoApertura: number | string;
  
  /** Total de ventas (todas las formas de pago) */
  totalVentas: number | string;
  
  /** Total de ingresos adicionales */
  totalIngresos: number | string;
  
  /** Total de egresos */
  totalEgresos: number | string;
  
  /** Total esperado en caja */
  totalEsperado: number | string;
  
  /** Lista de movimientos (opcional) */
  movements?: MovimientoCaja[];
}

// ========== ITEM DE VENTA ==========
export interface ItemVenta {
  /** ID del item de venta */
  id: string;
  
  /** ID del producto */
  productId: string;
  
  /** Nombre del producto */
  nombreProducto: string;
  
  /** Cantidad vendida */
  cantidad: number;
  
  /** Precio unitario */
  precioUnitario: number;
  
  /** Subtotal del item (cantidad * precioUnitario) */
  subtotal: number;
}

// ========== PAGO MÚLTIPLE ==========
export interface PagoVenta {
  /** ID del pago */
  id: string;
  
  /** Método de pago utilizado */
  metodoPago: TipoMetodoPago;
  
  /** Monto del pago */
  monto: number;
  
  /** Referencia del pago (opcional) */
  referencia?: string;
  
  /** Observaciones (opcional) */
  observaciones?: string;
  
  /** Orden del pago */
  orden: number;
}

// ========== VENTA ==========
export interface Venta {
  /** ID de la venta */
  id: string;
  
  /** Código único de venta */
  codigoVenta: string;
  
  /** ID de la sesión de caja (opcional) */
  cashSessionId?: string;
  
  /** ID del cliente (opcional) */
  clienteId?: string;
  
  /** ID del almacén */
  almacenId: string;
  
  /** ID del usuario vendedor */
  usuarioId: string;
  
  /** Fecha de emisión */
  fechaEmision: string; // ISO 8601
  
  /** Tipo de comprobante */
  tipoComprobante: TipoComprobante;
  
  /** Forma de pago principal */
  formaPago: FormaPago;
  
  /** Subtotal sin IGV */
  subtotal: number;
  
  /** Monto del IGV */
  igv: number;
  
  /** Total a pagar */
  total: number;
  
  /** Estado de la venta */
  estado: EstadoVenta;
  
  /** Observaciones */
  observaciones?: string;
  
  // ========== TRACKING DE PAGO ==========
  /** Monto recibido del cliente */
  montoRecibido?: number;
  
  /** Monto de cambio devuelto */
  montoCambio?: number;
  
  /** Referencia de pago (Nro. Operación, etc.) */
  referenciaPago?: string;
  
  /** Fecha de pago confirmado */
  fechaPago?: string;
  
  // ========== PAGOS MÚLTIPLES ==========
  /** Lista de pagos (opcional) */
  payments?: PagoVenta[];
  
  // ========== NOTAS DE CRÉDITO ==========
  /** Monto total de notas de crédito aplicadas */
  montoNotaCredito?: number;
  
  /** Monto efectivo después de NC */
  montoEfectivo?: number;
  
  /** Indicador de si tiene NC aplicada */
  tieneNotaCredito?: boolean;
  
  /** Notas de crédito asociadas (solo en detalle) */
  creditNotes?: NotaCredito[];
  
  // ========== ITEMS Y RELACIONES ==========
  /** Items de la venta */
  items: ItemVenta[];
  
  /** Fecha de creación */
  createdAt: string;
  
  /** Fecha de actualización */
  updatedAt: string;
  
  /** Información del cliente (nested) */
  cliente?: any; // TODO: Definir tipo Cliente
  
  /** Información del almacén (nested) */
  almacen?: any; // TODO: Definir tipo Almacén
}

// ========== CREAR VENTA (Request) ==========
export interface CrearVentaRequest {
  /** ID de la sesión de caja (opcional) */
  cashSessionId?: string;
  
  /** ID del cliente (opcional) */
  clienteId?: string;
  
  /** ID del almacén */
  almacenId: string;
  
  /** Tipo de comprobante */
  tipoComprobante: TipoComprobante;
  
  /** Forma de pago (opcional si usa payments) */
  formaPago?: FormaPago;
  
  /** Incluye IGV (opcional, default true) */
  incluyeIGV?: boolean;
  
  /** ID del comprobante específico a usar (opcional) */
  comprobanteId?: string;
  
  /** Pagos múltiples (opcional) */
  payments?: Array<{
    metodoPago: TipoMetodoPago;
    monto: number;
    referencia?: string;
    observaciones?: string;
  }>;
  
  /** Items de la venta */
  items: Array<{
    productId: string;
    nombreProducto?: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  
  /** Observaciones */
  observaciones?: string;
}

// ========== NOTA DE CRÉDITO ==========
export interface NotaCredito {
  /** ID de la nota de crédito */
  id: string;
  
  /** Código de la nota de crédito */
  codigoVenta: string;
  
  /** ID de la venta origen */
  saleOriginId: string;
  
  /** Fecha de emisión */
  fechaEmision: string;
  
  /** Motivo de la nota de crédito */
  creditNoteReason: string;
  
  /** Descripción adicional */
  creditNoteDescription?: string;
  
  /** Total de la NC */
  total: number;
  
  /** Subtotal de la NC */
  subtotal: number;
  
  /** IGV de la NC */
  igv: number;
  
  /** Items de la NC */
  items: ItemVenta[];
  
  /** Usuario que emitió la NC */
  usuario?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  
  /** Venta origen (nested) */
  saleOrigin?: {
    id: string;
    codigoVenta: string;
    total: number;
  };
}

// ========== CREAR NOTA DE CRÉDITO (Request) ==========
export interface CrearNotaCreditoRequest {
  /** ID de la venta a la que se aplica la NC */
  saleId: string;
  
  /** Motivo de la NC */
  creditNoteReason: string;
  
  /** Descripción adicional */
  descripcion?: string;
  
  /** Items a devolver */
  items: Array<{
    saleItemId: string;
    cantidad: number;
  }>;
  
  /** Método de pago para devolución */
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Vale';
  
  /** ID de la sesión de caja (opcional) */
  cashSessionId?: string;
}

// ========== COTIZACIÓN ==========
export interface Cotizacion {
  /** ID de la cotización */
  id: string;
  
  /** Código único de cotización */
  codigoCotizacion: string;
  
  /** ID del cliente (opcional) */
  clienteId?: string;
  
  /** ID del almacén */
  almacenId: string;
  
  /** ID del usuario */
  usuarioId: string;
  
  /** Fecha de emisión */
  fechaEmision: string;
  
  /** Válido hasta */
  validoHasta: string;
  
  /** Tipo de comprobante esperado */
  tipoComprobante: TipoComprobante;
  
  /** Subtotal */
  subtotal: number;
  
  /** IGV */
  igv: number;
  
  /** Total */
  total: number;
  
  /** Estado */
  estado: 'Vigente' | 'Convertida' | 'Vencida' | 'Cancelada';
  
  /** Observaciones */
  observaciones?: string;
  
  /** Items */
  items: ItemVenta[];
  
  /** Fecha de creación */
  createdAt: string;
  
  /** Fecha de actualización */
  updatedAt: string;
}

// ========== FILTROS ==========
export interface VentasFilters {
  /** Estado de la venta */
  estado?: EstadoVenta;
  
  /** Fecha inicio */
  fechaInicio?: string;
  
  /** Fecha fin */
  fechaFin?: string;
  
  /** ID del cliente */
  clienteId?: string;
  
  /** Tipo de comprobante */
  tipoComprobante?: TipoComprobante;
  
  /** Forma de pago */
  formaPago?: FormaPago;
  
  /** ID de la sesión de caja */
  cashSessionId?: string;
  
  /** Página actual */
  page?: number;
  
  /** Items por página */
  limit?: number;
}

export interface SesionesCajaFilters {
  /** Estado de la sesión */
  estado?: EstadoCaja;
  
  /** Fecha inicio */
  fechaInicio?: string;
  
  /** Fecha fin */
  fechaFin?: string;
  
  /** ID del usuario */
  userId?: string;
  
  /** Página actual */
  page?: number;
  
  /** Items por página */
  limit?: number;
}

// ========== RESPUESTAS API ==========
export interface VentasResponse {
  data: Venta[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface SesionesCajaResponse {
  data: SesionCaja[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
