// ============================================================================
// TENANTS SERVICE — Mock stub (Endpoints 4.x)
// TODO: Reemplazar mocks por fetch() reales al backend
// ============================================================================

import { simulateDelay } from '../../../services/apiConfig';
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
  ApiResponse,
} from '../../../types/api';

// ── MOCK DATA ───────────────────────────────────────────────────────────────

const MOCK_TENANTS: Tenant[] = [
  {
    id: 1,
    nombre: 'Boutique Fashion María',
    subdominio: 'boutique-maria',
    email: 'maria@boutiquefashion.com',
    telefono: '987654321',
    direccion: 'Av. Larco 456, Miraflores, Lima',
    estado: 'ACTIVA',
    propietarioNombre: 'María García López',
    propietarioTipoDocumento: 'DNI',
    propietarioNumeroDocumento: '45678912',
    planNombre: 'Plan Pro',
    fechaRegistro: '2025-08-15',
    fechaVencimiento: '2026-08-15',
    metricas: { usuariosActivos: 4, productosRegistrados: 230, ventasMes: 85, almacenes: 1 },
  },
  {
    id: 2,
    nombre: 'Urban Style Store',
    subdominio: 'urban-style',
    email: 'contacto@urbanstyle.pe',
    telefono: '912345678',
    direccion: 'Jr. de la Unión 890, Centro, Lima',
    estado: 'ACTIVA',
    propietarioNombre: 'Carlos Mendoza',
    propietarioTipoDocumento: 'DNI',
    propietarioNumeroDocumento: '78901234',
    planNombre: 'Plan Enterprise',
    fechaRegistro: '2025-06-01',
    fechaVencimiento: '2026-06-01',
    metricas: { usuariosActivos: 8, productosRegistrados: 540, ventasMes: 210, almacenes: 3 },
  },
  {
    id: 3,
    nombre: 'Trendy Kids',
    subdominio: 'trendy-kids',
    email: 'admin@trendykids.com',
    telefono: '956789123',
    direccion: 'Av. Benavides 1234, Surco, Lima',
    estado: 'PRUEBA',
    propietarioNombre: 'Ana Torres Rivas',
    propietarioTipoDocumento: 'DNI',
    propietarioNumeroDocumento: '34567891',
    planNombre: 'Plan Básico',
    fechaRegistro: '2026-02-20',
    fechaVencimiento: '2026-03-22',
    metricas: { usuariosActivos: 1, productosRegistrados: 12, ventasMes: 3, almacenes: 1 },
  },
  {
    id: 4,
    nombre: 'Elegance Plus',
    subdominio: 'elegance-plus',
    email: 'info@eleganceplus.pe',
    telefono: '934567812',
    direccion: 'Av. Primavera 567, San Borja, Lima',
    estado: 'SUSPENDIDA',
    propietarioNombre: 'Roberto Díaz',
    propietarioTipoDocumento: 'RUC',
    propietarioNumeroDocumento: '20456789012',
    planNombre: 'Plan Pro',
    fechaRegistro: '2025-11-10',
    fechaVencimiento: '2026-02-10',
    metricas: { usuariosActivos: 0, productosRegistrados: 180, ventasMes: 0, almacenes: 2 },
  },
  {
    id: 5,
    nombre: 'Sport Zone Lima',
    subdominio: 'sport-zone',
    email: 'ventas@sportzone.pe',
    telefono: '945678901',
    direccion: 'Av. Javier Prado 2345, La Molina, Lima',
    estado: 'ACTIVA',
    propietarioNombre: 'Luis Paredes',
    propietarioTipoDocumento: 'DNI',
    propietarioNumeroDocumento: '56789012',
    planNombre: 'Plan Pro',
    fechaRegistro: '2025-09-01',
    fechaVencimiento: '2026-09-01',
    metricas: { usuariosActivos: 3, productosRegistrados: 310, ventasMes: 120, almacenes: 2 },
  },
];

