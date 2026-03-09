# Fix Módulo de Compras - Resultados

## Estado Actual del Módulo

El módulo de Compras cuenta con:
- **Órdenes de Compra**: CRUD completo, transiciones de estado (PENDIENTE → ENVIADA → CONFIRMADA → EN_RECEPCION → PARCIAL → COMPLETADA), PDF funcional.
- **Recepciones de Compra**: CRUD, confirmación con actualización de stock/kardex, anulación con reversión de cantidades.
- **Integración**: Flujo OC → Recepción → Stock/Kardex implementado.

### Problemas Identificados

| # | Problema | Síntoma | Severidad |
|---|---------|---------|-----------|
| 1 | No se puede crear Recepción de Compra | Error 500 en `POST /api/v1/compras/recepciones` | Crítico |
| 2 | PDF no funcional en Recepciones | "Error al descargar" al hacer clic en PDF | Alto |

---

## Problema 1: Error 500 al Crear Recepción de Compra

### Causa Raíz

**Código de recepción duplicado por generación incorrecta.**

En `RecepcionCompraService.java:71-72`, el código se generaba contando recepciones **por OC específica**:

```java
// ANTES (incorrecto)
long countRec = recepcionCompraRepository.countByTenantIdAndOrdenCompraId(tenantId, oc.getId());
String codigo = String.format("REC-%05d", countRec + 1);
```

Esto producía códigos como `REC-00001` para **cada OC diferente**, violando el constraint UNIQUE de la columna `codigo` en la tabla `recepciones_compra` cuando ya existía una recepción de otra OC con el mismo código.

**Causa secundaria**: Potencial NPE en `toResponseBasico()` al construir el nombre del proveedor cuando `getNombres()` o `getApellidos()` son `null`:

```java
// ANTES (riesgo NPE)
proveedorNombre = proveedor.getRazonSocial() != null ? proveedor.getRazonSocial()
    : (proveedor.getNombres() + " " + proveedor.getApellidos()).trim();
```

### Lógica de la Solución

1. **Código único por tenant**: Cambiar el conteo a `countByTenantId(tenantId)` para generar códigos secuenciales únicos a nivel de tenant, no por OC.
2. **Protección NPE**: Verificar cada campo individualmente antes de concatenar.

### Código Modificado

**`RecepcionCompraRepository.java`** — Agregar método de conteo por tenant:

```java
long countByTenantId(Long tenantId);
```

**`RecepcionCompraService.java`** — Fix generación de código:

```java
// DESPUÉS (correcto)
long countRec = recepcionCompraRepository.countByTenantId(tenantId);
String codigo = String.format("REC-%05d", countRec + 1);
```

**`RecepcionCompraService.java`** — Fix NPE en nombre proveedor:

```java
// DESPUÉS (seguro contra null)
if (proveedor != null) {
    if (proveedor.getRazonSocial() != null && !proveedor.getRazonSocial().isEmpty()) {
        proveedorNombre = proveedor.getRazonSocial();
    } else {
        String nombres = proveedor.getNombres() != null ? proveedor.getNombres() : "";
        String apellidos = proveedor.getApellidos() != null ? proveedor.getApellidos() : "";
        proveedorNombre = (nombres + " " + apellidos).trim();
    }
}
```

---

## Problema 2: PDF no Funcional en Recepciones de Compra

### Causa Raíz

**Falta completa de implementación** — El método `downloadPDF()` se llama desde dos componentes pero nunca fue definido:

| Componente | Línea | Llamada |
|-----------|-------|---------|
| `PurchaseReceiptList.tsx` | 418 | `purchaseReceiptService.downloadPDF(receiptId)` |
| `PurchaseReceiptDetail.tsx` | 397 | `purchaseReceiptService.downloadPDF(receipt.id)` |

**Backend**: No existía endpoint `GET /api/v1/compras/recepciones/{id}/pdf`.

**Frontend**: No existían métodos `exportToPDF()` ni `downloadPDF()` en `PurchaseReceiptService`.

### Lógica de la Solución

1. **Backend**: Agregar `generarHtmlRecepcion(Long id)` en el servicio y endpoint `GET /{id}/pdf` en el controller, siguiendo el mismo patrón que `OrdenCompraController.descargarPdf()`.
2. **Frontend**: Agregar métodos `exportToPDF(id)` y `downloadPDF(id, filename?)` en `PurchaseReceiptService`, siguiendo el mismo patrón que `PurchaseOrderService`.

### Código Modificado

**`RecepcionCompraController.java`** — Nuevo endpoint:

