// ============================================================================
// AUDITORÍA SERVICE — Mock stub (Endpoint 2.7)
// TODO: Reemplazar mocks por fetch() reales al backend
// ============================================================================

import { simulateDelay } from '../../../services/apiConfig';
import type {
  AuditLog,
  AuditFilters,
  ApiResponse,
} from '../../../types/api';

// ── MOCK DATA ───────────────────────────────────────────────────────────────

const MOCK_LOGS: AuditLog[] = [
  {
    id: 1,
    tenantId: 1,
    tenantNombre: 'Boutique Fashion María',
    usuarioId: 10,
    usuarioEmail: 'maria@boutiquefashion.com',
    accion: 'LOGIN',
    entidad: 'Usuario',
    entidadId: 10,
    detalles: 'Inicio de sesión exitoso',
    ip: '192.168.1.100',
    createdAt: '2026-03-01T08:30:00',
  },
  {
    id: 2,
    tenantId: 2,
    tenantNombre: 'Urban Style Store',
    usuarioId: 20,
    usuarioEmail: 'carlos@urbanstyle.pe',
    accion: 'CREAR_PRODUCTO',
    entidad: 'Producto',
    entidadId: 456,
    detalles: 'Producto "Camiseta Polo XL" creado',
    ip: '10.0.0.55',
    createdAt: '2026-03-01T09:15:00',
  },
  {
    id: 3,
    tenantId: 1,
    tenantNombre: 'Boutique Fashion María',
    usuarioId: 11,
    usuarioEmail: 'vendedor1@boutiquefashion.com',
    accion: 'VENTA_REGISTRADA',
    entidad: 'Venta',
    entidadId: 789,
    detalles: 'Venta #789 registrada por S/ 245.00',
    ip: '192.168.1.101',
    createdAt: '2026-03-01T10:45:00',
  },
  {
    id: 4,
    tenantId: 3,
    tenantNombre: 'Trendy Kids',
    usuarioId: 30,
    usuarioEmail: 'admin@trendykids.com',
    accion: 'ACTUALIZAR_PRODUCTO',
    entidad: 'Producto',
    entidadId: 123,
    detalles: 'Stock actualizado: 50 → 45',
    ip: '172.16.0.10',
    createdAt: '2026-02-28T16:20:00',
  },
  {
    id: 5,
    tenantId: 4,
    tenantNombre: 'Elegance Plus',
    usuarioId: 40,
    usuarioEmail: 'info@eleganceplus.pe',
    accion: 'SUSPENSION',
    entidad: 'Tenant',
    entidadId: 4,
    detalles: 'Tenant suspendido por falta de pago',
    ip: '0.0.0.0',
    createdAt: '2026-02-25T12:00:00',
  },
  {
    id: 6,
    tenantId: 2,
    tenantNombre: 'Urban Style Store',
    usuarioId: 21,
    usuarioEmail: 'vendedor@urbanstyle.pe',
    accion: 'ELIMINAR_PRODUCTO',
    entidad: 'Producto',
    entidadId: 100,
    detalles: 'Producto "Gorra Vintage" eliminado',
    ip: '10.0.0.56',
    createdAt: '2026-02-27T14:30:00',
  },
];

// ── 2.7 LISTAR LOGS DE AUDITORÍA ───────────────────────────────────────────
export async function fetchAuditLogs(_filters?: AuditFilters): Promise<ApiResponse<AuditLog[]>> {
  await simulateDelay();
  return {
    success: true,
    message: 'Logs de auditoría listados correctamente',
    data: MOCK_LOGS,
    pagination: { page: 0, size: 20, totalElements: MOCK_LOGS.length, totalPages: 1 },
  };
}
