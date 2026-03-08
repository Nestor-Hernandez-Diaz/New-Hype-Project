/**
 * REAL API - MÓDULO DE VENTAS
 *
 * Reemplaza ventasApi.ts (mock) con llamadas reales al backend via apiService.
 * Incluye: Cajas Registradoras, Sesiones de Caja, Movimientos, Ventas,
 * Notas de Crédito y Cotizaciones.
 */

import { apiService } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

import {
  EstadoCaja,
  EstadoVenta,
} from '@monorepo/shared-types';
import type {
  Venta,
  CrearVentaRequest,
  CajaRegistradora,
  SesionCaja,
  MovimientoCaja,
  ResumenCaja,
  NotaCredito,
  CrearNotaCreditoRequest,
  Cotizacion,
  VentasFilters,
  SesionesCajaFilters,
  TipoMovimientoCaja,
  ItemVenta,
  PagoVenta,
} from '@monorepo/shared-types';

// ============= TIPOS BACKEND =============

interface BackendCajaRegistradora {
  id: number;
  codigo: string;
  nombre: string;
  ubicacion?: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendSesionCaja {
  id: number;
  cajaRegistradoraId: number;
  cajaRegistradoraNombre?: string;
  usuarioId: number;
  usuarioNombre?: string;
  fechaApertura: string;
  fechaCierre?: string;
  montoApertura: number;
  montoCierre?: number;
  totalVentas: number;
  diferencia?: number;
  estado: string;
  observaciones?: string;
  movimientos?: BackendMovimientoCaja[];
  createdAt: string;
}

interface BackendMovimientoCaja {
  id: number;
  sesionCajaId: number;
  tipo: string;
  monto: number;
  motivo: string;
  descripcion?: string;
  usuarioId: number;
  createdAt: string;
}

interface BackendDetalleVenta {
  id: number;
  productoId: number;
  nombreProducto: string;
  codigoProducto?: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  subtotal: number;
}

interface BackendPagoVenta {
  id: number;
  metodoPagoId?: number;
  metodoPagoNombre?: string;
  monto: number;
  referencia?: string;
  observaciones?: string;
  orden?: number;
  createdAt?: string;
}

interface BackendVenta {
  id: number;
  codigoVenta: string;
  sesionCajaId?: number;
  clienteId?: number;
  clienteNombre?: string;
  clienteTipoDocumento?: string;
  clienteNumeroDocumento?: string;
  clienteDireccion?: string;
  almacenId: number;
  almacenNombre?: string;
  usuarioId: number;
  fechaEmision: string;
  tipoComprobante: string;
  serie?: string;
  numero?: string;
  subtotal: number;
  igv: number;
  descuento?: number;
  total: number;
  montoRecibido?: number;
  montoCambio?: number;
  estado: string;
  fechaPago?: string;
  observaciones?: string;
  detalles?: BackendDetalleVenta[];
  pagos?: BackendPagoVenta[];
  createdAt: string;
  // Campos de Notas de Crédito (agregados por backend)
  tieneNotaCredito?: boolean;
  montoNotaCredito?: number;
  notasCredito?: BackendNotaCredito[];
}

interface BackendNotaCredito {
  id: number;
  codigo: string;
  ventaOrigenId: number;
  serie?: string;
  numero?: string;
  motivoSunat?: string;
  tipo?: string;
  descripcion?: string;
  subtotal: number;
  igv: number;
  total: number;
  metodoDevolucion?: string;
  fechaReembolso?: string;
  usuarioId: number;
  estado?: string;
  detalles?: BackendDetalleNotaCredito[];
  createdAt: string;
}

interface BackendDetalleNotaCredito {
  id: number;
  productoId: number;
  detalleVentaId?: number;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface BackendCotizacion {
  id: number;
  codigo: string;
  clienteId?: number;
  almacenId: number;
  usuarioId: number;
  fechaEmision: string;
  validoHasta?: string;
  tipoComprobante: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: string;
  observaciones?: string;
  detalles?: BackendDetalleVenta[];
  createdAt: string;
  updatedAt?: string;
}

// ============= MAPEO BACKEND -> FRONTEND =============

function mapBackendCaja(b: BackendCajaRegistradora): CajaRegistradora {
  return {
    id: String(b.id),
    codigo: b.codigo,
    nombre: b.nombre,
    ubicacion: b.ubicacion,
    activo: b.estado,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

function mapBackendSesion(b: BackendSesionCaja): SesionCaja {
  return {
    id: String(b.id),
    cashRegisterId: String(b.cajaRegistradoraId),
    userId: String(b.usuarioId),
    fechaApertura: b.fechaApertura,
    fechaCierre: b.fechaCierre,
    montoApertura: Number(b.montoApertura) || 0,
    montoCierre: b.montoCierre != null ? Number(b.montoCierre) : undefined,
    totalVentas: Number(b.totalVentas) || 0,
    diferencia: b.diferencia != null ? Number(b.diferencia) : undefined,
    estado: b.estado?.toUpperCase() === 'ABIERTA' ? EstadoCaja.ABIERTA : EstadoCaja.CERRADA,
    observaciones: b.observaciones,
    createdAt: b.createdAt,
    updatedAt: b.createdAt,
  };
}

function mapBackendMovimiento(b: BackendMovimientoCaja): MovimientoCaja {
  return {
    id: String(b.id),
    cashSessionId: String(b.sesionCajaId),
    tipo: b.tipo as TipoMovimientoCaja,
    monto: Number(b.monto) || 0,
    motivo: b.motivo,
    descripcion: b.descripcion,
    usuarioId: String(b.usuarioId),
    createdAt: b.createdAt,
    updatedAt: b.createdAt,
  };
}

function mapBackendDetalle(b: BackendDetalleVenta): ItemVenta {
  return {
    id: String(b.id),
    productId: String(b.productoId),
    nombreProducto: b.nombreProducto || '',
    codigoProducto: b.codigoProducto || '',
    cantidad: b.cantidad,
    precioUnitario: Number(b.precioUnitario) || 0,
    descuento: Number(b.descuento) || 0,
    subtotal: Number(b.subtotal) || 0,
  };
}

function mapBackendPago(b: BackendPagoVenta): PagoVenta {
  // Resolve payment method name from backend or known IDs
  const METODO_PAGO_NAMES: Record<number, string> = {
    1: 'Efectivo',
    2: 'Yape',
    3: 'Plin',
    4: 'Transferencia',
    5: 'Tarjeta',
  };
  const metodoPagoName = b.metodoPagoNombre
    || (b.metodoPagoId ? METODO_PAGO_NAMES[b.metodoPagoId] : undefined)
    || 'Efectivo';

  return {
    id: String(b.id),
    metodoPago: metodoPagoName as any,
    metodoPagoId: b.metodoPagoId ? String(b.metodoPagoId) : undefined,
    monto: Number(b.monto) || 0,
    referencia: b.referencia,
    observaciones: b.observaciones,
    orden: b.orden ?? 0,
  } as PagoVenta;
}

function mapBackendVenta(b: BackendVenta): Venta {
  // Mapear notas de crédito si existen (vienen del backend en getById)
  const creditNotes = (b.notasCredito || []).map(nc => mapBackendNotaCredito(nc));

  return {
    id: String(b.id),
    codigoVenta: b.codigoVenta,
    cashSessionId: b.sesionCajaId != null ? String(b.sesionCajaId) : undefined,
    clienteId: b.clienteId != null ? String(b.clienteId) : undefined,
    cliente: b.clienteNombre ? {
      id: b.clienteId != null ? String(b.clienteId) : '',
      nombres: b.clienteNombre,
      apellidos: '',
      tipoDocumento: (b.clienteTipoDocumento || '') as any,
      numeroDocumento: b.clienteNumeroDocumento || '',
      razonSocial: b.clienteNombre,
      direccion: b.clienteDireccion || '',
    } : undefined,
    almacenId: String(b.almacenId),
    usuarioId: String(b.usuarioId),
    fechaEmision: b.fechaEmision,
    tipoComprobante: b.tipoComprobante as any,
    formaPago: 'Efectivo' as any, // Default; backend uses payments array
    subtotal: Number(b.subtotal) || 0,
    igv: Number(b.igv) || 0,
    total: Number(b.total) || 0,
    estado: (() => {
      const e = b.estado?.toUpperCase();
      if (e === 'COMPLETADA') return EstadoVenta.COMPLETADA;
      if (e === 'CANCELADA') return EstadoVenta.CANCELADA;
      return EstadoVenta.PENDIENTE;
    })(),
    observaciones: b.observaciones,
    montoRecibido: b.montoRecibido != null ? Number(b.montoRecibido) : undefined,
    montoCambio: b.montoCambio != null ? Number(b.montoCambio) : undefined,
    fechaPago: b.fechaPago,
    items: (b.detalles || []).map(mapBackendDetalle),
    payments: (b.pagos || []).map(mapBackendPago),
    // Campos de Notas de Crédito
    tieneNotaCredito: b.tieneNotaCredito || creditNotes.length > 0,
    montoNotaCredito: b.montoNotaCredito != null ? Number(b.montoNotaCredito) :
      (creditNotes.length > 0 ? creditNotes.reduce((sum, nc) => sum + nc.total, 0) : undefined),
    creditNotes: creditNotes.length > 0 ? creditNotes : undefined,
    createdAt: b.createdAt,
    updatedAt: b.createdAt,
  };
}

function mapBackendNotaCredito(b: BackendNotaCredito, ventaOriginal?: BackendVenta): NotaCredito {
  // Mapear metodoDevolucion backend a frontend
  const metodoMap: Record<string, string> = {
    'EFECTIVO': 'Efectivo',
    'TRANSFERENCIA': 'Transferencia',
    'VALE': 'Vale',
  };
  // Mapear estado backend a frontend
  const estadoMap: Record<string, string> = {
    'PENDIENTE': 'Pendiente',
    'APLICADA': 'Aplicada',
    'CANCELADA': 'Cancelada',
  };

  return {
    id: String(b.id),
    codigoVenta: b.codigo,
    saleOriginId: String(b.ventaOrigenId),
    fechaEmision: b.createdAt,
    creditNoteReason: b.motivoSunat || b.tipo || '',
    creditNoteDescription: b.descripcion,
    creditNoteStatus: b.estado ? (estadoMap[b.estado] || b.estado) : undefined,
    creditNotePaymentMethod: b.metodoDevolucion ? (metodoMap[b.metodoDevolucion] || b.metodoDevolucion) : undefined,
    total: Number(b.total) || 0,
    subtotal: Number(b.subtotal) || 0,
    igv: Number(b.igv) || 0,
    items: (b.detalles || []).map(d => ({
      id: String(d.id),
      productId: String(d.productoId),
      nombreProducto: d.nombreProducto || '',
      cantidad: d.cantidad,
      precioUnitario: Number(d.precioUnitario) || 0,
      subtotal: Number(d.subtotal) || 0,
    })),
    usuario: {
      id: String(b.usuarioId),
      firstName: '',
      lastName: '',
    },
    saleOrigin: ventaOriginal
      ? {
          id: String(ventaOriginal.id),
          codigoVenta: ventaOriginal.codigoVenta,
          total: Number(ventaOriginal.total) || 0,
        }
      : undefined,
  };
}

function mapBackendCotizacion(b: BackendCotizacion): Cotizacion {
  return {
    id: String(b.id),
    codigoCotizacion: b.codigo,
    clienteId: b.clienteId != null ? String(b.clienteId) : undefined,
    almacenId: String(b.almacenId),
    usuarioId: String(b.usuarioId),
    fechaEmision: b.fechaEmision,
    validoHasta: b.validoHasta || '',
    tipoComprobante: b.tipoComprobante as any,
    subtotal: Number(b.subtotal) || 0,
    igv: Number(b.igv) || 0,
    total: Number(b.total) || 0,
    estado: b.estado as any,
    observaciones: b.observaciones,
    items: (b.detalles || []).map(mapBackendDetalle),
    createdAt: b.createdAt,
    updatedAt: b.updatedAt || b.createdAt,
  };
}

// ============= HELPERS =============

function extractArray<T>(res: ApiResponse<T[] | any>): T[] {
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray((res.data as any).content)) return (res.data as any).content;
  if (res.data && Array.isArray((res.data as any).rows)) return (res.data as any).rows;
  return [];
}

// ============= API CAJAS REGISTRADORAS =============

export const getCajasRegistradoras = async (): Promise<CajaRegistradora[]> => {
  const res: ApiResponse<BackendCajaRegistradora[]> = await apiService.get(
    '/configuracion/cajas-registradoras'
  );

  if (!res.success) {
    throw new Error(res.message || res.error || 'Error al cargar cajas registradoras');
  }

  return extractArray<BackendCajaRegistradora>(res).map(mapBackendCaja);
};

export const crearCajaRegistradora = async (data: {
  codigo: string;
  nombre: string;
  ubicacion?: string;
}): Promise<CajaRegistradora> => {
  const res: ApiResponse<BackendCajaRegistradora> = await apiService.post(
    '/configuracion/cajas-registradoras',
    data
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al crear caja registradora');
  }

  return mapBackendCaja(res.data);
};

export const actualizarCajaRegistradora = async (
  id: string,
  data: { codigo: string; nombre: string; ubicacion?: string }
): Promise<CajaRegistradora> => {
  const res: ApiResponse<BackendCajaRegistradora> = await apiService.put(
    `/configuracion/cajas-registradoras/${id}`,
    data
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al actualizar caja registradora');
  }

  return mapBackendCaja(res.data);
};

export const cambiarEstadoCajaRegistradora = async (
  id: string
): Promise<CajaRegistradora> => {
  const res: ApiResponse<BackendCajaRegistradora> = await apiService.patch(
    `/configuracion/cajas-registradoras/${id}/estado`,
    {}
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al cambiar estado de caja registradora');
  }

  return mapBackendCaja(res.data);
};

// ============= API SESIONES DE CAJA =============

export const getSesionesCaja = async (
  filters?: SesionesCajaFilters
): Promise<SesionCaja[]> => {
  const params = new URLSearchParams();
  if (filters?.estado) {
    // Backend expects uppercase enum values (ABIERTA, CERRADA)
    const estadoUpper = filters.estado.toUpperCase();
    params.append('estado', estadoUpper);
  }
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters?.userId) params.append('usuarioId', filters.userId);

  const qs = params.toString();
  const endpoint = qs ? `/caja/sesiones?${qs}` : '/caja/sesiones';
  const res: ApiResponse<BackendSesionCaja[]> = await apiService.get(endpoint);

  if (!res.success) {
    throw new Error(res.message || res.error || 'Error al cargar sesiones de caja');
  }

  return extractArray<BackendSesionCaja>(res).map(mapBackendSesion);
};

export const getSesionCajaById = async (sessionId: string): Promise<SesionCaja> => {
  const res: ApiResponse<BackendSesionCaja> = await apiService.get(
    `/caja/sesiones/${sessionId}`
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Sesión de caja no encontrada');
  }

  return mapBackendSesion(res.data);
};

export const abrirSesionCaja = async (
  cashRegisterId: string,
  montoApertura: number,
  observaciones?: string
): Promise<SesionCaja> => {
  const res: ApiResponse<BackendSesionCaja> = await apiService.post('/caja/sesiones', {
    cajaRegistradoraId: Number(cashRegisterId),
    montoApertura,
    observaciones,
  });

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al abrir sesión de caja');
  }

