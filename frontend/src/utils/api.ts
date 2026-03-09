// Configuración dinámica de la API
/// <reference types="vite/client" />
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';
};

const API_BASE_URL = getApiBaseUrl();
export { API_BASE_URL };

// Tipos para las respuestas de la API (alineados con ApiResponse.java del backend)
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
}

// Respuesta de AuthResponse.java del backend
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  user: BackendUserInfo;
}

export interface BackendUserInfo {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  username: string;
  rol: string;
  tenantId: number;
  tenantNombre: string;
  scope: string;
}

// Utilidades de paginación: frontend (1-based) ↔ backend (0-based)
export function toBackendPage(page: number, limit: number): { page: number; size: number } {
  return { page: Math.max(0, page - 1), size: limit };
}

export function fromBackendPage(p?: ApiResponse['pagination']): {
  page: number; limit: number; total: number; pages: number;
} {
  if (!p) return { page: 1, limit: 10, total: 0, pages: 0 };
  return {
    page: p.page + 1,
    limit: p.size,
    total: p.totalElements,
    pages: p.totalPages,
  };
}

// Clase para manejar las llamadas a la API
class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // ==== Productos ====
  // Crear producto
  async createProduct(productData: {
    codigo: string;
    nombre: string;
    descripcion?: string;
    categoria: string;
    precioVenta: number;
    estado?: boolean;
    unidadMedida: string;
    stockInitial?: { warehouseId: string; cantidad: number };
  }): Promise<ApiResponse<any>> {
    return this.request('/productos', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // Obtener almacenes
  async getWarehouses(): Promise<ApiResponse<any>> {
    return this.request('/almacenes', { method: 'GET' });
  }

  // ==== Compras ====
  async createPurchase(purchaseData: {
    proveedorId: string;
    almacenId: string;
    fechaEmision: string;
    tipoComprobante?: string;
    items: Array<{
      productoId: string;
      nombreProducto?: string;
      cantidad: number;
      precioUnitario: number;
    }>;
    formaPago?: string;
    observaciones?: string;
    fechaEntregaEstimada?: string;
    descuento?: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/compras/ordenes', {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  }

  async getPurchases(params?: {
    estado?: 'Pendiente' | 'Recibida' | 'Cancelada';
    proveedorId?: string;
    almacenId?: string;
    fechaInicio?: string; // ISO date
    fechaFin?: string; // ISO date
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ purchases: any[]; total: number; filters: Record<string, any> }>> {
    const queryParams = new URLSearchParams();
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.proveedorId) queryParams.append('proveedorId', params.proveedorId);
    if (params?.almacenId) queryParams.append('almacenId', params.almacenId);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    if (params?.q) queryParams.append('q', params.q);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/compras/ordenes?${queryString}` : '/compras/ordenes';
    return this.request<{ purchases: any[]; total: number; filters: Record<string, any> }>(endpoint, { method: 'GET' });
  }

  // ==== Ventas ====
  async getSales(params?: {
    estado?: 'Pendiente' | 'Completada' | 'Cancelada';
    cashSessionId?: string;
    clienteId?: string;
    almacenId?: string;
    fechaInicio?: string;
    fechaFin?: string;
    q?: string;
  }): Promise<ApiResponse<{ sales: any[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.cashSessionId) queryParams.append('cashSessionId', params.cashSessionId);
    if (params?.clienteId) queryParams.append('clienteId', params.clienteId);
    if (params?.almacenId) queryParams.append('almacenId', params.almacenId);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    if (params?.q) queryParams.append('q', params.q);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/ventas?${queryString}` : '/ventas';
    return this.request<{ sales: any[] }>(endpoint, { method: 'GET' });
  }

  async getPurchaseById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/compras/ordenes/${id}`, { method: 'GET' });
  }

  async updatePurchase(id: string, purchaseData: {
    proveedorId?: string;
    almacenId?: string;
    fechaEmision?: string;
    tipoComprobante?: string;
    items?: Array<{
      productoId: string;
      nombreProducto?: string;
      cantidad: number;
      precioUnitario: number;
    }>;
    formaPago?: string;
    observaciones?: string;
    fechaEntregaEstimada?: string;
    descuento?: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/compras/ordenes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(purchaseData),
    });
  }

  async updatePurchaseStatus(id: string, estado: string): Promise<ApiResponse<any>> {
    return this.request(`/compras/ordenes/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  }

  async deletePurchase(id: string): Promise<ApiResponse<any>> {
    return this.request(`/compras/ordenes/${id}`, {
      method: 'DELETE',
    });
  }

  // Listar productos con filtros opcionales
  async getProducts(params?: {
    categoria?: string;
    estado?: boolean;
    unidadMedida?: string;
    q?: string;
    minPrecio?: number;
    maxPrecio?: number;
    minStock?: number;
    maxStock?: number;
    page?: number;
    limit?: number;
  }, options?: RequestInit): Promise<ApiResponse<{ products: any[]; total: number; filters: Record<string, any>; pagination?: any }>> {
    const queryParams = new URLSearchParams();
    if (params?.categoria) queryParams.append('categoria', params.categoria);
    if (typeof params?.estado === 'boolean') queryParams.append('estado', String(params.estado));
    if (params?.unidadMedida) queryParams.append('unidadMedida', params.unidadMedida);
    if (params?.q) queryParams.append('q', params.q);
    if (typeof params?.minPrecio === 'number') queryParams.append('minPrecio', String(params.minPrecio));
    if (typeof params?.maxPrecio === 'number') queryParams.append('maxPrecio', String(params.maxPrecio));
    if (typeof params?.minStock === 'number') queryParams.append('minStock', String(params.minStock));
    if (typeof params?.maxStock === 'number') queryParams.append('maxStock', String(params.maxStock));
    if (typeof params?.page === 'number') queryParams.append('page', String(params.page));
    if (typeof params?.limit === 'number') queryParams.append('limit', String(params.limit));

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/productos?${queryString}` : '/productos';
    return this.request<{ products: any[]; total: number; filters: Record<string, any>; pagination?: any }>(endpoint, { method: 'GET', ...(options || {}) });
  }

  // Obtener producto por código
  async getProductByCodigo(codigo: string): Promise<ApiResponse<any>> {
    return this.request(`/productos/${codigo}`, {
      method: 'GET',
    });
  }

  // Actualizar producto por código
  async updateProductByCodigo(codigo: string, productData: {
    nombre?: string;
    descripcion?: string;
    categoria?: string;
    precioVenta?: number;
    estado?: boolean;
    unidadMedida?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/productos/${codigo}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  // Actualizar estado (activo/inactivo) del producto
  async updateProductStatus(codigo: string, estado: boolean): Promise<ApiResponse<any>> {
    return this.request(`/productos/${codigo}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  }

  // Eliminar producto (soft delete)
  async deleteProduct(codigo: string): Promise<ApiResponse<any>> {
    return this.request(`/productos/${codigo}`, {
      method: 'DELETE',
    });
  }

  // Método genérico para hacer peticiones
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`[API Request] Iniciando fetch a: ${options.method || 'GET'} ${url}`);

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar token de autorización si existe
    const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
      console.log('Headers:', { Authorization: 'Bearer ...' });
    } else {
      console.log('Headers:', { Authorization: 'sin token' });
    }

    // Log de datos enviados (si hay body)
    try {
      if (options.body) {
        const maybeStr = typeof options.body === 'string' ? options.body : String(options.body);
        let parsed: any = maybeStr;
        try { parsed = JSON.parse(maybeStr as string); } catch (_err) { console.log('Body no JSON'); }
        console.log('Datos:', parsed);
      }
    } catch (e) {
      console.log('No se pudo loguear datos del request:', e);
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`[API Response] Status: ${response.status}`, {
        url,
        status: response.status,
        statusText: response.statusText,
        data,
      });

      // Si el backend responde 401 o 403, limpiar tokens y redirigir a login
      if (response.status === 401 || response.status === 403) {
        // Limpiar posibles claves de token
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('alexatech_token');
          localStorage.removeItem('alexatech_refresh_token');
        } catch (_err) { console.log('Error limpiando tokens'); }
        console.log(`${response.status} ${response.status === 401 ? 'Unauthorized' : 'Forbidden'}: limpiando tokens`);
        // Evitar bucles de redirección: no redirigir si ya estamos en /login o en storefront
        if (!window.location.pathname.includes('/login') && !window.location.pathname.startsWith('/storefront')) {
          (window as any).showToast?.('Sesión expirada. Inicia sesión nuevamente.');
          window.location.href = '/login';
        }
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
          error: data.error || `HTTP ${response.status}`,
          // incluir payload crudo para ver errores de validación del backend
          data,
        } as any;
      }

      return data;
    } catch (error) {
      console.error(`[API Error] Fallo en la petición a ${url}:`, error);
      return {
        success: false,
        message: 'Error de conexión con el servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Métodos de autenticación
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem('alexatech_refresh_token');
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<BackendUserInfo>> {
    return this.request<BackendUserInfo>('/auth/me');
  }

  async validateToken(): Promise<ApiResponse> {
    const token = localStorage.getItem('alexatech_token');
    return this.request('/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    return this.request<{ exists: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
  }

  // Métodos de gestión de usuarios
  async getUsers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{
    users: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/usuarios?${queryString}` : '/usuarios';

    return this.request(endpoint);
  }

  async getUserById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/usuarios/${id}`);
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: {
    username?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async patchUser(id: string, userData: {
    username?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<any>> {
    return this.request(`/usuarios/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: isActive }),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.request(`/usuarios/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Obtener actividad del usuario actual
  async getUserActivity(limit: number = 10): Promise<ApiResponse<any>> {
    return this.request(`/audit/my-activity?limit=${limit}`, {
      method: 'GET',
    });
  }

  // Métodos de gestión de entidades comerciales (clientes/proveedores/ambos)
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tipoEntidad?: 'Cliente' | 'Proveedor' | 'Ambos';
    tipoDocumento?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    departamentoId?: string;
    provinciaId?: string;
    distritoId?: string;
    includeInactive?: boolean;
  }): Promise<ApiResponse<{
    clients: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalClients: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tipoEntidad) queryParams.append('tipoEntidad', params.tipoEntidad);
    if (params?.tipoDocumento) queryParams.append('tipoDocumento', params.tipoDocumento);
    if (params?.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
    if (params?.departamentoId) queryParams.append('departamentoId', params.departamentoId);
    if (params?.provinciaId) queryParams.append('provinciaId', params.provinciaId);
    if (params?.distritoId) queryParams.append('distritoId', params.distritoId);
    if (params?.includeInactive !== undefined) queryParams.append('includeInactive', params.includeInactive.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/entidades?${queryString}` : '/entidades';

    return this.request(endpoint);
  }

  async getClientById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/entidades/${id}`);
  }

  // ==== Ubigeo ====
  async getDepartamentos(): Promise<ApiResponse<Array<{ id: string; nombre: string }>>> {
    const res = await this.get<any>('/ubigeo/departamentos');
    if (res.success && res.data) {
      const raw = Array.isArray(res.data) ? res.data : [];
      const data = raw.map((d: any) => ({ id: String(d.id), nombre: d.nombre }));
      return { success: true, message: res.message, data };
    }
    return { success: false, message: res.message, data: [], error: res.error };
  }

  async getProvincias(
    departamentoId: string
  ): Promise<ApiResponse<Array<{ id: string; nombre: string; departamentoId: string }>>> {
    const res = await this.get<any>(`/ubigeo/provincias?departamentoId=${departamentoId}`);
    if (res.success && res.data) {
      const raw = Array.isArray(res.data) ? res.data : [];
      const data = raw.map((p: any) => ({
        id: String(p.id),
        nombre: p.nombre,
        departamentoId: String(p.parentId || departamentoId),
      }));
      return { success: true, message: res.message, data };
    }
    return { success: false, message: res.message, data: [], error: res.error };
  }

  async getDistritos(
    provinciaId: string
  ): Promise<ApiResponse<Array<{ id: string; nombre: string; provinciaId: string }>>> {
    const res = await this.get<any>(`/ubigeo/distritos?provinciaId=${provinciaId}`);
    if (res.success && res.data) {
      const raw = Array.isArray(res.data) ? res.data : [];
      const data = raw.map((d: any) => ({
        id: String(d.id),
        nombre: d.nombre,
        provinciaId: String(d.parentId || provinciaId),
      }));
      return { success: true, message: res.message, data };
    }
    return { success: false, message: res.message, data: [], error: res.error };
  }

  async createClient(clientData: {
    tipoEntidad: 'Cliente' | 'Proveedor' | 'Ambos' | 'CLIENTE' | 'PROVEEDOR' | 'AMBOS';
    tipoDocumento: 'DNI' | 'CE' | 'RUC' | 'Pasaporte';
    numeroDocumento: string;
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    email: string;
    telefono: string;
    direccion: string;
    // Ubigeo
    departamentoId: string;
    provinciaId: string;
    distritoId: string;
    // Campo opcional manteniendo compatibilidad
    ciudad?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/entidades', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: string, clientData: {
    tipoEntidad?: 'Cliente' | 'Proveedor' | 'Ambos';
    tipoDocumento?: 'DNI' | 'CE' | 'RUC' | 'Pasaporte';
    numeroDocumento?: string;
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    // Ubigeo
    departamentoId?: string;
    provinciaId?: string;
    distritoId?: string;
    ciudad?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request(`/entidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: string): Promise<ApiResponse<any>> {
    // Soft delete vía endpoint DELETE
    return this.request(`/entidades/${id}`, {
      method: 'DELETE',
    });
  }

  async reactivateClient(id: string): Promise<ApiResponse<any>> {
    // Alinear con backend: /entidades/:id/reactivate vía POST
    return this.request(`/entidades/${id}/reactivate`, {
      method: 'POST',
    });
  }

  // Método para verificar la salud de la API
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Método para verificar la salud de la autenticación
  async authHealthCheck(): Promise<ApiResponse> {
    return this.request('/auth/health');
  }

  // Método GET genérico
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  // Método POST genérico
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Método PUT genérico
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Método PATCH genérico
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Método DELETE genérico
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // ==== REPORTES ====
  async getReporteVentas(params: {
    fechaDesde?: string;
    fechaHasta?: string;
    usuarioId?: string;
    clienteId?: string;
    tipoComprobante?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
    if (params.usuarioId) queryParams.append('usuarioId', params.usuarioId);
    if (params.clienteId) queryParams.append('clienteId', params.clienteId);
    if (params.tipoComprobante) queryParams.append('tipoComprobante', params.tipoComprobante);

    const queryString = queryParams.toString();
    return this.request(`/reportes/ventas?${queryString}`);
  }

  async getReporteCompras(params: {
    fechaDesde?: string;
    fechaHasta?: string;
    proveedorId?: string;
    estado?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
    if (params.proveedorId) queryParams.append('proveedorId', params.proveedorId);
    if (params.estado) queryParams.append('estado', params.estado);

    const queryString = queryParams.toString();
    return this.request(`/reportes/compras?${queryString}`);
  }

  async getReporteInventario(params: {
    almacenId?: string;
    categoriaId?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.almacenId) queryParams.append('almacenId', params.almacenId);
    if (params.categoriaId) queryParams.append('categoriaId', params.categoriaId);

    const queryString = queryParams.toString();
    return this.request(`/reportes/inventario?${queryString}`);
  }

  async getReporteFinanciero(params: {
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);

    const queryString = queryParams.toString();
    return this.request(`/reportes/financiero?${queryString}`);
  }

  async getReporteCaja(params: {
    fechaDesde?: string;
    fechaHasta?: string;
    cajaId?: string;
    usuarioId?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
    if (params.cajaId) queryParams.append('cajaId', params.cajaId);
    if (params.usuarioId) queryParams.append('usuarioId', params.usuarioId);

    const queryString = queryParams.toString();
    return this.request(`/reportes/caja?${queryString}`);
  }

  async getReporteProductosMasVendidos(params: {
    fechaDesde?: string;
    fechaHasta?: string;
    categoriaId?: string;
    top?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
    if (params.categoriaId) queryParams.append('categoriaId', params.categoriaId);
    if (params.top) queryParams.append('top', params.top.toString());

    const queryString = queryParams.toString();
    return this.request(`/reportes/productos-mas-vendidos?${queryString}`);
  }

  async getResumenDashboard(): Promise<ApiResponse<any>> {
    return this.request('/reportes/resumen');
  }
}

// Instancia singleton del servicio de API
export const apiService = new ApiService();

// Funciones de utilidad para el manejo de tokens
export const tokenUtils = {
  setTokens: (accessToken: string, refreshToken: string) => {
    // Almacenar tokens de autenticación
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('alexatech_token', accessToken);
    localStorage.setItem('alexatech_refresh_token', refreshToken);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('alexatech_refresh_token');
  },

  clearTokens: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('alexatech_token');
    localStorage.removeItem('alexatech_refresh_token');
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
};

export default apiService;