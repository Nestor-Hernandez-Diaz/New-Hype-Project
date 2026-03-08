/**
 * Type Mappers: Backend → Monorepo Types
 *
 * Converts Spring Boot backend response shapes to the
 * @monorepo/shared-types interfaces used by storefront components.
 */

import type {
  ProductoStorefront,
  VarianteStorefront,
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
  tallaNombre?: string;
  colorNombre?: string;
  tallaId?: number;
  colorId?: number;
  unidadMedidaId?: number;
  unidadNombre?: string;
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
  variantes?: Array<{
    id: number;
    sku: string;
    tallaId: number;
    tallaNombre?: string;
    colorId: number;
    colorNombre?: string;
    colorHex?: string;
    stock: number;
    disponible: boolean;
    imagenUrl?: string;
    imagenes?: string[];
    precioVenta: number;
  }>;
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
  // Build imagenes array from backend string URLs
  const imagenesArray: ImagenProducto[] = (raw.imagenes || []).map((url, index) => ({
    id: index,
    productoId: raw.id,
    url,
    altText: `${raw.nombre} - imagen ${index + 1}`,
    orden: index,
    esPrincipal: index === 0,
  }));

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
    imagenes: imagenesArray,
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
    tallaNombre: raw.tallaNombre,
    colorNombre: raw.colorNombre,
    unidadNombre: raw.unidadNombre,

    tallasDisponibles: (raw.tallasDisponibles && raw.tallasDisponibles.length > 0)
      ? raw.tallasDisponibles
      : (raw.tallaId ? [raw.tallaId] : []),
    coloresDisponibles: (raw.coloresDisponibles && raw.coloresDisponibles.length > 0)
      ? raw.coloresDisponibles
      : (raw.colorId ? [raw.colorId] : []),
  };

  // Map variantes if present (only on product detail page)
  if (raw.variantes && raw.variantes.length > 0) {
    producto.variantes = raw.variantes.map((v): VarianteStorefront => ({
      id: v.id,
      sku: v.sku || '',
      tallaId: v.tallaId,
      tallaNombre: v.tallaNombre || '',
      colorId: v.colorId,
      colorNombre: v.colorNombre || '',
      colorHex: v.colorHex,
      stock: v.stock ?? 0,
      disponible: v.disponible ?? (v.stock > 0),
      imagenUrl: v.imagenUrl || null,
      imagenes: v.imagenes || [],
      precioVenta: v.precioVenta ?? producto.precioVenta,
    }));
  }

  // Compute precioLiquidacion
  if (producto.enLiquidacion && producto.porcentajeLiquidacion > 0) {
    producto.precioLiquidacion =
      producto.precioVenta - (producto.precioVenta * producto.porcentajeLiquidacion / 100);
  }

  // Resolve image URL: prioritize imagenes_producto, then imagenUrl field, then fallback
  if (imagenesArray.length > 0) {
    producto.imagenUrl = imagenesArray[0].url;
  } else {
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
  }

  return producto;
}

/**
 * Map a Spring Boot Pageable response to RespuestaPaginada.
 */
export function mapPaginado<TRaw, TOutput>(
  page: SpringPageable<TRaw>,
  mapper: (item: TRaw) => TOutput
): RespuestaPaginada<TOutput> {
  // Filter out null entries (backend may return nulls for filtered-out items)
  const validContent = (page.content || []).filter((item): item is TRaw => item != null);
  return {
    data: validContent.map(mapper),
    pagination: {
      page: page.number + 1, // Spring is 0-based, our frontend is 1-based
      pageSize: page.size,
      totalItems: validContent.length,
      totalPages: Math.ceil(validContent.length / page.size) || 1,
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
    estado: raw.estado === false || raw.estado === 0 ? 0 : 1,
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
    estado: raw.estado === false || raw.estado === 0 ? 0 : 1,
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
    estado: raw.estado === false || raw.estado === 0 ? 0 : 1,
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
    estado: raw.estado === false || raw.estado === 0 ? 0 : 1,
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
    estado: raw.estado === false || raw.estado === 0 ? 0 : 1,
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
