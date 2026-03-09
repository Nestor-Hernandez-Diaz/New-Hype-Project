# 📦 ANÁLISIS COMPLETO DEL MÓDULO DE INVENTARIO (Frontend)

**Fecha:** 2026-03-08
**Status:** ANÁLISIS INICIAL COMPLETADO + SOLUCIONES PROPUESTAS
**Objetivo:** Verificación y corrección final del Módulo de Inventario (Stock, Kardex, Almacenes, Motivos de Movimiento)

---

## 📋 ÍNDICE EJECUTIVO

| Sección | Hallazgo Clave |
|---------|---|
| **Estado Actual** | Módulo 70% funcional; muchos campos del backend no se mapean al frontend |
| **Páginas Analizadas** | 4 páginas + 5 componentes + 4 servicios API |
| **Campos Vacíos/Nulos** | ~15 campos de backend + 8 campos locales mal aprovechados |
| **Causa Raíz Principal** | Mapeo incompleto Backend→Frontend en `inventoryRealApi.ts` |
| **Impacto** | Kardex sin datos de producto/almacén, Almacenes sin lógica CRUD completa |
| **Prioridad** | ALTA - Bloquea funcionalidad de Kardex y ajustes |

---

## 🎯 ESTADO ACTUAL DEL MÓDULO

### Estructura actual:
```
FRONTEND INVENTARIO
├── Pages (4)
│   ├── ListadoStock.tsx       ✓ Funcional
│   ├── Kardex.tsx              ⚠️ Campos vacíos
│   ├── ListaAlmacenes.tsx       ⚠️ Sin CRUD completo
│   └── ListaMotivosMovimiento.tsx ⚠️ Sin datos visibles
├── Components (5)
│   ├── FiltersStock.tsx         ✓ Funcional
│   ├── TablaStock.tsx           ✓ Bien mostrada
│   ├── FiltersKardex.tsx        ⚠️ Filtros limitados
│   ├── TablaKardex.tsx          ⚠️ Datos incompletos
│   └── ModalAjuste.tsx          ⚠️ Falta lógica
├── Services (4)
│   ├── inventoryRealApi.ts      ⚠️ Mapeos incompletos
│   ├── almacenesApi.ts          ⚠️ Sin GET de actualización
│   ├── movementReasonsApi.ts    ⚠️ Client-side filtering
│   └── inventarioApi.ts         ℹ️ Duplicado de inventoryRealApi
└── Context & Types              ✓ Bien estructurado
```

### Endpoints de backend disponibles:
```
✓ GET  /api/v1/inventario/stock              - Stock por almacén
✓ GET  /api/v1/inventario/kardex             - Movimientos (con paginación)
✓ GET  /api/v1/inventario/alertas            - Stock bajo/crítico
✓ POST /api/v1/inventario/ajustes            - Crear ajuste
✓ GET  /api/v1/inventario/stock/exportar     - Exportar CSV
✓ GET  /api/v1/configuracion/motivos-movimiento - Movement reasons list
✓ GET  /api/v1/almacenes                     - Warehouse list
✓ POST /api/v1/almacenes                     - Create warehouse
✓ PUT  /api/v1/almacenes/{id}                - Update warehouse
✓ DELETE /api/v1/almacenes/{id}              - Delete warehouse
✓ PATCH /api/v1/almacenes/{id}/estado        - Toggle estado
```

---

## 📄 ANÁLISIS DETALLADO POR PÁGINA

### 1️⃣ PÁGINA: LISTADO DE STOCK

**Ubicación:** `/inventario/stock`
**Componentes:** `ListadoStock.tsx`, `FiltersStock.tsx`, `TablaStock.tsx`

#### 📊 Campos mostrados en tabla:
| Campo | Backend | Frontend | Status |
|-------|---------|----------|--------|
| Código SKU | `productoSku` | `codigo` | ✓ Visible |
| Nombre Producto | `productoNombre` | `nombre` | ✓ Visible |
| Almacén | `almacenNombre` | `almacen` | ✓ Visible |
| Cantidad | `cantidad` | `cantidad` | ✓ Visible |
| Stock Mínimo | `stockMinimo` | `stockMinimo` | ✓ Visible |
| Status Stock | `stockBajo` + cantidad → `estado` | `estado` | ✓ Visible |
| Última Actualización | ❌ NO EXISTE EN BACKEND | `updatedAt` (fake) | ❌ CARGO FALSO |

