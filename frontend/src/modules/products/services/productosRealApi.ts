/**
 * REAL API - PRODUCTOS
 *
 * Reemplaza productosMockApi con llamadas reales al backend via apiService.
 *
 * Backend endpoints:
 * - GET    /productos             -> getProductos()
 * - GET    /productos/{id}        -> getProductoById()
 * - POST   /productos             -> crearProducto()
 * - PUT    /productos/{id}        -> actualizarProducto()
 * - DELETE /productos/{id}        -> eliminarProducto()
 * - PATCH  /productos/{id}/estado -> cambiarEstadoProducto()
 * - GET    /categorias            -> getCategorias()
 * - GET    /unidades-medida       -> getUnidadesMedida()
 *
 * @packageDocumentation
 */

import { apiService, toBackendPage, fromBackendPage } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

import { EstadoProducto, EstadoStockProducto, TipoProducto, GeneroRopa } from '@monorepo/shared-types';

import type {
  Producto,
  ProductosPaginados,
  CrearProductoDTO,
  ProductoFiltros,
  Categoria,
  UnidadMedida,
  TallaRopa,
} from '@monorepo/shared-types';

// ============= TIPOS BACKEND =============

/** Forma del producto que llega del backend (ProductoResponse) */
interface BackendProducto {
  id: number;
  sku: string;
  nombre: string;
  slug?: string;
  descripcion?: string;
  categoriaId: number;
  categoriaNombre?: string;
  tallaId?: number;
  colorId?: number;
  marcaId?: number;
  materialId?: number;
  generoId?: number;
  // String fields the backend may return directly
  talla?: string;
  color?: string;
  marca?: string;
  material?: string;
  genero?: string;
  unidadMedidaId: number;
  codigoBarras?: string;
  imagenUrl?: string;
  precioCosto?: number;
  precioVenta: number;
  stockMinimo?: number;
  controlaInventario?: boolean;
  enLiquidacion?: boolean;
  porcentajeLiquidacion?: number;
  estado: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Forma de la categoria que llega del backend (CategoriaResponse) */
interface BackendCategoria {
  id: number;
  codigo: string;
  nombre: string;
  slug?: string;
  descripcion?: string;
  estado: boolean;
  createdAt: string;
}

/** Forma de la unidad de medida que llega del backend */
interface BackendUnidadMedida {
  id: number;
  codigo: string;
  nombre: string;
  simbolo?: string;
  estado: boolean;
  createdAt: string;
}

// ============= MAPEO BACKEND -> FRONTEND =============

function mapBackendProducto(b: BackendProducto): Producto {
  const precioCosto = b.precioCosto ?? 0;
  const margen =
    precioCosto > 0
      ? ((b.precioVenta - precioCosto) / precioCosto) * 100
      : undefined;

  return {
    id: b.id,
    codigoProducto: b.sku || '',
    nombreProducto: b.nombre || '',
    descripcion: b.descripcion,

    categoriaId: b.categoriaId,
    categoria: b.categoriaNombre
      ? {
          id: b.categoriaId,
          codigoCategoria: '',
          nombreCategoria: b.categoriaNombre,
          activa: true,
          fechaCreacion: new Date(b.createdAt),
          fechaActualizacion: new Date(b.updatedAt || b.createdAt),
        }
      : undefined,

    unidadMedidaId: b.unidadMedidaId ?? 1,

    precioVenta: b.precioVenta ?? 0,
    precioCosto: b.precioCosto,
    margen,

    // Stock: backend does not return stockActual/stockInicial in the producto response;
    // those are managed via inventory (kardex). Set sensible defaults.
    stockInicial: 0,
    stockActual: 0,
    stockMinimo: b.stockMinimo ?? 0,

    // Clothing-specific fields: prefer string fields if present,
    // fall back to sensible defaults when backend only returns IDs.
    talla: (b.talla as TallaRopa) || ('Único' as TallaRopa),
    color: b.color || '',
    marca: b.marca || '',
    material: b.material || '',
    genero: (b.genero as GeneroRopa) || GeneroRopa.UNISEX,

    // Preserve catalog IDs for edit forms (not in Producto type, accessed via `as any`)
    ...(b.tallaId != null && { tallaId: b.tallaId }),
    ...(b.colorId != null && { colorId: b.colorId }),
    ...(b.marcaId != null && { marcaId: b.marcaId }),
    ...(b.materialId != null && { materialId: b.materialId }),
    ...(b.generoId != null && { generoId: b.generoId }),
    ...(b.imagenUrl != null && { imagenUrl: b.imagenUrl }),

    tipoProducto: TipoProducto.BIEN,
    estadoProducto: b.estado ? EstadoProducto.ACTIVO : EstadoProducto.INACTIVO,
    estadoStock: EstadoStockProducto.DISPONIBLE,

    activo: b.estado,
    fechaCreacion: new Date(b.createdAt),
    fechaActualizacion: new Date(b.updatedAt || b.createdAt),
  } as Producto;
}

function mapBackendCategoria(b: BackendCategoria): Categoria {
  return {
    id: b.id,
    codigoCategoria: b.codigo || '',
    nombreCategoria: b.nombre || '',
    descripcion: b.descripcion,
    activa: b.estado,
    fechaCreacion: new Date(b.createdAt),
    fechaActualizacion: new Date(b.createdAt),
  };
}

function mapBackendUnidadMedida(b: BackendUnidadMedida): UnidadMedida {
  return {
    id: b.id,
    codigoUnidad: b.codigo || '',
    nombreUnidad: b.nombre || '',
    simbolo: b.simbolo || '',
    activa: b.estado,
    fechaCreacion: new Date(b.createdAt),
    fechaActualizacion: new Date(b.createdAt),
  };
}

// ============= MAPEO FRONTEND -> BACKEND (Request bodies) =============

function buildProductoRequestBody(
  data: CrearProductoDTO | Partial<Producto>,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if ('codigoProducto' in data && data.codigoProducto != null)
    body.sku = data.codigoProducto;
  if ('nombreProducto' in data && data.nombreProducto != null)
    body.nombre = data.nombreProducto;
  if ('descripcion' in data && data.descripcion != null)
    body.descripcion = data.descripcion;
  if ('categoriaId' in data && data.categoriaId != null)
    body.categoriaId = Number(data.categoriaId);
  if ('unidadMedidaId' in data && data.unidadMedidaId != null)
    body.unidadMedidaId = Number(data.unidadMedidaId);
  if ('precioVenta' in data && data.precioVenta != null)
    body.precioVenta = data.precioVenta;
  if ('precioCosto' in data && data.precioCosto != null)
    body.precioCosto = data.precioCosto;
  if ('stockMinimo' in data && data.stockMinimo != null)
    body.stockMinimo = data.stockMinimo;

  // Map frontend activo (boolean) -> backend estado (boolean)
  if ('activo' in data && data.activo != null) body.estado = data.activo;

  // Clothing-specific fields: prefer IDs (FK references) over string values
  if ('tallaId' in data && (data as any).tallaId != null)
    body.tallaId = Number((data as any).tallaId);
  else if ('talla' in data && data.talla) body.talla = data.talla;

  if ('colorId' in data && (data as any).colorId != null)
    body.colorId = Number((data as any).colorId);
  else if ('color' in data && data.color) body.color = data.color;

  if ('marcaId' in data && (data as any).marcaId != null)
    body.marcaId = Number((data as any).marcaId);
  else if ('marca' in data && data.marca) body.marca = data.marca;

  if ('materialId' in data && (data as any).materialId != null)
    body.materialId = Number((data as any).materialId);
  else if ('material' in data && data.material) body.material = data.material;

  if ('generoId' in data && (data as any).generoId != null)
    body.generoId = Number((data as any).generoId);
  else if ('genero' in data && data.genero) body.genero = data.genero;

  if ('imagenUrl' in data && (data as any).imagenUrl)
    body.imagenUrl = (data as any).imagenUrl;

  return body;
}

// ============= EXPORTED API FUNCTIONS =============

/**
 * Obtiene productos del catalogo con filtros y paginacion.
 * GET /productos?categoria&estado&q&page&size
 */
export async function getProductos(
  filtros?: ProductoFiltros,
): Promise<ProductosPaginados> {
  // Support both shared-types field names (pagina, tamañoPagina) and legacy
  // mock field names (page, limit) in case some callers still use the old shape.
  const f = filtros as any;
  const pagina = filtros?.pagina ?? f?.page ?? 1;
  const limite = filtros?.tamañoPagina ?? f?.limit ?? 10;
  const { page, size } = toBackendPage(pagina, limite);

  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('size', String(size));

  // Search text — backend expects 'nombre' param on GET /productos
  const busqueda = filtros?.busqueda ?? f?.q;
  if (busqueda) params.append('nombre', busqueda);

  // Category filter — backend expects 'categoriaId' (numeric)
  const categoriaId = filtros?.categoriaId ?? f?.categoriaId ?? f?.categoria;
  if (categoriaId) params.append('categoriaId', String(categoriaId));

  const endpoint = `/productos?${params.toString()}`;
  const res: ApiResponse<BackendProducto[]> = await apiService.get(endpoint);

  if (!res.success || !res.data) {
    throw new Error(
      res.message || res.error || 'Error al cargar productos',
    );
  }

  const pag = fromBackendPage(res.pagination);

  let productos = res.data.map(mapBackendProducto);

  // Client-side estado filter (backend GET /productos doesn't support estado param)
  const estadoFilter = filtros?.estadoProducto ?? f?.estadoProducto;
  if (estadoFilter) {
    const wantActive = estadoFilter === EstadoProducto.ACTIVO;
    productos = productos.filter(p => p.activo === wantActive);
  }

  // Return shape matching ProductosPaginados interface that the reducer expects
  return {
    productos,
    total: estadoFilter ? productos.length : pag.total,
    pagina: pag.page,
    tamañoPagina: pag.limit,
    totalPaginas: estadoFilter
      ? Math.ceil(productos.length / pag.limit) || 1
      : pag.pages,
  };
}

/**
 * Obtiene un producto por su ID.
 * GET /productos/{id}
 */
export async function getProductoById(
  id: number,
): Promise<Producto | undefined> {
  const res: ApiResponse<BackendProducto> = await apiService.get(
    `/productos/${Number(id)}`,
  );

  if (!res.success || !res.data) {
    return undefined;
  }
  return mapBackendProducto(res.data);
}

/**
 * Crea un nuevo producto en el catalogo.
 * POST /productos
 */
export async function crearProducto(
  data: CrearProductoDTO,
): Promise<Producto> {
  const body = buildProductoRequestBody(data);
  const res: ApiResponse<BackendProducto> = await apiService.post(
    '/productos',
    body,
  );

  if (!res.success || !res.data) {
    throw new Error(
      res.message || res.error || 'Error al crear producto',
    );
  }
  return mapBackendProducto(res.data);
}

/**
 * Actualiza un producto existente.
 * PUT /productos/{id}
 */
export async function actualizarProducto(
  id: number,
  data: Partial<Producto>,
): Promise<Producto | undefined> {
  const body = buildProductoRequestBody(data);
  const res: ApiResponse<BackendProducto> = await apiService.put(
    `/productos/${Number(id)}`,
    body,
  );

  if (!res.success || !res.data) {
    throw new Error(
      res.message || res.error || 'Error al actualizar producto',
    );
  }
  return mapBackendProducto(res.data);
}

/**
 * Elimina un producto del catalogo.
 * DELETE /productos/{id}
 */
export async function eliminarProducto(id: number): Promise<boolean> {
  const res: ApiResponse<void> = await apiService.delete(
    `/productos/${Number(id)}`,
  );

  if (!res.success) {
    throw new Error(
      res.message || res.error || 'Error al eliminar producto',
    );
  }
  return true;
}

/**
 * Verifica si un codigo de producto (SKU) ya existe.
 * Performs a search and checks results locally since there is no
 * dedicated backend endpoint.
 */
export async function verificarCodigoProducto(
  codigo: string,
  excludeId?: number,
): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.append('q', codigo);
    params.append('size', '5');

