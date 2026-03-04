                                                                                                                                                                                                                                                                                    # GUIA DE DESPLIEGUE - NewHype ERP Backend en cPanel

**Proyecto:** NewHype ERP SaaS Multi-Tenant
**Stack:** Spring Boot 4.0.2 / Java 17 / MySQL 8
**JAR:** `newhype-backend-0.0.1-SNAPSHOT.jar` (68 MB)
**Dominio destino:** `https://spring.informaticapp.com/New-Hype-Project/`
**Fecha:** 2026-02-17

---

## ESTADO PREVIO (ya completado)

| Paso | Estado | Detalle |
|------|--------|---------|
| Base de datos creada | HECHO | `ventas_newhype_prod` |
| Usuario MySQL creado | HECHO | `ventas_newhype_prod` / `Tarapoto2026` |
| Privilegios otorgados | HECHO | ALL PRIVILEGES |
| Schema importado | HECHO | 51 tablas |
| Backend compilado | HECHO | 169 endpoints, BUILD SUCCESS |

---

## PASO 1: Generar el JAR de produccion

### 1.1 Desde tu PC local (Windows)

Abre la terminal en la carpeta del proyecto backend:

```bash
cd C:\Dev\New-Hype-Project\newhype-backend
```

Ejecuta Maven para generar el JAR:

```bash
.\mvnw.cmd clean package -DskipTests
```

**Resultado esperado:**
```
[INFO] Building jar: target\newhype-backend-0.0.1-SNAPSHOT.jar
[INFO] BUILD SUCCESS
```

El JAR se genera en:
```
newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar
```

**Tamano:** ~68 MB (incluye todas las dependencias embebidas).

### 1.2 Verificar que el JAR funciona localmente (opcional)

```bash
java -jar target\newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

Si todo arranca correctamente veras: `Started NewHypeBackendApplication in X seconds`

**Nota:** Para la prueba local el perfil `prod` intentara conectar a `ventas_newhype_prod` en localhost. Si no tienes esa BD local, prueba sin el perfil prod (usara el perfil default con `newhype_dev`).

---

## PASO 2: Configuracion del perfil de produccion

### 2.1 Archivo `application-prod.yml`

Ya fue creado en:
```
newhype-backend/src/main/resources/application-prod.yml
```

**Configuracion clave:**

| Propiedad | Valor produccion | Proposito |
|-----------|-----------------|-----------|
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/ventas_newhype_prod` | BD en cPanel |
| `spring.datasource.username` | `ventas_newhype_prod` | Usuario MySQL cPanel |
| `spring.datasource.password` | `Tarapoto2026` | Password MySQL cPanel |
| `server.port` | `8080` | Puerto donde escucha el JAR |
| `server.servlet.context-path` | `/New-Hype-Project` | Prefijo URL de la app |
| `spring.jpa.show-sql` | `false` | No mostrar SQL en produccion |
| `app.jwt.secret` | (clave produccion) | JWT diferente a desarrollo |
| `logging.file.name` | `/home/ventas/logs/newhype-backend.log` | Logs a archivo |

### 2.2 Context Path

El `context-path: /New-Hype-Project` hace que **TODOS** los endpoints agreguen este prefijo:

| Local (desarrollo) | Produccion (cPanel) |
|---------------------|---------------------|
| `http://localhost:8080/api/v1/auth/login` | `https://spring.informaticapp.com/New-Hype-Project/api/v1/auth/login` |
| `http://localhost:8080/swagger-ui.html` | `https://spring.informaticapp.com/New-Hype-Project/swagger-ui.html` |
| `http://localhost:8080/register.html` | `https://spring.informaticapp.com/New-Hype-Project/register.html` |

---

## PASO 3: Subir archivos a cPanel

### 3.1 Archivos a subir

| Archivo | Origen local | Destino en cPanel |
|---------|-------------|-------------------|
| `newhype-backend-0.0.1-SNAPSHOT.jar` | `newhype-backend/target/` | `~/New-Hype-Project/` |
| `seed_superadmin_prod.sql` | `postman/` | `~/New-Hype-Project/` |
| `start.sh` | (crear, ver paso 3.3) | `~/New-Hype-Project/` |
| `stop.sh` | (crear, ver paso 3.3) | `~/New-Hype-Project/` |

**IMPORTANTE:** El JAR NO va en `public_html/`. Va en el **home del usuario** (`~/New-Hype-Project/`) para que no sea descargable publicamente. Solo el proxy inverso de cPanel expone los endpoints.

### 3.2 Subir via cPanel File Manager

