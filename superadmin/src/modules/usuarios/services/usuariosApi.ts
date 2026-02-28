// Mock de Usuarios del Sistema Global

export interface UsuarioSistema {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  
  // Sucursal asignada
  sucursalId: string;
  sucursalNombre: string;
  
  // Rol en la sucursal
  rol: 'admin' | 'vendedor' | 'almacenero';
  
  // Estado
  estado: 'activo' | 'inactivo' | 'suspendido';
  
  // Fechas
  fechaCreacion: string;
  ultimoAcceso?: string;
  
  // Permisos
  permisos: string[];
}

// ============================================================================
// USUARIOS MOCK
// ============================================================================

const MOCK_USUARIOS: UsuarioSistema[] = [
  {
    id: 'usr-001',
    email: 'maria.admin@boutiquefashion.com',
    nombre: 'María',
    apellido: 'González',
    telefono: '987654321',
    sucursalId: 'suc-001',
    sucursalNombre: 'Boutique Fashion Maria',
    rol: 'admin',
    estado: 'activo',
    fechaCreacion: '2025-01-15',
    ultimoAcceso: '2026-02-14',
    permisos: ['ventas', 'inventario', 'reportes', 'usuarios', 'configuracion'],
  },
  {
    id: 'usr-002',
    email: 'ana.vendedora@boutiquefashion.com',
    nombre: 'Ana',
    apellido: 'Pérez',
    telefono: '912345678',
    sucursalId: 'suc-001',
    sucursalNombre: 'Boutique Fashion Maria',
    rol: 'vendedor',
    estado: 'activo',
    fechaCreacion: '2025-01-20',
    ultimoAcceso: '2026-02-15',
    permisos: ['ventas', 'clientes'],
  },
  {
    id: 'usr-003',
    email: 'carlos.admin@urbanstyle.pe',
    nombre: 'Carlos',
    apellido: 'Mendoza',
    telefono: '923456789',
    sucursalId: 'suc-002',
    sucursalNombre: 'Urban Style',
    rol: 'admin',
    estado: 'activo',
    fechaCreacion: '2025-12-01',
    ultimoAcceso: '2026-02-15',
    permisos: ['ventas', 'inventario', 'reportes', 'usuarios', 'configuracion'],
  },
  {
    id: 'usr-004',
    email: 'luis.vendedor@urbanstyle.pe',
    nombre: 'Luis',
    apellido: 'Torres',
    telefono: '934567890',
    sucursalId: 'suc-002',
    sucursalNombre: 'Urban Style',
    rol: 'vendedor',
    estado: 'activo',
    fechaCreacion: '2025-12-05',
    ultimoAcceso: '2026-02-14',
    permisos: ['ventas', 'clientes'],
  },
  {
    id: 'usr-005',
    email: 'jorge.almacen@urbanstyle.pe',
    nombre: 'Jorge',
    apellido: 'Ramírez',
    sucursalId: 'suc-002',
    sucursalNombre: 'Urban Style',
    rol: 'almacenero',
    estado: 'inactivo',
    fechaCreacion: '2025-12-10',
    ultimoAcceso: '2026-01-20',
    permisos: ['inventario', 'compras'],
  },
  {
    id: 'usr-006',
    email: 'ana.admin@modatotal.pe',
    nombre: 'Ana',
    apellido: 'Quispe',
    telefono: '923456789',
    sucursalId: 'suc-003',
    sucursalNombre: 'Moda Total SAC',
    rol: 'admin',
    estado: 'activo',
    fechaCreacion: '2024-09-10',
    ultimoAcceso: '2026-02-08',
    permisos: ['ventas', 'inventario', 'reportes', 'usuarios', 'configuracion'],
  },
  {
    id: 'usr-007',
    email: 'roberto.admin@tendenciafashion.pe',
    nombre: 'Roberto',
    apellido: 'Flores',
    telefono: '934567890',
    sucursalId: 'suc-004',
    sucursalNombre: 'Tendencia Fashion',
    rol: 'admin',
    estado: 'activo',
    fechaCreacion: '2026-02-20',
    ultimoAcceso: '2026-02-28',
    permisos: ['ventas', 'inventario', 'reportes', 'usuarios', 'configuracion'],
  },
  {
    id: 'usr-008',
    email: 'carmen.vendedora@tendenciafashion.pe',
    nombre: 'Carmen',
    apellido: 'Huamán',
    telefono: '945678901',
    sucursalId: 'suc-004',
    sucursalNombre: 'Tendencia Fashion',
    rol: 'vendedor',
    estado: 'activo',
    fechaCreacion: '2026-02-22',
    ultimoAcceso: '2026-02-27',
    permisos: ['ventas', 'clientes'],
  },
  {
    id: 'usr-009',
    email: 'luis.admin@ropaexpress.pe',
    nombre: 'Luis',
    apellido: 'Paredes',
    telefono: '945678901',
    sucursalId: 'suc-005',
    sucursalNombre: 'Ropa Express SRL',
    rol: 'admin',
    estado: 'activo',
    fechaCreacion: '2026-02-05',
    ultimoAcceso: '2026-02-28',
    permisos: ['ventas', 'inventario', 'reportes', 'usuarios', 'configuracion'],
  },
  {
    id: 'usr-010',
    email: 'diana.admin@glamourstore.pe',
    nombre: 'Diana',
    apellido: 'Torres',
    telefono: '956789012',
    sucursalId: 'suc-006',
    sucursalNombre: 'Glamour Store',
    rol: 'admin',
    estado: 'suspendido',
    fechaCreacion: '2025-11-28',
    ultimoAcceso: '2026-01-25',
    permisos: ['ventas', 'inventario', 'reportes', 'usuarios', 'configuracion'],
  },
  {
    id: 'usr-011',
    email: 'fernando.admin@streetwearlima.pe',
    nombre: 'Fernando',
    apellido: 'Castillo',
    telefono: '967890123',
    sucursalId: 'suc-007',
    sucursalNombre: 'Street Wear Lima',
    rol: 'admin',
    estado: 'activo',
    fechaCreacion: '2025-09-01',
    ultimoAcceso: '2026-02-28',
    permisos: ['ventas', 'inventario', 'reportes', 'usuarios', 'configuracion'],
  },
  {
    id: 'usr-012',
    email: 'pedro.vendedor@streetwearlima.pe',
    nombre: 'Pedro',
    apellido: 'Vargas',
    telefono: '978901234',
    sucursalId: 'suc-007',
    sucursalNombre: 'Street Wear Lima',
    rol: 'vendedor',
    estado: 'activo',
    fechaCreacion: '2025-09-15',
    ultimoAcceso: '2026-02-27',
    permisos: ['ventas', 'clientes'],
  },
];

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

