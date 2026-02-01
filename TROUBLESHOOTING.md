# 🔧 TROUBLESHOOTING - Solución de Problemas

**Objetivo:** Resolver errores comunes rápidamente  
**Búsqueda:** Usa Ctrl+F para encontrar tu error  
**Si tu error no está aquí:** Revisa logs completos o contacta al Tech Lead

---

## 📑 Índice de Problemas

- [🐳 Problemas Docker](#docker)
- [📦 Problemas Node/pnpm](#node)
- [🔀 Problemas Git](#git)
- [⚛️ Problemas Frontend/React](#frontend)
- [🗄️ Problemas MySQL](#mysql)
- [💻 Problemas Windows Específicos](#windows)

---

## 🐳 DOCKER {#docker}

### ❌ "Port 3307 is already in use"

**Solución:**

```bash
# Opción 1: Limpiar volumen y reiniciar
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d

# Opción 2: Cambiar puerto en docker-compose.dev.yml
# Línea: ports: ["3308:3306"]  (cambiar de 3307 a 3308)
```

---

### ❌ "Docker daemon is not running"

**Soluciones:**

#### Windows:
1. Abrir Docker Desktop
2. Esperar a que inicie (icono en bandeja)
3. Reintentar

#### Linux:
```bash
sudo systemctl start docker
```

---

### ❌ "WSL 2 not installed" (Windows)

```bash
# Abrir PowerShell como Admin
wsl --install

# Reiniciar Windows
```

---

### ⚠️ "Container exited with code 1"

```bash
# Ver logs detallados
docker logs erp-mysql-dev

# Reset completo
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
```

---

## 📦 NODE/pnpm {#node}

### ❌ "pnpm: command not found"

```bash
npm install -g pnpm
pnpm --version
```

---

### ❌ "Node version mismatch"

```bash
# Usar nvm
nvm install 18
nvm use 18

node --version  # Verificar
```

---

### ❌ "pnpm install" falla

```bash
# Limpiar cache
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### ❌ "Cannot find module '@monorepo/shared-types'"

```bash
# Reinstalar workspace
pnpm install -r

# Compilar para verificar
npx tsc --noEmit
```

---

## 🔀 GIT {#git}

### ❌ "Merge conflict"

```bash
# Cancelar y hacer rebase
git merge --abort
git fetch origin
git rebase origin/main

# Resolver conflictos en VS Code (<<<, ===, >>>)
# Luego:
git add .
git rebase --continue

# Push forzado
git push --force-with-lease origin feature/tu-rama
```

---

### ❌ "Your branch is behind origin/main"

```bash
git fetch origin
git rebase origin/main
git push origin feature/tu-rama
```

---

### ❌ "rejected (non-fast-forward update)"

```bash
git fetch origin
git rebase origin/feature/tu-rama
git push --force-with-lease origin feature/tu-rama
```

---

## ⚛️ FRONTEND/REACT {#frontend}

### ❌ "Cannot find name 'usexxx'"

```bash
# Verificar que está exportado en index.ts
# packages/shared-types/src/index.ts
# frontend/src/modules/[modulo]/index.ts

# Compilar
npx tsc --noEmit

# Limpiar cache si persiste
rm -rf node_modules && pnpm install
```

---

### ❌ "usexxx must be used within xxxProvider"

Envolver componente en Provider:

```typescript
// ✅ CORRECTO
<ProductosProvider>
  <MyComponent />
</ProductosProvider>
```

---

### ❌ "Cannot read property 'xxxxx' of undefined"

Verificar inicialización en Context:

```typescript
// ✅ CORRECTO
const estadoInicial: ProductosState = {
  productos: [],  // ← Inicializado
};
```

---

### ❌ "Module not found: Error: Can't resolve"

```bash
# Verificar que el archivo existe
ls frontend/src/modules/productos/services/

# Verificar path correcto
# Compilar
npx tsc --noEmit
```

---

## 🗄️ MYSQL {#mysql}

### ❌ "Connection refused at port 3307"

```bash
# Verificar que MySQL está running
docker ps | grep erp-mysql-dev

# Si no está, iniciar
docker compose -f docker-compose.dev.yml up -d

# Esperar 15 segundos
sleep 15

# Ver logs
docker compose logs mysql | tail -30
```

---

### ❌ "Access denied for user 'devuser'"

```bash
# Verificar credenciales en docker-compose.dev.yml
# MYSQL_USER: devuser
# MYSQL_PASSWORD: devpass

# Reset password
mysql -h localhost -P 3307 -u root -proot
ALTER USER 'devuser'@'%' IDENTIFIED BY 'devpass';
```

---

### ❌ "Init scripts no corren" / "No hay datos"

```bash
# Verificar archivos SQL
ls database/init/

# Ver logs
docker logs erp-mysql-dev | grep -i "init"

# Reset completo
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
sleep 30

# Verificar datos
docker exec erp-mysql-dev mysql -u devuser -pdevpass erp_db -e "SHOW TABLES;"
```

---

## 💻 WINDOWS ESPECÍFICO {#windows}

### ❌ "WSL 2 not found"

```powershell
# Como Admin
wsl --install
# Reiniciar Windows
```

---

### ❌ "docker: The term 'docker' is not recognized"

```powershell
# Verificar Docker Desktop está abierto
# Reiniciar PowerShell como Admin
docker --version
```

---

### ❌ "Hyper-V no habilitado"

```powershell
# Como Admin
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
# Reiniciar Windows
```

---

## 🎯 Quick Reference

| Error | Solución Rápida |
|-------|----------------|
| Port 3307 in use | `docker compose down -v && up -d` |
| Docker not running | Abrir Docker Desktop |
| pnpm not found | `npm install -g pnpm` |
| Module not found | `pnpm install` |
| MySQL no responde | `docker ps`, ver logs |
| Git conflict | `git rebase origin/main` |
| tsc fails | `npx tsc --noEmit`, revisar tipos |

---

**Última actualización:** 2026-02-01  
**Versión:** 1.0  
**Responsable:** Tech Lead
