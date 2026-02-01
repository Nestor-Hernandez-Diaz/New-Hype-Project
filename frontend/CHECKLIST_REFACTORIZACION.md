# 📋 CHECKLIST REFACTORIZACIÓN FRONTEND-FIRST
**Proyecto:** ERP LP3 - Sistema de Gestión AlexaTech  
**Estrategia:** Frontend-First con Mock API Local  
**Fecha Auditoría:** 26/01/2026  
**Tech Stack:** React + TypeScript + Vite + Tailwind + shadcn/ui

---

## 🎯 OBJETIVO
Refactorizar todos los módulos del ERP siguiendo el patrón de **Inventario** (ya completado), implementando:
1. **Tipos TypeScript** en `@monorepo/shared-types`
2. **Mock API Services** con datos simulados
3. **Context con useReducer** (sin TanStack Query/Zustand)
4. **Verificación MCP** de funcionalidad

---

## 📊 ESTADO GENERAL DEL PROYECTO

### ✅ MÓDULOS COMPLETADOS (Con Mocks Funcionales)

| Módulo | Estado | Datos Visibles | Mock API | Context | Tipos TS | Verificado MCP |
|--------|--------|----------------|----------|---------|----------|----------------|
| **Inventario - Stock** | ✅ COMPLETO | ✅ 5 productos | ✅ Sí | ✅ useReducer | ✅ Sí | ✅ 26/01/2026 |
| **Inventario - Kardex** | ✅ COMPLETO | ✅ 4 movimientos | ✅ Sí | ✅ useReducer | ✅ Sí | ✅ 26/01/2026 |
| **Ventas - Historial** | ✅ COMPLETO | ✅ 3 ventas | ✅ Sí | ✅ useReducer | ✅ Sí | ⚠️ Pendiente |

### ⚠️ MÓDULOS CON UI PERO SIN DATOS (Requieren Mock API)

| Módulo | Estado UI | Problema | Prioridad |
|--------|-----------|----------|-----------|
| **Usuarios** | ✅ OK | 🔴 "Cargando usuarios..." sin datos | 🔥 ALTA |
| **Productos** | ✅ OK | 🔴 "0 Total Productos" | 🔥 ALTA |
| **Clientes/Entidades** | ✅ OK | 🔴 "Cargando entidades..." sin datos | 🔥 ALTA |
| **Compras - Órdenes** | ✅ COMPLETO | ✅ 7 órdenes | ✅ Sí | ✅ useReducer | ✅ Sí | ✅ En proceso |
| **Ventas - Cotizaciones** | ✅ OK | ⚠️ No verificado | 🔥 MEDIA |
| **Inventario - Almacenes** | ✅ OK | ⚠️ No verificado | 🟡 BAJA |
| **Inventario - Motivos** | ✅ OK | ⚠️ No verificado | 🟡 BAJA |

### 🚧 MÓDULOS NO AUDITADOS (Requieren Exploración)

| Módulo | Ruta | Requiere Auditoría MCP |
|--------|------|------------------------|
| Configuración - Mi Perfil | `/configuracion/mi-perfil` | ✅ Sí |
| Configuración - Empresa | `/configuracion/empresa` | ✅ Sí |
| Configuración - Comprobantes | `/configuracion/comprobantes` | ✅ Sí |
| Configuración - Métodos Pago | `/configuracion/metodos-pago` | ✅ Sí |
| Configuración - Categorías | `/configuracion/productos` | ✅ Sí |
| Reportes - Ventas | `/reportes/ventas` | ✅ Sí |
| Reportes - Compras | `/reportes/compras` | ✅ Sí |
| Reportes - Inventario | `/reportes/inventario` | ✅ Sí |
| Reportes - Caja | `/reportes/caja` | ✅ Sí |
| Auditoría - Logs Sistema | `/auditoria` | ✅ Sí |
| Ventas - Realizar Venta | `/ventas/realizar` | ✅ Sí |
| Ventas - Gestión Caja | `/gestion-caja` | ✅ Sí |
| Ventas - Historial Caja | `/historial-caja` | ✅ Sí |
| Compras - Recepciones | `/compras/recepciones` | ✅ Sí |
| Usuarios - Roles Permisos | `/roles` | ✅ Sí |

