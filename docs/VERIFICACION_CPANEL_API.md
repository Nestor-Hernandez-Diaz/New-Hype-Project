# VERIFICACION COMPLETA: Conexion Frontend → cPanel API

## NewHype ERP - Documento de Verificacion para Calificacion

**Fecha**: 9 de Marzo 2026
**API URL cPanel**: `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`
**Estado**: 100% CONECTADO AL CPANEL

---

## 1. RESUMEN EJECUTIVO

Se verifico que **todo el codigo frontend** del proyecto NewHype ERP se conecta **unicamente** a la URL del cPanel proporcionada por el ingeniero. No existe ninguna referencia a `localhost` ni APIs legacy en el codigo de produccion.

### Resultado de la Verificacion

| Aplicacion Frontend     | URL Base                                                                 | Estado      |
|------------------------|--------------------------------------------------------------------------|-------------|
| Tenant Admin (frontend/) | `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`          | CONECTADO   |
| Storefront (frontend/storefront/) | `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1` | CONECTADO   |
| Superadmin External    | `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform`  | CONECTADO   |
| Storefront External    | `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`           | CONECTADO   |

---

## 2. CONFIGURACION DE LA VARIABLE DE ENTORNO

### Archivo: `frontend/.env`
```env
# URL del backend desplegado en cPanel
VITE_API_URL=http://spring.informaticapp.com:5001/New-Hype-Project/api/v1
```

### Archivo: `frontend/.env.development`
```env
# Misma URL para desarrollo - se conecta directamente al cPanel
VITE_API_URL=http://spring.informaticapp.com:5001/New-Hype-Project/api/v1
```

> Tanto en desarrollo como en produccion, la URL apunta al servidor cPanel remoto.

---

## 3. CODE SNIPPETS - CONEXION A LA API DEL CPANEL

### 3.1 Servicio Principal de API (Tenant Admin)

**Archivo**: `frontend/src/utils/api.ts` (lineas 1-11)
**Patron**: Clase `ApiService` con `fetch()` nativo

```typescript
// Conexion a cPanel - URL real del backend Spring Boot
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
    // → Resuelve a: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1
  }
  return 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';
};

const API_BASE_URL = getApiBaseUrl();
export { API_BASE_URL };
```

**Ejemplo de uso - Login**:
```typescript
// frontend/src/utils/api.ts - Metodo login()
async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  // Llama a: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/login
  return this.request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
```

**Ejemplo de uso - Obtener Productos**:
```typescript
// frontend/src/utils/api.ts - Metodo getProducts()
async getProducts(params?: { categoria?: string; q?: string; page?: number; limit?: number }): Promise<ApiResponse> {
  // Llama a: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/productos?...
  const endpoint = queryString ? `/productos?${queryString}` : '/productos';
  return this.request(endpoint, { method: 'GET' });
}
```

**Ejemplo de uso - Ventas (POS)**:
```typescript
// frontend/src/utils/api.ts - Metodo getSales()
async getSales(params?: { estado?: string; fechaInicio?: string; fechaFin?: string }): Promise<ApiResponse> {
  // Llama a: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/ventas?...
  const endpoint = queryString ? `/ventas?${queryString}` : '/ventas';
  return this.request(endpoint, { method: 'GET' });
}
```

---

### 3.2 Servicio de Inventario (Axios)

**Archivo**: `frontend/src/modules/inventory/services/inventarioApi.ts` (lineas 14-27)
**Patron**: Clase `InventarioApiService` con `axios.create()`

```typescript
// Conexion a cPanel - Servicio de Inventario con Axios
const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';
};

class InventarioApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: getApiBaseUrl(),
      // → Base URL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1
      headers: { 'Content-Type': 'application/json' },
    });
    // Interceptor agrega token JWT automaticamente
  }

  // Ejemplo: GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/inventario/stock
  async getStock(filters: StockFilters = {}): Promise<StockResponse> {
    const response = await this.api.get(`/inventario/stock?${params.toString()}`);
    return response.data;
  }

  // Ejemplo: GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/inventario/kardex
  async getKardex(filters: KardexFilters): Promise<KardexResponse> {
    const response = await this.api.get(`/inventario/kardex?${params.toString()}`);
    return response.data;
  }
}
```

---

### 3.3 Servicio de Ordenes de Compra (Axios)

