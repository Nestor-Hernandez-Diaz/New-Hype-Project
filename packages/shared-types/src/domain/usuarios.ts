/**
 * 👥 TIPOS DE DOMINIO - USUARIOS Y ROLES
 * 
 * Interfaces TypeScript para el módulo de Usuarios del ERP.
 * Nomenclatura: camelCase consistente con JPA (futuro backend Spring Boot)
 * 
 * @module usuarios
 * @packageDocumentation
 */

// ============================================================================
// ENUMERACIONES
// ============================================================================

/**
 * Roles de usuario en el sistema
 */
export enum RolUsuario {
  /** Administrador del sistema con acceso total */
  ADMIN = 'ADMIN',
  /** Gerente con permisos de supervisión */
  GERENTE = 'GERENTE',
  /** Vendedor con acceso a módulo de ventas */
  VENDEDOR = 'VENDEDOR',
  /** Almacenero con acceso a inventario */
  ALMACENERO = 'ALMACENERO',
  /** Cajero con acceso a caja */
  CAJERO = 'CAJERO',
  /** Comprador con acceso a módulo de compras */
  COMPRADOR = 'COMPRADOR'
}

/**
 * Estados posibles de un usuario
 */
export enum EstadoUsuario {
  /** Usuario activo y con acceso */
  ACTIVO = 'ACTIVO',
  /** Usuario desactivado temporalmente */
  INACTIVO = 'INACTIVO',
  /** Usuario bloqueado por seguridad */
  BLOQUEADO = 'BLOQUEADO'
}

// ============================================================================
// INTERFACES DE DOMINIO
// ============================================================================

/**
 * Rol de usuario (Tabla Maestra)
 */
export interface Rol {
  /** ID único del rol */
  id: string;
  /** Código del rol (ADMIN, VENDEDOR, etc.) */
  codigoRol: string;
  /** Nombre descriptivo del rol */
  nombreRol: string;
  /** Descripción del rol */
  descripcion: string;
  /** Permisos asignados al rol */
  permisos: string[];
  /** Indica si el rol está activo */
  activo: boolean;
  /** Indica si es un rol del sistema (no eliminable) */
  esSistema?: boolean;
  /** Cantidad de usuarios asignados a este rol */
  cantidadUsuarios?: number;
  /** Fecha de creación */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
}

/**
 * Usuario del sistema
 */
export interface Usuario {
  /** ID único del usuario */
  id: string;
  /** Nombre de usuario (username) */
  usuario: string;
  /** Correo electrónico */
  email: string;
  /** Nombre(s) del usuario */
  nombres: string;
  /** Apellidos del usuario */
  apellidos: string;
  /** Nombre completo (calculado) */
  nombreCompleto?: string;
  
  // Relación con Rol
  /** ID del rol asignado */
  rolId: string;
  /** Datos del rol (incluido en respuestas) */
  rol?: Rol;
  
  // Estado y acceso
  /** Estado del usuario */
  estadoUsuario: EstadoUsuario;
  /** Indica si el usuario está activo */
  activo: boolean;
  /** Fecha de último acceso al sistema */
  ultimoAcceso?: Date;
  /** Contraseña hasheada (nunca se envía al frontend) */
  password?: never;
  
  // Auditoría
  /** Usuario que creó el registro */
  usuarioCreacion?: string;
  /** Usuario que realizó la última modificación */
  usuarioModificacion?: string;
  /** Fecha de creación del registro */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
}

/**
 * DTO para crear un nuevo usuario
 */
export interface CrearUsuarioDTO {
  usuario: string;
  email: string;
  nombres: string;
  apellidos: string;
  password: string;
  rolId: string;
  activo?: boolean;
}

/**
 * DTO para actualizar un usuario existente
 */
export interface ActualizarUsuarioDTO {
  email?: string;
  nombres?: string;
  apellidos?: string;
  password?: string;
  rolId?: string;
  activo?: boolean;
}

/**
 * Filtros para búsqueda de usuarios
 */
export interface UsuarioFiltros {
  /** Término de búsqueda (busca en usuario, nombres, apellidos, email) */
  q?: string;
  /** Filtrar por rol */
  rolId?: string;
  /** Filtrar por estado */
  estadoUsuario?: EstadoUsuario;
  /** Filtrar solo activos */
  activo?: boolean;
  /** Página actual (para paginación) */
  page?: number;
  /** Límite de resultados por página */
  limit?: number;
}

/**
 * Respuesta paginada de usuarios
 */
export interface UsuariosPaginados {
  usuarios: Usuario[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * DTO para cambiar contraseña
 */
export interface CambiarPasswordDTO {
  passwordActual: string;
  passwordNueva: string;
  confirmarPassword: string;
}

/**
 * DTO para crear un nuevo rol
 */
export interface CrearRolDTO {
  codigoRol: string;
  nombreRol: string;
  descripcion: string;
  permisos: string[];
  activo?: boolean;
}

/**
 * DTO para actualizar un rol existente
 */
export interface ActualizarRolDTO {
  nombreRol?: string;
  descripcion?: string;
  permisos?: string[];
  activo?: boolean;
}
