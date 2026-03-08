# Correcciones del Modulo de Inventario - Resultados

**Fecha:** 2026-03-08
**Modulo:** Inventario (4 paginas: Stock, Kardex, Almacenes, Motivos de Movimiento)
**Estado:** COMPLETADO

---

## 1. Estado Anterior (Problemas Reportados)

| Pagina | Problema | Severidad |
|--------|----------|-----------|
| **Almacenes** | Todos los almacenes aparecen como "Inactivo" (estado incorrecto) | Alta |
| **Almacenes** | Columnas "Productos" y "Movimientos" vacias (0) | Media |
| **Motivos de Movimiento** | Todos los motivos aparecen como "Inactivo" | Alta |
| **Motivos de Movimiento** | Boton "Activar/Desactivar" no funciona (no existe endpoint PATCH) | Alta |
| **Stock** | Boton "Ajustar" no carga motivos de ajuste en el dropdown | Alta |
| **Stock** | Columna "Stock Minimo" aparece vacia | Baja (dato) |
| **Kardex** | Pagina totalmente vacia ("No se encontraron movimientos") | Alta |
| **Kardex** | Busqueda de productos falla (endpoint incorrecto) | Alta |

---

## 2. Analisis de Causas Raiz

### 2.1 Mapeo de campos `estado` vs `activo`
- **Backend:** Entidades `Almacen` y `MotivoMovimiento` usan campo `estado: Boolean`
- **Frontend:** Interfaces esperan campo `activo: boolean`
- **Resultado:** `raw.activo` es `undefined` (falsy) -> todos aparecen como "Inactivo"

### 2.2 Endpoint PATCH faltante para Motivos
- `ConfiguracionExtraController` tenia `PATCH /cajas-registradoras/{id}/estado` pero NO tenia `PATCH /motivos-movimiento/{id}/estado`
- `MotivoMovimientoService` no tenia metodo `cambiarEstado()`

### 2.3 Contadores vacios en Almacenes
- `AlmacenResponse` no incluia campo `_count`
- `AlmacenService.toResponse()` no consultaba contadores de `StockAlmacenRepository` ni `MovimientoInventarioRepository`

### 2.4 ModalAjuste sin motivos AJUSTE
- Frontend filtra `tipo: 'AJUSTE'` pero no existian motivos de tipo AJUSTE en la BD (solo ENTRADA y SALIDA)
- Ademas, `deleteMovementReason()` llamaba `apiService.delete()` (endpoint inexistente en backend)

### 2.5 Kardex vacio
- **Comportamiento por diseno:** Backend requiere `productoId` para devolver datos de kardex
- **Bug adicional:** `inventarioApi.searchProducts()` usaba `/productos/search` (404/500) en vez de `/productos/buscar` (200)

### 2.6 Stock Minimo
- No es un bug de codigo. El backend devuelve `stockMinimo` correctamente; los valores son `0` o `null` en la BD

---

## 3. Correcciones Implementadas

### 3.1 Backend

#### `ConfiguracionExtraController.java`
- Agregado endpoint `PATCH /motivos-movimiento/{id}/estado` para toggle de estado

#### `MotivoMovimientoService.java`
- Agregado metodo `cambiarEstado(Long id)` que invierte el campo `estado` del motivo

#### `AlmacenResponse.java`
- Agregado campo `@JsonProperty("_count") Map<String, Long> count` con `stockByWarehouses` y `inventoryMovements`

#### `AlmacenService.java`
- Inyectados `StockAlmacenRepository` y `MovimientoInventarioRepository`
- `toResponse()` ahora consulta y popula los contadores `_count`

#### `StockAlmacenRepository.java`
- Agregado: `long countByTenantIdAndAlmacenId(Long tenantId, Long almacenId)`

#### `MovimientoInventarioRepository.java`
- Agregado: `long countByTenantIdAndAlmacenId(Long tenantId, Long almacenId)`

### 3.2 Frontend

#### `almacenesApi.ts`
- Agregada funcion `mapAlmacenResponse(raw)` que mapea `raw.estado -> activo`
- `getAlmacenes()` ahora usa el mapper para todas las respuestas

#### `movementReasonsApi.ts`
- Agregada funcion `mapMovementReasonResponse(raw)` que mapea `raw.estado -> activo`
- `getMovementReasons()` aplica filtro `activo` del lado del cliente (backend no soporta este filtro)
- `deleteMovementReason()` cambiado de `apiService.delete()` a `this.toggleMovementReason()` (backend no tiene endpoint DELETE)

#### `inventoryRealApi.ts`
- `createAjuste()`: Campo `documentoReferencia` ahora envia `ajusteData.observaciones` (antes estaba vacio `''`)

#### `inventarioApi.ts`
- `searchProducts()`: Corregido endpoint de `/productos/search` (500) a `/productos/buscar?q=X&size=10` (200)
- Agregado mapeo robusto de respuesta (soporta arrays, `content`, y `rows`)

