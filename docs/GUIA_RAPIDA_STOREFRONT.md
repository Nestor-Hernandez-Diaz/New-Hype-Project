# 🛍️ GUÍA RÁPIDA - STOREFRONT (Cliente Final)

## 📋 TABLA DE CONTENIDOS
1. [Endpoints Públicos (sin token)](#endpoints-públicos)
2. [Endpoints Privados (requieren token)](#endpoints-privados)
3. [Cómo obtener el token JWT](#cómo-obtener-token)
4. [Estructura de archivos del Storefront](#estructura-de-archivos)
5. [Pruebas con Postman](#pruebas-con-postman)

---

## 🌐 ENDPOINTS PÚBLICOS (Sin token necesario)

### **Base URL**: `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`

| # | Método | Endpoint | Descripción |
|---|--------|----------|-------------|
| 1 | GET | `/storefront/catalogo` | Ver catálogo de productos |
| 2 | GET | `/storefront/productos/{slug}` | Ver detalle de producto |
| 3 | POST | `/storefront/auth/register` | Registrar usuario nuevo |
| 4 | POST | `/storefront/auth/login` | Iniciar sesión |

### **Ejemplos de uso:**

#### 1️⃣ Ver Catálogo (Público)
```http
GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/catalogo?tenantId=1&page=0&size=20
```

**Query params opcionales:**
- `tenantId=1` (OBLIGATORIO)
- `generoId=1` (1=Hombre, 2=Mujer)
- `categoriaId=3`
- `soloLiquidacion=true`
- `busqueda=polo`

#### 2️⃣ Detalle de Producto (Público)
```http
GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/productos/polo-claudio-street-black?tenantId=1
```

#### 3️⃣ Registrar Usuario (Público)
```http
POST http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/auth/register
Content-Type: application/json

{
  "tenantId": 1,
  "email": "cliente@test.com",
  "password": "123456",
  "nombre": "Alex",
  "apellido": "Junior",
  "telefono": "987654321"
}
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Usuario registrado correctamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "scope": "STOREFRONT",
    "user": {
      "id": 15,
      "email": "cliente@test.com",
      "nombre": "Alex",
      "apellido": "Junior",
      "rol": "CUSTOMER",
      "tenantId": 1
    }
  }
}
```

#### 4️⃣ Login (Público)
```http
POST http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/auth/login
Content-Type: application/json

{
  "tenantId": 1,
  "email": "cliente@test.com",
  "password": "123456"
}
```

**Respuesta:** (igual que el registro, devuelve el token)

---

## 🔐 ENDPOINTS PRIVADOS (Requieren token JWT)

**Headers necesarios:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

| # | Método | Endpoint | Descripción |
|---|--------|----------|-------------|
| 1 | GET | `/storefront/perfil` | Ver mi perfil |
| 2 | PUT | `/storefront/perfil` | Editar mi perfil |
| 3 | POST | `/storefront/pedidos` | Crear pedido |
| 4 | GET | `/storefront/pedidos` | Listar mis pedidos |
| 5 | GET | `/storefront/pedidos/{id}` | Ver detalle de pedido |
| 6 | PUT | `/storefront/pedidos/{id}/cancelar` | Cancelar pedido |

### **Ejemplos de uso:**

#### 5️⃣ Ver Mi Perfil (Privado)
```http
GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/perfil
Authorization: Bearer TU_TOKEN_AQUI
```

#### 6️⃣ Editar Perfil (Privado)
```http
PUT http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/perfil
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json

{
  "nombre": "Alex Junior",
  "apellido": "Claudio",
  "telefono": "999888777"
}
```

#### 7️⃣ Crear Pedido (Privado)
```http
POST http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/pedidos
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json

{
  "tenantId": 1,
  "detalles": [
    {
      "productoId": 1,
      "tallaId": 1,
      "colorId": 1,
      "cantidad": 2,
      "precioUnitario": 86.90
    }
  ],
  "subtotal": 173.80,
  "igv": 31.28,
  "total": 205.08,
  "direccionEnvio": "Av. Los Pinos 123, San Isidro",
  "instrucciones": "Tocar timbre 2 veces",
  "tipoEnvio": "DOMICILIO",
  "metodoPagoId": 1
}
```

#### 8️⃣ Listar Mis Pedidos (Privado)
```http
GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/pedidos?tenantId=1&page=0&size=10
Authorization: Bearer TU_TOKEN_AQUI
```

#### 9️⃣ Ver Detalle de Pedido (Privado)
```http
GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/pedidos/3?tenantId=1
Authorization: Bearer TU_TOKEN_AQUI
```

#### 🔟 Cancelar Pedido (Privado)
```http
PUT http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/pedidos/3/cancelar?tenantId=1
Authorization: Bearer TU_TOKEN_AQUI
```

---

## 🔑 CÓMO OBTENER TOKEN JWT

### **Paso 1: Registrar o hacer Login**
```bash
# Opción A: Registro
curl -X POST http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/auth/register \
  -H "Content-Type: application/json" \
  -d '{"tenantId":1,"email":"test@mail.com","password":"123456","nombre":"Test","apellido":"User","telefono":"999999999"}'

# Opción B: Login
curl -X POST http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenantId":1,"email":"test@mail.com","password":"123456"}'
```

### **Paso 2: Copiar el accessToken de la respuesta**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNSIsImVtYWlsIjoidGVzdEBtYWlsLmNvbSIsInJvbCI6IkNVU1RPTUVSIiwidGVuYW50SWQiOjEsInNjb3BlIjoiU1RPUkVGUk9OVCIsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxNzEwMDg2NDAwfQ.abc123..."
  }
}
```

### **Paso 3: Usar el token en los headers**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📁 ESTRUCTURA DE ARCHIVOS DEL STOREFRONT

### **Directorio:** `frontend/src/modules/storefront/`

```
storefront/
├── components/          # Componentes reutilizables
│   ├── auth/           # Login, Register, Google OAuth
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── layout/         # Navbar, Footer, MobileMenu
│   │   ├── Navbar.tsx           ← Menú con filtrado por género
│   │   ├── MobileMenu.tsx
│   │   └── Footer.tsx
│   ├── product/        # ProductCard, ProductGrid
│   ├── cart/           # Carrito de compras
│   └── filters/        # FilterChip (botones de categorías)
│
├── context/            # Estado global del storefront
│   └── StorefrontContext.tsx    ← Carrito, productos, favoritos
│
├── hooks/              # Custom hooks
│   ├── useAuth.ts              ← Login, Register, Logout (JWT)
│   └── useScrollAnimation.ts
│
├── pages/              # Páginas principales
│   ├── Login.tsx               ← Login con Google OAuth
│   ├── Register.tsx            ← Registro con Google OAuth
│   ├── RecoverAccount.tsx      ← Recuperación con Google
│   ├── Home.tsx                ← Página principal
│   ├── Catalog.tsx             ← Catálogo con filtros por género
│   ├── ProductDetail.tsx       ← Detalle de producto
│   ├── Checkout.tsx            ← Proceso de compra
│   ├── Orders.tsx              ← Mis pedidos
│   ├── OrderDetail.tsx         ← Detalle de pedido (timeline corregido)
│   └── Profile.tsx             ← Mi perfil
│
└── services/           # API calls
    ├── storefrontApi.ts        ← Todas las llamadas al backend
    └── storefrontFetch.ts      ← Wrapper de fetch con JWT
```

### **Archivos clave y sus funciones:**

#### **1. `services/storefrontFetch.ts`**
- Wrapper de `fetch` que agrega automáticamente el token JWT
- Funciones: `getSfToken()`, `setSfToken()`, `clearSfToken()`
- Maneja errores 401 (no autenticado)

#### **2. `services/storefrontApi.ts`**
- Funciones para consumir cada endpoint del backend
- Ejemplos:
  - `apiObtenerCatalogo()` → GET /storefront/catalogo
  - `apiCrearPedido()` → POST /storefront/pedidos
  - `apiObtenerPedido()` → GET /storefront/pedidos/{id}

#### **3. `hooks/useAuth.ts`**
- Hook personalizado para autenticación
- Funciones:
  - `login(email, password)` → Inicia sesión
  - `register(datos)` → Registra usuario
  - `logout()` → Cierra sesión
  - `estaAutenticado` → Boolean
  - `usuario` → Datos del usuario actual

#### **4. `context/StorefrontContext.tsx`**
- Estado global del storefront
- Maneja:
  - Carrito de compras (`state.carrito`)
  - Productos (`state.productos`)
  - Favoritos (`state.favoritos`)
  - Modales (carrito, búsqueda, menú móvil)

#### **5. `components/layout/Navbar.tsx`**
- Barra de navegación principal
- Filtrado dinámico de categorías por género
- Integración con Google OAuth

#### **6. `pages/Login.tsx` y `Register.tsx`**
- Formularios con integración de Google OAuth
- Flujo: Login → Si falla → Auto-registro
- Guarda token en localStorage: `nh_token_storefront`

#### **7. `pages/OrderDetail.tsx`**
- Muestra detalle del pedido
- Timeline de estados (CONFIRMADO → PREPARANDO → ENVIADO → ENTREGADO)
- Sincronizado con estado del backend

---

## 🧪 PRUEBAS CON POSTMAN

### **Colección: NEW HYPE - Storefront**

#### **Variables de entorno:**
```json
{
  "base_url": "http://spring.informaticapp.com:5001/New-Hype-Project/api/v1",
  "tenant_id": "1",
  "token": ""
}
```

### **Flujo de pruebas recomendado:**

#### **📝 Test 1: Registro de usuario**
```
POST {{base_url}}/storefront/auth/register
Body (raw JSON):
{
  "tenantId": {{tenant_id}},
  "email": "prueba{{$timestamp}}@mail.com",
  "password": "123456",
  "nombre": "Usuario",
  "apellido": "Prueba",
  "telefono": "987654321"
}

Tests (Scripts):
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.data.accessToken);
```

#### **🔓 Test 2: Ver catálogo (público)**
```
GET {{base_url}}/storefront/catalogo?tenantId={{tenant_id}}&page=0&size=20
```

#### **🔒 Test 3: Ver perfil (privado)**
```
GET {{base_url}}/storefront/perfil
Headers:
  Authorization: Bearer {{token}}
```

#### **🛒 Test 4: Crear pedido (privado)**
```
POST {{base_url}}/storefront/pedidos
Headers:
  Authorization: Bearer {{token}}
Body (raw JSON):
{
  "tenantId": {{tenant_id}},
  "detalles": [
    {
      "productoId": 1,
      "tallaId": 1,
      "colorId": 1,
      "cantidad": 1,
      "precioUnitario": 86.90
    }
  ],
  "subtotal": 86.90,
  "igv": 15.64,
  "total": 102.54,
  "direccionEnvio": "Retiro en tienda — Tienda",
  "tipoEnvio": "RETIRO_TIENDA",
  "metodoPagoId": 1
}
```

#### **📋 Test 5: Listar mis pedidos (privado)**
```
GET {{base_url}}/storefront/pedidos?tenantId={{tenant_id}}
Headers:
  Authorization: Bearer {{token}}
```

---

## 🎯 LO QUE DEBERÍAS SABER PARA LA EXPO

### **Frontend (React)**
1. ✅ Cómo funciona el login con JWT (useAuth hook)
2. ✅ Cómo se almacena el token (localStorage: `nh_token_storefront`)
3. ✅ Diferencia entre endpoints públicos y privados
4. ✅ Cómo el Navbar filtra categorías por género
5. ✅ Flujo de Google OAuth (Login → Auto-registro si falla)
6. ✅ Timeline de estados de pedido (CONFIRMADO → ENTREGADO)

### **Backend (Spring Boot)**
1. ✅ Base URL: `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`
2. ✅ Autenticación: JWT con expiración de 24 horas
3. ✅ Multi-tenancy: Siempre enviar `tenantId=1`
4. ✅ Endpoints públicos: `/storefront/catalogo`, `/storefront/auth/*`
5. ✅ Endpoints privados: `/storefront/perfil`, `/storefront/pedidos`

### **Conceptos clave**
- **JWT (JSON Web Token)**: Token de autenticación que expira en 24h
- **Multi-tenancy**: Sistema soporta múltiples tiendas (tenantId)
- **Slug**: URL amigable (ejemplo: `polo-claudio-street-black`)
- **OAuth2**: Inicio de sesión con Google (sin contraseña)
- **localStorage**: Almacenamiento del token en el navegador

---

## 🚀 TIPS PARA LA PRESENTACIÓN

1. **Demostrar flujo completo:**
   - Registro/Login → Ver catálogo → Agregar al carrito → Checkout → Ver pedido

2. **Mostrar Google OAuth:**
   - Click en "Continuar con Google" → Auto-registro → Acceso inmediato

3. **Explicar filtrado por género:**
   - Navbar muestra solo categorías relevantes (hombre vs mujer)

4. **Timeline de pedido:**
   - Crear pedido → Admin cambia estado → Cliente ve actualización

5. **Postman (opcional):**
   - Mostrar endpoints públicos y privados
   - Demostrar cómo el token da acceso a rutas protegidas

---

**¡Éxito en tu exposición! 🎓✨**
