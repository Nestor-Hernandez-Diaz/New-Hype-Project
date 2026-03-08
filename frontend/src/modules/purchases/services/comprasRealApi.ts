/**
 * API - COMPRAS (Ordenes de Compra + Recepciones)
 *
 * Llamadas al backend via apiService.
 *
 * @packageDocumentation
 */

import { apiService, toBackendPage, fromBackendPage } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

import { EstadoOrdenCompra, EstadoRecepcion } from '@monorepo/shared-types';

import type {
  OrdenCompra,
  ItemOrdenCompra,
  OrdenesPaginadas,
  CrearOrdenCompraDTO,
  ActualizarOrdenCompraDTO,
  FiltrosOrdenCompra,
  CambiarEstadoOrdenDTO,
  Recepcion,
  ItemRecepcion,
  RecepcionesPaginadas,
  CrearRecepcionDTO,
  ActualizarRecepcionDTO,
  FiltrosRecepcion,
  CambiarEstadoRecepcionDTO,
} from '@monorepo/shared-types';

// ============= TIPOS BACKEND =============

/** Forma del detalle de orden que llega del backend */
interface BackendDetalleOrden {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidadOrdenada: number;
  cantidadRecibida: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  igv: number;
  total: number;
  observaciones?: string;
}

/** Forma de la orden de compra que llega del backend */
interface BackendOrdenCompra {
  id: number;
  codigo: string;
  proveedorId: number;
  proveedorNombre?: string;
  almacenDestinoId: number;
  almacenDestinoNombre?: string;
  usuarioId: number;
  fechaEmision: string;
  fechaEntregaEstimada?: string;
  condicionesPago?: string;
  formaPago?: string;
  moneda?: string;
  subtotal: number;
  descuento: number;
  igv: number;
  total: number;
  estado: string;
  observaciones?: string;
  detalles?: BackendDetalleOrden[];
  createdAt: string;
}

/** Forma del detalle de recepcion que llega del backend */
interface BackendDetalleRecepcion {
  id: number;
  detalleOrdenCompraId: number;
  productoId: number;
  productoNombre: string;
  cantidadRecibida: number;
  cantidadAceptada: number;
  cantidadRechazada: number;
  motivoRechazo?: string;
  observaciones?: string;
}

/** Forma de la recepcion que llega del backend */
interface BackendRecepcion {
  id: number;
  codigo: string;
  ordenCompraId: number;
  ordenCompraCodigo?: string;
  almacenId: number;
  almacenNombre?: string;
  recibidoPorId: number;
  fechaRecepcion: string;
  guiaRemision?: string;
  esRecepcionCompleta?: boolean;
  estado: string;
  observaciones?: string;
  detalles?: BackendDetalleRecepcion[];
  createdAt: string;
}

// ============= MAPEO BACKEND -> FRONTEND =============

function mapDetalleOrdenToItem(d: BackendDetalleOrden, parentCreatedAt: Date): ItemOrdenCompra {
  return {
    id: String(d.id),
    productoId: String(d.productoId),
    codigoProducto: '',
    nombreProducto: d.productoNombre || '',
    cantidadOrdenada: d.cantidadOrdenada ?? 0,
    cantidadRecibida: d.cantidadRecibida ?? 0,
    cantidadAceptada: 0,
    cantidadRechazada: 0,
    cantidadPendiente: (d.cantidadOrdenada ?? 0) - (d.cantidadRecibida ?? 0),
    precioUnitario: d.precioUnitario ?? 0,
    descuento: d.descuento ?? 0,
    incluyeIGV: false,
    subtotal: d.subtotal ?? 0,
    observaciones: d.observaciones,
    createdAt: parentCreatedAt,
    updatedAt: parentCreatedAt,
  };
}

