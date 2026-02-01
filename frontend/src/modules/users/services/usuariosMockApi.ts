/**
 * 👥 MOCK API - USUARIOS Y ROLES
 * 
 * Simulación de backend para el módulo de Usuarios.
 * Datos: Administradores, Vendedores, Almaceneros, Cajeros
 * 
 * Latencia: 800ms simulada para emular red real.
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
  ActualizarRolDTO
} from '@monorepo/shared-types';
import { EstadoUsuario, RolUsuario } from '@monorepo/shared-types';

// ============================================================================
// MAESTROS MOCK - ROLES
// ============================================================================

/**
 * Roles disponibles en el sistema
 */
const MOCK_ROLES: Rol[] = [
  {
    id: '1',
    codigoRol: 'ADMIN',
    nombreRol: 'Administrador',
    descripcion: 'Acceso total al sistema',
    permisos: ['*'],
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '2',
    codigoRol: 'GERENTE',
    nombreRol: 'Gerente',
    descripcion: 'Supervisión y reportes',
    permisos: ['ventas', 'compras', 'inventario', 'reportes', 'usuarios.read'],
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '3',
    codigoRol: 'VENDEDOR',
    nombreRol: 'Vendedor',
    descripcion: 'Gestión de ventas y clientes',
    permisos: ['ventas', 'clientes', 'productos.read'],
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '4',
    codigoRol: 'ALMACENERO',
    nombreRol: 'Almacenero',
    descripcion: 'Gestión de inventario y almacenes',
    permisos: ['inventario', 'productos', 'almacenes'],
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '5',
    codigoRol: 'CAJERO',
    nombreRol: 'Cajero',
    descripcion: 'Gestión de caja y ventas',
    permisos: ['ventas', 'caja'],
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  }
];

// ============================================================================
// DATOS MOCK - USUARIOS
// ============================================================================

/**
 * Usuarios del sistema
 */
let MOCK_USUARIOS: Usuario[] = [
  {
    id: '1',
    usuario: 'admin',
    email: 'admin@alexatech.com',
    nombres: 'Carlos',
    apellidos: 'Rodríguez',
    nombreCompleto: 'Carlos Rodríguez',
    rolId: '1',
    rol: MOCK_ROLES[0],
    estadoUsuario: EstadoUsuario.ACTIVO,
    activo: true,
    ultimoAcceso: new Date('2026-01-26T18:30:00'),
    usuarioCreacion: 'system',
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2026-01-26')
  },
  {
    id: '2',
    usuario: 'maria.lopez',
    email: 'maria.lopez@alexatech.com',
    nombres: 'María',
    apellidos: 'López García',
    nombreCompleto: 'María López García',
    rolId: '2',
    rol: MOCK_ROLES[1],
    estadoUsuario: EstadoUsuario.ACTIVO,
    activo: true,
    ultimoAcceso: new Date('2026-01-26T17:45:00'),
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-02-15'),
    fechaActualizacion: new Date('2026-01-20')
  },
  {
    id: '3',
    usuario: 'juan.perez',
    email: 'juan.perez@alexatech.com',
    nombres: 'Juan',
    apellidos: 'Pérez Martínez',
    nombreCompleto: 'Juan Pérez Martínez',
    rolId: '3',
    rol: MOCK_ROLES[2],
    estadoUsuario: EstadoUsuario.ACTIVO,
    activo: true,
    ultimoAcceso: new Date('2026-01-26T16:20:00'),
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-03-10'),
    fechaActualizacion: new Date('2026-01-15')
  },
  {
    id: '4',
    usuario: 'ana.torres',
    email: 'ana.torres@alexatech.com',
    nombres: 'Ana',
    apellidos: 'Torres Silva',
    nombreCompleto: 'Ana Torres Silva',
    rolId: '3',
    rol: MOCK_ROLES[2],
    estadoUsuario: EstadoUsuario.ACTIVO,
    activo: true,
    ultimoAcceso: new Date('2026-01-26T15:10:00'),
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-04-05'),
    fechaActualizacion: new Date('2026-01-10')
  },
  {
    id: '5',
    usuario: 'pedro.gomez',
    email: 'pedro.gomez@alexatech.com',
    nombres: 'Pedro',
    apellidos: 'Gómez Ruiz',
    nombreCompleto: 'Pedro Gómez Ruiz',
    rolId: '4',
    rol: MOCK_ROLES[3],
    estadoUsuario: EstadoUsuario.ACTIVO,
    activo: true,
    ultimoAcceso: new Date('2026-01-26T14:30:00'),
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-05-20'),
    fechaActualizacion: new Date('2026-01-05')
  },
  {
    id: '6',
    usuario: 'lucia.sanchez',
    email: 'lucia.sanchez@alexatech.com',
    nombres: 'Lucía',
    apellidos: 'Sánchez Morales',
    nombreCompleto: 'Lucía Sánchez Morales',
    rolId: '5',
    rol: MOCK_ROLES[4],
    estadoUsuario: EstadoUsuario.ACTIVO,
    activo: true,
    ultimoAcceso: new Date('2026-01-26T13:00:00'),
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-06-12'),
    fechaActualizacion: new Date('2025-12-28')
  },
  {
    id: '7',
    usuario: 'roberto.diaz',
    email: 'roberto.diaz@alexatech.com',
    nombres: 'Roberto',
    apellidos: 'Díaz Fernández',
    nombreCompleto: 'Roberto Díaz Fernández',
    rolId: '3',
    rol: MOCK_ROLES[2],
    estadoUsuario: EstadoUsuario.INACTIVO,
    activo: false,
    ultimoAcceso: new Date('2025-12-15T10:00:00'),
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-07-08'),
    fechaActualizacion: new Date('2025-12-20')
  },
  {
    id: '8',
    usuario: 'sofia.cruz',
    email: 'sofia.cruz@alexatech.com',
    nombres: 'Sofía',
    apellidos: 'Cruz Vargas',
    nombreCompleto: 'Sofía Cruz Vargas',
    rolId: '4',
    rol: MOCK_ROLES[3],
    estadoUsuario: EstadoUsuario.ACTIVO,
    activo: true,
    ultimoAcceso: new Date('2026-01-25T18:00:00'),
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-08-22'),
    fechaActualizacion: new Date('2026-01-01')
  }
];

