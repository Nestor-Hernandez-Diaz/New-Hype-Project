/**
 * 🏢 TIPOS DE DOMINIO - SUPERADMIN (Multi-Tenant)
 * 
 * Interfaces TypeScript para el módulo de Superadministración del sistema SaaS.
 * Nomenclatura: camelCase consistente con JPA (futuro backend Spring Boot)
 * 
 * @module superadmin
 * @packageDocumentation
 */

// ============================================================================
// ENUMERACIONES
// ============================================================================

/**
 * Planes de suscripción disponibles en la plataforma SaaS
 */
export enum PlanSuscripcion {
  /** Plan básico: Productos, Ventas, Inventario básico */
  BASICO = 'BASICO',
  /** Plan profesional: + Compras, Reportes, Multi-almacén */
  PRO = 'PRO',
  /** Plan premium: + Liquidaciones, API, Integraciones */
  PREMIUM = 'PREMIUM'
}

/**
 * Estados posibles de una tienda (tenant) en la plataforma
 */
export enum EstadoTienda {
  /** Tienda activa y operativa */
  ACTIVA = 'ACTIVA',
  /** Tienda suspendida temporalmente (falta de pago, violación términos) */
  SUSPENDIDA = 'SUSPENDIDA',
  /** Suscripción vencida, requiere renovación */
  VENCIDA = 'VENCIDA',
  /** Tienda en período de prueba */
  PRUEBA = 'PRUEBA',
  /** Tienda eliminada lógicamente */
  ELIMINADA = 'ELIMINADA'
}

/**
 * Módulos funcionales disponibles según plan
 */
export enum ModuloSistema {
  VENTAS = 'VENTAS',
  PRODUCTOS = 'PRODUCTOS',
  INVENTARIO = 'INVENTARIO',
  COMPRAS = 'COMPRAS',
  CLIENTES = 'CLIENTES',
  REPORTES = 'REPORTES',
  USUARIOS = 'USUARIOS',
  CONFIGURACION = 'CONFIGURACION',
  ALMACENES = 'ALMACENES',
  LIQUIDACIONES = 'LIQUIDACIONES',
  API_INTEGRACIONES = 'API_INTEGRACIONES',
  AUDITORIA = 'AUDITORIA'
}

/**
 * Estados de tickets de soporte técnico
 */
export enum EstadoTicket {
  /** Ticket recién creado, sin asignar */
  ABIERTO = 'ABIERTO',
  /** Ticket asignado a soporte, en proceso */
  EN_PROCESO = 'EN_PROCESO',
  /** Ticket resuelto, esperando confirmación */
  RESUELTO = 'RESUELTO',
  /** Ticket cerrado permanentemente */
  CERRADO = 'CERRADO'
}

/**
 * Prioridades de tickets de soporte
 */
export enum PrioridadTicket {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA'
}

/**
 * Tipos de acciones auditables en la plataforma
 */
export enum TipoAccionAuditoria {
  CREAR_TIENDA = 'CREAR_TIENDA',
  EDITAR_TIENDA = 'EDITAR_TIENDA',
  SUSPENDER_TIENDA = 'SUSPENDER_TIENDA',
  ACTIVAR_TIENDA = 'ACTIVAR_TIENDA',
  ELIMINAR_TIENDA = 'ELIMINAR_TIENDA',
  CAMBIAR_PLAN = 'CAMBIAR_PLAN',
  ACCESO_SUPERADMIN = 'ACCESO_SUPERADMIN',
  PROCESAR_PAGO = 'PROCESAR_PAGO',
  GESTIONAR_TICKET = 'GESTIONAR_TICKET'
}

// ============================================================================
// INTERFACES DE DOMINIO
// ============================================================================

/**
 * Métricas operativas de una tienda
 */