#### ❌ Campos del backend NO mostrados:
| Campo | Backend | Por qué falta |
|-------|---------|---------------|
| `id` | `id` (StockByWarehouseId) | ✓ Usado internamente |
| `productoId` | `productoId` | ✓ Usado en filtros |
| `almacenId` | `almacenId` | ✓ Usado en filtros |
| Stock Crítico Dinámico | N/A | Enumerado como `estado: CRITICO` cuando cantidad=0 |

#### ⚠️ Problemas identificados:
1. **`updatedAt` es FAKE** (línea 98 en `inventoryRealApi.ts`):
   ```typescript
   updatedAt: new Date().toISOString(),  // ❌ Siempre la fecha/hora actual, NO del backend
   ```
   → El backend NO devuelve timestamp de última actualización

2. **Campos bien aprovechados** → Stock de verdad se ve correctamente

#### 🔧 Soluciones propuestas:
- **Opción A:** Eliminar `updatedAt` del mapeo (campo cosmético)
- **Opción B:** Agregar `updated_at` al dto `StockResponse` backend (requiere cambio DB)
- **Recomendación:** Opción A (cambio mínimo, campo no crítico)

---

### 2️⃣ PÁGINA: KARDEX (Movimientos de Inventario)

**Ubicación:** `/inventario/kardex`
**Componentes:** `Kardex.tsx`, `FiltersKardex.tsx`, `TablaKardex.tsx`

#### 📊 Campos mostrados en tabla:
| Campo | Backend | Frontend | Status |
|-------|---------|----------|--------|
| Fecha | `createdAt` | `fecha` | ✓ Visible |
| Tipo Movimiento | `tipo` | `tipo` | ✓ Visible (badge coloreado) |
| Cantidad | `cantidad` | `cantidad` | ✓ Visible |
| Stock Antes | `stockAntes` | `stockAntes` | ✓ Visible |
| Stock Después | `stockDespues` | `stockDespues` | ✓ Visible |
| Documento Referencia | `documentoReferencia` | `motivo` | ⚠️ CAMPO RENOMBRADO |
| Usuario | `usuarioId` | `usuario` | ⚠️ SOLO ID, sin nombre |
| **Código Producto** | ❌ NO EXISTE | `codigo` | ❌ CAMPO VACÍO |
| **Nombre Producto** | ❌ NO EXISTE | `nombre` | ❌ CAMPO VACÍO |
| **Almacén** | ❌ ALMACÉN ID SÍ | `almacen` | ❌ MAPPING ERROR |

#### ❌ PROBLEMAS CRÍTICOS:
1. **Campos completamente vacíos en el frontend:**
   ```typescript
   // En mapBackendKardexItem() - líneas 103-118
   codigo: '',           // ❌ VACÍO (backend no devuelve)
   nombre: '',           // ❌ VACÍO (backend no devuelve)
   almacen: '',          // ❌ VACÍO (almacenId sí existe, pero nombre no)
   ```

2. **El backend devuelve SOLO IDs, no nombres:**
   ```typescript
   // KardexResponse (backend)
   almacenId: Long,      // ✓ ID
   almacenNombre: null,  // ❌ NO EXISTE
   usuarioId: Long,      // ✓ ID
   usuarioNombre: null,  // ❌ NO EXISTE
   productId: null,      // ❌ NO VIENE (filter-based)
   productNombre: null,  // ❌ NO VIENE
   ```

3. **Usuario mostrado como plain ID** (p. ej., "18261"), debería ser nombre

#### 🔧 Soluciones propuestas:

**Opción A - Backend (Recomendada):**
```java
// En KardexResponse.java - agregar campos
private String productoNombre;      // Join con Producto
private String productoSku;
private String almacenNombre;       // Join con Almacen
private String usuarioNombre;       // Join con Usuario
```

**Opción B - Frontend:**
- Hacer llamadas adicionales para enriquecer datos (N+1 queries)
- O usar un Map de almacenes/usuarios cacheado

