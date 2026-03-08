/**
 * Storefront API — Real Backend Integration
 *
 * Connects to the Spring Boot backend at spring.informaticapp.com:5001.
 * Maintains the same exported function signatures so all existing
 * storefront components continue working without changes.
 */

import type {
  ProductoStorefront,
  CategoriaStorefront,
  Talla,
  Color,
  Marca,
  Material,
  Genero,
  ImagenProducto,
  FiltrosProductos,
  RespuestaPaginada,
} from '@monorepo/shared-types';

import {
  storefrontFetch,
  getTenantId,
  type BackendApiResponse,
  type SpringPageable,
} from './storefrontFetch';

import {
  mapProducto,
  mapPaginado,
  mapCategoria,
  mapCatalogToTalla,
  mapCatalogToColor,
  mapCatalogToMarca,
  mapCatalogToMaterial,
  mapCatalogToGenero,
  mapImagen,
  type BackendProducto,
  type BackendCategoria,
} from './typeMappers';

// ============================================================================
// CACHED CATALOGS (loaded from public /storefront/catalogos endpoint)
// ============================================================================

// Simple in-memory cache for catalog data (loaded once per session)
let catalogCache: {
  tallas: Talla[];
  colores: Color[];
  marcas: Marca[];
  materiales: Material[];
  generos: Genero[];
} | null = null;

let catalogPromise: Promise<typeof catalogCache> | null = null;

/** Raw shape returned by GET /storefront/catalogos */
interface BackendCatalogosResponse {
  tallas: Array<{ id: number; codigo: string; nombre: string }>;
  colores: Array<{ id: number; codigo: string; nombre: string; codigoHex: string }>;
  marcas: Array<{ id: number; codigo: string; nombre: string }>;
  materiales: Array<{ id: number; codigo: string; nombre: string }>;
  generos: Array<{ id: number; codigo: string; nombre: string }>;
}

async function loadCatalogs() {
  if (catalogCache) return catalogCache;
  if (catalogPromise) return catalogPromise;

  catalogPromise = (async () => {
    try {
      const tenantId = getTenantId();
      const res = await storefrontFetch<BackendApiResponse<BackendCatalogosResponse>>(
        `/storefront/catalogos?tenantId=${tenantId}`
      );

      const data = res.data;

      catalogCache = {
        tallas: (data.tallas || []).map(mapCatalogToTalla),
        colores: (data.colores || []).map(mapCatalogToColor),
        marcas: (data.marcas || []).map(mapCatalogToMarca),
        materiales: (data.materiales || []).map(mapCatalogToMaterial),
        generos: (data.generos || []).map(mapCatalogToGenero),
      };

      console.log('[storefrontApi] Catalogs loaded from /storefront/catalogos:', {
        tallas: catalogCache.tallas.length,
        colores: catalogCache.colores.length,
        marcas: catalogCache.marcas.length,
        materiales: catalogCache.materiales.length,
        generos: catalogCache.generos.length,
      });

      return catalogCache;
    } catch (error) {
      console.error('[storefrontApi] Error loading catalogs:', error);
      catalogCache = { tallas: [], colores: [], marcas: [], materiales: [], generos: [] };
      return catalogCache;
    } finally {
      catalogPromise = null;
    }
  })();

  return catalogPromise;
}

// ============================================================================
// AUXILIARY FUNCTIONS (same signatures as before)
// ============================================================================

/**
 * Get a color by ID (from catalog cache)
 */
export function obtenerColor(id: number): Color | undefined {
  return catalogCache?.colores.find((c) => c.id === id);
}

/**
 * Get a talla by ID (from catalog cache)
 */
export function obtenerTalla(id: number): Talla | undefined {
  return catalogCache?.tallas.find((t) => t.id === id);
}

/**
 * Get images for a product from the backend.
 */