  return mapBackendSesion(res.data);
};

export const cerrarSesionCaja = async (
  sessionId: string,
  montoCierre: number,
  observaciones?: string
): Promise<SesionCaja> => {
  const res: ApiResponse<BackendSesionCaja> = await apiService.patch(
    `/caja/sesiones/${sessionId}/cerrar`,
    { montoCierre, observaciones }
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al cerrar sesión de caja');
  }

  return mapBackendSesion(res.data);
};

// ============= API MOVIMIENTOS DE CAJA =============

export const getMovimientosCaja = async (
  cashSessionId: string
): Promise<MovimientoCaja[]> => {
  const res: ApiResponse<BackendMovimientoCaja[]> = await apiService.get(
    `/caja/sesiones/${cashSessionId}/movimientos`
  );

  if (!res.success) {
    throw new Error(res.message || res.error || 'Error al cargar movimientos de caja');
  }

  const movimientos = Array.isArray(res.data) ? res.data : [];
  return movimientos.map(mapBackendMovimiento);
};

export const getResumenCaja = async (sessionId: string): Promise<ResumenCaja> => {
  // Use the dedicated endpoint that returns session with embedded movimientos
  const res: ApiResponse<BackendSesionCaja> = await apiService.get(
    `/caja/sesiones/${sessionId}`
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al cargar resumen de caja');
  }

  const sesion = res.data;
  const movimientos = sesion.movimientos || [];

  const montoApertura = Number(sesion.montoApertura) || 0;
  const totalVentas = Number(sesion.totalVentas) || 0;
  const totalIngresos = movimientos
    .filter(m => m.tipo === 'INGRESO')
    .reduce((sum, m) => sum + (Number(m.monto) || 0), 0);
  const totalEgresos = movimientos
    .filter(m => m.tipo === 'EGRESO')
    .reduce((sum, m) => sum + (Number(m.monto) || 0), 0);

  return {
    montoApertura,
    totalVentas,
    totalIngresos,
    totalEgresos,
    totalEsperado: montoApertura + totalVentas + totalIngresos - totalEgresos,
    movements: movimientos.map(mapBackendMovimiento),
  };
};

export const crearMovimientoCaja = async (
  tipo: TipoMovimientoCaja,
  data: {
    cashSessionId: string;
    monto: number;
    motivo: string;
    descripcion?: string;
  }
): Promise<MovimientoCaja> => {
  const res: ApiResponse<BackendMovimientoCaja> = await apiService.post(
    `/caja/sesiones/${data.cashSessionId}/movimientos`,
    {
      tipo,
      monto: data.monto,
      motivo: data.motivo,
      descripcion: data.descripcion,
    }
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al crear movimiento de caja');
  }

  return mapBackendMovimiento(res.data);
};

export const eliminarMovimientoCaja = async (movementId: string): Promise<void> => {
  const res: ApiResponse<void> = await apiService.delete(
    `/caja/movimientos/${movementId}`
  );

  if (!res.success) {
    throw new Error(res.message || res.error || 'Error al eliminar movimiento de caja');
  }
};

// ============= API VENTAS =============

export const getVentas = async (filters?: VentasFilters): Promise<Venta[]> => {
  const params = new URLSearchParams();
  if (filters?.estado) params.append('estado', filters.estado);
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters?.clienteId) params.append('clienteId', filters.clienteId);
  if (filters?.tipoComprobante) params.append('tipoComprobante', filters.tipoComprobante);
  if (filters?.formaPago) params.append('formaPago', filters.formaPago);
  if (filters?.cashSessionId) params.append('sesionCajaId', filters.cashSessionId);

