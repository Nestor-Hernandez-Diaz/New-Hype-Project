/**
 * ============================================
 * MOCK SERVICE - MÓDULO DE VENTAS
 * Simula la API REST de Spring Boot con delay de 500ms
 * ============================================
 */

import type {
  Venta,
  CrearVentaRequest,
  CajaRegistradora,
  SesionCaja,
  MovimientoCaja,
  ResumenCaja,
  NotaCredito,
  CrearNotaCreditoRequest,
  Cotizacion,
  VentasFilters,
  SesionesCajaFilters,
  EstadoVenta,
  TipoComprobante,
  FormaPago,
  EstadoCaja,
  TipoMovimientoCaja
} from '@monorepo/shared-types';

// ============================================
// DELAY HELPER
// ============================================
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// MOCK DATA - CAJAS REGISTRADORAS
// ============================================
const MOCK_CAJAS_REGISTRADORAS: CajaRegistradora[] = [
  {
    id: 'caja-001',
    nombre: 'Caja Principal',
    ubicacion: 'Mostrador 1',
    activo: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 'caja-002',
    nombre: 'Caja Secundaria',
    ubicacion: 'Mostrador 2',
    activo: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  }
];

// ============================================
// MOCK DATA - SESIONES DE CAJA
// ============================================
const MOCK_SESIONES_CAJA: SesionCaja[] = [
  {
    id: 'sesion-001',
    cashRegisterId: 'caja-001',
    userId: 'user-001',
    fechaApertura: '2024-01-26T08:00:00Z',
    montoApertura: 200.00,
    totalVentas: 1580.50,
    estado: 'Abierta' as EstadoCaja,
    observaciones: 'Apertura normal del día',
    createdAt: '2024-01-26T08:00:00Z',
    updatedAt: '2024-01-26T08:00:00Z',
    cashRegister: MOCK_CAJAS_REGISTRADORAS[0],
    user: {
      id: 'user-001',
      username: 'vendedor1',
      firstName: 'Juan',
      lastName: 'Pérez'
    }
  },
  {
    id: 'sesion-002',
    cashRegisterId: 'caja-001',
    userId: 'user-001',
    fechaApertura: '2024-01-25T08:00:00Z',
    fechaCierre: '2024-01-25T18:00:00Z',
    montoApertura: 200.00,
    montoCierre: 1850.00,
    totalVentas: 1650.00,
    diferencia: 0.00,
    estado: 'Cerrada' as EstadoCaja,
    observaciones: 'Cierre sin novedades',
    createdAt: '2024-01-25T08:00:00Z',
    updatedAt: '2024-01-25T18:00:00Z',
    cashRegister: MOCK_CAJAS_REGISTRADORAS[0],
    user: {
      id: 'user-001',
      username: 'vendedor1',
      firstName: 'Juan',
      lastName: 'Pérez'
    }
  }
];

// ============================================
// MOCK DATA - MOVIMIENTOS DE CAJA
// ============================================
const MOCK_MOVIMIENTOS_CAJA: MovimientoCaja[] = [
  {
    id: 'mov-001',
    cashSessionId: 'sesion-001',
    tipo: 'INGRESO' as TipoMovimientoCaja,
    monto: 50.00,
    motivo: 'Ingreso por servicio adicional',
    descripcion: 'Pago de instalación',
    usuarioId: 'user-001',
    createdAt: '2024-01-26T10:30:00Z',
    updatedAt: '2024-01-26T10:30:00Z',
    usuario: {
      id: 'user-001',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@empresa.com'
    }
  },
  {
    id: 'mov-002',
    cashSessionId: 'sesion-001',
    tipo: 'EGRESO' as TipoMovimientoCaja,
    monto: 30.00,
    motivo: 'Compra de materiales',
    descripcion: 'Bolsas y etiquetas',
    usuarioId: 'user-001',
    createdAt: '2024-01-26T12:15:00Z',
    updatedAt: '2024-01-26T12:15:00Z',
    usuario: {
      id: 'user-001',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@empresa.com'
    }
  }
];

