# Verificacion en Vivo - Frontend 100% Conectado a la API del cPanel

**Proyecto:** New Hype ERP
**Fecha:** 10 de Marzo de 2026
**Metodo:** Chrome DevTools > Network Tab (F12)
**URL Frontend:** `http://localhost:5173`
**URL API cPanel:** `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`

---

## 1. Configuracion Verificada

| Archivo | Variable | Valor |
|---------|----------|-------|
| `frontend/.env` | `VITE_API_URL` | `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1` |
| `frontend/.env.development` | `VITE_API_URL` | `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1` |

---

## 2. Paso a Paso para la Demostracion (Guia para el alumno)

### Preparacion
1. Abre una terminal y ejecuta `cd frontend && npm run dev`
2. Abre **Google Chrome** y navega a `http://localhost:5173`
3. Presiona **F12** para abrir DevTools
4. Ve a la pestana **Network**
5. Marca la casilla **"Preserve log"** (para mantener el historial entre navegaciones)
6. Filtra por **Fetch/XHR** para ver solo las llamadas a la API
7. Haz clic en el boton **Clear** (icono de prohibido) para limpiar el registro

### Demostracion de Login
8. En la pagina de Login, ingresa:
   - **Correo:** `admin@newhype-store.pe`
   - **Contrasena:** `Admin2026`
9. Haz clic en **"Ingresar"**
10. **En la Network tab veras:** `POST http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/login` → Status **200**

### Navegacion por Modulos
11. **Dashboard** - Se carga automaticamente tras login
    - Senala las peticiones GET a `/configuracion/empresa`, `/ventas`, `/caja/sesiones`, `/inventario/alertas`
12. Haz clic en **"Lista de Productos"** en el sidebar
    - Senala: `GET .../productos?page=0&size=10` → 200
13. Haz clic en **"Realizar Venta"** (modulo POS)
    - Senala: `GET .../almacenes` → 200
14. Haz clic en **"Historial de Ventas"**
    - Senala: `GET .../ventas` → 200
15. Haz clic en **"Inventario > Stock"**
    - Senala: `GET .../inventario/stock` → 200, `GET .../almacenes` → 200
16. Haz clic en **"Inventario > Kardex"**
    - Senala: `GET .../inventario/kardex?page=0&size=20` → 200
17. Haz clic en **"Compras > Recepciones"**
    - Senala: `GET .../compras/recepciones?page=0&size=10` → 200
18. Haz clic en **"Compras > Ordenes de Compra"**
    - Senala: `GET .../compras/ordenes?page=0&size=10` → 200
19. Haz clic en **"Lista de Entidades"**
    - Senala: `GET .../entidades?page=0&size=10` → 200, `GET .../ubigeo/departamentos` → 200
20. Haz clic en **"Gestion de Caja"**
    - Senala: `GET .../caja/sesiones` → 200, `GET .../caja/sesiones/9/movimientos` → 200
21. Haz clic en **"Usuarios"**
    - Senala: `GET .../usuarios?estado=true&page=0&size=10` → 200
22. Haz clic en **"Configuracion > Empresa"**
    - Senala: `GET .../configuracion/empresa` → 200

### Cierre
23. Senala que **TODAS** las URLs en la columna "Name" del Network tab comienzan con `spring.informaticapp.com:5001`
24. Di: *"Como puede ver, el 100% de las peticiones se estan realizando correctamente a la URL del cPanel que nos indico."*

---

## 3. Resultados de la Navegacion en Vivo

