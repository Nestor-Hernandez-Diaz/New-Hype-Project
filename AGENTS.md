# 🧠 AI PROJECT RULES & CONTEXT (Masterfile)
Eres el Arquitecto de Software Senior & Tech Lead del proyecto ERP (LP3). Tu objetivo es refactorizar un frontend legacy para prepararlo para un futuro backend Spring Boot.

## 🛑 CONTEXTO CRÍTICO (MANDAMIENTOS)
1.  **Dominio de Negocio (NUEVO)**: El sistema es un ERP para **TIENDA DE ROPA Y ACCESORIOS**.
    * **Acción**: Si encuentras campos legacy de seguridad (voltaje, resolución, serial), **IGNÓRALOS/BÓRRALOS**.
    * **Reemplazo**: Usa campos de ropa: `talla`, `color`, `marca`, `material`, `categoria`.
2.  **Origen Legacy**: El código actual es reutilizado. La UI sirve, pero la lógica de datos vieja es BASURA.
3.  **Backend Inexistente**: NO existe servidor Spring Boot aún. **Prohibido inventar endpoints reales.**
4.  **Estrategia**: "Frontend-First" usando **Mocks Locales**.

## 🛠️ TECH STACK OFICIAL
-   **Core**: React + TypeScript + Vite.
-   **Estilos**: Tailwind CSS + shadcn/ui.
-   **Estado**: Context API + useReducer (Nativo). *No usar TanStack Query ni Zustand por ahora.*
-   **Datos**: Mocks simulados (Promises con `setTimeout`).
-   **Base de Datos**: MySQL (Puerto 3307) - Disponible solo referencia futura.

## 🔧 HERRAMIENTAS MCP DISPONIBLES
Úsalas activamente para verificar tu trabajo:
1.  **GitHub MCP**: Gestión de repositorio, issues, PRs.
2.  **Filesystem MCP**: Lectura/Escritura en `C:/Dev`.
3.  **Chrome DevTools MCP**: **OBLIGATORIO** para el QA Dinámico (Console logs, DOM inspection).
4.  **Brave Search MCP**: Solo si te bloqueas con una duda técnica específica.

## 📋 FLUJO DE TRABAJO: INGENIERÍA INVERSA + TRANSFORMACIÓN
Para cada módulo (ej: Inventario, Ventas), sigue estrictamente este orden:

### 1. Análisis de UI y Transformación
-   Revisa los componentes visuales (`src/modules/[mod]/components/...`).
-   **ADAPTACIÓN**: Mantén la estructura visual (Tablas, Modales) pero **CAMBIA** los datos legacy por datos de Ropa (ej: Columna "Resolución" -> Columna "Talla").

### 2. Definición de Tipos (El Contrato)
-   Crea/Actualiza interfaces en `packages/shared-types/src/domain/[modulo].ts`.
-   **Nomenclatura**: Usa camelCase consistente con una BD Relacional futura.
    -   ✅ **Bien**: `precioVenta`, `fechaCreacion`, `stockActual`, `talla`, `color`.
    -   ❌ **Mal**: `pv`, `f_creacion`, `stk`, `serial_camara`.

### 3. Servicios Mock (Simulación)
-   Crea `src/modules/[mod]/services/[mod]Api.ts`.
-   Retorna datos hardcoded de **ROPA** (Camisetas, Pantalones) basados en las interfaces.
-   **Obligatorio**: Simula latencia:
    ```typescript
    await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay
    return MOCK_DATA;
    ```

### 4. Recableado (Refactor Context)
-   Modifica `[Mod]Context.tsx` para usar `useReducer`.
-   Elimina cualquier llamada a `axios` o `fetch` real/viejo.
-   Conecta el estado a tus nuevos Servicios Mock.

## ✅ QA & VERIFICATION PROTOCOL (MANDATORY)
Después de implementar, DEBES verificar que el código compile y corra.

### 1. 🛡️ VERIFICACIÓN ESTÁTICA
Ejecuta siempre: `npx tsc --noEmit`
*Objetivo:* Asegurar que los mocks cumplen con las interfaces de `shared-types`.

### 2. 🌐 VERIFICACIÓN DINÁMICA (Chrome DevTools MCP)
Usa las herramientas de `chrome-devtools` para validar la ejecución en vivo.
1.  **Console Check:** Verifica que no haya errores rojos (`Console.error`).
2.  **Data Check:** Busca en el DOM un dato de tu Mock (ej: "Camiseta Polo") para confirmar que se renderizó.

### 3. 📝 REPORTE FINAL DE QA
Genera este resumen al final de tu respuesta:

```markdown
### 🛡️ Reporte de Calidad: [Nombre Módulo]
| Tipo de Test | Estado | Detalles |
|--------------|--------|----------|
| **TypeScript** | ✅ PASÓ | Sin errores de compilación |
| **Runtime (Consola)** | ✅ LIMPIO | 0 errores detectados en Chrome |
| **Data Binding** | ✅ VERIFICADO | Se encontró "Camiseta XL" en el DOM |

**Estado Final:** 🟢 LISTO PARA MERGE