export async function obtenerImagenesProducto(
  productoId: number
): Promise<ImagenProducto[]> {
  try {
    const tenantId = getTenantId();
    const res = await storefrontFetch<BackendApiResponse<any[]>>(
      `/productos/${productoId}/imagenes?tenantId=${tenantId}`
    );
    return (res.data || []).map(mapImagen).sort((a, b) => a.orden - b.orden);
  } catch (error) {
    console.warn('[storefrontApi] Error fetching images for product', productoId, error);
    return [];
  }
}

/**
 * Calculate liquidation price (pure math, no change needed)
 */
export function calcularPrecioLiquidacion(
  producto: ProductoStorefront
): number {
  if (!producto.enLiquidacion || producto.porcentajeLiquidacion <= 0) {
    return producto.precioVenta;
  }
  return (
    producto.precioVenta -
    (producto.precioVenta * producto.porcentajeLiquidacion) / 100
  );
}

/**
 * Check if a product is "new" (created in the last 30 days)
 */
export function esProductoNuevo(producto: ProductoStorefront): boolean {
  const hoy = new Date();
  const creado = new Date(producto.createdAt);
  const diasDiferencia =
    (hoy.getTime() - creado.getTime()) / (1000 * 60 * 60 * 24);
  return diasDiferencia <= 30;
}

/**
 * Find product by slug (uses the API endpoint)
 */
export function obtenerProductoPorSlug(
  slug: string
): Promise<ProductoStorefront | null> {
  return apiObtenerProductoPorSlug(slug);
}

// ============================================================================
// API ENDPOINTS (Real Backend)
// ============================================================================

/**
 * GET /storefront/productos — Product listing with filters and pagination
 */
export async function apiObtenerProductos(
  filtros: FiltrosProductos = {}
): Promise<RespuestaPaginada<ProductoStorefront>> {
  const tenantId = getTenantId();

  // Build query params
  const params = new URLSearchParams();
  params.append('tenantId', tenantId);
  params.append('page', '0');
  params.append('size', '50');

  // Pass filters that the backend supports
  if (filtros.categoriaId) params.append('categoriaId', String(filtros.categoriaId));
  if (filtros.generoId) params.append('generoId', String(filtros.generoId));
  if (filtros.marcaId) params.append('marcaId', String(filtros.marcaId));
  if (filtros.busqueda) params.append('search', filtros.busqueda);

  try {
    const res = await storefrontFetch<
      BackendApiResponse<SpringPageable<BackendProducto>>
    >(`/storefront/productos?${params.toString()}`);

    let result = mapPaginado(res.data, mapProducto);

    // Apply client-side filters that backend may not support
    if (filtros.generoId) {
      result.data = result.data.filter((p) => p.generoId === filtros.generoId);
    }
    if (filtros.soloLiquidacion) {
      result.data = result.data.filter((p) => p.enLiquidacion);
    }
    if (filtros.soloNuevos) {
      result.data = result.data.filter((p) => esProductoNuevo(p));
    }
    if (filtros.precioMin) {
      result.data = result.data.filter(
        (p) => calcularPrecioLiquidacion(p) >= filtros.precioMin!
      );
    }
    if (filtros.precioMax) {
      result.data = result.data.filter(
        (p) => calcularPrecioLiquidacion(p) <= filtros.precioMax!
      );
    }
    if (filtros.tipoSeccion) {
      const categoriasAccesorios = [9, 10, 11, 12, 16, 17, 18];
      const categoriasCalzado = [13, 14, 15];
      if (filtros.tipoSeccion === 'accesorios') {
        result.data = result.data.filter((p) =>
          categoriasAccesorios.includes(p.categoriaId as number)
        );
      } else if (filtros.tipoSeccion === 'calzado') {
        result.data = result.data.filter((p) =>
          categoriasCalzado.includes(p.categoriaId as number)
        );
      }
    }

    // Sort client-side
    if (filtros.ordenarPor) {
      switch (filtros.ordenarPor) {
        case 'precio_asc':
          result.data.sort(
            (a, b) =>
              calcularPrecioLiquidacion(a) - calcularPrecioLiquidacion(b)
          );
          break;
        case 'precio_desc':
          result.data.sort(
            (a, b) =>
              calcularPrecioLiquidacion(b) - calcularPrecioLiquidacion(a)
          );
          break;
        case 'nuevo':
          result.data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'nombre_asc':
          result.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
        case 'nombre_desc':
          result.data.sort((a, b) => b.nombre.localeCompare(a.nombre));
          break;
      }
    }

    // Update pagination after filtering
    result.pagination.totalItems = result.data.length;
    result.pagination.totalPages = Math.ceil(
      result.data.length / result.pagination.pageSize
    );

    return result;
  } catch (error) {
    console.error('[storefrontApi] Error fetching products:', error);
    // Return empty result on error
    return {
      data: [],
      pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
    };
  }
}