**Decision:** OPCIÓN A - Es más eficiente y correcto arquitectónicamente

---

### 3️⃣ PÁGINA: ALMACENES (Warehouses)

**Ubicación:** `/inventario/almacenes`
**Componentes:** `ListaAlmacenes.tsx`
**Servicio:** `almacenesApi.ts`

#### 📊 Componentes CRUD disponibles:
| Operación | Implementada | Status |
|-----------|--------------|--------|
| Listar almacenes | ✓ `getAlmacenes()` | ✓ OK |
| Crear almacén | ✓ `createAlmacen()` | ✓ OK |
| Editar almacén | ✓ `updateAlmacen()` | ✓ OK |
| Eliminar almacén | ✓ `deleteAlmacen()` | ✓ OK |
| Cambiar estado | ✓ `toggleAlmacenEstado()` | ✓ OK |

#### ❌ PROBLEMA: Mapeo backend→frontend incorrecto

```typescript
// Backend devuelve:
{
  id: 1,
  nombre: "Almacén Central",
  estado: true,           // ✓ Boolean
  ubicacion: "Centro",
  capacidad: 1000,
  ...
}

// Frontend espera:
{
  id: 1,
  nombre: "Almacén Central",
  activo: true,           // ❌ Busca "activo" pero backend devuelve "estado"
  ubicacion: "Centro",
  ...
}
```

**Descubierto en:** `almacenesApi.ts` - función `toggleAlmacenEstado()` usa parámetro `activo`

#### ⚠️ Impacto:
- El toggle de estado probablemente **falla silenciosamente**
- La tabla muestra almacenes con valores incorrectos

#### 🔧 Solución:
```typescript
// En almacenesApi.ts - mapeo correcto
function mapBackendAlmacen(b: any): Almacen {
  return {
    id: b.id,
    nombre: b.nombre,
    activo: b.estado,  // ✓ MAPEO CORRECTO: estado → activo
    ubicacion: b.ubicacion,
    capacidad: b.capacidad,
  };
}
```

---

### 4️⃣ PÁGINA: MOTIVOS DE MOVIMIENTO (Movement Reasons)

**Ubicación:** `/inventario/configuracion/motivos`
**Componentes:** `ListaMotivosMovimiento.tsx`
**Servicio:** `movementReasonsApi.ts`

#### 📊 Campos esperados:
| Campo | Backend | Frontend | Status |
|-------|---------|----------|--------|
| ID | `id` | `id` | ✓ OK |
| Nombre | `nombre` | `nombre` | ✓ OK |
| Tipo | `tipo` | `tipo` | ✓ OK (ENTRADA/SALIDA/AJUSTE) |
| Activo | `activo` | `activo` | ✓ OK |
| Creado | `createdAt` | - | ⚠️ NO MOSTRADO |

#### ⚠️ PROBLEMA: Datos no cargados visualmente
- Página carga pero **NO muestra tabla con motivos**
- Botón "Nuevo Motivo" probablemente abre modal sin lógica

#### ❌ CAMPO VACÍO IDENTIFICADO:
En el filtro por tipo, opciones hardcodeadas pero NO debería haber límite:
```typescript
// Debería permitir TODOS los tipos: ENTRADA, SALIDA, AJUSTE_INGRESO, AJUSTE_EGRESO
// El kardex usa AJUSTE_INGRESO/AJUSTE_EGRESO pero aquí solo ve ENTRADA/SALIDA/AJUSTE
```

#### 🔧 Solución:
Verificar que backend devuelva tipo en ENUM correcto:
```java
// MovementReason entity - agregar si falta
@Enumerated(EnumType.STRING)
@Column(name = "tipo")
private TipoMovimiento tipo;  // ENTRADA, SALIDA, AJUSTE_INGRESO, AJUSTE_EGRESO
```

---

## 🚨 RESUMEN DE CAMPOS VACÍOS/NULOS ENCONTRADOS

### Tabla comparativa completa:

