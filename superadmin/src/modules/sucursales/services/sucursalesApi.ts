// Mock de Sucursales con Suscripciones
export interface Sucursal {
  id: string;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  
  // Suscripción
  planActual: 'mensual' | 'anual';
  fechaInicio: string;
  fechaVencimiento: string;
  estado: 'activa' | 'suspendida' | 'vencida';
  
  // Propietario
  propietario: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
  
  // Métricas
  metricas: {
    usuariosActivos: number;
    ventasMes: number;
    productosRegistrados: number;
  };
}

const MOCK_SUCURSALES: Sucursal[] = [
  {
    id: 'suc-001',
    nombre: 'Boutique Fashion Maria',
    ruc: '20601234567',
    direccion: 'Av. Larco 1234, Miraflores',
    telefono: '987654321',
    email: 'maria@boutiquefashion.com',
    planActual: 'anual',
    fechaInicio: '2025-01-15',
    fechaVencimiento: '2026-01-15',
    estado: 'activa',
    propietario: {
      nombre: 'María',
      apellido: 'González',
      email: 'maria@boutiquefashion.com',
      telefono: '987654321',
    },
    metricas: {
      usuariosActivos: 5,
      ventasMes: 45,
      productosRegistrados: 320,
    },
  },
  {
    id: 'suc-002',
    nombre: 'Urban Style',
    ruc: '20601234568',
    direccion: 'Jr. de la Unión 567, Lima',
    telefono: '912345678',
    email: 'admin@urbanstyle.pe',
    planActual: 'mensual',
    fechaInicio: '2025-12-01',
    fechaVencimiento: '2026-03-01',
    estado: 'activa',
    propietario: {
      nombre: 'Carlos',
      apellido: 'Mendoza',
      email: 'carlos@urbanstyle.pe',
      telefono: '912345678',
    },
    metricas: {
      usuariosActivos: 3,
      ventasMes: 28,
      productosRegistrados: 180,
    },
  },
];

export const fetchSucursales = async (): Promise<Sucursal[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [...MOCK_SUCURSALES];
};

export const fetchSucursal = async (id: string): Promise<Sucursal | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_SUCURSALES.find(s => s.id === id) || null;
};

export const crearSucursal = async (data: Omit<Sucursal, 'id' | 'metricas'>): Promise<Sucursal> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newSucursal: Sucursal = {
    ...data,
    id: `suc-${Date.now()}`,
    metricas: {
      usuariosActivos: 0,
      ventasMes: 0,
      productosRegistrados: 0,
    },
  };
  MOCK_SUCURSALES.push(newSucursal);
  return newSucursal;
};

export const actualizarSucursal = async (id: string, data: Partial<Sucursal>): Promise<Sucursal | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const index = MOCK_SUCURSALES.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  MOCK_SUCURSALES[index] = { ...MOCK_SUCURSALES[index], ...data };
  return MOCK_SUCURSALES[index];
};

export const cambiarEstadoSucursal = async (id: string, estado: 'activa' | 'suspendida'): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const index = MOCK_SUCURSALES.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  MOCK_SUCURSALES[index].estado = estado;
  return true;
};