    const res: ApiResponse<BackendProducto[]> = await apiService.get(
      `/productos?${params.toString()}`,
    );
    if (!res.success || !res.data) return false;

    return res.data.some((p) => p.sku === codigo && p.id !== excludeId);
  } catch {
    return false;
  }
}

/**
 * Cambia el estado activo/inactivo de un producto.
 * PATCH /productos/{id}/estado
 */
export async function cambiarEstadoProducto(
  id: number,
  activo: boolean,
): Promise<Producto | undefined> {
  const res: ApiResponse<BackendProducto> = await apiService.patch(
    `/productos/${Number(id)}/estado`,
    { estado: activo },
  );

  if (!res.success || !res.data) {
    return undefined;
  }
  return mapBackendProducto(res.data);
}

/**
 * Obtiene todas las categorias de productos.
 * GET /categorias
 */
export async function getCategorias(): Promise<Categoria[]> {
  const res: ApiResponse<BackendCategoria[]> =
    await apiService.get('/configuracion/categorias');

  if (!res.success || !res.data) {
    return [];
  }
  return res.data.map(mapBackendCategoria);
}

/**
 * Obtiene todas las unidades de medida.
 * GET /unidades-medida
 */
export async function getUnidadesMedida(): Promise<UnidadMedida[]> {
  const res: ApiResponse<BackendUnidadMedida[]> =
    await apiService.get('/configuracion/unidades-medida');

  if (!res.success || !res.data) {
    return [];
  }
  return res.data.map(mapBackendUnidadMedida);
}