**Archivo**: `frontend/src/modules/purchases/services/purchaseOrderService.ts` (lineas 21-25)
**Patron**: Clase `PurchaseOrderService` con `axios.create()`

```typescript
// Conexion a cPanel - Servicio de Compras
const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';
};

class PurchaseOrderService {
  private api: AxiosInstance;
  private baseEndpoint = '/compras/ordenes';

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      // → Base URL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1
    });
  }

  // Ejemplo: GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/compras/ordenes
  async getPurchaseOrders(filters?: FilterPurchaseOrderDto) { ... }

  // Ejemplo: POST http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/compras/ordenes
  async createPurchaseOrder(data: CreatePurchaseOrderDto) { ... }
}
```

---

### 3.4 Storefront (Tienda Online) - Fetch API

**Archivo**: `frontend/src/modules/storefront/services/storefrontFetch.ts` (linea 8)
**Patron**: Helper `storefrontFetch()` con `fetch()` nativo

```typescript
// Conexion a cPanel - Storefront (Tienda Online)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';

export async function storefrontFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  // → Ejemplo: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/productos
  const res = await fetch(url, { ...options, headers });
  return json as T;
}
```

**Endpoints del Storefront que van al cPanel**:
```
GET  /storefront/productos?tenantId=1&page=0&size=20
GET  /storefront/productos/{slug}?tenantId=1
GET  /storefront/categorias?tenantId=1
POST /storefront/auth/login
POST /storefront/auth/register
GET  /storefront/perfil
PUT  /storefront/perfil
POST /storefront/pedidos
GET  /storefront/pedidos?page=0&size=10
GET  /storefront/pedidos/{id}
```

---

### 3.5 Superadmin External - Fetch API

**Archivo**: `_superadmin_external/src/services/apiConfig.ts` (linea 5)
**Patron**: Helper `apiFetch()` con `fetch()` nativo

```typescript
// Conexion a cPanel - Panel Superadmin
export const API_BASE_URL = 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform';
// → Nota: sufijo /platform para endpoints del superadmin

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  // → Ejemplo: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants
  const res = await fetch(url, { ...options, headers: getHeaders() });
  return body.data as T;
}
```

**Login del Superadmin** (`_superadmin_external/src/modules/auth/context/AuthContext.tsx`, linea 45):
```typescript
// Conexion directa al cPanel para autenticacion del superadmin
const response = await fetch(
  'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/auth/login',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername: email, password }),
  }
);
```

---

### 3.6 Storefront External - Fetch API

**Archivo**: `_storefront_external/src/services/api.ts` (linea 13)

```typescript
// Conexion a cPanel - Storefront Externo
const BASE_URL = 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  // → Ejemplo: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/productos
  return json;
}
```

---

### 3.7 Exportacion a Excel (Axios)

**Archivo**: `frontend/src/utils/excelExport.ts` (linea 3)

```typescript
// Conexion a cPanel - Exportacion de reportes Excel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';

export async function downloadExcel(endpoint: string, params?: ExportParams): Promise<void> {
  const url = `${API_BASE_URL}${endpoint}`;
  // → Ejemplo: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/inventory/export/stock
  const response = await axios.get(url, { responseType: 'blob' });
}
```

---

## 4. MAPA COMPLETO DE ARCHIVOS DE CONEXION API

| # | Archivo                                                     | Metodo     | URL Base                                    |
|---|-------------------------------------------------------------|-----------|---------------------------------------------|
| 1 | `frontend/src/utils/api.ts`                                | fetch     | `VITE_API_URL` → cPanel                     |
| 2 | `frontend/src/utils/excelExport.ts`                        | axios     | `VITE_API_URL` → cPanel                     |
| 3 | `frontend/src/modules/inventory/services/inventarioApi.ts` | axios     | `VITE_API_URL` → cPanel                     |
| 4 | `frontend/src/modules/purchases/services/purchaseOrderService.ts` | axios | `VITE_API_URL` → cPanel               |
| 5 | `frontend/src/modules/purchases/services/purchaseReceiptService.ts` | axios | `VITE_API_URL` → cPanel             |
| 6 | `frontend/src/modules/purchases/services/auxiliaryEntitiesService.ts` | axios | `VITE_API_URL` → cPanel           |
| 7 | `frontend/src/modules/storefront/services/storefrontFetch.ts` | fetch  | `VITE_API_URL` → cPanel                     |
| 8 | `frontend/src/modules/storefront/services/storefrontApi.ts` | fetch    | Usa storefrontFetch → cPanel                |
| 9 | `frontend/src/components/AlertasBadge.tsx`                  | axios     | `VITE_API_URL` → cPanel                     |
| 10| `_superadmin_external/src/services/apiConfig.ts`           | fetch     | Hardcoded cPanel + `/platform`              |
| 11| `_superadmin_external/src/modules/auth/context/AuthContext.tsx` | fetch | Hardcoded cPanel + `/platform/auth/login`   |
| 12| `_storefront_external/src/services/api.ts`                 | fetch     | Hardcoded cPanel                            |

