/**
 * 🎽 MOCK API - PRODUCTOS DE ROPA Y ACCESORIOS
 * 
 * Simulación de backend para el módulo de Productos (Tienda de Ropa).
 * Datos: Blusas, Pantalones, Vestidos, Aros, Camisetas, etc.
 * 
 * Latencia: 800ms simulada para emular red real.
 * 
 * @packageDocumentation
 */

import type { Producto, TallaRopa, CrearProductoDTO, Categoria, UnidadMedida, ProductosPaginados, ProductoFiltros } from '@monorepo/shared-types';
import { EstadoProducto, EstadoStockProducto, TipoProducto, GeneroRopa } from '@monorepo/shared-types';

// ============================================================================
// MAESTROS MOCK - CATEGORÍAS Y UNIDADES
// ============================================================================

/**
 * Categorías de productos de Ropa
 */
const MOCK_CATEGORIAS: Categoria[] = [
  {
    id: 1,
    codigoCategoria: 'BLU',
    nombreCategoria: 'Blusas',
    descripcion: 'Blusas y camisas para mujer',
    activa: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: 2,
    codigoCategoria: 'PAN',
    nombreCategoria: 'Pantalones',
    descripcion: 'Pantalones y jeans',
    activa: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: 3,
    codigoCategoria: 'VES',
    nombreCategoria: 'Vestidos',
    descripcion: 'Vestidos y faldas',
    activa: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: 4,
    codigoCategoria: 'ACC',
    nombreCategoria: 'Accesorios',
    descripcion: 'Accesorios y bisutería',
    activa: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: 5,
    codigoCategoria: 'CAM',
    nombreCategoria: 'Camisetas',
    descripcion: 'Camisetas y polos',
    activa: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  }
];

/**
 * Unidades de medida para productos de Ropa
 */
const MOCK_UNIDADES: UnidadMedida[] = [
  {
    id: 1,
    codigoUnidad: 'UND',
    nombreUnidad: 'Unidad',
    simbolo: 'und',
    activa: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: 2,
    codigoUnidad: 'PAR',
    nombreUnidad: 'Par',
    simbolo: 'par',
    activa: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: 3,
    codigoUnidad: 'SET',
    nombreUnidad: 'Set',
    simbolo: 'set',
    activa: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  }
];

// ============================================================================
// DATOS MOCK - TIENDA DE ROPA Y ACCESORIOS
// ============================================================================

/**
 * Catálogo simulado de productos de ropa
 * Categorías: Blusas, Pantalones, Vestidos, Accesorios, Camisetas
 */
