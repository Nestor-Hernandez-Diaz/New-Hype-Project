// Mock de Sistema de Suscripciones

export type TipoPlan = 'mensual' | 'anual';

export interface PlanSuscripcion {
  id: string;
  tipo: TipoPlan;
  nombre: string;
  precio: number;
  caracteristicas: string[];
  limites: {
    usuarios: number;
    productos: number;
    ventasMes: number;
  };
}

export interface Suscripcion {
  id: string;
  sucursalId: string;
  sucursalNombre: string;
  plan: PlanSuscripcion;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: 'activa' | 'vencida' | 'cancelada';
  precioFinal: number;
  metodoPago: string;
  proximoPago?: string;
}

export interface PagoHistorial {
  id: string;
  suscripcionId: string;
  fecha: string;
  monto: number;
  metodoPago: string;
  estado: 'pagado' | 'pendiente' | 'fallido';
  comprobante?: string;
}

// ============================================================================
// PLANES DISPONIBLES
// ============================================================================

const PLANES: PlanSuscripcion[] = [
  {
    id: 'plan-mensual',
    tipo: 'mensual',
    nombre: 'Plan Mensual',
    precio: 99,
    caracteristicas: [
      'Hasta 5 usuarios',
      'Hasta 500 productos',
      'Soporte por email',
      'Reportes básicos',
      'Actualizaciones incluidas',
    ],
    limites: {
      usuarios: 5,
      productos: 500,
      ventasMes: 1000,
    },
  },
  {
    id: 'plan-anual',
    tipo: 'anual',
    nombre: 'Plan Anual',
    precio: 990,  // Equivalente a S/82.50/mes (15% descuento)
    caracteristicas: [
      'Hasta 10 usuarios',
      'Productos ilimitados',
      'Soporte prioritario 24/7',
      'Reportes avanzados',
      'Actualizaciones incluidas',
      '15% de descuento',
    ],
    limites: {
      usuarios: 10,
      productos: -1, // -1 = ilimitado
      ventasMes: -1,
    },
  },
];

// ============================================================================
// SUSCRIPCIONES ACTIVAS
// ============================================================================

const MOCK_SUSCRIPCIONES: Suscripcion[] = [
  {
    id: 'sub-001',
    sucursalId: 'suc-001',
    sucursalNombre: 'Boutique Fashion Maria',
    plan: PLANES[1], // Plan anual
    fechaInicio: '2025-01-15',
    fechaVencimiento: '2026-01-15',
    estado: 'activa',
    precioFinal: 990,
    metodoPago: 'Tarjeta Visa **** 4532',
    proximoPago: '2026-01-15',
  },
  {
    id: 'sub-002',
    sucursalId: 'suc-002',
    sucursalNombre: 'Urban Style',
    plan: PLANES[0], // Plan mensual
    fechaInicio: '2025-12-01',
    fechaVencimiento: '2026-03-01',
    estado: 'activa',
    precioFinal: 99,
    metodoPago: 'Transferencia Bancaria',
    proximoPago: '2026-03-01',
  },
  {
    id: 'sub-003',
    sucursalId: 'suc-003',
    sucursalNombre: 'Moda Total SAC',
    plan: PLANES[0],
    fechaInicio: '2024-09-10',
    fechaVencimiento: '2026-02-10',
    estado: 'vencida',
    precioFinal: 99,
    metodoPago: 'Tarjeta MasterCard **** 8821',
    proximoPago: undefined,
  },
];

// ============================================================================
// HISTORIAL DE PAGOS
// ============================================================================

const MOCK_PAGOS: PagoHistorial[] = [
  {
    id: 'pago-001',
    suscripcionId: 'sub-001',
    fecha: '2025-01-15',
    monto: 990,
    metodoPago: 'Tarjeta Visa **** 4532',
    estado: 'pagado',
    comprobante: 'COMP-2025-001',
  },
  {
    id: 'pago-002',
    suscripcionId: 'sub-002',
    fecha: '2026-02-01',
    monto: 99,
    metodoPago: 'Transferencia Bancaria',
    estado: 'pagado',
    comprobante: 'COMP-2026-048',
  },
  {
    id: 'pago-003',
    suscripcionId: 'sub-002',
    fecha: '2025-12-01',
    monto: 99,
    metodoPago: 'Transferencia Bancaria',
    estado: 'pagado',
    comprobante: 'COMP-2025-187',
  },
];

// ============================================================================
// API MOCK
// ============================================================================

export const fetchPlanes = async (): Promise<PlanSuscripcion[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [...PLANES];
};

export const fetchSuscripciones = async (): Promise<Suscripcion[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [...MOCK_SUSCRIPCIONES];
};

export const fetchSuscripcion = async (id: string): Promise<Suscripcion | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_SUSCRIPCIONES.find(s => s.id === id) || null;
};

export const fetchPagosBySuscripcion = async (suscripcionId: string): Promise<PagoHistorial[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_PAGOS.filter(p => p.suscripcionId === suscripcionId);
};

export const renovarSuscripcion = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const index = MOCK_SUSCRIPCIONES.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  // Simular renovación
  const fechaActual = new Date();
  const fechaVencimiento = new Date(fechaActual);
  
  if (MOCK_SUSCRIPCIONES[index].plan.tipo === 'anual') {
    fechaVencimiento.setFullYear(fechaActual.getFullYear() + 1);
  } else {
    fechaVencimiento.setMonth(fechaActual.getMonth() + 1);
  }
  
  MOCK_SUSCRIPCIONES[index].estado = 'activa';
  MOCK_SUSCRIPCIONES[index].fechaVencimiento = fechaVencimiento.toISOString().split('T')[0];
  MOCK_SUSCRIPCIONES[index].proximoPago = fechaVencimiento.toISOString().split('T')[0];
  
  return true;
};

export const cancelarSuscripcion = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const index = MOCK_SUSCRIPCIONES.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  MOCK_SUSCRIPCIONES[index].estado = 'cancelada';
  return true;
};