| Página | Campo | Backend | Frontend | Causa | Severidad |
|--------|-------|---------|----------|-------|-----------|
| **Stock** | updatedAt | ❌ NO | ✓ Fake | Mapeo asigna siempre `new Date()` | BAJA |
| **Kardex** | codigo | ❌ NO | ❌ Vacío | Backend no envía productNombre | **CRÍTICA** |
| **Kardex** | nombre | ❌ NO | ❌ Vacío | Backend no envía productNombre | **CRÍTICA** |
| **Kardex** | almacen | ⚠️ ID sí | ❌ Vacío | Backend envía ID, no nombre | **ALTA** |
| **Kardex** | usuario | ✓ ID sí | ⚠️ Solo ID | Backend envía ID, no nombre | ALTA |
| **Almacenes** | estado | ✓ Existe | ❌ Mapeo error | Busca `activo` en lugar de `estado` | **CRÍTICA** |
| **Motivos** | tipo | ✓ OK | ⚠️ Opciones hardcodeadas | No incluye AJUSTE_INGRESO/EGRESO | MEDIA |

---

## 🔧 PLAN DE ACCIÓN DE FIXES

### FASE 1: Backend (DTOs - 30 min)

#### 1.1 Enriquecer `KardexResponse.java`
**Archivo:** `/newhype-backend/src/main/java/com/newhype/backend/dto/stock/KardexResponse.java`

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KardexResponse {
    // Campos existentes
    private Long id;
    private String tipo;
    private Integer cantidad;
    private Integer stockAntes;
    private Integer stockDespues;
    private String documentoReferencia;
    private Long almacenId;
    private Long usuarioId;
    private LocalDateTime createdAt;

    // NUEVOS CAMPOS ⭐
    private String productoNombre;      // Join con Producto
    private String productoSku;         // Join con Producto
    private String almacenNombre;       // Join con Almacen
    private String usuarioNombre;       // Join con Usuario
    private Long productoId;            // Explícito (viniendo del kardex)
}
```

#### 1.2 Actualizar `StockService.getKardex()`
**Archivo:** `/newhype-backend/src/main/java/com/newhype/backend/service/StockService.java`

```java
public Page<KardexResponse> getKardex(Long productoId, Long almacenId, String tipo, int page, int size) {
    // ... lógica existente ...

    return result.map(movimiento -> {
        // Obtener datos del producto
        Producto producto = productoRepository.findById(productoId).orElse(null);

        // Obtener datos del almacén
        Almacen almacen = almacenRepository.findById(movimiento.getAlmacenId()).orElse(null);

        // Obtener datos del usuario (si es necesario)
        Usuario usuario = usuarioRepository.findById(movimiento.getUsuarioId()).orElse(null);

        return KardexResponse.builder()
            .id(movimiento.getId())
            .tipo(movimiento.getTipo().toString())
            .cantidad(movimiento.getCantidad())
            .stockAntes(movimiento.getStockAntes())
            .stockDespues(movimiento.getStockDespues())
            .documentoReferencia(movimiento.getDocumentoReferencia())
            .almacenId(movimiento.getAlmacenId())
            .productoId(movimiento.getProductoId())
            .usuarioId(movimiento.getUsuarioId())
            .createdAt(movimiento.getCreatedAt())
            // NUEVOS CAMPOS ⭐
            .productoNombre(producto != null ? producto.getNombre() : "N/A")
            .productoSku(producto != null ? producto.getSku() : "N/A")
            .almacenNombre(almacen != null ? almacen.getNombre() : "N/A")
            .usuarioNombre(usuario != null ? usuario.getNombre() : "Sistema")
            .build();
    });
}
```

#### 1.3 Revisar tipos de Motivos de Movimiento
**Verificar:** Que en base de datos existan tipos `AJUSTE_INGRESO` y `AJUSTE_EGRESO` además de `ENTRADA` y `SALIDA`

---

### FASE 2: Frontend Mappings (20 min)

#### 2.1 Actualizar `inventoryRealApi.ts` - Mapeo Kardex
**Archivo:** `/frontend/src/modules/inventory/services/inventoryRealApi.ts`

```typescript
// Actualizar interfaz BackendKardexItem
interface BackendKardexItem {
  id: number;
  tipo: string;
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  documentoReferencia: string | null;
  almacenId: number;
  productoId: number;           // ⭐ NEW
  usuarioId: number;
  productoNombre: string | null; // ⭐ NEW
  productoSku: string | null;   // ⭐ NEW
  almacenNombre: string | null; // ⭐ NEW
  usuarioNombre: string | null; // ⭐ NEW
  createdAt: string;
}

