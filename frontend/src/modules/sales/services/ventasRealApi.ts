/**
 * REAL API - MÓDULO DE VENTAS
 *
 * Reemplaza ventasApi.ts (mock) con llamadas reales al backend via apiService.
 * Incluye: Cajas Registradoras, Sesiones de Caja, Movimientos, Ventas,
 * Notas de Crédito y Cotizaciones.
 */

import { apiService } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

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
  EstadoVenta,
  EstadoCaja,
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
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  subtotal: number;
}

interface BackendPagoVenta {
  id: number;
  metodoPagoId?: number;
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
    estado: b.estado as EstadoCaja,
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
    cantidad: b.cantidad,
    precioUnitario: Number(b.precioUnitario) || 0,
    subtotal: Number(b.subtotal) || 0,
  };
}

function mapBackendPago(b: BackendPagoVenta): PagoVenta {
  return {
    id: String(b.id),
    metodoPago: '' as any, // Backend returns metodoPagoId, not the name
    monto: Number(b.monto) || 0,
    referencia: b.referencia,
    observaciones: b.observaciones,
    orden: b.orden ?? 0,
  };
}

function mapBackendVenta(b: BackendVenta): Venta {
  return {
    id: String(b.id),
    codigoVenta: b.codigoVenta,
    cashSessionId: b.sesionCajaId != null ? String(b.sesionCajaId) : undefined,
    clienteId: b.clienteId != null ? String(b.clienteId) : undefined,
    almacenId: String(b.almacenId),
    usuarioId: String(b.usuarioId),
    fechaEmision: b.fechaEmision,
    tipoComprobante: b.tipoComprobante as any,
    formaPago: 'Efectivo' as any, // Default; backend uses payments array
    subtotal: Number(b.subtotal) || 0,
    igv: Number(b.igv) || 0,
    total: Number(b.total) || 0,
    estado: b.estado as EstadoVenta,
    observaciones: b.observaciones,
    montoRecibido: b.montoRecibido != null ? Number(b.montoRecibido) : undefined,
    montoCambio: b.montoCambio != null ? Number(b.montoCambio) : undefined,
    fechaPago: b.fechaPago,
    items: (b.detalles || []).map(mapBackendDetalle),
    payments: (b.pagos || []).map(mapBackendPago),
    createdAt: b.createdAt,
    updatedAt: b.createdAt,
  };
}

function mapBackendNotaCredito(b: BackendNotaCredito, ventaOriginal?: BackendVenta): NotaCredito {
  return {
    id: String(b.id),
    codigoVenta: b.codigo,
    saleOriginId: String(b.ventaOrigenId),
    fechaEmision: b.createdAt,
    creditNoteReason: b.motivoSunat || b.tipo || '',
    creditNoteDescription: b.descripcion,
    total: Number(b.total) || 0,
    subtotal: Number(b.subtotal) || 0,
    igv: Number(b.igv) || 0,
    items: (b.detalles || []).map(d => ({
      id: String(d.id),
      productId: String(d.productoId),
      nombreProducto: '',
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

// ============= API SESIONES DE CAJA =============

export const getSesionesCaja = async (
  filters?: SesionesCajaFilters
): Promise<SesionCaja[]> => {
  const params = new URLSearchParams();
  if (filters?.estado) params.append('estado', filters.estado);
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

  return extractArray<BackendMovimientoCaja>(res).map(mapBackendMovimiento);
};

export const getResumenCaja = async (sessionId: string): Promise<ResumenCaja> => {
  const res: ApiResponse<any> = await apiService.get(
    `/caja/sesiones/${sessionId}/resumen`
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al cargar resumen de caja');
  }

  const d = res.data;
  return {
    montoApertura: Number(d.montoApertura) || 0,
    totalVentas: Number(d.totalVentas) || 0,
    totalIngresos: Number(d.totalIngresos) || 0,
    totalEgresos: Number(d.totalEgresos) || 0,
    totalEsperado: Number(d.totalEsperado) || 0,
    movements: Array.isArray(d.movimientos)
      ? d.movimientos.map(mapBackendMovimiento)
      : undefined,
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
    '/caja/movimientos',
    {
      sesionCajaId: Number(data.cashSessionId),
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
    tipoComprobante: ventaData.tipoComprobante,
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
  }
): Promise<Venta> => {
  const res: ApiResponse<BackendVenta> = await apiService.post(
    `/ventas/${saleId}/confirmar-pago`,
    paymentData
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
  const body = {
    ventaId: Number(data.saleId),
    motivoSunat: data.creditNoteReason,
    descripcion: data.descripcion,
    metodoDevolucion: data.paymentMethod,
    sesionCajaId: data.cashSessionId ? Number(data.cashSessionId) : undefined,
    items: data.items.map(item => ({
      detalleVentaId: Number(item.saleItemId),
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
  const res: ApiResponse<BackendNotaCredito[]> = await apiService.get(
    `/ventas/${saleId}/notas-credito`
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
