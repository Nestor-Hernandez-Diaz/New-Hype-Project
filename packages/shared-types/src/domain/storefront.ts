/**
 * 🛍️ TIPOS DE DOMINIO - STOREFRONT (Tienda Pública)
 * 
 * Interfaces TypeScript para el frontend público (e-commerce).
 * Orientado a clientes finales, no administradores.
 * 
 * @module storefront
 * @packageDocumentation
 */

// ============================================================================
// ENUMERACIONES
// ============================================================================

/**
 * Género/Público objetivo del producto
 */
export enum GeneroProducto {
  MUJER = 1,
  HOMBRE = 2,
  UNISEX = 3
}

/**
 * Estado del pedido en el storefront
 */
export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  PROCESANDO = 'PROCESANDO',
  ENVIADO = 'ENVIADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

// ============================================================================
// CATÁLOGOS MAESTROS
// ============================================================================

/**
 * Categoría de productos para el storefront
 */
export interface CategoriaStorefront {
  id: number;
  codigo: string;
  nombre: string;
  slug: string;
  descripcion: string;
  estado: number; // 1 = activo, 0 = inactivo
}

/**
 * Tallas disponibles
 */
export interface Talla {
  id: number;
  codigo: string;
  descripcion: string;
  ordenVisualizacion: number;
  estado: number;
}

/**
 * Colores disponibles
 */
export interface Color {
  id: number;
  codigo: string;
  nombre: string;
  codigoHex: string;
  estado: number;
}

/**
 * Marcas de productos
 */
export interface Marca {
  id: number;
  codigo: string;
  nombre: string;
  logoUrl: string | null;
  estado: number;
}

/**
 * Materiales de productos
 */
export interface Material {
  id: number;
  codigo: string;
  descripcion: string;
  estado: number;
}

/**
 * Géneros (Mujer, Hombre, Unisex)
 */
export interface Genero {
  id: number;
  codigo: string;
  descripcion: string;
  estado: number;
}

// ============================================================================
// PRODUCTO STOREFRONT
// ============================================================================

/**
 * Producto completo para el storefront (con relaciones resueltas)
 */
export interface ProductoStorefront {
  // Datos básicos
  id: number;
  tenantId: number; // CRÍTICO para multi-tenancy
  sku: string;
  nombre: string;
  slug: string;
  descripcion: string;
  codigoBarras: string | null; // EAN-13
  
  // Relaciones (IDs)
  categoriaId: number | null;
  marcaId: number | null;
  materialId: number | null;
  generoId: number | null;
  
  // URLs
  imagenUrl: string | null;
  imagenes?: ImagenProducto[]; // Galería adicional
  
  // Precios
  precioCosto: number;
  precioVenta: number;
  
  // Inventario
  stockMinimo: number;
  controlaInventario: boolean;
  stockTotal?: number; // Calculado desde variantes o stock real
  disponible?: boolean; // Calculado: stockTotal > 0
  
  // Liquidación
  enLiquidacion: boolean;
  porcentajeLiquidacion: number;
  precioLiquidacion?: number; // Calculado
  fechaInicioLiquidacion: string | null;
  fechaFinLiquidacion: string | null;
  
  // Estado
  estado: number; // 1 = activo
  createdAt: string;
  updatedAt?: string;
  
  // Relaciones resueltas (para el frontend) - Opcionales porque no siempre vienen
  categoria?: CategoriaStorefront;
  categoriaNombre?: string; // Denormalizado desde el backend
  marca?: Marca;
  marcaNombre?: string;
  material?: Material;
  materialNombre?: string;
  genero?: Genero;
  generoNombre?: string;
  
  // Variantes disponibles
  tallasDisponibles?: number[]; // IDs de tallas
  coloresDisponibles?: number[]; // IDs de colores
}

/**
 * Imagen adicional de producto
 */
export interface ImagenProducto {
  id: number;
  productoId: number;
  url: string;
  altText?: string;
  orden: number;
  esPrincipal: boolean; // Renamed from esPortada para coincidir con BD
}

/**
 * Variante de producto (talla + color + stock)
 */
export interface VarianteProducto {
  id: number;
  productoId: number;
  tallaId: number;
  colorId: number;
  stockActual: number;
  stockReservado: number;
  stockDisponible: number;
}

// ============================================================================
// CARRITO DE COMPRAS
// ============================================================================

/**
 * Item individual del carrito (almacenado en localStorage)
 */
export interface ItemCarrito {
  productoId: number;
  sku: string;
  nombreProducto: string;
  slug: string;
  marca: string;
  precioUnitario: number;
  imagen: string;
  tallaId: number | null;
  tallaCodigo: string;
  colorId: number | null;
  colorNombre: string;
  colorHex: string;
  cantidad: number;
}