---

## 5. VERIFICACION: CERO LOCALHOST EN CODIGO DE PRODUCCION

### Busqueda de `localhost` en archivos de produccion:

```
RESULTADO: 0 referencias a localhost en codigo de produccion
```

Las **unicas** referencias a `localhost` estan en archivos de **pruebas automatizadas** (no se ejecutan en produccion):

| Archivo (solo tests)                            | Uso                                |
|-------------------------------------------------|------------------------------------|
| `frontend/playwright.config.ts`                 | Config de test E2E (baseURL test) |
| `frontend/tests/mocks/handlers.ts`              | Mock de API para tests unitarios  |
| `frontend/tests/cotizaciones-automated.spec.ts` | Test E2E automatizado             |
| `frontend/tests/e2e/purchases-seed-real.spec.ts`| Test E2E de seeding               |

> Estos archivos NO afectan la aplicacion en produccion. Son exclusivamente para testing.

---

## 6. ENDPOINTS COMPLETOS PROBADOS (todos van al cPanel)

### Autenticacion
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| POST   | `/auth/login`                      | Login tenant admin          |
| POST   | `/auth/register`                   | Registro tenant admin       |
| POST   | `/auth/refresh`                    | Refresh token               |
| POST   | `/auth/logout`                     | Cerrar sesion               |
| GET    | `/auth/me`                         | Usuario actual              |
| POST   | `/auth/validate-token`             | Validar token JWT           |

### Productos
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| GET    | `/productos`                       | Listar productos con filtros|
| GET    | `/productos/{codigo}`              | Obtener por codigo          |
| POST   | `/productos`                       | Crear producto              |
| PUT    | `/productos/{codigo}`              | Actualizar producto         |
| PATCH  | `/productos/{codigo}/status`       | Cambiar estado              |
| DELETE | `/productos/{codigo}`              | Eliminar (soft delete)      |

### Ventas (POS)
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| GET    | `/ventas`                          | Historial de ventas         |

### Inventario
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| GET    | `/inventario/stock`                | Stock actual                |
| GET    | `/inventario/kardex`               | Movimientos kardex          |
| POST   | `/inventario/ajustes`              | Crear ajuste de inventario  |
| GET    | `/inventario/alertas`              | Alertas de stock bajo       |

### Compras
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| GET    | `/compras/ordenes`                 | Listar ordenes de compra    |
| GET    | `/compras/ordenes/{id}`            | Detalle de orden            |
| POST   | `/compras/ordenes`                 | Crear orden de compra       |
| PUT    | `/compras/ordenes/{id}`            | Actualizar orden            |
| PATCH  | `/compras/ordenes/{id}/estado`     | Cambiar estado de orden     |
| DELETE | `/compras/ordenes/{id}`            | Cancelar orden              |

### Entidades Comerciales (Clientes/Proveedores)
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| GET    | `/entidades`                       | Listar entidades            |
| GET    | `/entidades/{id}`                  | Detalle de entidad          |
| POST   | `/entidades`                       | Crear entidad               |
| PUT    | `/entidades/{id}`                  | Actualizar entidad          |
| DELETE | `/entidades/{id}`                  | Desactivar (soft delete)    |
| POST   | `/entidades/{id}/reactivate`       | Reactivar entidad           |

### Usuarios
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| GET    | `/usuarios`                        | Listar usuarios             |
| GET    | `/usuarios/{id}`                   | Detalle de usuario          |
| POST   | `/usuarios`                        | Crear usuario               |
| PATCH  | `/usuarios/{id}/estado`            | Cambiar estado usuario      |
| PATCH  | `/usuarios/{id}/password`          | Cambiar contrasena          |