// ============================================
// MOCK DATA - VENTAS
// ============================================
const MOCK_VENTAS: Venta[] = [
  {
    id: 'venta-001',
    codigoVenta: 'V-2024-00001',
    cashSessionId: 'sesion-001',
    clienteId: 'cliente-001',
    almacenId: 'almacen-001',
    usuarioId: 'user-001',
    fechaEmision: '2024-01-26T09:30:00Z',
    tipoComprobante: 'Boleta' as TipoComprobante,
    formaPago: 'Efectivo' as FormaPago,
    subtotal: 338.98,
    igv: 61.02,
    total: 400.00,
    estado: 'Completada' as EstadoVenta,
    observaciones: 'Venta de mostrador',
    montoRecibido: 400.00,
    montoCambio: 0.00,
    items: [
      {
        id: 'item-001',
        productId: 'prod-001',
        nombreProducto: 'Laptop Dell Inspiron 15',
        cantidad: 1,
        precioUnitario: 2500.00,
        subtotal: 2500.00
      },
      {
        id: 'item-002',
        productId: 'prod-002',
        nombreProducto: 'Mouse Inalámbrico Logitech',
        cantidad: 2,
        precioUnitario: 45.50,
        subtotal: 91.00
      }
    ],
    createdAt: '2024-01-26T09:30:00Z',
    updatedAt: '2024-01-26T09:30:00Z',
    cliente: {
      id: 'cliente-001',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      nombres: 'María',
      apellidos: 'González',
      tipo: 'CLIENTE'
    }
  },
  {
    id: 'venta-002',
    codigoVenta: 'V-2024-00002',
    cashSessionId: 'sesion-001',
    clienteId: 'cliente-002',
    almacenId: 'almacen-001',
    usuarioId: 'user-001',
    fechaEmision: '2024-01-26T11:00:00Z',
    tipoComprobante: 'Factura' as TipoComprobante,
    formaPago: 'Transferencia' as FormaPago,
    subtotal: 847.46,
    igv: 152.54,
    total: 1000.00,
    estado: 'Completada' as EstadoVenta,
    referenciaPago: 'OP-123456789',
    items: [
      {
        id: 'item-003',
        productId: 'prod-003',
        nombreProducto: 'Monitor LG 24 Pulgadas',
        cantidad: 2,
        precioUnitario: 500.00,
        subtotal: 1000.00
      }
    ],
    createdAt: '2024-01-26T11:00:00Z',
    updatedAt: '2024-01-26T11:00:00Z',
    cliente: {
      id: 'cliente-002',
      tipoDocumento: 'RUC',
      numeroDocumento: '20123456789',
      razonSocial: 'Tecnología SAC',
      tipo: 'CLIENTE'
    }
  },
  {
    id: 'venta-003',
    codigoVenta: 'V-2024-00003',
    cashSessionId: 'sesion-001',
    almacenId: 'almacen-001',
    usuarioId: 'user-001',
    fechaEmision: '2024-01-26T14:30:00Z',
    tipoComprobante: 'NotaVenta' as TipoComprobante,
    formaPago: 'Efectivo' as FormaPago,
    subtotal: 152.54,
    igv: 27.46,
    total: 180.00,
    estado: 'Pendiente' as EstadoVenta,
    items: [
      {
        id: 'item-004',
        productId: 'prod-004',
        nombreProducto: 'Teclado Mecánico RGB',
        cantidad: 1,
        precioUnitario: 180.00,
        subtotal: 180.00
      }
    ],
    createdAt: '2024-01-26T14:30:00Z',
    updatedAt: '2024-01-26T14:30:00Z'
  }
];

// ============================================
// MOCK DATA - NOTAS DE CRÉDITO
// ============================================
const MOCK_NOTAS_CREDITO: NotaCredito[] = [];

// ============================================
// MOCK DATA - COTIZACIONES
// ============================================
const MOCK_COTIZACIONES: Cotizacion[] = [
  {
    id: 'quote-001',
    codigoCotizacion: 'COT-2024-00001',
    clienteId: 'cliente-003',
    almacenId: 'almacen-001',
    usuarioId: 'user-001',
    fechaEmision: '2024-01-25T10:00:00Z',
    validoHasta: '2024-02-01T23:59:59Z',
    tipoComprobante: 'Factura' as TipoComprobante,
    subtotal: 4237.29,
    igv: 762.71,
    total: 5000.00,
    estado: 'Vigente',
    items: [
      {
        id: 'quote-item-001',
        productId: 'prod-005',
        nombreProducto: 'Impresora Multifuncional HP',
        cantidad: 5,
        precioUnitario: 1000.00,
        subtotal: 5000.00
      }
    ],
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z'
  }
];

// ============================================
// API MOCK - CAJAS REGISTRADORAS
// ============================================

export const getCajasRegistradoras = async (): Promise<CajaRegistradora[]> => {
  await delay(500);
  return [...MOCK_CAJAS_REGISTRADORAS];
};

// ============================================
// API MOCK - SESIONES DE CAJA
// ============================================