1. Ingresar a **cPanel** > **Administrador de archivos**
2. Navegar a `/home/ventas/` (o tu directorio home)
3. Crear carpeta: **New-Hype-Project**
4. Crear carpeta: **logs** (en home: `/home/ventas/logs/`)
5. Subir el JAR dentro de `New-Hype-Project/`
6. Subir `seed_superadmin_prod.sql` dentro de `New-Hype-Project/`

### 3.3 Crear scripts de inicio/parada

Crear el archivo `start.sh` en `~/New-Hype-Project/`:

```bash
#!/bin/bash
# ============================================
# NewHype Backend - Script de inicio
# ============================================
APP_DIR="$HOME/New-Hype-Project"
JAR_FILE="newhype-backend-0.0.1-SNAPSHOT.jar"
LOG_FILE="$HOME/logs/newhype-backend-console.log"
PID_FILE="$APP_DIR/app.pid"

cd "$APP_DIR"

# Verificar si ya esta corriendo
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "La aplicacion ya esta corriendo (PID: $OLD_PID)"
        exit 1
    fi
fi

# Iniciar la aplicacion
echo "Iniciando NewHype Backend..."
nohup java -jar "$JAR_FILE" \
    --spring.profiles.active=prod \
    -Xmx512m -Xms256m \
    > "$LOG_FILE" 2>&1 &

# Guardar PID
echo $! > "$PID_FILE"
echo "Aplicacion iniciada (PID: $(cat $PID_FILE))"
echo "Logs en: $LOG_FILE"
echo "Esperando 30 segundos para verificar..."
sleep 30

# Verificar que arranco
if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo "OK: Aplicacion corriendo correctamente"
    echo "URL: https://spring.informaticapp.com/New-Hype-Project/swagger-ui.html"
else
    echo "ERROR: La aplicacion no pudo iniciar. Revisa los logs:"
    tail -50 "$LOG_FILE"
fi
```

Crear el archivo `stop.sh` en `~/New-Hype-Project/`:

```bash
#!/bin/bash
# ============================================
# NewHype Backend - Script de parada
# ============================================
APP_DIR="$HOME/New-Hype-Project"
PID_FILE="$APP_DIR/app.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "Deteniendo NewHype Backend (PID: $PID)..."
        kill "$PID"
        sleep 5
        if kill -0 "$PID" 2>/dev/null; then
            echo "Forzando parada..."
            kill -9 "$PID"
        fi
        rm "$PID_FILE"
        echo "Aplicacion detenida."
    else
        echo "El proceso $PID ya no existe."
        rm "$PID_FILE"
    fi
else
    echo "No se encontro PID file. La aplicacion no parece estar corriendo."
    # Intentar buscar el proceso
    PID=$(pgrep -f "newhype-backend")
    if [ -n "$PID" ]; then
        echo "Proceso encontrado por nombre (PID: $PID). Deteniendo..."
        kill "$PID"
    fi
fi
```

Dar permisos de ejecucion (via SSH):
```bash
chmod +x ~/New-Hype-Project/start.sh
chmod +x ~/New-Hype-Project/stop.sh
```

---

## PASO 4: Seed del Superadmin en produccion

### 4.1 Via phpMyAdmin (cPanel)

1. Entrar a **cPanel** > **phpMyAdmin**
2. Seleccionar la base de datos `ventas_newhype_prod`
3. Ir a la pestana **SQL**
4. Pegar el contenido de `seed_superadmin_prod.sql`:

```sql
INSERT INTO usuarios_plataforma
    (email, username, password_hash, nombre_completo, tiene_2fa, estado, created_at, updated_at)
VALUES
    ('superadmin@newhype.pe', 'superadmin',
     '$2a$10$rqgEn58GBDw37SDT6foEVOSlucHVgW1Q2EdIbuYjbegqqqHL.SlyW',
     'Super Administrador', 0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
```

5. Clic en **Ejecutar / Go**
6. Verificar: debe aparecer 1 fila afectada

### 4.2 Via SSH (alternativa)

```bash
mysql -u ventas_newhype_prod -p ventas_newhype_prod < ~/New-Hype-Project/seed_superadmin_prod.sql
```
Ingresa la password `Tarapoto2026` cuando la solicite.

---

## PASO 5: Ejecutar el JAR en cPanel

### Opcion A: Via SSH (RECOMENDADO)

Si tu hosting tiene acceso SSH:

```bash
# 1. Conectar via SSH
ssh ventas@spring.informaticapp.com

# 2. Verificar Java
java -version
# Debe mostrar: openjdk version "17.x.x" o superior

# 3. Si Java no esta instalado, verificar ruta alternativa:
/usr/lib/jvm/java-17/bin/java -version
# O usar el selector de Java de cPanel:
# cPanel > Software > Select PHP/Java Version

# 4. Iniciar la aplicacion
cd ~/New-Hype-Project
bash start.sh

# 5. Verificar logs
tail -f ~/logs/newhype-backend-console.log

# 6. Para detener:
bash stop.sh
```

