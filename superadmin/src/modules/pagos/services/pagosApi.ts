// ============================================================================
// PAGOS SERVICE — Mock stub (Endpoints 2.5, 2.6, 2.8)
// TODO: Reemplazar mocks por fetch() reales al backend
// ============================================================================

import { simulateDelay } from '../../../services/apiConfig';
import type {
  EstadoPagosResumen,
  SuscripcionDetallePago,
  Factura,
  PagoManualPayload,
  ApiResponse,
} from '../../../types/api';

// ── MOCK DATA ───────────────────────────────────────────────────────────────

const MOCK_RESUMEN: EstadoPagosResumen = {
  totalSuscripciones: 14,
  alDia: 9,
  porVencer: 3,
  vencidas: 2,
};

const MOCK_DETALLE: SuscripcionDetallePago[] = [
  {
    id: 1,
    tenantId: 1,
    tenantNombre: 'Boutique Fashion María',
    plan: 'Plan Pro',
    estado: 'al_dia',
    fechaUltimoPago: '2026-02-15',
    fechaProximoPago: '2026-03-15',
    montoPendiente: 0,
    montoUltimoPago: 99.00,
    diasRestantes: 14,
    metodoPago: 'Transferencia',
  },
  {
    id: 2,
    tenantId: 2,
    tenantNombre: 'Urban Style Store',
    plan: 'Plan Enterprise',
    estado: 'al_dia',
    fechaUltimoPago: '2026-02-01',
    fechaProximoPago: '2026-03-01',
    montoPendiente: 0,
    montoUltimoPago: 249.00,
    diasRestantes: 0,
    metodoPago: 'Yape',
  },
  {
    id: 3,
    tenantId: 3,
    tenantNombre: 'Trendy Kids',
    plan: 'Plan Básico',
    estado: 'por_vencer',
    fechaUltimoPago: '2026-02-20',
    fechaProximoPago: '2026-03-06',
    montoPendiente: 49.00,
    montoUltimoPago: 49.00,
    diasRestantes: 5,
    metodoPago: 'Plin',
  },
  {
    id: 4,
    tenantId: 4,
    tenantNombre: 'Elegance Plus',
    plan: 'Plan Pro',
    estado: 'vencida',
    fechaUltimoPago: '2026-01-10',
    fechaProximoPago: '2026-02-10',
    montoPendiente: 99.00,
    montoUltimoPago: 99.00,
    diasRestantes: -19,
    metodoPago: 'Transferencia',
  },
  {
    id: 5,
    tenantId: 5,
    tenantNombre: 'Sport Zone Lima',
    plan: 'Plan Pro',
    estado: 'por_vencer',
    fechaUltimoPago: '2026-02-05',
    fechaProximoPago: '2026-03-05',
    montoPendiente: 99.00,
    montoUltimoPago: 99.00,
    diasRestantes: 4,
    metodoPago: 'Yape',
  },
];

// ── 2.5 ESTADO DE PAGOS ────────────────────────────────────────────────────
export async function fetchEstadoPagos(): Promise<ApiResponse<EstadoPagosResumen>> {
  await simulateDelay();
  return { success: true, message: 'OK', data: MOCK_RESUMEN };
}

// ── 2.5 DETALLE DE PAGOS (filtrado) ────────────────────────────────────────
export async function fetchDetallePagos(filtro: string = 'todos'): Promise<SuscripcionDetallePago[]> {
  await simulateDelay();
  if (filtro === 'todos') return MOCK_DETALLE;
  return MOCK_DETALLE.filter(d => d.estado === filtro);
}

// ── 2.6 FACTURA / DETALLE DE PAGO ──────────────────────────────────────────
export async function fetchFactura(_id: number): Promise<ApiResponse<Factura>> {
  await simulateDelay();
  const mockFactura: Factura = {
    id: 1,
    tenantId: 1,
    tenantNombre: 'Boutique Fashion María',
    monto: 99.00,
    metodoPago: 'Transferencia',
    referenciaTransaccion: 'TRX-2026-001',
    cuponCodigo: null,
    descuento: 0,
    montoFinal: 99.00,
    fechaPago: '2026-02-15',
    periodo: 'Marzo 2026',
  };
  return { success: true, message: 'OK', data: mockFactura };
}

// ── 2.8 REGISTRAR PAGO MANUAL ──────────────────────────────────────────────
export async function registrarPagoManual(_payload: PagoManualPayload): Promise<ApiResponse<null>> {
  await simulateDelay();
  return { success: true, message: 'Pago registrado y fecha extendida +30 días', data: null };
}