---

## 🔧 PLAN DE REFACTORIZACIÓN POR PRIORIDAD

### 🔥 PRIORIDAD ALTA - Sprint 1 (Semana 1)

#### ☐ 1. PRODUCTOS (Lista de Productos)
**Ruta:** `/lista-productos`  
**Estado Actual:** UI completa, 0 productos mostrados  
**Archivos a Crear/Modificar:**
- [ ] `packages/shared-types/src/domain/productos.ts` - Interfaces TypeScript
  - [ ] `Producto` interface (código, nombre, categoría, precio, stock, estado, unidad)
  - [ ] `Categoria` interface
  - [ ] `UnidadMedida` interface
  - [ ] `ProductoFiltros` interface
- [ ] `frontend/src/modules/products/services/productosMockApi.ts` - Mock API
  - [ ] `getProductos(filtros)` - Retornar 10-15 productos hardcoded
  - [ ] `getProducto(id)` - Retornar producto por ID
  - [ ] `crearProducto(data)` - Simular creación
  - [ ] `actualizarProducto(id, data)` - Simular actualización
  - [ ] `eliminarProducto(id)` - Simular eliminación
  - [ ] `getCategorias()` - Retornar categorías mock
  - [ ] `getUnidades()` - Retornar unidades de medida
- [ ] `frontend/src/modules/products/context/ProductsContext.tsx` - Refactor Context
  - [ ] Implementar `useReducer` con estados: loading, productos, error
  - [ ] Acciones: FETCH_PRODUCTOS, CREATE_PRODUCTO, UPDATE_PRODUCTO, DELETE_PRODUCTO
  - [ ] Conectar a `productosMockApi`
- [ ] **Verificación MCP:** Navegar a `/lista-productos` y verificar 10+ productos
- [ ] **Screenshot:** `verificacion_productos.png`

#### ☐ 2. USUARIOS (Lista de Usuarios)
**Ruta:** `/usuarios`  
**Estado Actual:** "Cargando usuarios..." sin datos  
**Archivos a Crear/Modificar:**
- [ ] `packages/shared-types/src/domain/usuarios.ts` - Interfaces TypeScript
  - [ ] `Usuario` interface (id, nombre, usuario, email, rol, estado, fechaCreacion)
  - [ ] `Rol` enum (ADMIN, VENDEDOR, ALMACENERO, etc.)
  - [ ] `EstadoUsuario` enum (ACTIVO, INACTIVO, BLOQUEADO)
  - [ ] `UsuarioFiltros` interface
- [ ] `frontend/src/modules/users/services/usuariosMockApi.ts` - Mock API
  - [ ] `getUsuarios(filtros)` - Retornar 5-8 usuarios hardcoded
  - [ ] `getUsuario(id)` - Retornar usuario por ID
  - [ ] `crearUsuario(data)` - Simular creación
  - [ ] `actualizarUsuario(id, data)` - Simular actualización
  - [ ] `cambiarEstado(id, estado)` - Simular cambio de estado
- [ ] `frontend/src/modules/users/context/UsersContext.tsx` - Refactor Context
  - [ ] Implementar `useReducer`
  - [ ] Conectar a `usuariosMockApi`
- [ ] **Verificación MCP:** Verificar 5+ usuarios visibles
- [ ] **Screenshot:** `verificacion_usuarios.png`

