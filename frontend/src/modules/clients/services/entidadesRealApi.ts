/**
 * REAL API - ENTIDADES COMERCIALES (Clientes / Proveedores)
 *
 * Reemplaza entidadesMockApi.ts con llamadas reales al backend via apiService.
 * Exporta exactamente las mismas funciones y firmas que el mock.
 *
 * @packageDocumentation
 */

import { apiService, toBackendPage, fromBackendPage } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

import {
  TipoEntidad,
  TipoDocumento,
  EstadoEntidad,
} from '@monorepo/shared-types';

import type {
  Entidad,
  EntidadesPaginadas,
  CrearEntidadDTO,
  ActualizarEntidadDTO,
  EntidadFiltros,
} from '@monorepo/shared-types';

// ============= TIPOS BACKEND =============

/** Forma de la entidad que llega del backend (EntidadResponse.java) */
interface BackendEntidad {
  id: number;
  tipoEntidad: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  email?: string;
  telefono?: string;
  direccion: string;
  departamentoId?: number;
  provinciaId?: number;
  distritoId?: number;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============= ENUM CONVERSION HELPERS =============

/** Backend -> Frontend TipoEntidad: CLIENTE -> 'Cliente', PROVEEDOR -> 'Proveedor', AMBOS -> 'Ambos' */
const BACKEND_TO_FRONTEND_TIPO_ENTIDAD: Record<string, TipoEntidad> = {
  CLIENTE: TipoEntidad.CLIENTE,
  PROVEEDOR: TipoEntidad.PROVEEDOR,
  AMBOS: TipoEntidad.AMBOS,
};

/** Frontend -> Backend TipoEntidad: 'Cliente' -> 'CLIENTE', etc. */
const FRONTEND_TO_BACKEND_TIPO_ENTIDAD: Record<string, string> = {
  [TipoEntidad.CLIENTE]: 'CLIENTE',
  [TipoEntidad.PROVEEDOR]: 'PROVEEDOR',
  [TipoEntidad.AMBOS]: 'AMBOS',
};

function toFrontendTipoEntidad(val: string): TipoEntidad {
  return BACKEND_TO_FRONTEND_TIPO_ENTIDAD[val] || BACKEND_TO_FRONTEND_TIPO_ENTIDAD[val.toUpperCase()] || val as TipoEntidad;
}

function toBackendTipoEntidad(val: string): string {
  return FRONTEND_TO_BACKEND_TIPO_ENTIDAD[val] || val.toUpperCase();
}

/** Backend -> Frontend TipoDocumento: PASAPORTE -> 'Pasaporte', others match */
function toFrontendTipoDocumento(val: string): TipoDocumento {
  if (val === 'PASAPORTE') return TipoDocumento.PASAPORTE;
  return val as TipoDocumento;
}

/** Frontend -> Backend TipoDocumento: 'Pasaporte' -> 'PASAPORTE', others match */
function toBackendTipoDocumento(val: string): string {
  if (val === 'Pasaporte' || val === TipoDocumento.PASAPORTE) return 'PASAPORTE';
  return val;
}

// ============= MAPEO BACKEND -> FRONTEND =============

/**
 * Convierte una entidad del backend al tipo Entidad del frontend.
 */
function mapBackendEntidad(b: BackendEntidad): Entidad {
  const nombres = b.nombres || undefined;
  const apellidos = b.apellidos || undefined;
  let nombreCompleto: string | undefined;
  if (nombres && apellidos) {
    nombreCompleto = `${nombres} ${apellidos}`;
  }

  const activo = b.estado === true;

  return {
    id: String(b.id),
    tipoEntidad: toFrontendTipoEntidad(b.tipoEntidad),
    nombres,
    apellidos,
    nombreCompleto,
    razonSocial: b.razonSocial || undefined,
    tipoDocumento: toFrontendTipoDocumento(b.tipoDocumento),
    numeroDocumento: b.numeroDocumento,
    email: b.email || undefined,
    telefono: b.telefono || undefined,
    direccion: b.direccion,
    ubigeo: {
      departamentoId: b.departamentoId != null ? String(b.departamentoId) : '',
      provinciaId: b.provinciaId != null ? String(b.provinciaId) : '',
      distritoId: b.distritoId != null ? String(b.distritoId) : '',
    },
    activo,
    estadoEntidad: activo ? EstadoEntidad.ACTIVO : EstadoEntidad.INACTIVO,
    fechaCreacion: b.createdAt,
    fechaModificacion: b.updatedAt,
  };
}

// ============= MAPEO FRONTEND -> BACKEND (Request bodies) =============

/**
 * Construye el body para POST/PUT /entidades a partir de los DTOs del frontend.
 */
function buildEntidadRequestBody(
  data: CrearEntidadDTO | ActualizarEntidadDTO,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if ('tipoEntidad' in data && data.tipoEntidad != null) {
    body.tipoEntidad = toBackendTipoEntidad(data.tipoEntidad);
  }
  if ('tipoDocumento' in data && (data as CrearEntidadDTO).tipoDocumento != null) {
    body.tipoDocumento = toBackendTipoDocumento((data as CrearEntidadDTO).tipoDocumento);
  }
  if ('numeroDocumento' in data && (data as CrearEntidadDTO).numeroDocumento != null) {
    body.numeroDocumento = (data as CrearEntidadDTO).numeroDocumento;
  }
  if (data.nombres !== undefined) body.nombres = data.nombres;
  if (data.apellidos !== undefined) body.apellidos = data.apellidos;
  if (data.razonSocial !== undefined) body.razonSocial = data.razonSocial;
  if (data.email !== undefined) body.email = data.email;
  if (data.telefono !== undefined) body.telefono = data.telefono;
  if (data.direccion !== undefined) body.direccion = data.direccion;

  // ubigeo ids: frontend uses strings, backend expects Long (number)
  if ('departamentoId' in data && data.departamentoId != null) {
    body.departamentoId = Number(data.departamentoId);
  }
  if ('provinciaId' in data && data.provinciaId != null) {
    body.provinciaId = Number(data.provinciaId);
  }
  if ('distritoId' in data && data.distritoId != null) {
    body.distritoId = Number(data.distritoId);
  }

  return body;
}

// ============= API FUNCTIONS =============

/**
 * Obtener lista de entidades con filtros y paginacion.
 * GET /entidades?tipoEntidad&q&page&size
 */
export async function getEntidades(filtros: EntidadFiltros = {}): Promise<EntidadesPaginadas> {
  const pagina = filtros.page ?? 1;
  const limite = filtros.limit ?? 10;
  const { page, size } = toBackendPage(pagina, limite);

  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('size', String(size));

  if (filtros.tipoEntidad) params.append('tipoEntidad', filtros.tipoEntidad);
  if (filtros.q) params.append('q', filtros.q);

  const endpoint = `/entidades?${params.toString()}`;
  const res: ApiResponse<BackendEntidad[]> = await apiService.get(endpoint);

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al cargar entidades');
  }