  const qs = params.toString();
  const endpoint = qs ? `/ventas?${qs}` : '/ventas';
  const res: ApiResponse<BackendVenta[]> = await apiService.get(endpoint);

  if (!res.success) {
    throw new Error(res.message || res.error || 'Error al cargar ventas');
  }

  return extractArray<BackendVenta>(res).map(mapBackendVenta);
};

export const getVentaById = async (saleId: string): Promise<Venta> => {
  const res: ApiResponse<BackendVenta> = await apiService.get(`/ventas/${saleId}`);

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Venta no encontrada');
  }

  return mapBackendVenta(res.data);
};

export const crearVenta = async (ventaData: CrearVentaRequest): Promise<Venta> => {
  // Build backend request body
  const body: Record<string, unknown> = {
    almacenId: Number(ventaData.almacenId),
    tipoComprobante: ventaData.tipoComprobante?.toUpperCase().replace(/\s+/g, '_') || 'BOLETA',
    observaciones: ventaData.observaciones,
    items: ventaData.items.map(item => ({
      productoId: Number(item.productId),
      nombreProducto: item.nombreProducto,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
    })),
  };

  if (ventaData.cashSessionId) body.sesionCajaId = Number(ventaData.cashSessionId);
  if (ventaData.clienteId) body.clienteId = Number(ventaData.clienteId);
  if (ventaData.comprobanteId) body.serieComprobanteId = Number(ventaData.comprobanteId);
  if (ventaData.incluyeIGV !== undefined) body.incluyeIGV = ventaData.incluyeIGV;

  if (ventaData.payments && ventaData.payments.length > 0) {
    body.pagos = ventaData.payments.map((p, i) => ({
      metodoPago: p.metodoPago,
      monto: p.monto,
      referencia: p.referencia,
      observaciones: p.observaciones,
      orden: i + 1,
    }));
  } else if (ventaData.formaPago) {
    body.formaPago = ventaData.formaPago;
  }

  const res: ApiResponse<BackendVenta> = await apiService.post('/ventas', body);

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al crear venta');
  }

  return mapBackendVenta(res.data);
};