export const getSesionesCaja = async (filters?: SesionesCajaFilters): Promise<SesionCaja[]> => {
  await delay(500);
  
  let sesiones = [...MOCK_SESIONES_CAJA];
  
  // Aplicar filtros
  if (filters?.estado) {
    sesiones = sesiones.filter(s => s.estado === filters.estado);
  }
  
  if (filters?.fechaInicio) {
    sesiones = sesiones.filter(s => s.fechaApertura >= filters.fechaInicio!);
  }
  
  if (filters?.fechaFin) {
    sesiones = sesiones.filter(s => s.fechaApertura <= filters.fechaFin!);
  }
  
  if (filters?.userId) {
    sesiones = sesiones.filter(s => s.userId === filters.userId);
  }
  
  return sesiones;
};

export const getSesionCajaById = async (sessionId: string): Promise<SesionCaja> => {
  await delay(500);
  const sesion = MOCK_SESIONES_CAJA.find(s => s.id === sessionId);
  if (!sesion) {
    throw new Error(`Sesión de caja ${sessionId} no encontrada`);
  }
  return { ...sesion };
};

export const abrirSesionCaja = async (
  cashRegisterId: string,
  montoApertura: number,
  observaciones?: string
): Promise<SesionCaja> => {
  await delay(500);
  
  // Validar que no haya sesión abierta
  const sesionAbierta = MOCK_SESIONES_CAJA.find(
    s => s.cashRegisterId === cashRegisterId && s.estado === 'Abierta'
  );
  
  if (sesionAbierta) {
    throw new Error('Ya existe una sesión abierta para esta caja');
  }
  
  const nuevaSesion: SesionCaja = {
    id: `sesion-${Date.now()}`,
    cashRegisterId,
    userId: 'user-001', // Mock user
    fechaApertura: new Date().toISOString(),
    montoApertura,
    totalVentas: 0,
    estado: 'Abierta' as EstadoCaja,
    observaciones,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cashRegister: MOCK_CAJAS_REGISTRADORAS.find(c => c.id === cashRegisterId),
    user: {
      id: 'user-001',
      username: 'vendedor1',
      firstName: 'Juan',
      lastName: 'Pérez'
    }
  };
  
  MOCK_SESIONES_CAJA.push(nuevaSesion);
  return { ...nuevaSesion };
};

export const cerrarSesionCaja = async (
  sessionId: string,
  montoCierre: number,
  observaciones?: string
): Promise<SesionCaja> => {
  await delay(500);
  
  const index = MOCK_SESIONES_CAJA.findIndex(s => s.id === sessionId);
  if (index === -1) {
    throw new Error('Sesión de caja no encontrada');
  }
  
  const sesion = MOCK_SESIONES_CAJA[index];
  if (sesion.estado === 'Cerrada') {
    throw new Error('La sesión ya está cerrada');
  }
  
  const totalEsperado = sesion.montoApertura + sesion.totalVentas;
  const diferencia = montoCierre - totalEsperado;
  
  const sesionCerrada: SesionCaja = {
    ...sesion,
    fechaCierre: new Date().toISOString(),
    montoCierre,
    diferencia,
    estado: 'Cerrada' as EstadoCaja,
    observaciones: observaciones || sesion.observaciones,
    updatedAt: new Date().toISOString()
  };
  
  MOCK_SESIONES_CAJA[index] = sesionCerrada;
  return { ...sesionCerrada };
};

// ============================================
// API MOCK - MOVIMIENTOS DE CAJA
// ============================================

export const getMovimientosCaja = async (cashSessionId: string): Promise<MovimientoCaja[]> => {
  await delay(500);
  return MOCK_MOVIMIENTOS_CAJA.filter(m => m.cashSessionId === cashSessionId);
};

export const getResumenCaja = async (sessionId: string): Promise<ResumenCaja> => {
  await delay(500);
  
  const sesion = MOCK_SESIONES_CAJA.find(s => s.id === sessionId);
  if (!sesion) {
    throw new Error('Sesión no encontrada');
  }
  
  const movimientos = MOCK_MOVIMIENTOS_CAJA.filter(m => m.cashSessionId === sessionId);
  
  const totalIngresos = movimientos
    .filter(m => m.tipo === 'INGRESO')
    .reduce((sum, m) => sum + Number(m.monto), 0);
    
  const totalEgresos = movimientos
    .filter(m => m.tipo === 'EGRESO')
    .reduce((sum, m) => sum + Number(m.monto), 0);
  
  const totalEsperado = sesion.montoApertura + sesion.totalVentas + totalIngresos - totalEgresos;
  
  return {
    montoApertura: sesion.montoApertura,
    totalVentas: sesion.totalVentas,
    totalIngresos,
    totalEgresos,
    totalEsperado,
    movements: movimientos
  };
};

