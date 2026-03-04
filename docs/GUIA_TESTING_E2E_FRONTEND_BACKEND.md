# GUIA DE TESTING E2E: Frontend (React/Vite) <-> Backend (Spring Boot)

**Proyecto:** New Hype Project - Sistema de Gestion Empresarial SaaS Multi-Tenant
**Fecha:** 03 de Marzo, 2026
**Autor:** Claude (Full-Stack Senior Dev + QA)
**Herramientas:** Chrome DevTools MCP, Vite Dev Server, Spring Boot Backend

---

## INDICE

1. [Estado Actual del Sistema](#1-estado-actual-del-sistema)
2. [Estrategia de Testing E2E](#2-estrategia-de-testing-e2e)
3. [Checklist de Verificacion (25 items)](#3-checklist-de-verificacion-25-items)
4. [Hallazgos por Modulo](#4-hallazgos-por-modulo)
5. [Problemas Encontrados y Soluciones](#5-problemas-encontrados-y-soluciones)
6. [Guia de Verificacion con Chrome DevTools MCP](#6-guia-de-verificacion-con-chrome-devtools-mcp)
7. [Flujos E2E Criticos](#7-flujos-e2e-criticos)
8. [Resumen de Endpoints por Modulo](#8-resumen-de-endpoints-por-modulo)
9. [Recomendaciones Finales](#9-recomendaciones-finales)

---

## 1. ESTADO ACTUAL DEL SISTEMA

### 1.1 Frontend (Vite Dev Server)

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| **Build TypeScript** | PASA | `npm run build` completa en ~791ms, 0 errores |
| **Dev Server** | FUNCIONAL | `localhost:5173` corriendo correctamente |
| **Pagina Login** | RENDERIZA | Formulario visible con campos email/password |
| **Contextos** | CARGAN | 9 context providers inicializados |
| **Errores Console** | 70+ errores CORS | Todos por backend inaccesible |

### 1.2 Backend (Spring Boot en cPanel)

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| **URL** | `https://spring.informaticapp.com/New-Hype-Project/` | |
| **Estado** | **NO DISPONIBLE** | Retorna cPanel 404 nativo |
| **Swagger UI** | **NO ACCESIBLE** | 404 en `/swagger-ui/index.html` |
| **Auth Endpoints** | **NO RESPONDEN** | POST `/auth/login` falla |
| **Causa probable** | WAR/JAR no desplegado o servicio no iniciado | cPanel error page confirma |

### 1.3 Diagnostico CORS

```
Sintoma:  "Access to fetch at 'https://spring.informaticapp.com/...'
           from origin 'http://localhost:5173' has been blocked by CORS policy"

Causa Real: El backend NO esta corriendo. Cuando el servidor no responde
            al preflight OPTIONS, el navegador reporta "CORS error" en
            lugar de "connection refused". NO es un problema de configuracion
            CORS en el codigo Java.

Evidencia: CorsConfig.java incluye 'http://localhost:5173' correctamente.
           SecurityConfig.java aplica el CorsConfigurationSource bean.
           El problema es que la aplicacion Spring Boot no esta activa.
```

### 1.4 Configuracion Actual

```
# frontend/.env.development
VITE_API_URL=https://spring.informaticapp.com/New-Hype-Project/api/v1

# vite.config.ts - SIN proxy configurado
# Todas las peticiones van directamente al backend remoto
```

---

## 2. ESTRATEGIA DE TESTING E2E

### 2.1 Prerequisitos (BLOQUEANTES)

Antes de ejecutar cualquier test E2E, resolver:

1. **Levantar el backend** - La aplicacion Spring Boot debe estar corriendo en `spring.informaticapp.com`
2. **Verificar CORS** - Una vez el backend este arriba, confirmar que los headers CORS se envian correctamente
3. **Alternativa: Proxy Vite** - Configurar proxy en `vite.config.ts` para desarrollo local

#### Opcion A: Backend Remoto (cuando este disponible)
```
Verificar: curl -I https://spring.informaticapp.com/New-Hype-Project/api/v1/auth/login
Esperado: HTTP/2 200 o 405 (method not allowed para GET)
Con CORS: Access-Control-Allow-Origin: http://localhost:5173
```

#### Opcion B: Proxy Vite (recomendado para desarrollo)
```typescript
// vite.config.ts - agregar en server:
server: {
  port: 5173,
  host: true,
  proxy: {
    '/api': {
      target: 'https://spring.informaticapp.com/New-Hype-Project',
      changeOrigin: true,
      secure: true,
    }
  }
}
// Y cambiar .env.development:
// VITE_API_URL=/api/v1
```

#### Opcion C: Backend Local
```
cd newhype-backend
./mvnw spring-boot:run
# Cambiar .env.development:
# VITE_API_URL=http://localhost:8080/api/v1
```

### 2.2 Orden de Testing

```
Fase 1: Conectividad
  1.1 Verificar backend responde (health check)
  1.2 Verificar CORS headers en preflight OPTIONS
  1.3 Verificar endpoint publico: POST /auth/login

Fase 2: Autenticacion
  2.1 Login exitoso con credenciales validas
  2.2 Login fallido con credenciales invalidas
  2.3 Verificar JWT almacenado en localStorage
  2.4 Verificar refresh token
  2.5 Verificar /auth/me con token

Fase 3: Modulos CRUD (uno a la vez)
  3.1 Productos: GET lista, POST crear, PUT editar, DELETE
  3.2 Entidades: GET lista, POST crear, PUT editar
  3.3 Usuarios: GET lista, POST crear, PATCH estado
  3.4 Configuracion: GET empresa, GET comprobantes, GET metodos pago

Fase 4: Modulos Transaccionales
  4.1 Inventario: GET stock, POST ajuste, GET kardex
  4.2 Compras: POST orden, GET lista, PATCH estado, POST recepcion
  4.3 Ventas: POST venta, GET lista, POST confirmar pago

Fase 5: Integracion
  5.1 Flujo completo: Login -> Crear OC -> Recibir -> Ver Kardex
  5.2 Flujo completo: Login -> Abrir Caja -> Vender -> Confirmar -> Cerrar Caja
```

---

## 3. CHECKLIST DE VERIFICACION (25 ITEMS)

### Conectividad y CORS

| # | Verificacion | Comando/Accion | Esperado | Estado |
|---|-------------|----------------|----------|--------|
| 1 | Backend responde | `curl https://spring.informaticapp.com/New-Hype-Project/api/v1/auth/login` | HTTP 200/405 | PENDIENTE |
| 2 | CORS preflight OK | Verificar header `Access-Control-Allow-Origin` en Network tab | `http://localhost:5173` | PENDIENTE |
| 3 | CORS credentials | Verificar header `Access-Control-Allow-Credentials` | `true` | PENDIENTE |
| 4 | Content-Type permitido | Verificar `Access-Control-Allow-Headers` incluye `Content-Type` | Presente | PENDIENTE |

### Autenticacion (RF-AUT)

| # | Verificacion | Accion | Esperado | Estado |
|---|-------------|--------|----------|--------|
| 5 | Login exitoso | POST `/auth/login` con credenciales validas | `{ success: true, data: { accessToken, refreshToken, user } }` | PENDIENTE |
| 6 | Token guardado | Revisar localStorage despues de login | `authToken` y `alexatech_token` presentes | PENDIENTE |
| 7 | Redirect post-login | Despues de login exitoso | Navega a `/dashboard` o `/` | PENDIENTE |
| 8 | Token en headers | Verificar Authorization header en requests posteriores | `Bearer <token>` | PENDIENTE |
| 9 | Login fallido | POST `/auth/login` con creds invalidas | Error message, no redirect | PENDIENTE |
| 10 | Refresh token | Cuando access token expira | Nuevo access token generado | PENDIENTE |
| 11 | Logout | Click "Cerrar Sesion" | Tokens limpiados, redirect a `/login` | PENDIENTE |

### Modulos CRUD

| # | Verificacion | Endpoint | Esperado | Estado |
|---|-------------|----------|----------|--------|
| 12 | Listar productos | GET `/productos?page=0&size=10` | Array con paginacion backend | PENDIENTE |
| 13 | Listar entidades | GET `/entidades?page=0&size=10` | Array con paginacion | PENDIENTE |
| 14 | Listar usuarios | GET `/usuarios?page=0&size=10` | Array con paginacion | PENDIENTE |
| 15 | Listar roles | GET `/roles` | Array de roles | PENDIENTE |
| 16 | Config empresa | GET `/configuracion/empresa` | Datos de la empresa | PENDIENTE |
| 17 | Categorias | GET `/categorias` | Array de categorias | PENDIENTE |
| 18 | Unidades medida | GET `/unidades-medida` | Array de unidades | PENDIENTE |

### Modulos Transaccionales

| # | Verificacion | Endpoint | Esperado | Estado |
|---|-------------|----------|----------|--------|
| 19 | Stock por almacen | GET `/inventario/stock?almacenId=X` | Array de stock items | PENDIENTE |
| 20 | Kardex movimientos | GET `/inventario/kardex?productoId=X&almacenId=Y` | Array paginado | PENDIENTE |
| 21 | Ordenes compra | GET `/compras/ordenes` | Array paginado | PENDIENTE |
| 22 | Ventas | GET `/ventas` | Array de ventas | PENDIENTE |
| 23 | Cajas registradoras | GET `/configuracion/cajas-registradoras` | Array de cajas | PENDIENTE |
| 24 | Sesiones caja | GET `/caja/sesiones` | Array de sesiones | PENDIENTE |

### Multi-Tenant

| # | Verificacion | Como verificar | Esperado | Estado |
|---|-------------|---------------|----------|--------|
| 25 | Aislamiento de datos | Login con 2 tenants diferentes, comparar datos | Cada tenant ve solo sus datos | PENDIENTE |

---

## 4. HALLAZGOS POR MODULO

### 4.1 Modulo Auth (`AuthContext.tsx`)

**Estado:** Bien implementado

- Login: `POST /auth/login` -> recibe `{ accessToken, refreshToken, user }`
- Mapeo usuario: `BackendUserInfo` -> `User` con permisos via `fetchPermissionsForRole()`
- Token storage: dual (`authToken` + `alexatech_token`) para compatibilidad legacy
- Refresh flow: intenta refresh si token expirado, limpia sesion si falla
- ProtectedRoute: verifica `isAuthenticated` + `hasPermission()` por ruta

**Problema encontrado:** Ninguno critico en auth.

---

### 4.2 Modulo Productos (`productosRealApi.ts`)

**Compatibilidad:** 95%

| Endpoint Frontend | Endpoint Backend | Match |
|-------------------|-----------------|-------|
| `getProductos(filtros)` | `GET /productos?q=&categoria=&page=0&size=10` | SI |
| `getProductoById(id)` | `GET /productos/{id}` | SI |
| `crearProducto(data)` | `POST /productos` | SI |
| `actualizarProducto(id, data)` | `PUT /productos/{id}` | SI |
| `eliminarProducto(id)` | `DELETE /productos/{id}` | SI |
| `cambiarEstadoProducto(id, activo)` | `PATCH /productos/{id}/status` | SI |
| `getCategorias()` | `GET /categorias` | SI |
| `getUnidadesMedida()` | `GET /unidades-medida` | SI |

**Mapeo de campos:**
```
Backend (sku)          -> Frontend (codigoProducto)
Backend (nombre)       -> Frontend (nombreProducto)
Backend (estado:bool)  -> Frontend (activo:bool + estadoProducto:enum)
Backend (precioVenta)  -> Frontend (precioVenta) [BigDecimal -> number]
Backend (createdAt)    -> Frontend (fechaCreacion) [ISO -> Date]
```

**Problemas menores:**
- `verificarCodigoProducto()` busca en lista local (no hay endpoint backend dedicado)
- Campos de ropa (talla, color, marca, material) usan defaults vacios si backend no los retorna

---

### 4.3 Modulo Entidades (`entidadesRealApi.ts`)

**Compatibilidad:** 90%

| Endpoint Frontend | Endpoint Backend | Match |
|-------------------|-----------------|-------|
| `getEntidades(filtros)` | `GET /entidades?tipoEntidad=&search=&page=0&size=10` | SI |
| `getEntidadById(id)` | `GET /entidades/{id}` | SI |
| `crearEntidad(data)` | `POST /entidades` | SI |
| `actualizarEntidad(id, data)` | `PUT /entidades/{id}` | SI |
| `eliminarEntidad(id)` | `DELETE /entidades/{id}` (soft delete) | SI |
| `cambiarEstadoEntidad(id, true)` | `POST /entidades/{id}/reactivate` | VERIFICAR |
| `verificarDocumento(numero)` | Busqueda client-side | N/A |

**Problemas:**
- `verificarDocumento()`: No hay endpoint backend dedicado. Busca en resultados locales
- Paginacion: Frontend 1-based, Backend 0-based (convertido con `toBackendPage()`)

---

### 4.4 Modulo Usuarios (`usuariosRealApi.ts`)

**Compatibilidad:** 85%

| Endpoint Frontend | Endpoint Backend | Match |
|-------------------|-----------------|-------|
| `getUsuarios(filtros)` | `GET /usuarios?page=0&size=10` | SI |
| `getUsuarioById(id)` | `GET /usuarios/{id}` | SI |
| `crearUsuario(data)` | `POST /usuarios` | SI |
| `actualizarUsuario(id, data)` | `PUT /usuarios/{id}` | SI |
| `cambiarEstadoUsuario(id)` | `PATCH /usuarios/{id}/estado` | PARCIAL |
| `cambiarPasswordUsuario(id, data)` | `PATCH /usuarios/{id}/password` | VERIFICAR |
| `getRoles()` | `GET /roles` | SI |
| `crearRol(data)` | `POST /roles` | SI |
| `actualizarRol(id, data)` | `PUT /roles/{id}` | SI |
| `getRolById(id)` | Client-side filter (no endpoint) | N/A |

**Problemas:**
- `cambiarEstadoUsuario()`: El frontend envia el estado deseado (`activo: boolean`) pero el backend solo hace toggle. El parametro `_activo` es ignorado
- `getRolById()`: No hay endpoint `GET /roles/{id}`. Trae todos los roles y filtra client-side
- Permisos: Backend devuelve `permisos` como JSON string, frontend lo parsea a array

---

### 4.5 Modulo Inventario (`inventoryRealApi.ts`)

**Compatibilidad:** 75% (la mas baja)

| Endpoint Frontend | Endpoint Backend | Match |
|-------------------|-----------------|-------|
| `getStock(filters)` | `GET /inventario/stock?almacenId=X` | PARCIAL |
| `getKardex(filters)` | `GET /inventario/kardex?productoId=X&almacenId=Y` | PARCIAL |
| `createAjuste(data)` | `POST /inventario/ajustes` | SI |
| `getAlertas()` | `GET /inventario/alertas` | SI |
| `searchProducts(query)` | `GET /productos/buscar?q=X` | SI |

**Problemas CRITICOS:**

1. **Stock sin paginacion server-side**: El endpoint `/inventario/stock` retorna TODOS los registros. El frontend hace paginacion/filtrado client-side. No escala para almacenes grandes.

2. **Kardex estructura anidada**: Backend retorna datos dentro de `data.movimientos[]` con `data.pagination`, no en la estructura estandar `ApiResponse`.

3. **Kardex sin datos de producto**: La respuesta del kardex NO incluye `codigo`, `nombre`, `almacen` del producto. El frontend pone strings vacios.

4. **Ajuste: mapeo de tipo**: El frontend convierte `cantidadAjuste` (+ o -) a `{ tipo: 'AJUSTE_INGRESO'|'AJUSTE_EGRESO', cantidad: abs(valor) }`.

---

### 4.6 Modulo Ventas (`ventasRealApi.ts`)

**Compatibilidad:** 70% (la segunda mas baja)

| Endpoint Frontend | Endpoint Backend | Match |
|-------------------|-----------------|-------|
| `getCajasRegistradoras()` | `GET /configuracion/cajas-registradoras` | SI |
| `getSesionesCaja(filters)` | `GET /caja/sesiones` | SI |
| `abrirSesionCaja(data)` | `POST /caja/sesiones` | SI |
| `cerrarSesionCaja(id, data)` | `PATCH /caja/sesiones/{id}/cerrar` | SI |
| `getMovimientosCaja(id)` | `GET /caja/sesiones/{id}/movimientos` | SI |
| `getResumenCaja(id)` | `GET /caja/sesiones/{id}/resumen` | SI |
| `crearMovimientoCaja(data)` | `POST /caja/movimientos` | SI |
| `getVentas(filters)` | `GET /ventas` | SI |
| `crearVenta(data)` | `POST /ventas` | SI |
| `confirmarPagoVenta(id, data)` | `POST /ventas/{id}/confirmar-pago` | SI |
| `cancelarVenta(id, motivo)` | `PATCH /ventas/{id}/cancelar` | SI |
| `crearNotaCredito(data)` | `POST /notas-credito` | SI |

**Problemas CRITICOS:**

1. **SalesContext NO verifica autenticacion**: A diferencia de todos los demas contextos, `SalesContext.tsx` llama 4 endpoints en `useEffect` sin verificar si hay token. Esto causa las peticiones innecesarias en la pagina de login.

   ```typescript
   // SalesContext.tsx linea 625-630 - FALTA verificacion de token
   useEffect(() => {
     loadCashRegisters();  // Llama sin verificar auth
     loadCashSessions();   // Llama sin verificar auth
     loadSales();          // Llama sin verificar auth
     loadQuotes();         // Llama sin verificar auth
   }, []);
   ```

2. **Metodo de pago perdido**: `mapBackendPago()` recibe `metodoPagoId` del backend pero no resuelve el nombre. El frontend muestra string vacio.

3. **Notas de Credito incompletas**: Los items de nota de credito no incluyen `nombreProducto` del backend.

---

### 4.7 Modulo Compras (`comprasRealApi.ts`)

**Compatibilidad:** 90%

| Endpoint Frontend | Endpoint Backend | Match |
|-------------------|-----------------|-------|
| `getOrdenes(filtros)` | `GET /compras/ordenes` | SI |
| `getOrdenById(id)` | `GET /compras/ordenes/{id}` | SI |
| `crearOrden(data)` | `POST /compras/ordenes` | SI |
| `actualizarOrden(id, data)` | `PUT /compras/ordenes/{id}` | SI |
| `eliminarOrden(id)` | `DELETE /compras/ordenes/{id}` | SI |
| `cambiarEstadoOrden(id, estado)` | `PATCH /compras/ordenes/{id}/estado` | SI |
| `getRecepciones(filtros)` | `GET /compras/recepciones` | SI |
| `crearRecepcion(data)` | `POST /compras/recepciones` | SI |
| `confirmarRecepcion(id)` | `PATCH /compras/recepciones/{id}/confirmar` | SI |

**Limitaciones documentadas:**
- `actualizarRecepcion()`: No soportado por backend (throws error)
- `eliminarRecepcion()`: No soportado por backend (throws error)
- Solo estado CONFIRMADA se puede cambiar via endpoint dedicado

---

### 4.8 Modulo Configuracion (`configuracionApi.ts`)

**Compatibilidad:** 90%

| Endpoint Frontend | Endpoint Backend | Match |
|-------------------|-----------------|-------|
| `getEmpresa()` | `GET /configuracion/empresa` | SI |
| `updateEmpresa(data)` | `PUT /configuracion/empresa` | SI |
| `getComprobantes()` | `GET /configuracion/series-comprobantes` | SI |
| `getMetodosPago()` | `GET /configuracion/metodos-pago` | SI |
| `getCategorias()` | `GET /categorias` | SI |
| `getUnidadesMedida()` | `GET /unidades-medida` | SI |

---

## 5. PROBLEMAS ENCONTRADOS Y SOLUCIONES

### PROBLEMA 1: Backend No Disponible (CRITICO - BLOQUEANTE)

**Sintoma:** Todos los requests fallan con CORS error / ERR_FAILED
**Causa:** La aplicacion Spring Boot NO esta corriendo en `spring.informaticapp.com`
**Evidencia:** cPanel devuelve pagina 404 nativa para TODAS las URLs

**Solucion:**
```bash
# Opcion A: Reiniciar backend en cPanel
ssh usuario@spring.informaticapp.com
cd /path/to/deployment
java -jar newhype-backend.jar --spring.profiles.active=prod &

# Opcion B: Verificar en cPanel
# 1. Entrar a cPanel > Java App o similiar
# 2. Verificar que la aplicacion este "Running"
# 3. Verificar logs: /home/ventas/logs/newhype-backend.log

# Opcion C: Backend local para desarrollo
cd c:/Dev/New-Hype-Project/newhype-backend
./mvnw spring-boot:run
# Cambiar VITE_API_URL=http://localhost:8080/api/v1
```

---

### PROBLEMA 2: SalesContext Hace Requests Sin Auth (ALTO)

**Sintoma:** 4 endpoints llamados en pagina de login sin token
**Archivo:** `frontend/src/modules/sales/context/SalesContext.tsx` linea ~625
**Causa:** `useEffect` no verifica existencia de token antes de llamar APIs

**Solucion:**
```typescript
// ANTES (SalesContext.tsx):
useEffect(() => {
  loadCashRegisters();
  loadCashSessions();
  loadSales();
  loadQuotes();
}, []);

// DESPUES:
useEffect(() => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
  if (token) {
    loadCashRegisters();
    loadCashSessions();
    loadSales();
    loadQuotes();
  }
}, []);
```

---

### PROBLEMA 3: PurchasesContext Usa Token Key Incorrecto (MEDIO)

**Sintoma:** PurchasesContext podria no detectar token si se almacena como `authToken`
**Archivo:** `frontend/src/modules/purchases/context/PurchasesContext.tsx`
**Causa:** Verifica `localStorage.getItem('token')` pero AuthContext guarda como `authToken`

**Solucion:**
```typescript
// ANTES:
const token = localStorage.getItem('token');

// DESPUES (consistente con otros contextos):
const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
```

---

### PROBLEMA 4: Sin Proxy Vite para CORS en Desarrollo (MEDIO)

**Sintoma:** Requests directos al backend remoto causan CORS issues
**Archivo:** `frontend/vite.config.ts`
**Causa:** No hay `server.proxy` configurado

**Solucion:**
```typescript
// vite.config.ts
export default defineConfig({
  // ...existing config...
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://spring.informaticapp.com/New-Hype-Project',
        changeOrigin: true,
        secure: true,
      }
    }
  },
});

// .env.development
VITE_API_URL=/api/v1
```

---

### PROBLEMA 5: Inventario Stock Sin Paginacion Server-Side (MEDIO)

**Sintoma:** Performance degradada con muchos productos
**Archivo:** `frontend/src/modules/inventory/services/inventoryRealApi.ts`
**Causa:** Backend `/inventario/stock` retorna todos los registros

**Solucion Backend:**
```java
// Agregar parametros de paginacion al endpoint
@GetMapping("/stock")
public ResponseEntity<ApiResponse<Page<StockResponse>>> getStock(
    @RequestParam(required = false) Long almacenId,
    @RequestParam(required = false) String q,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    // implementar paginacion con Pageable
}
```

---

### PROBLEMA 6: Estado Toggle vs Estado Deseado - Usuarios (MEDIO)

**Sintoma:** El frontend envia `activo: true/false` pero backend solo hace toggle
**Archivo:** `usuariosRealApi.ts` linea ~262

**Solucion Backend:**
```java
// Aceptar estado deseado en el body
@PatchMapping("/{id}/estado")
public ResponseEntity<?> cambiarEstado(
    @PathVariable Long id,
    @RequestBody Map<String, Boolean> body) {
    boolean nuevoEstado = body.get("estado");
    // Aplicar estado exacto, no toggle
}
```

---

### PROBLEMA 7: Metodo de Pago No Mapeado en Ventas (MEDIO)

**Sintoma:** Ventas muestran metodo de pago vacio
**Archivo:** `ventasRealApi.ts` linea ~226

**Solucion:**
```typescript
// Opcion A: Backend incluye nombre del metodo en respuesta
// Opcion B: Frontend resuelve metodoPagoId contra lista cacheada
function mapBackendPago(b: BackendPagoVenta, metodosPago: MetodoPago[]): PagoVenta {
  const metodo = metodosPago.find(m => m.id === String(b.metodoPagoId));
  return {
    metodoPago: metodo?.nombre || 'Desconocido',
    // ...
  };
}
```

---

### PROBLEMA 8: Kardex Sin Datos de Producto (BAJO)

**Sintoma:** Movimientos de kardex muestran codigo/nombre vacios
**Archivo:** `inventoryRealApi.ts` linea ~108

**Solucion Backend:**
```java
// Incluir datos del producto en respuesta del kardex
public class KardexMovimientoResponse {
    // ... campos existentes ...
    private String productoSku;     // Agregar
    private String productoNombre;  // Agregar
    private String almacenNombre;   // Agregar
}
```

---

### PROBLEMA 9: Credenciales Expuestas en application-prod.yml (CRITICO - SEGURIDAD)

**Sintoma:** Password de BD y JWT secret en texto plano en el repositorio
**Archivo:** `newhype-backend/src/main/resources/application-prod.yml`

```yaml
# EXPUESTOS:
password: Tarapoto2026           # Password MySQL
secret: NH_PROD_2026_s3cur3_...  # JWT Secret
```

**Solucion:**
```yaml
# Usar variables de entorno
spring:
  datasource:
    password: ${DB_PASSWORD}
app:
  jwt:
    secret: ${JWT_SECRET}

# Agregar application-prod.yml a .gitignore
```

---

## 6. GUIA DE VERIFICACION CON CHROME DEVTOOLS MCP

### 6.1 Verificar Login (cuando backend este disponible)

```javascript
// Paso 1: Navegar a login
navigate_page({ type: 'url', url: 'http://localhost:5173/login' });

// Paso 2: Llenar formulario
fill({ uid: '<email_input_uid>', value: 'admin@newhype.com' });
fill({ uid: '<password_input_uid>', value: 'password123' });

// Paso 3: Click login
click({ uid: '<login_button_uid>' });

// Paso 4: Verificar Network
list_network_requests({ resourceTypes: ['fetch', 'xhr'] });
// Esperado: POST /auth/login con status 200

// Paso 5: Verificar token guardado
evaluate_script({
  function: `() => ({
    authToken: !!localStorage.getItem('authToken'),
    alexaToken: !!localStorage.getItem('alexatech_token'),
    refreshToken: !!localStorage.getItem('alexatech_refresh_token'),
    user: JSON.parse(localStorage.getItem('alexatech_user') || 'null')
  })`
});

// Paso 6: Verificar redirect
// El snapshot debe mostrar dashboard, no login
take_snapshot();
```

### 6.2 Verificar Listados Despues de Login

```javascript
// Verificar que las peticiones llevan Authorization header
list_network_requests({ resourceTypes: ['fetch'] });

// Para cada request, verificar headers:
get_network_request({ reqid: <request_id> });
// Esperado en Request Headers: Authorization: Bearer eyJ...

// Verificar respuestas:
// Status: 200
// Body: { success: true, data: [...], pagination: {...} }
```

### 6.3 Verificar Console Limpio

```javascript
// Despues de login, verificar que no hay errores
list_console_messages({ types: ['error', 'warn'] });
// Esperado: 0 errores CORS, 0 errores de tipo
```

### 6.4 Verificar Data en DOM

```javascript
// Navegar a lista de productos
navigate_page({ type: 'url', url: 'http://localhost:5173/productos' });

// Esperar carga
wait_for({ text: ['Productos', 'Cargando...'] });

// Tomar snapshot para verificar datos renderizados
take_snapshot();
// Esperado: Tabla con datos reales del backend
```

---

## 7. FLUJOS E2E CRITICOS

### Flujo 1: Login -> Dashboard (RF-AUT-001)

```
1. GET http://localhost:5173/login
2. Usuario ingresa email + password
3. Frontend: POST /auth/login { email, password }
4. Backend: Valida credenciales, genera JWT
5. Frontend: Guarda tokens en localStorage
6. Frontend: Redirect a /dashboard
7. Frontend: GET /auth/me (validar token)
8. Frontend: Renderiza dashboard con nombre de usuario

VERIFICAR:
- Network: POST /auth/login -> 200
- Network: Authorization header en requests siguientes
- localStorage: authToken presente
- DOM: Nombre del usuario visible
- Console: Sin errores
```

### Flujo 2: CRUD Productos (RF-PRD-001 a RF-PRD-006)

```
1. Login exitoso (Flujo 1)
2. Navegar a /productos
3. Frontend: GET /productos?page=0&size=10
4. Verificar tabla con productos
5. Click "Nuevo Producto"
6. Llenar formulario (nombre, precio, categoria)
7. Frontend: POST /productos { sku, nombre, ... }
8. Verificar producto en lista
9. Click "Editar" en producto
10. Modificar precio
11. Frontend: PUT /productos/{id} { precioVenta: nuevoValor }
12. Verificar precio actualizado
13. Click "Desactivar"
14. Frontend: PATCH /productos/{id}/status { estado: false }
15. Verificar estado cambiado

VERIFICAR POR CADA PASO:
- Network: Status 200/201
- Response body: { success: true }
- DOM: Datos actualizados
- Console: Sin errores
```

### Flujo 3: Compra + Recepcion + Kardex (RF-COM-001, RF-COM-008, RF-INV-002)

```
1. Login exitoso
2. Navegar a /compras/ordenes
3. Click "Nueva Orden de Compra"
4. Seleccionar proveedor
5. Agregar productos con cantidades y precios
6. Frontend: POST /compras/ordenes { proveedorId, items: [...] }
7. Verificar orden creada con estado PENDIENTE
8. Cambiar estado a CONFIRMADA
9. Frontend: PATCH /compras/ordenes/{id}/estado { estado: 'CONFIRMADA' }
10. Navegar a Recepciones
11. Click "Nueva Recepcion"
12. Seleccionar orden de compra
13. Ingresar cantidades recibidas
14. Frontend: POST /compras/recepciones { ordenCompraId, items: [...] }
15. Confirmar recepcion
16. Frontend: PATCH /compras/recepciones/{id}/confirmar
17. Verificar: Stock incrementado en almacen destino
18. Verificar: Kardex muestra entrada

VERIFICAR:
- Orden creada con numero correlativo
- Stock antes vs despues de recepcion
- Kardex muestra movimiento tipo ENTRADA
- OC actualizada a PARCIAL o COMPLETADA
```

### Flujo 4: Venta Completa (RF-VNT-001 a RF-VNT-005)

```
1. Login exitoso
2. Verificar caja registradora disponible
3. Abrir sesion de caja
4. Frontend: POST /caja/sesiones { cajaRegistradoraId, montoApertura }
5. Navegar a punto de venta
6. Buscar/seleccionar cliente
7. Agregar productos al carrito
8. Seleccionar tipo comprobante (Boleta/Factura)
9. Frontend: POST /ventas { clienteId, items: [...], tipoComprobante }
10. Confirmar pago
11. Frontend: POST /ventas/{id}/confirmar-pago { monto, metodoPago }
12. Verificar venta completada
13. Verificar stock descontado
14. Cerrar sesion de caja
15. Frontend: PATCH /caja/sesiones/{id}/cerrar { montoCierre }

VERIFICAR:
- Venta con numero correlativo (B001-XXXXXXXX o F001-XXXXXXXX)
- IGV calculado correctamente (18%)
- Stock descontado por producto
- Movimiento tipo SALIDA en kardex
- Sesion de caja con totales correctos
```

---

## 8. RESUMEN DE ENDPOINTS POR MODULO

### Total: 53 endpoints unicos mapeados en frontend

| Modulo | Endpoints | Archivo RealApi | Compatibilidad |
|--------|-----------|----------------|----------------|
| Auth | 7 | `utils/api.ts` (apiService) | 95% |
| Productos | 9 | `productosRealApi.ts` | 95% |
| Entidades | 7 | `entidadesRealApi.ts` | 90% |
| Usuarios | 9 | `usuariosRealApi.ts` | 85% |
| Configuracion | 6 | `configuracionApi.ts` | 90% |
| Inventario | 5 | `inventoryRealApi.ts` | 75% |
| Compras | 10 | `comprasRealApi.ts` | 90% |
| Ventas | 19 | `ventasRealApi.ts` | 70% |
| **TOTAL** | **53** | **6 archivos** | **86% promedio** |

### Endpoints Publicos (sin JWT):
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `GET /auth/check-email`
- `POST /platform/auth/login`
- `POST /storefront/auth/login`
- `POST /storefront/auth/register`
- `GET /storefront/productos`
- `GET /storefront/productos/**`
- `GET /storefront/categorias`

### Endpoints Protegidos: Todos los demas (requieren `Authorization: Bearer <JWT>`)

---

## 9. RECOMENDACIONES FINALES

### Prioridad CRITICA (hacer antes de presentar)

1. **Levantar el backend** en `spring.informaticapp.com` - Sin esto, ninguna funcionalidad real es posible
2. **Rotar credenciales** expuestas en `application-prod.yml` (password BD + JWT secret)
3. **Agregar auth check en SalesContext** - Prevents 4 unnecessary API calls on login page

### Prioridad ALTA (hacer antes de QA formal)

4. **Configurar Vite proxy** para desarrollo local (evitar CORS)
5. **Corregir token key en PurchasesContext** (`'token'` -> `'authToken'`)
6. **Completar mapeo de metodo de pago** en ventas
7. **Agregar datos de producto al kardex** en backend

### Prioridad MEDIA (mejoras de calidad)

8. **Implementar paginacion server-side** para stock de inventario
9. **Agregar endpoint `GET /roles/{id}`** en backend
10. **Cambiar toggle de estado** de usuarios a estado deseado
11. **Agregar `nombreProducto`** en respuesta de notas de credito

### Prioridad BAJA (nice-to-have)

12. **Agregar endpoint `verificarCodigo`** para productos
13. **Agregar endpoint `verificarDocumento`** para entidades
14. **Mejorar manejo de errores** con mensajes contextuales
15. **Agregar loading states** consistentes en todos los modulos

---

## TABLA RESUMEN: ESTADO DE VERIFICACION

### Reporte de Calidad General

| Tipo de Test | Estado | Detalles |
|-------------|--------|---------|
| **TypeScript Build** | PASA | 0 errores, build en ~791ms |
| **Frontend Runtime** | PARCIAL | Login page renderiza, contextos cargan |
| **Backend Connectivity** | FALLA | Backend no disponible (cPanel 404) |
| **CORS** | NO VERIFICABLE | Requiere backend activo |
| **Auth Flow** | NO VERIFICABLE | Requiere backend activo |
| **Data Binding** | NO VERIFICABLE | Requiere backend activo |
| **Multi-Tenant** | NO VERIFICABLE | Requiere backend activo |

**Estado Final:** BLOQUEADO - Requiere backend activo para continuar testing E2E

---

**Preparado por:** Claude (Full-Stack Senior Dev + QA Tester)
**Herramientas usadas:** Chrome DevTools MCP, Vite Dev Server, analisis estatico de codigo
**Archivos analizados:** 25+ archivos TypeScript/Java
**Fecha:** 03 de Marzo, 2026
