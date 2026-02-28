// Mock de Estado de Pagos de Suscripciones
// Endpoint: GET /api/v1/platform/suscripciones/estado-pagos
// Deriva datos desde suscripcionesApi para mantener consistencia

import { fetchSuscripciones, fetchPagosBySuscripcion, type Suscripcion } from './suscripcionesApi';

// ============================================================================
// TIPOS
// ============================================================================

export interface EstadoPagosData {
  totalSuscripciones: number;
  alDia: number;
  porVencer: number;
  vencidas: number;
}

export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface EstadoPagosResponse {
  success: boolean;
  message: string;
  data: EstadoPagosData;
  pagination: Pagination;
}

export interface SuscripcionDetallePago {
  id: string;
  sucursalNombre: string;
  plan: string;
  estado: 'al_dia' | 'por_vencer' | 'vencida';
  fechaUltimoPago: string;
  fechaProximoPago: string;
  montoPendiente: number;
  montoUltimoPago: number;
  diasRestantes: number;
  metodoPago: string;
}

// ============================================================================
// HELPERS - Derivar estado de pago desde suscripción
// ============================================================================

const HOY = new Date('2026-02-28');

function calcularDiasRestantes(fechaVencimiento: string): number {
  const venc = new Date(fechaVencimiento);
  const diff = venc.getTime() - HOY.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function derivarEstadoPago(sub: Suscripcion): 'al_dia' | 'por_vencer' | 'vencida' {
  if (sub.estado === 'vencida' || sub.estado === 'cancelada') return 'vencida';
  const dias = calcularDiasRestantes(sub.fechaVencimiento);
  if (dias <= 0) return 'vencida';
  if (dias <= 7) return 'por_vencer';
  return 'al_dia';
}

function calcularMontoPendiente(sub: Suscripcion): number {
  const estado = derivarEstadoPago(sub);
  if (estado === 'al_dia') return 0;
  if (estado === 'por_vencer') return sub.precioFinal;
  // Vencida: acumular meses pendientes
  const diasVencidos = Math.abs(calcularDiasRestantes(sub.fechaVencimiento));
  const mesesPendientes = Math.max(1, Math.ceil(diasVencidos / 30));
  const precioMensual = sub.plan.tipo === 'anual' ? sub.precioFinal / 12 : sub.precioFinal;
  return Math.round(precioMensual * mesesPendientes);
}

async function suscripcionToDetallePago(sub: Suscripcion): Promise<SuscripcionDetallePago> {
  const pagos = await fetchPagosBySuscripcion(sub.id);
  const ultimoPago = pagos.length > 0
    ? pagos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
    : null;

  return {
    id: sub.id,
    sucursalNombre: sub.sucursalNombre,
    plan: sub.plan.nombre,
    estado: derivarEstadoPago(sub),
    fechaUltimoPago: ultimoPago?.fecha ?? sub.fechaInicio,
    fechaProximoPago: sub.fechaVencimiento,
    montoPendiente: calcularMontoPendiente(sub),
    montoUltimoPago: ultimoPago?.monto ?? sub.precioFinal,
    diasRestantes: calcularDiasRestantes(sub.fechaVencimiento),
    metodoPago: sub.metodoPago,
  };
}

// ============================================================================
// API MOCK
// ============================================================================

/**
 * GET /api/v1/platform/suscripciones/estado-pagos
 * Dashboard: al día, por vencer (7d), vencidos
 */
export const fetchEstadoPagos = async (): Promise<EstadoPagosResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const suscripciones = await fetchSuscripciones();
  const detalles = await Promise.all(suscripciones.map(suscripcionToDetallePago));

  const alDia = detalles.filter(s => s.estado === 'al_dia').length;
  const porVencer = detalles.filter(s => s.estado === 'por_vencer').length;
  const vencidas = detalles.filter(s => s.estado === 'vencida').length;

  return {
    success: true,
    message: 'Estado de pagos obtenido exitosamente',
    data: {
      totalSuscripciones: detalles.length,
      alDia,
      porVencer,
      vencidas,
    },
    pagination: {
      page: 1,
      size: 10,
      totalElements: detalles.length,
      totalPages: 1,
    },
  };
};

/**
 * Obtener detalle de pagos con filtro opcional por estado
 */
export const fetchDetallePagos = async (
  filtroEstado?: 'al_dia' | 'por_vencer' | 'vencida' | 'todos'
): Promise<SuscripcionDetallePago[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const suscripciones = await fetchSuscripciones();
  const detalles = await Promise.all(suscripciones.map(suscripcionToDetallePago));

  if (!filtroEstado || filtroEstado === 'todos') {
    return detalles;
  }

  return detalles.filter(s => s.estado === filtroEstado);
};
