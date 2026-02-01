/**
 * 📬 MOCK API - RECEPCIONES DE COMPRA
 * 
 * Simulación de API para gestión de recepciones de compra.
 * Datos hardcoded de TIENDA DE ROPA Y ACCESORIOS.
 * 
 * @packageDocumentation
 */

import {
  EstadoRecepcion,
} from '@monorepo/shared-types';

import type {
  Recepcion,
  ItemRecepcion,
  RecepcionesPaginadas,
  CrearRecepcionDTO,
  ActualizarRecepcionDTO,
  FiltrosRecepcion,
  CambiarEstadoRecepcionDTO,
} from '@monorepo/shared-types';

// ============= MOCK DATA =============

const MOCK_RECEPCIONES: Recepcion[] = [
  {
    id: 'rec-001',
    codigo: 'RC-20260122-001',
    ordenCompraId: 'ord-002',
    almacenId: 'alm-001',
    almacenNombre: 'Almacén Principal',
    fecha: new Date('2026-01-22'),
    fechaRecepcion: new Date('2026-01-22T10:30:00'),
    estado: EstadoRecepcion.CONFIRMADA,
    guiaRemision: 'GR-2026-001',
    transportista: 'Transportes Rápido S.A.C.',
    condicionMercancia: 'Excelente',
    recibidoPorId: 'user-001',
    recibidoPorNombre: 'Juan Pérez',
    items: [
      {
        id: 'rec-item-001',
        recepcionId: 'rec-001',
        itemOrdenCompraId: 'item-002-1',
        productoId: 'prod-003',
        codigoProducto: 'CHA-VAR-001',
        nombreProducto: 'Chaqueta Variada',
        cantidadRecibida: 45,
        cantidadAceptada: 40,
        cantidadRechazada: 5,
        numeroLote: 'LOTE-2025-001',
        fechaVencimiento: '2027-01-22',
        talla: 'XL',
        color: 'Negro',
        material: 'Poliéster',
        marca: 'Adidas',
        estadoQC: 'APROBADO',
        observaciones: '5 piezas con pequeños defectos en costura',
        createdAt: new Date('2026-01-22'),
        updatedAt: new Date('2026-01-22'),
      },
    ],
    observaciones: 'Recepción parcial de orden OC-20260125-002',
    createdAt: new Date('2026-01-22'),
    updatedAt: new Date('2026-01-22'),
  },
  {
    id: 'rec-002',
    codigo: 'RC-20260121-002',
    ordenCompraId: 'ord-001',
    almacenId: 'alm-001',
    almacenNombre: 'Almacén Principal',
    fecha: new Date('2026-01-21'),
    fechaRecepcion: new Date('2026-01-21T09:00:00'),
    estado: EstadoRecepcion.INSPECCION,
    guiaRemision: 'GR-2026-002',
    transportista: 'Logística Express S.A.',
    condicionMercancia: 'Buena',
    recibidoPorId: 'user-002',
    recibidoPorNombre: 'María García',
    items: [
      {
        id: 'rec-item-002-1',
        recepcionId: 'rec-002',
        itemOrdenCompraId: 'item-001-1',
        productoId: 'prod-001',
        codigoProducto: 'CAM-POL-001',
        nombreProducto: 'Camiseta Polo Básica',
        cantidadRecibida: 100,
        cantidadAceptada: 98,
        cantidadRechazada: 2,
        numeroLote: 'LOTE-2026-001',
        fechaVencimiento: '2027-01-21',
        talla: 'M',
        color: 'Rojo',
        material: 'Algodón 100%',
        marca: 'Genérico',
        estadoQC: 'PENDIENTE',
        observaciones: '2 camisetas con manchas de tinta',
        createdAt: new Date('2026-01-21'),
        updatedAt: new Date('2026-01-21'),
      },
      {
        id: 'rec-item-002-2',
        recepcionId: 'rec-002',
        itemOrdenCompraId: 'item-001-2',
        productoId: 'prod-002',
        codigoProducto: 'PAN-JEA-001',
        nombreProducto: 'Pantalón Jeans Clásico',
        cantidadRecibida: 50,
        cantidadAceptada: 50,
        cantidadRechazada: 0,
        numeroLote: 'LOTE-2026-002',
        fechaVencimiento: '2027-01-21',
        talla: 'L',
        color: 'Azul Oscuro',
        material: 'Denim',
        marca: 'Genérico',
        estadoQC: 'PENDIENTE',
        observaciones: 'Todos los pantalones cumplen especificaciones',
        createdAt: new Date('2026-01-21'),
        updatedAt: new Date('2026-01-21'),
      },
    ],
    observaciones: 'En proceso de inspección de calidad',
    createdAt: new Date('2026-01-21'),
    updatedAt: new Date('2026-01-21'),
  },
  {
    id: 'rec-003',
    codigo: 'RC-20260119-003',
    ordenCompraId: 'ord-003',
    almacenId: 'alm-002',
    almacenNombre: 'Almacén Secundario',
    fecha: new Date('2026-01-19'),
    fechaRecepcion: new Date('2026-01-19T14:15:00'),
    estado: EstadoRecepcion.CONFIRMADA,
    guiaRemision: 'GR-2026-003',
    transportista: 'Transportes Perú S.A.',
    condicionMercancia: 'Excelente',
    recibidoPorId: 'user-003',
    recibidoPorNombre: 'Carlos López',
    items: [
      {
        id: 'rec-item-003',
        recepcionId: 'rec-003',
        itemOrdenCompraId: 'item-003-1',
        productoId: 'prod-004',
        codigoProducto: 'MED-ALC-001',
        nombreProducto: 'Medias Algodón Paquete',
        cantidadRecibida: 200,
        cantidadAceptada: 200,
        cantidadRechazada: 0,
        numeroLote: 'LOTE-2026-003',
        fechaVencimiento: '2027-12-19',
        talla: 'U',
        color: 'Blanco',
        material: 'Algodón 100%',
        marca: 'Genérico',
        estadoQC: 'APROBADO',
        observaciones: 'Todos los paquetes en perfecto estado',
        createdAt: new Date('2026-01-19'),
        updatedAt: new Date('2026-01-19'),
      },
    ],
    observaciones: 'Recepción completada y confirmada',
    createdAt: new Date('2026-01-19'),
    updatedAt: new Date('2026-01-19'),
  },
  {
    id: 'rec-004',
    codigo: 'RC-20260115-004',
    ordenCompraId: 'ord-006',
    almacenId: 'alm-001',
    almacenNombre: 'Almacén Principal',
    fecha: new Date('2026-01-15'),
    fechaRecepcion: new Date('2026-01-15T11:45:00'),
    estado: EstadoRecepcion.CONFIRMADA,
    guiaRemision: 'GR-2026-004',
    transportista: 'Transportes Confiables S.A.',
    condicionMercancia: 'Buena',
    recibidoPorId: 'user-001',
    recibidoPorNombre: 'Juan Pérez',
    items: [
      {
        id: 'rec-item-004',
        recepcionId: 'rec-004',
        itemOrdenCompraId: 'item-006-1',
        productoId: 'prod-007',
        codigoProducto: 'BLU-VAR-001',
        nombreProducto: 'Blusa Variada Mujer',
        cantidadRecibida: 80,
        cantidadAceptada: 80,
        cantidadRechazada: 0,
        numeroLote: 'LOTE-2026-004',
        fechaVencimiento: '2027-01-15',
        talla: 'S',
        color: 'Blanco',
        material: 'Algodón-Poliéster',
        marca: 'Genérico',
        estadoQC: 'APROBADO',
        observaciones: 'Excelente calidad, listo para venta',
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-15'),
      },
    ],
    observaciones: 'Recepción exitosa - Stock disponible para venta',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
  },
  {
    id: 'rec-005',
    codigo: 'RC-20260110-005',
    ordenCompraId: 'ord-007',
    almacenId: 'alm-002',
    almacenNombre: 'Almacén Secundario',
    fecha: new Date('2026-01-10'),
    fechaRecepcion: new Date('2026-01-10T16:20:00'),
    estado: EstadoRecepcion.INSPECCION,
    guiaRemision: 'GR-2026-005',
    transportista: 'Transportes Rápido S.A.C.',
    condicionMercancia: 'Regular',
    recibidoPorId: 'user-002',
    recibidoPorNombre: 'María García',
    items: [
      {
        id: 'rec-item-005',
        recepcionId: 'rec-005',
        itemOrdenCompraId: 'item-007-1',
        productoId: 'prod-008',
        codigoProducto: 'POL-SBL-001',
        nombreProducto: 'Polo Sublimado',
        cantidadRecibida: 80,
        cantidadAceptada: 75,
        cantidadRechazada: 5,
        numeroLote: 'LOTE-2026-005',
        fechaVencimiento: '2027-01-10',
        talla: 'M',
        color: 'Azul',
        material: 'Poliéster',
        marca: 'Genérico',
        estadoQC: 'PENDIENTE',
        observaciones: '5 polos con sublimación defectuosa',
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-10'),
      },
    ],
    observaciones: 'Aún faltan 40 polos de la orden',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
  },
  {
    id: 'rec-006',
    codigo: 'RC-20260108-006',
    ordenCompraId: 'ord-001',
    almacenId: 'alm-001',
    almacenNombre: 'Almacén Principal',
    fecha: new Date('2026-01-08'),
    fechaRecepcion: new Date('2026-01-08T08:30:00'),
    estado: EstadoRecepcion.CANCELADA,
    guiaRemision: 'GR-2026-006',
    transportista: 'Transportes Lento S.A.',
    condicionMercancia: 'Mala',
    recibidoPorId: 'user-003',
    recibidoPorNombre: 'Carlos López',
    items: [
      {
        id: 'rec-item-006',
        recepcionId: 'rec-006',
        itemOrdenCompraId: 'item-001-1',
        productoId: 'prod-001',
        codigoProducto: 'CAM-POL-001',
        nombreProducto: 'Camiseta Polo Básica',
        cantidadRecibida: 100,
        cantidadAceptada: 0,
        cantidadRechazada: 100,
        numeroLote: 'LOTE-2026-RECHAZADO',
        fechaVencimiento: '2027-01-08',
        talla: 'M',
        color: 'Rojo',
        material: 'Algodón 100%',
        marca: 'Genérico',
        estadoQC: 'RECHAZADO',
        observaciones: 'Problemas graves de calidad - Mercancía dañada en tránsito',
        createdAt: new Date('2026-01-08'),
        updatedAt: new Date('2026-01-08'),
      },
    ],
    observaciones: 'Recepción cancelada por mercancía en mal estado',
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-01-08'),
  },
];

