/**
 * REAL API - USUARIOS Y ROLES
 *
 * Servicio real que conecta con el backend Spring Boot.
 * Reemplaza usuariosMockApi.ts manteniendo las mismas firmas de funciones.
 *
 * Endpoints backend:
 *   Usuarios: GET/POST /api/v1/usuarios, GET/PUT /api/v1/usuarios/{id},
 *             PATCH /api/v1/usuarios/{id}/password, PATCH /api/v1/usuarios/{id}/estado
 *   Roles:    GET/POST /api/v1/roles, PUT /api/v1/roles/{id},
 *             PATCH /api/v1/roles/{id}/estado
 *
 * @packageDocumentation
 */

import type {
  Usuario,
  Rol,
  CrearUsuarioDTO,
  ActualizarUsuarioDTO,
  UsuarioFiltros,
  UsuariosPaginados,
  CrearRolDTO,
  ActualizarRolDTO,
} from '@monorepo/shared-types';
import { EstadoUsuario } from '@monorepo/shared-types';
import { apiService, toBackendPage, fromBackendPage } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

// ============================================================================
// BACKEND RESPONSE TYPES (match Java DTOs)
// ============================================================================

/** Maps to com.newhype.backend.dto.usuario.UsuarioResponse */
interface BackendUsuarioResponse {
  id: number;
  email: string;
  username: string;
  nombre: string;
  apellido: string;
  rolId: number;
  rolNombre: string;
  permisos: string; // JSON string e.g. '["VENTAS_CREAR","INVENTARIO_VER"]'
  estado: boolean;
  ultimoAcceso: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Maps to com.newhype.backend.dto.usuario.RolResponse */
interface BackendRolResponse {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string; // JSON string
  esSistema: boolean;
  estado: boolean;
  cantidadUsuarios: number;
  createdAt: string | null;
  updatedAt: string | null;
}

// ============================================================================
// MAPPERS: backend -> frontend
// ============================================================================

/**
 * Safely parses a JSON string of permissions into a string array.
 * Returns an empty array on any parse failure.
 */
function parsePermisos(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Converts a date-like string (ISO / LocalDateTime) to a Date object.
 * Returns current date if the value is null/undefined/invalid.
 */
function toDate(value: string | null | undefined): Date {
  if (!value) return new Date();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Maps a backend UsuarioResponse to the frontend Usuario type.
 */
function mapUsuario(b: BackendUsuarioResponse): Usuario {
  const permisos = parsePermisos(b.permisos);

  return {
    id: String(b.id),
    usuario: b.username,
    email: b.email,
    nombres: b.nombre,
    apellidos: b.apellido,
    nombreCompleto: `${b.nombre} ${b.apellido}`,
    rolId: String(b.rolId),
    rol: {
      id: String(b.rolId),
      codigoRol: (b.rolNombre || '').toUpperCase().replace(/\s+/g, '_'),
      nombreRol: b.rolNombre || '',
      descripcion: '',
      permisos,
      activo: true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    },
    estadoUsuario: b.estado ? EstadoUsuario.ACTIVO : EstadoUsuario.INACTIVO,
    activo: b.estado,
    ultimoAcceso: b.ultimoAcceso ? toDate(b.ultimoAcceso) : undefined,
    fechaCreacion: toDate(b.createdAt),
    fechaActualizacion: toDate(b.updatedAt),
  };
}

/**
 * Maps a backend RolResponse to the frontend Rol type.
 */
function mapRol(b: BackendRolResponse): Rol {
  const isSystem = b.esSistema || ['admin', 'cajero'].includes((b.nombre || '').toLowerCase());
  return {
    id: String(b.id),
    codigoRol: (b.nombre || '').toUpperCase().replace(/\s+/g, '_'),
    nombreRol: b.nombre,
    descripcion: b.descripcion || '',
    permisos: parsePermisos(b.permisos),
    activo: b.estado,
    esSistema: isSystem,
    cantidadUsuarios: b.cantidadUsuarios || 0,
    fechaCreacion: toDate(b.createdAt),
    fechaActualizacion: toDate(b.updatedAt),
  };
}

// ============================================================================
// API FUNCTIONS - USUARIOS
// ============================================================================

/**
 * Obtiene todos los usuarios con filtros y paginacion.
 * GET /api/v1/usuarios?rolId=&estado=&q=&page=&size=
 */
export async function getUsuarios(filtros?: UsuarioFiltros): Promise<UsuariosPaginados> {
  const params = new URLSearchParams();

  if (filtros?.q) params.append('q', filtros.q);
  if (filtros?.rolId) params.append('rolId', filtros.rolId);
  if (filtros?.estadoUsuario) {
    params.append('estado', filtros.estadoUsuario === EstadoUsuario.ACTIVO ? 'true' : 'false');
  }
  if (filtros?.activo !== undefined) {
    params.append('estado', String(filtros.activo));
  }

  // Pagination: frontend is 1-based, backend is 0-based
  const page = filtros?.page || 1;
  const limit = filtros?.limit || 10;
  const bp = toBackendPage(page, limit);
  params.append('page', String(bp.page));
  params.append('size', String(bp.size));

  const qs = params.toString();
  const endpoint = qs ? `/usuarios?${qs}` : '/usuarios';

  const res: ApiResponse<BackendUsuarioResponse[]> = await apiService.get<BackendUsuarioResponse[]>(endpoint);

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al cargar usuarios');
  }

  const usuarios = res.data.map(mapUsuario);
  const pagination = fromBackendPage(res.pagination);

  return { usuarios, pagination };
}

/**
 * Obtiene un usuario por su ID.
 * GET /api/v1/usuarios/{id}
 */
export async function getUsuarioById(id: string): Promise<Usuario | undefined> {
  const res: ApiResponse<BackendUsuarioResponse> = await apiService.get<BackendUsuarioResponse>(`/usuarios/${id}`);

  if (!res.success || !res.data) return undefined;
  return mapUsuario(res.data);
}

/**
 * Crea un nuevo usuario.
 * POST /api/v1/usuarios
 *
 * Backend expects: { email, username, password, nombre, apellido, rolId(Long) }
 */
export async function crearUsuario(data: CrearUsuarioDTO): Promise<Usuario> {
  const body = {
    email: data.email,
    username: data.usuario,
    password: data.password,
    nombre: data.nombres,
    apellido: data.apellidos,
    rolId: Number(data.rolId),
  };

  const res: ApiResponse<BackendUsuarioResponse> = await apiService.post<BackendUsuarioResponse>('/usuarios', body);

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al crear usuario');
  }

  return mapUsuario(res.data);
}

/**
 * Actualiza un usuario existente.
 * PUT /api/v1/usuarios/{id}
 *
 * Backend expects: { email, nombre, apellido, rolId(Long) }
 */
export async function actualizarUsuario(
  id: string,
  data: ActualizarUsuarioDTO
): Promise<Usuario | undefined> {
  const body: Record<string, unknown> = {};
  if (data.email !== undefined) body.email = data.email;
  if (data.nombres !== undefined) body.nombre = data.nombres;
  if (data.apellidos !== undefined) body.apellido = data.apellidos;
  if (data.rolId !== undefined) body.rolId = Number(data.rolId);

  const res: ApiResponse<BackendUsuarioResponse> = await apiService.put<BackendUsuarioResponse>(`/usuarios/${id}`, body);

  if (!res.success || !res.data) {
    if (res.message?.includes('no encontrado') || res.error?.includes('404')) return undefined;
    throw new Error(res.message || res.error || 'Error al actualizar usuario');
  }

  return mapUsuario(res.data);
}

/**
 * Elimina (desactiva) un usuario.
 * The backend has no DELETE endpoint, so this toggles estado via
 * PATCH /api/v1/usuarios/{id}/estado to deactivate the user.
 */
export async function eliminarUsuario(id: string): Promise<Usuario> {
  const res: ApiResponse<BackendUsuarioResponse> = await apiService.patch<BackendUsuarioResponse>(`/usuarios/${id}/estado`);

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al desactivar usuario');
  }

