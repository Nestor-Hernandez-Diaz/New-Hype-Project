// ============================================================================
// PLANES SERVICE — Mock stub (Endpoints 3.x)
// TODO: Reemplazar mocks por fetch() reales al backend
// ============================================================================

import { simulateDelay } from '../../../services/apiConfig';
import type {
  Plan,
  PlanCreatePayload,
  PlanUpdatePayload,
  ApiResponse,
} from '../../../types/api';

// ── MOCK DATA ───────────────────────────────────────────────────────────────

const MOCK_PLANES: Plan[] = [
  {
    id: 1,
    nombre: 'Plan Básico',
    descripcion: 'Ideal para tiendas pequeñas que inician',
    precioMensual: 49,
    precioAnual: 490,
    maxProductos: 100,
    maxUsuarios: 2,
    maxAlmacenes: 1,
    maxVentasMes: 200,
    periodoPruebaDias: 14,
    moduloIds: [1, 2],
    activo: true,
    tenantCount: 3,
    createdAt: '2025-01-15',
  },
  {
    id: 2,
    nombre: 'Plan Pro',
    descripcion: 'Para tiendas en crecimiento con múltiples puntos',
    precioMensual: 99,
    precioAnual: 990,
    maxProductos: 500,
    maxUsuarios: 5,
    maxAlmacenes: 3,
    maxVentasMes: 1000,
    periodoPruebaDias: 14,
    moduloIds: [1, 2, 3, 4],
    activo: true,
    tenantCount: 8,
    createdAt: '2025-01-15',
  },
  {
    id: 3,
    nombre: 'Plan Enterprise',
    descripcion: 'Sin límites para cadenas de tiendas',
    precioMensual: 249,
    precioAnual: 2490,
    maxProductos: 999999,
    maxUsuarios: 50,
    maxAlmacenes: 20,
    maxVentasMes: 999999,
    periodoPruebaDias: 30,
    moduloIds: [1, 2, 3, 4, 5, 6],
    activo: true,
    tenantCount: 2,
    createdAt: '2025-03-01',
  },
  {
    id: 4,
    nombre: 'Plan Starter (Descontinuado)',
    descripcion: 'Plan legacy — no disponible para nuevos tenants',
    precioMensual: 29,
    precioAnual: 290,
    maxProductos: 50,
    maxUsuarios: 1,
    maxAlmacenes: 1,
    maxVentasMes: 100,
    periodoPruebaDias: 7,
    moduloIds: [1],
    activo: false,
    tenantCount: 1,
    createdAt: '2024-06-01',
  },
];

// ── 3.1 LISTAR PLANES ──────────────────────────────────────────────────────
export async function fetchPlanes(): Promise<ApiResponse<Plan[]>> {
  await simulateDelay();
  return {
    success: true,
    message: 'Planes listados correctamente',
    data: MOCK_PLANES,
  };
}

// ── 3.3 CREAR PLAN ─────────────────────────────────────────────────────────
export async function crearPlan(_payload: PlanCreatePayload): Promise<ApiResponse<Plan>> {
  await simulateDelay();
  return { success: true, message: 'Plan creado correctamente', data: MOCK_PLANES[0] };
}

// ── 3.4 ACTUALIZAR PLAN ────────────────────────────────────────────────────
export async function actualizarPlan(_id: number, _payload: PlanUpdatePayload): Promise<ApiResponse<Plan>> {
  await simulateDelay();
  return { success: true, message: 'Plan actualizado', data: MOCK_PLANES[0] };
}

// ── 3.2 ACTIVAR/DESACTIVAR PLAN ────────────────────────────────────────────
export async function toggleEstadoPlan(_id: number): Promise<ApiResponse<null>> {
  await simulateDelay();
  return { success: true, message: 'Estado del plan actualizado', data: null };
}
