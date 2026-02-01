# 🛡️ QA-PROTOCOL - Verificación Obligatoria Pre-PR

**Objetivo:** Asegurar que cada PR sea de calidad antes de merge  
**Tiempo estimado:** 10-15 minutos por PR  
**Responsable:** Desarrollador (auto-verificación) + Tech Lead (code review)

---

## 📋 Checklist Rápido

- [ ] TypeScript compila sin errores
- [ ] Frontend compila sin errores  
- [ ] Console limpia (sin errores rojos)
- [ ] Datos mock visibles en DOM
- [ ] Latencia simulada observable (~600-800ms)
- [ ] useReducer funciona correctamente
- [ ] Reporte QA completado

---

## 🔍 VERIFICACIÓN 1: Compilación TypeScript

### Paso 1.1: Compilar sin emitir código

```bash
# Desde raíz del proyecto
npx tsc --noEmit

# Esperado: SIN OUTPUT (silencio = éxito)

# Si hay errores:
# ❌ "error TS2322: Type 'string' is not assignable to type 'EstadoProducto'"
# ↓ Revisar tipos en shared-types y Mock API
```

### Paso 1.2: Si hay errores

| Error | Solución |
|-------|----------|
| `Cannot find module '@monorepo/shared-types'` | Verificar export en `packages/shared-types/src/index.ts` |
| `Type 'string' is not assignable to type 'Enum'` | Usar `as EstadoProducto` o enviar enum correcto |
| `Property 'xxxx' is missing in type` | Agregar el campo faltante a la interface |

---

## ⚛️ VERIFICACIÓN 2: Compilación Frontend

### Paso 2.1: Construir frontend

```bash
cd frontend
pnpm run build

# Esperado:
# ✓ 123 modules transformed in 3.2s
# dist/index.html 15.45 kB
```

### Paso 2.2: Si hay errores

```bash
pnpm run build 2>&1 | tail -50
```

---

## 💻 VERIFICACIÓN 3: Runtime - Chrome DevTools

### Paso 3.1: Iniciar servidor

```bash
# Terminal 1: Desde frontend/
pnpm dev

# Esperado: ➜ Local: http://localhost:5173/
```

### Paso 3.2: Abrir DevTools

```
Atajo: F12 o Ctrl+Shift+I
Tab: Console
```

### Paso 3.3: Verificar Console

✅ **CORRECTO:**
```
(vacío o solo warnings amarillos de React)
```

❌ **INCORRECTO:**
```
Uncaught TypeError: Cannot read property 'nombre' of undefined
Uncaught ReferenceError: useProductos is not defined
```

---

## 📊 VERIFICACIÓN 4: Data Binding - DOM

### Paso 4.1: Buscar dato en el DOM

**En DevTools - Tab: Elements**

```
Atajo: Ctrl+F
Buscar: "Camiseta Polo" (dato específico del mock)
```

✅ **Esperado:** Se encuentra el texto  
❌ **No encontrado:** Verificar que Mock API está conectado

---

## ⏱️ VERIFICACIÓN 5: Latencia Simulada

### Paso 5.1: Medir tiempo de carga

**En Console:**

```javascript
console.time('load');
// [Hacer acción]
console.timeEnd('load');

// Esperado: ~600-800ms
```

---

## 🔧 VERIFICACIÓN 6: useReducer Funciona

Validar que:

- [ ] Cargar datos inicial: `FETCH_SUCCESS` ejecutado
- [ ] Error en operación: `FETCH_ERROR` ejecutado
- [ ] Loading state muestra/oculta spinner

---

## 📝 TEMPLATE DE REPORTE QA

```markdown
### 🛡️ Reporte de Calidad: Módulo [NOMBRE]

| Tipo de Test | Estado | Detalles |
|--------------|--------|----------|
| **TypeScript** | ✅ PASÓ | Sin errores de compilación |
| **Compilación Frontend** | ✅ PASÓ | Build completo en Xs |
| **Runtime (Consola)** | ✅ LIMPIO | 0 errores detectados |
| **Data Binding** | ✅ VERIFICADO | Se encontró "[dato]" en el DOM |
| **Latencia Simulada** | ✅ OK | 612ms (dentro de 400-800ms) |
| **useReducer** | ✅ FUNCIONA | Acciones ejecutadas correctamente |

**Estado Final:** 🟢 LISTO PARA MERGE
```

---

## 🚦 CRITERIOS DE MERGE

### 🟢 LISTO PARA MERGE

```
✅ TypeScript: Sin errores
✅ Build: Frontend compila exitosamente
✅ Console: 0 errores rojos
✅ Data: Datos mock visibles en DOM
✅ Latencia: 400-800ms observable
✅ useReducer: Funciona correctamente
```

### 🟡 REQUIERE AJUSTES

```
⚠️ TypeScript: Warnings específicos
⚠️ Data: A veces aparece, a veces no
⚠️ Código: Mejoras recomendadas
```

### 🔴 BLOQUEADO

```
❌ TypeScript: Errores no compilables
❌ Build: Frontend no compila
❌ Console: Errores que rompen la app
❌ Data: Mock no carga
```

---

**Última actualización:** 2026-02-01  
**Versión:** 1.0  
**Responsable:** Tech Lead
