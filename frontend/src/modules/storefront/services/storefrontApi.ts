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

import configuracionApi from '../../configuration/services/configuracionApi';

// ============================================================================
// CACHED CATALOGS
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

async function loadCatalogs() {
  if (catalogCache) return catalogCache;
  if (catalogPromise) return catalogPromise;

  catalogPromise = (async () => {
    try {
      const [tallasRaw, coloresRaw, marcasRaw, materialesRaw, generosRaw] =
        await Promise.all([
          configuracionApi.getTallas().catch(() => []),
          configuracionApi.getColores().catch(() => []),
          configuracionApi.getMarcas().catch(() => []),
          configuracionApi.getMateriales().catch(() => []),
          configuracionApi.getGeneros().catch(() => []),
        ]);

      catalogCache = {
        tallas: tallasRaw.filter((t: any) => t.estado).map(mapCatalogToTalla),
        colores: coloresRaw.filter((c: any) => c.estado).map(mapCatalogToColor),
        marcas: marcasRaw.filter((m: any) => m.estado).map(mapCatalogToMarca),
        materiales: materialesRaw.filter((m: any) => m.estado).map(mapCatalogToMaterial),
        generos: generosRaw.filter((g: any) => g.estado).map(mapCatalogToGenero),
      };

      console.log('[storefrontApi] Catalogs loaded:', {
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
  const tenantId = getTenantId();
  try {
    // The backend may not have a dedicated /productos/{id} storefront endpoint,
    // so we fall back to fetching the products list and finding by id
    const res = await storefrontFetch<
      BackendApiResponse<SpringPageable<BackendProducto>>
    >(`/storefront/productos?tenantId=${tenantId}&page=0&size=100`);
    const found = res.data.content.find((p) => p.id === id);
    return found ? mapProducto(found) : null;
  } catch (error) {
    console.error('[storefrontApi] Error fetching product by id:', id, error);
    return null;
  }
}

/**
 * Get catalogs (tallas, colores, marcas, materiales, generos)
 * Uses the configuration API that already works for the admin panel.
 */
export async function apiObtenerCatalogos() {
  const catalogs = await loadCatalogs();
  return catalogs!;
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