#### ☐ 3. ENTIDADES COMERCIALES (Clientes/Proveedores)
**Ruta:** `/lista-entidades`  
**Estado Actual:** "Cargando entidades..." sin datos  
**Archivos a Crear/Modificar:**
- [ ] `packages/shared-types/src/domain/entidades.ts` - Interfaces TypeScript
  - [ ] `EntidadComercial` interface (id, tipo, tipoDocumento, numeroDocumento, razonSocial, nombreComercial, email, telefono, direccion)
  - [ ] `TipoEntidad` enum (CLIENTE, PROVEEDOR, AMBOS)
  - [ ] `TipoDocumento` enum (DNI, RUC, PASAPORTE, CARNET_EXTRANJERIA)
  - [ ] `Ubigeo` interface (departamento, provincia, distrito)
- [ ] `frontend/src/modules/clients/services/entidadesMockApi.ts` - Mock API
  - [ ] `getEntidades(filtros)` - Retornar 10-12 entidades (mix clientes/proveedores)
  - [ ] `getEntidad(id)` - Retornar entidad por ID
  - [ ] `crearEntidad(data)` - Simular creación
  - [ ] `actualizarEntidad(id, data)` - Simular actualización
  - [ ] `validarDocumento(tipo, numero)` - Simular validación SUNAT
- [ ] `frontend/src/modules/clients/context/ClientsContext.tsx` - Refactor Context
  - [ ] Implementar `useReducer`
  - [ ] Conectar a `entidadesMockApi`
- [ ] **Verificación MCP:** Verificar 10+ entidades visibles
- [ ] **Screenshot:** `verificacion_entidades.png`

---

### 🟠 PRIORIDAD MEDIA - Sprint 2 (Semana 2)

#### ☑️ 4. COMPRAS - Órdenes y Recepciones
**Ruta:** `/compras/ordenes` y `/compras/recepciones`  
**Estado Actual:** ✅ COMPLETADO  
**Archivos Creados/Modificados:**
- [x] `packages/shared-types/src/domain/compras.ts` - Interfaces TypeScript (440 líneas)
  - [x] `OrdenCompra` interface con 15 campos ropa-specific
  - [x] `EstadoOrdenCompra` enum (7 estados: PENDIENTE, ENVIADA, CONFIRMADA, EN_RECEPCION, PARCIAL, COMPLETADA, CANCELADA)
  - [x] `Recepcion` interface con vinculación a órden
  - [x] `EstadoRecepcion` enum (4 estados: PENDIENTE, INSPECCION, CONFIRMADA, CANCELADA)
  - [x] DTOs para crear/actualizar/cambiar estado
- [x] `frontend/src/modules/purchases/services/ordenesComprasMockApi.ts` - Mock API Órdenes
  - [x] `getOrdenes(filtros)` - Retorna 7 órdenes con paginación y búsqueda
  - [x] `crearOrden(data)` - Simula creación con cálculo de totales
  - [x] `getOrdenById(id)` - Retorna orden completa
  - [x] Latencia realista: 600ms (list), 400ms (detail), 700ms (create)
- [x] `frontend/src/modules/purchases/services/recepcionesMockApi.ts` - Mock API Recepciones
  - [x] `getRecepciones(filtros)` - Retorna 6 recepciones 
  - [x] `crearRecepcion(data)` - Simula creación con QC data
  - [x] `getRecepcionById(id)` - Retorna recepción completa
- [x] `frontend/src/modules/purchases/context/PurchasesContext.tsx` - Context con useReducer
  - [x] 12 métodos de callback (6 para órdenes + 6 para recepciones)
  - [x] Auto-initialización on token presence
- [x] `frontend/src/modules/purchases/pages/PurchaseOrdersPage.tsx` - Refactorizado
  - [x] Usa `usePurchases` context en lugar de hook antiguo
  - [x] Todos los handlers conectados
- [x] `frontend/src/modules/purchases/pages/PurchaseReceiptsPage.tsx` - Refactorizado
  - [x] Usa `usePurchases` context en lugar de hook antiguo
  - [x] Todos los handlers conectados
- [x] `App.tsx` - Envuelto con PurchasesProvider
- [x] **Compilación:** 0 TypeScript errors ✅
- [x] **Verificación MCP:** En proceso

