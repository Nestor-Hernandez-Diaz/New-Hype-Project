# Reporte E2E — Storefront New Hype

**Fecha:** 2026-03-05
**Entorno:** `http://localhost:5173/storefront` (Vite Dev Server)
**Backend:** `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`
**Herramientas:** Chrome DevTools MCP (Network, Console, DOM Snapshots)

---

## Resumen Ejecutivo

| Test | Estado | Bugs Encontrados | Bugs Corregidos |
|------|--------|-----------------|-----------------|
| 1. Catálogo público | PASS | 2 | 2 |
| 2. Detalle de producto | PASS | 1 | 1 |
| 3. Carrito de compras | PASS | 1 | 1 |
| 4. Login / Registro | PASS | 4 | 4 |
| 5. Checkout / Crear pedido | PASS | 1 | 1 |
| 6. Mis pedidos | PASS | 2 | 2 |
| **TOTAL** | **6/6 PASS** | **11** | **11** |

**Cobertura general:** 100% de los flujos E2E del checklist verificados y corregidos.

---

## E2E Test 1: Catálogo Público

**Ruta:** `GET /storefront/productos?tenantId=1&page=0&size=50`

### Verificaciones
- [x] Página carga correctamente en `/storefront/catalogo`
- [x] API retorna `200 OK` con productos reales del backend
- [x] Productos muestran nombre, precio, imagen, badge "Nuevo"
- [x] Filtros por categoría funcionan (Camisetas, Pantalones, etc.)
- [x] Barra de búsqueda funcional
- [x] Sin errores en consola (salvo `/cotizaciones` 500 del módulo admin)

### Bugs Encontrados y Corregidos

#### Bug 1.1: Loop infinito — 584 llamadas API
- **Archivo:** `StorefrontContext.tsx`
- **Causa raíz:** La función `cargarProductos` se recreaba en cada render, disparando el `useEffect` infinitamente
- **Fix:** Envolver `cargarProductos` en `useCallback` para estabilizar su identidad referencial
- **Impacto:** Crítico — bloqueaba el uso del catálogo

#### Bug 1.2: Imágenes de productos rotas
- **Archivo:** `ProductCard.tsx`
- **Causa raíz:** La API no retorna `imagenUrl` en el endpoint de catálogo; fallback apuntaba a URLs inexistentes
- **Fix:** Cadena de fallback: `imagenUrl` → `imagenes[0]` → `/img/productos/{categoría}/` → placeholder Unsplash
- **Complemento:** Se copiaron assets de `_storefront_external/` a `frontend/public/img/productos/`

---

## E2E Test 2: Detalle de Producto por Slug

**Ruta:** `GET /storefront/productos/{slug}?tenantId=1`

### Verificaciones
- [x] Navegación por slug funcional (`/storefront/producto/polo-graphic-street`)
- [x] API retorna `200 OK` con datos del producto
- [x] Nombre, precio, SKU, descripción, categoría visibles
- [x] Imagen principal carga correctamente
- [x] Sección "También te puede gustar" muestra productos relacionados
- [x] Breadcrumb funcional (Inicio / Catálogo / Producto)

### Bug Corregido

#### Bug 2.1: RelatedProducts import roto
- **Archivo:** `RelatedProducts.tsx`
- **Causa raíz:** Importaba `obtenerProductos` de `storefrontApi.ts` con firma antigua (pre-rewrite)
- **Fix:** Actualizar import y llamada para usar la nueva firma con `SpringPageable`

---

## E2E Test 3: Carrito de Compras

**Flujo:** Agregar → Modificar cantidad → Eliminar

### Verificaciones
- [x] Botón "AGREGAR AL CARRITO" funciona
- [x] Toast de confirmación aparece: "Polo Graphic Street agregado al carrito"
- [x] Sidebar del carrito muestra producto, precio, cantidad
- [x] Incrementar cantidad: `Tu Carrito (2)`, S/ 139.80
- [x] Decrementar cantidad: `Tu Carrito (1)`, S/ 69.90
- [x] Eliminar producto: "Tu carrito está vacío"
- [x] Sin errores en consola

### Bug Corregido

#### Bug 3.1: Agregar al carrito falla silenciosamente
- **Archivo:** `StorefrontContext.tsx:242`
- **Causa raíz:** Guard clause `if (!producto || !producto.stockTotal || ...)` — como la API no retorna `stockTotal`, `!undefined === true`, rechazando siempre la operación
- **Fix:** Cambiar a `if (!producto || producto.stockTotal === 0)`
- **Impacto:** Crítico — el carrito era completamente inoperable