let MOCK_PRODUCTOS: Producto[] = [
  {
    id: 1,
    codigoProducto: 'BLU-001',
    nombreProducto: 'Blusa Casual Manga Larga',
    descripcion: 'Blusa elegante de manga larga con cuello redondo, ideal para oficina o eventos casuales',
    categoriaId: 1,
    categoria: {
      id: 1,
      codigoCategoria: 'BLU',
      nombreCategoria: 'Blusas',
      descripcion: 'Blusas y camisas para mujer',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    unidadMedidaId: 1,
    unidadMedida: {
      id: 1,
      codigoUnidad: 'UND',
      nombreUnidad: 'Unidad',
      simbolo: 'und',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    precioVenta: 89.90,
    precioCosto: 45.00,
    margen: 99.78,
    stockInicial: 120,
    stockActual: 87,
    stockMinimo: 20,
    stockMaximo: 200,
    // ===== CAMPOS DE ROPA =====
    talla: 'M' as TallaRopa,
    color: 'Blanco Marfil',
    marca: 'Zara',
    material: 'Algodón 100%',
    genero: GeneroRopa.MUJER,
    composicion: '100% Algodón Pima',
    // Estado
    tipoProducto: TipoProducto.BIEN,
    estadoProducto: EstadoProducto.ACTIVO,
    estadoStock: EstadoStockProducto.DISPONIBLE,
    activo: true,
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-01-15'),
    fechaActualizacion: new Date('2024-02-10')
  },
  {
    id: 2,
    codigoProducto: 'PAN-001',
    nombreProducto: 'Pantalón Jean Slim Fit',
    descripcion: 'Pantalón de mezclilla corte slim fit, cintura media, desgaste suave en rodillas',
    categoriaId: 2,
    categoria: {
      id: 2,
      codigoCategoria: 'PAN',
      nombreCategoria: 'Pantalones',
      descripcion: 'Pantalones y jeans',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    unidadMedidaId: 1,
    unidadMedida: {
      id: 1,
      codigoUnidad: 'UND',
      nombreUnidad: 'Unidad',
      simbolo: 'und',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    precioVenta: 129.90,
    precioCosto: 65.00,
    margen: 99.85,
    stockInicial: 80,
    stockActual: 52,
    stockMinimo: 15,
    stockMaximo: 150,
    // ===== CAMPOS DE ROPA =====
    talla: 'M' as TallaRopa,
    color: 'Azul Oscuro',
    marca: 'Levi\'s',
    material: 'Mezclilla Stretch',
    genero: GeneroRopa.MUJER,
    composicion: '98% Algodón, 2% Elastano',
    // Estado
    tipoProducto: TipoProducto.BIEN,
    estadoProducto: EstadoProducto.ACTIVO,
    estadoStock: EstadoStockProducto.DISPONIBLE,
    activo: true,
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-01-20'),
    fechaActualizacion: new Date('2024-02-15')
  },
  {
    id: 3,
    codigoProducto: 'VES-001',
    nombreProducto: 'Vestido Floral Verano',
    descripcion: 'Vestido midi con estampado floral, tirantes ajustables, ideal para primavera-verano',
    categoriaId: 3,
    categoria: {
      id: 3,
      codigoCategoria: 'VES',
      nombreCategoria: 'Vestidos',
      descripcion: 'Vestidos y faldas',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    unidadMedidaId: 1,
    unidadMedida: {
      id: 1,
      codigoUnidad: 'UND',
      nombreUnidad: 'Unidad',
      simbolo: 'und',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    precioVenta: 149.90,
    precioCosto: 70.00,
    margen: 114.14,
    stockInicial: 60,
    stockActual: 18,
    stockMinimo: 20,
    stockMaximo: 100,
    // ===== CAMPOS DE ROPA =====
    talla: 'S' as TallaRopa,
    color: 'Estampado Floral Rosa',
    marca: 'H&M',
    material: 'Viscosa',
    genero: GeneroRopa.MUJER,
    composicion: '100% Viscosa',
    // Estado
    tipoProducto: TipoProducto.BIEN,
    estadoProducto: EstadoProducto.ACTIVO,
    estadoStock: EstadoStockProducto.BAJO, // Stock cerca del mínimo
    activo: true,
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-02-01'),
    fechaActualizacion: new Date('2024-03-10')
  },
  {
    id: 4,
    codigoProducto: 'ARO-001',
    nombreProducto: 'Aros de Plata Ley 925',
    descripcion: 'Aros tipo argolla de plata de ley 925, diámetro 3cm, acabado brillante',
    categoriaId: 4,
    categoria: {
      id: 4,
      codigoCategoria: 'ACC',
      nombreCategoria: 'Accesorios',
      descripcion: 'Accesorios y bisutería',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    unidadMedidaId: 2,
    unidadMedida: {
      id: 2,
      codigoUnidad: 'PAR',
      nombreUnidad: 'Par',
      simbolo: 'par',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    precioVenta: 49.90,
    precioCosto: 20.00,
    margen: 149.50,
    stockInicial: 200,
    stockActual: 145,
    stockMinimo: 30,
    stockMaximo: 300,
    // ===== CAMPOS DE ROPA =====
    talla: 'Único' as TallaRopa,
    color: 'Plateado',
    marca: 'Pandora',
    material: 'Plata Ley 925',
    genero: GeneroRopa.MUJER,
    composicion: '925 Sterling Silver',
    // Estado
    tipoProducto: TipoProducto.BIEN,
    estadoProducto: EstadoProducto.ACTIVO,
    estadoStock: EstadoStockProducto.DISPONIBLE,
    activo: true,
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-01-10'),
    fechaActualizacion: new Date('2024-02-05')
  },
  {
    id: 5,
    codigoProducto: 'CAM-001',
    nombreProducto: 'Camiseta Básica Cuello V',
    descripcion: 'Camiseta básica de algodón con cuello en V, ajuste regular, colores surtidos',
    categoriaId: 5,
    categoria: {
      id: 5,
      codigoCategoria: 'CAM',
      nombreCategoria: 'Camisetas',
      descripcion: 'Camisetas y polos',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    unidadMedidaId: 1,
    unidadMedida: {
      id: 1,
      codigoUnidad: 'UND',
      nombreUnidad: 'Unidad',
      simbolo: 'und',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    precioVenta: 39.90,
    precioCosto: 15.00,
    margen: 166.00,
    stockInicial: 300,
    stockActual: 5,
    stockMinimo: 50,
    stockMaximo: 500,
    // ===== CAMPOS DE ROPA =====
    talla: 'L' as TallaRopa,
    color: 'Negro',
    marca: 'Forever 21',
    material: 'Algodón Jersey',
    genero: GeneroRopa.UNISEX,
    composicion: '95% Algodón, 5% Elastano',
    // Estado
    tipoProducto: TipoProducto.BIEN,
    estadoProducto: EstadoProducto.ACTIVO,
    estadoStock: EstadoStockProducto.AGOTADO, // Stock crítico
    activo: true,
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-01-05'),
    fechaActualizacion: new Date('2024-03-15')
  },
  {
    id: 6,
    codigoProducto: 'CAM-002',
    nombreProducto: 'Polo Deportivo Dry-Fit',
    descripcion: 'Polo deportivo con tecnología dry-fit, ideal para entrenamiento y uso casual',
    categoriaId: 5,
    categoria: {
      id: 5,
      codigoCategoria: 'CAM',
      nombreCategoria: 'Camisetas',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    unidadMedidaId: 1,
    unidadMedida: {
      id: 1,
      codigoUnidad: 'UND',
      nombreUnidad: 'Unidad',
      simbolo: 'und',
      activa: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01')
    },
    precioVenta: 79.90,
    precioCosto: 35.00,
    margen: 128.29,
    stockInicial: 150,
    stockActual: 92,
    stockMinimo: 25,
    // ===== CAMPOS DE ROPA =====
    talla: 'XL' as TallaRopa,
    color: 'Azul Marino',
    marca: 'Nike',
    material: 'Poliéster Dry-Fit',
    genero: GeneroRopa.HOMBRE,
    composicion: '100% Poliéster Reciclado',
    // Estado
    tipoProducto: TipoProducto.BIEN,
    estadoProducto: EstadoProducto.ACTIVO,
    estadoStock: EstadoStockProducto.DISPONIBLE,
    activo: true,
    usuarioCreacion: 'admin',
    fechaCreacion: new Date('2024-02-10'),
    fechaActualizacion: new Date('2024-03-01')
  }
];

// ============================================================================
// FUNCIONES MOCK API
// ============================================================================

/**
 * Obtiene todos los productos del catálogo (con paginación simulada)
 * @param filtros - Filtros opcionales de búsqueda y paginación
 * @returns Promise con productos paginados
 */
export async function getProductos(filtros?: ProductoFiltros): Promise<ProductosPaginados> {
  // Simular latencia de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let productos = [...MOCK_PRODUCTOS];
  
  // Aplicar filtros si existen
  if (filtros?.q) {
    const query = filtros.q.toLowerCase();
    productos = productos.filter(p => 
      p.nombreProducto.toLowerCase().includes(query) ||
      p.codigoProducto.toLowerCase().includes(query)
    );
  }
  
  if (filtros?.categoria) {
    productos = productos.filter(p => 
      p.categoria?.nombreCategoria === filtros.categoria
    );
  }
  
  // Paginación
  const page = filtros?.page || 1;
  const limit = filtros?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const productosPaginados = productos.slice(startIndex, endIndex);
  
  return {
    productos: productosPaginados,
    pagination: {
      page,
      limit,
      total: productos.length,
      pages: Math.ceil(productos.length / limit)
    }
  };
}

/**
 * Obtiene un producto por su ID
 * @param id - ID del producto
 * @returns Promise con el producto o undefined
 */
export async function getProductoById(id: number): Promise<Producto | undefined> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_PRODUCTOS.find(p => p.id === id);
}

/**
 * Crea un nuevo producto en el catálogo
 * @param data - DTO con datos del nuevo producto
 * @returns Promise con el producto creado
 */
export async function crearProducto(data: CrearProductoDTO): Promise<Producto> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const nuevoProducto: Producto = {
    id: MOCK_PRODUCTOS.length + 1,
    codigoProducto: data.codigoProducto,
    nombreProducto: data.nombreProducto,
    descripcion: data.descripcion,
    categoriaId: data.categoriaId,
    unidadMedidaId: data.unidadMedidaId,
    precioVenta: data.precioVenta,
    precioCosto: data.precioCosto,
    margen: data.precioCosto ? ((data.precioVenta - data.precioCosto) / data.precioCosto) * 100 : undefined,
    stockInicial: data.stockInicial,
    stockActual: data.stockInicial,
    stockMinimo: data.stockMinimo,
    stockMaximo: data.stockMaximo,
    // ===== CAMPOS DE ROPA =====
    talla: data.talla,
    color: data.color,
    marca: data.marca,
    material: data.material,
    genero: data.genero,
    composicion: data.composicion,
    // Estado
    tipoProducto: data.tipoProducto,
    estadoProducto: EstadoProducto.ACTIVO,
    estadoStock: data.stockInicial > data.stockMinimo 
      ? EstadoStockProducto.DISPONIBLE 
      : data.stockInicial === 0 
        ? EstadoStockProducto.AGOTADO 
        : EstadoStockProducto.BAJO,
    activo: true,
    usuarioCreacion: 'admin',
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  };

  MOCK_PRODUCTOS.push(nuevoProducto);
  return nuevoProducto;
}

/**
 * Actualiza un producto existente
 * @param id - ID del producto
 * @param data - Datos parciales a actualizar
 * @returns Promise con el producto actualizado o undefined
 */
export async function actualizarProducto(
  id: number, 
  data: Partial<Producto>
): Promise<Producto | undefined> {
  await new Promise(resolve => setTimeout(resolve, 900));
  
  const index = MOCK_PRODUCTOS.findIndex(p => p.id === id);
  if (index === -1) return undefined;

  MOCK_PRODUCTOS[index] = {
    ...MOCK_PRODUCTOS[index],
    ...data,
    fechaActualizacion: new Date()
  };

  return MOCK_PRODUCTOS[index];
}

/**
 * Elimina un producto del catálogo
 * @param id - ID del producto a eliminar
 * @returns Promise booleano indicando éxito
 */
export async function eliminarProducto(id: number): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const index = MOCK_PRODUCTOS.findIndex(p => p.id === id);
  if (index === -1) return false;

  MOCK_PRODUCTOS.splice(index, 1);
  return true;
}

/**
 * Verifica si un código de producto ya existe
 * @param codigo - Código a verificar
 * @param excludeId - ID a excluir de la verificación (para ediciones)
 * @returns Promise booleano indicando si existe
 */
export async function verificarCodigoProducto(
  codigo: string, 
  excludeId?: number
): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return MOCK_PRODUCTOS.some(p => 
    p.codigoProducto === codigo && p.id !== excludeId
  );
}

/**
 * Cambia el estado activo de un producto
 * @param id - ID del producto
 * @param activo - Nuevo estado activo
 * @returns Promise con el producto actualizado o undefined
 */
export async function cambiarEstadoProducto(
  id: number, 
  activo: boolean
): Promise<Producto | undefined> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const index = MOCK_PRODUCTOS.findIndex(p => p.id === id);
  if (index === -1) return undefined;

  MOCK_PRODUCTOS[index] = {
    ...MOCK_PRODUCTOS[index],
    activo,
    estadoProducto: activo ? EstadoProducto.ACTIVO : EstadoProducto.INACTIVO,
    fechaActualizacion: new Date()
  };

  return MOCK_PRODUCTOS[index];
}

/**
 * Obtiene todas las categorías de productos
 * @returns Promise con array de categorías
 */
export async function getCategorias(): Promise<Categoria[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...MOCK_CATEGORIAS];
}

/**
 * Obtiene todas las unidades de medida
 * @returns Promise con array de unidades
 */
export async function getUnidadesMedida(): Promise<UnidadMedida[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...MOCK_UNIDADES];
}
