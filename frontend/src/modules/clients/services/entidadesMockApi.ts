/**
 * 🏢 MOCK API - ENTIDADES COMERCIALES
 * 
 * Simulación de API para gestión de clientes y proveedores.
 * Datos hardcoded de TIENDA DE ROPA Y ACCESORIOS.
 * 
 * @packageDocumentation
 */

import {
  TipoEntidad,
  TipoDocumento,
  EstadoEntidad
} from '@monorepo/shared-types';

import type {
  Entidad,
  EntidadesPaginadas,
  CrearEntidadDTO,
  ActualizarEntidadDTO,
  EntidadFiltros
} from '@monorepo/shared-types';

// ============= DATOS MOCK =============

/**
 * Base de datos simulada de entidades
 */
let MOCK_ENTIDADES: Entidad[] = [
  {
    id: 'ent-001',
    tipoEntidad: TipoEntidad.CLIENTE,
    nombres: 'Ana María',
    apellidos: 'Torres Vega',
    nombreCompleto: 'Ana María Torres Vega',
    tipoDocumento: TipoDocumento.DNI,
    numeroDocumento: '45678901',
    email: 'ana.torres@gmail.com',
    telefono: '987654321',
    direccion: 'Av. Universitaria 1225',
    referencia: 'Frente al Banco de la Nación',
    ubigeo: {
      departamentoId: '15',
      departamentoNombre: 'Lima',
      provinciaId: '1501',
      provinciaNombre: 'Lima',
      distritoId: '150115',
      distritoNombre: 'Los Olivos'
    },
    activo: true,
    estadoEntidad: EstadoEntidad.ACTIVO,
    limiteCredito: 1500,
    diasCredito: 30,
    descuentoHabitual: 5,
    fechaCreacion: new Date('2024-01-15T10:30:00').toISOString(),
    fechaModificacion: new Date('2024-01-15T10:30:00').toISOString(),
    usuarioCreacion: 'admin',
    notas: 'Cliente frecuente, compra ropa deportiva',
    etiquetas: ['vip', 'deportiva']
  },
  {
    id: 'ent-002',
    tipoEntidad: TipoEntidad.PROVEEDOR,
    razonSocial: 'TEXTILES GAMARRA S.A.C.',
    nombreComercial: 'Textiles Gamarra',
    tipoDocumento: TipoDocumento.RUC,
    numeroDocumento: '20456789123',
    email: 'ventas@textilesgamarra.com',
    telefono: '014567890',
    telefonoAlternativo: '987123456',
    direccion: 'Jr. Gamarra 452',
    referencia: 'Galería El Sol, Stand 23-24',
    ubigeo: {
      departamentoId: '15',
      departamentoNombre: 'Lima',
      provinciaId: '1501',
      provinciaNombre: 'Lima',
      distritoId: '150130',
      distritoNombre: 'La Victoria'
    },
    activo: true,
    estadoEntidad: EstadoEntidad.ACTIVO,
    diasCredito: 15,
    fechaCreacion: new Date('2023-11-20T14:20:00').toISOString(),
    fechaModificacion: new Date('2024-01-10T09:15:00').toISOString(),
    usuarioCreacion: 'admin',
    notas: 'Proveedor principal de telas',
    etiquetas: ['proveedor-principal', 'telas']
  },
  {
    id: 'ent-003',
    tipoEntidad: TipoEntidad.AMBOS,
    razonSocial: 'CONFECCIONES MARY E.I.R.L.',
    nombreComercial: 'Mary Confecciones',
    tipoDocumento: TipoDocumento.RUC,
    numeroDocumento: '20567890234',
    email: 'mary.confecciones@outlook.com',
    telefono: '016789012',
    direccion: 'Av. México 2340',
    ubigeo: {
      departamentoId: '15',
      departamentoNombre: 'Lima',
      provinciaId: '1501',
      provinciaNombre: 'Lima',
      distritoId: '150132',
      distritoNombre: 'Lince'
    },
    activo: true,
    estadoEntidad: EstadoEntidad.ACTIVO,
    limiteCredito: 3000,
    diasCredito: 45,
    descuentoHabitual: 8,
    fechaCreacion: new Date('2023-09-05T11:00:00').toISOString(),
    fechaModificacion: new Date('2023-12-20T16:45:00').toISOString(),
    usuarioCreacion: 'admin',
    notas: 'Cliente mayorista y proveedor de camisas',
    etiquetas: ['mayorista', 'camisas']
  },
  {
    id: 'ent-004',
    tipoEntidad: TipoEntidad.CLIENTE,
    nombres: 'Carlos',
    apellidos: 'Mendoza Ríos',
    nombreCompleto: 'Carlos Mendoza Ríos',
    tipoDocumento: TipoDocumento.DNI,
    numeroDocumento: '78901234',
    email: 'cmendoza@hotmail.com',
    telefono: '998877665',
    direccion: 'Calle Los Pinos 567',
    referencia: 'Casa verde, segunda cuadra',
    ubigeo: {
      departamentoId: '15',
      departamentoNombre: 'Lima',
      provinciaId: '1501',
      provinciaNombre: 'Lima',
      distritoId: '150140',
      distritoNombre: 'San Miguel'
    },
    activo: true,
    estadoEntidad: EstadoEntidad.ACTIVO,
    limiteCredito: 800,
    diasCredito: 15,
    fechaCreacion: new Date('2024-01-20T08:15:00').toISOString(),
    fechaModificacion: new Date('2024-01-20T08:15:00').toISOString(),
    usuarioCreacion: 'maria.lopez',
    etiquetas: ['nuevo']
  },
  {
    id: 'ent-005',
    tipoEntidad: TipoEntidad.PROVEEDOR,
    razonSocial: 'DISTRIBUIDORA FASHION PERÚ S.A.',
    nombreComercial: 'Fashion Perú',
    tipoDocumento: TipoDocumento.RUC,
    numeroDocumento: '20678901345',
    email: 'contacto@fashionperu.pe',
    telefono: '017890123',
    direccion: 'Av. Argentina 3456',
    ubigeo: {
      departamentoId: '07',
      departamentoNombre: 'Callao',
      provinciaId: '0701',
      provinciaNombre: 'Callao',
      distritoId: '070101',
      distritoNombre: 'Callao'
    },
    activo: true,
    estadoEntidad: EstadoEntidad.ACTIVO,
    diasCredito: 30,
    fechaCreacion: new Date('2023-08-10T13:30:00').toISOString(),
    fechaModificacion: new Date('2024-01-05T10:20:00').toISOString(),
    usuarioCreacion: 'admin',
    notas: 'Importador de accesorios',
    etiquetas: ['importador', 'accesorios']
  },
  {
    id: 'ent-006',
    tipoEntidad: TipoEntidad.CLIENTE,
    nombres: 'Laura',
    apellidos: 'Fernández Cruz',
    nombreCompleto: 'Laura Fernández Cruz',
    tipoDocumento: TipoDocumento.DNI,
    numeroDocumento: '56789012',
    email: 'lfernandez@yahoo.com',
    telefono: '923456789',
    direccion: 'Jr. Las Flores 890',
    ubigeo: {
      departamentoId: '15',
      departamentoNombre: 'Lima',
      provinciaId: '1501',
      provinciaNombre: 'Lima',
      distritoId: '150108',
      distritoNombre: 'Jesús María'
    },
    activo: false,
    estadoEntidad: EstadoEntidad.INACTIVO,
    limiteCredito: 500,
    diasCredito: 0,
    fechaCreacion: new Date('2023-05-12T09:00:00').toISOString(),
    fechaModificacion: new Date('2023-11-30T15:00:00').toISOString(),
    usuarioCreacion: 'admin',
    notas: 'Cliente inactivo desde noviembre 2023'
  },
  {
    id: 'ent-007',
    tipoEntidad: TipoEntidad.CLIENTE,
    nombres: 'Roberto',
    apellidos: 'Silva Paredes',
    nombreCompleto: 'Roberto Silva Paredes',
    tipoDocumento: TipoDocumento.DNI,
    numeroDocumento: '34567890',
    email: 'rsilva@gmail.com',
    telefono: '945678901',
    direccion: 'Av. Javier Prado 2345',
    referencia: 'Edificio azul, departamento 501',
    ubigeo: {
      departamentoId: '15',
      departamentoNombre: 'Lima',
      provinciaId: '1501',
      provinciaNombre: 'Lima',
      distritoId: '150143',
      distritoNombre: 'San Isidro'
    },
    activo: true,
    estadoEntidad: EstadoEntidad.ACTIVO,
    limiteCredito: 2000,
    diasCredito: 60,
    descuentoHabitual: 10,
    fechaCreacion: new Date('2023-07-18T10:45:00').toISOString(),
    fechaModificacion: new Date('2024-01-22T14:30:00').toISOString(),
    usuarioCreacion: 'admin',
    notas: 'Cliente VIP, compras frecuentes de ropa ejecutiva',
    etiquetas: ['vip', 'ejecutiva', 'premium']
  },
  {
    id: 'ent-008',
    tipoEntidad: TipoEntidad.PROVEEDOR,
    razonSocial: 'BORDADOS Y SUBLIMACIONES PERÚ S.R.L.',
    nombreComercial: 'Bordados Perú',
    tipoDocumento: TipoDocumento.RUC,
    numeroDocumento: '20789012456',
    email: 'bordados@bordadosperu.com',
    telefono: '018901234',
    direccion: 'Calle Industrial 123',
    ubigeo: {
      departamentoId: '15',
      departamentoNombre: 'Lima',
      provinciaId: '1501',
      provinciaNombre: 'Lima',
      distritoId: '150114',
      distritoNombre: 'Ate'
    },
    activo: true,
    estadoEntidad: EstadoEntidad.ACTIVO,
    diasCredito: 20,
    fechaCreacion: new Date('2023-10-03T12:00:00').toISOString(),
    fechaModificacion: new Date('2024-01-12T11:00:00').toISOString(),
    usuarioCreacion: 'admin',
    notas: 'Proveedor de servicios de bordado',
    etiquetas: ['servicio', 'bordado']
  }
];

