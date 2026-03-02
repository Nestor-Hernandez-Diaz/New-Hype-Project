// ============================================================================
// CUPONES SERVICE — Mock stub (Endpoints 1.x)
// TODO: Reemplazar mocks por fetch() reales al backend
// ============================================================================

import { simulateDelay } from '../../../services/apiConfig';
import type {
  Cupon,
  CuponCreatePayload,
  ApiResponse,
} from '../../../types/api';

// ── MOCK DATA ───────────────────────────────────────────────────────────────

const MOCK_CUPONES: Cupon[] = [
  {
    id: 1,
    codigo: 'BIENVENIDO20',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 20,
    fechaExpiracion: '2026-06-30',
    usosMaximos: 100,
    usosActuales: 34,
    activo: true,
    createdAt: '2026-01-15',
  },
  {
    id: 2,
    codigo: 'ANUAL50',
    tipoDescuento: 'MONTO_FIJO',
    valorDescuento: 50,
    fechaExpiracion: '2026-12-31',
    usosMaximos: 50,
    usosActuales: 12,
    activo: true,
    createdAt: '2026-01-20',
  },
  {
    id: 3,
    codigo: 'NEWHYPE10',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 10,
    fechaExpiracion: '2026-04-15',
    usosMaximos: 200,
    usosActuales: 89,
    activo: true,
    createdAt: '2025-12-01',
  },
  {
    id: 4,
    codigo: 'BLACKFRIDAY',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 30,
    fechaExpiracion: '2025-11-30',
    usosMaximos: 500,
    usosActuales: 500,
    activo: false,
    createdAt: '2025-11-01',
  },
];

// ── 1.1 LISTAR CUPONES ─────────────────────────────────────────────────────
export async function fetchCupones(): Promise<ApiResponse<Cupon[]>> {
  await simulateDelay();
  return {
    success: true,
    message: 'Cupones listados correctamente',
    data: MOCK_CUPONES,
  };
}

// ── 1.2 CREAR CUPÓN ────────────────────────────────────────────────────────
export async function crearCupon(_payload: CuponCreatePayload): Promise<ApiResponse<Cupon>> {
  await simulateDelay();
  return { success: true, message: 'Cupón creado correctamente', data: MOCK_CUPONES[0] };
}
