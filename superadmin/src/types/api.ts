// ============================================================================
// TIPOS CENTRALIZADOS — Contratos API del Backend Spring Boot
// Basados en EndPoints.md — NO conectados aún, solo diseño.
// ============================================================================

// ─── Paginación genérica ────────────────────────────────────────────────────
export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

// ─── 1. CUPONES ─────────────────────────────────────────────────────────────
export interface Cupon {
  id: number;
  codigo: string;
  tipoDescuento: string;         // "PORCENTAJE" | "MONTO_FIJO"
  valorDescuento: number;
  fechaExpiracion: string;        // "2026-03-01"
  usosMaximos: number;
  usosActuales: number;
  activo: boolean;
  createdAt: string;
}

export interface CuponCreatePayload {
  codigo: string;
  tipoDescuento: string;
  valorDescuento: number;
  fechaExpiracion: string;
  usosMaximos: number;
}

// ─── 2. OPERACIONES ─────────────────────────────────────────────────────────

// 2.1 / 2.2 / 2.3 — Tickets
export interface Ticket {
  id: number;
  tenantId: number;
  tenantNombre: string;
  usuarioPlataformaId: number;
  atendidoPor: string;
  asunto: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  respuesta: string | null;
  fechaRespuesta: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketUpdatePayload {
  estado?: string;
  prioridad?: string;
  respuesta?: string;
}

export interface TicketFilters {
  estado?: string;
  prioridad?: string;
  tenantId?: number;
  page?: number;
  size?: number;
}

// 2.4 — Dashboard de ingresos
export interface DashboardIngresos {
  ingresosTotales: number;
  ingresosMesActual: number;
  ingresosMesAnterior: number;
  crecimientoPorcentaje: number;
  totalTenants: number;
  tenantsActivos: number;
  tenantsSuspendidos: number;
  totalSuscripciones: number;
  mrr: number;                  // Monthly Recurring Revenue
  porPlan: PlanIngreso[];
  topTenants: TopTenantIngreso[];
}

export interface PlanIngreso {
  planId: number;
  planNombre: string;
  cantidadTenants: number;
  ingresosMensuales: number;
}

export interface TopTenantIngreso {
  tenantId: number;
  tenantNombre: string;
  totalPagado: number;
  plan: string;
}

// 2.5 — Estado de pagos
export interface EstadoPagosResumen {
  totalSuscripciones: number;
  alDia: number;
  porVencer: number;
  vencidas: number;
}

export interface SuscripcionDetallePago {
  id: number;
  tenantId: number;
  tenantNombre: string;
  plan: string;
  estado: 'al_dia' | 'por_vencer' | 'vencida';
  fechaUltimoPago: string;
  fechaProximoPago: string;
  montoPendiente: number;
  montoUltimoPago: number;
  diasRestantes: number;
  metodoPago: string;
}

// 2.6 — Factura / Detalle de pago
export interface Factura {
  id: number;
  tenantId: number;
  tenantNombre: string;
  monto: number;
  metodoPago: string;
  referenciaTransaccion: string;
  cuponCodigo: string | null;
  descuento: number;
  montoFinal: number;
  fechaPago: string;
  periodo: string;
}

// 2.7 — Auditoría
export interface AuditLog {
  id: number;
  tenantId: number;
  tenantNombre: string;
  usuarioId: number;
  usuarioEmail: string;
  accion: string;
  entidad: string;
  entidadId: number;
  detalles: string;
  ip: string;
  createdAt: string;
}

export interface AuditFilters {
  tenantId?: number;
  accion?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  size?: number;
}

// 2.8 — Registrar pago manual
export interface PagoManualPayload {
  tenantId: number;
  monto: number;
  metodoPago: string;
  referenciaTransaccion: string;
  cuponCodigo?: string;
}

// ─── 3. PLANES ──────────────────────────────────────────────────────────────
export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precioMensual: number;
  precioAnual: number;
  maxProductos: number;
  maxUsuarios: number;
  maxAlmacenes: number;
  maxVentasMes: number;
  periodoPruebaDias: number;
  moduloIds: number[];
  activo: boolean;
  tenantCount: number;           // from GET /planes (listado)
  createdAt: string;
}

export interface PlanCreatePayload {
  nombre: string;
  descripcion: string;
  precioMensual: number;
  precioAnual: number;
  maxProductos: number;
  maxUsuarios: number;
  maxAlmacenes: number;
  maxVentasMes: number;
  periodoPruebaDias: number;
  moduloIds: number[];
}

export type PlanUpdatePayload = PlanCreatePayload;

// ─── 4. TENANTS ─────────────────────────────────────────────────────────────
export interface Tenant {
  id: number;
  nombre: string;
  subdominio: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: 'ACTIVA' | 'SUSPENDIDA' | 'PRUEBA' | 'CANCELADA';
  propietarioNombre: string;
  propietarioTipoDocumento: string;
  propietarioNumeroDocumento: string;
  planNombre: string;
  fechaRegistro: string;
  fechaVencimiento: string;
  // Detail fields (from 4.2)
  metricas?: TenantMetricas;
  suscripcion?: TenantSuscripcion;
}

export interface TenantMetricas {
  usuariosActivos: number;
  productosRegistrados: number;
  ventasMes: number;
  almacenes: number;
}

export interface TenantSuscripcion {
  planId: number;
  planNombre: string;
  fechaInicio: string;
  fechaFin: string;
  autoRenovar: boolean;
}

export interface TenantFilters {
  estado?: string;
  q?: string;
  page?: number;
  size?: number;
}

export interface TenantCreatePayload {
  nombre: string;
  subdominio: string;
  propietarioNombre: string;
  propietarioTipoDocumento: string;
  propietarioNumeroDocumento: string;
  email: string;
  telefono: string;
  direccion: string;
  planId: number;
  adminPassword: string;
}

export interface TenantUpdatePayload {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  overrideMaxProductos?: number;
  overrideMaxUsuarios?: number;
  overrideMaxAlmacenes?: number;
  overrideMaxVentasMes?: number;
}

export interface TenantEstadoPayload {
  estado: string;
  motivo?: string;
}

export interface SuscripcionAsignarPayload {
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  autoRenovar: boolean;
}

export interface ModuloOverride {
  moduloId: number;
  activo: boolean;
}

export interface ModuloTenant {
  moduloId: number;
  nombre: string;
  activo: boolean;
  origen: 'plan' | 'override';
}

export interface PagoTenant {
  id: number;
  monto: number;
  metodoPago: string;
  referenciaTransaccion: string;
  fechaPago: string;
  estado: string;
}