  return mapUsuario(res.data);
}

/**
 * Cambia el estado de un usuario (activar/desactivar).
 * PATCH /api/v1/usuarios/{id}/estado  (backend toggles the current state)
 */
export async function cambiarEstadoUsuario(
  id: string,
  _activo: boolean
): Promise<Usuario | undefined> {
  const res: ApiResponse<BackendUsuarioResponse> = await apiService.patch<BackendUsuarioResponse>(`/usuarios/${id}/estado`);

  if (!res.success || !res.data) {
    if (res.message?.includes('no encontrado') || res.error?.includes('404')) return undefined;
    throw new Error(res.message || res.error || 'Error al cambiar estado del usuario');
  }

  return mapUsuario(res.data);
}

/**
 * Verifica si un nombre de usuario ya existe.
 * No dedicated backend endpoint; uses search with q= and checks results.
 */
export async function verificarUsuario(
  usuario: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const res: ApiResponse<BackendUsuarioResponse[]> = await apiService.get<BackendUsuarioResponse[]>(
      `/usuarios?q=${encodeURIComponent(usuario)}&page=0&size=50`
    );

    if (!res.success || !res.data) return false;

    return res.data.some(
      (u) => u.username === usuario && String(u.id) !== excludeId
    );
  } catch {
    return false;
  }
}

