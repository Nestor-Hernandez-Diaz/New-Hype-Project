# DIAGNOSTICO Y ESTABILIZACION: Backend Spring Boot en cPanel

**Proyecto:** NewHype ERP - Sistema de Gestion Empresarial SaaS Multi-Tenant
**Fecha:** 03 de Marzo, 2026
**Servidor:** `spring.informaticapp.com` (usuario: `ventas`, cPanel 132.0 build 23)
**Backend:** Spring Boot 4.0.2, Java 17, 169 endpoints, MariaDB 10.11.16

---

## 1. RESUMEN EJECUTIVO

| Aspecto | Estado Inicial | Estado Final |
|---------|---------------|-------------|
| Backend Java | Corriendo en `pts/4` (interactivo) | Daemonizado con nohup (PID file + crontab) |
| Puerto 5001 | Escuchando (solo local) | Escuchando (accesible externamente via HTTP) |
| Apache HTTPS (443) | 404 cPanel nativo | **NO resuelto** - `.htaccess` [P] proxy bloqueado |
| CORS | Headers correctos en Spring Boot | Verificado OK desde `localhost:5173` |
| Login tenant | Credenciales desconocidas | Restaurado: `admin@newhype-store.pe` / `SuperAdmin2026` |
| Swagger UI | Inaccesible via HTTPS | Accesible via `http://spring.informaticapp.com:5001` |
| Frontend conexion | 70+ errores CORS | **Requiere cambio de URL** (ver seccion 5) |

---

## 2. DIAGNOSTICO: CAUSA RAIZ

### 2.1 Sintoma Reportado

```
Frontend (localhost:5173) muestra:
"Access to fetch at 'https://spring.informaticapp.com/...' has been blocked by CORS policy"
70+ errores en console al cargar pagina de login
```

### 2.2 Causa Raiz Identificada

**El problema NO es CORS. Es que Apache no reenvía las peticiones al backend Java.**

```
                 HTTPS (443)                    HTTP (5001)
  Browser  ───────────────►  Apache/cPanel  ─ ─ ─ ✕ ─ ─ ─►  Spring Boot
localhost:5173               (shared hosting)     |            (Java 17)
                                                  |
                                          .htaccess [P] flag
                                          BLOQUEADO por hosting
```

**Cadena de eventos:**
1. Frontend hace `fetch('https://spring.informaticapp.com/New-Hype-Project/api/v1/auth/login')`
2. Request llega a Apache en puerto 443 (HTTPS)
3. Apache busca archivo estatico en `~/public_html/New-Hype-Project/api/v1/auth/login` → no existe
4. Apache retorna 404 nativo de cPanel (pagina HTML generica)
5. Response 404 NO incluye headers CORS (viene de Apache, no de Spring Boot)
6. Browser interpreta la ausencia de `Access-Control-Allow-Origin` como "CORS blocked"
7. Console muestra error CORS, pero la causa real es **Apache no puede hacer proxy**

### 2.3 Por que .htaccess [P] no funciona

```apache
# INTENTADO (no funciona en este hosting):
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/New-Hype-Project/ [NC]
RewriteRule ^(.*)$ http://127.0.0.1:5001/$1 [P,L]
```

**Diagnostico:**
- `mod_proxy` y `mod_proxy_http` estan **cargados** en el servidor:
  - `/etc/apache2/conf.modules.d/280_mod_proxy.conf`
  - `/etc/apache2/conf.modules.d/340_mod_proxy_http.conf`
- Sin embargo, la directiva `AllowOverride` del hosting **NO permite** usar el flag `[P]` (proxy) desde `.htaccess`
- Esto es comun en hosting compartido por razones de seguridad (evitar que usuarios hagan proxy a servicios internos)

### 2.4 Verificacion CORS en Spring Boot

```
CORS config en CorsConfig.java: CORRECTA
─────────────────────────────────────────
Allowed Origins: http://localhost:5173, http://localhost:3000, http://127.0.0.1:5173
Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
Allowed Headers: Content-Type, Authorization
Allow Credentials: true
Max Age: 3600 segundos

Verificacion real (curl desde servidor):
$ curl -X OPTIONS http://spring.informaticapp.com:5001/.../auth/login \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST'

HTTP/1.1 200
Access-Control-Allow-Origin: http://localhost:5173        ✅
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE   ✅
Access-Control-Allow-Headers: Content-Type, Authorization ✅
Access-Control-Allow-Credentials: true                    ✅
Access-Control-Max-Age: 3600                              ✅
```

---

## 3. ACCIONES REALIZADAS

### 3.1 Backend Daemonizado

**Antes:** Proceso corriendo en terminal interactiva (`pts/4`), muere al cerrar SSH.

**Despues:**

