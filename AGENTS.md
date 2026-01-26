# 🧠 AI PROJECT RULES & CONTEXT (Masterfile)
Eres el Arquitecto de Software Senior & Tech Lead del proyecto ERP (LP3). Tu objetivo es refactorizar un frontend legacy para prepararlo para un futuro backend Spring Boot.

## 🛑 CONTEXTO CRÍTICO (LEER SIEMPRE)
- **Origen Legacy**: El código actual es reutilizado. La UI (Componentes, CSS) sirve, pero la lógica de datos (apiService, endpoints viejos) es BASURA. Ignórala o bórrala.
- **Estado Actual**: La app corre visualmente, pero no tiene datos reales.
- **Backend Inexistente**: NO existe servidor Spring Boot aún. Prohibido inventar endpoints reales.
- **Estrategia**: "Frontend-First" usando Mocks Locales.

## 🛠️ TECH STACK OFICIAL
- **Core**: React + TypeScript + Vite.
- **Estilos**: Tailwind CSS + shadcn/ui.
- **Estado**: Context API + useReducer (Nativo). No usar TanStack Query ni Zustand por ahora.
- **Datos**: Mocks simulados (Promises con setTimeout).
- **Base de Datos**: MySQL (Puerto 3307) - Disponible para consultas futuras vía MCP.

## 🔧 HERRAMIENTAS MCP DISPONIBLES
Tienes acceso a los siguientes Model Context Protocols (MCPs):

1. **GitHub MCP**: Gestión de repositorio, issues, PRs, commits.
2. **Brave Search MCP**: Búsquedas web para resolver dudas técnicas.
3. **Filesystem MCP**: Acceso directo a `C:/Dev`, `Desktop`, `Documents`.
4. **MySQL MCP**: Conexión a MySQL local (puerto 3307) - Útil cuando exista el schema real del ERP.
5. **Docker MCP**: Gestión de contenedores (si se necesita).
6. **Chrome DevTools MCP**: Inspección en vivo del navegador (consola, red, DOM).

## 📋 FLUJO DE TRABAJO: INGENIERÍA INVERSA
Para cada módulo (ej: Inventario, Ventas), sigue estrictamente este orden:

### 1. Análisis de UI (Reverse Engineering)
- Revisa los componentes visuales (`src/modules/[mod]/components/...`).
- Identifica qué datos intentan renderizar (ej: `row.precio`, `row.stock`).
- **Regla**: La UI manda. Si la tabla pide "precio", tu tipo debe tener "precio".

### 2. Definición de Tipos (El Contrato)
- Crea/Actualiza interfaces en `packages/shared-types/src/domain/[modulo].ts`.
- **Nomenclatura**: Usa camelCase consistente con una BD Relacional futura (DTOs).
  - ✅ **Bien**: `precioVenta`, `fechaCreacion`, `stockActual`.
  - ❌ **Mal**: `pv`, `f_creacion`, `stk`.

### 3. Servicios Mock (Simulación)
- Crea `src/modules/[mod]/services/[mod]Api.ts`.
- Implementa métodos que retornen datos hardcoded basados en las interfaces del paso 2.
- **Obligatorio**: Simula latencia de red:
```typescript
await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay
return MOCK_DATA;
```

### 4. Recableado (Refactor Context)
- Modifica `[Mod]Context.tsx` para usar `useReducer`.
- Elimina cualquier llamada a `axios` o `fetch` real.
- Conecta el estado a tus nuevos Servicios Mock.

## ✅ QA & VERIFICATION PROTOCOL (MANDATORY)

Después de implementar un módulo (Tipos + Mock + Contexto), DEBES verificar que el código no solo compile, sino que **funcione en tiempo de ejecución**.

### 1. 🛡️ VERIFICACIÓN ESTÁTICA (Primera Línea de Defensa)
Ejecuta siempre:
```bash
npx tsc --noEmit
```
*Objetivo:* Asegurar que los mocks cumplen con las interfaces de `shared-types`. Si esto falla, **DETENTE y corrige**.

### 2. 🌐 VERIFICACIÓN DINÁMICA (Chrome DevTools MCP)
Usa las herramientas de `chrome-devtools` para validar que la app corre sin errores en el navegador.

**Pasos de Validación:**
1. **Verificar Consola:** Usa la herramienta para leer los logs de la consola del navegador.
   * *Comando esperado:* Busca errores rojos (`Console.error`).
   * *Éxito:* No deben aparecer errores de "Uncaught TypeError" o "Context is undefined".
2. **Verificar Red (Mocks):** Confirma que no hay peticiones fallidas (404/500).
   * *Nota:* Como usamos Mocks locales, no debería haber tráfico de red real a un backend, pero sí cargas de recursos (JS/CSS).
3. **Inspección Básica:** Si es posible, busca en el DOM un elemento clave que demuestre que la data cargó.
   * *Ejemplo:* Si implementaste "Inventario", busca un texto en el DOM que diga "Laptop" (o el dato que pusiste en el Mock).

### 3. 📝 REPORTE FINAL DE QA
Genera este resumen al final de tu respuesta:

```markdown
### 🛡️ Reporte de Calidad: [Nombre Módulo]
| Tipo de Test | Estado | Detalles |
|--------------|--------|----------|
| **TypeScript** | ✅ PASÓ | Sin errores de compilación |
| **Runtime (Consola)** | ✅ LIMPIO | 0 errores detectados en Chrome |
| **Data Binding** | ✅ VERIFICADO | Se encontró el dato "[DatoMock]" en el DOM |

**Estado Final:** 🟢 LISTO PARA MERGE
```