function mapBackendOrden(b: BackendOrdenCompra): OrdenCompra {
  const createdAt = new Date(b.createdAt);
  return {
    id: String(b.id),
    codigo: b.codigo,
    proveedorId: String(b.proveedorId),
    proveedorNombre: b.proveedorNombre,
    almacenDestinoId: String(b.almacenDestinoId),
    almacenDestinoNombre: b.almacenDestinoNombre,
    solicitadoPorId: String(b.usuarioId),
    fecha: new Date(b.fechaEmision),
    fechaEntregaEsperada: b.fechaEntregaEstimada ? new Date(b.fechaEntregaEstimada) : undefined,
    estado: b.estado as EstadoOrdenCompra,
    condicionesPago: b.condicionesPago,
    formaPago: b.formaPago,
    moneda: b.moneda,
    subtotal: b.subtotal ?? 0,
    descuento: b.descuento ?? 0,
    igv: b.igv ?? 0,
    total: b.total ?? 0,
    items: (b.detalles || []).map(d => mapDetalleOrdenToItem(d, createdAt)),
    observaciones: b.observaciones,
    createdAt,
    updatedAt: createdAt,
  };
}

function mapDetalleRecepcionToItem(
  d: BackendDetalleRecepcion,
  recepcionId: string,
  parentCreatedAt: Date,
): ItemRecepcion {
  return {
    id: String(d.id),
    recepcionId,
    itemOrdenCompraId: String(d.detalleOrdenCompraId),
    productoId: String(d.productoId),
    codigoProducto: '',
    nombreProducto: d.productoNombre || '',
    cantidadRecibida: d.cantidadRecibida ?? 0,
    cantidadAceptada: d.cantidadAceptada ?? 0,
    cantidadRechazada: d.cantidadRechazada ?? 0,
    estadoQC: 'PENDIENTE',
    observaciones: d.observaciones,
    createdAt: parentCreatedAt,
    updatedAt: parentCreatedAt,
  };
}

function mapBackendRecepcion(b: BackendRecepcion): Recepcion {
  const createdAt = new Date(b.createdAt);
  const recepcionId = String(b.id);
  return {
    id: recepcionId,
    codigo: b.codigo,
    ordenCompraId: String(b.ordenCompraId),
    almacenId: String(b.almacenId),
    almacenNombre: b.almacenNombre,
    fecha: new Date(b.fechaRecepcion),
    fechaRecepcion: new Date(b.fechaRecepcion),
    estado: b.estado as EstadoRecepcion,
    guiaRemision: b.guiaRemision,
    recibidoPorId: String(b.recibidoPorId),
    items: (b.detalles || []).map(d => mapDetalleRecepcionToItem(d, recepcionId, createdAt)),
    observaciones: b.observaciones,
    createdAt,
    updatedAt: createdAt,
  };
}

// ============= MAPEO FRONTEND -> BACKEND (Request bodies) =============

function buildOrdenRequestBody(data: CrearOrdenCompraDTO | ActualizarOrdenCompraDTO) {
  const body: Record<string, unknown> = {};

  if ('proveedorId' in data && data.proveedorId != null) {
    body.proveedorId = Number(data.proveedorId);
  }
  if ('almacenDestinoId' in data && data.almacenDestinoId != null) {
    body.almacenDestinoId = Number(data.almacenDestinoId);
  }
  if (data.fechaEntregaEsperada) {
    body.fechaEntregaEstimada =
      data.fechaEntregaEsperada instanceof Date
        ? data.fechaEntregaEsperada.toISOString().split('T')[0]
        : data.fechaEntregaEsperada;
  }
  if (data.condicionesPago !== undefined) body.condicionesPago = data.condicionesPago;
  if (data.formaPago !== undefined) body.formaPago = data.formaPago;
  if (data.observaciones !== undefined) body.observaciones = data.observaciones;

  if (data.items) {
    body.items = data.items.map(item => ({
      productoId: Number(item.productoId),
      cantidadOrdenada: item.cantidadOrdenada,
      precioUnitario: item.precioUnitario,
      descuento: item.descuento ?? 0,
      observaciones: item.observaciones,
    }));
  }

  return body;
}

