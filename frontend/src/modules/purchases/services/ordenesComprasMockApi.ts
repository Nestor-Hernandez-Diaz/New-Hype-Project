/**
 * 📦 MOCK API - ÓRDENES DE COMPRA
 * 
 * Simulación de API para gestión de órdenes de compra.
 * Datos hardcoded de TIENDA DE ROPA Y ACCESORIOS.
 * 
 * @packageDocumentation
 */

import {
  EstadoOrdenCompra,
} from '@monorepo/shared-types';

import type {
  OrdenCompra,
  ItemOrdenCompra,
  OrdenesPaginadas,
  CrearOrdenCompraDTO,
  ActualizarOrdenCompraDTO,
  FiltrosOrdenCompra,
  CambiarEstadoOrdenDTO,
} from '@monorepo/shared-types';

// ============= MOCK DATA =============

const MOCK_ORDENES: OrdenCompra[] = [
  {
    id: 'ord-001',
    codigo: 'OC-20260126-001',
    proveedorId: 'prov-001',
    proveedorNombre: 'TEXTILES GAMARRA S.A.C.',
    proveedorDocumento: '20456789123',
    almacenDestinoId: 'alm-001',
    almacenDestinoNombre: 'Almacén Principal',
    solicitadoPorId: 'user-001',
    solicitadoPorNombre: 'Juan Pérez',
    fecha: new Date('2026-01-20'),
    fechaEntregaEsperada: new Date('2026-02-05'),
    estado: EstadoOrdenCompra.CONFIRMADA,
    condicionesPago: 'Contado',
    formaPago: 'Transferencia',
    lugarEntrega: 'Jr. Gamarra 452',
    moneda: 'PEN',
    subtotal: 5000,
    descuento: 250,
    igv: 857.5,
    total: 5607.5,
    items: [
      {
        id: 'item-001-1',
        productoId: 'prod-001',
        codigoProducto: 'CAM-POL-001',
        nombreProducto: 'Camiseta Polo Básica',
        cantidadOrdenada: 100,
        cantidadRecibida: 0,
        cantidadAceptada: 0,
        cantidadRechazada: 0,
        cantidadPendiente: 100,
        precioUnitario: 25,
        descuento: 2,
        incluyeIGV: false,
        talla: 'M',
        color: 'Rojo',
        material: 'Algodón 100%',
        marca: 'Genérico',
        especificaciones: 'Manga corta, cuello redondo',
        observaciones: 'Stock estratégico para verano',
        subtotal: 2300,
        createdAt: new Date('2026-01-20'),
        updatedAt: new Date('2026-01-20'),
      },
      {
        id: 'item-001-2',
        productoId: 'prod-002',
        codigoProducto: 'PAN-JEA-001',
        nombreProducto: 'Pantalón Jeans Clásico',
        cantidadOrdenada: 50,
        cantidadRecibida: 0,
        cantidadAceptada: 0,
        cantidadRechazada: 0,
        cantidadPendiente: 50,
        precioUnitario: 55,
        descuento: 0,
        incluyeIGV: false,
        talla: 'L',
        color: 'Azul Oscuro',
        material: 'Denim',
        marca: 'Genérico',
        especificaciones: 'Cintura ajustable, bolsillos funcionales',
        subtotal: 2750,
        createdAt: new Date('2026-01-20'),
        updatedAt: new Date('2026-01-20'),
      },
    ],
    observaciones: 'Pedido urgente para colección de verano',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
  },
  {
    id: 'ord-002',
    codigo: 'OC-20260125-002',
    proveedorId: 'prov-002',
    proveedorNombre: 'DISTRIBUIDORA FASHION PERÚ S.A.',
    proveedorDocumento: '20678901345',
    almacenDestinoId: 'alm-001',
    almacenDestinoNombre: 'Almacén Principal',
    solicitadoPorId: 'user-002',
    solicitadoPorNombre: 'María García',
    fecha: new Date('2026-01-18'),
    fechaEntregaEsperada: new Date('2026-02-01'),
    estado: EstadoOrdenCompra.EN_RECEPCION,
    condicionesPago: '30 días',
    formaPago: 'Cheque',
    lugarEntrega: 'Av. Argentina 3456',
    moneda: 'USD',
    subtotal: 8000,
    descuento: 400,
    igv: 1368,
    total: 8968,
    items: [
      {
        id: 'item-002-1',
        productoId: 'prod-003',
        codigoProducto: 'CHA-VAR-001',
        nombreProducto: 'Chaqueta Variada',
        cantidadOrdenada: 75,
        cantidadRecibida: 45,
        cantidadAceptada: 40,
        cantidadRechazada: 5,
        cantidadPendiente: 30,
        precioUnitario: 75,
        descuento: 5,
        incluyeIGV: false,
        talla: 'XL',
        color: 'Negro',
        material: 'Poliéster',
        marca: 'Adidas',
        especificaciones: 'Impermeable, bolsillos con cierre',
        subtotal: 5250,
        createdAt: new Date('2026-01-18'),
        updatedAt: new Date('2026-01-25'),
      },
    ],
    observaciones: 'Recepción parcial - Resto esperado',
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-01-25'),
  },
  {
    id: 'ord-003',
    codigo: 'OC-20260110-003',
    proveedorId: 'prov-001',
    proveedorNombre: 'TEXTILES GAMARRA S.A.C.',
    proveedorDocumento: '20456789123',
    almacenDestinoId: 'alm-002',
    almacenDestinoNombre: 'Almacén Secundario',
    solicitadoPorId: 'user-001',
    solicitadoPorNombre: 'Juan Pérez',
    fecha: new Date('2026-01-10'),
    fechaEntregaEsperada: new Date('2026-01-25'),
    estado: EstadoOrdenCompra.COMPLETADA,
    condicionesPago: 'Contado',
    formaPago: 'Efectivo',
    lugarEntrega: 'Jr. Gamarra 452',
    moneda: 'PEN',
    subtotal: 3500,
    descuento: 0,
    igv: 630,
    total: 4130,
    items: [
      {
        id: 'item-003-1',
        productoId: 'prod-004',
        codigoProducto: 'MED-ALC-001',
        nombreProducto: 'Medias Algodón Paquete',
        cantidadOrdenada: 200,
        cantidadRecibida: 200,
        cantidadAceptada: 200,
        cantidadRechazada: 0,
        cantidadPendiente: 0,
        precioUnitario: 15,
        descuento: 0,
        incluyeIGV: false,
        talla: 'U',
        color: 'Blanco',
        material: 'Algodón 100%',
        marca: 'Genérico',
        especificaciones: 'Paquete de 6 pares',
        subtotal: 3000,
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-22'),
      },
    ],
    observaciones: 'Orden completada',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-22'),
  },
  {
    id: 'ord-004',
    codigo: 'OC-20260105-004',
    proveedorId: 'prov-003',
    proveedorNombre: 'BORDADOS Y SUBLIMACIONES PERÚ S.R.L.',
    proveedorDocumento: '20789012456',
    almacenDestinoId: 'alm-001',
    almacenDestinoNombre: 'Almacén Principal',
    solicitadoPorId: 'user-003',
    solicitadoPorNombre: 'Carlos López',
    fecha: new Date('2026-01-05'),
    fechaEntregaEsperada: new Date('2026-01-30'),
    estado: EstadoOrdenCompra.PENDIENTE,
    condicionesPago: '15 días',
    formaPago: 'Tarjeta',
    lugarEntrega: 'Calle Industrial 123',
    moneda: 'PEN',
    subtotal: 2800,
    descuento: 140,
    igv: 478,
    total: 3138,
    items: [
      {
        id: 'item-004-1',
        productoId: 'prod-005',
        codigoProducto: 'CAP-BRD-001',
        nombreProducto: 'Gorra Bordada Personalizada',
        cantidadOrdenada: 60,
        cantidadRecibida: 0,
        cantidadAceptada: 0,
        cantidadRechazada: 0,
        cantidadPendiente: 60,
        precioUnitario: 45,
        descuento: 5,
        incluyeIGV: false,
        talla: 'U',
        color: 'Varios',
        material: 'Algodón-Poliéster',
        marca: 'Genérico',
        especificaciones: 'Con bordado de logo, cierre ajustable',
        observaciones: 'Esperar confirmación de diseño',
        subtotal: 2600,
        createdAt: new Date('2026-01-05'),
        updatedAt: new Date('2026-01-05'),
      },
    ],
    observaciones: 'Esperando confirmación del proveedor',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-05'),
  },
  {
    id: 'ord-005',
    codigo: 'OC-20260102-005',
    proveedorId: 'prov-002',
    proveedorNombre: 'DISTRIBUIDORA FASHION PERÚ S.A.',
    proveedorDocumento: '20678901345',
    almacenDestinoId: 'alm-001',
    almacenDestinoNombre: 'Almacén Principal',
    solicitadoPorId: 'user-001',
    solicitadoPorNombre: 'Juan Pérez',
    fecha: new Date('2026-01-02'),
    fechaEntregaEsperada: new Date('2026-01-20'),
    estado: EstadoOrdenCompra.CANCELADA,
    condicionesPago: 'Crédito 60 días',
    formaPago: 'Transferencia',
    lugarEntrega: 'Av. Argentina 3456',
    moneda: 'USD',
    subtotal: 6000,
    descuento: 0,
    igv: 1080,
    total: 7080,
    items: [
      {
        id: 'item-005-1',
        productoId: 'prod-006',
        codigoProducto: 'ZAP-DEP-001',
        nombreProducto: 'Zapatillas Deportivas',
        cantidadOrdenada: 100,
        cantidadRecibida: 0,
        cantidadAceptada: 0,
        cantidadRechazada: 0,
        cantidadPendiente: 0,
        precioUnitario: 60,
        descuento: 0,
        incluyeIGV: false,
        talla: '40',
        color: 'Blanco-Negro',
        material: 'Cuero Sintético',
        marca: 'Nike',
        especificaciones: 'Running, suela de goma',
        observaciones: 'Cancelado por cambio de proveedor',
        subtotal: 6000,
        createdAt: new Date('2026-01-02'),
        updatedAt: new Date('2026-01-24'),
      },
    ],
    observaciones: 'Cancelado por cambio estratégico de proveedor',
    createdAt: new Date('2026-01-02'),
    updatedAt: new Date('2026-01-24'),
  },
  {
    id: 'ord-006',
    codigo: 'OC-20251228-006',
    proveedorId: 'prov-001',
    proveedorNombre: 'TEXTILES GAMARRA S.A.C.',
    proveedorDocumento: '20456789123',
    almacenDestinoId: 'alm-001',
    almacenDestinoNombre: 'Almacén Principal',
    solicitadoPorId: 'user-002',
    solicitadoPorNombre: 'María García',
    fecha: new Date('2025-12-28'),
    fechaEntregaEsperada: new Date('2026-01-15'),
    estado: EstadoOrdenCompra.COMPLETADA,
    condicionesPago: 'Contado',
    formaPago: 'Efectivo',
    lugarEntrega: 'Jr. Gamarra 452',
    moneda: 'PEN',
    subtotal: 4200,
    descuento: 210,
    igv: 759,
    total: 4749,
    items: [
      {
        id: 'item-006-1',
        productoId: 'prod-007',
        codigoProducto: 'BLU-VAR-001',
        nombreProducto: 'Blusa Variada Mujer',
        cantidadOrdenada: 80,
        cantidadRecibida: 80,
        cantidadAceptada: 80,
        cantidadRechazada: 0,
        cantidadPendiente: 0,
        precioUnitario: 50,
        descuento: 2.5,
        incluyeIGV: false,
        talla: 'S',
        color: 'Blanco',
        material: 'Algodón-Poliéster',
        marca: 'Genérico',
        especificaciones: 'Manga larga, botones de presión',
        subtotal: 3900,
        createdAt: new Date('2025-12-28'),
        updatedAt: new Date('2026-01-10'),
      },
    ],
    observaciones: 'Recepción completada exitosamente',
    createdAt: new Date('2025-12-28'),
    updatedAt: new Date('2026-01-10'),
  },
  {
    id: 'ord-007',
    codigo: 'OC-20251220-007',
    proveedorId: 'prov-003',
    proveedorNombre: 'BORDADOS Y SUBLIMACIONES PERÚ S.R.L.',
    proveedorDocumento: '20789012456',
    almacenDestinoId: 'alm-002',
    almacenDestinoNombre: 'Almacén Secundario',
    solicitadoPorId: 'user-003',
    solicitadoPorNombre: 'Carlos López',
    fecha: new Date('2025-12-20'),
    fechaEntregaEsperada: new Date('2026-01-10'),
    estado: EstadoOrdenCompra.EN_RECEPCION,
    condicionesPago: '30 días',
    formaPago: 'Cheque',
    lugarEntrega: 'Calle Industrial 123',
    moneda: 'PEN',
    subtotal: 3600,
    descuento: 180,
    igv: 612,
    total: 4032,
    items: [
      {
        id: 'item-007-1',
        productoId: 'prod-008',
        codigoProducto: 'POL-SBL-001',
        nombreProducto: 'Polo Sublimado',
        cantidadOrdenada: 120,
        cantidadRecibida: 80,
        cantidadAceptada: 80,
        cantidadRechazada: 0,
        cantidadPendiente: 40,
        precioUnitario: 30,
        descuento: 2.5,
        incluyeIGV: false,
        talla: 'M',
        color: 'Azul',
        material: 'Poliéster',
        marca: 'Genérico',
        especificaciones: 'Cuello redondo, impresión sublimada',
        subtotal: 3480,
        createdAt: new Date('2025-12-20'),
        updatedAt: new Date('2026-01-18'),
      },
    ],
    observaciones: 'Recepción parcial en progreso',
    createdAt: new Date('2025-12-20'),
    updatedAt: new Date('2026-01-18'),
  },
];

