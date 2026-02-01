# 🚀 ONBOARDING - New-Hype-Project

**Tiempo estimado:** 25-30 minutos  
**Requisitos previos:** Git, VS Code, Docker Desktop, pnpm  
**Objetivo:** Que cualquier desarrollador nuevo esté productive en menos de 30 min.

---

## 📋 Checklist Rápido

- [ ] Clonar repositorio
- [ ] Instalar dependencias (pnpm)
- [ ] Instalar Docker Desktop
- [ ] Levantar MySQL local
- [ ] Conectar a BD con DBeaver
- [ ] Levantar frontend local
- [ ] Instalar extensiones VS Code
- [ ] Revisar documentación (WORKFLOW.md, QA-PROTOCOL.md)

---

## 🔧 PASO 1: Clonar y Configurar Repositorio

### 1.1 Clonar proyecto

```bash
# HTTPS (más fácil sin SSH setup)
git clone https://github.com/Nestor-Hernandez-Diaz/New-Hype-Project.git
cd New-Hype-Project

# O SSH (si tienes configurado)
git clone git@github.com:Nestor-Hernandez-Diaz/New-Hype-Project.git
cd New-Hype-Project
```

### 1.2 Verificar rama y actualizar

```bash
# Verificar que estás en main
git branch

# Actualizar a la última versión
git fetch origin
git pull origin main
```

---

## 📦 PASO 2: Instalar Dependencias Node

### 2.1 Verificar versión de Node

```bash
# Recomendado: Node 18.x o superior
node --version

# Si necesitas cambiar de versión (usa nvm o fnm)
# nvm install 18
# nvm use 18
```

### 2.2 Instalar pnpm (si no lo tienes)

```bash
# Opción 1: npm (global)
npm install -g pnpm

# Opción 2: corepack (recomendado Node 16+)
corepack enable

# Verificar instalación
pnpm --version
```

### 2.3 Instalar dependencias del proyecto

```bash
# En la raíz del proyecto
pnpm install

# Si hay problemas con conflictos, limpiar cache
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 🐳 PASO 3: Instalar y Configurar Docker

### 3.1 Instalar Docker Desktop

**Windows:**
1. Descargar desde: https://www.docker.com/products/docker-desktop
2. Ejecutar instalador
3. Reiniciar Windows
4. Permitir WSL 2 cuando Docker lo solicite

**macOS:**
1. Descargar desde: https://www.docker.com/products/docker-desktop
2. Ejecutar .dmg y arrastrar Docker.app a Applications
3. Permitir acceso con contraseña del sistema

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Reiniciar sesión
```

### 3.2 Verificar instalación

```bash
# Verificar que Docker está corriendo
docker --version
docker ps

# Esperado: "Docker version 20.x.x" y lista de contenedores vacía
```

### 3.3 Verificar que MySQL 8.0 está disponible

```bash
# Ver si la imagen ya existe localmente
docker images | grep mysql

# Si no aparece mysql:8.0, será descargada automáticamente al hacer docker compose up
```

---

## 🗄️ PASO 4: Levantar MySQL Local

### 4.1 Desde PowerShell (Windows)

**Opción A: Comando directo (simple)**

```powershell
# Desde C:\Dev\New-Hype-Project
docker compose -f docker-compose.dev.yml up -d

# Esperar 5-10 segundos
Start-Sleep -Seconds 10

# Verificar que está corriendo
docker ps | grep erp-mysql-dev
```

**Opción B: Script PowerShell (recomendado para uso frecuente)**

```powershell
# Si tienes scripts/start-db.ps1 ya creado
.\scripts\start-db.ps1 -Action start

# Ver logs
.\scripts\start-db.ps1 -Action logs

# Ver estado
.\scripts\start-db.ps1 -Action status
```

### 4.2 Desde Terminal Linux/macOS

```bash
# Desde directorio raíz
docker compose -f docker-compose.dev.yml up -d

# Esperar a que inicie
sleep 10

# Verificar
docker ps | grep erp-mysql-dev

# Ver logs
docker compose -f docker-compose.dev.yml logs mysql | tail -30

# Buscar "ready for connections" en logs
docker compose -f docker-compose.dev.yml logs mysql | grep "ready"
```

### 4.3 Verificar que está listo

```bash
# Debe mostrar algo como:
# NAMES: erp-mysql-dev
# STATUS: Up X seconds (healthy)
# PORTS: 0.0.0.0:3307->3306/tcp

# Si ves "(unhealthy)" o "Exited", ver TROUBLESHOOTING.md
```

---

## 💻 PASO 5: Conectar a Base de Datos con DBeaver

### 5.1 Descargar e instalar DBeaver Community

1. Ir a: https://dbeaver.io/download/
2. Descargar versión Community (gratuita)
3. Instalar y abrir

### 5.2 Crear conexión a MySQL

En DBeaver:

1. **Click derecho** en "Database" → **"New Database Connection"**
2. **Seleccionar "MySQL"** → Click **"Next >"**
3. **Llenar datos:**
   - **Server Host:** `localhost`
   - **Port:** `3307` (⚠️ NO 3306, es 3307)
   - **Database:** `erp_db`
   - **Username:** `devuser`
   - **Password:** `devpass`
   - ✅ Marcar: **"Save password locally"**

4. Click **"Test Connection"** → Debe mostrar ✅ **"Connected"**
5. Click **"Finish"** → Conexión guardada

### 5.3 Explorar base de datos

En el panel izquierdo de DBeaver:

```
MySQL - localhost:3307
└── erp_db
    ├── categorias (5 registros: Camisetas, Pantalones, etc.)
    ├── productos (13 registros: Camiseta Polo, Jeans, etc.)
    ├── almacenes (3 registros: Principal, Secundario, Tránsito)
    ├── stock_almacen (distribución por almacén)
    ├── kardex (movimientos iniciales)
    ├── usuarios (4 registros: admin, vendedor1, vendedor2, almacenero)
    └── entidades_comerciales (3 clientes)
```