/**
 * Resumen del carrito
 */
export interface ResumenCarrito {
  items: ItemCarrito[];
  subtotal: number;
  envio: number;
  descuento: number;
  total: number;
  cantidadItems: number;
}

// ============================================================================
// CHECKOUT Y PEDIDOS
// ============================================================================

/**
 * Datos del cliente para checkout
 */
export interface DatosCliente {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  documento: string;
  tipoDocumento: 'DNI' | 'RUC' | 'CE';
}

/**
 * Dirección de envío
 */
export interface DireccionEnvio {
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  referencia: string;
  codigoPostal: string;
}

/**
 * Método de pago
 */
export interface MetodoPago {
  tipo: 'tarjeta' | 'yape' | 'plin' | 'transferencia' | 'contraentrega';
  numeroTarjeta?: string;
  nombreTitular?: string;
  numeroYape?: string;
}

/**
 * Pedido completo (orden de venta del storefront)
 */
export interface PedidoStorefront {
  id: number;
  numeroPedido: string; // Ej: "NH-2025-00123"
  fecha: string;
  estado: EstadoPedido;
  
  // Cliente
  cliente: DatosCliente;
  direccionEnvio: DireccionEnvio;
  
  // Items
  items: ItemCarrito[];
  
  // Totales
  subtotal: number;
  envio: number;
  descuento: number;
  total: number;
  
  // Pago
  metodoPago: MetodoPago;
  estadoPago: 'pendiente' | 'pagado' | 'fallido';
  
  // Seguimiento
  numeroSeguimiento?: string;
  fechaEstimadaEntrega?: string;
}

// ============================================================================
// FILTROS Y PAGINACIÓN
// ============================================================================

/**
 * Filtros de productos para el catálogo
 */
export interface FiltrosProductos {
  categoriaId?: number;
  generoId?: number;
  marcaId?: number;
  busqueda?: string;
  precioMin?: number;
  precioMax?: number;
  soloLiquidacion?: boolean;
  soloNuevos?: boolean;
  tipoSeccion?: 'ropa' | 'accesorios' | 'calzado';
  ordenarPor?: 'precio_asc' | 'precio_desc' | 'nuevo' | 'popular';
  talla?: number;
  color?: number;
}

/**
 * Respuesta paginada de productos
 */
export interface RespuestaPaginada<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// ============================================================================
// AUTH (SIMPLIFICADO PARA STOREFRONT)
// ============================================================================

/**
 * Usuario del storefront (cliente)
 */
export interface UsuarioStorefront {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  documento: string;
  tipoDocumento: 'DNI' | 'RUC' | 'CE';
  fechaRegistro: string;
  // Direcciones guardadas
  direcciones: DireccionEnvio[];
}

/**
 * Login del storefront
 */
export interface LoginStorefront {
  email: string;
  password: string;
}

/**
 * Registro del storefront
 */
export interface RegistroStorefront {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono: string;
  documento: string;
  tipoDocumento: 'DNI' | 'RUC' | 'CE';
  aceptaTerminos: boolean;
  aceptaNewsletter: boolean;
}

// ============================================================================
// FAVORITOS
// ============================================================================

/**
 * Favoritos del usuario (almacenado en localStorage)
 */
export interface FavoritosUsuario {
  productosIds: number[];
}

// ============================================================================
// DEVOLUCIONES
// ============================================================================

/**
 * Solicitud de devolución
 */
export interface SolicitudDevolucion {
  id: string;
  pedidoId: string;
  codigoPedido: string;
  clienteId: number;
  fechaSolicitud: string;
  motivoDevolucion: string;
  detalleMotivo: string;
  itemsDevolucion: ItemDevolucion[];
  estado: EstadoDevolucion;
  numeroSeguimiento?: string;
}

/**
 * Item de devolución
 */
export interface ItemDevolucion {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  motivo: string;
}

/**
 * Estado de devolución
 */
export enum EstadoDevolucion {
  SOLICITADO = 'SOLICITADO',
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  DEVUELTO = 'DEVUELTO'
}

// ============================================================================
// FAQ Y SOPORTE
// ============================================================================

/**
 * Pregunta frecuente
 */
export interface FAQ {
  id: number;
  pregunta: string;
  respuesta: string;
  categoria: 'pedidos' | 'envios' | 'pagos' | 'devoluciones' | 'productos' | 'cuenta';
  orden: number;
}

/**
 * Mensaje de contacto
 */
export interface MensajeContacto {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Notificación toast
 */
export interface Notificacion {
  mensaje: string;
  tipo: 'success' | 'error' | 'info' | 'warning';
  duracion?: number; // milisegundos
}
