/**
 * Type Mappers: Backend → Monorepo Types
 *
 * Converts Spring Boot backend response shapes to the
 * @monorepo/shared-types interfaces used by storefront components.
 */

import type {
  ProductoStorefront,
  CategoriaStorefront,
  RespuestaPaginada,
  ImagenProducto,
  Talla,
  Color,
  Marca,
  Material,
  Genero,
} from '@monorepo/shared-types';
import type { SpringPageable } from './storefrontFetch';
import { resolverImagenProducto } from '../utils/imagenes';

// ---- Raw backend shapes ----

/** Raw product as returned by GET /storefront/productos */
export interface BackendProducto {
  id: number;
  sku: string;
  nombre: string;
  slug: string;
  descripcion: string;
  categoriaNombre?: string;
  categoriaSlug?: string;
  categoriaId?: number;
  precioVenta: number;
  precioCosto?: number;
  enLiquidacion: boolean;
  porcentajeLiquidacion: number;
  disponible: boolean;
  genero?: string;
  generoId?: number;
  marcaId?: number;
  marcaNombre?: string;
  materialId?: number;
  materialNombre?: string;
  generoNombre?: string;
  categoria?: any;
  imagenes?: string[];
  imagenUrl?: string;
  stockTotal?: number;
  stockMinimo?: number;
  controlaInventario?: boolean;
  codigoBarras?: string;
  estado?: number;
  createdAt?: string;
  updatedAt?: string;
  tallasDisponibles?: number[];
  coloresDisponibles?: number[];
  tenantId?: number;
}

/** Raw category from GET /storefront/categorias */
export interface BackendCategoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  codigo?: string;
}

// ---- Mappers ----

/**
 * Map a backend product to ProductoStorefront.
 */
export function mapProducto(raw: BackendProducto): ProductoStorefront {
  const producto: ProductoStorefront = {
    id: raw.id,
    tenantId: raw.tenantId ?? 1,
    sku: raw.sku || '',
    nombre: raw.nombre,
    slug: raw.slug || `producto-${raw.id}`,
    descripcion: raw.descripcion || '',
    codigoBarras: raw.codigoBarras || null,

    categoriaId: raw.categoriaId ?? null,
    marcaId: raw.marcaId ?? null,
    materialId: raw.materialId ?? null,
    generoId: raw.generoId ?? null,

    imagenUrl: null,
    precioCosto: raw.precioCosto ?? 0,
    precioVenta: raw.precioVenta,

    stockMinimo: raw.stockMinimo ?? 0,
    controlaInventario: raw.controlaInventario ?? true,
    stockTotal: raw.stockTotal,
    disponible: raw.disponible ?? true,

    enLiquidacion: raw.enLiquidacion ?? false,
    porcentajeLiquidacion: raw.porcentajeLiquidacion ?? 0,
    fechaInicioLiquidacion: null,
    fechaFinLiquidacion: null,

    estado: raw.estado ?? 1,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt,

    // Denormalized names
    categoriaNombre: raw.categoriaNombre || raw.categoria?.nombre,
    marcaNombre: raw.marcaNombre,
    materialNombre: raw.materialNombre,
    generoNombre: raw.generoNombre || raw.genero,

    tallasDisponibles: raw.tallasDisponibles || [],
    coloresDisponibles: raw.coloresDisponibles || [],
  };

  // Compute precioLiquidacion
  if (producto.enLiquidacion && producto.porcentajeLiquidacion > 0) {
    producto.precioLiquidacion =
      producto.precioVenta - (producto.precioVenta * producto.porcentajeLiquidacion / 100);
  }

  // Resolve image URL
  producto.imagenUrl = resolverImagenProducto({
    ...raw,
    id: raw.id,
    imagenUrl: raw.imagenUrl,
    imagenes: raw.imagenes?.map(url => ({ url })),
    generoId: raw.generoId,
    genero: raw.genero,
    nombre: raw.nombre,
    categoriaNombre: raw.categoriaNombre,
  });

  return producto;
}

/**
 * Map a Spring Boot Pageable response to RespuestaPaginada.
 */
export function mapPaginado<TRaw, TOutput>(
  page: SpringPageable<TRaw>,
  mapper: (item: TRaw) => TOutput
): RespuestaPaginada<TOutput> {
  return {
    data: page.content.map(mapper),
    pagination: {
      page: page.number + 1, // Spring is 0-based, our frontend is 1-based
      pageSize: page.size,
      totalItems: page.totalElements,
      totalPages: page.totalPages,
    },
  };
}

/**
 * Map a backend category to CategoriaStorefront.
 */
export function mapCategoria(raw: BackendCategoria): CategoriaStorefront {
  return {
    id: raw.id,
    codigo: raw.codigo || raw.nombre.substring(0, 4).toUpperCase(),
    nombre: raw.nombre,
    slug: raw.slug || raw.nombre.toLowerCase().replace(/\s+/g, '-'),
    descripcion: raw.descripcion || '',
    estado: 1,
  };
}

/**
 * Map config API CatalogItem to storefront Talla type.
 */
export function mapCatalogToTalla(raw: any): Talla {
  return {
    id: raw.id,
    codigo: raw.codigo || '',
    descripcion: raw.nombre || raw.descripcion || '',
    ordenVisualizacion: raw.ordenVisualizacion ?? raw.id,
    estado: raw.estado === true || raw.estado === 1 ? 1 : 0,
  };
}

/**
 * Map config API CatalogItem to storefront Color type.
 */
export function mapCatalogToColor(raw: any): Color {
  return {
    id: raw.id,
    codigo: raw.codigo || '',
    nombre: raw.nombre || '',
    codigoHex: raw.codigoHex || '#000000',
    estado: raw.estado === true || raw.estado === 1 ? 1 : 0,
  };
}

/**
 * Map config API CatalogItem to storefront Marca type.
 */
export function mapCatalogToMarca(raw: any): Marca {
  return {
    id: raw.id,
    codigo: raw.codigo || '',
    nombre: raw.nombre || '',
    logoUrl: raw.logoUrl || null,
    estado: raw.estado === true || raw.estado === 1 ? 1 : 0,
  };
}

/**
 * Map config API CatalogItem to storefront Material type.
 */
export function mapCatalogToMaterial(raw: any): Material {
  return {
    id: raw.id,
    codigo: raw.codigo || '',
    descripcion: raw.nombre || raw.descripcion || '',
    estado: raw.estado === true || raw.estado === 1 ? 1 : 0,
  };
}

/**
 * Map config API CatalogItem to storefront Genero type.
 */
export function mapCatalogToGenero(raw: any): Genero {
  return {
    id: raw.id,
    codigo: raw.codigo || '',
    descripcion: raw.nombre || raw.descripcion || '',
    estado: raw.estado === true || raw.estado === 1 ? 1 : 0,
  };
}

/**
 * Map backend image to ImagenProducto.
 */
export function mapImagen(raw: any): ImagenProducto {
  return {
    id: raw.id,
    productoId: raw.productoId,
    url: raw.url,
    altText: raw.altText,
    orden: raw.orden ?? 0,
    esPrincipal: raw.esPrincipal ?? false,
  };
}