---

## E2E Test 4: Login / Registro Cliente

**Rutas:** `POST /storefront/auth/login`, `POST /storefront/auth/register`

### Verificaciones
- [x] Registro con datos nuevos → `200 OK`, JWT almacenado en `nh_token_storefront`
- [x] Login con credenciales válidas → `200 OK`, token JWT correcto
- [x] Login con credenciales inválidas → `401 Unauthorized`, mensaje "Credenciales inválidas"
- [x] Perfil muestra datos reales del usuario autenticado
- [x] Logout limpia token y redirige a login
- [x] Flujo completo: Register → Logout → Login → Profile verificado

### Bugs Corregidos

#### Bug 4.1: Login.tsx 100% mock
- **Archivo:** `Login.tsx`
- **Causa raíz:** `setTimeout` simulaba login exitoso sin llamar al backend. Comentario `// TODO: Implementar llamada real al backend`
- **Fix:** Reemplazar mock con `useAuth().login(email, password)`

#### Bug 4.2: Register.tsx 100% mock
- **Archivo:** `Register.tsx`
- **Causa raíz:** Mismo patrón mock con `setTimeout`, guardaba token falso en `nh_cliente_token`
- **Fix:** Reemplazar con `useAuth().register(datos)`

#### Bug 4.3: CORS error en POST /storefront/auth/login
- **Archivo:** `useAuth.ts`
- **Error:** `Request header field x-tenantid is not allowed by Access-Control-Allow-Headers`
- **Causa raíz:** `storefrontAuthFetch` enviaba header custom `X-TenantId` que el backend no incluye en CORS `Access-Control-Allow-Headers`. El `tenantId` ya va en el body del request.
- **Fix:** Cambiar `storefrontAuthFetch` → `storefrontFetch` para login y register

#### Bug 4.4: Profile.tsx redirige a login antes de que useAuth inicialice
- **Archivo:** `Profile.tsx`
- **Causa raíz:** `useEffect` verificaba `!estaAutenticado` antes de que `useAuth` terminara de leer el token de localStorage (`cargando` aún era `true`)
- **Fix:** Agregar guard `if (authCargando) return;` antes del check de autenticación
- **Complemento:** También se reemplazó todo el mock de Profile (actualizar perfil, cambiar contraseña, logout) con llamadas reales a `useAuth()`

---

## E2E Test 5: Checkout / Crear Pedido

**Flujo:** Carrito → Checkout (Envío) → Checkout (Pago) → Confirmación

### Verificaciones
- [x] Formulario de envío con todos los campos (nombre, apellido, email, teléfono, dirección, departamento, provincia, distrito)
- [x] Validación de campos obligatorios funciona
- [x] Selección de tipo de envío: Domicilio (S/ 9.90) vs Tienda (Gratis)
- [x] Paso 2: Métodos de pago (Efectivo, Tarjeta, Yape, Plin, Transferencia)
- [x] Resumen del pedido correcto (producto, cantidad, subtotal, envío, total)
- [x] Pedido guardado en localStorage bajo key `nh_pedidos`
- [x] Página de confirmación muestra todos los datos del pedido
- [x] Código de pedido generado: `NH-YYYYMMDD-XXX`

### Bug Corregido

#### Bug 5.1: Checkout redirige a home en vez de confirmación
- **Archivo:** `Checkout.tsx`
- **Causa raíz:** Race condition — `completarPedido()` llama `vaciarCarrito()` que vacía `state.carrito`, lo cual dispara el `useEffect` de línea 72 que detecta `carrito.length === 0` y redirige a `/storefront` **antes** de que `navigate('/storefront/confirmacion/...')` se ejecute
- **Fix:** Agregar flag `pedidoCompletado` → `setPedidoCompletado(true)` antes de vaciar el carrito, y condicionar el useEffect: `if (state.carrito.length === 0 && !pedidoCompletado)`

### Nota: Backend pendiente
- **No existe** endpoint `POST /storefront/pedidos` en el backend
- Checkout guarda pedidos en `localStorage` (mock funcional)
- **Recomendación:** Implementar endpoint Spring Boot para persistir pedidos en BD

---

## E2E Test 6: Mis Pedidos

**Ruta esperada:** `GET /storefront/pedidos` (pendiente de implementar)