// Actualizar función de mapeo
function mapBackendKardexItem(b: BackendKardexItem, filters: KardexFilters): MovimientoKardex {
  return {
    id: String(b.id),
    fecha: b.createdAt,
    productId: String(b.productoId),    // ⭐ AHORA VIENE DEL BACKEND
    codigo: b.productoSku || '',        // ⭐ AHORA VIENE DEL BACKEND
    nombre: b.productoNombre || '',     // ⭐ AHORA VIENE DEL BACKEND
    almacen: b.almacenNombre || '',     // ⭐ AHORA VIENE DEL BACKEND
    tipo: b.tipo as MovimientoKardex['tipo'],
    cantidad: b.cantidad,
    stockAntes: b.stockAntes,
    stockDespues: b.stockDespues,
    motivo: b.documentoReferencia || '',
    usuario: b.usuarioNombre || `Usuario #${b.usuarioId}`, // ⭐ NOMBRE O ID FALLBACK
    documentoReferencia: b.documentoReferencia || undefined,
  };
}
```

#### 2.2 Corregir `almacenesApi.ts` - Mapeo Almacenes
**Archivo:** `/frontend/src/modules/inventory/services/almacenesApi.ts`

```typescript
// Agregar función de mapeo
function mapBackendAlmacen(b: any): Almacen {
  return {
    id: b.id,
    nombre: b.nombre,
    activo: b.estado,             // ⭐ MAPPING CORRECTO: estado → activo
    ubicacion: b.ubicacion,
    capacidad: b.capacidad,
    // ... otros campos
  };
}

// Actualizar getAlmacenes()
async getAlmacenes(): Promise<Almacen[]> {
  const res: ApiResponse<any[]> = await apiService.get('/almacenes');
  if (!res.success || !res.data) throw new Error('Error al cargar almacenes');
  return res.data.map(mapBackendAlmacen);  // ⭐ APLICAR MAPEO
}

