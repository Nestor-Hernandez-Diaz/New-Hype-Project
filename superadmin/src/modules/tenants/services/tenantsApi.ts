// ============================================================================
// TENANTS SERVICE — Endpoints 4.1 – 4.11
// Backend: /platform/tenants
// ============================================================================

import { apiFetch, buildQuery } from '../../../services/apiConfig';
import type {
  Tenant,
  TenantFilters,
  TenantCreatePayload,
  TenantUpdatePayload,
  TenantEstadoPayload,
  SuscripcionAsignarPayload,
  ModuloOverride,
  ModuloTenant,
  PagoTenant,
} from '../../../types/api';

// Respuesta paginada del backend
interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── 4.4 LISTAR TENANTS CON FILTROS ──────────────────────────────────────────
export async function fetchTenants(filters?: TenantFilters): Promise<PagedResponse<Tenant>> {
  const query = buildQuery({
    estado: filters?.estado,
    q: filters?.q,
    page: filters?.page,
    size: filters?.size,
  });
  return apiFetch<PagedResponse<Tenant>>(`/tenants${query}`);
}

// ── 4.2 DETALLE DE TENANT CON PLAN, MÉTRICAS ───────────────────────────────
export async function fetchTenantById(id: number): Promise<Tenant> {
  return apiFetch<Tenant>(`/tenants/${id}`);
}

// ── 4.7 CREAR TENANT + ADMIN USER + SUSCRIPCIÓN ────────────────────────────
export async function crearTenant(payload: TenantCreatePayload): Promise<Tenant> {
  return apiFetch<Tenant>('/tenants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── 4.10 ACTUALIZAR DATOS DEL TENANT + OVERRIDES ────────────────────────────
export async function actualizarTenant(id: number, payload: TenantUpdatePayload): Promise<Tenant> {
  return apiFetch<Tenant>(`/tenants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// ── 4.1 SOFT DELETE ─────────────────────────────────────────────────────────
export async function eliminarTenant(id: number): Promise<void> {
  await apiFetch<void>(`/tenants/${id}`, { method: 'DELETE' });
}

// ── 4.6 SUSPENDER/ACTIVAR TENANT ────────────────────────────────────────────
export async function cambiarEstadoTenant(id: number, payload: TenantEstadoPayload): Promise<Tenant> {
  return apiFetch<Tenant>(`/tenants/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// ── 4.3 MÓDULOS ACTIVOS DEL TENANT (PLAN + OVERRIDES) ──────────────────────
export async function fetchModulosTenant(id: number): Promise<ModuloTenant[]> {
  return apiFetch<ModuloTenant[]>(`/tenants/${id}/modulos`);
}

// ── 4.11 OVERRIDE MANUAL DE MÓDULOS ─────────────────────────────────────────
export async function overrideModulosTenant(id: number, modulos: ModuloOverride[]): Promise<void> {
  await apiFetch<void>(`/tenants/${id}/modulos`, {
    method: 'PUT',
    body: JSON.stringify({ modulos }),
  });
}

// ── 4.5 HISTORIAL DE PAGOS DE UN TENANT ─────────────────────────────────────
export async function fetchPagosTenant(id: number): Promise<PagoTenant[]> {
  return apiFetch<PagoTenant[]>(`/tenants/${id}/pagos`);
}

// ── 4.8 ASIGNAR/CAMBIAR PLAN A TENANT ───────────────────────────────────────
export async function asignarSuscripcion(id: number, payload: SuscripcionAsignarPayload): Promise<unknown> {
  return apiFetch<unknown>(`/tenants/${id}/suscripcion`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── 4.9 ENVIAR RECORDATORIO DE PAGO ─────────────────────────────────────────
export async function enviarRecordatorioPago(id: number): Promise<void> {
  await apiFetch<void>(`/tenants/${id}/recordatorio-pago`, {
    method: 'POST',
  });
}
