/**
 * 🏢 ENTIDADES COMERCIALES - TIPOS
 * 
 * Tipos para gestión de clientes y proveedores de una tienda de ropa.
 * Incluye información de contacto, documentación fiscal y ubicación geográfica.
 * 
 * @packageDocumentation
 */

// ============= ENUMS =============

/**
 * Tipo de entidad comercial
 */
export enum TipoEntidad {
  CLIENTE = 'Cliente',
  PROVEEDOR = 'Proveedor',
  AMBOS = 'Ambos'
}

/**
 * Tipos de documentos de identidad válidos en Perú
 */
export enum TipoDocumento {
  DNI = 'DNI',      // 8 dígitos - Personas naturales
  CE = 'CE',        // Carnet de Extranjería
  RUC = 'RUC',      // 11 dígitos - Personas jurídicas
  PASAPORTE = 'Pasaporte'
}

/**
 * Estados de una entidad comercial
 */
export enum EstadoEntidad {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  BLOQUEADO = 'BLOQUEADO'
}

// ============= INTERFACES PRINCIPALES =============

/**
 * Información de ubicación geográfica (Perú - Ubigeo)
 */
export interface Ubigeo {
  departamentoId: string;
  departamentoNombre?: string;
  provinciaId: string;
  provinciaNombre?: string;
  distritoId: string;
  distritoNombre?: string;
}

/**
 * Entidad Comercial (Cliente/Proveedor)
 */
export interface Entidad {
  id: string;
  tipoEntidad: TipoEntidad;
  
  // Datos personales (para personas naturales)
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string; // Computed: nombres + apellidos
  
  // Datos empresariales (para personas jurídicas)
  razonSocial?: string;
  nombreComercial?: string;
  
  // Documentación
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  
  // Contacto
  email?: string;
  telefono?: string;
  telefonoAlternativo?: string;
  
  // Ubicación
  direccion: string;
  referencia?: string;
  ubigeo: Ubigeo;
  
  // Estado
  activo: boolean;
  estadoEntidad: EstadoEntidad;
  
  // Configuración comercial
  limiteCredito?: number;
  diasCredito?: number;
  descuentoHabitual?: number; // Porcentaje (0-100)
  
  // Auditoría
  fechaCreacion: string; // ISO 8601
  fechaModificacion: string;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  
  // Metadatos
  notas?: string;
  etiquetas?: string[]; // Para categorización custom
}

// ============= DTOs (Data Transfer Objects) =============

/**
 * DTO para crear una nueva entidad
 */
export interface CrearEntidadDTO {
  tipoEntidad: TipoEntidad;
  
  // Datos personales/empresariales
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  nombreComercial?: string;
  
  // Documentación
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  
  // Contacto
  email?: string;
  telefono?: string;
  telefonoAlternativo?: string;
  
  // Ubicación
  direccion: string;
  referencia?: string;
  departamentoId: string;
  provinciaId: string;
  distritoId: string;
  
  // Configuración comercial
  limiteCredito?: number;
  diasCredito?: number;
  descuentoHabitual?: number;
  
  // Metadatos
  notas?: string;
  etiquetas?: string[];
}

/**
 * DTO para actualizar una entidad existente
 */
export interface ActualizarEntidadDTO {
  tipoEntidad?: TipoEntidad;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  nombreComercial?: string;
  email?: string;
  telefono?: string;
  telefonoAlternativo?: string;
  direccion?: string;
  referencia?: string;
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  limiteCredito?: number;
  diasCredito?: number;
  descuentoHabitual?: number;
  notas?: string;
  etiquetas?: string[];
  activo?: boolean;
}

/**
 * Filtros para búsqueda de entidades
 */
export interface EntidadFiltros {
  page?: number;
  limit?: number;
  q?: string; // Búsqueda general (nombre, razón social, documento)
  tipoEntidad?: TipoEntidad;
  tipoDocumento?: TipoDocumento;
  estadoEntidad?: EstadoEntidad;
  activo?: boolean;
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  fechaDesde?: string; // ISO 8601
  fechaHasta?: string;
  etiquetas?: string[];
}

/**
 * Respuesta paginada de entidades
 */
export interface EntidadesPaginadas {
  entidades: Entidad[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Estadísticas de entidades
 */
export interface EntidadEstadisticas {
  totalEntidades: number;
  totalClientes: number;
  totalProveedores: number;
  entidadesAmbos: number;
  entidadesActivas: number;
  entidadesInactivas: number;
  entidadesBloqueadas: number;
  creditoTotalOtorgado: number;
  porTipoDocumento: {
    dni: number;
    ruc: number;
    ce: number;
    pasaporte: number;
  };
}
