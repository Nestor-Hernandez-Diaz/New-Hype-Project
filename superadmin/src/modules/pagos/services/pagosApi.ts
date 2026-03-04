// ============================================================================
// PAGOS SERVICE — Endpoints 2.5, 2.6, 2.8
// Backend: /platform/suscripciones/estado-pagos, /platform/pagos
// ============================================================================

import { apiFetch } from '../../../services/apiConfig';
import type {
  EstadoPagosResumen,
  Factura,
  PagoManualPayload,
  PagoTenant,
  Tenant,
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

// ── FETCH ALL PAGOS (across all tenants) ───────────────────────────────────
// No hay endpoint bulk /pagos. Estrategia: listar tenants → por cada uno
// llamar /tenants/{id}/pagos → combinar resultados.
export async function fetchAllPagos(): Promise<PagoTenant[]> {
  // 1. Obtener lista de tenants (page grande para traer todos)
  interface PagedTenants { content: Tenant[]; totalElements: number }
  const tenantsPage = await apiFetch<PagedTenants>('/tenants?size=200');
  const tenants: Tenant[] = Array.isArray(tenantsPage)
    ? tenantsPage
    : tenantsPage?.content ?? [];

  // 2. Fetch pagos de cada tenant en paralelo
  const results = await Promise.allSettled(
    tenants.map(t =>
      apiFetch<PagoTenant[]>(`/tenants/${t.id}/pagos`)
    )
  );

  // 3. Combinar en lista plana
  const allPagos: PagoTenant[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      allPagos.push(...r.value);
    }
  }

  return allPagos;
}