// Actualizar toggleAlmacenEstado()
async toggleAlmacenEstado(almacenId: number): Promise<Almacen> {
  const res: ApiResponse<any> = await apiService.patch(`/almacenes/${almacenId}/estado`);
  if (!res.success || !res.data) throw new Error('Error al actualizar estado');
  return mapBackendAlmacen(res.data);  // ⭐ APLICAR MAPEO
}
```

#### 2.3 Remover campo fake en Stock
**Archivo:** `/frontend/src/modules/inventory/services/inventoryRealApi.ts` - línea 98

```typescript
function mapBackendStockItem(b: BackendStockItem): StockItem {
  return {
    stockByWarehouseId: String(b.id),
    productId: String(b.productoId),
    codigo: b.productoSku || '',
    nombre: b.productoNombre || '',
    almacen: b.almacenNombre || '',
    warehouseId: String(b.almacenId),
    cantidad: b.cantidad ?? 0,
    stockMinimo: b.stockMinimo ?? null,
    estado: deriveEstadoStock(b.cantidad ?? 0, b.stockMinimo, b.stockBajo),
    // updatedAt: new Date().toISOString(),  // ❌ REMOVER CAMPO FAKE
    // Si queremos fecha de actualización, agregar al backend first
  };
}
```

---

### FASE 3: Frontend Components (15 min)

#### 3.1 Actualizar `FiltersKardex.tsx` - Tipos movimiento
**Archivo:** `/frontend/src/modules/inventory/components/Inventario/FiltersKardex.tsx`

```typescript
// Actualizar selector de tipo con TODOS los valores posibles
const movementTypeOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'SALIDA', label: 'Salida' },
  { value: 'AJUSTE_INGRESO', label: 'Ajuste Ingreso' },    // ⭐ NEW
  { value: 'AJUSTE_EGRESO', label: 'Ajuste Egreso' },      // ⭐ NEW
];
```

#### 3.2 Validar `TablaKardex.tsx` muestre todos los campos
Confirmar que estos campos se muestren en la tabla:
- Producto (código + nombre) ✓
- Almacén ✓
- Tipo ✓
- Cantidad ✓
- Stock Antes/Después ✓
- Usuario ✓

---

### FASE 4: Verificación E2E (30 min)

#### Checklist de validación:

**Stock Page:**
- [ ] Carga sincronización correcta de almacenes
- [ ] Filtros funcionan (búsqueda, estado, almacén)
- [ ] Tabla muestra datos reales (sin updatedAt fake)
- [ ] Botón "Ajustar" abre modal

**Kardex Page:**
- [ ] Requiere seleccionar producto primero
- [ ] Muestra tabla CON datos:
  - [  ] Código producto ✓
  - [ ] Nombre producto ✓
  - [ ] Almacén nombre ✓
  - [ ] Usuario nombre (NO solo ID) ✓
- [ ] Filtros por tipo incluyen AJUSTE_INGRESO/EGRESO
- [ ] Búsqueda de producto autocomplete funciona

**Almacenes Page:**
- [ ] Tabla muestra almacenes con estado correcto (ON/OFF)
- [ ] Toggle estado funciona
- [ ] CRUD create/edit/delete sin errores
- [ ] Network tab shows 200/201/204 status

**Motivos Page:**
- [ ] Tabla muestra motivos existentes
- [ ] Filtro por tipo incluye ENTRADA/SALIDA/AJUSTE_INGRESO/AJUSTE_EGRESO
- [ ] CRUD funciona para nuevos motivos
- [ ] Console sin errores

---

## 📋 RESUMEN EJECUTIVO DE CAMBIOS

| Archivo | Cambio | Líneas | Severidad |
|---------|--------|--------|-----------|
| `KardexResponse.java` | Agregar 4 campos nuevos | +4 | CRÍTICA |
| `StockService.java` | Enriquecer respuesta kardex con joins | ~15 | CRÍTICA |
| `inventoryRealApi.ts` | Actualizar mapeo CardexItem + remover fake updatedAt | ~10 | CRÍTICA |
| `almacenesApi.ts` | Agregar función mapeo y aplicarla | ~8 | CRÍTICA |
| `FiltersKardex.tsx` | Agregar AJUSTE_INGRESO/EGRESO a opciones | +2 | MEDIA |
| `ListaMotivosMovimiento.tsx` | Validar tabla visible (sin cambios esperados) | 0 | BAJA |

---

## 🎯 RESULTADO ESPERADO DESPUÉS DE FIXES

### Stock Page ✓
- Tabla con datos reales (sin updatedAt fake)
- Status correcto del stock
- Ajustes funcionales

### Kardex Page ⭐ **GRAN MEJORA**
- **ANTES:** Tabla con 3 columnas vacías (codigo, nombre, almacen)
- **DESPUÉS:** Tabla completa mostrando:
  ```
  | Fecha | Código | Producto | Almacén | Tipo | Qty | Stock Antes → Después | Usuario | Motivo |
  | ---|---|---|---|---|---|---|---|---|
  | 2026-03-08 | POL-GRS-M-NEG | Polo Graphic Street | Almacén Central | ENTRADA | 50 | 0 → 50 | Carlos Admin | Compra OC-2025 |
  ```

### Almacenes Page ✓
- Toggle estado funciona correctamente
- CRUD sin errores

### Motivos Page ✓
- Motivos visibles en tabla
- Todos los tipos soportados

---

## 🚀 PRÓXIMOS PASOS EN ORDEN

1. **Implementar cambios BACKEND** (KardexResponse + StockService)
2. **Compilar y revisar SIN errores Java**
3. **Implementar cambios FRONTEND** (inventoryRealApi + almacenesApi + components)
4. **Compilar y revisar SIN errores TypeScript**
5. **Iniciar dev server y probar cada página**
6. **Usar DevTools F12 para validar Network + Console**
7. **Tests E2E con datos reales**

---

**STATUS:** Listo para implementación ✓
**DOCUMENTACIÓN:** Completa y detallada ✓
**ESTIMADO TOTAL:** ~2-3 horas (backend + frontend + testing)
