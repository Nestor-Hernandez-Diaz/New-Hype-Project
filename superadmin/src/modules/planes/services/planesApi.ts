// ============================================================================
// PLANES SERVICE — Endpoints 3.1, 3.2, 3.3, 3.4
// Backend: /platform/planes
// ============================================================================

import { apiFetch } from '../../../services/apiConfig';
import type { Plan, PlanCreatePayload, PlanUpdatePayload } from '../../../types/api';

// ── 3.1 LISTAR PLANES CON CONTEO DE TENANTS ────────────────────────────────
export async function fetchPlanes(): Promise<Plan[]> {
  return apiFetch<Plan[]>('/planes');
}

// ── 3.3 CREAR PLAN ─────────────────────────────────────────────────────────
export async function crearPlan(payload: PlanCreatePayload): Promise<Plan> {
  return apiFetch<Plan>('/planes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── 3.4 ACTUALIZAR PLAN ────────────────────────────────────────────────────
export async function actualizarPlan(id: number, payload: PlanUpdatePayload): Promise<Plan> {
  return apiFetch<Plan>(`/planes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// ── 3.2 ACTIVAR/DESACTIVAR PLAN ────────────────────────────────────────────
export async function toggleEstadoPlan(id: number): Promise<Plan> {
  return apiFetch<Plan>(`/planes/${id}/estado`, {
    method: 'PATCH',
  });
}
