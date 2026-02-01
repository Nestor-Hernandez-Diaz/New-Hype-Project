# 🔧 FASE 2: CONSOLIDACIÓN Y LIMPIEZA - Plan de Acción

**Fecha:** 1 de Febrero, 2026  
**Estado:** 🔄 EN EJECUCIÓN  
**Responsable:** Tech Lead (Config Cleanup Plan)

---

## 📋 Cambios a Realizarse

### 1. ✅ Consolidar tsconfig (SEGURO)

**Decisión:** Mantener ambos archivos - `tsconfig.json` es referencia que apunta a `tsconfig.app.json` y `tsconfig.node.json`

**Razón:**
- `tsconfig.json` = project root config (pattern estándar TypeScript)
- `tsconfig.app.json` = configuración específica de aplicación
- Este patrón permite `"files": []` + references, que es el recomendado en TypeScript docs

**Acción:** NO ELIMINAR - Es el patrón correcto

---

### 2. ✅ vercel.json (MOVER A RAÍZ)

**Análisis:**
```
frontend/vercel.json: Deployment config de Vite (es global para proyecto)
```

**Decisión:** Mover a raíz porque:
- Deployment es a nivel de proyecto, no frontend específicamente
- Vercel saca config del root típicamente
- Reduce duplicados

**Acción:** Mover `frontend/vercel.json` → raíz

---

### 3. ✅ tsconfig.test.json (MANTENER)

**Análisis:**
```json
{
  "include": [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.ts",
    "src/**/*.spec.tsx",
    "src/setupTests.ts"
  ]
}
```

**Razón para mantener:**
- Vitest/Jest necesita config separada para tests
- Include patterns son específicos de testing
- Separate config permite `noEmit: true` sin afectar build

**Acción:** MANTENER

---

### 4. ❌ test-ventas-auto.js (ELIMINAR)

**Análisis:**
- Script manual de Puppeteer, 71 líneas
- No integrado en CI/CD (no está en package.json scripts)
- Hay tests modernos en `tests/e2e/` con Playwright
- Puppeteer es dependencia vieja, Playwright es estándar moderno

**Acción:** ELIMINAR - Duplicado con `playwright.config.ts` + `tests/e2e/`

---

### 5. ✅ eslint.config.js (MANTENER)

**Análisis:**
- ESLint 9.x usa formato flat config (eslint.config.js)
- Moderno, recomendado por ESLint

**Acción:** MANTENER

---

### 6. ✅ playwright.config.ts (MANTENER)

**Análisis:**
- Configuración de E2E tests con Playwright
- Usado por `pnpm run test:e2e`

**Acción:** MANTENER

---

## 🎯 Cambios a Ejecutar

### Cambio 1: Mover vercel.json a raíz

```bash
# Frontend → Raíz
cp frontend/vercel.json vercel.json
rm frontend/vercel.json
```

### Cambio 2: Eliminar test-ventas-auto.js

```bash
# Eliminar script manual antiguo
rm frontend/test-ventas-auto.js
```

### Cambio 3: Actualizar .gitignore (si es necesario)

```bash
# Asegurar que backup-fase1 no está versionado
echo "backup-fase1/" >> .gitignore
```

---

## ✅ Plan de Verificación Post-Cambios

```bash
# 1. TypeScript compila
npx tsc --noEmit

# 2. Vite resuelve config
npx vite build --dry-run

# 3. Archivos backup están seguros
ls backup-fase1/

# 4. Cambios esperados
ls -la vercel.json          # Debe existir en raíz
ls -la frontend/vercel.json # Debe NO existir
ls -la frontend/test-ventas-auto.js # Debe NO existir
```

---

## ⚠️ Rollback Plan

Si algo falla:

```bash
# 1. Restaurar desde backup
cp backup-fase1/frontend/vercel.json frontend/

# 2. Restaurar test script
git checkout frontend/test-ventas-auto.js  # Si está en git
```

---

## Archivo de Estado

Este archivo: `FASE2_CONSOLIDACION_PLAN.md`

Generado por: Config Cleanup Automation  
Tiempo estimado Fase 2: ~3 minutos