#### ☐ 5. VENTAS - Cotizaciones
**Ruta:** `/ventas/cotizaciones`  
**Estado Actual:** No verificado  
**Archivos a Crear/Modificar:**
- [ ] `packages/shared-types/src/domain/cotizaciones.ts` - Interfaces TypeScript
  - [ ] `Cotizacion` interface
  - [ ] `EstadoCotizacion` enum (PENDIENTE, APROBADA, RECHAZADA, VENCIDA)
- [ ] `frontend/src/modules/sales/services/cotizacionesMockApi.ts` - Mock API
  - [ ] `getCotizaciones(filtros)` - Retornar 5-7 cotizaciones
  - [ ] `crearCotizacion(data)` - Simular creación
  - [ ] `convertirAVenta(id)` - Simular conversión
- [ ] **Verificación MCP**
- [ ] **Screenshot:** `verificacion_cotizaciones.png`

#### ☐ 6. VENTAS - Realizar Venta (Punto de Venta)
**Ruta:** `/ventas/realizar`  
**Estado Actual:** No verificado  
**Archivos a Crear/Modificar:**
- [ ] Verificar que use los tipos de `ventas.ts` ya existentes
- [ ] Crear `ventasMockApi.ts` si no existe
- [ ] Refactorizar Context para usar `useReducer`
- [ ] **Verificación MCP**

---

### 🟡 PRIORIDAD BAJA - Sprint 3 (Semana 3)

#### ☐ 7. INVENTARIO - Almacenes
**Ruta:** `/inventario/almacenes`  
**Archivos a Crear/Modificar:**
- [ ] `packages/shared-types/src/domain/almacenes.ts`
  - [ ] `Almacen` interface (id, codigo, nombre, direccion, capacidad, tipo)
  - [ ] `TipoAlmacen` enum (PRINCIPAL, SECUNDARIO, TRANSITO)
- [ ] `frontend/src/modules/inventory/services/almacenesMockApi.ts`
  - [ ] `getAlmacenes()` - Retornar 3-5 almacenes
  - [ ] `getAlmacen(id)`
  - [ ] `crearAlmacen(data)`
- [ ] **Verificación MCP**

#### ☐ 8. INVENTARIO - Motivos de Movimiento
**Ruta:** `/inventario/motivos`  
**Archivos a Crear/Modificar:**
- [ ] `packages/shared-types/src/domain/motivos.ts`
  - [ ] `MotivoMovimiento` interface (id, codigo, descripcion, tipo, afectaStock)
- [ ] `frontend/src/modules/inventory/services/motivosMockApi.ts`
  - [ ] `getMotivos()` - Retornar 10-15 motivos
- [ ] **Verificación MCP**

#### ☐ 9. VENTAS - Gestión de Caja
**Ruta:** `/gestion-caja`  
**Archivos a Crear/Modificar:**
- [ ] `packages/shared-types/src/domain/caja.ts`
  - [ ] `Caja` interface (id, codigo, nombre, estado, saldoInicial, saldoActual)
  - [ ] `AperturaCaja` interface
  - [ ] `CierreCaja` interface
- [ ] `frontend/src/modules/sales/services/cajaMockApi.ts`
  - [ ] `getCajas()` - Retornar 2-3 cajas
  - [ ] `abrirCaja(data)` - Simular apertura
  - [ ] `cerrarCaja(id)` - Simular cierre
- [ ] **Verificación MCP**

---

### 🔵 CONFIGURACIÓN & REPORTES - Sprint 4 (Semana 4)

#### ☐ 10. CONFIGURACIÓN - Mi Perfil
**Ruta:** `/configuracion/mi-perfil`  
- [ ] Crear tipos y mocks para perfil de usuario
- [ ] Refactorizar Context
- [ ] **Verificación MCP**