export const confirmarPagoVenta = async (
  saleId: string,
  paymentData: {
    montoRecibido: number;
    montoCambio?: number;
    referenciaPago?: string;
    pagos?: Array<{
      metodoPagoId: string | number;
      monto: number;
      referencia?: string;
    }>;
  }
): Promise<Venta> => {
  const body: Record<string, unknown> = {
    montoRecibido: paymentData.montoRecibido,
  };

  if (paymentData.pagos && paymentData.pagos.length > 0) {
    body.pagos = paymentData.pagos.map(p => ({
      metodoPagoId: Number(p.metodoPagoId),
      monto: p.monto,
      referencia: p.referencia || undefined,
    }));
  }

  const res: ApiResponse<BackendVenta> = await apiService.post(
    `/ventas/${saleId}/confirmar-pago`,
    body
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al confirmar pago');
  }

  return mapBackendVenta(res.data);
};

export const completarVenta = async (saleId: string): Promise<Venta> => {
  const res: ApiResponse<BackendVenta> = await apiService.patch(
    `/ventas/${saleId}/completar`,
    {}
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al completar venta');
  }

  return mapBackendVenta(res.data);
};

export const cancelarVenta = async (
  saleId: string,
  motivo: string
): Promise<Venta> => {
  const res: ApiResponse<BackendVenta> = await apiService.patch(
    `/ventas/${saleId}/cancelar`,
    { motivo }
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al cancelar venta');
  }

  return mapBackendVenta(res.data);
};