// ── 4.4 LISTAR TENANTS ──────────────────────────────────────────────────────
export async function fetchTenants(_filters?: TenantFilters): Promise<ApiResponse<Tenant[]>> {
  await simulateDelay();
  return {
    success: true,
    message: 'Tenants listados correctamente',
    data: MOCK_TENANTS,
    pagination: { page: 0, size: 20, totalElements: MOCK_TENANTS.length, totalPages: 1 },
  };
}

// ── 4.2 DETALLE DE TENANT ───────────────────────────────────────────────────
export async function fetchTenantById(id: number): Promise<ApiResponse<Tenant>> {
  await simulateDelay();
  const tenant = MOCK_TENANTS.find(t => t.id === id) ?? MOCK_TENANTS[0];
  return { success: true, message: 'OK', data: tenant };
}

// ── 4.7 CREAR TENANT ────────────────────────────────────────────────────────
export async function crearTenant(_payload: TenantCreatePayload): Promise<ApiResponse<Tenant>> {
  await simulateDelay();
  return { success: true, message: 'Tenant creado correctamente', data: MOCK_TENANTS[0] };
}

// ── 4.10 ACTUALIZAR TENANT ──────────────────────────────────────────────────
export async function actualizarTenant(_id: number, _payload: TenantUpdatePayload): Promise<ApiResponse<Tenant>> {
  await simulateDelay();
  return { success: true, message: 'Tenant actualizado', data: MOCK_TENANTS[0] };
}

// ── 4.1 SOFT DELETE ─────────────────────────────────────────────────────────
export async function eliminarTenant(_id: number): Promise<ApiResponse<null>> {
  await simulateDelay();
  return { success: true, message: 'Tenant eliminado', data: null };
}

// ── 4.6 SUSPENDER/ACTIVAR ───────────────────────────────────────────────────
export async function cambiarEstadoTenant(_id: number, _payload: TenantEstadoPayload): Promise<ApiResponse<null>> {
  await simulateDelay();
  return { success: true, message: 'Estado actualizado', data: null };
}

// ── 4.3 MÓDULOS DEL TENANT ──────────────────────────────────────────────────
export async function fetchModulosTenant(_id: number): Promise<ApiResponse<ModuloTenant[]>> {
  await simulateDelay();
  const mockModulos: ModuloTenant[] = [
    { moduloId: 1, nombre: 'Inventario', activo: true, origen: 'plan' },
    { moduloId: 2, nombre: 'Ventas', activo: true, origen: 'plan' },
    { moduloId: 3, nombre: 'Reportes', activo: true, origen: 'override' },
    { moduloId: 4, nombre: 'Compras', activo: false, origen: 'plan' },
  ];
  return { success: true, message: 'OK', data: mockModulos };
}

// ── 4.11 OVERRIDE MÓDULOS ───────────────────────────────────────────────────
export async function overrideModulosTenant(_id: number, _modulos: ModuloOverride[]): Promise<ApiResponse<null>> {
  await simulateDelay();
  return { success: true, message: 'Módulos actualizados', data: null };
}

// ── 4.5 HISTORIAL DE PAGOS ─────────────────────────────────────────────────
export async function fetchPagosTenant(_id: number): Promise<ApiResponse<PagoTenant[]>> {
  await simulateDelay();
  const mockPagos: PagoTenant[] = [
    { id: 1, monto: 99.00, metodoPago: 'Transferencia', referenciaTransaccion: 'TRX-001', fechaPago: '2026-02-01', estado: 'pagado' },
    { id: 2, monto: 99.00, metodoPago: 'Yape', referenciaTransaccion: 'TRX-002', fechaPago: '2026-01-01', estado: 'pagado' },
  ];
  return { success: true, message: 'OK', data: mockPagos };
}

// ── 4.8 ASIGNAR/CAMBIAR PLAN ───────────────────────────────────────────────
export async function asignarSuscripcion(_id: number, _payload: SuscripcionAsignarPayload): Promise<ApiResponse<null>> {
  await simulateDelay();
  return { success: true, message: 'Plan asignado correctamente', data: null };
}

// ── 4.9 RECORDATORIO DE PAGO ────────────────────────────────────────────────
export async function enviarRecordatorioPago(_id: number): Promise<ApiResponse<null>> {
  await simulateDelay();
  return { success: true, message: 'Recordatorio enviado', data: null };
}