---

## 4. Resultados E2E (DevTools F12)

### 4.1 Pagina Almacenes (`/inventario/almacenes`)

| Verificacion | Resultado |
|-------------|-----------|
| Estadisticas: 2 Total, 2 Activos, 0 Inactivos, 32 Total Productos | OK |
| ALM-PRINCIPAL: "Activo", Productos: 16, Movimientos: 18 | OK |
| ALM-PRINCIPAL PE: "Activo", Productos: 16, Movimientos: 10 | OK |
| Network: Todas las requests 200 | OK |
| Console: 0 errores | OK |

### 4.2 Pagina Motivos de Movimiento (`/inventario/motivos`)

| Verificacion | Resultado |
|-------------|-----------|
| 8 motivos originales muestran "Activo" | OK |
| Estadisticas: 8 Total, 8 Activos, 4 Entradas, 4 Salidas, 0 Ajustes | OK |
| Toggle: Click "Eliminar" en AJ-ING -> muestra "Inactivo" + boton "Activar" | OK |
| PATCH `/motivos-movimiento/1/estado` -> 200 | OK |
| Re-activar: Click "Activar" -> vuelve a "Activo" | OK |
| Crear motivo AJUSTE (AJ-CONT): tipo=AJUSTE, POST -> 200 | OK |
| Estadisticas actualizadas: 9 Total, 9 Activos, 1 Ajuste | OK |
| Network: Todas las requests 200 | OK |
| Console: 0 errores | OK |

### 4.3 Pagina Stock (`/inventario/stock`)

| Verificacion | Resultado |
|-------------|-----------|
| Estadisticas: 10 Productos, 9 Normal, 0 Bajo, 1 Critico, 189 Unidades | OK |
| Columna STOCK MIN. visible con valores (datos son 0 en BD) | OK |
| Columna ESTADO con badges "Normal" / "Critico" | OK |
| Click "Ajustar" -> Modal "Ajuste de Inventario" se abre | OK |
| Dropdown "Motivo del ajuste" muestra "AJ-CONT - Ajuste por conteo fisico" | OK |
| GET `/configuracion/motivos-movimiento?tipo=AJUSTE` -> 200 | OK |
| Crear ajuste +5 unidades: POST `/inventario/ajustes` -> 200 | OK |
| Stock actualizado: 95 -> 100, Total Unidades: 189 -> 194 | OK |
| Network: Todas las requests 200 | OK |
| Console: 0 errores | OK |

### 4.4 Pagina Kardex (`/inventario/kardex`)

| Verificacion | Resultado |
|-------------|-----------|
| Pagina carga correctamente con filtros | OK |
| Sin producto seleccionado: "No hay movimientos" (por diseno) | OK |
| Busqueda de producto "Lentes": autocomplete muestra resultados | OK |
| GET `/productos/buscar?q=Lentes&size=10` -> 200 | OK |
| Seleccionar producto + Click "Buscar" -> tabla muestra movimientos | OK |
| GET `/inventario/kardex?productoId=11&almacenId=2&page=0&size=20` -> 200 | OK |
| 1 movimiento visible: ENTRADA, +1, stock 0->1, ref TRF-00001 | OK |
| Estadisticas: 1 Total, 1 Entrada, 0 Salidas, 0 Ajustes | OK |
| Network: Todas las requests 200 | OK |
| Console: 0 errores | OK |

### 4.5 Kardex - Ventas y filtro tipo (Sesion 2)

| Verificacion | Resultado |
|-------------|-----------|
| Buscar "CAS-DOP-XS-NEG" (id=22) en Almacen Principal (id=2) | OK |
| GET `/inventario/kardex?productoId=22&almacenId=2&page=0&size=20` -> 200 | OK |
| 10 movimientos visibles: 5 ENTRADA + 5 SALIDA | OK |
| VEN-00013 (venta mas reciente) aparece al tope | OK |
| Movimientos SALIDA: VEN-00013, VEN-00012, VEN-00011, VEN-00009, VEN-00005 | OK |
| Movimientos ENTRADA: REC-00001, NC-00003 a NC-00006 | OK |
| Stats: 10 Total, 5 Entradas, 5 Salidas, 0 Ajustes | OK |
| Filtro tipo "Salida": GET `/inventario/kardex?...&tipo=SALIDA` -> 200 | OK |
| Solo 5 SALIDA mostradas con filtro tipo activo | OK |
| Network: Todas las requests 200 | OK |
| Console: 0 errores | OK |

### 4.6 Kardex - AJUSTE_INGRESO/AJUSTE_EGRESO y stats fix (Sesion 2)