#### ☐ 11. CONFIGURACIÓN - Empresa
**Ruta:** `/configuracion/empresa`  
- [ ] Crear tipos para configuración de empresa
- [ ] Mock con datos de empresa demo
- [ ] **Verificación MCP**

#### ☐ 12. CONFIGURACIÓN - Comprobantes
**Ruta:** `/configuracion/comprobantes`  
- [ ] Tipos para series de comprobantes (Boleta, Factura, etc.)
- [ ] Mock de configuración de series
- [ ] **Verificación MCP**

#### ☐ 13. CONFIGURACIÓN - Métodos de Pago
**Ruta:** `/configuracion/metodos-pago`  
- [ ] Tipos para métodos de pago
- [ ] Mock con 5-6 métodos (Efectivo, Tarjeta, Yape, etc.)
- [ ] **Verificación MCP**

#### ☐ 14. REPORTES - Ventas
**Ruta:** `/reportes/ventas`  
- [ ] Tipos para reportes de ventas
- [ ] Mock con datos agregados
- [ ] **Verificación MCP**

#### ☐ 15. REPORTES - Compras
**Ruta:** `/reportes/compras`  
- [ ] Tipos para reportes de compras
- [ ] Mock con datos agregados
- [ ] **Verificación MCP**

#### ☐ 16. REPORTES - Inventario
**Ruta:** `/reportes/inventario`  
- [ ] Tipos para reportes de inventario
- [ ] Mock con datos agregados
- [ ] **Verificación MCP**

#### ☐ 17. REPORTES - Caja
**Ruta:** `/reportes/caja`  
- [ ] Tipos para reportes de caja
- [ ] Mock con datos de ingresos/egresos
- [ ] **Verificación MCP**

#### ☐ 18. AUDITORÍA - Logs del Sistema
**Ruta:** `/auditoria`  
- [ ] Tipos para logs de auditoría
- [ ] Mock con 20-30 logs de acciones
- [ ] **Verificación MCP**

---

## 📐 ESTÁNDARES DE IMPLEMENTACIÓN

### 1️⃣ Nomenclatura de Tipos TypeScript
```typescript
// ✅ BIEN - camelCase consistente con JPA
interface Producto {
  id: number;
  codigoProducto: string;
  nombreProducto: string;
  precioVenta: number;
  stockActual: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// ❌ MAL - Abreviaciones o snake_case
interface Producto {
  id: number;
  cod_prod: string;
  nm: string;
  pv: number;
  stk: number;
}
```

### 2️⃣ Estructura de Mock API Service
```typescript
// frontend/src/modules/[modulo]/services/[modulo]MockApi.ts
import type { Producto, ProductoFiltros } from '@monorepo/shared-types';

const MOCK_PRODUCTOS: Producto[] = [
  { id: 1, codigoProducto: 'PROD-001', nombreProducto: 'Laptop Dell', ... },
  // ... más datos
];

export const productosMockApi = {
  async getProductos(filtros?: ProductoFiltros) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular latencia
    let resultado = [...MOCK_PRODUCTOS];
    
    if (filtros?.busqueda) {
      resultado = resultado.filter(p => 
        p.nombreProducto.toLowerCase().includes(filtros.busqueda!.toLowerCase())
      );
    }
    
    return {
      data: resultado,
      total: resultado.length,
      pagina: filtros?.pagina || 1
    };
  },
  
  async getProducto(id: number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PRODUCTOS.find(p => p.id === id);
  }
};
```