### Opcion B: Via Cron Job (si NO hay SSH)

Si tu hosting NO tiene acceso SSH, puedes usar un Cron Job para iniciar la aplicacion:

1. Ir a **cPanel** > **Cron Jobs** (Tareas Cron)
2. Crear un cron job que ejecute **una sola vez al reiniciar**:

**Configuracion del Cron Job:**
- Minuto: `*/5` (cada 5 minutos)
- Hora: `*`
- Dia: `*`
- Mes: `*`
- Dia de semana: `*`

**Comando:**
```bash
if ! pgrep -f "newhype-backend" > /dev/null; then cd ~/New-Hype-Project && nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod -Xmx512m > ~/logs/newhype-backend-console.log 2>&1 & fi
```

**Que hace:** Cada 5 minutos verifica si el proceso esta corriendo. Si no esta corriendo, lo inicia. Esto garantiza que la aplicacion se reinicie automaticamente si cae.

**Para desactivar:** Simplemente elimina o comenta el cron job desde cPanel.

### Opcion C: Via cPanel Application Manager (si esta disponible)

Algunos hostings con cPanel ofrecen un **Application Manager** para Java:

1. Ir a **cPanel** > **Setup Node.js App** o **Application Manager**
2. Crear nueva aplicacion:
   - **Application root:** `New-Hype-Project`
   - **Application startup file:** `newhype-backend-0.0.1-SNAPSHOT.jar`
   - **Java version:** 17
3. Configurar variables de entorno:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `JAVA_OPTS=-Xmx512m -Xms256m`

**Nota:** Esta opcion depende del proveedor de hosting. No todos los cPanel tienen Application Manager para Java.

---

## PASO 6: Configurar dominio / proxy inverso

### 6.1 Si el dominio apunta directamente al servidor cPanel

La aplicacion Spring Boot escucha en el puerto `8080`. Para que sea accesible via `https://spring.informaticapp.com/New-Hype-Project/`, necesitas un **proxy inverso**.

### 6.2 Configurar proxy con .htaccess

En `~/public_html/` (o el document root del subdominio `spring.informaticapp.com`), crear/editar `.htaccess`:

```apache
RewriteEngine On

# Proxy inverso: /New-Hype-Project/ -> localhost:8080/New-Hype-Project/
RewriteCond %{REQUEST_URI} ^/New-Hype-Project/ [NC]
RewriteRule ^(.*)$ http://127.0.0.1:8080/$1 [P,L]

# Asegurar que las cabeceras se pasen correctamente
ProxyPreserveHost On
ProxyPassReverse /New-Hype-Project/ http://127.0.0.1:8080/New-Hype-Project/
```

**IMPORTANTE:** Para que `mod_proxy` funcione, el hosting debe tenerlo habilitado. Si no funciona, pregunta al soporte del hosting si `mod_proxy` y `mod_proxy_http` estan activos.

### 6.3 Alternativa: Puerto directo (sin proxy)

Si `mod_proxy` no esta disponible, puedes acceder directamente por puerto:

```
http://spring.informaticapp.com:8080/New-Hype-Project/swagger-ui.html
```

Para esto, el puerto 8080 debe estar abierto en el firewall del servidor. Puedes solicitarlo al soporte del hosting.

### 6.4 Alternativa: Cloudflare Tunnel o ngrok (temporal)

Para demostraciones temporales al docente:

```bash
# Desde SSH en el servidor
# Instalar cloudflared o usar ngrok
ngrok http 8080
```

Esto genera una URL publica temporal (ej: `https://abc123.ngrok.io/New-Hype-Project/`).

---

## PASO 7: Verificacion del despliegue

### 7.1 Verificar que el JAR esta corriendo

```bash
# Via SSH
ps aux | grep newhype
# Debe mostrar el proceso java con el JAR

# Ver logs recientes
tail -100 ~/logs/newhype-backend-console.log
# Buscar: "Started NewHypeBackendApplication in X seconds"
```

### 7.2 Verificar register.html

Abrir en el navegador:
```
https://spring.informaticapp.com/New-Hype-Project/register.html
```

**Resultado esperado:** Pagina de registro "NEW HYPE - Crear Cuenta" con formulario funcional.

### 7.3 Verificar Swagger UI

Abrir en el navegador:
```
https://spring.informaticapp.com/New-Hype-Project/swagger-ui.html
```

