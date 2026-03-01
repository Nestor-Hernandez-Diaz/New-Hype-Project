/* =============================================
   NEW HYPE — Tipos TypeScript (Backend Real)
   ============================================= */

// === API Response genérica ===
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// === Paginación Spring Boot ===
export interface Paginated<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// === Producto (catálogo público) ===
export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  slug: string;
  descripcion: string;
  categoriaNombre: string;
  categoriaSlug: string;
  precioVenta: number;
  enLiquidacion: boolean;
  porcentajeLiquidacion: number;
  disponible: boolean;
  imagenes?: string[];
  // Campos extra para UI (no vienen del backend)
  imagenUrl?: string;
}

// === Categoría ===
export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
}

// === Auth ===
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  tenantId: number;
  scope: string;
}

// === Perfil ===
export interface PerfilCliente {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  createdAt: string;
}

export interface ActualizarPerfilRequest {
  nombre: string;
  apellido: string;
  telefono: string;
}

// === Carrito (client-side) ===
export interface ItemCarrito {
  productoId: number;
  sku: string;
  nombreProducto: string;
  slug: string;
  precioUnitario: number;
  imagen: string;
  cantidad: number;
}

// === Pedido ===
export interface CrearPedidoRequest {
  direccionEnvio: string;
  metodoPagoId: number;
  tipoEnvio: string;
  items: {
    productoId: number;
    cantidad: number;
  }[];
}

export interface Pedido {
  id: number;
  codigoPedido: string;
  fechaEmision: string;
  estado: string;
  subtotal: number;
  igv: number;
  total: number;
  direccionEnvio: string;
  metodoPago: string;
  items: DetallePedido[];
}

export interface DetallePedido {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// === Notificación ===
export interface Notificacion {
  mensaje: string;
  visible: boolean;
}