// ============= API NOTAS DE CRÉDITO =============

export const crearNotaCredito = async (
  data: CrearNotaCreditoRequest
): Promise<NotaCredito> => {
  // Map frontend reason to backend tipo
  const tipo = data.creditNoteReason === 'DevolucionTotal' || data.creditNoteReason === 'DevolucionParcial'
    ? 'DEVOLUCION'
    : 'ANULACION';

  // Auto-generate serie/numero for credit notes
  const serie = 'NC01';
  const numero = String(Date.now()).slice(-8);

  const body = {
    ventaOrigenId: Number(data.saleId),
    serie,
    numero,
    motivoSunat: data.creditNoteReason,
    tipo,
    descripcion: data.descripcion,
    metodoDevolucion: data.paymentMethod === 'Efectivo' ? 'EFECTIVO'
      : data.paymentMethod === 'Transferencia' ? 'TRANSFERENCIA' : 'VALE',
    sesionCajaId: data.cashSessionId ? Number(data.cashSessionId) : undefined,
    items: data.items.map(item => ({
      detalleVentaId: Number(item.saleItemId),
      productoId: Number(item.productoId),
      cantidad: item.cantidad,
    })),
  };

  const res: ApiResponse<BackendNotaCredito> = await apiService.post(
    '/notas-credito',
    body
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al crear nota de crédito');
  }

  return mapBackendNotaCredito(res.data);
};

