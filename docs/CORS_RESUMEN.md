# 🎯 CORS NewHype Backend - RESUMEN EJECUTIVO

## Problema

Error de CORS al consumir API desde `localhost:5174`:
```
Access to fetch at 'http://spring.informaticapp.com:5001/New-Hype-Project/...'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

## ✅ Solución Implementada

### Archivos Creados
1. **`CorsConfig.java`** - Configuración CORS centralizada
   - Path: `newhype-backend/src/main/java/com/newhype/backend/config/CorsConfig.java`
   - Define orígenes permitidos, métodos, headers

### Archivos Modificados
1. **`SecurityConfig.java`** - Integración CORS en cadena de seguridad
   - Path: `newhype-backend/src/main/java/com/newhype/backend/config/SecurityConfig.java`
   - Cambios: Import + Inyección + Configuración en HttpSecurity

---

## 📝 Cambios de Código

### 1. CorsConfig.java (NUEVO)

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "https://tudominio.com"
        ));
        cors.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", ...));
        cors.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", ...));
        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
```

### 2. SecurityConfig.java (MODIFICADO)

**Cambios:**
```java
// Línea 14: Agregar import
import org.springframework.web.cors.CorsConfigurationSource;

// Línea 21: Agregar campo
private final CorsConfigurationSource corsConfigurationSource;

// Línea 23: Actualizar constructor
public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                      CorsConfigurationSource corsConfigurationSource) {
    this.corsConfigurationSource = corsConfigurationSource;
}

// Línea 32: Agregar a HttpSecurity
.cors(cors -> cors.configurationSource(corsConfigurationSource))
```

---

## 🚀 Compilación y Despliegue (5 minutos)

### Paso 1: Compilar (Windows)
```bash
cd c:\Dev\New-Hype-Project
.\mvnw.cmd clean package -DskipTests
```

**Resultado esperado:** `BUILD SUCCESS` + JAR en `target/newhype-backend-1.0.0.jar`

### Paso 2: Subir JAR a cPanel
```bash
scp c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-1.0.0.jar \
    ventas@spring.informaticapp.com:/home/user/public_html/New-Hype-Project/
```

### Paso 3: Reiniciar Aplicación
```bash
ssh ventas@spring.informaticapp.com
pkill -f "java -jar"
cd /home/user/public_html/New-Hype-Project
nohup java -jar newhype-backend-1.0.0.jar > app.log 2>&1 &
```

### Paso 4: Verificar (2 min)
```bash
# Ver logs
tail -30 app.log

# Buscar: "Started NuewhypeApplication"
```

---

## ✓ Verificación Rápida

### Test 1: Desde Frontend Local

```javascript
// http://localhost:5174
fetch('http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/tenants', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(d => console.log('✓ CORS OK'))  // Sin error CORS
.catch(e => console.error('Error:', e));
```

### Test 2: DevTools - Network

Request cualquiera → Response Headers debe tener:
```
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

### Test 3: Postman

```
GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/tenants
Header: Authorization: Bearer [token]
```

✓ Funciona (Postman ignora CORS)

---

## 🔧 Customización

### Cambiar Orígenes Permitidos

**Archivo:** `CorsConfig.java` líneas 24-34

```java
private static final String[] ALLOWED_ORIGINS = {
    "http://localhost:3000",
    "http://localhost:5174",
    "https://midominio.com",  // ← CAMBIAR AQUÍ
    "https://www.midominio.com"
};
```

**Luego:** Recompilar + redeploy

---

## 🛡️ Seguridad

✓ **Lo que se mantiene:**
- JWT authentication (no cambia)
- Multi-tenancy filtering (no cambia)
- Role-based permissions (no cambia)
- Endpoints de public/private igual (no cambia)

✓ **Lo que se agrega:**
- Headers CORS en respuestas
- Permite JavaScript desde navegador
- Endpoints protegidos siguen siendo protegidos

**No usar `"*"` en producción** - Uso específico de orígenes

---

## 📚 Documentación Completa

Dentro del proyecto hay 3 archivos de documentación:

1. **`CORS_CONFIGURACION.md`** - Explicación completa + troubleshooting
2. **`DEPLOY_CORS_PASOS.md`** - Instrucciones detalladas paso a paso
3. **`CORS_CAMBIOS.md`** - Resumen de cambios (este)

---

## 🐛 Si Falla

**Error:** "CorsConfigurationSource cannot be resolved"
→ Asegurar  que `CorsConfig.java` está en `config/` y `SecurityConfig.java` lo importa

**Error:** Constructor o inyección falla
→ Verificar que SecurityConfig tiene ambos parámetros en constructor

**Sigue teniendo error CORS**
→ Verificar en `CorsConfig.java` que tu origen está en `ALLOWED_ORIGINS`
→ Limpiar caché del navegador
→ Verificar que JAR es el nuevo (ver en logs versión)

---

## ⚡ Timeline

- ✓ **0 min** - Código completado (CorsConfig + SecurityConfig)
- ✓ **3 min** - Compilar con Maven
- ✓ **1 min** - Subir JAR por SCP
- ✓ **1 min** - Restart aplicación por SSH
- ✓ **2 min** - Verificar en logs + test en navegador

**Total:** ~7 minutos para tener CORS funcionando

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Sigue error CORS | Verificar origen en ALLOWED_ORIGINS (case-sensitive) |
| Logs muestran error compilation | Clean compile: `mvnw.cmd clean compile` |
| JAR no se reinicia | `pkill -f java; nohup java -jar...` |
| No ve cambios | Verificar que subió el JAR correcto |
| Postman funciona pero navegador no | Esperado - Postman ignora CORS |

---

**Estado:** ✅ LISTO PARA DESPLEGAR
**Versión Backend:** 1.0.0
**Fecha:** 2026-03-02
**Compilación requerida:** SÍ
**Reinicio requerido:** SÍ