```bash
# Scripts creados en /home/ventas/
~/start-backend.sh   # Inicia con nohup, guarda PID en ~/newhype-backend.pid
~/stop-backend.sh    # Para el proceso por PID o por nombre

# Crontab configurado para auto-reinicio:
@reboot /home/ventas/start-backend.sh >> /home/ventas/logs/cron-start.log 2>&1

# Proceso actual:
PID: 2126343
TTY: ? (sin terminal - daemonizado correctamente)
Puerto: 5001 LISTEN
Logs: /home/ventas/logs/newhype-backend.log
```

### 3.2 Credenciales Restauradas

```
TENANT ADMIN (para frontend):
  Email:    admin@newhype-store.pe
  Password: SuperAdmin2026
  Tenant:   Tienda NewHype Premium (ID: 1)
  Rol:      ADMIN
  Scope:    tenant

SUPERADMIN (para Postman/plataforma):
  Email:    superadmin@newhype.pe
  Password: SuperAdmin2026
  Endpoint: POST /platform/auth/login
  Scope:    platform
```

### 3.3 .htaccess Restaurado

El `.htaccess` en `~/public_html/` fue restaurado a su estado original (solo handler PHP).
Las reglas de proxy no funcionan en este hosting compartido.

---

## 4. ESTADO ACTUAL VERIFICADO

### 4.1 Backend (Puerto 5001)

| Test | Resultado | Evidencia |
|------|-----------|-----------|
| Proceso Java activo | PID 2126343 | `ps aux \| grep newhype` |
| Puerto 5001 escuchando | LISTEN | `ss -tlnp \| grep 5001` |
| Spring Boot iniciado | OK (11.1s) | `Started NewHypeBackendApplication in 11.109 seconds` |
| Perfil prod activo | SI | `The following 1 profile is active: "prod"` |
| DB conectada | SI (MariaDB 10.11.16) | Login funciona, queries responden |
| Swagger UI | Accesible | `http://spring.informaticapp.com:5001/New-Hype-Project/swagger-ui/index.html` |

### 4.2 Endpoints Verificados

| Endpoint | Metodo | Status | Respuesta |
|----------|--------|--------|-----------|
| `/auth/login` | POST | 200 | `{"success":true,"data":{"accessToken":"eyJ..."}}` |
| `/auth/login` (bad creds) | POST | 401 | `{"success":false,"message":"Credenciales invalidas"}` |
| `/auth/register` | POST | 200 | Genera token (problema de persistencia, ver nota) |
| `/platform/auth/login` | POST | 200 | `{"success":true,"data":{"accessToken":"eyJ..."}}` |
| `/swagger-ui/index.html` | GET | 200 | Swagger UI renderiza |
| `/register.html` | GET | 200 | Formulario de registro |
| CORS preflight OPTIONS | OPTIONS | 200 | Todos los headers CORS correctos |

### 4.3 CORS desde Browser

```javascript
// Ejecutado desde http://localhost:5173/login via Chrome DevTools:
fetch('http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@newhype-store.pe', password: 'SuperAdmin2026' })
})

// RESULTADO:
{
  "status": 200,
  "cors": "OK - No CORS block from localhost:5173",
  "success": true,
  "hasToken": true,
  "user": "admin@newhype-store.pe",
  "tenant": "Tienda NewHype Premium",
  "role": "ADMIN"
}
```

---

## 5. SOLUCION PARA CONECTAR FRONTEND

### Opcion A: Cambiar URL en .env.development (RAPIDO)

```bash
# Archivo: frontend/.env.development
# ANTES:
VITE_API_URL=https://spring.informaticapp.com/New-Hype-Project/api/v1

# DESPUES:
VITE_API_URL=http://spring.informaticapp.com:5001/New-Hype-Project/api/v1
```

**Ventajas:** Cambio de 1 linea, funciona inmediatamente.
**Desventajas:** HTTP sin cifrar (aceptable para desarrollo local).

### Opcion B: Proxy Vite (RECOMENDADO para desarrollo)

```typescript
// Archivo: frontend/vite.config.ts
export default defineConfig({
  // ...existing config...
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://spring.informaticapp.com:5001/New-Hype-Project',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});

// Archivo: frontend/.env.development
VITE_API_URL=/api/v1
```

**Ventajas:** Sin problemas de CORS, transparente para el frontend.
**Desventajas:** Requiere 2 cambios (vite.config.ts + .env.development).

### Opcion C: Solicitar Reverse Proxy al Hosting (PRODUCCION)

Contactar al administrador del servidor para agregar en la config global de Apache:

```apache
# En httpd.conf o virtualhost del dominio:
ProxyPass /New-Hype-Project/ http://127.0.0.1:5001/New-Hype-Project/
ProxyPassReverse /New-Hype-Project/ http://127.0.0.1:5001/New-Hype-Project/
```

**Ventajas:** HTTPS funcional, URL limpia sin puerto.
**Desventajas:** Requiere acceso de administrador al servidor.

---

## 6. COMANDOS SSH DE REFERENCIA

### Verificar Estado

```bash
ssh ventas@spring.informaticapp.com

# Ver si el backend esta corriendo
ps aux | grep newhype | grep -v grep

# Ver puerto
ss -tlnp | grep 5001

# Ver logs (ultimas 50 lineas)
tail -50 ~/logs/newhype-backend.log

# Ver PID guardado
cat ~/newhype-backend.pid
```