| # | Accion Realizada | Endpoint(s) Clave | URL Destino | Status |
|---|------------------|--------------------|-------------|--------|
| 1 | **Login (Tenant Admin)** | `POST /auth/login` | `spring.informaticapp.com:5001` | 200 |
| 2 | **Dashboard** | `GET /configuracion/empresa`, `/ventas`, `/caja/sesiones`, `/inventario/alertas` | `spring.informaticapp.com:5001` | 200 |
| 3 | **Lista de Productos** | `GET /productos?page=0&size=10`, `/configuracion/categorias`, `/configuracion/unidades-medida` | `spring.informaticapp.com:5001` | 200 |
| 4 | **POS (Realizar Venta)** | `GET /almacenes`, `/productos`, `/entidades`, `/configuracion/metodos-pago` | `spring.informaticapp.com:5001` | 200 |
| 5 | **Historial de Ventas** | `GET /ventas`, `/entidades` | `spring.informaticapp.com:5001` | 200 |
| 6 | **Inventario - Stock** | `GET /inventario/stock`, `/almacenes` | `spring.informaticapp.com:5001` | 200 |
| 7 | **Inventario - Kardex** | `GET /inventario/kardex?page=0&size=20`, `/almacenes` | `spring.informaticapp.com:5001` | 200 |
| 8 | **Compras - Recepciones** | `GET /compras/recepciones?page=0&size=10`, `/almacenes?activo=true` | `spring.informaticapp.com:5001` | 200 |
| 9 | **Compras - Ordenes** | `GET /compras/ordenes?page=0&size=10`, `/almacenes?activo=true` | `spring.informaticapp.com:5001` | 200 |
| 10 | **Entidades Comerciales** | `GET /entidades?page=0&size=10`, `/ubigeo/departamentos` | `spring.informaticapp.com:5001` | 200 |
| 11 | **Gestion de Caja** | `GET /caja/sesiones`, `/caja/sesiones/9/movimientos`, `/caja/sesiones/9` | `spring.informaticapp.com:5001` | 200 |
| 12 | **Usuarios** | `GET /usuarios?estado=true&page=0&size=10`, `/roles` | `spring.informaticapp.com:5001` | 200 |
| 13 | **Configuracion Empresa** | `GET /configuracion/empresa` | `spring.informaticapp.com:5001` | 200 |
| 14 | **Storefront (Tienda)** | `GET /productos`, `/configuracion/categorias` | `spring.informaticapp.com:5001` | 200 |
| 15 | **Autenticacion JWT** | `GET /auth/me` | `spring.informaticapp.com:5001` | 200 |
| 16 | **Alertas de Inventario** | `GET /inventario/alertas` | `spring.informaticapp.com:5001` | 200 |
| 17 | **Cotizaciones** | `GET /cotizaciones`, `/cotizaciones?size=100` | `spring.informaticapp.com:5001` | 200 |
| 18 | **Roles y Permisos** | `GET /roles` | `spring.informaticapp.com:5001` | 200 |

---

## 4. Descripcion de lo que se ve en la Network Tab

### Al hacer Login:
- Se ve un `POST` a `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/login` con status **200**.
- En la pestana "Response" se observa el token JWT retornado por el servidor del cPanel.
- Inmediatamente despues, se disparan multiples `GET` para cargar los datos del dashboard, todos dirigidos a `spring.informaticapp.com:5001`.

### Al navegar por modulos:
- Cada vez que se entra a un modulo, en la columna **"Name"** de la Network Tab se ven URLs que comienzan con `spring.informaticapp.com:5001/New-Hype-Project/api/v1/...`
- Los requests de tipo **OPTIONS** (preflight CORS) tambien van al mismo servidor, confirmando que el CORS esta configurado correctamente en el backend.
- Todos los status codes son **200** (exitoso), confirmando autenticacion JWT + respuesta correcta del servidor.

### Lo que NO se ve:
- NO hay llamadas a `localhost:3000`, `localhost:8080`, ni a ningun otro servidor local.
- NO hay llamadas a APIs externas no autorizadas.
- Las unicas peticiones que NO van a `spring.informaticapp.com:5001` son:
  - `localhost:5173` → Archivos estaticos del dev server de Vite (JS, CSS, fuentes) - esto es normal.
  - `fonts.googleapis.com` → Google Fonts (fuentes tipograficas) - recurso externo estandar.
  - `accounts.google.com/gsi/client` → SDK de Google Sign-In (para login con Google) - recurso externo estandar.

---

## 5. Endpoints Unicos Detectados (API del cPanel)

Total de endpoints unicos consumidos por el frontend:

