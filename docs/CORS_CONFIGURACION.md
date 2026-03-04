# 🔧 Configuración CORS - NewHype Backend

## 📋 Problema

Error CORS al consumir API desde frontend local:
```
Access to fetch at 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/tenants'
from origin 'http://localhost:5174' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Causa:** El backend no incluía headers CORS en sus respuestas HTTP.

---

## ✅ Solución Implementada

### 1️⃣ Archivos Creados/Modificados

#### **Archivo 1: `CorsConfig.java` (NUEVO)**
```
Ubicación: newhype-backend/src/main/java/com/newhype/backend/config/CorsConfig.java

Contenido:
- @Configuration + @Bean CorsConfigurationSource
- Orígenes permitidos (localhost:3000, 5173, 5174 + producción)
- Métodos HTTP: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: Authorization, Content-Type, etc.
- Exposed headers: Authorization (para JWT)
- Credenciales: true (permite cookies/autenticación)
- MaxAge: 3600s (caché de 1 hora)
```

**Línajes clave:**
```java
ALLOWED_ORIGINS = {
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://tudominio.com"  // Cambiar por tu dominio
}

cors.setAllowCredentials(true);  // Permite JWT
cors.setMaxAge(3600L);           // Caché de preflight
```

#### **Archivo 2: `SecurityConfig.java` (MODIFICADO)**
```
Cambios:
- Import del CorsConfigurationSource
- Inyección en constructor
- Agregado: .cors(cors -> cors.configurationSource(corsConfigurationSource))
```

**Línea agregada (línea 32):**
```java
.cors(cors -> cors.configurationSource(corsConfigurationSource))
```

---

## 🚀 Instrucciones de Compilación y Despliegue

### Paso 1: Compilar en Local

```bash
cd c:\Dev\New-Hype-Project
.\mvnw.cmd clean package -DskipTests
```

**Esperado:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX.XXs
[INFO] Artifact: newhype-backend-1.0.0.jar
```

### Paso 2: Subir JAR a cPanel

```bash
# Ubicación en cPanel
/home/user/public_html/New-Hype-Project/newhype-backend-1.0.0.jar

# O si tienes acceso directo por SSH
scp c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-1.0.0.jar \
    ventas@spring.informaticapp.com:/home/user/public_html/New-Hype-Project/
```

### Paso 3: Reiniciar la Aplicación

#### **Opción A: Via SSH (Recomendado)**

```bash
# Conectar al servidor
ssh ventas@spring.informaticapp.com

# Matar procesos Java activos
pkill -f "java -jar"

# O más específico
ps aux | grep java
kill -9 <PID>

# Iniciar JAR en background
cd /home/user/public_html/New-Hype-Project
nohup java -jar newhype-backend-1.0.0.jar > app.log 2>&1 &

# Verificar que está corriendo
ps aux | grep java
tail -20 app.log
```

#### **Opción B: Via cPanel (si tienes acceso)**

1. File Manager → Dirección de la app
2. Crear script `restart.sh`
3. Ejecutar con permisos 755
4. Llamar desde cPanel → Cron o manualmente

### Paso 4: Verificar Reinicio

```bash
# Esperado ver en logs
tail -50 app.log

# Buscar estas líneas
[main] c.n.b.NuewhypeApplication : Started NuewhypeApplication in
[main] o.s.s.w.DefaultSecurityFilterChain : Will secure any request with
```

---

## ✓ Verificación Post-Despliegue

### Test 1: Desde Frontend Local (IMPORTANTE)

```javascript
// En tu frontend (React/Vue/Next.js)
const baseUrl = 'http://spring.informaticapp.com:5001/New-Hype-Project';
const token = 'tu_token_jwt_aqui';

fetch(`${baseUrl}/api/v1/tenants`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('✓ CORS funcionando:', data))
.catch(error => console.error('✗ Error:', error));
```

**Esperado:**
- ✓ Sin error CORS
- ✓ Response normal con datos
- ✓ Headers incluyen `Access-Control-Allow-Origin: http://localhost:5174`

### Test 2: Verificar Headers CORS

**En navegador (DevTools → Network)**

```
Request Headers:
  Origin: http://localhost:5174
  Authorization: Bearer eyJhbGc...

Response Headers:
  Access-Control-Allow-Origin: http://localhost:5174
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
  Access-Control-Allow-Headers: Authorization, Content-Type, ...
  Access-Control-Expose-Headers: Authorization
  Access-Control-Max-Age: 3600
```

### Test 3: Preflight Request

```bash
# Request OPTIONS (browser lo hace automáticamente)
curl -X OPTIONS 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/tenants' \
  -H 'Origin: http://localhost:5174' \
  -H 'Access-Control-Request-Method: GET' \
  -v

# Esperado: HTTP 200 OK
```

### Test 4: Postman (NO es afectado por CORS)

```
GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/tenants
Header: Authorization: Bearer [token]

Esperado: 200 OK + datos
(Postman ignora CORS completamente)
```

---

## 🔒 Seguridad y Configuración por Ambiente