**Resultado esperado:** Swagger UI mostrando 169 endpoints organizados por tags.

### 7.4 Verificar login del superadmin

```bash
curl -X POST https://spring.informaticapp.com/New-Hype-Project/api/v1/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername": "superadmin@newhype.pe", "password": "SuperAdmin2026"}'
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "scope": "platform",
    "user": {
      "email": "superadmin@newhype.pe",
      "rol": "SUPERADMIN"
    }
  }
}
```

### 7.5 Verificar endpoint count en Swagger

```bash
curl -s https://spring.informaticapp.com/New-Hype-Project/v3/api-docs | python3 -c "
import json, sys
data = json.load(sys.stdin)
count = sum(len([m for m in methods if m in ['get','post','put','patch','delete']])
            for methods in [list(data['paths'][p].keys()) for p in data['paths']])
print(f'Endpoints: {count}/169')
"
```

---

## PASO 8: Solucion de problemas comunes

### 8.1 "Java not found" o version incorrecta

```bash
# Ver versiones disponibles
ls /usr/lib/jvm/

# Usar ruta completa
/usr/lib/jvm/java-17-openjdk/bin/java -jar newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# Editar start.sh para usar ruta completa:
# Cambiar "java" por "/usr/lib/jvm/java-17-openjdk/bin/java"
```

### 8.2 "Port 8080 already in use"

```bash
# Encontrar quien usa el puerto
lsof -i :8080

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en application-prod.yml:
# server.port: 8081
# Y actualizar el proxy en .htaccess
```

### 8.3 "Access denied for user" (MySQL)

```bash
# Verificar credenciales
mysql -u ventas_newhype_prod -pTarapoto2026 -e "SELECT 1;" ventas_newhype_prod

# Si falla, en cPanel > MySQL Databases:
# 1. Verificar que el usuario esta asociado a la BD
# 2. Verificar ALL PRIVILEGES
# 3. Verificar que la password es correcta
```

### 8.4 "Communications link failure" (MySQL no accesible)

```bash
# Verificar que MySQL esta corriendo
mysqladmin ping

# Verificar el host correcto en application-prod.yml
# En cPanel siempre es localhost:3306
```

### 8.5 La aplicacion arranca pero no responde externamente

```bash
# 1. Verificar que arranco
curl http://localhost:8080/New-Hype-Project/swagger-ui.html
# Si responde localmente pero no externamente -> problema de proxy/firewall

# 2. Verificar .htaccess
cat ~/public_html/.htaccess

# 3. Verificar que mod_proxy esta activo
# Contactar al soporte del hosting
```

### 8.6 Logs vacios o sin archivo

```bash
# Crear directorio de logs si no existe
mkdir -p ~/logs

# Verificar permisos
chmod 755 ~/logs

# Los logs tambien van a la consola:
tail -f ~/logs/newhype-backend-console.log
```

### 8.7 Memoria insuficiente (hosting compartido)

Si el hosting tiene limite de RAM bajo (ej: 512MB):

```bash
# Reducir memoria de la JVM
java -jar newhype-backend-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  -Xmx256m -Xms128m
```

---

## PASO 9: URLs finales del despliegue

| Recurso | URL |
|---------|-----|
| **register.html** | `https://spring.informaticapp.com/New-Hype-Project/register.html` |
| **Swagger UI** | `https://spring.informaticapp.com/New-Hype-Project/swagger-ui.html` |
| **API Docs (JSON)** | `https://spring.informaticapp.com/New-Hype-Project/v3/api-docs` |
| **Login Superadmin** | `POST https://spring.informaticapp.com/New-Hype-Project/api/v1/platform/auth/login` |
| **Login Tenant** | `POST https://spring.informaticapp.com/New-Hype-Project/api/v1/auth/login` |
| **Register Tenant** | `POST https://spring.informaticapp.com/New-Hype-Project/api/v1/auth/register` |
| **Storefront** | `GET https://spring.informaticapp.com/New-Hype-Project/api/v1/storefront/productos?tenantId=1` |

---

## PASO 10: Checklist para el docente

### Punto 1: Backend desplegado y funcionando

| Verificacion | Como verificar | Estado |
|-------------|----------------|--------|
| JAR ejecutandose en cPanel | `ps aux | grep newhype` en SSH | [ ] |
| register.html accesible | Navegar a URL en el navegador | [ ] |
| Swagger UI muestra 169 endpoints | Navegar a Swagger URL | [ ] |
| Login superadmin funciona | POST con Postman/curl | [ ] |

### Punto 2: Flujo de negocio completo E2E