/**
 * GET /storefront/categorias — Category listing
 */
export async function apiObtenerCategorias(): Promise<CategoriaStorefront[]> {
  const tenantId = getTenantId();
  try {
    const res = await storefrontFetch<
      BackendApiResponse<BackendCategoria[]>
    >(`/storefront/categorias?tenantId=${tenantId}`);
    return (res.data || []).map(mapCategoria);
  } catch (error) {
    console.error('[storefrontApi] Error fetching categories:', error);
    return [];
  }
}

/**
 * GET /storefront/productos/{slug} — Product detail by slug
 */
export async function apiObtenerProductoPorSlug(
  slug: string
): Promise<ProductoStorefront | null> {
  const tenantId = getTenantId();
  try {
    const res = await storefrontFetch<
      BackendApiResponse<BackendProducto>
    >(`/storefront/productos/${slug}?tenantId=${tenantId}`);
    return mapProducto(res.data);
  } catch (error) {
    console.error('[storefrontApi] Error fetching product by slug:', slug, error);
    return null;
  }
}

/**
 * Get product by ID (for favorites, etc.)
 */
export async function apiObtenerProductoPorId(
  id: number
): Promise<ProductoStorefront | null> {
  try {
    const productos = await apiObtenerProductosPorIds([id]);
    return productos.length > 0 ? productos[0] : null;
  } catch (error) {
    console.error('[storefrontApi] Error fetching product by id:', id, error);
    return null;
  }
}

/**
 * GET /storefront/productos/por-ids — Get multiple products by IDs (for favorites, cart, etc.)
 */
export async function apiObtenerProductosPorIds(
  ids: number[]
): Promise<ProductoStorefront[]> {
  if (ids.length === 0) return [];
  const tenantId = getTenantId();
  try {
    const res = await storefrontFetch<
      BackendApiResponse<BackendProducto[]>
    >(`/storefront/productos/por-ids?tenantId=${tenantId}&ids=${ids.join(',')}`);
    return (res.data || []).map(mapProducto);
  } catch (error) {
    console.error('[storefrontApi] Error fetching products by ids:', ids, error);
    return [];
  }
}

/**
 * Get catalogs (tallas, colores, marcas, materiales, generos)
 * Uses the public /storefront/catalogos endpoint (no auth required).
 */
export async function apiObtenerCatalogos() {
  const catalogs = await loadCatalogs();
  return catalogs!;
}

// ============================================================================
// EMPRESA API (Public endpoint, no auth required)
// ============================================================================

/** Raw shape returned by GET /storefront/empresa */
export interface EmpresaStorefrontData {
  nombreComercial: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  diasDevolucionBoleta?: number;
  diasDevolucionFactura?: number;
  diasVigenciaVale?: number;
  requiereEtiquetasOriginales?: boolean;
  requiereProductoSinUso?: boolean;
}

/**
 * GET /storefront/empresa — Public empresa data (contact, address, return policy)
 */
export async function apiObtenerEmpresa(): Promise<EmpresaStorefrontData> {
  const tenantId = getTenantId();
  const res = await storefrontFetch<BackendApiResponse<EmpresaStorefrontData>>(
    `/storefront/empresa?tenantId=${tenantId}`
  );
  return res.data;
}

