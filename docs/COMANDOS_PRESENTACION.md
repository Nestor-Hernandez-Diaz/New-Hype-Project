# 🖥️ COMANDOS COPIAR-PEGAR PARA PRESENTACIÓN

## Usar estos comandos exactamente en la presentación

---

## 1️⃣ VERIFICACIÓN INICIAL (Minuto 0)

### Comando: Verificar que el servidor está arriba
```bash
curl -I http://spring.informaticapp.com:5001/New-Hype-Project/swagger-ui.html
```

**Esperado:**
```
HTTP/1.1 200 OK
```

### Comando: Ver el JAR corriendo en cPanel
```bash
ssh ventas@spring.informaticapp.com "pgrep -af newhype-backend | grep 3391100"
```

**Esperado:**
```
3391100 java -jar newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

---

## 2️⃣ GENERAR TOKEN FRESCO (Minuto 4)

### Comando: Registrar usuario demo y obtener token
```bash
TIMESTAMP=$(date +%s)
EMAIL="demo.presentacion.$TIMESTAMP@test.com"

RESPONSE=$(curl -s -X POST "http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"nombre\": \"Demo\",
    \"apellido\": \"Presentacion\",
    \"email\": \"$EMAIL\",
    \"password\": \"Demo2026\",
    \"nombreTienda\": \"Tienda Demo Presentacion\"
  }")

TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
TENANT_ID=$(echo "$RESPONSE" | grep -o '"tenantId":[0-9]*' | cut -d':' -f2)

echo "📧 Email: $EMAIL"
echo "🎟️  Token: $TOKEN"
echo "🏢 Tenant ID: $TENANT_ID"
```

**Resultado esperado:**
```
📧 Email: demo.presentacion.1771815963@test.com
🎟️  Token: eyJhbGciOiJIUzM4NCJ9...
🏢 Tenant ID: 27
```

⚠️ **IMPORTANTE:** Guarda el TOKEN para la siguiente sección

---

## 3️⃣ PROBAR ENDPOINTS CON CURL (Minutos 6-10)

### Pre-requisito: Establece la variable TOKEN
```bash
TOKEN="eyJhbGciOiJIUzM4NCJ9..."  # Pega el token del paso anterior
```

### Test 1: Obtener datos del usuario actual
```bash
curl -s "http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**Esperado:**
```json
{
  "id": 28,
  "email": "demo.presentacion.1771815963@test.com",
  "nombre": "Demo",
  "apellido": "Presentacion",
  "rol": "ADMIN",
  "tenantId": 27,
  "tenantNombre": "Tienda Demo Presentacion"
}
```

### Test 2: Crear un almacén
```bash
curl -s -X POST "http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/almacenes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "ALM001",
    "nombre": "Almacén Principal",
    "ubicacion": "Lima, Perú",
    "descripcion": "Almacén principal de la tienda"
  }' | python3 -m json.tool
```

**Esperado:**
```json
{
  "id": 1,
  "codigo": "ALM001",
  "nombre": "Almacén Principal",
  "estado": "ACTIVO"
}
```

### Test 3: Listar productos (vacío al principio)
```bash
curl -s "http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/productos" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20
```

**Esperado:**
```json
[

]
```
(Lista vacía porque aún no hemos creado productos)

### Test 4: Crear una categoría de productos
```bash
curl -s -X POST "http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/configuracion/categorias" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Camisetas",
    "descripcion": "Camisetas de algodón"
  }' | python3 -m json.tool
```

**Esperado:**
```json
{
  "id": 1,
  "nombre": "Camisetas",
  "descripcion": "Camisetas de algodón",
  "estado": "ACTIVO"
}
```

### Test 5: Crear un producto
```bash
curl -s -X POST "http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/productos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Camiseta Polo Azul",
    "descripcion": "Camiseta polo azul talla M",
    "sku": "CAMPOLAZUL001",
    "precioVenta": 85.00,
    "categoria": "Camisetas",
    "talla": "M",
    "color": "Azul"
  }' | python3 -m json.tool
```

**Esperado:**
```json
{
  "id": 1,
  "nombre": "Camiseta Polo Azul",
  "sku": "CAMPOLAZUL001",
  "precioVenta": 85.00,
  "estado": "ACTIVO"
}
```