// ============================================================================
// FUNCIONES MOCK API - USUARIOS
// ============================================================================

/**
 * Obtiene todos los usuarios con filtros y paginación
 * @param filtros - Filtros opcionales de búsqueda
 * @returns Promise con usuarios paginados
 */
export async function getUsuarios(filtros?: UsuarioFiltros): Promise<UsuariosPaginados> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let usuarios = [...MOCK_USUARIOS];
  
  // Aplicar filtro de búsqueda
  if (filtros?.q) {
    const query = filtros.q.toLowerCase();
    usuarios = usuarios.filter(u => 
      u.usuario.toLowerCase().includes(query) ||
      u.nombres.toLowerCase().includes(query) ||
      u.apellidos.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.nombreCompleto?.toLowerCase().includes(query)
    );
  }
  
  // Filtrar por rol
  if (filtros?.rolId) {
    usuarios = usuarios.filter(u => u.rolId === filtros.rolId);
  }
  
  // Filtrar por estado
  if (filtros?.estadoUsuario) {
    usuarios = usuarios.filter(u => u.estadoUsuario === filtros.estadoUsuario);
  }
  
  // Filtrar por activo
  if (filtros?.activo !== undefined) {
    usuarios = usuarios.filter(u => u.activo === filtros.activo);
  }
  
  // Paginación
  const page = filtros?.page || 1;
  const limit = filtros?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const usuariosPaginados = usuarios.slice(startIndex, endIndex);
  
  return {
    usuarios: usuariosPaginados,
    pagination: {
      page,
      limit,
      total: usuarios.length,
      pages: Math.ceil(usuarios.length / limit)
    }
  };
}

/**
 * Obtiene un usuario por su ID
 * @param id - ID del usuario
 * @returns Promise con el usuario o undefined
 */
export async function getUsuarioById(id: string): Promise<Usuario | undefined> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_USUARIOS.find(u => u.id === id);
}

/**
 * Crea un nuevo usuario
 * @param data - DTO con datos del nuevo usuario
 * @returns Promise con el usuario creado
 */
export async function crearUsuario(data: CrearUsuarioDTO): Promise<Usuario> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const rol = MOCK_ROLES.find(r => r.id === data.rolId);
  
  const nuevoUsuario: Usuario = {
    id: (MOCK_USUARIOS.length + 1).toString(),
    usuario: data.usuario,
    email: data.email,
    nombres: data.nombres,
    apellidos: data.apellidos,
    nombreCompleto: `${data.nombres} ${data.apellidos}`,
    rolId: data.rolId,
    rol,
    estadoUsuario: EstadoUsuario.ACTIVO,
    activo: data.activo !== undefined ? data.activo : true,
    usuarioCreacion: 'admin',
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  };
  
  MOCK_USUARIOS.push(nuevoUsuario);
  return nuevoUsuario;
}