```java
@GetMapping("/{id}/pdf")
@Operation(summary = "Descargar recepción de compra como HTML/PDF")
public ResponseEntity<byte[]> descargarPdf(@PathVariable Long id) {
    String html = recepcionCompraService.generarHtmlRecepcion(id);
    byte[] content = html.getBytes(java.nio.charset.StandardCharsets.UTF_8);

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=REC_" + id + ".html")
            .contentType(MediaType.TEXT_HTML)
            .contentLength(content.length)
            .body(content);
}
```

**`RecepcionCompraService.java`** — Nuevo método de generación HTML:

```java
@Transactional(readOnly = true)
public String generarHtmlRecepcion(Long id) {
    RecepcionCompraResponse rec = obtenerPorId(id);
    // Genera HTML con: código, OC asociada, proveedor, almacén, estado,
    // tabla de productos (ordenada/recibida/aceptada/rechazada),
    // resumen de completitud
}
```

**`purchaseReceiptService.ts`** — Nuevos métodos frontend:

```typescript
async exportToPDF(id: string): Promise<Blob> {
    const response = await this.api.get(`${this.baseEndpoint}/${id}/pdf`, {
        responseType: 'blob',
    });
    return new Blob([response.data], { type: 'text/html' });
}

async downloadPDF(id: string, filename?: string): Promise<void> {
    const blob = await this.exportToPDF(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `recepcion-compra-${id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
```

---

## Archivos Modificados

### Backend

| Archivo | Cambio |
|---------|--------|
| `RecepcionCompraRepository.java` | Agregar `countByTenantId(Long)` |
| `RecepcionCompraService.java` | Fix código duplicado, fix NPE proveedor, nuevo método `generarHtmlRecepcion()` |
| `RecepcionCompraController.java` | Nuevo endpoint `GET /{id}/pdf` |

### Frontend

| Archivo | Cambio |
|---------|--------|
| `purchaseReceiptService.ts` | Agregar métodos `exportToPDF()` y `downloadPDF()` |

---

## Checklist E2E (Ejecutado 08/03/2026)

- [x] Crear Orden de Compra (POST /api/v1/compras/ordenes) → 200 ✅ OC-00003 creada
- [x] Enviar OC (PATCH /ordenes/3/estado → ENVIADA) → 200 ✅
- [x] Confirmar OC (PATCH /ordenes/3/estado → CONFIRMADA) → 200 ✅
- [x] Crear Recepción desde OC CONFIRMADA (POST /recepciones) → 200 ✅ REC-00003 creada (Bug #1 RESUELTO)
- [x] Verificar que OC cambia a EN_RECEPCION automáticamente ✅ OC-00003 → EN_RECEPCION
- [x] Confirmar Recepción (PATCH /recepciones/9/confirmar) → 200 ✅ Inventario actualizado
- [x] Verificar OC cambia a COMPLETADA automáticamente ✅ OC-00003 → COMPLETADA
- [x] Descargar PDF de Orden de Compra (GET /ordenes/3/pdf) → 200 ✅
- [x] Descargar PDF de Recepción (GET /recepciones/9/pdf) → 200 ✅ (Bug #2 RESUELTO)
- [x] Console: cero errores ✅ 0 errores en toda la sesión E2E
- [x] Network: todas las peticiones → 200 ✅ 0 errores de red

## SQL Sugerido

Si el constraint UNIQUE en `codigo` de `recepciones_compra` causa conflictos con datos existentes:

```sql
-- Verificar recepciones con código duplicado
SELECT codigo, COUNT(*) as cnt
FROM recepciones_compra
WHERE tenant_id = 1
GROUP BY codigo
HAVING COUNT(*) > 1;

-- Renumerar códigos duplicados si existen
UPDATE recepciones_compra
SET codigo = CONCAT('REC-', LPAD(id, 5, '0'))
WHERE tenant_id = 1;
```

---

## Resumen - Ronda 1 (Bugs Críticos)

| Problema | Estado Antes | Estado Después |
|----------|-------------|----------------|
| Crear Recepción | Error 500 (código duplicado + NPE) | Funcional (código único por tenant) |
| PDF Recepciones | `downloadPDF is not a function` | Descarga HTML con detalle completo |
| PDF Órdenes | Funcional (sin cambios) | Sin cambios |

---

# Ronda 2: Fixes Cosméticos de Visualización (08/03/2026)

## Estado Actual

El flujo principal OC → Recepción → Stock/Kardex ya funciona correctamente (verificado E2E). Sin embargo, se detectaron 4 problemas cosméticos de visualización durante testing:

| # | Problema | Síntoma | Severidad |
|---|---------|---------|-----------|
| 1 | Lista de Recepciones: "0 productos" | `receipt.items.length` devuelve 0 en lista | Cosmético |
| 2 | Detalle Recepción: "Ordenada Original: 0" | `item.ordenCompraItem?.cantidadOrdenada` es undefined | Cosmético |
| 3 | Kardex: no muestra movimientos de recepción | Issue pre-existente del módulo Kardex | Pre-existente |
| 4 | Detalle Recepción: "Proveedor: N/A" | `receipt.ordenCompra?.proveedor` no poblado | Cosmético |

**Nota sobre Issue #3 (Kardex)**: Es un problema pre-existente del módulo de Inventario/Kardex, no relacionado con el módulo de Compras. No se modifica como parte de esta corrección.

---

## Fix #1: Lista de Recepciones muestra "0 productos"

### Causa Raíz

El endpoint `GET /api/v1/compras/recepciones` (lista) usa `toResponseBasico()` que **no incluye `detalles`** (por diseño, para evitar queries pesadas en listados). El DTO usa `@JsonInclude(NON_NULL)`, por lo que `detalles` se omite del JSON.

En el frontend, `mapBackendReceipt()` mapea `items: (data.detalles || []).map(...)`, lo que produce `items: []` cuando `detalles` es null.

`PurchaseReceiptList.tsx:607` muestra `{receipt.items?.length || 0} productos` → siempre **"0 productos"**.

### Lógica de la Solución

Agregar un campo `cantidadItems` al DTO de respuesta y popularlo en `toResponseBasico()` con un conteo directo de la tabla `detalle_recepciones_compra`. Esto da la cantidad real sin enviar el array completo de detalles.

### Código Modificado

**`RecepcionCompraResponse.java`** — Nuevo campo:

```java
private Integer cantidadItems;
```

**`RecepcionCompraService.java`** — Popular en `toResponseBasico()`:

```java
int cantidadItems = detalleRecepcionCompraRepository.findByRecepcionId(rec.getId()).size();
// ...
.cantidadItems(cantidadItems)
```

**`purchaseReceiptService.ts`** — Mapear campo en frontend:

```typescript
function mapBackendReceipt(data: any): PurchaseReceipt {
  return {
    // ...
    cantidadItems: data.cantidadItems || 0,
    items: (data.detalles || []).map(mapBackendReceiptItem),
    // ...
  } as PurchaseReceipt;
}
```

**`purchases.types.ts`** — Agregar tipo:

```typescript
export interface PurchaseReceipt {
  // ...
  cantidadItems?: number;
  items: PurchaseReceiptItem[];
  // ...
}
```

**`PurchaseReceiptList.tsx`** — Usar fallback:

```tsx
// ANTES:
{(receipt.items?.length || 0)} productos

// DESPUÉS:
{(receipt.items?.length || receipt.cantidadItems || 0)} productos
```

### Resultado

| Antes | Después |
|-------|---------|
| "0 productos" | "1 productos" |

---

## Fix #2: Detalle de Recepción muestra "Ordenada Original: 0"

### Causa Raíz

`PurchaseReceiptDetail.tsx` muestra columnas "Ordenada Original", "Ya Recibida", "Pendiente" usando `item.ordenCompraItem?.cantidadOrdenada`, etc. Pero la interfaz `PurchaseReceiptItem.ordenCompraItem` **nunca se poblaba** porque:

1. **Backend**: `DetalleRecepcionResponse` solo incluía datos propios del detalle de recepción (`cantidadRecibida`, `cantidadAceptada`), sin datos de la OC original.
2. **Frontend**: `mapBackendReceiptItem()` no mapeaba `ordenCompraItem`.

### Lógica de la Solución

Agregar `cantidadOrdenada`, `cantidadRecibidaOC` y `cantidadPendiente` al DTO `DetalleRecepcionResponse`, y poblarlos en `toResponseCompleto()` consultando `DetalleOrdenCompra` (que ya se referencia vía `detalleOrdenCompraId`).

### Código Modificado

**`DetalleRecepcionResponse.java`** — Nuevos campos:

```java
private Integer cantidadOrdenada;    // Cantidad ordenada en la OC
private Integer cantidadRecibidaOC;  // Total recibido en la OC (de TODAS las recepciones)
private Integer cantidadPendiente;   // cantidadOrdenada - cantidadRecibidaOC
```

**`RecepcionCompraService.java`** — Popular en `toResponseCompleto()`:

```java
DetalleOrdenCompra doc = detalleOrdenCompraRepository
    .findById(d.getDetalleOrdenCompraId()).orElse(null);
if (doc != null) {
    cantidadOrdenada = doc.getCantidadOrdenada();
    cantidadRecibidaOC = doc.getCantidadRecibida() != null ? doc.getCantidadRecibida() : 0;
    cantidadPendiente = cantidadOrdenada - cantidadRecibidaOC;
}

return DetalleRecepcionResponse.builder()
    // campos existentes...
    .cantidadOrdenada(cantidadOrdenada)
    .cantidadRecibidaOC(cantidadRecibidaOC)
    .cantidadPendiente(cantidadPendiente)
    .build();
```

**`purchaseReceiptService.ts`** — Mapear `ordenCompraItem`:

```typescript
function mapBackendReceiptItem(item: any): PurchaseReceiptItem {
  return {
    // campos existentes...
    ordenCompraItem: item.cantidadOrdenada != null ? {
      cantidadOrdenada: item.cantidadOrdenada,
      cantidadRecibida: item.cantidadRecibidaOC || 0,
      cantidadPendiente: item.cantidadPendiente || 0,
    } : undefined,
    // ...
  };
}
```

### Resultado

| Campo | Antes | Después |
|-------|-------|---------|
| Ordenada Original | 0 | 10 |
| Ya Recibida | 0 | 0 (correcto: esta fue la única recepción) |
| Pendiente | 0 | 0 (correcto: todo fue recibido) |
| En Esta Recepción | 10 | 10 (sin cambios) |

---

## Fix #4: Detalle de Recepción muestra "Proveedor: N/A"

### Causa Raíz

`PurchaseReceiptDetail.tsx:521` muestra `receipt.ordenCompra?.proveedor?.razonSocial || 'N/A'`. El problema es que:

1. **Backend**: `RecepcionCompraResponse` no tenía campo de proveedor. `toResponseBasico()` consultaba la `OrdenCompra` para obtener `ordenCompraCodigo`, pero no el proveedor.
2. **Frontend**: `mapBackendReceipt()` mapeaba `ordenCompra` como `{ codigo: data.ordenCompraCodigo }` sin `proveedor`.

### Lógica de la Solución

Agregar `proveedorNombre` y `ordenCompraEstado` al DTO `RecepcionCompraResponse`, y poblarlos en `toResponseBasico()` consultando la `EntidadComercial` (proveedor) a través de `OrdenCompra.proveedorId`.

### Código Modificado

**`RecepcionCompraResponse.java`** — Nuevos campos:

```java
private String proveedorNombre;
private String ordenCompraEstado;
```

**`RecepcionCompraService.java`** — Inyectar `EntidadComercialRepository` y popular:

```java
// Constructor: agregar EntidadComercialRepository
private final EntidadComercialRepository entidadComercialRepository;

// toResponseBasico():
String proveedorNombre = null;
if (oc != null && oc.getProveedorId() != null) {
    EntidadComercial proveedor = entidadComercialRepository
        .findById(oc.getProveedorId()).orElse(null);
    if (proveedor != null) {
        if (proveedor.getRazonSocial() != null && !proveedor.getRazonSocial().isEmpty()) {
            proveedorNombre = proveedor.getRazonSocial();
        } else {
            String nombres = proveedor.getNombres() != null ? proveedor.getNombres() : "";
            String apellidos = proveedor.getApellidos() != null ? proveedor.getApellidos() : "";
            proveedorNombre = (nombres + " " + apellidos).trim();
        }
    }
}

// .builder():
.proveedorNombre(proveedorNombre)
.ordenCompraEstado(oc != null ? oc.getEstado().name() : null)
```

**`purchaseReceiptService.ts`** — Mapear proveedor en `ordenCompra`:

```typescript
function mapBackendReceipt(data: any): PurchaseReceipt {
  return {
    // ...
    ordenCompra: data.ordenCompraCodigo ? {
      codigo: data.ordenCompraCodigo,
      estado: data.ordenCompraEstado || undefined,
      proveedor: data.proveedorNombre ? {
        razonSocial: data.proveedorNombre,
      } : undefined,
    } as any : undefined,
    // ...
  };
}
```

### Resultado

| Campo | Antes | Después |
|-------|-------|---------|
| Proveedor | N/A | REXTIE S.A.C. |
| Estado de Orden | N/A | COMPLETADA |
| Productos en Orden | 0 items | 1 items |

---

## Issue #3: Kardex no muestra movimientos de recepción (Pre-existente)

### Descripción

Al navegar a `/inventario/kardex` y seleccionar "Almacen Principal", la página del Kardex no muestra los movimientos ENTRADA generados por las recepciones de compra confirmadas.

### Diagnóstico

Este es un **problema pre-existente del módulo de Inventario**, no relacionado con el módulo de Compras. Los movimientos de inventario se crean correctamente en la tabla `movimientos_inventario` (verificado en BD), pero la UI del Kardex tiene un issue en la búsqueda/filtrado que requiere atención separada.

### Acción

**No se modifica** como parte de esta corrección. Se documenta para resolver en un sprint futuro del módulo de Inventario.

---

## Archivos Modificados (Ronda 2)

### Backend

| Archivo | Cambio |
|---------|--------|
| `RecepcionCompraResponse.java` | +3 campos: `cantidadItems`, `proveedorNombre`, `ordenCompraEstado` |
| `DetalleRecepcionResponse.java` | +3 campos: `cantidadOrdenada`, `cantidadRecibidaOC`, `cantidadPendiente` |
| `RecepcionCompraService.java` | Inyectar `EntidadComercialRepository`, enriquecer `toResponseBasico()` con proveedor/conteo/estado OC, enriquecer `toResponseCompleto()` con datos de `DetalleOrdenCompra` |

### Frontend

| Archivo | Cambio |
|---------|--------|
| `purchaseReceiptService.ts` | Mapear `ordenCompraItem`, `proveedor`, `ordenCompraEstado`, `cantidadItems` |
| `purchases.types.ts` | Agregar `cantidadItems`, `guiaRemision`, `esRecepcionCompleta` a `PurchaseReceipt` |
| `PurchaseReceiptList.tsx` | Fallback a `receipt.cantidadItems` para conteo de items |

---

## Verificación DevTools F12 (08/03/2026)

### Network Tab

**`GET /compras/recepciones`** (lista) — Response incluye nuevos campos:

```json
{
  "id": 1,
  "codigo": "REC-00001",
  "ordenCompraCodigo": "OC-00001",
  "cantidadItems": 1,
  "proveedorNombre": "REXTIE S.A.C.",
  "ordenCompraEstado": "COMPLETADA",
  "estado": "CONFIRMADA"
}
```

**`GET /compras/recepciones/1`** (detalle) — Response incluye datos de OC en detalles:

```json
{
  "detalles": [{
    "productoNombre": "Casaca Denim Oversize Premium",
    "cantidadRecibida": 10,
    "cantidadAceptada": 10,
    "cantidadOrdenada": 10,
    "cantidadRecibidaOC": 10,
    "cantidadPendiente": 0
  }]
}
```

### Console

**0 errores, 0 warnings** en toda la sesión E2E.

---

## Checklist E2E Final (Ronda 2 - 08/03/2026)

### Lista de Recepciones
- [x] Muestra conteo real de productos (cantidadItems) ✅ "1 productos"
- [x] REC-00001, REC-00002, REC-00003 todas con "1 productos" ✅
- [x] Estado correcto (Confirmada) ✅
- [x] Link a OC funcional ✅

### Detalle de Recepción
- [x] Proveedor: muestra "REXTIE S.A.C." (antes "N/A") ✅
- [x] Estado de Orden: muestra "COMPLETADA" (antes "N/A") ✅
- [x] Productos en Orden: muestra "1 items" (antes "0 items") ✅
- [x] Ordenada Original: muestra "10" (antes "0") ✅
- [x] En Esta Recepción: muestra "10" ✅
- [x] Pendiente: muestra "0" con color verde ✅
- [x] Mensaje "Recepción completada" visible ✅
- [x] Botón PDF funcional ✅

### Console F12
- [x] 0 errores JavaScript ✅
- [x] 0 warnings ✅
- [x] Todas las peticiones API → 200 ✅

### Nota Kardex (Pre-existente)
- [ ] Kardex no muestra movimientos — **Issue pre-existente, no relacionado con Compras** 📋

---

## Resumen Final

| # | Problema | Causa Raíz | Solución | Estado |
|---|---------|-----------|----------|--------|
| 1 | Lista: "0 productos" | `toResponseBasico` no incluye `detalles` | Agregar `cantidadItems` al DTO | ✅ Resuelto |
| 2 | Detalle: "Ordenada Original: 0" | `DetalleRecepcionResponse` sin datos de OC | Agregar `cantidadOrdenada/RecibidaOC/Pendiente` al DTO detalle | ✅ Resuelto |
| 3 | Kardex: sin movimientos | Issue pre-existente del módulo Inventario | No aplica (documentado) | 📋 Pendiente |
| 4 | Detalle: "Proveedor: N/A" | `RecepcionCompraResponse` sin info proveedor | Agregar `proveedorNombre` al DTO + consultar `EntidadComercial` | ✅ Resuelto |