export const getNotasCreditoBySale = async (
  saleId: string
): Promise<NotaCredito[]> => {
  // Usar el endpoint correcto del NotaCreditoController con filtro ventaOrigenId
  const res: ApiResponse<BackendNotaCredito[]> = await apiService.get(
    `/notas-credito?ventaOrigenId=${saleId}`
  );

  if (!res.success) {
    return [];
  }

  return extractArray<BackendNotaCredito>(res).map(nc => mapBackendNotaCredito(nc));
};

// ============= API COTIZACIONES =============

export const getCotizaciones = async (): Promise<Cotizacion[]> => {
  try {
    const res: ApiResponse<BackendCotizacion[]> = await apiService.get('/cotizaciones');

    if (!res.success) {
      return [];
    }

    return extractArray<BackendCotizacion>(res).map(mapBackendCotizacion);
  } catch {
    // Endpoint may not exist in backend - gracefully return empty
    return [];
  }
};

export const crearCotizacion = async (
  data: CrearVentaRequest
): Promise<Cotizacion> => {
  const body: Record<string, unknown> = {
    almacenId: Number(data.almacenId),
    tipoComprobante: data.tipoComprobante,
    observaciones: data.observaciones,
    items: data.items.map(item => ({
      productoId: Number(item.productId),
      nombreProducto: item.nombreProducto,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
    })),
  };

  if (data.clienteId) body.clienteId = Number(data.clienteId);

  const res: ApiResponse<BackendCotizacion> = await apiService.post(
    '/cotizaciones',
    body
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al crear cotización');
  }

  return mapBackendCotizacion(res.data);
};