### Test 6: Listar productos (ahora con datos)
```bash
curl -s "http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/productos" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 4️⃣ VERIFICAR SWAGGER UI (Minutos 10-15)

### Copiar y pegar en el navegador:
```
http://spring.informaticapp.com:5001/New-Hype-Project/swagger-ui.html
```

### En Swagger:
1. Busca el botón **"Authorize"** (arriba a la derecha)
2. Pega el TOKEN en el campo
3. Haz clic en "Authorize"
4. Ahora puedes probar cualquiera de los 169 endpoints directamente desde la UI

**Ejemplos para probar en Swagger:**
- `GET /api/v1/auth/me` → Datos del usuario
- `GET /api/v1/almacenes` → Listar almacenes
- `GET /api/v1/productos` → Listar productos
- `GET /api/v1/reportes/resumen` → Dashboard con métricas

---

## 5️⃣ VER LOGS EN VIVO (Opcional - Minuto 18+)

### Si algo falla o quieres ver qué está pasando:
```bash
ssh ventas@spring.informaticapp.com "tail -50 /home/ventas/logs/newhype.log"
```

### Para ver logs en tiempo real:
```bash
ssh ventas@spring.informaticapp.com "tail -f /home/ventas/logs/newhype.log"
```

---

## 6️⃣ COMANDOS DE FALLBACK

### Si curl no funciona en el local:
```bash
# Instala curl
# Windows: choco install curl
# macOS: brew install curl
# Linux: sudo apt-get install curl
```

### Si no tienes Python (para formatear JSON):
```bash
# Reemplaza `| python3 -m json.tool` con `| jq '.'`
# O simplemente quita el pipe (verás JSON sin formato pero funciona igual)
```

### Si quieres probar sin curl (usando Postman):
1. Abre Postman
2. Importa: `c:\Dev\New-Hype-Project\postman\NewHype_E2E_PruebaFinal.postman_collection.json`
3. Configura environment con el TOKEN
4. Prueba los endpoints desde ahí

---

## 📋 RESULTADO ESPERADO AL FINAL

Si todos los comandos funcionan, deberías haber demostrado:

✅ **Registro de usuario en línea** (formulario HTML)
✅ **Generación automática de tenant** (multitenancy)
✅ **Autenticación con JWT** (token válido)
✅ **CRUD de datos** (crear almacenes, categorías, productos)
✅ **Endpoints REST** (169 endpoints funcionando)
✅ **Swagger UI** (documentación interactiva)
✅ **Logs en cPanel** (visibilidad de la aplicación)

---

## 🎓 NOTAS PARA EL DOCENTE

Si los docentes preguntan:

**P: "¿Cuántos endpoints hay?"**
A: 169 endpoints REST, todos documentados en Swagger

**P: "¿Cómo se gestiona la multitenancy?"**
A: Cada usuario registrado crea automáticamente un tenant con aislamiento de datos por `tenantId`

**P: "¿Qué bases de datos soporta?"**
A: Viene compilado para MySQL 8, pero es compatible con PostgreSQL y otros

**P: "¿Cómo se desplegó?"**
A: En cPanel con Java 17, Spring Boot 4.0.2, run en puerto 5001 con contexto `/New-Hype-Project`

**P: "¿Se puede escalar?"**
A: Sí, es una arquitectura SaaS con BD centralizada y múltiples tenants

---

## ⏱️ TIMELINE DE PRESENTACIÓN

```
0:00-2:00   → Introducción + Arquitectura
2:00-5:00   → Demostrar registro.html (crear user + obtener token)
5:00-8:00   → Explicar JWT y Swagger
8:00-15:00  → Probar 5-6 endpoints clave con curl/Swagger
15:00-18:00 → Mostrar lógica de negocio (almacenes → productos → venta)
18:00-20:00 → Q&A + Cierre
```

---

## ✨ FINAL

**Mensaje de cierre:**
```
"NewHype ERP es una solución completa, escalable y lista para
producción que demuestra arquitectura moderna de microservicios,
autenticación JWT, multitenancy, y buenas prácticas REST.

¡Todas las 169 endpoints están documentadas, testeadas y listas
para ser consumidas por un frontend!"
```
