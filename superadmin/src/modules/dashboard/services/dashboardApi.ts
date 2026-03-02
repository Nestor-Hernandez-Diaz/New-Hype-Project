// ============================================================================
// DASHBOARD SERVICE — Endpoint 2.4
// Backend: /platform/dashboard/ingresos
// ============================================================================

import { apiFetch } from '../../../services/apiConfig';
import type { DashboardIngresos } from '../../../types/api';

// ── 2.4 DASHBOARD DE INGRESOS ──────────────────────────────────────────────
export async function fetchDashboardIngresos(): Promise<DashboardIngresos> {
  return apiFetch<DashboardIngresos>('/dashboard/ingresos');
}
