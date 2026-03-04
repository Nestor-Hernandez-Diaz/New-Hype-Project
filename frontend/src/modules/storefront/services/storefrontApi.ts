/**
 * 🛍️ STOREFRONT API - Servicios Mock
 * 
 * Simulación de endpoints del backend para el storefront.
 * Todos los datos son locales (hardcoded) con promesas simuladas (latencia 800ms).
 * 
 * Dominio: TIENDA DE ROPA Y ACCESORIOS
 * 
 * @module storefrontApi
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
  RespuestaPaginada
} from '@monorepo/shared-types';

// ============================================================================
// CATÁLOGOS MAESTROS
// ============================================================================

const CATALOGOS_CATEGORIAS: CategoriaStorefront[] = [
  { id: 1, codigo: "VEST", nombre: "Vestidos", slug: "vestidos", descripcion: "Vestidos para toda ocasión", estado: 1 },
  { id: 2, codigo: "TOPS", nombre: "Tops & Blusas", slug: "tops-blusas", descripcion: "Tops, blusas y camisetas", estado: 1 },
  { id: 3, codigo: "JEAN", nombre: "Jeans", slug: "jeans", descripcion: "Jeans y pantalones de mezclilla", estado: 1 },
  { id: 4, codigo: "CSCA", nombre: "Casacas & Blazers", slug: "casacas-blazers", descripcion: "Abrigos, casacas y blazers", estado: 1 },
  { id: 5, codigo: "FALD", nombre: "Faldas", slug: "faldas", descripcion: "Faldas midi, mini y largas", estado: 1 },
  { id: 6, codigo: "HOOD", nombre: "Hoodies & Buzos", slug: "hoodies-buzos", descripcion: "Hoodies, buzos y sudaderas", estado: 1 },
  { id: 7, codigo: "CAMI", nombre: "Camisas & Polos", slug: "camisas-polos", descripcion: "Camisas, polos y poleras", estado: 1 },
  { id: 8, codigo: "JOGG", nombre: "Joggers & Shorts", slug: "joggers-shorts", descripcion: "Joggers, shorts y pantalones", estado: 1 },
  { id: 9, codigo: "LENT", nombre: "Lentes de Sol", slug: "lentes-sol", descripcion: "Lentes de sol y ópticos", estado: 1 },
  { id: 10, codigo: "BOLS", nombre: "Bolsos & Carteras", slug: "bolsos-carteras", descripcion: "Bolsos, carteras y mochilas", estado: 1 },
  { id: 11, codigo: "GORR", nombre: "Gorras & Sombreros", slug: "gorras-sombreros", descripcion: "Gorras, snapbacks y sombreros", estado: 1 },
  { id: 12, codigo: "JOYE", nombre: "Joyería", slug: "joyeria", descripcion: "Collares, pulseras y anillos", estado: 1 },
  { id: 13, codigo: "ZAPA", nombre: "Zapatillas", slug: "zapatillas", descripcion: "Zapatillas urbanas y deportivas", estado: 1 },
  { id: 14, codigo: "BOTA", nombre: "Botas", slug: "botas", descripcion: "Botas y botines", estado: 1 },
  { id: 15, codigo: "SAND", nombre: "Sandalias", slug: "sandalias", descripcion: "Sandalias y slides", estado: 1 },
  { id: 16, codigo: "RELJ", nombre: "Relojes", slug: "relojes", descripcion: "Relojes casual y elegantes", estado: 1 },
  { id: 17, codigo: "MOCH", nombre: "Mochilas", slug: "mochilas", descripcion: "Mochilas urbanas y escolares", estado: 1 },
  { id: 18, codigo: "CINT", nombre: "Cinturones", slug: "cinturones", descripcion: "Cinturones de cuero y textil", estado: 1 }
];

const CATALOGOS_TALLAS: Talla[] = [
  { id: 1, codigo: "XS", descripcion: "Extra Small", ordenVisualizacion: 1, estado: 1 },
  { id: 2, codigo: "S", descripcion: "Small", ordenVisualizacion: 2, estado: 1 },
  { id: 3, codigo: "M", descripcion: "Medium", ordenVisualizacion: 3, estado: 1 },
  { id: 4, codigo: "L", descripcion: "Large", ordenVisualizacion: 4, estado: 1 },
  { id: 5, codigo: "XL", descripcion: "Extra Large", ordenVisualizacion: 5, estado: 1 },
  { id: 6, codigo: "XXL", descripcion: "Double Extra Large", ordenVisualizacion: 6, estado: 1 },
  { id: 7, codigo: "Único", descripcion: "Talla única", ordenVisualizacion: 7, estado: 1 },
  { id: 8, codigo: "36", descripcion: "Talla 36", ordenVisualizacion: 10, estado: 1 },
  { id: 9, codigo: "37", descripcion: "Talla 37", ordenVisualizacion: 11, estado: 1 },
  { id: 10, codigo: "38", descripcion: "Talla 38", ordenVisualizacion: 12, estado: 1 },
  { id: 11, codigo: "39", descripcion: "Talla 39", ordenVisualizacion: 13, estado: 1 },
  { id: 12, codigo: "40", descripcion: "Talla 40", ordenVisualizacion: 14, estado: 1 },
  { id: 13, codigo: "41", descripcion: "Talla 41", ordenVisualizacion: 15, estado: 1 },
  { id: 14, codigo: "42", descripcion: "Talla 42", ordenVisualizacion: 16, estado: 1 },
  { id: 15, codigo: "43", descripcion: "Talla 43", ordenVisualizacion: 17, estado: 1 },
  { id: 16, codigo: "26", descripcion: "Cintura 26", ordenVisualizacion: 20, estado: 1 },
  { id: 17, codigo: "28", descripcion: "Cintura 28", ordenVisualizacion: 21, estado: 1 },
  { id: 18, codigo: "30", descripcion: "Cintura 30", ordenVisualizacion: 22, estado: 1 },
  { id: 19, codigo: "32", descripcion: "Cintura 32", ordenVisualizacion: 23, estado: 1 },
  { id: 20, codigo: "34", descripcion: "Cintura 34", ordenVisualizacion: 24, estado: 1 }
];

const CATALOGOS_COLORES: Color[] = [
  { id: 1, codigo: "NGR", nombre: "Negro", codigoHex: "#0a0a0a", estado: 1 },
  { id: 2, codigo: "BLC", nombre: "Blanco", codigoHex: "#f5f5f0", estado: 1 },
  { id: 3, codigo: "DRD", nombre: "Dorado", codigoHex: "#c9a96e", estado: 1 },
  { id: 4, codigo: "GRN", nombre: "Guinda", codigoHex: "#8b0000", estado: 1 },
  { id: 5, codigo: "AZP", nombre: "Azul Petróleo", codigoHex: "#1a1a2e", estado: 1 },
  { id: 6, codigo: "CRM", nombre: "Crema", codigoHex: "#f5deb3", estado: 1 },
  { id: 7, codigo: "GRS", nombre: "Gris Oscuro", codigoHex: "#2d2d2d", estado: 1 },
  { id: 8, codigo: "AZD", nombre: "Azul Denim", codigoHex: "#4a6fa5", estado: 1 },
  { id: 9, codigo: "AZN", nombre: "Azul Noche", codigoHex: "#2c3e50", estado: 1 },
  { id: 10, codigo: "BEI", nombre: "Beige", codigoHex: "#d4c5a9", estado: 1 },
  { id: 11, codigo: "VRD", nombre: "Verde Olivo", codigoHex: "#3d5a3d", estado: 1 },
  { id: 12, codigo: "VRM", nombre: "Verde Militar", codigoHex: "#5e5e3d", estado: 1 },
  { id: 13, codigo: "MRN", nombre: "Marrón", codigoHex: "#5e3a27", estado: 1 },
  { id: 14, codigo: "CEL", nombre: "Celeste", codigoHex: "#87CEEB", estado: 1 },
  { id: 15, codigo: "PLT", nombre: "Plata", codigoHex: "#c0c0c0", estado: 1 }
];

const CATALOGOS_MARCAS: Marca[] = [
  { id: 1, codigo: "NHP", nombre: "New Hype", logoUrl: null, estado: 1 },
  { id: 2, codigo: "UBL", nombre: "Urban Lab", logoUrl: null, estado: 1 },
  { id: 3, codigo: "ATL", nombre: "Atelier", logoUrl: null, estado: 1 },
  { id: 4, codigo: "DNC", nombre: "Denim & Co", logoUrl: null, estado: 1 }
];

const CATALOGOS_MATERIALES: Material[] = [
  { id: 1, codigo: "ALG", descripcion: "Algodón 100%", estado: 1 },
  { id: 2, codigo: "POL", descripcion: "Poliéster", estado: 1 },
  { id: 3, codigo: "LIN", descripcion: "Lino puro", estado: 1 },
  { id: 4, codigo: "DNM", descripcion: "Denim stretch", estado: 1 },
  { id: 5, codigo: "SAT", descripcion: "Tela satinada", estado: 1 },
  { id: 6, codigo: "CRS", descripcion: "Cuero sintético premium", estado: 1 },
  { id: 7, codigo: "GAM", descripcion: "Gamuza premium", estado: 1 },
  { id: 8, codigo: "ACR", descripcion: "Acrílico tejido", estado: 1 },
  { id: 9, codigo: "ACE", descripcion: "Acetato", estado: 1 },
  { id: 10, codigo: "ACI", descripcion: "Acero inoxidable", estado: 1 },
  { id: 11, codigo: "GOM", descripcion: "Goma EVA", estado: 1 },
  { id: 12, codigo: "CRG", descripcion: "Cuero genuino", estado: 1 },
  { id: 13, codigo: "NYL", descripcion: "Nylon resistente al agua", estado: 1 },
  { id: 14, codigo: "MXA", descripcion: "80% Algodón, 20% Poliéster", estado: 1 }
];

const CATALOGOS_GENEROS: Genero[] = [
  { id: 1, codigo: "MUJER", descripcion: "Mujer", estado: 1 },
  { id: 2, codigo: "HOMBRE", descripcion: "Hombre", estado: 1 },
  { id: 3, codigo: "UNISEX", descripcion: "Unisex", estado: 1 }
];

// ============================================================================
// PRODUCTOS MOCK
// ============================================================================

const PRODUCTOS: ProductoStorefront[] = [
  // ===== MUJER =====
  {
    id: 1,
    tenantId: 1,
    sku: "VMS-001",
    nombre: "Vestido Midi Satinado",
    slug: "vestido-midi-satinado",
    descripcion: "Vestido midi en tela satinada con escote en V y corte favorecedor. Perfecto para ocasiones especiales.",
    codigoBarras: null,
    categoriaId: 1,
    marcaId: 1,
    materialId: 5,
    generoId: 1,
    imagenUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    precioCosto: 95.00,
    precioVenta: 189.90,
    stockMinimo: 5,
    controlaInventario: true,
    enLiquidacion: false,
    porcentajeLiquidacion: 0,
    fechaInicioLiquidacion: null,
    fechaFinLiquidacion: null,
    estado: 1,
    createdAt: "2025-01-15T10:00:00Z",
    categoria: { id: 1, codigo: "VEST", nombre: "Vestidos", slug: "vestidos", descripcion: "", estado: 1 },
    marca: { id: 1, codigo: "NHP", nombre: "New Hype", logoUrl: null, estado: 1 },
    material: { id: 5, codigo: "SAT", descripcion: "Tela satinada", estado: 1 },
    genero: { id: 1, codigo: "MUJER", descripcion: "Mujer", estado: 1 },
    tallasDisponibles: [1, 2, 3, 4],
    coloresDisponibles: [5, 3, 4],
    stockTotal: 24
  },
  {
    id: 2,
    tenantId: 1,
    sku: "TCT-001",
    nombre: "Top Crop Tejido",
    slug: "top-crop-tejido",
    descripcion: "Top crop de punto con textura acanalada. Ideal para combinar con jeans de tiro alto.",
    codigoBarras: null,
    categoriaId: 2,
    marcaId: 2,
    materialId: 8,
    generoId: 1,
    imagenUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop",
    precioCosto: 30.00,
    precioVenta: 89.90,
    stockMinimo: 5,
    controlaInventario: true,
    enLiquidacion: true,
    porcentajeLiquidacion: 33,
    fechaInicioLiquidacion: "2025-02-01",
    fechaFinLiquidacion: "2025-03-31",
    estado: 1,
    createdAt: "2024-11-20T10:00:00Z",
    categoria: { id: 2, codigo: "TOPS", nombre: "Tops & Blusas", slug: "tops-blusas", descripcion: "", estado: 1 },
    marca: { id: 2, codigo: "UBL", nombre: "Urban Lab", logoUrl: null, estado: 1 },
    material: { id: 8, codigo: "ACR", descripcion: "Acrílico tejido", estado: 1 },
    genero: { id: 1, codigo: "MUJER", descripcion: "Mujer", estado: 1 },
    tallasDisponibles: [2, 3, 4],
    coloresDisponibles: [2, 6, 7],
    stockTotal: 18
  },
  {
    id: 3,
    tenantId: 1,
    sku: "JWL-001",
    nombre: "Jean Wide Leg Vintage",
    slug: "jean-wide-leg-vintage",
    descripcion: "Jean de pierna ancha con lavado vintage. Tiro alto y tela 100% algodón.",
    codigoBarras: null,
    categoriaId: 3,
    marcaId: 4,
    materialId: 4,
    generoId: 1,
    imagenUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop",
    precioCosto: 75.00,
    precioVenta: 149.90,
    stockMinimo: 5,
    controlaInventario: true,
    enLiquidacion: false,
    porcentajeLiquidacion: 0,
    fechaInicioLiquidacion: null,
    fechaFinLiquidacion: null,
    estado: 1,
    createdAt: "2025-01-28T10:00:00Z",
    categoria: { id: 3, codigo: "JEAN", nombre: "Jeans", slug: "jeans", descripcion: "", estado: 1 },
    marca: { id: 4, codigo: "DNC", nombre: "Denim & Co", logoUrl: null, estado: 1 },
    material: { id: 4, codigo: "DNM", descripcion: "Denim stretch", estado: 1 },
    genero: { id: 1, codigo: "MUJER", descripcion: "Mujer", estado: 1 },
    tallasDisponibles: [16, 17, 18, 19],
    coloresDisponibles: [8, 9],
    stockTotal: 22
  },
  {
    id: 4,
    tenantId: 1,
    sku: "BON-001",
    nombre: "Blazer Oversize Negro",
    slug: "blazer-oversize-negro",
    descripcion: "Blazer oversize de corte recto. Forro interior satinado. La pieza clave de tu armario.",
    codigoBarras: null,
    categoriaId: 4,
    marcaId: 1,
    materialId: 2,
    generoId: 1,
    imagenUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop",
    precioCosto: 115.00,
    precioVenta: 229.90,
    stockMinimo: 3,
    controlaInventario: true,
    enLiquidacion: false,
    porcentajeLiquidacion: 0,
    fechaInicioLiquidacion: null,
    fechaFinLiquidacion: null,
    estado: 1,
    createdAt: "2025-02-01T10:00:00Z",
    categoria: { id: 4, codigo: "CSCA", nombre: "Casacas & Blazers", slug: "casacas-blazers", descripcion: "", estado: 1 },
    marca: { id: 1, codigo: "NHP", nombre: "New Hype", logoUrl: null, estado: 1 },
    material: { id: 2, codigo: "POL", descripcion: "Poliéster", estado: 1 },
    genero: { id: 1, codigo: "MUJER", descripcion: "Mujer", estado: 1 },
    tallasDisponibles: [2, 3, 4, 5],
    coloresDisponibles: [1, 10],
    stockTotal: 15
  },
  {
    id: 5,
    tenantId: 1,
    sku: "FPM-001",
    nombre: "Falda Plisada Midi",
    slug: "falda-plisada-midi",
    descripcion: "Falda plisada de largo midi con cintura elástica. Tela fluida con caída elegante.",
    codigoBarras: null,
    categoriaId: 5,
    marcaId: 3,
    materialId: 2,
    generoId: 1,
    imagenUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aebd?w=600&h=800&fit=crop",
    precioCosto: 50.00,
    precioVenta: 139.90,
    stockMinimo: 5,
    controlaInventario: true,
    enLiquidacion: true,
    porcentajeLiquidacion: 29,
    fechaInicioLiquidacion: "2025-02-01",
    fechaFinLiquidacion: "2025-03-15",
    estado: 1,
    createdAt: "2024-10-10T10:00:00Z",
    categoria: { id: 5, codigo: "FALD", nombre: "Faldas", slug: "faldas", descripcion: "", estado: 1 },
    marca: { id: 3, codigo: "ATL", nombre: "Atelier", logoUrl: null, estado: 1 },
    material: { id: 2, codigo: "POL", descripcion: "Poliéster", estado: 1 },
    genero: { id: 1, codigo: "MUJER", descripcion: "Mujer", estado: 1 },
    tallasDisponibles: [1, 2, 3, 4],
    coloresDisponibles: [7, 3, 13],
    stockTotal: 20
  },
  // ===== HOMBRE =====
  {
    id: 6,
    tenantId: 1,
    sku: "HOE-001",
    nombre: "Hoodie Oversized Essential",
    slug: "hoodie-oversized-essential",
    descripcion: "Hoodie oversize de algodón grueso 320gsm. Capucha doble y bolsillo canguro.",
    codigoBarras: null,
    categoriaId: 6,
    marcaId: 1,
    materialId: 1,
    generoId: 2,
    imagenUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop",
    precioCosto: 70.00,
    precioVenta: 139.90,
    stockMinimo: 5,
    controlaInventario: true,
    enLiquidacion: false,
    porcentajeLiquidacion: 0,
    fechaInicioLiquidacion: null,
    fechaFinLiquidacion: null,
    estado: 1,
    createdAt: "2025-02-05T10:00:00Z",
    categoria: { id: 6, codigo: "HOOD", nombre: "Hoodies & Buzos", slug: "hoodies-buzos", descripcion: "", estado: 1 },
    marca: { id: 1, codigo: "NHP", nombre: "New Hype", logoUrl: null, estado: 1 },
    material: { id: 1, codigo: "ALG", descripcion: "Algodón 100%", estado: 1 },
    genero: { id: 2, codigo: "HOMBRE", descripcion: "Hombre", estado: 1 },
    tallasDisponibles: [2, 3, 4, 5],
    coloresDisponibles: [7, 2, 11],
    stockTotal: 30
  },
  {
    id: 7,
    tenantId: 1,
    sku: "CLP-001",
    nombre: "Camisa Lino Premium",
    slug: "camisa-lino-premium",
    descripcion: "Camisa de lino puro con cuello mao. Frescura y elegancia para el día a día.",
    codigoBarras: null,
    categoriaId: 7,
    marcaId: 3,
    materialId: 3,
    generoId: 2,
    imagenUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
    precioCosto: 60.00,
    precioVenta: 119.90,
    stockMinimo: 5,
    controlaInventario: true,
    enLiquidacion: false,
    porcentajeLiquidacion: 0,
    fechaInicioLiquidacion: null,
    fechaFinLiquidacion: null,
    estado: 1,
    createdAt: "2025-01-20T10:00:00Z",
    categoria: { id: 7, codigo: "CAMI", nombre: "Camisas & Polos", slug: "camisas-polos", descripcion: "", estado: 1 },
    marca: { id: 3, codigo: "ATL", nombre: "Atelier", logoUrl: null, estado: 1 },
    material: { id: 3, codigo: "LIN", descripcion: "Lino puro", estado: 1 },
    genero: { id: 2, codigo: "HOMBRE", descripcion: "Hombre", estado: 1 },
    tallasDisponibles: [2, 3, 4, 5],
    coloresDisponibles: [2, 10, 14],
    stockTotal: 25
  },
  {
    id: 8,
    tenantId: 1,
    sku: "JSF-001",
    nombre: "Jean Slim Fit Black",
    slug: "jean-slim-fit-black",
    descripcion: "Jean slim fit en negro intenso. Denim stretch de alta calidad con lavado premium.",
    codigoBarras: null,
    categoriaId: 3,
    marcaId: 4,
    materialId: 4,
    generoId: 2,
    imagenUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop",
    precioCosto: 80.00,
    precioVenta: 159.90,
    stockMinimo: 5,
    controlaInventario: true,
    enLiquidacion: false,
    porcentajeLiquidacion: 0,
    fechaInicioLiquidacion: null,
    fechaFinLiquidacion: null,
    estado: 1,
    createdAt: "2024-12-20T10:00:00Z",
    categoria: { id: 3, codigo: "JEAN", nombre: "Jeans", slug: "jeans", descripcion: "", estado: 1 },
    marca: { id: 4, codigo: "DNC", nombre: "Denim & Co", logoUrl: null, estado: 1 },
    material: { id: 4, codigo: "DNM", descripcion: "Denim stretch", estado: 1 },
    genero: { id: 2, codigo: "HOMBRE", descripcion: "Hombre", estado: 1 },
    tallasDisponibles: [17, 18, 19, 20],
    coloresDisponibles: [1, 5],
    stockTotal: 28
  },
  // ===== ACCESORIOS =====
  {
    id: 11,
    tenantId: 1,
    sku: "LRC-001",
    nombre: "Lentes Sol Retro Cat Eye",
    slug: "lentes-sol-retro-cat-eye",
    descripcion: "Lentes de sol cat eye con protección UV400. Marco de acetato y diseño retro.",
    codigoBarras: null,
    categoriaId: 9,
    marcaId: 1,
    materialId: 9,
    generoId: 3,
    imagenUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop",
    precioCosto: 35.00,
    precioVenta: 79.90,
    stockMinimo: 10,
    controlaInventario: true,
    enLiquidacion: false,
    porcentajeLiquidacion: 0,
    fechaInicioLiquidacion: null,
    fechaFinLiquidacion: null,
    estado: 1,
    createdAt: "2025-01-25T10:00:00Z",
    categoria: { id: 9, codigo: "LENT", nombre: "Lentes de Sol", slug: "lentes-sol", descripcion: "", estado: 1 },
    marca: { id: 1, codigo: "NHP", nombre: "New Hype", logoUrl: null, estado: 1 },
    material: { id: 9, codigo: "ACE", descripcion: "Acetato", estado: 1 },
    genero: { id: 3, codigo: "UNISEX", descripcion: "Unisex", estado: 1 },
    tallasDisponibles: [7],
    coloresDisponibles: [1, 13, 6],
    stockTotal: 35
  },
  {
    id: 12,
    tenantId: 1,
    sku: "BTE-001",
    nombre: "Bolso Tote Estructurado",
    slug: "bolso-tote-estructurado",
    descripcion: "Bolso tote con estructura rígida. Cuero sintético premium con compartimientos internos.",
    codigoBarras: null,
    categoriaId: 10,
    marcaId: 3,
    materialId: 6,
    generoId: 1,
    imagenUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",
    precioCosto: 100.00,
    precioVenta: 259.90,
    stockMinimo: 5,
    controlaInventario: true,
    enLiquidacion: true,
    porcentajeLiquidacion: 23,
    fechaInicioLiquidacion: "2025-02-01",
    fechaFinLiquidacion: "2025-03-15",
    estado: 1,
    createdAt: "2024-11-15T10:00:00Z",
    categoria: { id: 10, codigo: "BOLS", nombre: "Bolsos & Carteras", slug: "bolsos-carteras", descripcion: "", estado: 1 },
    marca: { id: 3, codigo: "ATL", nombre: "Atelier", logoUrl: null, estado: 1 },
    material: { id: 6, codigo: "CRS", descripcion: "Cuero sintético premium", estado: 1 },
    genero: { id: 1, codigo: "MUJER", descripcion: "Mujer", estado: 1 },
    tallasDisponibles: [7],
    coloresDisponibles: [1, 3, 4],
    stockTotal: 12
  },
  {
    id: 13,
    tenantId: 1,
    sku: "GSC-001",
    nombre: "Gorra Snapback Classic",
    slug: "gorra-snapback-classic",
    descripcion: "Gorra snapback con logo bordado. Ajuste trasero y visera plana.",
    codigoBarras: null,
    categoriaId: 11,
    marcaId: 2,
    materialId: 1,
    generoId: 3,
    imagenUrl: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=800&fit=crop",
    precioCosto: 20.00,
    precioVenta: 49.90,
    stockMinimo: 10,
    controlaInventario: true,
    enLiquidacion: false,
    porcentajeLiquidacion: 0,
    fechaInicioLiquidacion: null,
    fechaFinLiquidacion: null,
    estado: 1,
    createdAt: "2024-12-15T10:00:00Z",
    categoria: { id: 11, codigo: "GORR", nombre: "Gorras & Sombreros", slug: "gorras-sombreros", descripcion: "", estado: 1 },
    marca: { id: 2, codigo: "UBL", nombre: "Urban Lab", logoUrl: null, estado: 1 },
    material: { id: 1, codigo: "ALG", descripcion: "Algodón 100%", estado: 1 },
    genero: { id: 3, codigo: "UNISEX", descripcion: "Unisex", estado: 1 },
    tallasDisponibles: [7],
    coloresDisponibles: [1, 2, 4],
    stockTotal: 40
  },
  // ===== CALZADO =====
  {
    id: 15,
    tenantId: 1,
    sku: "SPW-001",
    nombre: "Sneakers Platform White",
    slug: "sneakers-platform-white",
    descripcion: "Zapatillas plataforma en cuero blanco. Suela chunky de 4cm y diseño minimalista.",
    codigoBarras: null,
    categoriaId: 13,
    marcaId: 1,
    materialId: 6,
    generoId: 3,
    imagenUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=800&fit=crop",
    precioCosto: 110.00,
    precioVenta: 219.90,
    stockMinimo: 5,
    controlaInventario: true,
    enLiquidacion: false,
    porcentajeLiquidacion: 0,
    fechaInicioLiquidacion: null,
    fechaFinLiquidacion: null,
    estado: 1,
    createdAt: "2025-02-08T10:00:00Z",
    categoria: { id: 13, codigo: "ZAPA", nombre: "Zapatillas", slug: "zapatillas", descripcion: "", estado: 1 },
    marca: { id: 1, codigo: "NHP", nombre: "New Hype", logoUrl: null, estado: 1 },
    material: { id: 6, codigo: "CRS", descripcion: "Cuero sintético premium", estado: 1 },
    genero: { id: 3, codigo: "UNISEX", descripcion: "Unisex", estado: 1 },
    tallasDisponibles: [8, 9, 10, 11, 12],
    coloresDisponibles: [2, 1],
    stockTotal: 35
  }
];

const IMAGENES_PRODUCTO: ImagenProducto[] = [
  // Producto 1
  { id: 1, productoId: 1, url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop", orden: 1, esPrincipal: true },
  { id: 2, productoId: 1, url: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&h=800&fit=crop", orden: 2, esPrincipal: false },
  // Producto 2
  { id: 3, productoId: 2, url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop", orden: 1, esPrincipal: true },
  { id: 4, productoId: 2, url: "https://images.unsplash.com/photo-1583225214099-2d5f8f8f2c53?w=600&h=800&fit=crop", orden: 2, esPrincipal: false },
  // Más productos...
  { id: 5, productoId: 3, url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop", orden: 1, esPrincipal: true },
  { id: 6, productoId: 4, url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop", orden: 1, esPrincipal: true },
  { id: 7, productoId: 5, url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aebd?w=600&h=800&fit=crop", orden: 1, esPrincipal: true }
];

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtener un color por ID
 */