export interface MetricasTienda {
  /** Cantidad de productos activos registrados */
  productosActivos: number;
  /** Total de ventas del mes actual (en moneda local) */
  ventasMes: number;
  /** Cantidad de usuarios activos en la tienda */
  usuariosActivos: number;
  /** Cantidad de almacenes configurados */
  almacenesActivos?: number;
  /** Cantidad de clientes registrados */
  clientesRegistrados?: number;
  /** Última fecha de actividad registrada */
  ultimaActividad: string; // ISO 8601
}

/**
 * Configuración de límites según plan de suscripción
 */
export interface LimitesPlan {
  /** Máximo de productos permitidos */
  maxProductos: number;
  /** Máximo de usuarios permitidos */
  maxUsuarios: number;
  /** Máximo de almacenes permitidos */
  maxAlmacenes: number;
  /** Máximo de transacciones mensuales */
  maxTransaccionesMes?: number;
  /** Permite acceso a API externa */
  accesoApi: boolean;
}

/**
 * Historial de pagos de una tienda
 */
export interface PagoSuscripcion {
  /** ID único del pago */
  pagoId: string;
  /** Fecha del pago */
  fechaPago: string; // ISO 8601
  /** Monto pagado */
  monto: number;
  /** Plan asociado al pago */
  plan: PlanSuscripcion;
  /** Método de pago utilizado */
  metodoPago: string;
  /** Estado del pago (Aprobado, Rechazado, Pendiente) */
  estadoPago: string;
}

/**
 * Datos del propietario/comerciante de la tienda
 */
export interface PropietarioTienda {
  /** Nombre completo del propietario */
  nombreCompleto: string;
  /** RUC o DNI del comerciante */
  documentoIdentidad: string;
  /** Tipo de documento (RUC, DNI, etc.) */
  tipoDocumento: 'RUC' | 'DNI' | 'CE';
  /** Email de contacto */
  email: string;
  /** Teléfono de contacto */
  telefono: string;
  /** Dirección física del negocio */
  direccion?: string;
}

/**
 * Tienda (Tenant) - Entidad principal del módulo Superadmin
 * Representa una instancia independiente del sistema para un comerciante
 */
export interface Tienda {
  /** ID único del tenant */
  tenantId: string;
  /** Nombre comercial de la tienda */
  nombre: string;
  /** Subdominio único (ej: boutique-maria) */
  subdominio: string;
  /** Estado actual de la tienda */
  estado: EstadoTienda;
  /** Plan de suscripción asignado */
  plan: PlanSuscripcion;
  /** Fecha de creación de la tienda */
  fechaCreacion: string; // ISO 8601
  /** Fecha de vencimiento de la suscripción */
  fechaVencimiento: string; // ISO 8601
  /** Datos del propietario */
  propietario: PropietarioTienda;
  /** Módulos habilitados para esta tienda */
  modulosHabilitados: ModuloSistema[];
  /** Límites configurados según el plan */
  limites: LimitesPlan;
  /** Métricas operativas actuales */
  metricas: MetricasTienda;
  /** Historial de pagos */
  historialPagos?: PagoSuscripcion[];
  /** Motivo de suspensión (si aplica) */
  motivoSuspension?: string;
  /** Fecha de eliminación lógica (si aplica) */
  fechaEliminacion?: string; // ISO 8601
}

/**
 * Datos para crear una nueva tienda
 */
export interface CrearTiendaDto {
  /** Nombre comercial de la tienda */
  nombre: string;
  /** Subdominio único (validado antes de crear) */
  subdominio: string;
  /** Plan inicial asignado */
  plan: PlanSuscripcion;
  /** Datos del propietario/comerciante */
  propietario: PropietarioTienda;
  /** Fecha de inicio de suscripción */
  fechaInicio: string; // ISO 8601
  /** Duración de la suscripción en meses */
  duracionMeses: number;
}

/**
 * Datos para actualizar una tienda existente
 */
export interface ActualizarTiendaDto {
  /** Nombre comercial (opcional) */
  nombre?: string;
  /** Plan de suscripción (opcional) */
  plan?: PlanSuscripcion;
  /** Estado de la tienda (opcional) */
  estado?: EstadoTienda;
  /** Fecha de vencimiento (opcional) */
  fechaVencimiento?: string;
  /** Módulos habilitados (opcional) */
  modulosHabilitados?: ModuloSistema[];
  /** Datos del propietario (opcional) */
  propietario?: Partial<PropietarioTienda>;
}