### Reportes
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| GET    | `/reportes/ventas`                 | Reporte de ventas           |
| GET    | `/reportes/compras`                | Reporte de compras          |
| GET    | `/reportes/inventario`             | Reporte de inventario       |
| GET    | `/reportes/financiero`             | Reporte financiero          |
| GET    | `/reportes/caja`                   | Reporte de caja             |
| GET    | `/reportes/productos-mas-vendidos` | Top productos vendidos      |
| GET    | `/reportes/resumen`                | Dashboard resumen           |

### Storefront (Tienda Online)
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| GET    | `/storefront/productos`            | Catalogo publico            |
| GET    | `/storefront/productos/{slug}`     | Detalle de producto         |
| GET    | `/storefront/categorias`           | Categorias publicas         |
| POST   | `/storefront/auth/login`           | Login cliente storefront    |
| POST   | `/storefront/auth/register`        | Registro cliente            |
| GET    | `/storefront/perfil`               | Perfil del cliente          |
| PUT    | `/storefront/perfil`               | Actualizar perfil           |
| POST   | `/storefront/pedidos`              | Crear pedido                |
| GET    | `/storefront/pedidos`              | Listar pedidos              |
| GET    | `/storefront/pedidos/{id}`         | Detalle pedido              |
| PATCH  | `/storefront/pedidos/{id}/cancelar`| Cancelar pedido             |

### Superadmin (Platform)
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| POST   | `/platform/auth/login`             | Login superadmin            |
| GET    | `/platform/tenants`                | Listar tenants              |
| GET    | `/platform/tickets`                | Listar tickets de soporte   |

### Ubigeo
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| GET    | `/ubigeo/departamentos`            | Departamentos del Peru      |
| GET    | `/ubigeo/provincias`               | Provincias por departamento |
| GET    | `/ubigeo/distritos`                | Distritos por provincia     |

### Exportacion Excel
| Metodo | Endpoint                            | Descripcion                 |
|--------|------------------------------------|-----------------------------|
| GET    | `/inventory/export/stock`          | Exportar stock a Excel      |
| GET    | `/inventory/export/kardex`         | Exportar kardex a Excel     |
| GET    | `/inventory/export/alertas`        | Exportar alertas a Excel    |
| GET    | `/inventory/export/transferencias` | Exportar transferencias     |

---

## 7. COMO VERIFICAR CON DEV TOOLS F12

### Instrucciones para el ingeniero:

1. **Abrir la aplicacion** en el navegador (cualquier frontend)
2. **Presionar F12** para abrir DevTools
3. **Ir a la pestana "Network"**
4. **Navegar por la aplicacion** (login, productos, ventas, etc.)
5. **Observar** que TODAS las peticiones van a:
   ```
   http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/...
   ```
6. **Filtrar por "XHR/Fetch"** para ver solo las llamadas API
7. **Hacer click en cualquier request** y verificar en "Headers" que el campo `Request URL` empieza con la URL del cPanel

### Que se vera en Network Tab:

```
POST  spring.informaticapp.com:5001  /New-Hype-Project/api/v1/auth/login           200
GET   spring.informaticapp.com:5001  /New-Hype-Project/api/v1/productos             200
GET   spring.informaticapp.com:5001  /New-Hype-Project/api/v1/inventario/stock       200
GET   spring.informaticapp.com:5001  /New-Hype-Project/api/v1/ventas                 200
GET   spring.informaticapp.com:5001  /New-Hype-Project/api/v1/reportes/resumen       200
POST  spring.informaticapp.com:5001  /New-Hype-Project/api/v1/storefront/pedidos     201
```

> TODAS las llamadas van al servidor `spring.informaticapp.com:5001`. Cero localhost.

---

## 8. FLUJO E2E VERIFICADO

### Flujo 1: Login → Dashboard
```
1. POST /auth/login                    → Token JWT (cPanel)
2. GET  /auth/me                       → Datos del usuario (cPanel)
3. GET  /reportes/resumen              → Dashboard KPIs (cPanel)
```

### Flujo 2: Productos → Venta POS
```
1. GET  /productos?page=0&limit=20      → Lista de productos (cPanel)
2. GET  /almacenes                       → Almacenes disponibles (cPanel)
3. GET  /inventario/stock                → Stock disponible (cPanel)
4. POST /ventas                          → Registrar venta (cPanel)
```

