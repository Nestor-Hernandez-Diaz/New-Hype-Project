// Mock de Sistema de Suscripciones

import { fetchSucursales, actualizarSucursal, type Sucursal } from '../../sucursales/services/sucursalesApi';

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
    precio: 990,
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
      productos: -1,
      ventasMes: -1,
    },
  },
];

const SUSCRIPCION_ID_BY_SUCURSAL: Record<string, string> = {
  'suc-001': 'sub-001',
  'suc-002': 'sub-002',
  'suc-003': 'sub-003',
  'suc-004': 'sub-004',
  'suc-005': 'sub-005',
  'suc-006': 'sub-006',
  'suc-007': 'sub-007',
};

const METODO_PAGO_BY_SUCURSAL: Record<string, string> = {
  'suc-001': 'Tarjeta Visa **** 4532',
  'suc-002': 'Transferencia Bancaria',
  'suc-003': 'Tarjeta MasterCard **** 8821',
  'suc-004': 'Yape',
  'suc-005': 'Transferencia BCP',
  'suc-006': 'Tarjeta Visa **** 7712',
  'suc-007': 'Transferencia Interbank',
};

const MOCK_PAGOS: PagoHistorial[] = [
  {
    id: 'pago-001',
    suscripcionId: 'sub-001',
    fecha: '2026-01-15',
    monto: 990,
    metodoPago: 'Tarjeta Visa **** 4532',
    estado: 'pagado',
    comprobante: 'COMP-2026-001',
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
  {
    id: 'pago-004',
    suscripcionId: 'sub-003',
    fecha: '2025-12-10',
    monto: 99,
    metodoPago: 'Tarjeta MasterCard **** 8821',
    estado: 'pagado',
    comprobante: 'COMP-2025-201',
  },
  {
    id: 'pago-005',
    suscripcionId: 'sub-004',
    fecha: '2026-02-20',
    monto: 990,
    metodoPago: 'Yape',
    estado: 'pagado',
    comprobante: 'COMP-2026-055',
  },
  {
    id: 'pago-006',
    suscripcionId: 'sub-005',
    fecha: '2026-02-05',
    monto: 99,
    metodoPago: 'Transferencia BCP',
    estado: 'pagado',
    comprobante: 'COMP-2026-060',
  },
  {
    id: 'pago-007',
    suscripcionId: 'sub-006',
    fecha: '2025-11-28',
    monto: 99,
    metodoPago: 'Tarjeta Visa **** 7712',
    estado: 'pagado',
    comprobante: 'COMP-2025-195',
  },
  {
    id: 'pago-008',
    suscripcionId: 'sub-007',
    fecha: '2025-09-01',
    monto: 990,
    metodoPago: 'Transferencia Interbank',
    estado: 'pagado',
    comprobante: 'COMP-2025-150',
  },
];

const getPlanByTipo = (tipo: TipoPlan): PlanSuscripcion => {
  const plan = PLANES.find(item => item.tipo === tipo);
  return plan ?? PLANES[0];
};

const getSuscripcionId = (sucursalId: string): string => {
  return SUSCRIPCION_ID_BY_SUCURSAL[sucursalId] ?? `sub-${sucursalId}`;
};

const getMetodoPago = (sucursalId: string): string => {
  return METODO_PAGO_BY_SUCURSAL[sucursalId] ?? 'Pendiente de configuración';
};

const mapEstadoSuscripcion = (
  estadoSucursal: Sucursal['estado']
): Suscripcion['estado'] => {
  if (estadoSucursal === 'vencida') return 'vencida';
  if (estadoSucursal === 'suspendida') return 'cancelada';
  return 'activa';
};

const sucursalToSuscripcion = (sucursal: Sucursal): Suscripcion => {
  const plan = getPlanByTipo(sucursal.planActual);
  const estado = mapEstadoSuscripcion(sucursal.estado);

  return {
    id: getSuscripcionId(sucursal.id),
    sucursalId: sucursal.id,
    sucursalNombre: sucursal.nombre,
    plan,
    fechaInicio: sucursal.fechaInicio,
    fechaVencimiento: sucursal.fechaVencimiento,
    estado,
    precioFinal: plan.precio,
    metodoPago: getMetodoPago(sucursal.id),
    proximoPago: estado === 'activa' ? sucursal.fechaVencimiento : undefined,
  };
};

export const fetchPlanes = async (): Promise<PlanSuscripcion[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [...PLANES];
};

export const fetchSuscripciones = async (): Promise<Suscripcion[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const sucursales = await fetchSucursales();
  return sucursales.map(sucursalToSuscripcion);
};

export const fetchSuscripcion = async (id: string): Promise<Suscripcion | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const suscripciones = await fetchSuscripciones();
  return suscripciones.find(s => s.id === id) || null;
};

export const fetchPagosBySuscripcion = async (suscripcionId: string): Promise<PagoHistorial[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_PAGOS.filter(p => p.suscripcionId === suscripcionId);
};

export const renovarSuscripcion = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const suscripciones = await fetchSuscripciones();
  const suscripcion = suscripciones.find(sub => sub.id === id);
  if (!suscripcion) return false;

  const fechaActual = new Date();
  const nuevaFechaVencimiento = new Date(fechaActual);

  if (suscripcion.plan.tipo === 'anual') {
    nuevaFechaVencimiento.setFullYear(fechaActual.getFullYear() + 1);
  } else {
    nuevaFechaVencimiento.setMonth(fechaActual.getMonth() + 1);
  }

  const fechaInicio = fechaActual.toISOString().split('T')[0];
  const fechaVencimiento = nuevaFechaVencimiento.toISOString().split('T')[0];

  const actualizada = await actualizarSucursal(suscripcion.sucursalId, {
    estado: 'activa',
    fechaInicio,
    fechaVencimiento,
  });

  return actualizada !== null;
};

export const cancelarSuscripcion = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const suscripciones = await fetchSuscripciones();
  const suscripcion = suscripciones.find(sub => sub.id === id);
  if (!suscripcion) return false;

  const actualizada = await actualizarSucursal(suscripcion.sucursalId, {
    estado: 'suspendida',
  });

  return actualizada !== null;
};