### Desarrollo (`.properties`)
```properties
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173,http://localhost:5174
app.cors.allow-credentials=true
```

### Producción (`.properties`)
```properties
app.cors.allowed-origins=https://midominio.com,https://www.midominio.com
app.cors.allow-credentials=true
```

**❌ NUNCA usar:**
```json
ALLOWED_ORIGINS = ["*"]  // En producción
```

---

## 🔧 Customización de Orígenes

### Para cambiar orígenes permitidos:

**Archivo:** `CorsConfig.java` líneas 20-32

```java
private static final String[] ALLOWED_ORIGINS = {
    // Desarrollo
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",

    // Producción - REEMPLAZAR CON TU DOMINIO
    "https://tudominio.com",
    "https://www.tudominio.com",
    "https://api.tudominio.com",  // Si teneds subdomain diferente
};
```

**Luego:**
1. Recompilar: `mvnw clean package`
2. Subir nuevo JAR
3. Reiniciar aplicación

---

## 📧 Headers Permitidos y Expuestos

### Permitidos (Request)
```
Authorization          ← JWT Token
Content-Type           ← application/json
Accept                 ← application/json
X-Requested-With       ← XMLHttpRequest (AJAX)
X-CSRF-Token           ← CSRF Prevention
Access-Control-*       ← Preflight
```

### Expuestos (Response)
```
Authorization          ← Nuevo token en refresh
Content-Type           ← Tipo de respuesta
X-Total-Count          ← Total registros (paginación)
X-Page-Number          ← Página actual
X-Page-Size            ← Tamaño página
```

**Para agregar más:**
Edita `CorsConfig.java` líneas 48-54

---

## 🎯 Opciones Alternativas (No recomendadas)

### Opción A: Proxy en Frontend Vite

**Ventaja:** No tocar backend
**Desventaja:** Solo funciona en desarrollo

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://spring.informaticapp.com:5001/New-Hype-Project',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      }
    }
  }
}
```

**Uso:** `fetch('/api/tenants')`
**Problema:** No funciona en producción

### Opción B: Extension Browser "Allow CORS"

⚠️ **SOLO para testing local**

Chrome Extension: [Allow CORS](https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)

**Desventaja:** Abre vulnerabilidades, no usar en producción

### Opción C: Usar JSONP (Obsoleto)

❌ **NO RECOMENDADO** - Tecnología antigua, insegura

---

## ⚠️ Notas Importantes

### ✓ Lo que está protegido:
- JWT autenticación (no cambia)
- Multi-tenancy (no cambia)
- Permisos por rol (no cambia)
- CSRF deshabilitado (ya estaba)

### ✓ Lo que se agregó:
- Headers CORS en respuestas
- Permite JavaScript desde navegador
- Mantiene seguridad de autenticación

### ✗ No afecta:
- Postman/Insomnia (ignoran CORS)
- Requests de servidor a servidor
- Mobile apps (no tienen origins)
- WebSocket (diferente mecanismo)

---

## 🐛 Troubleshooting

### Error: "CORS policy: Credentials mode is 'include', but Allow-Credentials is missing"

**Solución:** Asegurar que `cors.setAllowCredentials(true)` está en `CorsConfig.java`

### Error: "No 'Access-Control-Allow-Origin' header"

**Verificar:**
1. ¿JAR recompilado? `mvnw clean package`
2. ¿JAR reiniciado? `pkill -f java; nohup java -jar...`
3. ¿Caché del navegador? DevTools → Network → Disable cache
4. ¿Origen en ALLOWED_ORIGINS? `http://localhost:5174` debe estar

### Headers CORS no aparecen en Postman

**Esperado:** Postman ignora CORS, solo ve el status 200 OK

### Request OPTIONS retorna 403

**Problema:** OPTIONS no está en `.permitAll()`
**Solución:** SecurityConfig lo permite automáticamente cuando CORS está configurado

---

## 📝 Checklist Final

- [ ] `CorsConfig.java` creado en `com.newhype.backend.config`
- [ ] `SecurityConfig.java` importa `CorsConfigurationSource`
- [ ] `SecurityConfig.java` inyecta `corsConfigurationSource`
- [ ] `SecurityConfig.java` línea 32: `.cors(...)` agregada
- [ ] Compilación exitosa: `mvnw clean package`
- [ ] JAR subido a cPanel
- [ ] JAR reiniciado
- [ ] Test desde localhost:5174 ✓
- [ ] Headers CORS visibles en DevTools ✓
- [ ] Endpoints retornan datos correctamente ✓
- [ ] JWT sigue funcionando ✓

---

## 📞 Contacto/Soporte

Si los endpoints siguen bloqueados:

1. Verificar origem exacto (case-sensitive)
2. Limpiar caché del navegador
3. Revisar logs de aplicación en cPanel
4. Comprobar que JAR está corriendo: `ps aux | grep java`

---

**Estado:** ✅ Implementado
**Fecha:** 2026-03-02
**Versión Backend:** 1.0.0