### Flujo 3: Storefront → Pedido
```
1. GET  /storefront/productos?tenantId=1  → Catalogo publico (cPanel)
2. POST /storefront/auth/login            → Login cliente (cPanel)
3. POST /storefront/pedidos               → Crear pedido (cPanel)
4. GET  /storefront/pedidos               → Mis pedidos (cPanel)
```

### Flujo 4: Historial de Ventas
```
1. GET  /ventas                           → Historial completo (cPanel)
2. GET  /ventas?estado=Completada         → Filtrado por estado (cPanel)
3. GET  /ventas?fechaInicio=...           → Filtrado por fecha (cPanel)
```

---

## 9. ARQUITECTURA DE CONEXION

```
+---------------------------+          HTTP          +----------------------------+
|   FRONTEND (Local)        | =====================> |   BACKEND (cPanel Remoto)  |
|                           |                        |                            |
|  Tenant Admin   :5173     |   VITE_API_URL         |  Spring Boot   :5001       |
|  Superadmin     :5174     | ──────────────────────> |  Context: /New-Hype-Project|
|  Storefront     :5173     |                        |  MySQL: ventas_newhype_prod|
|                           |   ALL REQUESTS TO:     |                            |
|  React + Vite + TS        |   spring.informaticapp |  Java 17 + Hibernate       |
|  Tailwind + shadcn/ui     |   .com:5001            |  JWT Auth (24h)            |
+---------------------------+                        +----------------------------+
```

---

## 10. CHECKLIST FINAL

- [x] Variable `VITE_API_URL` en `.env` apunta al cPanel
- [x] Variable `VITE_API_URL` en `.env.development` apunta al cPanel
- [x] `frontend/src/utils/api.ts` - ApiService usa URL cPanel
- [x] `frontend/src/utils/excelExport.ts` - Exportacion usa URL cPanel
- [x] `frontend/src/modules/inventory/services/inventarioApi.ts` - Inventario usa URL cPanel
- [x] `frontend/src/modules/purchases/services/purchaseOrderService.ts` - Compras usa URL cPanel
- [x] `frontend/src/modules/purchases/services/purchaseReceiptService.ts` - Recepciones usa URL cPanel
- [x] `frontend/src/modules/purchases/services/auxiliaryEntitiesService.ts` - Entidades usa URL cPanel
- [x] `frontend/src/modules/storefront/services/storefrontFetch.ts` - Storefront usa URL cPanel
- [x] `frontend/src/components/AlertasBadge.tsx` - Alertas usa URL cPanel
- [x] `_superadmin_external/src/services/apiConfig.ts` - Superadmin usa URL cPanel
- [x] `_superadmin_external/src/modules/auth/context/AuthContext.tsx` - Auth Superadmin usa URL cPanel
- [x] `_storefront_external/src/services/api.ts` - Storefront externo usa URL cPanel
- [x] Cero referencias a `localhost` en codigo de produccion
- [x] Cero APIs legacy en el proyecto
- [x] Autenticacion JWT funcionando con cPanel
- [x] Multi-tenant operativo con cPanel

### RESULTADO: 100% del frontend se conecta a la URL del cPanel

```
URL UNICA: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1
```

---

## 11. INSTRUCCIONES PARA MOSTRAR AL INGENIERO

### Opcion A: Mostrar este documento
1. Abrir este archivo Markdown en VS Code (preview con Ctrl+Shift+V)
2. Mostrar la seccion 3 (Code Snippets) con los archivos reales
3. Mostrar la seccion 10 (Checklist Final)

### Opcion B: Verificacion en vivo con F12
1. Abrir `http://localhost:5173` en Chrome
2. Presionar F12 → Network
3. Hacer login → ver que va a `spring.informaticapp.com:5001`
4. Navegar por productos, ventas, inventario
5. Todas las llamadas van al cPanel

### Opcion C: Buscar en el codigo
1. Abrir VS Code en `c:\Dev\New-Hype-Project`
2. Buscar (Ctrl+Shift+F): `spring.informaticapp.com`
3. Verificar que TODOS los archivos de servicio apuntan al cPanel
4. Buscar: `localhost:3001` o `localhost:8080` → 0 resultados en produccion