export const crearMovimientoCaja = async (
  tipo: TipoMovimientoCaja,
  data: {
    cashSessionId: string;
    monto: number;
    motivo: string;
    descripcion?: string;
  }
): Promise<MovimientoCaja> => {
  await delay(500);
  
  const nuevoMovimiento: MovimientoCaja = {
    id: `mov-${Date.now()}`,
    cashSessionId: data.cashSessionId,
    tipo,
    monto: data.monto,
    motivo: data.motivo,
    descripcion: data.descripcion,
    usuarioId: 'user-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usuario: {
      id: 'user-001',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@empresa.com'
    }
  };
  
  MOCK_MOVIMIENTOS_CAJA.push(nuevoMovimiento);
  return { ...nuevoMovimiento };
};

export const eliminarMovimientoCaja = async (movementId: string): Promise<void> => {
  await delay(500);
  
  const index = MOCK_MOVIMIENTOS_CAJA.findIndex(m => m.id === movementId);
  if (index === -1) {
    throw new Error('Movimiento no encontrado');
  }
  
  MOCK_MOVIMIENTOS_CAJA.splice(index, 1);
};

// ============================================
// API MOCK - VENTAS
// ============================================

export const getVentas = async (filters?: VentasFilters): Promise<Venta[]> => {
  await delay(500);
  
  let ventas = [...MOCK_VENTAS];
  
  // Aplicar filtros
  if (filters?.estado) {
    ventas = ventas.filter(v => v.estado === filters.estado);
  }
  
  if (filters?.fechaInicio) {
    ventas = ventas.filter(v => v.fechaEmision >= filters.fechaInicio!);
  }
  
  if (filters?.fechaFin) {
    ventas = ventas.filter(v => v.fechaEmision <= filters.fechaFin!);
  }
  
  if (filters?.clienteId) {
    ventas = ventas.filter(v => v.clienteId === filters.clienteId);
  }
  
  if (filters?.tipoComprobante) {
    ventas = ventas.filter(v => v.tipoComprobante === filters.tipoComprobante);
  }
  
  if (filters?.formaPago) {
    ventas = ventas.filter(v => v.formaPago === filters.formaPago);
  }
  
  if (filters?.cashSessionId) {
    ventas = ventas.filter(v => v.cashSessionId === filters.cashSessionId);
  }
  
  return ventas;
};

export const getVentaById = async (saleId: string): Promise<Venta> => {
  await delay(500);
  
  const venta = MOCK_VENTAS.find(v => v.id === saleId);
  if (!venta) {
    throw new Error(`Venta ${saleId} no encontrada`);
  }
  
  return { ...venta };
};