// ============= FUNCIONES AUXILIARES =============

/**
 * Normaliza texto para búsqueda (elimina acentos, mayúsculas)
 */
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Verifica si una entidad coincide con los filtros
 */
function coincideConFiltros(entidad: Entidad, filtros: EntidadFiltros): boolean {
  // Filtro de búsqueda general
  if (filtros.q) {
    const q = normalizarTexto(filtros.q);
    const nombreCompleto = normalizarTexto(entidad.nombreCompleto || '');
    const razonSocial = normalizarTexto(entidad.razonSocial || '');
    const documento = entidad.numeroDocumento.toLowerCase();
    const email = normalizarTexto(entidad.email || '');
    
    if (
      !nombreCompleto.includes(q) &&
      !razonSocial.includes(q) &&
      !documento.includes(q) &&
      !email.includes(q)
    ) {
      return false;
    }
  }

  // Filtro por tipo de entidad
  if (filtros.tipoEntidad && entidad.tipoEntidad !== filtros.tipoEntidad) {
    return false;
  }

  // Filtro por tipo de documento
  if (filtros.tipoDocumento && entidad.tipoDocumento !== filtros.tipoDocumento) {
    return false;
  }

  // Filtro por estado
  if (filtros.estadoEntidad && entidad.estadoEntidad !== filtros.estadoEntidad) {
    return false;
  }

  // Filtro por activo
  if (filtros.activo !== undefined && entidad.activo !== filtros.activo) {
    return false;
  }

  // Filtro por departamento
  if (filtros.departamentoId && entidad.ubigeo.departamentoId !== filtros.departamentoId) {
    return false;
  }

  // Filtro por provincia
  if (filtros.provinciaId && entidad.ubigeo.provinciaId !== filtros.provinciaId) {
    return false;
  }

  // Filtro por distrito
  if (filtros.distritoId && entidad.ubigeo.distritoId !== filtros.distritoId) {
    return false;
  }

  return true;
}

