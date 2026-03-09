// ============================================================================
// AUDITORÍA SERVICE — Endpoint 2.7
// Backend: /platform/auditoria
// ============================================================================

import { apiFetch, buildQuery } from '../../../services/apiConfig';
import type { AuditLog, AuditFilters } from '../../../types/api';

// ── 2.7 LISTAR LOGS DE AUDITORÍA ───────────────────────────────────────────
export async function fetchAuditLogs(filters?: AuditFilters): Promise<AuditLog[]> {
  const query = buildQuery({
    tenantId: filters?.tenantId,
    accion: filters?.accion,
    fechaDesde: filters?.fechaDesde,
    fechaHasta: filters?.fechaHasta,
    page: filters?.page,
    size: filters?.size,
  });
  // Backend returns { success, data: AuditLog[], pagination } — apiFetch unwraps to AuditLog[]
  return apiFetch<AuditLog[]>(`/auditoria${query}`);
}