// ==========================================
// Product Image API functions
// ==========================================

export interface ProductImage {
  id: number;
  productoId: number;
  url: string;
  altText?: string;
  orden: number;
  esPrincipal: boolean;
  createdAt?: string;
}

export interface AddImageInput {
  url: string;
  altText?: string;
  orden?: number;
  esPrincipal?: boolean;
}

/**
 * Obtiene las imágenes de un producto.
 * GET /productos/{id}/imagenes
 */
export async function getProductImages(productoId: number): Promise<ProductImage[]> {
  const res: ApiResponse<ProductImage[]> = await apiService.get(`/productos/${productoId}/imagenes`);
  if (!res.success || !res.data) {
    return [];
  }
  return res.data;
}

/**
 * Agrega una imagen a un producto.
 * POST /productos/{id}/imagenes
 */
export async function addProductImage(productoId: number, input: AddImageInput): Promise<ProductImage> {
  const res: ApiResponse<ProductImage> = await apiService.post(`/productos/${productoId}/imagenes`, input);
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Error al agregar imagen');
  }
  return res.data;
}

/**
 * Elimina una imagen de un producto.
 * DELETE /productos/{productoId}/imagenes/{imagenId}
 */
export async function deleteProductImage(productoId: number, imagenId: number): Promise<void> {
  const res: ApiResponse<void> = await apiService.delete(`/productos/${productoId}/imagenes/${imagenId}`);
  if (!res.success) {
    throw new Error(res.message || 'Error al eliminar imagen');
  }
}