export const crearVenta = async (ventaData: CrearVentaRequest): Promise<Venta> => {
  await delay(500);
  
  // Calcular totales
  const subtotal = ventaData.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
  const igv = ventaData.incluyeIGV !== false ? subtotal * 0.18 : 0;
  const total = subtotal + igv;
  
  const nuevaVenta: Venta = {
    id: `venta-${Date.now()}`,
    codigoVenta: `V-2024-${String(MOCK_VENTAS.length + 1).padStart(5, '0')}`,
    cashSessionId: ventaData.cashSessionId,
    clienteId: ventaData.clienteId,
    almacenId: ventaData.almacenId,
    usuarioId: 'user-001',
    fechaEmision: new Date().toISOString(),
    tipoComprobante: ventaData.tipoComprobante,
    formaPago: ventaData.formaPago || 'Efectivo' as FormaPago,
    subtotal,
    igv,
    total,
    estado: 'Pendiente' as EstadoVenta,
    observaciones: ventaData.observaciones,
    items: ventaData.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      productId: item.productId,
      nombreProducto: item.nombreProducto || 'Producto',
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.cantidad * item.precioUnitario
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  MOCK_VENTAS.push(nuevaVenta);
  return { ...nuevaVenta };
};

export const confirmarPagoVenta = async (
  saleId: string,
  paymentData: {
    montoRecibido: number;
    montoCambio?: number;
    referenciaPago?: string;
  }
): Promise<Venta> => {
  await delay(500);
  
  const index = MOCK_VENTAS.findIndex(v => v.id === saleId);
  if (index === -1) {
    throw new Error('Venta no encontrada');
  }
  
  const ventaActualizada: Venta = {
    ...MOCK_VENTAS[index],
    estado: 'Completada' as EstadoVenta,
    montoRecibido: paymentData.montoRecibido,
    montoCambio: paymentData.montoCambio,
    referenciaPago: paymentData.referenciaPago,
    fechaPago: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  MOCK_VENTAS[index] = ventaActualizada;
  return { ...ventaActualizada };
};

export const completarVenta = async (saleId: string): Promise<Venta> => {
  await delay(500);
  
  const index = MOCK_VENTAS.findIndex(v => v.id === saleId);
  if (index === -1) {
    throw new Error('Venta no encontrada');
  }
  
  const ventaActualizada: Venta = {
    ...MOCK_VENTAS[index],
    estado: 'Completada' as EstadoVenta,
    updatedAt: new Date().toISOString()
  };
  
  MOCK_VENTAS[index] = ventaActualizada;
  return { ...ventaActualizada };
};

export const cancelarVenta = async (saleId: string, motivo: string): Promise<Venta> => {
  await delay(500);
  
  const index = MOCK_VENTAS.findIndex(v => v.id === saleId);
  if (index === -1) {
    throw new Error('Venta no encontrada');
  }
  
  const ventaActualizada: Venta = {
    ...MOCK_VENTAS[index],
    estado: 'Cancelada' as EstadoVenta,
    observaciones: `${MOCK_VENTAS[index].observaciones || ''}\nMotivo de cancelación: ${motivo}`,
    updatedAt: new Date().toISOString()
  };
  
  MOCK_VENTAS[index] = ventaActualizada;
  return { ...ventaActualizada };
};

// ============================================
// API MOCK - NOTAS DE CRÉDITO
// ============================================

export const crearNotaCredito = async (data: CrearNotaCreditoRequest): Promise<NotaCredito> => {
  await delay(500);
  
  const venta = MOCK_VENTAS.find(v => v.id === data.saleId);
  if (!venta) {
    throw new Error('Venta no encontrada');
  }
  
  // Calcular totales de la NC
  const itemsNC = data.items.map(item => {
    const saleItem = venta.items.find(si => si.id === item.saleItemId);
    if (!saleItem) {
      throw new Error(`Item ${item.saleItemId} no encontrado en la venta`);
    }
    
    return {
      ...saleItem,
      cantidad: item.cantidad,
      subtotal: item.cantidad * saleItem.precioUnitario
    };
  });
  
  const subtotal = itemsNC.reduce((sum, item) => sum + item.subtotal, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  
  const nuevaNC: NotaCredito = {
    id: `nc-${Date.now()}`,
    codigoVenta: `NC-2024-${String(MOCK_NOTAS_CREDITO.length + 1).padStart(5, '0')}`,
    saleOriginId: data.saleId,
    fechaEmision: new Date().toISOString(),
    creditNoteReason: data.creditNoteReason,
    creditNoteDescription: data.descripcion,
    total,
    subtotal,
    igv,
    items: itemsNC,
    usuario: {
      id: 'user-001',
      firstName: 'Juan',
      lastName: 'Pérez'
    },
    saleOrigin: {
      id: venta.id,
      codigoVenta: venta.codigoVenta,
      total: venta.total
    }
  };
  
  MOCK_NOTAS_CREDITO.push(nuevaNC);
  return { ...nuevaNC };
};

export const getNotasCreditoBySale = async (saleId: string): Promise<NotaCredito[]> => {
  await delay(500);
  return MOCK_NOTAS_CREDITO.filter(nc => nc.saleOriginId === saleId);
};

// ============================================
// API MOCK - COTIZACIONES
// ============================================

export const getCotizaciones = async (): Promise<Cotizacion[]> => {
  await delay(500);
  return [...MOCK_COTIZACIONES];
};

export const crearCotizacion = async (data: CrearVentaRequest): Promise<Cotizacion> => {
  await delay(500);
  
  const subtotal = data.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
  const igv = data.incluyeIGV !== false ? subtotal * 0.18 : 0;
  const total = subtotal + igv;
  
  const nuevaCotizacion: Cotizacion = {
    id: `quote-${Date.now()}`,
    codigoCotizacion: `COT-2024-${String(MOCK_COTIZACIONES.length + 1).padStart(5, '0')}`,
    clienteId: data.clienteId,
    almacenId: data.almacenId,
    usuarioId: 'user-001',
    fechaEmision: new Date().toISOString(),
    validoHasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
    tipoComprobante: data.tipoComprobante,
    subtotal,
    igv,
    total,
    estado: 'Vigente',
    observaciones: data.observaciones,
    items: data.items.map((item, index) => ({
      id: `quote-item-${Date.now()}-${index}`,
      productId: item.productId,
      nombreProducto: item.nombreProducto || 'Producto',
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.cantidad * item.precioUnitario
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  MOCK_COTIZACIONES.push(nuevaCotizacion);
  return { ...nuevaCotizacion };
};
