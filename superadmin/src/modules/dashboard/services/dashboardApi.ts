// ============================================================================
// DASHBOARD SERVICE — Mock stub (Endpoint 2.4)
// TODO: Reemplazar mocks por fetch() reales al backend
// ============================================================================

import { simulateDelay } from '../../../services/apiConfig';
import type { DashboardIngresos, ApiResponse } from '../../../types/api';

// ── MOCK DATA ───────────────────────────────────────────────────────────────

const MOCK_DASHBOARD: DashboardIngresos = {
  ingresosTotales: 28450.00,
  ingresosMesActual: 3247.00,
  ingresosMesAnterior: 2980.00,
  crecimientoPorcentaje: 8.9,
  totalTenants: 14,
  tenantsActivos: 11,
  tenantsSuspendidos: 2,
  totalSuscripciones: 14,
  mrr: 3247.00,
  porPlan: [
    { planId: 1, planNombre: 'Plan Básico', cantidadTenants: 3, ingresosMensuales: 147.00 },
    { planId: 2, planNombre: 'Plan Pro', cantidadTenants: 8, ingresosMensuales: 792.00 },
    { planId: 3, planNombre: 'Plan Enterprise', cantidadTenants: 2, ingresosMensuales: 498.00 },
  ],
  topTenants: [
    { tenantId: 2, tenantNombre: 'Urban Style Store', totalPagado: 2988.00, plan: 'Enterprise' },
    { tenantId: 1, tenantNombre: 'Boutique Fashion María', totalPagado: 1188.00, plan: 'Pro' },
    { tenantId: 5, tenantNombre: 'Sport Zone Lima', totalPagado: 594.00, plan: 'Pro' },
  ],
};

// ── 2.4 DASHBOARD DE INGRESOS ──────────────────────────────────────────────
export async function fetchDashboardIngresos(): Promise<ApiResponse<DashboardIngresos>> {
  await simulateDelay();
  return { success: true, message: 'OK', data: MOCK_DASHBOARD };
}