export function obtenerColor(id: number): Color | undefined {
  return CATALOGOS_COLORES.find(c => c.id === id);
}

/**
 * Obtener una talla por ID
 */
export function obtenerTalla(id: number): Talla | undefined {
  return CATALOGOS_TALLAS.find(t => t.id === id);
}

/**
 * Obtener imágenes de un producto
 */
export function obtenerImagenesProducto(productoId: number): ImagenProducto[] {
  return IMAGENES_PRODUCTO
    .filter(img => img.productoId === productoId)
    .sort((a, b) => a.orden - b.orden);
}

/**
 * Calcular precio con descuento de liquidación
 */
export function calcularPrecioLiquidacion(producto: ProductoStorefront): number {
  if (!producto.enLiquidacion || producto.porcentajeLiquidacion <= 0) {
    return producto.precioVenta;
  }
  return producto.precioVenta - (producto.precioVenta * producto.porcentajeLiquidacion / 100);
}

/**
 * Determinar si un producto es "nuevo" (creado en últimos 30 días)
 */
export function esProductoNuevo(producto: ProductoStorefront): boolean {
  const hoy = new Date();
  const creado = new Date(producto.createdAt);
  const diasDiferencia = (hoy.getTime() - creado.getTime()) / (1000 * 60 * 60 * 24);
  return diasDiferencia <= 30;
}