// ============= FUNCIONES HELPER =============

function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function coincideConFiltros(orden: OrdenCompra, filtros: FiltrosOrdenCompra): boolean {
  if (filtros.estado && orden.estado !== filtros.estado) return false;
  if (filtros.proveedorId && orden.proveedorId !== filtros.proveedorId) return false;
  if (filtros.almacenDestinoId && orden.almacenDestinoId !== filtros.almacenDestinoId) return false;
  
  if (filtros.busqueda) {
    const q = normalizarTexto(filtros.busqueda);
    const coincideCodigo = normalizarTexto(orden.codigo).includes(q);
    const coincideProveedor = normalizarTexto(orden.proveedorNombre || '').includes(q);
    const coincideItem = orden.items.some(item => 
      normalizarTexto(item.nombreProducto).includes(q) || 
      normalizarTexto(item.codigoProducto).includes(q)
    );
    if (!coincideCodigo && !coincideProveedor && !coincideItem) return false;
  }
  
  return true;
}

// ============= MOCK API =============

export const ordenesComprasMockApi = {
  async getOrdenes(filtros?: FiltrosOrdenCompra): Promise<OrdenesPaginadas> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 10;
    
    let resultado = [...MOCK_ORDENES];
    
    // Aplicar filtros
    if (filtros) {
      resultado = resultado.filter(orden => coincideConFiltros(orden, filtros));
    }
    
    // Paginación
    const total = resultado.length;
    const inicio = (pagina - 1) * limite;
    const fin = inicio + limite;
    const ordenesPaginadas = resultado.slice(inicio, fin);
    
    console.log(`📦 [ordenesComprasMockApi] getOrdenes: ${total} órdenes (página ${pagina}/${Math.ceil(total / limite)})`);
    
    return {
      ordenes: ordenesPaginadas,
      total,
      pagina,
      limite,
      paginas: Math.ceil(total / limite),
    };
  },

  async getOrdenById(id: string): Promise<OrdenCompra | undefined> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const orden = MOCK_ORDENES.find(o => o.id === id);
    console.log(`📦 [ordenesComprasMockApi] getOrdenById: ${id} ${orden ? 'encontrada' : 'no encontrada'}`);
    return orden;
  },

  async crearOrden(data: CrearOrdenCompraDTO): Promise<OrdenCompra> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const nuevoId = `ord-${String(MOCK_ORDENES.length + 1).padStart(3, '0')}`;
    const ahora = new Date();
    
    const nuevoItem: ItemOrdenCompra = {
      ...data.items[0],
      id: `item-${nuevoId}`,
      cantidadRecibida: 0,
      cantidadAceptada: 0,
      cantidadRechazada: 0,
      cantidadPendiente: data.items[0].cantidadOrdenada,
      subtotal: data.items[0].cantidadOrdenada * data.items[0].precioUnitario,
      createdAt: ahora,
      updatedAt: ahora,
    };
    
    const nuevaOrden: OrdenCompra = {
      id: nuevoId,
      codigo: `OC-${ahora.toISOString().split('T')[0].replace(/-/g, '')}-${String(MOCK_ORDENES.length + 1).padStart(3, '0')}`,
      ...data,
      estado: EstadoOrdenCompra.PENDIENTE,
      subtotal: nuevoItem.subtotal,
      descuento: 0,
      igv: nuevoItem.subtotal * 0.18,
      total: nuevoItem.subtotal * 1.18,
      items: [nuevoItem],
      createdAt: ahora,
      updatedAt: ahora,
    };
    
    MOCK_ORDENES.push(nuevaOrden);
    console.log(`📦 [ordenesComprasMockApi] crearOrden: ${nuevaOrden.codigo}`);
    return nuevaOrden;
  },

  async actualizarOrden(id: string, data: ActualizarOrdenCompraDTO): Promise<OrdenCompra | undefined> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const orden = MOCK_ORDENES.find(o => o.id === id);
    if (!orden) return undefined;
    
    Object.assign(orden, data);
    orden.updatedAt = new Date();
    
    console.log(`📦 [ordenesComprasMockApi] actualizarOrden: ${orden.codigo}`);
    return orden;
  },

  async eliminarOrden(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = MOCK_ORDENES.findIndex(o => o.id === id);
    if (index > -1) {
      const orden = MOCK_ORDENES[index];
      MOCK_ORDENES.splice(index, 1);
      console.log(`📦 [ordenesComprasMockApi] eliminarOrden: ${orden.codigo}`);
      return true;
    }
    return false;
  },

  async cambiarEstado(id: string, data: CambiarEstadoOrdenDTO): Promise<OrdenCompra | undefined> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const orden = MOCK_ORDENES.find(o => o.id === id);
    if (!orden) return undefined;
    
    orden.estado = data.estado;
    if (data.observaciones) {
      orden.observaciones = data.observaciones;
    }
    orden.updatedAt = new Date();
    
    console.log(`📦 [ordenesComprasMockApi] cambiarEstado: ${orden.codigo} → ${data.estado}`);
    return orden;
  },
};
