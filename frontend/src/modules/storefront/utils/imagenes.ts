/**
 * Image fallback utility for storefront products.
 *
 * When the backend doesn't return image URLs, this provides
 * deterministic local images based on product gender + category.
 *
 * Ported from _storefront_external/src/services/api.ts
 */

// Local images in public/img/productos/
const IMAGENES_LOCALES: Record<string, string[]> = {
  'mujer-polos': [
    '/img/productos/mujer/polos/polo-mujer-1.avif',
    '/img/productos/mujer/polos/polo-mujer-2.jpg',
    '/img/productos/mujer/polos/polo-mujer-3.jpg',
  ],
  'hombre-polos': [
    '/img/productos/hombre/polos/polo-hombre-1.avif',
    '/img/productos/hombre/polos/polo-hombre-2.avif',
    '/img/productos/hombre/polos/polo-hombre-3.jpg',
  ],
  'mujer-pantalones': [
    '/img/productos/mujer/pantalones/pantalon-mujer-1.jpg',
    '/img/productos/mujer/pantalones/pantalon-mujer-2.jpg',
    '/img/productos/mujer/pantalones/pantalon-mujer-3.jpg',
  ],
  'hombre-pantalones': [
    '/img/productos/hombre/pantalones/pantalon-hombre-1.jpg',
    '/img/productos/hombre/pantalones/pantalon-hombre-2.avif',
    '/img/productos/hombre/pantalones/pantalon-hombre-3.jpg',
  ],
  'mujer-accesorios': [
    '/img/productos/mujer/accesorios/accesorio-mujer-1.jpg',
    '/img/productos/mujer/accesorios/accesorio-mujer-2.jpg',
    '/img/productos/mujer/accesorios/accesorio-mujer-3.jpg',
  ],
  'hombre-accesorios': [
    '/img/productos/hombre/accesorios/accesorio-hombre-1.avif',
    '/img/productos/hombre/accesorios/accesorio-hombre-2.jpg',
    '/img/productos/hombre/accesorios/accesorio-hombre-3.jpg',
  ],
  'mujer-casacas': [
    '/img/productos/hombre/casacas/casaca-hombre-1.jpg',
    '/img/productos/hombre/casacas/casaca-hombre-2.jpg',
    '/img/productos/hombre/casacas/casaca-hombre-3.avif',
  ],
  'hombre-casacas': [
    '/img/productos/hombre/casacas/casaca-hombre-1.jpg',
    '/img/productos/hombre/casacas/casaca-hombre-2.jpg',
    '/img/productos/hombre/casacas/casaca-hombre-3.avif',
  ],
  'mujer-vestidos': [
    '/img/productos/mujer/vestidos/vestido-mujer-1.jpg',
    '/img/productos/mujer/vestidos/vestido-mujer-2.jpg',
    '/img/productos/mujer/vestidos/vestido-mujer-3.jpg',
  ],
};

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1503341504253-dff4815485f8?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=600&fit=crop',
];

/**
 * Get a fallback image URL based on the product's gender and category.
 * The same product ID always returns the same image (deterministic).
 */
export function obtenerImagenFallback(producto: {
  id: number;
  genero?: string | null;
  generoId?: number | null;
  nombre?: string;
  categoria?: { nombre?: string } | null;
  categoriaNombre?: string;
}): string {
  // Determine gender
  let genero = '';
  if (producto.genero) {
    genero = producto.genero.toLowerCase();
  } else if (producto.generoId) {
    genero = producto.generoId === 1 ? 'mujer' : producto.generoId === 2 ? 'hombre' : 'unisex';
  } else {
    const nombre = (producto.nombre || '').toLowerCase();
    if (nombre.includes('hombre') || nombre.includes('masculino') || nombre.includes('caballero')) {
      genero = 'hombre';
    } else if (nombre.includes('mujer') || nombre.includes('femenino') || nombre.includes('dama')) {
      genero = 'mujer';
    } else {
      genero = (producto.id % 2 === 0) ? 'mujer' : 'hombre';
    }
  }

  // Determine category
  const catName = (producto.categoria?.nombre || producto.categoriaNombre || '').toLowerCase();
  let catNormalizada = 'polos';
  if (catName.includes('polo') || catName.includes('camiseta') || catName.includes('top')) catNormalizada = 'polos';
  else if (catName.includes('pantalon') || catName.includes('jean') || catName.includes('jogger')) catNormalizada = 'pantalones';
  else if (catName.includes('accesorio') || catName.includes('gorra') || catName.includes('lente')) catNormalizada = 'accesorios';
  else if (catName.includes('casaca') || catName.includes('chaqueta') || catName.includes('bomber')) catNormalizada = 'casacas';
  else if (catName.includes('vestido') || catName.includes('falda')) catNormalizada = 'vestidos';
  else if (catName.includes('zapatilla') || catName.includes('calzado') || catName.includes('zapato')) catNormalizada = 'accesorios';

  const key = `${genero}-${catNormalizada}`;
  const imagenes = IMAGENES_LOCALES[key];

  if (imagenes && imagenes.length > 0) {
    return imagenes[producto.id % imagenes.length];
  }

  return PLACEHOLDER_IMAGES[producto.id % PLACEHOLDER_IMAGES.length];
}

/**
 * Resolve image URL for a product from backend data.
 * Priority: existing imagenUrl > first image in imagenes array > fallback.
 */
export function resolverImagenProducto(producto: {
  id: number;
  imagenUrl?: string | null;
  imagenes?: { url: string }[] | string[];
  genero?: string | null;
  generoId?: number | null;
  nombre?: string;
  categoria?: { nombre?: string } | null;
  categoriaNombre?: string;
}): string {
  // If backend already provides a valid imagenUrl
  if (producto.imagenUrl && (
    producto.imagenUrl.startsWith('/img/') ||
    producto.imagenUrl.startsWith('http://') ||
    producto.imagenUrl.startsWith('https://')
  )) {
    return producto.imagenUrl;
  }

  // If backend provides an images array
  if (producto.imagenes && producto.imagenes.length > 0) {
    const first = producto.imagenes[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && 'url' in first) return first.url;
  }

  // Fallback to local/placeholder
  return obtenerImagenFallback(producto);
}