function buildRecepcionRequestBody(data: CrearRecepcionDTO) {
  return {
    ordenCompraId: Number(data.ordenCompraId),
    guiaRemision: data.guiaRemision,
    observaciones: data.observaciones,
    items: data.items.map(item => ({
      detalleOrdenCompraId: Number(item.itemOrdenCompraId),
      productoId: Number(item.productoId),
      cantidadRecibida: item.cantidadRecibida,
      cantidadAceptada: item.cantidadAceptada,
      cantidadRechazada: item.cantidadRechazada ?? 0,
      motivoRechazo: item.observaciones,
      observaciones: item.observaciones,
    })),
  };
}

// ============= API ORDENES DE COMPRA =============

export const ordenesComprasApi = {
  /**
   * Listar ordenes de compra con filtros y paginacion.
   * GET /compras/ordenes?estado&proveedorId&page&size
   */
  async getOrdenes(filtros?: FiltrosOrdenCompra): Promise<OrdenesPaginadas> {
    const pagina = filtros?.pagina ?? 1;
    const limite = filtros?.limite ?? 10;
    const { page, size } = toBackendPage(pagina, limite);

    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));

    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.proveedorId) params.append('proveedorId', filtros.proveedorId);

    const endpoint = `/compras/ordenes?${params.toString()}`;
    const res: ApiResponse<BackendOrdenCompra[]> = await apiService.get(endpoint);

    if (!res.success || !res.data) {
      throw new Error(res.message || res.error || 'Error al cargar ordenes de compra');
    }

    const pag = fromBackendPage(res.pagination);

    return {
      ordenes: res.data.map(mapBackendOrden),
      total: pag.total,
      pagina: pag.page,
      limite: pag.limit,
      paginas: pag.pages,
    };
  },

  /**
   * Obtener detalle de una orden por su ID.
   * GET /compras/ordenes/{id}
   */
  async getOrdenById(id: string): Promise<OrdenCompra | undefined> {
    const res: ApiResponse<BackendOrdenCompra> = await apiService.get(`/compras/ordenes/${id}`);

    if (!res.success || !res.data) {
      return undefined;
    }
    return mapBackendOrden(res.data);
  },

  /**
   * Crear una nueva orden de compra.
   * POST /compras/ordenes
   */
  async crearOrden(data: CrearOrdenCompraDTO): Promise<OrdenCompra> {
    const body = buildOrdenRequestBody(data);
    const res: ApiResponse<BackendOrdenCompra> = await apiService.post('/compras/ordenes', body);

    if (!res.success || !res.data) {
      throw new Error(res.message || res.error || 'Error al crear orden de compra');
    }
    return mapBackendOrden(res.data);
  },

  /**
   * Actualizar una orden de compra existente.
   * PUT /compras/ordenes/{id}
   */
  async actualizarOrden(id: string, data: ActualizarOrdenCompraDTO): Promise<OrdenCompra | undefined> {
    const body = buildOrdenRequestBody(data);
    const res: ApiResponse<BackendOrdenCompra> = await apiService.put(`/compras/ordenes/${id}`, body);

    if (!res.success || !res.data) {
      return undefined;
    }
    return mapBackendOrden(res.data);
  },

  /**
   * Cancelar/eliminar una orden de compra.
   * DELETE /compras/ordenes/{id}
   */
  async eliminarOrden(id: string): Promise<boolean> {
    const res: ApiResponse<void> = await apiService.delete(`/compras/ordenes/${id}`);
    return res.success === true;
  },

  /**
   * Cambiar estado de una orden de compra (workflow).
   * PATCH /compras/ordenes/{id}/estado
   */
  async cambiarEstado(id: string, data: CambiarEstadoOrdenDTO): Promise<OrdenCompra | undefined> {
    const res: ApiResponse<BackendOrdenCompra> = await apiService.patch(
      `/compras/ordenes/${id}/estado`,
      { estado: data.estado },
    );

    if (!res.success || !res.data) {
      return undefined;
    }
    return mapBackendOrden(res.data);
  },
};