### 3️⃣ Refactorización de Context con useReducer
```typescript
// frontend/src/modules/[modulo]/context/[Modulo]Context.tsx
import { createContext, useReducer, useContext } from 'react';
import { productosMockApi } from '../services/productosMockApi';
import type { Producto } from '@monorepo/shared-types';

// 1. Tipos del State
type State = {
  productos: Producto[];
  loading: boolean;
  error: string | null;
};

// 2. Tipos de Acciones
type Action =
  | { type: 'FETCH_PRODUCTOS_START' }
  | { type: 'FETCH_PRODUCTOS_SUCCESS'; payload: Producto[] }
  | { type: 'FETCH_PRODUCTOS_ERROR'; payload: string };

// 3. Reducer
const productosReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_PRODUCTOS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_PRODUCTOS_SUCCESS':
      return { ...state, loading: false, productos: action.payload };
    case 'FETCH_PRODUCTOS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// 4. Provider
export const ProductsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productosReducer, {
    productos: [],
    loading: false,
    error: null
  });

  const fetchProductos = async (filtros) => {
    dispatch({ type: 'FETCH_PRODUCTOS_START' });
    try {
      const response = await productosMockApi.getProductos(filtros);
      dispatch({ type: 'FETCH_PRODUCTOS_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'FETCH_PRODUCTOS_ERROR', payload: error.message });
    }
  };

  return (
    <ProductsContext.Provider value={{ ...state, fetchProductos }}>
      {children}
    </ProductsContext.Provider>
  );
};
```

### 4️⃣ Protocolo de Verificación MCP
Para cada módulo refactorizado, ejecutar:

```bash
# 1. Compilación TypeScript
npx tsc --noEmit

# 2. Iniciar servidor (si no está corriendo)
npm run dev

# 3. Usar Chrome DevTools MCP para verificar
# - Navegar a la página del módulo
# - Tomar snapshot con mcp_io_github_chr_take_snapshot
# - Verificar que los datos mock aparezcan en el DOM
# - Tomar screenshot con mcp_io_github_chr_take_screenshot

# 4. Verificar en consola del navegador que NO haya:
# - Errores de "Context is undefined"
# - Errores de "TypeError: Cannot read property"
# - Warnings de React
```

---

## 📈 MÉTRICAS DE PROGRESO

### Estado Actual (26/01/2026)
- **Módulos Completados:** 3/18 (17%)
- **Con Mocks Funcionales:** 3/18
- **Verificados con MCP:** 2/18
- **Sin Datos (Requieren Refactor):** 4/18
- **No Auditados:** 11/18

### Objetivo Sprint 1 (31/01/2026)
- **Completar:** Productos, Usuarios, Entidades (3 módulos)
- **Meta:** 6/18 módulos funcionando (33%)

### Objetivo Sprint 2 (07/02/2026)
- **Completar:** Compras, Cotizaciones, Punto Venta (3 módulos)
- **Meta:** 9/18 módulos funcionando (50%)

### Objetivo Sprint 3 (14/02/2026)
- **Completar:** Almacenes, Motivos, Caja (3 módulos)
- **Meta:** 12/18 módulos funcionando (67%)

### Objetivo Sprint 4 (21/02/2026)
- **Completar:** Configuración + Reportes (6 módulos)
- **Meta:** 18/18 módulos funcionando (100%) ✅

---

## 🚨 NOTAS CRÍTICAS

1. **NO inventar endpoints backend:** Todos los datos vienen de mocks locales.
2. **Latencia simulada OBLIGATORIA:** Usar `setTimeout(500-800ms)` en todos los mocks.
3. **Tipos primero, código después:** Crear interfaces TypeScript antes de escribir cualquier lógica.
4. **Verificación MCP obligatoria:** Cada módulo debe tener screenshot de evidencia.
5. **Datos realistas:** Los mocks deben simular datos reales del ERP (nombres, precios, fechas, etc.).

---

## 🔗 REFERENCIAS

- **Patrón de Referencia:** `frontend/src/modules/inventory/`
- **Tipos de Referencia:** `packages/shared-types/src/domain/inventory.types.ts`
- **Mock de Referencia:** `frontend/src/modules/inventory/services/inventoryMockApi.ts`
- **Verificación de Referencia:** `frontend/REPORTE_VERIFICACION_MCP.md`

---

**Última Actualización:** 26/01/2026 09:45 AM  
**Responsable:** Tech Lead AI  
**Estado:** 🟢 ACTIVO - Sprint 1 por iniciar