/**
 * Actualiza un usuario existente
 * @param id - ID del usuario
 * @param data - Datos parciales a actualizar
 * @returns Promise con el usuario actualizado o undefined
 */
export async function actualizarUsuario(
  id: string,
  data: ActualizarUsuarioDTO
): Promise<Usuario | undefined> {
  await new Promise(resolve => setTimeout(resolve, 900));
  
  const index = MOCK_USUARIOS.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  const usuario = MOCK_USUARIOS[index];
  const rol = data.rolId ? MOCK_ROLES.find(r => r.id === data.rolId) : usuario.rol;
  
  MOCK_USUARIOS[index] = {
    ...usuario,
    ...data,
    rol,
    nombreCompleto: `${data.nombres || usuario.nombres} ${data.apellidos || usuario.apellidos}`,
    usuarioModificacion: 'admin',
    fechaActualizacion: new Date()
  };
  
  return MOCK_USUARIOS[index];
}

/**
 * Elimina un usuario
 * @param id - ID del usuario a eliminar
 * @returns Promise booleano indicando éxito
 */
export async function eliminarUsuario(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const index = MOCK_USUARIOS.findIndex(u => u.id === id);
  if (index === -1) return false;
  
  MOCK_USUARIOS.splice(index, 1);
  return true;
}

/**
 * Cambia el estado de un usuario (activar/desactivar)
 * @param id - ID del usuario
 * @param activo - Nuevo estado activo
 * @returns Promise con el usuario actualizado o undefined
 */
export async function cambiarEstadoUsuario(
  id: string,
  activo: boolean
): Promise<Usuario | undefined> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const index = MOCK_USUARIOS.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  MOCK_USUARIOS[index] = {
    ...MOCK_USUARIOS[index],
    activo,
    estadoUsuario: activo ? EstadoUsuario.ACTIVO : EstadoUsuario.INACTIVO,
    fechaActualizacion: new Date()
  };
  
  return MOCK_USUARIOS[index];
}

/**
 * Verifica si un nombre de usuario ya existe
 * @param usuario - Nombre de usuario a verificar
 * @param excludeId - ID a excluir de la verificación (para ediciones)
 * @returns Promise booleano indicando si existe
 */
export async function verificarUsuario(
  usuario: string,
  excludeId?: string
): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return MOCK_USUARIOS.some(u => 
    u.usuario === usuario && u.id !== excludeId
  );
}

// ============================================================================
// FUNCIONES MOCK API - ROLES
// ============================================================================

/**
 * Obtiene todos los roles
 * @returns Promise con array de roles
 */
export async function getRoles(): Promise<Rol[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...MOCK_ROLES];
}

/**
 * Obtiene un rol por su ID
 * @param id - ID del rol
 * @returns Promise con el rol o undefined
 */
export async function getRolById(id: string): Promise<Rol | undefined> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_ROLES.find(r => r.id === id);
}

/**
 * Crea un nuevo rol
 * @param data - DTO con datos del nuevo rol
 * @returns Promise con el rol creado
 */
export async function crearRol(data: CrearRolDTO): Promise<Rol> {
  await new Promise(resolve => setTimeout(resolve, 900));
  
  const nuevoRol: Rol = {
    id: (MOCK_ROLES.length + 1).toString(),
    codigoRol: data.codigoRol,
    nombreRol: data.nombreRol,
    descripcion: data.descripcion,
    permisos: data.permisos,
    activo: data.activo !== undefined ? data.activo : true,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  };
  
  MOCK_ROLES.push(nuevoRol);
  return nuevoRol;
}

/**
 * Actualiza un rol existente
 * @param id - ID del rol
 * @param data - Datos parciales a actualizar
 * @returns Promise con el rol actualizado o undefined
 */
export async function actualizarRol(
  id: string,
  data: ActualizarRolDTO
): Promise<Rol | undefined> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const index = MOCK_ROLES.findIndex(r => r.id === id);
  if (index === -1) return undefined;
  
  MOCK_ROLES[index] = {
    ...MOCK_ROLES[index],
    ...data,
    fechaActualizacion: new Date()
  };
  
  return MOCK_ROLES[index];
}
