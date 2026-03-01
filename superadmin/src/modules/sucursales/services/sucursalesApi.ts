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

// ============================================================================
// PERSISTENCIA LOCAL
// ============================================================================
const STORAGE_KEY = 'sa_sucursales';

const guardarEnStorage = (data: Sucursal[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const cargarDeStorage = (): Sucursal[] | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const SEED_SUCURSALES: Sucursal[] = [
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
  {
    id: 'suc-003',
    nombre: 'Moda Total SAC',
    ruc: '20601234569',
    direccion: 'Av. Javier Prado 890, San Isidro',
    telefono: '923456789',
    email: 'ventas@modatotal.pe',
    planActual: 'mensual',
    fechaInicio: '2024-09-10',
    fechaVencimiento: '2026-02-10',
    estado: 'vencida',
    propietario: {
      nombre: 'Ana',
      apellido: 'Quispe',
      email: 'ana@modatotal.pe',
      telefono: '923456789',
    },
    metricas: {
      usuariosActivos: 2,
      ventasMes: 15,
      productosRegistrados: 95,
    },
  },
  {
    id: 'suc-004',
    nombre: 'Tendencia Fashion',
    ruc: '20601234570',
    direccion: 'Av. Arequipa 2345, Lince',
    telefono: '934567890',
    email: 'info@tendenciafashion.pe',
    planActual: 'anual',
    fechaInicio: '2026-02-20',
    fechaVencimiento: '2027-02-20',
    estado: 'activa',
    propietario: {
      nombre: 'Roberto',
      apellido: 'Flores',
      email: 'roberto@tendenciafashion.pe',
      telefono: '934567890',
    },
    metricas: {
      usuariosActivos: 4,
      ventasMes: 38,
      productosRegistrados: 250,
    },
  },
  {
    id: 'suc-005',
    nombre: 'Ropa Express SRL',
    ruc: '20601234571',
    direccion: 'Jr. Cusco 456, Cercado de Lima',
    telefono: '945678901',
    email: 'contacto@ropaexpress.pe',
    planActual: 'mensual',
    fechaInicio: '2026-02-05',
    fechaVencimiento: '2026-03-05',
    estado: 'activa',
    propietario: {
      nombre: 'Luis',
      apellido: 'Paredes',
      email: 'luis@ropaexpress.pe',
      telefono: '945678901',
    },
    metricas: {
      usuariosActivos: 2,
      ventasMes: 22,
      productosRegistrados: 140,
    },
  },
  {
    id: 'suc-006',
    nombre: 'Glamour Store',
    ruc: '20601234572',
    direccion: 'Av. La Marina 789, San Miguel',
    telefono: '956789012',
    email: 'admin@glamourstore.pe',
    planActual: 'mensual',
    fechaInicio: '2025-11-28',
    fechaVencimiento: '2026-01-28',
    estado: 'vencida',
    propietario: {
      nombre: 'Diana',
      apellido: 'Torres',
      email: 'diana@glamourstore.pe',
      telefono: '956789012',
    },
    metricas: {
      usuariosActivos: 1,
      ventasMes: 8,
      productosRegistrados: 75,
    },
  },
  {
    id: 'suc-007',
    nombre: 'Street Wear Lima',
    ruc: '20601234573',
    direccion: 'Av. Brasil 1567, Jesús María',
    telefono: '967890123',
    email: 'hola@streetwearlima.pe',
    planActual: 'anual',
    fechaInicio: '2025-09-01',
    fechaVencimiento: '2026-09-01',
    estado: 'activa',
    propietario: {
      nombre: 'Fernando',
      apellido: 'Castillo',
      email: 'fernando@streetwearlima.pe',
      telefono: '967890123',
    },
    metricas: {
      usuariosActivos: 6,
      ventasMes: 52,
      productosRegistrados: 410,
    },
  },
];

// Inicializar: cargar de localStorage o usar seed
const MOCK_SUCURSALES: Sucursal[] = cargarDeStorage() ?? [...SEED_SUCURSALES];

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
  guardarEnStorage(MOCK_SUCURSALES);
  return newSucursal;
};

export const actualizarSucursal = async (id: string, data: Partial<Sucursal>): Promise<Sucursal | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const index = MOCK_SUCURSALES.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  MOCK_SUCURSALES[index] = { ...MOCK_SUCURSALES[index], ...data };
  guardarEnStorage(MOCK_SUCURSALES);
  return MOCK_SUCURSALES[index];
};

export const cambiarEstadoSucursal = async (id: string, estado: 'activa' | 'suspendida'): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const index = MOCK_SUCURSALES.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  MOCK_SUCURSALES[index].estado = estado;
  guardarEnStorage(MOCK_SUCURSALES);
  return true;
};