```
POST /auth/login
GET  /auth/me
GET  /roles
GET  /usuarios?page=0&size=10
GET  /usuarios?estado=true&page=0&size=10
GET  /productos?page=0&size=10
GET  /entidades?page=0&size=10
GET  /ventas
GET  /cotizaciones
GET  /cotizaciones?size=100
GET  /configuracion/empresa
GET  /configuracion/series-comprobantes
GET  /configuracion/metodos-pago
GET  /configuracion/cajas-registradoras
GET  /configuracion/categorias
GET  /configuracion/unidades-medida
GET  /caja/sesiones
GET  /caja/sesiones/{id}
GET  /caja/sesiones/{id}/movimientos
GET  /inventario/stock
GET  /inventario/kardex?page=0&size=20
GET  /inventario/alertas
GET  /almacenes
GET  /almacenes?activo=true
GET  /compras/ordenes?page=0&size=10
GET  /compras/recepciones?page=0&size=10
GET  /ubigeo/departamentos
```

**Base URL de todos:** `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`

---

## 6. Checklist Final

- [x] Variable `VITE_API_URL` en `.env` apunta a `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`
- [x] Variable `VITE_API_URL` en `.env.development` apunta a `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`
- [x] Login (POST /auth/login) → `spring.informaticapp.com:5001` → 200
- [x] Verificacion JWT (GET /auth/me) → `spring.informaticapp.com:5001` → 200
- [x] Productos → `spring.informaticapp.com:5001` → 200
- [x] Ventas (POS) → `spring.informaticapp.com:5001` → 200
- [x] Historial de Ventas → `spring.informaticapp.com:5001` → 200
- [x] Inventario Stock → `spring.informaticapp.com:5001` → 200
- [x] Inventario Kardex → `spring.informaticapp.com:5001` → 200
- [x] Compras - Recepciones → `spring.informaticapp.com:5001` → 200
- [x] Compras - Ordenes → `spring.informaticapp.com:5001` → 200
- [x] Entidades Comerciales → `spring.informaticapp.com:5001` → 200
- [x] Gestion de Caja → `spring.informaticapp.com:5001` → 200
- [x] Usuarios → `spring.informaticapp.com:5001` → 200
- [x] Configuracion Empresa → `spring.informaticapp.com:5001` → 200
- [x] Storefront → `spring.informaticapp.com:5001` → 200
- [x] Alertas de Inventario → `spring.informaticapp.com:5001` → 200
- [x] Cotizaciones → `spring.informaticapp.com:5001` → 200
- [x] CORS preflight (OPTIONS) → `spring.informaticapp.com:5001` → 200
- [x] 0 errores en consola del navegador
- [x] 0 llamadas a localhost, solo al servidor del cPanel
- [x] **100% de las llamadas API van al servidor del cPanel**

---

## 7. Arquitectura Confirmada

```
+----------------------------+          HTTP/JWT           +-------------------------------+
|   Frontend (React+Vite)    |  ========================>  |   Backend (Spring Boot)       |
|   localhost:5173            |                             |   spring.informaticapp.com    |
|                             |  POST /auth/login           |   Puerto: 5001                |
|   .env:                     |  GET  /productos            |   Context: /New-Hype-Project  |
|   VITE_API_URL=             |  GET  /ventas               |   DB: ventas_newhype_prod     |
|   http://spring.           |  GET  /inventario/stock      |   MySQL: localhost:3306       |
|   informaticapp.com:5001/  |  GET  /compras/recepciones   |                               |
|   New-Hype-Project/api/v1  |  GET  /caja/sesiones         |   Auth: JWT (24h exp)         |
+----------------------------+          27 endpoints        +-------------------------------+
```

---

## 8. Conclusion

> **"Como puede ver, todas las peticiones HTTP se estan realizando correctamente al servidor del cPanel (`spring.informaticapp.com:5001`). Se verificaron los 10+ modulos del sistema (Login, Productos, Ventas, Inventario, Compras, Usuarios, Caja, Configuracion, Storefront, Entidades) y el 100% de las llamadas API van al destino correcto. No existe ninguna llamada a localhost u otro servidor no autorizado. El frontend React consume exitosamente la API REST del backend Spring Boot desplegado en el cPanel."**

---

*Verificacion realizada con Chrome DevTools (Network Tab) el 10/03/2026*
*27 endpoints unicos verificados | 10+ modulos navegados | 0 errores | 100% cPanel*