export interface EstadisticasUsuarios {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  usuariosSuspendidos: number;
  usuariosPorSucursal: {
    sucursalId: string;
    sucursalNombre: string;
    cantidad: number;
  }[];
  usuariosPorRol: {
    admin: number;
    vendedor: number;
    almacenero: number;
  };
}

// ============================================================================
// API MOCK
// ============================================================================

export const fetchUsuarios = async (): Promise<UsuarioSistema[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [...MOCK_USUARIOS];
};

export const fetchUsuario = async (id: string): Promise<UsuarioSistema | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_USUARIOS.find(u => u.id === id) || null;
};

export const fetchEstadisticas = async (): Promise<EstadisticasUsuarios> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const activos = MOCK_USUARIOS.filter(u => u.estado === 'activo').length;
  const inactivos = MOCK_USUARIOS.filter(u => u.estado === 'inactivo').length;
  const suspendidos = MOCK_USUARIOS.filter(u => u.estado === 'suspendido').length;
  
  // Usuarios por sucursal
  const porSucursal = MOCK_USUARIOS.reduce((acc, user) => {
    const existing = acc.find(s => s.sucursalId === user.sucursalId);
    if (existing) {
      existing.cantidad++;
    } else {
      acc.push({
        sucursalId: user.sucursalId,
        sucursalNombre: user.sucursalNombre,
        cantidad: 1,
      });
    }
    return acc;
  }, [] as EstadisticasUsuarios['usuariosPorSucursal']);
  
  return {
    totalUsuarios: MOCK_USUARIOS.length,
    usuariosActivos: activos,
    usuariosInactivos: inactivos,
    usuariosSuspendidos: suspendidos,
    usuariosPorSucursal: porSucursal,
    usuariosPorRol: {
      admin: MOCK_USUARIOS.filter(u => u.rol === 'admin').length,
      vendedor: MOCK_USUARIOS.filter(u => u.rol === 'vendedor').length,
      almacenero: MOCK_USUARIOS.filter(u => u.rol === 'almacenero').length,
    },
  };
};

export const cambiarEstadoUsuario = async (id: string, estado: 'activo' | 'inactivo' | 'suspendido'): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const index = MOCK_USUARIOS.findIndex(u => u.id === id);
  if (index === -1) return false;
  
  MOCK_USUARIOS[index].estado = estado;
  return true;
};

export const crearUsuario = async (data: Omit<UsuarioSistema, 'id' | 'fechaCreacion' | 'ultimoAcceso'>): Promise<UsuarioSistema> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newUser: UsuarioSistema = {
    ...data,
    id: `usr-${Date.now()}`,
    fechaCreacion: new Date().toISOString().split('T')[0],
  };
  MOCK_USUARIOS.push(newUser);
  return newUser;
};

export const actualizarUsuario = async (id: string, data: Partial<UsuarioSistema>): Promise<UsuarioSistema | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const index = MOCK_USUARIOS.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  MOCK_USUARIOS[index] = { ...MOCK_USUARIOS[index], ...data };
  return MOCK_USUARIOS[index];
};

export const eliminarUsuario = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const index = MOCK_USUARIOS.findIndex(u => u.id === id);
  if (index === -1) return false;
  
  MOCK_USUARIOS.splice(index, 1);
  return true;
};