### Reiniciar Backend

```bash
ssh ventas@spring.informaticapp.com

# Parar
~/stop-backend.sh

# Iniciar
~/start-backend.sh

# Verificar (esperar ~15 segundos para Spring Boot)
sleep 15 && ss -tlnp | grep 5001
```

### Test Rapido de Endpoints

```bash
# Health check (desde el servidor)
curl -s http://localhost:5001/New-Hype-Project/register.html | head -5

# Login tenant
curl -s -X POST http://localhost:5001/New-Hype-Project/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@newhype-store.pe","password":"SuperAdmin2026"}'

# Login superadmin
curl -s -X POST http://localhost:5001/New-Hype-Project/api/v1/platform/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"emailOrUsername":"superadmin@newhype.pe","password":"SuperAdmin2026"}'

# Swagger UI
curl -s -o /dev/null -w '%{http_code}' \
  http://localhost:5001/New-Hype-Project/swagger-ui/index.html
```

---

## 7. CHECKLIST DE VERIFICACION

### Backend

- [x] Proceso Java corriendo (PID file en `~/newhype-backend.pid`)
- [x] Puerto 5001 escuchando (`ss -tlnp | grep 5001`)
- [x] Perfil `prod` activo (logs muestran `profile is active: "prod"`)
- [x] Base de datos conectada (login funciona)
- [x] Proceso daemonizado (TTY: `?`, no `pts/X`)
- [x] Crontab `@reboot` configurado
- [x] Scripts `start-backend.sh` y `stop-backend.sh` creados
- [x] Logs redirigidos a `~/logs/newhype-backend.log`

### CORS

- [x] `CorsConfig.java` incluye `http://localhost:5173`
- [x] `SecurityConfig.java` aplica `CorsConfigurationSource` bean
- [x] Preflight OPTIONS retorna 200 con headers correctos
- [x] `Access-Control-Allow-Origin: http://localhost:5173` presente
- [x] `Access-Control-Allow-Credentials: true` presente
- [x] Fetch desde `localhost:5173` al puerto 5001 funciona (verificado en Chrome)

### Autenticacion

- [x] `POST /auth/login` retorna JWT valido (tenant scope)
- [x] `POST /platform/auth/login` retorna JWT valido (platform scope)
- [x] Token incluye: sub, scope, tenantId, role, exp
- [x] Credenciales tenant: `admin@newhype-store.pe` / `SuperAdmin2026`
- [x] Credenciales superadmin: `superadmin@newhype.pe` / `SuperAdmin2026`

### Pendiente

- [ ] **Cambiar `VITE_API_URL`** en `.env.development` para apuntar a puerto 5001
- [ ] **O configurar proxy Vite** en `vite.config.ts`
- [ ] Solicitar al hosting configurar reverse proxy Apache (para produccion)
- [ ] Rotar credenciales expuestas en `application-prod.yml` (password BD + JWT secret)
- [ ] Investigar por que `/auth/register` no persiste usuarios en BD

---

## 8. NOTAS TECNICAS

### MariaDB 10.11.16 como MySQL 5.5.5

```
Hibernate WARNING:
HHH000511: The 5.5.5 version for [org.hibernate.dialect.MySQLDialect]
is no longer supported, hence certain features may not work properly.
The minimum supported version is 8.0.0.
```

MariaDB 10.11 reporta version `5.5.5-10.11.16-MariaDB` por compatibilidad. Hibernate 7 (Spring Boot 4.0.2) espera MySQL 8.0+. Esto podria causar problemas con:
- Auto-generacion de IDs
- Transacciones anidadas
- Funciones JSON nativas

**Recomendacion:** Agregar `spring.jpa.database-platform=org.hibernate.dialect.MariaDBDialect` en `application-prod.yml`.

### Estructura de la Base de Datos

```
Tenants: 1 (Tienda NewHype Premium)
Usuarios: 1 (admin@newhype-store.pe, rol_id=3)
Roles: 1 (ADMIN, permisos: {"all": true})
Usuarios plataforma: 1 (superadmin@newhype.pe)
```

### Arquitectura de Red

```
Internet
    |
    v
Apache (puerto 443, HTTPS)  ←── spring.informaticapp.com
    |                             Hosting compartido, .htaccess limitado
    v
public_html/New-Hype-Project/    ←── Archivos estaticos + JAR (68 MB)
    |
    ✕ NO HAY PROXY A PUERTO 5001
    |
Spring Boot (puerto 5001, HTTP)  ←── spring.informaticapp.com:5001
    |                                 Accesible externamente
    v
MariaDB (localhost:3306)         ←── ventas_newhype_prod
```

---

**Preparado por:** Claude (Senior Spring Boot Developer + cPanel Expert)
**Herramientas:** SSH, curl, MySQL CLI, Chrome DevTools MCP
**Fecha:** 03 de Marzo, 2026