/**
 * Buscar producto por slug
 */
export function obtenerProductoPorSlug(slug: string): ProductoStorefront | undefined {
  return PRODUCTOS.find(p => p.slug === slug && p.estado === 1);
}

// ============================================================================
// API SIMULADA (Endpoints Mock)
// ============================================================================

/**
 * Simula: GET /api/v1/storefront/productos
 * Con filtros, búsqueda y paginación
 */
export async function apiObtenerProductos(
  filtros: FiltrosProductos = {}
): Promise<RespuestaPaginada<ProductoStorefront>> {
  // Simular latencia de red (800ms)
  await new Promise(resolve => setTimeout(resolve, 800));

  let resultados = PRODUCTOS.filter(p => p.estado === 1);

  // Filtrar por género (UNISEX aparece en ambos)
  if (filtros.generoId) {
    resultados = resultados.filter(p =>
      p.generoId === filtros.generoId || p.generoId === 3
    );
  }

  // Filtrar por categoría
  if (filtros.categoriaId) {
    resultados = resultados.filter(p => p.categoriaId === filtros.categoriaId);
  }

  // Filtrar por marca
  if (filtros.marcaId) {
    resultados = resultados.filter(p => p.marcaId === filtros.marcaId);
  }

  // Solo liquidación
  if (filtros.soloLiquidacion) {
    resultados = resultados.filter(p => p.enLiquidacion);
  }

  // Solo nuevos
  if (filtros.soloNuevos) {
    resultados = resultados.filter(p => esProductoNuevo(p));
  }

  // Búsqueda por texto
  if (filtros.busqueda) {
    const texto = filtros.busqueda.toLowerCase();
    resultados = resultados.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.marca.nombre.toLowerCase().includes(texto) ||
      p.categoria.nombre.toLowerCase().includes(texto) ||
      p.descripcion.toLowerCase().includes(texto) ||
      p.sku.toLowerCase().includes(texto)
    );
  }

  // Rango de precio
  if (filtros.precioMin) {
    resultados = resultados.filter(p => calcularPrecioLiquidacion(p) >= filtros.precioMin!);
  }
  if (filtros.precioMax) {
    resultados = resultados.filter(p => calcularPrecioLiquidacion(p) <= filtros.precioMax!);
  }

  // Filtrar por tipo de sección
  if (filtros.tipoSeccion) {
    const categoriasAccesorios = [9, 10, 11, 12, 16, 17, 18];
    const categoriasCalzado = [13, 14, 15];
    if (filtros.tipoSeccion === 'accesorios') {
      resultados = resultados.filter(p => categoriasAccesorios.includes(p.categoriaId));
    } else if (filtros.tipoSeccion === 'calzado') {
      resultados = resultados.filter(p => categoriasCalzado.includes(p.categoriaId));
    }
  }

  // Ordenar
  if (filtros.ordenarPor) {
    switch (filtros.ordenarPor) {
      case 'precio_asc':
        resultados.sort((a, b) => calcularPrecioLiquidacion(a) - calcularPrecioLiquidacion(b));
        break;
      case 'precio_desc':
        resultados.sort((a, b) => calcularPrecioLiquidacion(b) - calcularPrecioLiquidacion(a));
        break;
      case 'nuevo':
        resultados.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
  }

  // Paginación
  const page = 1; // Por ahora fijo, se puede parametrizar
  const pageSize = 20;
  const totalItems = resultados.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const inicio = (page - 1) * pageSize;
  const data = resultados.slice(inicio, inicio + pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages
    }
  };
}

