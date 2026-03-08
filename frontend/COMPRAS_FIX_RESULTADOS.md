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

## Resumen

| Problema | Estado Antes | Estado Después |
|----------|-------------|----------------|
| Crear Recepción | Error 500 (código duplicado + NPE) | Funcional (código único por tenant) |
| PDF Recepciones | `downloadPDF is not a function` | Descarga HTML con detalle completo |
| PDF Órdenes | Funcional (sin cambios) | Sin cambios |