// ============================================================================
// METODOS DE PAGO API (Public endpoint, no auth required)
// ============================================================================

export interface MetodoPagoStorefrontData {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  requiereReferencia: boolean;
}

/**
 * GET /storefront/metodos-pago — Active payment methods
 */
export async function apiObtenerMetodosPago(): Promise<MetodoPagoStorefrontData[]> {
  const tenantId = getTenantId();
  const res = await storefrontFetch<BackendApiResponse<MetodoPagoStorefrontData[]>>(
    `/storefront/metodos-pago?tenantId=${tenantId}`
  );
  return res.data || [];
}

// ============================================================================
// UBIGEO API (Public endpoint, no auth required)
// ============================================================================

export interface UbigeoItem {
  id: number;
  nombre: string;
  codigo?: string;
}

export async function apiObtenerDepartamentos(): Promise<UbigeoItem[]> {
  const res = await storefrontFetch<BackendApiResponse<UbigeoItem[]>>(
    '/storefront/ubigeo/departamentos'
  );
  return res.data || [];
}

export async function apiObtenerProvincias(departamentoId: number): Promise<UbigeoItem[]> {
  const res = await storefrontFetch<BackendApiResponse<UbigeoItem[]>>(
    `/storefront/ubigeo/provincias?departamentoId=${departamentoId}`
  );
  return res.data || [];
}

export async function apiObtenerDistritos(provinciaId: number): Promise<UbigeoItem[]> {
  const res = await storefrontFetch<BackendApiResponse<UbigeoItem[]>>(
    `/storefront/ubigeo/distritos?provinciaId=${provinciaId}`
  );
  return res.data || [];
}

// ============================================================================
// PEDIDOS API (Real Backend)
// ============================================================================

export interface CrearPedidoApiRequest {
  items: Array<{ productoId: number; cantidad: number }>;
  direccionEnvio: string;
  instrucciones?: string;
}

export interface PedidoApiResponse {
  id: number;
  codigo: string;
  estado: string;
  subtotal: number;
  igv: number;
  descuento: number | null;
  total: number;
  direccionEnvio: string;
  instrucciones: string | null;
  createdAt: string;
  updatedAt: string | null;
  detalles: Array<{
    productoId: number;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number | null;
    subtotal: number;
  }>;
}

/**
 * POST /storefront/pedidos — Create a new order (requires auth)
 */
export async function apiCrearPedido(
  request: CrearPedidoApiRequest
): Promise<PedidoApiResponse> {
  const res = await storefrontFetch<BackendApiResponse<PedidoApiResponse>>(
    '/storefront/pedidos',
    { method: 'POST', body: JSON.stringify(request) }
  );
  return res.data;
}

/**
 * GET /storefront/pedidos — List current customer's orders (requires auth)
 */
export async function apiObtenerMisPedidos(
  page = 0,
  size = 20
): Promise<SpringPageable<PedidoApiResponse>> {
  const res = await storefrontFetch<
    BackendApiResponse<SpringPageable<PedidoApiResponse>>
  >(`/storefront/pedidos?page=${page}&size=${size}`);
  return res.data;
}

/**
 * GET /storefront/pedidos/{id} — Get order detail (requires auth)
 */
export async function apiObtenerPedido(
  id: number
): Promise<PedidoApiResponse> {
  const res = await storefrontFetch<BackendApiResponse<PedidoApiResponse>>(
    `/storefront/pedidos/${id}`
  );
  return res.data;
}

/**
 * PATCH /storefront/pedidos/{id}/cancelar — Cancel an order (requires auth)
 */
export async function apiCancelarPedido(
  id: number
): Promise<PedidoApiResponse> {
  const res = await storefrontFetch<BackendApiResponse<PedidoApiResponse>>(
    `/storefront/pedidos/${id}/cancelar`,
    { method: 'PATCH' }
  );
  return res.data;
}