/**
 * Filtros para búsqueda de tiendas
 */
export interface FiltrosTiendas {
  /** Búsqueda por nombre, RUC, subdominio */
  busqueda?: string;
  /** Filtrar por estado */
  estado?: EstadoTienda;
  /** Filtrar por plan */
  plan?: PlanSuscripcion;
  /** Ordenar por campo */
  ordenarPor?: 'nombre' | 'fechaCreacion' | 'fechaVencimiento' | 'ventasMes';
  /** Dirección de ordenamiento */
  orden?: 'asc' | 'desc';
}

/**
 * Ticket de soporte técnico
 */
export interface TicketSoporte {
  /** ID único del ticket */
  ticketId: string;
  /** ID de la tienda que reporta */
  tenantId: string;
  /** Nombre de la tienda */
  nombreTienda: string;
  /** Asunto del ticket */
  asunto: string;
  /** Descripción detallada del problema */
  descripcion: string;
  /** Prioridad del ticket */
  prioridad: PrioridadTicket;
  /** Estado del ticket */
  estado: EstadoTicket;
  /** Fecha de creación */
  fechaCreacion: string; // ISO 8601
  /** Fecha de última actualización */
  fechaActualizacion: string; // ISO 8601
  /** Usuario que reportó (del tenant) */
  reportadoPor: string;
  /** Superadmin asignado (opcional) */
  asignadoA?: string;
  /** Respuestas/comentarios del ticket */
  respuestas?: RespuestaTicket[];
}

/**
 * Respuesta o comentario en un ticket
 */
export interface RespuestaTicket {
  /** ID de la respuesta */
  respuestaId: string;
  /** Autor de la respuesta */
  autor: string;
  /** Tipo de autor (Comerciante, Superadmin) */
  tipoAutor: 'COMERCIANTE' | 'SUPERADMIN';
  /** Contenido de la respuesta */
  contenido: string;
  /** Fecha de la respuesta */
  fecha: string; // ISO 8601
}

/**
 * Log de auditoría global
 */
export interface LogAuditoriaGlobal {
  /** ID único del log */
  logId: string;
  /** Tipo de acción realizada */
  tipoAccion: TipoAccionAuditoria;
  /** ID de la tienda afectada (si aplica) */
  tenantId?: string;
  /** Nombre de la tienda afectada */
  nombreTienda?: string;
  /** Superadmin que realizó la acción */
  realizadoPor: string;
  /** Descripción de la acción */
  descripcion: string;
  /** Fecha y hora de la acción */
  fechaHora: string; // ISO 8601
  /** Metadata adicional (JSON) */
  metadata?: Record<string, unknown>;
}

/**
 * Métricas globales de la plataforma
 */
export interface MetricasGlobales {
  /** Total de tiendas activas */
  tiendasActivas: number;
  /** Total de tiendas suspendidas */
  tiendasSuspendidas: number;
  /** Total de tiendas vencidas */
  tiendasVencidas: number;
  /** Ingresos totales del mes */
  ingresosMes: number;
  /** Ingresos por plan */
  ingresosPorPlan: {
    basico: number;
    pro: number;
    premium: number;
  };
  /** Tasa de renovación (%) */
  tasaRenovacion: number;
  /** Tickets abiertos */
  ticketsAbiertos: number;
  /** Tiendas creadas este mes */
  tiendasNuevasMes: number;
}

// ============================================================================
// TIPOS DE RESPUESTA API (Mock hasta que exista backend real)
// ============================================================================

/**
 * Respuesta de la API para listado de tiendas
 */
export interface TiendasResponse {
  tiendas: Tienda[];
  total: number;
  pagina?: number;
  totalPaginas?: number;
}

/**
 * Respuesta de la API para una tienda específica
 */
export interface TiendaResponse {
  tienda: Tienda;
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
