# 🚀 Instrucciones de Compilación y Despliegue CORS

## ✅ Cambios Completados

1. ✓ `CorsConfig.java` - CREADO en `newhype-backend/src/main/java/com/newhype/backend/config/`
2. ✓ `SecurityConfig.java` - MODIFICADO (agregado CORS a la cadena de seguridad)
3. ✓ Documentación completa - CORS_CONFIGURACION.md

---

## 🔨 Paso 1: Compilar Localmente (Windows)

### Opción A: Command Prompt / PowerShell

```bash
# Navegar al directorio del proyecto
cd c:\Dev\New-Hype-Project

# Compilar (genera JAR)
.\mvnw.cmd clean package -DskipTests
```

### Opción B: IDE (IntelliJ / Eclipse)

1. Abrir proyecto en IDE
2. Clic derecho → Maven → Clean
3. Maven → Package (o Build)

---

## 📊 Salida Esperada

```
[INFO] --------< com.newhype:newhype-backend >--------
[INFO] Building newhype-backend 1.0.0
[INFO] --------------------------------[ jar ]-----------
[INFO]
[INFO] --- maven-clean-plugin:3.2.0:clean (default-clean) @ newhype-backend ---
[INFO] Deleting /target
[INFO]
[INFO] --- maven-resources-plugin:3.3.0:resources (default-resources) @ newhype-backend ---
[INFO] Copying 4 resources
[INFO]
[INFO] --- maven-compiler-plugin:3.11.0:compile (default-compile) @ newhype-backend ---
[INFO] Compiling 120 source files to /target/classes
[INFO]
[INFO] --- maven-jar-plugin:3.3.0:jar (default-jar) @ newhype-backend ---
[INFO] Building jar: /target/newhype-backend-1.0.0.jar
[INFO]
[INFO] BUILD SUCCESS
[INFO] Total time: 45.234 s
[INFO] Artifact: newhype-backend-1.0.0.jar
```

**Si ves `BUILD SUCCESS` → ¡Listo para desplegar!**

---

## 🔴 Si hay errores de compilación

### Error: "CorsConfigurationSource cannot be resolved"

**Causa:** Falta import en SecurityConfig.java

**Solución:** Verificar línea 14 tiene:
```java
import org.springframework.web.cors.CorsConfigurationSource;
```

### Error: "The constructor SecurityConfig() is undefined"

**Causa:** Parámetro constructor no actualizado

**Solución:** SecurityConfig línea 23 debe tener ambos parámetros:
```java
public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CorsConfigurationSource corsConfigurationSource)
```

### Error: "No suitable constructor found"

**Causa:** Spring no puede inyectar CorsConfigurationSource

**Solución:** Asegurar que `CorsConfig.java` está en la misma carpeta `config/`

---

## 📤 Paso 2: Subir JAR a cPanel

### Opción A: Por SCP (SSH - Recomendado)

```bash
# En PowerShell (como admin):
scp "c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-1.0.0.jar" `
  ventas@spring.informaticapp.com:/home/user/public_html/New-Hype-Project/

# O sin backticks (una línea):
scp c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-1.0.0.jar ventas@spring.informaticapp.com:/home/user/public_html/New-Hype-Project/
```

**Presionar:** Enter → Ingresar contraseña SSH

### Opción B: FileZilla (interfaz gráfica)

1. Abrir FileZilla
2. File → Site Manager
3. Host: `spring.informaticapp.com`
4. User: `ventas`
5. Password: `AC$%$#es0r1Oz20#26&#`
6. Connect
7. Navegar a `/home/user/public_html/New-Hype-Project/`
8. Arrastrar JAR desde local a remoto

---

## 🔄 Paso 3: Reiniciar Aplicación

### Opción A: SSH (Recomendado)

```bash
# Conectar al servidor
ssh ventas@spring.informaticapp.com

# Verificar procesos Java activos
ps aux | grep java

# Matar todos los procesos Java
pkill -f "java -jar"

# O matar por PID específico
kill -9 12345  # Reemplazar con el PID visto en ps aux

# Iniciar JAR en background
cd /home/user/public_html/New-Hype-Project
nohup java -jar newhype-backend-1.0.0.jar > app.log 2>&1 &

# Verificar que está corriendo (debe aparecer el proceso)
ps aux | grep java

# Ver últimas líneas del log
tail -30 app.log
```

### Opción B: Mediante cPanel (si tienes acceso directo)

1. cPanel → Terminal
2. Ejecutar los mismos comandos que en Opción A

### Opción C: Script automatizado

Crear archivo `restart.sh` en el servidor:

```bash
#!/bin/bash
pkill -f "java -jar"
sleep 2
cd /home/user/public_html/New-Hype-Project
nohup java -jar newhype-backend-1.0.0.jar > app.log 2>&1 &
echo "✓ Aplicación reiniciada"
```

Luego:
```bash
chmod +x restart.sh
./restart.sh
```

---

## ✓ Verificación: El servidor está corriendo

### En SSH, verificar logs:

```bash
tail -50 /home/user/public_html/New-Hype-Project/app.log
```

**Buscar estas líneas (significa que está corriendo bien):**