| Paso del flujo | Endpoint | Estado |
|----------------|----------|--------|
| Superadmin login | POST /platform/auth/login | [ ] |
| Crear plan | POST /platform/planes | [ ] |
| Crear tenant | POST /platform/tenants | [ ] |
| Tenant login | POST /auth/login | [ ] |
| Configurar empresa | PUT /configuracion/empresa | [ ] |
| Crear serie BOLETA | POST /configuracion/series-comprobantes | [ ] |
| Crear metodo pago | POST /configuracion/metodos-pago | [ ] |
| Crear almacen | POST /almacenes | [ ] |
| Crear caja | POST /configuracion/cajas-registradoras | [ ] |
| Crear categoria | POST /configuracion/categorias | [ ] |
| Crear producto | POST /productos | [ ] |
| Ajustar stock +50 | POST /inventario/ajustes | [ ] |
| Crear cliente | POST /entidades | [ ] |
| Abrir sesion caja | POST /caja/sesiones | [ ] |
| Crear venta | POST /ventas | [ ] |
| Confirmar pago | POST /ventas/{id}/confirmar-pago | [ ] |
| Ver reportes (7) | GET /reportes/* | [ ] |
| Storefront: catalogo | GET /storefront/productos | [ ] |
| Storefront: registrar | POST /storefront/auth/register | [ ] |
| Storefront: crear pedido | POST /storefront/pedidos | [ ] |

### Punto 3: Documentacion tecnica

| Documento | Ubicacion | Contenido |
|-----------|-----------|-----------|
| REPORTE_FINAL_BACKEND.md | `docs/` | 12 secciones, metricas, arquitectura, fases |
| DESPLIEGUE_CPANEL.md | `docs/` | Esta guia de despliegue |
| Postman Collection | `postman/` | 44 requests con tests automaticos |
| Postman Environment | `postman/` | 23 variables de entorno |
| E2E Smoke Test | `postman/` | Script Python: 33/33 PASS |
| Seed SQL (dev) | `postman/` | seed_superadmin.sql |
| Seed SQL (prod) | `postman/` | seed_superadmin_prod.sql |

---

## RESUMEN DE ARCHIVOS DEL PROYECTO

```
New-Hype-Project/
├── newhype-backend/
│   ├── src/main/
│   │   ├── java/com/newhype/backend/   (286 archivos Java)
│   │   └── resources/
│   │       ├── application.yaml         (perfil default: dev local)
│   │       ├── application-prod.yml     (perfil prod: cPanel)
│   │       └── static/
│   │           └── register.html        (pagina de registro)
│   ├── target/
│   │   └── newhype-backend-0.0.1-SNAPSHOT.jar  (68 MB, ejecutable)
│   └── pom.xml
├── docs/
│   ├── REPORTE_FINAL_BACKEND.md
│   └── DESPLIEGUE_CPANEL.md             (esta guia)
├── postman/
│   ├── NewHype_E2E_PruebaFinal.postman_collection.json
│   ├── NewHype_Environment.postman_environment.json
│   ├── seed_superadmin.sql              (dev)
│   ├── seed_superadmin_prod.sql         (produccion)
│   ├── e2e_smoke_test.py
│   └── fix_hash.sql
└── database/
    └── schema.sql                       (51 tablas)
```

---

## ESTRUCTURA EN cPanel (destino)

```
/home/ventas/
├── New-Hype-Project/
│   ├── newhype-backend-0.0.1-SNAPSHOT.jar   (subido via File Manager)
│   ├── seed_superadmin_prod.sql              (subido via File Manager)
│   ├── start.sh                              (creado manualmente)
│   ├── stop.sh                               (creado manualmente)
│   └── app.pid                               (generado al iniciar)
├── logs/
│   ├── newhype-backend.log                   (log de la app via logback)
│   └── newhype-backend-console.log           (log de consola via nohup)
└── public_html/
    └── .htaccess                             (proxy inverso a :8080)
```

---

## COMANDO RAPIDO DE DESPLIEGUE

Para referencia rapida, estos son los pasos minimos una vez que todo esta configurado:

```bash
# Desde SSH en cPanel:

# 1. Subir nuevo JAR (si hay actualizacion)
# (via cPanel File Manager o scp)

# 2. Detener version anterior
cd ~/New-Hype-Project && bash stop.sh

# 3. Iniciar nueva version
bash start.sh

# 4. Verificar
tail -f ~/logs/newhype-backend-console.log
# Esperar: "Started NewHypeBackendApplication in X seconds"

# 5. Test rapido
curl -s http://localhost:8080/New-Hype-Project/api/v1/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"superadmin@newhype.pe","password":"SuperAdmin2026"}' | head -c 100
```