  const pag = fromBackendPage(res.pagination);

  return {
    entidades: res.data.map(mapBackendEntidad),
    pagination: {
      page: pag.page,
      limit: pag.limit,
      total: pag.total,
      totalPages: pag.pages,
    },
  };
}

/**
 * Obtener entidad por ID.
 * GET /entidades/{id}
 */
export async function getEntidadById(id: string): Promise<Entidad | null> {
  const res: ApiResponse<BackendEntidad> = await apiService.get(`/entidades/${id}`);

  if (!res.success || !res.data) {
    return null;
  }
  return mapBackendEntidad(res.data);
}

/**
 * Crear nueva entidad.
 * POST /entidades
 */
export async function crearEntidad(data: CrearEntidadDTO): Promise<Entidad> {
  const body = buildEntidadRequestBody(data);
  const res: ApiResponse<BackendEntidad> = await apiService.post('/entidades', body);

  if (!res.success || !res.data) {
    throw new Error(res.message || res.error || 'Error al crear entidad');
  }
  return mapBackendEntidad(res.data);
}

/**
 * Actualizar entidad existente.
 * PUT /entidades/{id}
 */
export async function actualizarEntidad(
  id: string,
  data: ActualizarEntidadDTO,
): Promise<Entidad | null> {
  const body = buildEntidadRequestBody(data);
  const res: ApiResponse<BackendEntidad> = await apiService.put(`/entidades/${id}`, body);

  if (!res.success || !res.data) {
    return null;
  }
  return mapBackendEntidad(res.data);
}

/**
 * Eliminar entidad (soft delete - marca como inactiva).
 * DELETE /entidades/{id}
 */
export async function eliminarEntidad(id: string): Promise<boolean> {
  const res: ApiResponse<void> = await apiService.delete(`/entidades/${id}`);
  return res.success === true;
}

/**
 * Cambiar estado de entidad (activar/desactivar).
 * - activo=true  -> POST /entidades/{id}/reactivate
 * - activo=false -> DELETE /entidades/{id}
 */
export async function cambiarEstadoEntidad(
  id: string,
  activo: boolean,
): Promise<Entidad | null> {
  if (activo) {
    // Reactivar
    const res: ApiResponse<BackendEntidad> = await apiService.post(
      `/entidades/${id}/reactivate`,
      {},
    );
    if (!res.success || !res.data) {
      return null;
    }
    return mapBackendEntidad(res.data);
  } else {
    // Desactivar (soft delete)
    const res: ApiResponse<void> = await apiService.delete(`/entidades/${id}`);
    if (!res.success) {
      return null;
    }
    // Backend DELETE may not return the updated entity, so fetch it
    return getEntidadById(id);
  }
}

/**
 * Verificar si un numero de documento ya esta registrado.
 * Usa GET /entidades/buscar-documento?tipo&numero cuando sea posible,
 * o GET /entidades?q=<doc>&size=1 como fallback.
 */
export async function verificarDocumento(
  numeroDocumento: string,
  excludeId?: string,
): Promise<boolean> {
  // Use general search to find entities with this document number
  const params = new URLSearchParams();
  params.append('q', numeroDocumento);
  params.append('size', '5');
  params.append('page', '0');

  const res: ApiResponse<BackendEntidad[]> = await apiService.get(
    `/entidades?${params.toString()}`,
  );

  if (!res.success || !res.data) {
    return false;
  }

  // Check if any returned entity has exact document match and a different id
  return res.data.some(
    (e) => e.numeroDocumento === numeroDocumento && String(e.id) !== excludeId,
  );
}