/**
 * Simula: GET /api/v1/storefront/categorias
 */
export async function apiObtenerCategorias(): Promise<CategoriaStorefront[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return CATALOGOS_CATEGORIAS.filter(c => c.estado === 1);
}

/**
 * Simula: GET /api/v1/storefront/productos/{slug}
 */
export async function apiObtenerProductoPorSlug(slug: string): Promise<ProductoStorefront | null> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return obtenerProductoPorSlug(slug) || null;
}

/**
 * Obtener producto por ID (para favoritos)
 */
export async function apiObtenerProductoPorId(id: number): Promise<ProductoStorefront | null> {
  await new Promise(resolve => setTimeout(resolve, 600));
  const producto = PRODUCTOS.find(p => p.id === id && p.estado === 1);
  return producto || null;
}

/**
 * Obtener catálogos (tallas, colores, etc)
 */
export async function apiObtenerCatalogos() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    tallas: CATALOGOS_TALLAS.filter(t => t.estado === 1),
    colores: CATALOGOS_COLORES.filter(c => c.estado === 1),
    marcas: CATALOGOS_MARCAS.filter(m => m.estado === 1),
    materiales: CATALOGOS_MATERIALES.filter(m => m.estado === 1),
    generos: CATALOGOS_GENEROS.filter(g => g.estado === 1)
  };
}