// ============= API MOCK FUNCTIONS =============

/**
 * Obtener lista de entidades con filtros y paginación
 */
export async function getEntidades(filtros: EntidadFiltros = {}): Promise<EntidadesPaginadas> {
  // Simular latencia de red
  await new Promise(resolve => setTimeout(resolve, 800));

  const page = filtros.page || 1;
  const limit = filtros.limit || 10;

  // Aplicar filtros
  let entidadesFiltradas = MOCK_ENTIDADES.filter(ent => coincideConFiltros(ent, filtros));

  // Calcular paginación
  const total = entidadesFiltradas.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Obtener página actual
  const entidadesPagina = entidadesFiltradas.slice(startIndex, endIndex);

  console.log(`📦 [entidadesMockApi] getEntidades: ${entidadesPagina.length} entidades (página ${page}/${totalPages})`);

  return {
    entidades: entidadesPagina,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

/**
 * Obtener entidad por ID
 */
export async function getEntidadById(id: string): Promise<Entidad | null> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const entidad = MOCK_ENTIDADES.find(e => e.id === id);
  
  console.log(`🔍 [entidadesMockApi] getEntidadById(${id}):`, entidad ? 'Encontrada' : 'No encontrada');
  
  return entidad || null;
}

/**
 * Crear nueva entidad
 */
export async function crearEntidad(data: CrearEntidadDTO): Promise<Entidad> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Validar documento único
  const existeDocumento = MOCK_ENTIDADES.some(e => e.numeroDocumento === data.numeroDocumento);
  if (existeDocumento) {
    throw new Error(`Ya existe una entidad con el documento ${data.numeroDocumento}`);
  }

  // Generar ID
  const newId = `ent-${String(MOCK_ENTIDADES.length + 1).padStart(3, '0')}`;

  // Construir nombreCompleto si es persona natural
  let nombreCompleto: string | undefined;
  if (data.nombres && data.apellidos) {
    nombreCompleto = `${data.nombres} ${data.apellidos}`;
  }

  // Crear nueva entidad
  const nuevaEntidad: Entidad = {
    id: newId,
    tipoEntidad: data.tipoEntidad,
    nombres: data.nombres,
    apellidos: data.apellidos,
    nombreCompleto,
    razonSocial: data.razonSocial,
    nombreComercial: data.nombreComercial,
    tipoDocumento: data.tipoDocumento,
    numeroDocumento: data.numeroDocumento,
    email: data.email,
    telefono: data.telefono,
    telefonoAlternativo: data.telefonoAlternativo,
    direccion: data.direccion,
    referencia: data.referencia,
    ubigeo: {
      departamentoId: data.departamentoId,
      provinciaId: data.provinciaId,
      distritoId: data.distritoId
    },
    activo: true,
    estadoEntidad: EstadoEntidad.ACTIVO,
    limiteCredito: data.limiteCredito,
    diasCredito: data.diasCredito,
    descuentoHabitual: data.descuentoHabitual,
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
    usuarioCreacion: 'current-user',
    notas: data.notas,
    etiquetas: data.etiquetas
  };

  MOCK_ENTIDADES.push(nuevaEntidad);

  console.log(`✅ [entidadesMockApi] crearEntidad: ${newId} - ${nombreCompleto || data.razonSocial}`);

  return nuevaEntidad;
}