```
2026-03-02 12:34:56 [main] org.springframework.boot.StartupInfoLogger
  Started NuewhypeApplication in 8.456 seconds (process running for 8.789)
```

### En el navegador, probar endpoint público (sin token):

```
http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/register
```

Si ves respuesta JSON → ¡Está corriendo!

---

## 🧪 Paso 4: Verificar CORS Funciona

### Test 1: Desde Frontend Local (React/Vue/Next.js)

**Crear archivo `test-cors.html` en tu frontend:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test CORS</title>
</head>
<body>
  <h1>Test CORS NewHype API</h1>
  <button onclick="testCors()">Test CORS</button>
  <pre id="result"></pre>

  <script>
    async function testCors() {
      const resultDiv = document.getElementById('result');

      try {
        // Primero, generar un token
        const registerRes = await fetch(
          'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/register',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: 'Test',
              apellido: 'User',
              email: 'test@example.com'
            })
          }
        );

        if (!registerRes.ok) {
          resultDiv.textContent = '✗ Register failed: ' + registerRes.status;
          return;
        }

        const registerData = await registerRes.json();
        const token = registerData.data.accessToken;

        resultDiv.textContent = '✓ Token generado:\n' + token.substring(0, 50) + '...\n\n';

        // Luego, probar fetch a un endpoint protegido
        const apiRes = await fetch(
          'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/me',
          {
            headers: { 'Authorization': 'Bearer ' + token }
          }
        );

        const apiData = await apiRes.json();
        resultDiv.textContent += '✓ CORS funcionando!\n\n' +
          'Response:\n' + JSON.stringify(apiData, null, 2);

      } catch (error) {
        resultDiv.textContent = '✗ CORS ERROR:\n' + error.message;
      }
    }
  </script>
</body>
</html>
```

**Abrir en navegador → Clic en botón → Ver resultado**

### Test 2: Con curl (desde máquina local)

```bash
# Generar token
curl -X POST http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","apellido":"User","email":"test@example.com"}' \
  -v

# Copiar el token y probar endpoint protegido
curl -X GET http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGc..." \
  -v
```

**Buscar en response:**
```
< Access-Control-Allow-Origin: http://localhost:5174
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

### Test 3: DevTools del navegador

1. Abrir tu aplicación React/Vue/Next.js en `localhost:5174`
2. F12 → Network tab
3. Hacer un request a la API
4. Buscar la request en la lista
5. Ir a Response headers
6. Buscar: `Access-Control-Allow-Origin: http://localhost:5174`

**Si está → ¡CORS funcionando!**

---

## 🔐 Cambiar Orígenes Permitidos

### Para permitir tu dominio de producción:

**Archivo:** `newhype-backend/src/main/java/com/newhype/backend/config/CorsConfig.java`

**Líneas 24-38:**
```java
private static final String[] ALLOWED_ORIGINS = {
    // Desarrollo (mantener)
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",

    // Producción (CAMBIAR AQUÍ)
    "https://miapp.com",           // Tu dominio principal
    "https://www.miapp.com",
    "https://api.miapp.com",       // Si tienes subdomain
};
```

**Luego:**
1. Recompilar: `mvnw.cmd clean package`
2. Subir nuevo JAR
3. Reiniciar aplicación

---

## ⚠️ Troubleshooting

### Problema: Aún recibo error CORS

**Checklist:**
- [ ] JAR está compilado con el código nuevo
- [ ] JAR está subido a cPanel (verificar con SFTP)
- [ ] Aplicación está reiniciada (ver en logs)
- [ ] Origen en ALLOWED_ORIGINS (ej: `http://localhost:5174`)
- [ ] Limpiar caché del navegador (Ctrl+Shift+Del)
- [ ] Probar en incógnito (sin extensiones que bloqueen)

### Problema: Logs muestran error "Cannot resolve CorsConfigurationSource"

**Causa:** Cambios no compilados

**Solución:**
```bash
mvnw.cmd clean compile  # Limpiar compilación anterior
mvnw.cmd clean package
```

### Problema: "no se reconoce el término 'mvnw.cmd'"

**Solución:**
```bash
cd c:\Dev\New-Hype-Project
# Usar ruta completa
"C:\Dev\New-Hype-Project\mvnw.cmd" clean package
```

---

## 📋 Checklist Final

- [ ] Código compilado sin errores
- [ ] JAR generado: `newhype-backend-1.0.0.jar`
- [ ] JAR subido a cPanel
- [ ] Aplicación reiniciada
- [ ] Logs muestran "Started NuewhypeApplication"
- [ ] Test CORS desde localhost (sin error)
- [ ] Headers CORS visibles en DevTools
- [ ] Token generado correctamente
- [ ] Endpoints protegidos requieren JWT
- [ ] Endpoints public sin token funcionan

---

## 🎯 Resultado esperado

```javascript
// Desde http://localhost:5174
fetch('http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/tenants', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(d => console.log('✓ ¡CORS Configurado!', d))
.catch(e => console.error('Error:', e));
```

**Si ves los datos y NO hay error CORS → ¡Éxito!**

---

**Documento creado:** 2026-03-02
**Versión:** 1.0.0
