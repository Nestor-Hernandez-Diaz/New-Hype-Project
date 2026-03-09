// ============================================================================
// CUPONES SERVICE — Endpoints 1.1, 1.2
// Backend: /platform/cupones
// ============================================================================

import { apiFetch } from '../../../services/apiConfig';
import type { Cupon, CuponCreatePayload } from '../../../types/api';

// ── 1.1 LISTAR CUPONES ─────────────────────────────────────────────────────
export async function fetchCupones(): Promise<Cupon[]> {
  return apiFetch<Cupon[]>('/cupones');
}

// ── 1.2 CREAR CUPÓN ────────────────────────────────────────────────────────
export async function crearCupon(payload: CuponCreatePayload): Promise<Cupon> {
  return apiFetch<Cupon>('/cupones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