/**
 * Actualizar entidad existente
 */
export async function actualizarEntidad(id: string, data: ActualizarEntidadDTO): Promise<Entidad | null> {
  await new Promise(resolve => setTimeout(resolve, 900));

  const index = MOCK_ENTIDADES.findIndex(e => e.id === id);
  if (index === -1) {
    console.error(`❌ [entidadesMockApi] actualizarEntidad: Entidad ${id} no encontrada`);
    return null;
  }

  const entidadActual = MOCK_ENTIDADES[index];

  // Actualizar nombreCompleto si cambian nombres o apellidos
  let nombreCompleto = entidadActual.nombreCompleto;
  if (data.nombres !== undefined || data.apellidos !== undefined) {
    const nombres = data.nombres ?? entidadActual.nombres;
    const apellidos = data.apellidos ?? entidadActual.apellidos;
    if (nombres && apellidos) {
      nombreCompleto = `${nombres} ${apellidos}`;
    }
  }

  // Actualizar ubigeo
  const ubigeo = { ...entidadActual.ubigeo };
  if (data.departamentoId) ubigeo.departamentoId = data.departamentoId;
  if (data.provinciaId) ubigeo.provinciaId = data.provinciaId;
  if (data.distritoId) ubigeo.distritoId = data.distritoId;

  // Merge de datos
  const entidadActualizada: Entidad = {
    ...entidadActual,
    ...data,
    nombreCompleto,
    ubigeo,
    fechaModificacion: new Date().toISOString(),
    usuarioModificacion: 'current-user'
  };

  MOCK_ENTIDADES[index] = entidadActualizada;

  console.log(`🔄 [entidadesMockApi] actualizarEntidad: ${id}`);

  return entidadActualizada;
}

/**
 * Eliminar entidad (soft delete - marcar como inactiva)
 */
export async function eliminarEntidad(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 700));

  const index = MOCK_ENTIDADES.findIndex(e => e.id === id);
  if (index === -1) {
    console.error(`❌ [entidadesMockApi] eliminarEntidad: Entidad ${id} no encontrada`);
    return false;
  }

  MOCK_ENTIDADES[index] = {
    ...MOCK_ENTIDADES[index],
    activo: false,
    estadoEntidad: EstadoEntidad.INACTIVO,
    fechaModificacion: new Date().toISOString()
  };

  console.log(`🗑️ [entidadesMockApi] eliminarEntidad: ${id} marcada como inactiva`);

  return true;
}

/**
 * Cambiar estado de entidad (activar/desactivar)
 */
export async function cambiarEstadoEntidad(id: string, activo: boolean): Promise<Entidad | null> {
  await new Promise(resolve => setTimeout(resolve, 600));

  const index = MOCK_ENTIDADES.findIndex(e => e.id === id);
  if (index === -1) {
    return null;
  }

  MOCK_ENTIDADES[index] = {
    ...MOCK_ENTIDADES[index],
    activo,
    estadoEntidad: activo ? EstadoEntidad.ACTIVO : EstadoEntidad.INACTIVO,
    fechaModificacion: new Date().toISOString()
  };

  console.log(`🔄 [entidadesMockApi] cambiarEstadoEntidad: ${id} -> ${activo ? 'ACTIVO' : 'INACTIVO'}`);

  return MOCK_ENTIDADES[index];
}

/**
 * Verificar si un documento ya está registrado
 */
export async function verificarDocumento(numeroDocumento: string, excludeId?: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 400));

  const existe = MOCK_ENTIDADES.some(
    e => e.numeroDocumento === numeroDocumento && e.id !== excludeId
  );

  return existe;
}
