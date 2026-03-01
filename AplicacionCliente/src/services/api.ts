/* =============================================
   NEW HYPE — Capa de Servicios API
   Conecta al backend Spring Boot real
   ============================================= */

import type { 
  ApiResponse, Paginated, Producto, Categoria, 
  AuthResponse, LoginRequest, RegistroRequest,
  PerfilCliente, ActualizarPerfilRequest,
  CrearPedidoRequest, Pedido
} from '../types';

const BASE_URL = 'http://localhost:8080/api/v1';
const TENANT_ID = '1';

// Imagen placeholder cuando el backend no tiene imágenes
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1503341504253-dff4815485f8?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=600&fit=crop',
];

function getPlaceholderImage(id: number): string {
  return PLACEHOLDER_IMAGES[id % PLACEHOLDER_IMAGES.length];
}

// === Helpers ===
function getToken(): string | null {
  return localStorage.getItem('nh_token');
}

async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json.message || `Error ${res.status}`);
  }

  return json;
}

// === PRODUCTOS (público) ===
export async function obtenerProductos(
  page = 0, 
  size = 20
): Promise<Paginated<Producto>> {
  const res = await fetchAPI<ApiResponse<Paginated<Producto>>>(
    `/storefront/productos?tenantId=${TENANT_ID}&page=${page}&size=${size}`
  );
  // Agregar imagen placeholder si no tiene
  res.data.content = res.data.content.map(p => ({
    ...p,
    imagenUrl: (p.imagenes && p.imagenes.length > 0) ? p.imagenes[0] : getPlaceholderImage(p.id),
  }));
  return res.data;
}

export async function obtenerProductoPorSlug(slug: string): Promise<Producto | null> {
  try {
    const res = await fetchAPI<ApiResponse<Producto>>(
      `/storefront/productos/${slug}?tenantId=${TENANT_ID}`
    );
    const p = res.data;
    p.imagenUrl = (p.imagenes && p.imagenes.length > 0) ? p.imagenes[0] : getPlaceholderImage(p.id);
    return p;
  } catch {
    return null;
  }
}

// === CATEGORÍAS (público) ===
export async function obtenerCategorias(): Promise<Categoria[]> {
  const res = await fetchAPI<ApiResponse<Categoria[]>>(
    `/storefront/categorias?tenantId=${TENANT_ID}`
  );
  return res.data;
}

// === AUTH ===
export async function registrarCliente(data: RegistroRequest): Promise<AuthResponse> {
  const res = await fetchAPI<ApiResponse<AuthResponse>>(
    '/storefront/auth/register', {
      method: 'POST',
      headers: { 'X-TenantId': TENANT_ID },
      body: JSON.stringify(data),
    }
  );
  return res.data;
}

export async function loginCliente(data: LoginRequest): Promise<AuthResponse> {
  const res = await fetchAPI<ApiResponse<AuthResponse>>(
    '/auth/login', {
      method: 'POST',
      headers: { 'X-TenantId': TENANT_ID },
      body: JSON.stringify(data),
    }
  );
  return res.data;
}

// === PERFIL (requiere token) ===
export async function obtenerPerfil(): Promise<PerfilCliente> {
  const res = await fetchAPI<ApiResponse<PerfilCliente>>('/storefront/perfil');
  return res.data;
}

export async function actualizarPerfil(data: ActualizarPerfilRequest): Promise<PerfilCliente> {
  const res = await fetchAPI<ApiResponse<PerfilCliente>>(
    '/storefront/perfil', {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  return res.data;
}

// === PEDIDOS (requiere token) ===
export async function crearPedido(data: CrearPedidoRequest): Promise<Pedido> {
  const res = await fetchAPI<ApiResponse<Pedido>>(
    '/storefront/pedidos', {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return res.data;
}

export async function obtenerPedidos(page = 0, size = 10): Promise<Paginated<Pedido>> {
  const res = await fetchAPI<ApiResponse<Paginated<Pedido>>>(
    `/storefront/pedidos?page=${page}&size=${size}`
  );
  return res.data;
}

export async function obtenerDetallePedido(id: number): Promise<Pedido> {
  const res = await fetchAPI<ApiResponse<Pedido>>(`/storefront/pedidos/${id}`);
  return res.data;
}

export async function cancelarPedido(id: number): Promise<void> {
  await fetchAPI(`/storefront/pedidos/${id}/cancelar`, { method: 'PATCH' });
}