// ============= FUNCIONES HELPER =============

function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function coincideConFiltros(recepcion: Recepcion, filtros: FiltrosRecepcion): boolean {
  if (filtros.estado && recepcion.estado !== filtros.estado) return false;
  if (filtros.ordenCompraId && recepcion.ordenCompraId !== filtros.ordenCompraId) return false;
  if (filtros.almacenId && recepcion.almacenId !== filtros.almacenId) return false;
  
  if (filtros.busqueda) {
    const q = normalizarTexto(filtros.busqueda);
    const coincideCodigo = normalizarTexto(recepcion.codigo).includes(q);
    const coincideItem = recepcion.items.some(item =>
      normalizarTexto(item.nombreProducto).includes(q) ||
      normalizarTexto(item.codigoProducto).includes(q)
    );
    if (!coincideCodigo && !coincideItem) return false;
  }
  
  return true;
}

// ============= MOCK API =============

export const recepcionesMockApi = {
  async getRecepciones(filtros?: FiltrosRecepcion): Promise<RecepcionesPaginadas> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 10;
    
    let resultado = [...MOCK_RECEPCIONES];
    
    // Aplicar filtros
    if (filtros) {
      resultado = resultado.filter(recepcion => coincideConFiltros(recepcion, filtros));
    }
    
    // Paginación
    const total = resultado.length;
    const inicio = (pagina - 1) * limite;
    const fin = inicio + limite;
    const recepcionesPaginadas = resultado.slice(inicio, fin);
    
    console.log(`📬 [recepcionesMockApi] getRecepciones: ${total} recepciones (página ${pagina}/${Math.ceil(total / limite)})`);
    
    return {
      recepciones: recepcionesPaginadas,
      total,
      pagina,
      limite,
      paginas: Math.ceil(total / limite),
    };
  },

  async getRecepcionById(id: string): Promise<Recepcion | undefined> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const recepcion = MOCK_RECEPCIONES.find(r => r.id === id);
    console.log(`📬 [recepcionesMockApi] getRecepcionById: ${id} ${recepcion ? 'encontrada' : 'no encontrada'}`);
    return recepcion;
  },

  async crearRecepcion(data: CrearRecepcionDTO): Promise<Recepcion> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const nuevoId = `rec-${String(MOCK_RECEPCIONES.length + 1).padStart(3, '0')}`;
    const ahora = new Date();
    
    const nuevaRecepcion: Recepcion = {
      id: nuevoId,
      codigo: `RC-${ahora.toISOString().split('T')[0].replace(/-/g, '')}-${String(MOCK_RECEPCIONES.length + 1).padStart(3, '0')}`,
      ...data,
      fecha: ahora,
      fechaRecepcion: ahora,
      estado: EstadoRecepcion.PENDIENTE,
      items: data.items.map((item, index) => ({
        ...item,
        id: `rec-item-${nuevoId}-${index}`,
        recepcionId: nuevoId,
        createdAt: ahora,
        updatedAt: ahora,
      })),
      createdAt: ahora,
      updatedAt: ahora,
    };
    
    MOCK_RECEPCIONES.push(nuevaRecepcion);
    console.log(`📬 [recepcionesMockApi] crearRecepcion: ${nuevaRecepcion.codigo}`);
    return nuevaRecepcion;
  },

  async actualizarRecepcion(id: string, data: ActualizarRecepcionDTO): Promise<Recepcion | undefined> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const recepcion = MOCK_RECEPCIONES.find(r => r.id === id);
    if (!recepcion) return undefined;
    
    Object.assign(recepcion, data);
    recepcion.updatedAt = new Date();
    
    console.log(`📬 [recepcionesMockApi] actualizarRecepcion: ${recepcion.codigo}`);
    return recepcion;
  },

  async eliminarRecepcion(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = MOCK_RECEPCIONES.findIndex(r => r.id === id);
    if (index > -1) {
      const recepcion = MOCK_RECEPCIONES[index];
      MOCK_RECEPCIONES.splice(index, 1);
      console.log(`📬 [recepcionesMockApi] eliminarRecepcion: ${recepcion.codigo}`);
      return true;
    }
    return false;
  },

  async cambiarEstado(id: string, data: CambiarEstadoRecepcionDTO): Promise<Recepcion | undefined> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const recepcion = MOCK_RECEPCIONES.find(r => r.id === id);
    if (!recepcion) return undefined;
    
    recepcion.estado = data.estado;
    if (data.observaciones) {
      recepcion.observaciones = data.observaciones;
    }
    recepcion.updatedAt = new Date();
    
    console.log(`📬 [recepcionesMockApi] cambiarEstado: ${recepcion.codigo} → ${data.estado}`);
    return recepcion;
  },
};