// ============= API RECEPCIONES DE COMPRA =============

export const recepcionesApi = {
  /**
   * Listar recepciones con filtros y paginacion.
   * GET /compras/recepciones?ordenCompraId&estado&page&size
   */
  async getRecepciones(filtros?: FiltrosRecepcion): Promise<RecepcionesPaginadas> {
    const pagina = filtros?.pagina ?? 1;
    const limite = filtros?.limite ?? 10;
    const { page, size } = toBackendPage(pagina, limite);

    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));

    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.ordenCompraId) params.append('ordenCompraId', filtros.ordenCompraId);

    const endpoint = `/compras/recepciones?${params.toString()}`;
    const res: ApiResponse<BackendRecepcion[]> = await apiService.get(endpoint);

    if (!res.success || !res.data) {
      throw new Error(res.message || res.error || 'Error al cargar recepciones');
    }

    const pag = fromBackendPage(res.pagination);

    return {
      recepciones: res.data.map(mapBackendRecepcion),
      total: pag.total,
      pagina: pag.page,
      limite: pag.limit,
      paginas: pag.pages,
    };
  },

  /**
   * Obtener detalle de una recepcion por su ID.
   * GET /compras/recepciones/{id}
   */
  async getRecepcionById(id: string): Promise<Recepcion | undefined> {
    const res: ApiResponse<BackendRecepcion> = await apiService.get(`/compras/recepciones/${id}`);

    if (!res.success || !res.data) {
      return undefined;
    }
    return mapBackendRecepcion(res.data);
  },

  /**
   * Registrar una nueva recepcion de compra.
   * POST /compras/recepciones
   */
  async crearRecepcion(data: CrearRecepcionDTO): Promise<Recepcion> {
    const body = buildRecepcionRequestBody(data);
    const res: ApiResponse<BackendRecepcion> = await apiService.post('/compras/recepciones', body);

    if (!res.success || !res.data) {
      throw new Error(res.message || res.error || 'Error al crear recepcion');
    }
    return mapBackendRecepcion(res.data);
  },

  /**
   * Actualizar una recepcion existente.
   * El backend actualmente no expone un endpoint PUT para recepciones.
   * Se envia como POST de nueva recepcion si es necesario; por ahora
   * devuelve undefined para mantener compatibilidad con la interfaz.
   */
  async actualizarRecepcion(_id: string, _data: ActualizarRecepcionDTO): Promise<Recepcion | undefined> {
    console.warn('[comprasRealApi] actualizarRecepcion: operacion no soportada por el backend');
    throw new Error('Actualizar recepcion no esta soportado por el backend');
  },

  /**
   * Eliminar una recepcion.
   * El backend actualmente no expone un endpoint DELETE para recepciones.
   */
  async eliminarRecepcion(_id: string): Promise<boolean> {
    console.warn('[comprasRealApi] eliminarRecepcion: operacion no soportada por el backend');
    throw new Error('Eliminar recepcion no esta soportado por el backend');
  },

  /**
   * Cambiar estado de una recepcion.
   * El backend solo soporta PATCH /recepciones/{id}/confirmar (sin body).
   * Si el estado solicitado es CONFIRMADA, se usa ese endpoint.
   * Para otros estados, lanza error.
   */
  async cambiarEstado(id: string, data: CambiarEstadoRecepcionDTO): Promise<Recepcion | undefined> {
    if (data.estado === EstadoRecepcion.CONFIRMADA) {
      const res: ApiResponse<BackendRecepcion> = await apiService.patch(
        `/compras/recepciones/${id}/confirmar`,
        {},
      );

      if (!res.success || !res.data) {
        return undefined;
      }
      return mapBackendRecepcion(res.data);
    }

    // Para otros estados no hay endpoint en el backend
    console.warn(`[comprasRealApi] cambiarEstado recepcion a ${data.estado}: no soportado por el backend`);
    throw new Error(`Cambiar estado de recepcion a ${data.estado} no esta soportado por el backend`);
  },
};
