// ============================================================================
// PAGOS SERVICE — Endpoints 2.5, 2.6, 2.8
// Backend: /platform/suscripciones/estado-pagos, /platform/pagos
// ============================================================================

import { apiFetch } from '../../../services/apiConfig';
import type {
  EstadoPagosResumen,
  Factura,
  PagoManualPayload,
} from '../../../types/api';

// ── 2.5 ESTADO DE PAGOS (resumen) ──────────────────────────────────────────
// Backend devuelve directamente { totalSuscripciones, alDia, porVencer, vencidas }
export async function fetchEstadoPagos(): Promise<EstadoPagosResumen> {
  return apiFetch<EstadoPagosResumen>('/suscripciones/estado-pagos');
}

// ── 2.6 FACTURA / DETALLE DE PAGO ──────────────────────────────────────────
export async function fetchFactura(id: number): Promise<Factura> {
  return apiFetch<Factura>(`/pagos/${id}/factura`);
}

// ── 2.8 REGISTRAR PAGO MANUAL ──────────────────────────────────────────────
export async function registrarPagoManual(payload: PagoManualPayload): Promise<unknown> {
  return apiFetch<unknown>('/pagos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