// ============================================================================
// API FUNCTIONS - ROLES
// ============================================================================

/**
 * Obtiene todos los roles.
 * GET /api/v1/roles
 */
export async function getRoles(): Promise<Rol[]> {
  const res: ApiResponse<BackendRolResponse[]> = await apiService.get<BackendRolResponse[]>('/roles');

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al cargar roles');
  }

  return res.data.map(mapRol);
}

/**
 * Obtiene un rol por su ID.
 * No dedicated GET /roles/{id} endpoint; fetches all and filters.
 */
export async function getRolById(id: string): Promise<Rol | undefined> {
  const roles = await getRoles();
  return roles.find((r) => r.id === id);
}

/**
 * Crea un nuevo rol.
 * POST /api/v1/roles
 *
 * Backend expects: { nombre, descripcion, permisos(JSON string) }
 */
export async function crearRol(data: CrearRolDTO): Promise<Rol> {
  const body = {
    nombre: data.nombreRol,
    descripcion: data.descripcion || '',
    permisos: JSON.stringify(data.permisos),
  };

  const res: ApiResponse<BackendRolResponse> = await apiService.post<BackendRolResponse>('/roles', body);

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al crear rol');
  }

  return mapRol(res.data);
}

/**
 * Actualiza un rol existente.
 * PUT /api/v1/roles/{id}
 *
 * Backend expects CrearRolRequest: { nombre, descripcion, permisos(JSON string) }
 */
export async function actualizarRol(
  id: string,
  data: ActualizarRolDTO
): Promise<Rol | undefined> {
  // Backend PUT uses the same DTO as POST (CrearRolRequest).
  // We need to send all required fields. Fetch current state first if partial.
  let currentRol: Rol | undefined;
  if (!data.nombreRol || data.permisos === undefined) {
    currentRol = await getRolById(id);
  }

  const body = {
    nombre: data.nombreRol ?? currentRol?.nombreRol ?? '',
    descripcion: data.descripcion ?? currentRol?.descripcion ?? '',
    permisos: JSON.stringify(data.permisos ?? currentRol?.permisos ?? []),
  };

  const res: ApiResponse<BackendRolResponse> = await apiService.put<BackendRolResponse>(`/roles/${id}`, body);

  if (!res.success || !res.data) {
    if (res.message?.includes('no encontrado') || res.error?.includes('404')) return undefined;
    throw new Error(res.message || res.error || 'Error al actualizar rol');
  }

  return mapRol(res.data);
}

/**
 * Cambia el estado de un rol (activar/desactivar).
 * PATCH /api/v1/roles/{id}/estado  (backend toggles)
 */
export async function cambiarEstadoRol(
  id: string,
  _activo: boolean
): Promise<Rol | undefined> {
  const res: ApiResponse<BackendRolResponse> = await apiService.patch<BackendRolResponse>(`/roles/${id}/estado`);

  if (!res.success || !res.data) {
    if (res.message?.includes('no encontrado') || res.error?.includes('404')) return undefined;
    throw new Error(res.message || res.error || 'Error al cambiar estado del rol');
  }

  return mapRol(res.data);
}
