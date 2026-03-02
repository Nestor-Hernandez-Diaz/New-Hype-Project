// ============================================================================
// AUDITORÍA SERVICE — Endpoint 2.7
// Backend: /platform/auditoria
// ============================================================================

import { apiFetch, buildQuery } from '../../../services/apiConfig';
import type { AuditLog, AuditFilters } from '../../../types/api';

// Respuesta paginada del backend
interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── 2.7 LISTAR LOGS DE AUDITORÍA ───────────────────────────────────────────
export async function fetchAuditLogs(filters?: AuditFilters): Promise<PagedResponse<AuditLog>> {
  const query = buildQuery({
    tenantId: filters?.tenantId,
    accion: filters?.accion,
    fechaDesde: filters?.fechaDesde,
    fechaHasta: filters?.fechaHasta,
    page: filters?.page,
    size: filters?.size,
  });
  return apiFetch<PagedResponse<AuditLog>>(`/auditoria${query}`);
}