### Verificaciones
- [x] Página carga en `/storefront/cuenta/pedidos` para usuarios autenticados
- [x] Muestra pedidos reales del localStorage (creados en checkout)
- [x] Cada pedido muestra: código, fecha, estado, total, cantidad de items
- [x] Búsqueda por código de pedido funcional
- [x] Filtros por estado (Todos, Pendientes, Enviados, Entregados)
- [x] Ordenamiento (fecha desc/asc, monto desc/asc)
- [x] Sidebar de navegación (Perfil, Pedidos, Favoritos, Cerrar Sesión)

### Bugs Corregidos

#### Bug 6.1: Token key mismatch — redirige a login siendo autenticado
- **Archivo:** `Orders.tsx:26`
- **Causa raíz:** Verificaba `localStorage.getItem('nh_cliente_token')` (mock antiguo), pero el sistema real usa `nh_token_storefront` vía `useAuth`
- **Fix:** Reemplazar auth check manual con `useAuth().estaAutenticado` + guard `authCargando`

#### Bug 6.2: Mock data hardcodeada con pedidos ficticios
- **Archivo:** `Orders.tsx:32-66`
- **Causa raíz:** `mockPedidos` array con 3 pedidos ficticios y `setTimeout` de 1.2s
- **Fix:** Leer pedidos de `localStorage('nh_pedidos')` con mapeo de campos del checkout, y usar `useAuth().logout()` en vez de limpiar keys manuales

### Nota: Backend pendiente
- Al igual que checkout, no existe endpoint `GET /storefront/pedidos`
- **Recomendación:** Implementar endpoint Spring Boot para consultar pedidos por cliente

---

## Archivos Modificados (Storefront)

| Archivo | Cambios |
|---------|---------|
| `StorefrontContext.tsx` | `useCallback` para `cargarProductos` + fix guard `stockTotal` |
| `ProductCard.tsx` | Cadena de fallback de imágenes |
| `RelatedProducts.tsx` | Fix import `obtenerProductos` nueva firma |
| `ProductDetail.tsx` | Fix llamada al detalle con nueva firma API |
| `storefrontApi.ts` | Rewrite completo: mock → API real con `storefrontFetch` |
| `useAuth.ts` | CORS fix: `storefrontAuthFetch` → `storefrontFetch` |
| `Login.tsx` | Mock → `useAuth().login()` |
| `Register.tsx` | Mock → `useAuth().register()` |
| `Profile.tsx` | Mock → `useAuth()` completo + fix timing `authCargando` |
| `Checkout.tsx` | Fix race condition redirect con flag `pedidoCompletado` |
| `Orders.tsx` | Token mismatch fix + mock → localStorage pedidos + `useAuth()` |

### Archivos Nuevos Creados (sesiones anteriores)

| Archivo | Propósito |
|---------|-----------|
| `storefrontFetch.ts` | HTTP client para storefront (base URL, tenant, auth headers) |
| `typeMappers.ts` | Mapeo `BackendProducto` → `Producto` (types internos) |
| `utils/imagenes.ts` | Resolución de imágenes con fallback chain |

---

## Hallazgos Adicionales

### Errores del Backend (no storefront)
- `GET /cotizaciones` retorna **500 Internal Server Error** — módulo admin, no afecta al storefront
- Se observan llamadas duplicadas a endpoints admin (`/ventas`, `/entidades`, `/productos`) al navegar por el storefront — posible leak de contexto entre módulos

### Datos inconsistentes de la API
- `disponible: false` en productos que el UI muestra como "10 disponibles" — `stockTotal` no viene del backend, se usa default
- Los productos relacionados muestran "Agotado" porque `disponible: false` en la API

---

## Recomendaciones Prioritarias

1. **Backend - Pedidos:** Implementar `POST /storefront/pedidos` y `GET /storefront/pedidos` para persistir órdenes en BD (actualmente localStorage)
2. **Backend - CORS:** Agregar `X-TenantId` a `Access-Control-Allow-Headers` para soportar `storefrontAuthFetch`
3. **Backend - Stock:** Retornar `stockTotal` real y `disponible: true` para productos con inventario
4. **Backend - Cotizaciones:** Investigar y corregir el error 500 en `GET /cotizaciones`
5. **Frontend - Favoritos:** El módulo favoritos está referenciado en sidebar pero no fue verificado en este checklist
6. **Frontend - Pedido Detalle:** La ruta `/storefront/cuenta/pedidos/:id` existe pero lee de localStorage — integrar con backend