| Verificacion | Resultado |
|-------------|-----------|
| Buscar "Lentes de Sol Urban" (id=11) en Almacen Central (id=1) | OK |
| GET `/inventario/kardex?productoId=11&almacenId=1&page=0&size=20` -> 200 | OK |
| 10 movimientos visibles: 5 SALIDA + 4 AJUSTE_INGRESO + 1 AJUSTE_EGRESO | OK |
| Stats: 10 Total, 0 Entradas, 5 Salidas, **5 Ajustes** | OK |
| Stat "Ajustes" cuenta AJUSTE_INGRESO + AJUSTE_EGRESO correctamente | OK |
| Filtro tipo "Ajuste": GET `/inventario/kardex?...&tipo=AJUSTE` -> 200 | OK |
| Backend expande AJUSTE -> [AJUSTE_INGRESO, AJUSTE_EGRESO] | OK |
| Solo 5 ajustes mostrados: 4 AJUSTE_INGRESO + 1 AJUSTE_EGRESO | OK |
| Stats con filtro: 5 Total, 0 Entradas, 0 Salidas, 5 Ajustes | OK |
| Network: Todas las requests 200 | OK |
| Console: 0 errores | OK |

---

## 5. Resumen de Archivos Modificados

### Backend (9 archivos)

#### Sesion 1
1. `newhype-backend/.../controller/ConfiguracionExtraController.java` - PATCH endpoint motivos
2. `newhype-backend/.../service/MotivoMovimientoService.java` - metodo cambiarEstado()
3. `newhype-backend/.../dto/configuracion/AlmacenResponse.java` - campo _count
4. `newhype-backend/.../service/AlmacenService.java` - logica de contadores
5. `newhype-backend/.../repository/StockAlmacenRepository.java` - countByTenantIdAndAlmacenId

#### Sesion 2 (Kardex filtro tipo)
6. `newhype-backend/.../controller/StockController.java` - @RequestParam tipo en getKardex
7. `newhype-backend/.../service/StockService.java` - Logica de filtro tipo con expansion AJUSTE
8. `newhype-backend/.../repository/MovimientoInventarioRepository.java` - countByTenantIdAndAlmacenId + 2 query methods con TipoIn

### Frontend (5 archivos)

#### Sesion 1
1. `frontend/.../inventory/services/almacenesApi.ts` - mapeo estado->activo
2. `frontend/.../inventory/services/movementReasonsApi.ts` - mapeo estado->activo + toggle fix
3. `frontend/.../inventory/services/inventoryRealApi.ts` - documentoReferencia en ajustes
4. `frontend/.../inventory/services/inventarioApi.ts` - fix endpoint busqueda productos

#### Sesion 2 (Kardex stats)
5. `frontend/.../inventory/pages/Inventario/Kardex.tsx` - Stats AJUSTE cuenta AJUSTE_INGRESO/AJUSTE_EGRESO

---

## 6. Datos de Prueba Creados

| Tipo | Datos |
|------|-------|
| Motivo AJUSTE | AJ-CONT: "Ajuste por conteo fisico" (tipo: AJUSTE, activo) |
| Ajuste de inventario | +5 unidades en "Lentes de Sol Urban" (Almacen 1) |

---

## 7. Correcciones Sesion 2 - Detalle Tecnico

### 7.1 Problemas encontrados

| Problema | Causa Raiz | Severidad |
|----------|-----------|-----------|
| Stats "Ajustes" siempre mostraba 0 | Frontend filtraba `m.tipo === 'AJUSTE'` pero backend retorna `AJUSTE_INGRESO`/`AJUSTE_EGRESO` | Media |
| Filtro dropdown "Tipo de Movimiento" no funcionaba | Backend `StockController` no declaraba `@RequestParam` para `tipo` | Alta |
| Ventas no aparecian en Kardex | No era bug: usuario buscaba producto sin movimientos. Backend funciona correcto | Falso positivo |

### 7.2 Cambios implementados

**Backend - `StockController.java`:**
- Agregado `@RequestParam(required = false) String tipo` al endpoint `GET /inventario/kardex`

**Backend - `StockService.java`:**
- `getKardex()` acepta parametro `String tipo`
- Logica de expansion: `AJUSTE` -> `[AJUSTE_INGRESO, AJUSTE_EGRESO]`
- Usa `TipoMovimiento.valueOf()` para valores individuales (ENTRADA, SALIDA, etc.)

**Backend - `MovimientoInventarioRepository.java`:**
- Agregado: `findByTenantIdAndProductoIdAndTipoInOrderByCreatedAtDesc()`
- Agregado: `findByTenantIdAndProductoIdAndAlmacenIdAndTipoInOrderByCreatedAtDesc()`

**Frontend - `Kardex.tsx`:**
- Stats: `m.tipo === 'AJUSTE'` cambiado a `m.tipo === 'AJUSTE' || m.tipo === 'AJUSTE_INGRESO' || m.tipo === 'AJUSTE_EGRESO'`
