# CORRECCIÓN: register.html - Error 404 en Producción

**Fecha:** 2026-02-22
**Estado:** ✅ CORREGIDO Y COMPILADO
**Versión JAR:** newhype-backend-0.0.1-SNAPSHOT.jar (compilado 20:29)

---

## 🔴 PROBLEMA IDENTIFICADO

### Síntoma
El formulario `register.html` fallaba con error:
```
Error de conexion: Unexpected token '<', "<!doctype "... is not valid JSON
```

### Causa Raíz
La URL endpoint en el código JavaScript era **incompleta**. El archivo `register.html` estaba haciendo llamadas al:

**❌ Endpoint incorrecto (lo que hacía):**
```javascript
const res = await fetch('/api/v1/auth/register', {
    method: 'POST',
    // ...
});
```

Esto se resolvía en el navegador como:
```
POST http://spring.informaticapp.com:5001/api/v1/auth/register [404]
```

**✅ Endpoint correcto (debe ser):**
```javascript
const res = await fetch('/New-Hype-Project/api/v1/auth/register', {
    method: 'POST',
    // ...
});
```

Esto se resuelve correctamente como:
```
POST http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/register [200]
```

### Motivo Técnico
El archivo `application-prod.yml` configura:
```yaml
server.servlet.context-path: /New-Hype-Project
```

Esto hace que **TODOS** los endpoints agreguen `/New-Hype-Project` como prefijo. El HTML estático servido desde dentro del JAR debe incluir este contexto en cualquier llamada a API.

---

## ✅ CORRECCIÓN APLICADA

### Cambios Realizados

#### 1. Archivo: `src/main/resources/static/register.html`

**Línea 165** - Endpoint corregido:
```diff
- const res = await fetch('/api/v1/auth/register', {
+ const res = await fetch('/New-Hype-Project/api/v1/auth/register', {
```

**Línea 140** - Link de Swagger corregido:
```diff
- <a href="/swagger-ui.html" class="text-white">swagger-ui.html</a>
+ <a href="/New-Hype-Project/swagger-ui.html" class="text-white">swagger-ui.html</a>
```

### JAR Compilado
```
Compilación: mvn clean package -DskipTests
Estado: ✅ BUILD SUCCESS
UUID: newhype-backend-0.0.1-SNAPSHOT.jar
Tamaño: 68 MB
Timestamp: 2026-02-22 20:29 UTC
```

---

## 🚀 PRÓXIMOS PASOS - DESPLIEGUE

### Paso 1: Opción A - Despliegue vía SSH (RECOMENDADO)

```bash
# 1. Desde tu PC, sube el JAR al servidor:
scp "c:/Dev/New-Hype-Project/newhype-backend/target/newhype-backend-0.0.1-SNAPSHOT.jar" \
    ventas@spring.informaticapp.com:~/New-Hype-Project/

# 2. Conecta al servidor:
ssh ventas@spring.informaticapp.com

# 3. Detén la versión anterior:
cd ~/New-Hype-Project
bash stop.sh

# 4. Reinicia con la nueva versión:
bash start.sh

# 5. Verifica los logs:
tail -f ~/logs/newhype-backend-console.log
```

Tras 30 segundos debes ver:
```
OK: Aplicacion corriendo correctamente
URL: https://spring.informaticapp.com/New-Hype-Project/swagger-ui.html
```

### Paso 2: Opción B - Despliegue vía cPanel File Manager (SI NO TIENES SSH)

1. Accede a **cPanel** > **File Manager**
2. Navega a `/home/ventas/New-Hype-Project/`
3. Elimina el JAR antiguo (o renómbralo como `*.backup`)
4. Sube el nuevo JAR:
   - Origen: `c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar`
   - Destino: `/home/ventas/New-Hype-Project/`
5. Desde SSH (o si tienes acceso), reinicia:
   ```bash
   cd ~/New-Hype-Project && bash stop.sh && bash start.sh
   ```

---

## ✅ VERIFICACIÓN POST-DESPLIEGUE

Una vez que hayas desplegado el nuevo JAR, verifica que todo funciona:

### Test 1: Verificar register.html en vivo

```bash
curl -s http://spring.informaticapp.com:5001/New-Hype-Project/register.html | grep -q "NEW HYPE" && echo "✓ register.html cargando" || echo "✗ register.html falló"
```

### Test 2: Registrarse y obtener token

```bash
curl -X POST "http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "Usuario",
    "email": "test.'$(date +%s)'@test.com",
    "password": "TestPass2026"
  }' | jq '.data.accessToken'
```

**Resultado esperado:** Un JWT token válido (comienza con `eyJ...`)

### Test 3: Abrir en navegador

1. Abre: `http://spring.informaticapp.com:5001/New-Hype-Project/register.html`
2. Completa el formulario con datos nuevos
3. Haz clic en **Registrarse**
4. Debes ver un mensaje de "Registro exitoso" con el token

---

## 📋 ARCHIVOS MODIFICADOS

| Archivo | Cambio | Ubicación |
|---------|--------|-----------|
| `register.html` | Línea 165: Agregó `/New-Hype-Project` al endpoint | `src/main/resources/static/register.html` |
| `register.html` | Línea 140: Agregó `/New-Hype-Project` al link Swagger | `src/main/resources/static/register.html` |
| JAR compilado | Incluye ambas correcciones | `target/newhype-backend-0.0.1-SNAPSHOT.jar` |

---

## 🎯 RESUMEN

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Endpoint** | `/api/v1/auth/register` [404] | `/New-Hype-Project/api/v1/auth/register` [200] |
| **URL Swagger** | `/swagger-ui.html` [404] | `/New-Hype-Project/swagger-ui.html` [200] |
| **Estado JAR** | ❌ No compilado | ✅ Compilado y ready para deploy |
| **Próximo paso** | N/A | Subir JAR al servidor y reiniciar |

---

## 📝 NOTAS IMPORTANTES

1. **Este JAR debe reemplazar el existente en producción** (`~/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar`)
2. **Después de desplegar, espera 30 segundos** para que la aplicación arrange por completo
3. **Los logs están en** `~/logs/newhype-backend-console.log` (SSH) o via cPanel
4. **Prueba en tu navegador** abriendo `register.html` y rellenando el formulario
5. **Si continúa fallando**, revisa que el JAR se haya subido correctamente y que la aplicación reinició

---

## 🔗 URLs DE PRODUCCIÓN (POST-DESPLIEGUE)

| Recurso | URL |
|---------|-----|
| **Register HTML** | `http://spring.informaticapp.com:5001/New-Hype-Project/register.html` |
| **Swagger API Docs** | `http://spring.informaticapp.com:5001/New-Hype-Project/swagger-ui.html` |
| **v3/api-docs (JSON)** | `http://spring.informaticapp.com:5001/New-Hype-Project/v3/api-docs` |

---

**Estado Final:** 🟢 LISTO PARA DESPLIEGUE