### 5.4 Ejecutar query de prueba

**Botón derecho en tabla `productos`** → **"Select Rows"**

Esperado: Ver 13 productos de ropa con campos:
- `codigo_producto` (ej: CAM-POL-001)
- `nombre` (ej: Camiseta Polo Básica)
- `talla` (ej: M, L, S)
- `color` (ej: Blanco, Azul Marino)
- `marca` (ej: Polo Ralph Lauren)
- `material` (ej: Algodón 100%)
- `precio_venta` (ej: 79.90)
- `stock_actual` (ej: 150)

---

## ⚛️ PASO 6: Levantar Frontend Local

### 6.1 Instalar dependencias del frontend

```bash
# Desde raíz del proyecto
cd frontend

# Instalar
pnpm install

# Si es la primera vez, puede tomar 2-3 minutos
```

### 6.2 Iniciar servidor de desarrollo

```bash
# Desde frontend/
pnpm dev

# Esperado:
# ✓ built in Xs
# ➜ Local: http://localhost:5173/
# ➜ press h to show help
```

### 6.3 Abrir en navegador

1. **Abrir Chrome/Firefox/Edge**
2. **Ir a:** http://localhost:5173
3. **Esperado:** Ver página de login

### 6.4 Verificar que todo funciona

```bash
# En Chrome, abrir DevTools (F12)
# Ir a: Console
# Verificar que NO hay errores rojos (warnings de React son OK)

# Si todo está bien:
# ✅ Consola limpia (sin errores tipo "Cannot read property")
# ✅ Aplicación respondiendo a clics
```

---

## 🔧 PASO 7: Extensiones VS Code Recomendadas

Abre VS Code y ve a **Extensiones** (Ctrl+Shift+X):

### Obligatorias

| Extensión | ID | Propósito |
|-----------|----|-----------| 
| **ES7+ React/Redux/React-Native snippets** | `dsznajder.es7-react-js-snippets` | Snippets para React |
| **TypeScript Vue Plugin** | `Vue.volar` | Soporte TypeScript |
| **Prettier - Code formatter** | `esbenp.prettier-vscode` | Formatear código |
| **ESLint** | `dbaeumer.vscode-eslint` | Linting JavaScript |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Autocomplete Tailwind |

### Recomendadas

| Extensión | ID | Propósito |
|-----------|----|-----------| 
| **Thunder Client** | `rangav.vscode-thunder-client` | HTTP client (alternativa Postman) |
| **MySQL** | `formulahendry.vscode-mysql` | Gestor MySQL en VS Code |
| **Git Graph** | `mhutchie.git-graph` | Visualizar git history |
| **REST Client** | `humao.rest-client` | HTTP requests en archivo |

**Comando rápido para instalar:**

```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
```

---

## 📚 PASO 8: Revisar Documentación Clave

Ahora que todo está setup, lee estas guías:

1. **[WORKFLOW.md](./WORKFLOW.md)** (15 min)
   - Cómo hacer un refactor de módulo
   - Convenciones de nombres para mocks
   - Flujo Git y commits

2. **[QA-PROTOCOL.md](./QA-PROTOCOL.md)** (10 min)
   - Cómo hacer QA antes de PR
   - Template de verificación
   - Cuándo marcar "Listo para merge"

3. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** (como referencia)
   - Errores comunes y cómo resolverlos
   - Usar solo cuando tengas problemas

4. **[AGENTS.md](./AGENTS.md)** (lectura profunda, opcional ahora)
   - Reglas del proyecto completo
   - Stack tecnológico detallado
   - Protocolo de verificación MCP

---

## ✅ Verificación Final: Todo Funciona

Ejecuta este checklist para confirmar que todo está bien:

```bash
# 1. TypeScript compila sin errores
cd C:\Dev\New-Hype-Project
npx tsc --noEmit

# Esperado: Sin output (silencio = éxito)

# 2. Frontend compila
cd frontend
pnpm run build

# Esperado: "built in Xs"

# 3. MySQL está corriendo
docker ps | grep erp-mysql-dev

# Esperado: Estado "Up X seconds (healthy)"

# 4. DBeaver conecta
# En DBeaver, expandir "erp_db" y ver las tablas

# 5. Frontend sirve sin errores
pnpm dev
# En Chrome DevTools (F12), Console debe estar limpia
```

**Si todo pasa:** ✅ **¡Estás listo para empezar a refactorizar!**

**Si algo falla:** 📖 Revisa [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 🎯 Próximos Pasos

1. **Lee [WORKFLOW.md](./WORKFLOW.md)** para entender cómo refactorizar un módulo
2. **Crea tu primer branch:** `git checkout -b feature/refactor-productos-mocks`
3. **Sigue el patrón del módulo Inventario** como referencia (ya está refactorizado)
4. **Antes de hacer PR, usa [QA-PROTOCOL.md](./QA-PROTOCOL.md)**

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Docker no abre | WSL 2 no instalado (Windows) → Reinstalar Docker Desktop |
| Puerto 3307 ocupado | `docker compose -f docker-compose.dev.yml down -v && up -d` |
| pnpm install falla | `pnpm store prune && rm -rf node_modules && pnpm install` |
| Frontend no inicia | `pnpm install` + `pnpm dev` (reintentar) |
| MySQL no tiene datos | Los scripts SQL corren automáticamente, pero ver `docker logs erp-mysql-dev` |

**Para problemas más complejos:** Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Última actualización:** 2026-02-01  
**Versión:** 1.0  
**Responsable:** Tech Lead  
**Estado:** ✅ ACTIVO
