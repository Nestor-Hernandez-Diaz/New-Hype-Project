# NewHype ERP - Analisis E2E Completo: Frontend vs Backend vs BD

**Fecha:** 2026-03-03
**Backend:** Spring Boot 4.0.2 | `http://spring.informaticapp.com:5001`
**Frontend:** React/Vite | `http://localhost:5173`
**BD:** MariaDB 10.11.16 | 51 tablas | cPanel shared hosting
**OpenAPI:** 169 endpoints documentados

---

## RESUMEN EJECUTIVO

| Metrica | Valor |
|---------|-------|
| Endpoints backend testeados | 23 |
| Endpoints funcionando (200 OK) | 17 (74%) |
| Endpoints con error (500) | 3 (13%) |
| Endpoints condicionales | 3 (13%) |
| Modulos frontend integrados con RealApi | 6 de 7 |
| Modulos con errores criticos | 3 (Productos parcial, Auditoria, Inventario parcial) |
| Tablas BD vacias criticas | 5 (motivos_movimiento, series_comprobantes, dept/prov/dist) |
| Bugs de path mismatch | 4 |
| Cobertura OpenAPI vs Frontend | ~85% |

### Estado por Modulo

| Modulo | Estado | Problemas |
|--------|--------|-----------|
| Auth (Login/Logout) | FUNCIONAL | - |
| Dashboard | FUNCIONAL | - |
| Usuarios | FUNCIONAL | - |
| Roles | FUNCIONAL | `permisos` es JSON string, no array |
| Entidades Comerciales | FUNCIONAL | Ubigeo vacio (0 dept/prov/dist) |
| Productos | PARCIAL | `getCategorias()` y `getUnidadesMedida()` fallan (path incorrecto) |
| Ventas | FUNCIONAL | `series_comprobantes` vacio (no genera comprobantes SUNAT) |
| Caja | FUNCIONAL | Solo 1 sesion, `movimientos_caja` vacio |
| Compras | FUNCIONAL | 0 ordenes, 0 recepciones (sin data de prueba) |
| Inventario | PARCIAL | Stock sin paginacion server-side; Kardex requiere productoId obligatorio; motivos_movimiento vacio |
| Configuracion | PARCIAL | `/configuracion/unidades` debe ser `/configuracion/unidades-medida` |
| Almacenes | FUNCIONAL | 2 almacenes OK |
| Reportes | FUNCIONAL | Datos reales de 4 ventas |
| Auditoria | NO FUNCIONAL | Endpoints `/audit/*` no existen para scope tenant |

---

## ANALISIS DETALLADO POR MODULO

### 1. AUTH (Login/Logout/JWT)

**Estado:** FUNCIONAL

**Endpoints testeados:**
| Endpoint | Status | Resultado |
|----------|--------|-----------|
| `POST /auth/login` | 200 | JWT + user info correcto |
| `GET /auth/me` | 200 | Retorna datos usuario autenticado |
| `POST /auth/refresh` | 200 | Refresh token funcional |
| `POST /auth/logout` | 200 | Invalida token |

**Credenciales verificadas:**
- Tenant Admin: `admin@newhype-store.pe` / `Admin2026!`
- Superadmin: `superadmin@newhype.pe` / `SuperAdmin2026`

**Fix aplicado esta sesion:** `permissionsResolver.ts` - Backend almacena `permisos: '{"all": true}'` (JSON string de objeto). Se agrego deteccion de `{all: true}` para retornar permisos por defecto del rol.

---

### 2. USUARIOS

**Estado:** FUNCIONAL

**Endpoint:** `GET /usuarios?page=0&size=5`
**Response:** `{ success, data: [...], pagination: { page, size, totalElements, totalPages } }`

**Campos retornados:** `id, username, nombre, apellido, email, rolId, rolNombre, estado, createdAt, updatedAt`

**Mapping RealApi (`usuariosRealApi.ts`):**
| Backend | Frontend |
|---------|----------|
| `username` | `usuario` |
| `nombre + apellido` | `nombreCompleto` |
| `rolNombre` | `codigoRol` (uppercase) |
| `estado` (boolean) | `estadoUsuario` (enum) + `activo` |

**Funciones exportadas (11):** getUsuarios, getUsuarioById, crearUsuario, actualizarUsuario, eliminarUsuario, cambiarEstadoUsuario, verificarUsuario, getRoles, getRolById, crearRol, actualizarRol

**Datos en BD:** 1 usuario (admin), 1 rol (ADMIN)

---

### 3. ROLES

**Estado:** FUNCIONAL (con caveat)

**Endpoint:** `GET /roles`
**Response:** `{ success, data: [{ id, nombre, descripcion, permisos, esSistema, estado, cantidadUsuarios, createdAt }] }`

**Problema:** Campo `permisos` es JSON string `"{"all": true}"`, no un array. El frontend ya maneja esto via `permissionsResolver.ts` que convierte `{all: true}` a array de permisos por defecto.

---

### 4. ENTIDADES COMERCIALES (Clientes/Proveedores)

**Estado:** FUNCIONAL (parcialmente limitado por ubigeo vacio)

**Endpoint:** `GET /entidades?page=0&size=5`
**Response:** `{ success, data: [...], pagination: { page, size, totalElements, totalPages } }`

**Campos retornados:** `id, tipoEntidad, tipoDocumento, numeroDocumento, nombres, apellidos, razonSocial, email, telefono, direccion, departamentoId, provinciaId, distritoId, estado, createdAt, updatedAt`

**Mapping RealApi (`entidadesRealApi.ts`):**
| Backend | Frontend |
|---------|----------|
| `tipoEntidad` | `tipoEntidad` (enum) |
| `departamentoId, provinciaId, distritoId` | `ubigeo: { departamentoId, ... }` (string) |
| `estado` (boolean) | `activo` + `estadoEntidad` (enum) |

**Datos en BD:** 2 entidades comerciales

**Limitacion:** Tablas `departamentos`, `provincias`, `distritos` estan vacias (0 rows). Los selectores de ubigeo no mostraran opciones.

#### Integracion Decolecta API (propuesta)

**API:** `https://api.decolecta.com/v1`
**Token:** `sk_11921.d1eDVFhVjzPbKpCER8962acbLfgrmgYJ`
**Auth:** `Authorization: Bearer <TOKEN>`

**Endpoints disponibles:**

| Endpoint | Uso | Campos retornados |
|----------|-----|-------------------|
| `GET /sunat/ruc?numero=<RUC>` | Buscar empresa por RUC | `razon_social, estado, condicion, direccion, ubigeo, es_agente_retencion` |
| `GET /sunat/ruc/full?numero=<RUC>` | RUC detallado | + `actividad_economica, tipo_facturacion, numero_trabajadores` |
| `GET /reniec/dni?numero=<DNI>` | Buscar persona por DNI | `first_name, first_last_name, second_last_name, full_name, document_number` |
| `GET /tipo-cambio/sunat?date=YYYY-MM-DD` | Tipo cambio SBS | `buy_price, sell_price, base_currency(USD), quote_currency(PEN)` |

**Integracion propuesta:** Agregar un servicio `decolectaApi.ts` en `frontend/src/services/` que:
1. Al crear/editar entidad, si `tipoDocumento === 'RUC'`, auto-buscar via `/sunat/ruc`
2. Si `tipoDocumento === 'DNI'`, auto-buscar via `/reniec/dni`
3. Pre-llenar campos: `razonSocial`, `nombres`, `apellidos`, `direccion`
4. Opcion en UI: boton "Buscar SUNAT/RENIEC" junto al campo `numeroDocumento`

**Implementacion sugerida:**
```typescript
// frontend/src/services/decolectaApi.ts
const DECOLECTA_BASE = 'https://api.decolecta.com/v1';
const DECOLECTA_TOKEN = 'sk_11921.d1eDVFhVjzPbKpCER8962acbLfgrmgYJ';

export async function buscarRUC(ruc: string) {
  const res = await fetch(`${DECOLECTA_BASE}/sunat/ruc?numero=${ruc}`, {
    headers: { 'Authorization': `Bearer ${DECOLECTA_TOKEN}` }
  });
  return res.json();
}

export async function buscarDNI(dni: string) {
  const res = await fetch(`${DECOLECTA_BASE}/reniec/dni?numero=${dni}`, {
    headers: { 'Authorization': `Bearer ${DECOLECTA_TOKEN}` }
  });
  return res.json();
}
```

---

### 5. PRODUCTOS

**Estado:** PARCIAL - CRUD funciona, pero getCategorias y getUnidadesMedida fallan

**Endpoint principal:** `GET /productos?page=0&size=5`
**Status:** 200 OK | 11 productos, 3 paginas

**Campos retornados:** `id, sku, nombre, slug, descripcion, categoriaId, categoriaNombre, precioCosto, precioVenta, stockMinimo, controlaInventario, enLiquidacion, porcentajeLiquidacion, estado, createdAt, updatedAt`

**Mapping RealApi (`productosRealApi.ts`):**
| Backend | Frontend |
|---------|----------|
| `sku` | `codigoProducto` |
| `nombre` | `nombreProducto` |
| `estado` (boolean) | `estadoProducto` (enum) + `activo` |
| `categoriaNombre` | `categoria.nombreCategoria` |
| Calcula `(precioVenta - precioCosto) / precioCosto * 100` | `margen` |

#### BUG CRITICO #1: Path Categorias

**Archivo:** `productosRealApi.ts:382`
**Codigo:** `apiService.get('/categorias')`
**Backend real:** `/configuracion/categorias`
**Error:** `500 - No static resource api/v1/categorias`

**Fix:** Cambiar `/categorias` a `/configuracion/categorias`

#### BUG CRITICO #2: Path Unidades Medida

**Archivo:** `productosRealApi.ts:396`
**Codigo:** `apiService.get('/unidades-medida')`
**Backend real:** `/configuracion/unidades-medida`
**Error:** `500 - No static resource api/v1/unidades-medida`

**Fix:** Cambiar `/unidades-medida` a `/configuracion/unidades-medida`

#### BUG #3: Path Unidades en configuracionApi

**Archivo:** `configuracionApi.ts:165`
**Codigo:** `apiService.get('/configuracion/unidades')`
**Backend real:** `/configuracion/unidades-medida`
**Error:** `500 - No static resource api/v1/configuracion/unidades`

**Fix:** Cambiar `/configuracion/unidades` a `/configuracion/unidades-medida` (en todas las ocurrencias: lineas 165, 175, 179, 185, 189, 193)

---

### 6. VENTAS

**Estado:** FUNCIONAL

**Endpoint:** `GET /ventas?page=0&size=5`
**Status:** 200 OK | 4 ventas

**Campos retornados:** `id, codigoVenta, sesionCajaId, clienteId, clienteNombre, almacenId, almacenNombre, usuarioId, fechaEmision, tipoComprobante, serie, subtotal, igv, descuento, total, montoRecibido, montoCambio, estado, fechaPago, observaciones, createdAt`

**Mapping RealApi (`ventasRealApi.ts`):**
| Backend | Frontend |
|---------|----------|
| `sesionCajaId` | `cashSessionId` |
| `detalles[]` | `items: ItemVenta[]` |
| `pagos[]` | `payments: PagoVenta[]` |

**Funciones exportadas (19):** getCajasRegistradoras, getSesionesCaja, getSesionCajaById, abrirSesionCaja, cerrarSesionCaja, getMovimientosCaja, getResumenCaja, crearMovimientoCaja, eliminarMovimientoCaja, getVentas, getVentaById, crearVenta, confirmarPagoVenta, completarVenta, cancelarVenta, crearNotaCredito, getNotasCreditoBySale, getCotizaciones, crearCotizacion

**Limitacion:** `series_comprobantes` tabla vacia (0 rows). No se pueden generar comprobantes SUNAT (facturas, boletas). Se necesita seed data.

---

### 7. CAJA (Sesiones + Movimientos)

**Estado:** FUNCIONAL

**Endpoints:**
| Endpoint | Status | Datos |
|----------|--------|-------|
| `GET /caja/sesiones` | 200 | 1 sesion (ABIERTA) |
| `GET /configuracion/cajas-registradoras` | 200 | 1 caja registradora |

**Campos sesion:** `id, cajaRegistradoraId, usuarioId, fechaApertura, fechaCierre, montoApertura, montoCierre, totalVentas, diferencia, estado, observaciones, movimientos, createdAt`

---

### 8. COMPRAS (Ordenes + Recepciones)

**Estado:** FUNCIONAL (sin datos de prueba)

**Endpoints:**
| Endpoint | Status | Datos |
|----------|--------|-------|
| `GET /compras/ordenes?page=0&size=5` | 200 | 0 ordenes |
| `GET /compras/recepciones?page=0&size=5` | 200 | 0 recepciones |

**Mapping RealApi (`comprasRealApi.ts`):**
| Backend | Frontend |
|---------|----------|
| `proveedorId` | `proveedorId` (string) |
| `almacenDestinoId` | `almacenDestinoId` |
| `usuario.id` | `solicitadoPorId` |
| `fechaEmision` | `fecha` |
| `fechaEntregaEstimada` | `fechaEntregaEsperada` |

**Nota:** Recepciones no soportan UPDATE/DELETE en backend. Solo CONFIRMADA via `/confirmar`.

---

### 9. INVENTARIO

**Estado:** PARCIAL - Stock funciona pero sin paginacion; Kardex requiere productoId; Ajustes necesitan motivos

#### Problema #1: Stock sin paginacion server-side

**Endpoint:** `GET /inventario/stock`
**Response:** `{ success, data: [...] }` - Sin objeto `pagination`
**Impacto:** `inventoryRealApi.ts` aplica paginacion client-side (filtra/ordena/pagina en memoria). Funciona para datasets pequenos pero no escala.
**Datos:** 6 items de stock

#### Problema #2: Kardex requiere productoId obligatorio

**Endpoint:** `GET /inventario/kardex`
**Sin productoId:** `500 - Required request parameter 'productoId' not present`
**Con productoId:** `200 OK - { success, data: { movimientos: [], pagination: {...} } }`
**Impacto:** Frontend puede enviar kardex sin productoId (listado general), backend rechaza.
**Estructura:** Respuesta anidada `data.movimientos` + `data.pagination` (no estandar vs otros endpoints que usan `data[]` + `pagination`)

#### Problema #3: Motivos de movimiento vacios

**Tabla `motivos_movimiento`:** 0 rows
**Impacto:** `AjusteInventarioRequest.reasonId` no tiene opciones validas. Los ajustes de inventario fallaran si el backend valida FK.

**Endpoints inventario:**
| Endpoint | Status | Notas |
|----------|--------|-------|
| `GET /inventario/stock` | 200 | Sin paginacion |
| `GET /inventario/kardex?productoId=X` | 200 | productoId obligatorio |
| `GET /inventario/alertas` | 200 | 0 alertas |
| `POST /inventario/ajustes` | No testeado | Requiere reasonId (motivos vacios) |

---

### 10. CONFIGURACION

**Estado:** PARCIAL - Empresa y series OK, unidades con path incorrecto

**Endpoints:**
| Endpoint | Status | Datos |
|----------|--------|-------|
| `GET /configuracion/empresa` | 200 | 1 config completa |
| `GET /configuracion/series-comprobantes` | 200 | 0 series (vacio) |
| `GET /configuracion/metodos-pago` | 200 | 1 metodo (Efectivo) |
| `GET /configuracion/categorias` | 200 | 5 categorias |
| `GET /configuracion/motivos-movimiento` | 200 | 0 motivos (vacio) |

**Bug path unidades:** Ver seccion Productos, Bug #3.

---

### 11. ALMACENES

**Estado:** FUNCIONAL

**Endpoint:** `GET /almacenes`
**Status:** 200 OK | 2 almacenes

**Campos:** `id, codigo, nombre, ubicacion, capacidad, estado, createdAt, updatedAt`

---

### 12. REPORTES

**Estado:** FUNCIONAL

**Endpoint:** `GET /reportes/ventas`
**Status:** 200 OK

**Response:** `{ totalVentas, montoTotal, montoIgv, montoDescuentos, ticketPromedio, ventasPorDia[], ventasPorTipo[] }`

---

### 13. UBIGEO

**Estado:** FUNCIONAL (sin datos)

**Endpoint:** `GET /ubigeo/departamentos`
**Status:** 200 OK | 0 departamentos

**Impacto:** Los selectores de departamento/provincia/distrito estaran vacios en toda la aplicacion (entidades, configuracion empresa).

---

### 14. AUDITORIA

**Estado:** NO FUNCIONAL

#### BUG CRITICO #4: Endpoints de auditoria no existen

**Archivo:** `auditoriaApi.ts`
**Endpoints que llama:**
- `GET /audit/logs` --> **NO EXISTE**
- `GET /audit/user-activity/{userId}` --> **NO EXISTE**
- `GET /audit/my-activity` --> **NO EXISTE**
- `GET /audit/system-events` --> **NO EXISTE**

**Backend real:** Solo existe `GET /platform/auditoria` que requiere scope `platform` (superadmin). Los usuarios tenant NO tienen acceso a auditoria.

**Opciones de solucion:**
1. **Backend:** Crear `AuditoriaController` con endpoints `/auditoria/logs`, `/auditoria/actividad-usuario`, etc. para scope tenant
2. **Frontend:** Desactivar modulo auditoria o mostrar mensaje "Funcionalidad no disponible"

---

## TABLA DE PROBLEMAS Y SOLUCIONES

| # | Severidad | Modulo | Problema | Archivo | Linea | Solucion |
|---|-----------|--------|----------|---------|-------|----------|
| 1 | CRITICO | Productos | Path `/categorias` no existe | `productosRealApi.ts` | 382 | Cambiar a `/configuracion/categorias` |
| 2 | CRITICO | Productos | Path `/unidades-medida` no existe | `productosRealApi.ts` | 396 | Cambiar a `/configuracion/unidades-medida` |
| 3 | CRITICO | Configuracion | Path `/configuracion/unidades` no existe | `configuracionApi.ts` | 165,175,179,185,189,193 | Cambiar a `/configuracion/unidades-medida` |
| 4 | CRITICO | Auditoria | Endpoints `/audit/*` no existen para tenant | `auditoriaApi.ts` | 78,91,103,115 | Crear controller backend o desactivar modulo |
| 5 | ALTO | Inventario | Kardex requiere `productoId` obligatorio | `inventoryRealApi.ts` | N/A | Backend: hacer productoId opcional; o Frontend: validar antes de llamar |
| 6 | ALTO | Inventario | Stock sin paginacion server-side | Backend | N/A | Backend: agregar paginacion a `/inventario/stock` |
| 7 | ALTO | Inventario | Motivos movimiento vacios (0 rows) | BD | N/A | Ejecutar SQL seed (ver abajo) |
| 8 | ALTO | Ventas | Series comprobantes vacias (0 rows) | BD | N/A | Ejecutar SQL seed (ver abajo) |
| 9 | MEDIO | Ubigeo | Dept/Prov/Dist vacios (0 rows) | BD | N/A | Ejecutar SQL seed con data Peru |
| 10 | MEDIO | Roles | `permisos` es JSON string `{"all":true}` | Backend | N/A | Ya manejado por `permissionsResolver.ts` |
| 11 | BAJO | Compras | 0 ordenes de prueba | BD | N/A | Crear data de prueba |
| 12 | BAJO | Caja | Solo 1 sesion | BD | N/A | Normal para sistema nuevo |

---

## SQL SUGERIDO (NO EJECUTAR - Solo referencia)

### Seed: Motivos de Movimiento

```sql
-- Motivos de movimiento de inventario
INSERT INTO motivos_movimiento (tenant_id, nombre, tipo, descripcion, estado, created_at, updated_at)
VALUES
  (1, 'Ajuste por inventario fisico', 'AJUSTE_INGRESO', 'Ajuste positivo por conteo fisico', true, NOW(), NOW()),
  (1, 'Ajuste por merma', 'AJUSTE_EGRESO', 'Ajuste negativo por merma o deterioro', true, NOW(), NOW()),
  (1, 'Ingreso por compra', 'ENTRADA', 'Ingreso de mercaderia por orden de compra', true, NOW(), NOW()),
  (1, 'Salida por venta', 'SALIDA', 'Salida de mercaderia por venta realizada', true, NOW(), NOW()),
  (1, 'Transferencia entrada', 'ENTRADA', 'Recepcion de transferencia entre almacenes', true, NOW(), NOW()),
  (1, 'Transferencia salida', 'SALIDA', 'Envio de transferencia entre almacenes', true, NOW(), NOW()),
  (1, 'Devolucion cliente', 'ENTRADA', 'Ingreso por devolucion de cliente', true, NOW(), NOW()),
  (1, 'Devolucion proveedor', 'SALIDA', 'Salida por devolucion a proveedor', true, NOW(), NOW());
```

### Seed: Series de Comprobantes

```sql
-- Series de comprobantes SUNAT
INSERT INTO series_comprobantes (tenant_id, tipo_comprobante, serie, numero_actual, numero_inicio, numero_fin, estado, created_at, updated_at)
VALUES
  (1, 'BOLETA', 'B001', 1, 1, 99999999, true, NOW(), NOW()),
  (1, 'FACTURA', 'F001', 1, 1, 99999999, true, NOW(), NOW()),
  (1, 'NOTA_CREDITO', 'BC01', 1, 1, 99999999, true, NOW(), NOW()),
  (1, 'NOTA_DEBITO', 'BD01', 1, 1, 99999999, true, NOW(), NOW());
```

### Seed: Ubigeo (ejemplo minimo - Lima)

```sql
-- Departamentos (minimo para funcionalidad)
INSERT INTO departamentos (id, nombre, codigo, created_at, updated_at)
VALUES
  (1, 'Lima', '15', NOW(), NOW()),
  (2, 'Arequipa', '04', NOW(), NOW()),
  (3, 'Cusco', '08', NOW(), NOW());

-- Provincias (Lima)
INSERT INTO provincias (id, departamento_id, nombre, codigo, created_at, updated_at)
VALUES
  (1, 1, 'Lima', '1501', NOW(), NOW()),
  (2, 1, 'Callao', '1502', NOW(), NOW());

-- Distritos (Lima Metropolitana - ejemplo)
INSERT INTO distritos (id, provincia_id, nombre, codigo, created_at, updated_at)
VALUES
  (1, 1, 'Lima', '150101', NOW(), NOW()),
  (2, 1, 'Miraflores', '150122', NOW(), NOW()),
  (3, 1, 'San Isidro', '150131', NOW(), NOW()),
  (4, 1, 'Surco', '150140', NOW(), NOW()),
  (5, 1, 'San Borja', '150130', NOW(), NOW());
```

**NOTA:** El seed completo de ubigeo de Peru tiene 25 departamentos, 196 provincias, 1874 distritos. Se puede obtener de INEI o APIs publicas.

---

## COBERTURA FRONTEND vs BACKEND

### Contextos usando RealApi (COMPLETADO)

| Modulo | Contexto | Import | Estado |
|--------|----------|--------|--------|
| Productos | `ProductContext.tsx` | `productosRealApi` | INTEGRADO |
| Clientes | `ClientContext.tsx` | `entidadesRealApi` | INTEGRADO |
| Inventario | `InventoryContext.tsx` | `inventoryRealApi` | INTEGRADO |
| Ventas | `SalesContext.tsx` | `ventasRealApi` | INTEGRADO |
| Compras | `PurchasesContext.tsx` | `comprasRealApi` | INTEGRADO |
| Usuarios | `UsersContext.tsx` | `usuariosRealApi` | INTEGRADO |
| Configuracion | `configuracionApi.ts` | `apiService` directo | INTEGRADO |

### Funciones RealApi vs Endpoints Backend

| Modulo | Funciones Frontend | Endpoints Backend | Match |
|--------|-------------------|-------------------|-------|
| Productos | 9 funciones | 8 endpoints | 7/9 (categorias y unidades fallan por path) |
| Entidades | 7 funciones | 7 endpoints | 7/7 |
| Inventario | 5 funciones | 5 endpoints | 4/5 (kardex condicional) |
| Ventas | 19 funciones | 19 endpoints | 19/19 |
| Compras | 12 funciones | 10 endpoints | 10/12 (update/delete recepciones no soportado) |
| Usuarios | 11 funciones | 8 endpoints | 8/11 (getRolById local, verificar via search) |
| Configuracion | 18 funciones | 16 endpoints | 12/18 (unidades path incorrecto) |
| Auditoria | 4 funciones | 0 endpoints | 0/4 |
| **TOTAL** | **85 funciones** | **73 endpoints** | **67/85 (79%)** |

---

## INTEGRACION DECOLECTA API - Plan de Implementacion

### Arquitectura Propuesta

```
frontend/src/services/decolectaApi.ts    (nuevo - servicio API)
frontend/src/hooks/useDecolecta.ts       (nuevo - hook React)
```

### Servicio `decolectaApi.ts`

```typescript
const DECOLECTA_BASE = 'https://api.decolecta.com/v1';
const DECOLECTA_TOKEN = import.meta.env.VITE_DECOLECTA_TOKEN;

interface RUCResponse {
  razon_social: string;
  numero_documento: string;
  estado: string;           // ACTIVO, BAJA, etc
  condicion: string;        // HABIDO, NO HABIDO
  direccion: string;
  ubigeo: string;
  es_agente_retencion: boolean;
  es_buen_contribuyente: boolean;
}

interface DNIResponse {
  first_name: string;
  first_last_name: string;
  second_last_name: string;
  full_name: string;
  document_number: string;
}

export async function buscarPorRUC(ruc: string): Promise<RUCResponse> { ... }
export async function buscarPorDNI(dni: string): Promise<DNIResponse> { ... }
export async function getTipoCambio(date?: string): Promise<{buy_price, sell_price}> { ... }
```

### Integracion en Entidades

**Flujo usuario:**
1. Usuario selecciona `tipoDocumento` (RUC o DNI)
2. Ingresa numero de documento
3. Click boton "Buscar" (o auto-trigger al completar longitud: 11 RUC, 8 DNI)
4. Sistema consulta Decolecta API
5. Auto-llena: `razonSocial` (RUC), `nombres`/`apellidos` (DNI), `direccion`

**Variable de entorno:** `VITE_DECOLECTA_TOKEN=sk_11921.d1eDVFhVjzPbKpCER8962acbLfgrmgYJ`

---

## RESUMEN BD - Tablas Criticas

### Tablas con datos (funcionales)

| Tabla | Rows | Estado |
|-------|------|--------|
| `productos` | 11 | OK |
| `categorias` | 5 | OK |
| `entidades_comerciales` | 2 | OK |
| `ventas` | 4 | OK |
| `detalle_ventas` | 4 | OK |
| `pagos_venta` | 4 | OK |
| `almacenes` | 2 | OK |
| `stock_almacen` | 2 | OK |
| `movimientos_inventario` | 10 | OK |
| `sesiones_caja` | 1 | OK |
| `configuracion_empresa` | 1 | OK |
| `usuarios` | 1 | OK |
| `roles` | 1 | OK |
| `metodos_pago` | 1 | OK |
| `cajas_registradoras` | 1 | OK |

### Tablas vacias (requieren seed)

| Tabla | Rows | Impacto | Prioridad |
|-------|------|---------|-----------|
| `motivos_movimiento` | 0 | Ajustes inventario fallaran | ALTA |
| `series_comprobantes` | 0 | No genera comprobantes SUNAT | ALTA |
| `departamentos` | 0 | Ubigeo vacio | MEDIA |
| `provincias` | 0 | Ubigeo vacio | MEDIA |
| `distritos` | 0 | Ubigeo vacio | MEDIA |
| `ordenes_compra` | 0 | Sin data de prueba compras | BAJA |
| `detalle_ordenes_compra` | 0 | Sin data de prueba compras | BAJA |
| `recepciones_compra` | 0 | Sin data de prueba | BAJA |
| `movimientos_caja` | 0 | Normal - no hay movimientos aun | BAJA |

---

                                                                                                                                                                                                                                                                            ## PLAN DE ACCION - Priorizado

                                                                                                                                                                                                                                                                            ### Prioridad CRITICA (fixes inmediatos en frontend)

                                                                                                                                                                                                                                                                            1. **Fix path categorias** - `productosRealApi.ts:382` cambiar `/categorias` a `/configuracion/categorias`
                                                                                                                                                                                                                                                                            2. **Fix path unidades medida** - `productosRealApi.ts:396` cambiar `/unidades-medida` a `/configuracion/unidades-medida`
                                                                                                                                                                                                                                                                            3. **Fix path unidades en config** - `configuracionApi.ts` cambiar `/configuracion/unidades` a `/configuracion/unidades-medida` (6 ocurrencias)

                                                                                                                                                                                                                                                                            ### Prioridad ALTA (seed BD)

                                                                                                                                                                                                                                                                            4. **Seed motivos_movimiento** - 8 registros (ver SQL arriba)
                                                                                                                                                                                                                                                                            5. **Seed series_comprobantes** - 4 registros BOLETA/FACTURA/NC/ND

                                                                                                                                                                                                                                                                            ### Prioridad MEDIA

                                                                                                                                                                                                                                                                            6. **Seed ubigeo** - Minimo 3 departamentos + provincias + distritos
                                                                                                                                                                                                                                                                            7. **Auditoria** - Decidir: crear endpoints backend para tenant o desactivar modulo
                                                                                                                                                                                                                                                                            8. **Inventario kardex** - Frontend: agregar validacion de productoId antes de llamar endpoint

                                                                                                                                                                                                                                                                            ### Prioridad BAJA

                                                                                                                                                                                                                                                                            9. **Crear servicio decolecta** - Para auto-llenado RUC/DNI
                                                                                                                                                                                                                                                                            10. **Data de prueba compras** - Crear ordenes de compra para demos
                                                                                                                                                                                                                                                                            11. **Stock paginacion** - Backend: agregar paginacion server-side

                                                                                                                                                                                                                                                                            ---

                                                                                                                                                                                                                                                                            ## NOTAS TECNICAS

                                                                                                                                                                                                                                                                            ### Infraestructura

                                                                                                                                                                                                                                                                            - **Backend:** Daemonizado con `nohup`, auto-restart via `@reboot` crontab
                                                                                                                                                                                                                                                                            - **Puerto:** 5001 (HTTP directo, no HTTPS via Apache - shared hosting no soporta proxy)
                                                                                                                                                                                                                                                                            - **CORS:** Configurado en Spring Boot, permite `localhost:5173`
                                                                                                                                                                                                                                                                            - **Frontend .env.development:** `VITE_API_URL=http://spring.informaticapp.com:5001/New-Hype-Project/api/v1`

                                                                                                                                                                                                                                                                            ### Paginacion Backend vs Frontend

                                                                                                                                                                                                                                                                            | Backend | Frontend |
                                                                                                                                                                                                                                                                            |---------|----------|
                                                                                                                                                                                                                                                                            | `page` (0-based) | `pagina` (1-based) |
                                                                                                                                                                                                                                                                            | `size` | `tamano/limit` |
                                                                                                                                                                                                                                                                            | `totalElements` | `total` |
                                                                                                                                                                                                                                                                            | `totalPages` | `totalPaginas/pages` |

                                                                                                                                                                                                                                                                            Los archivos RealApi manejan la conversion `frontend_page - 1 = backend_page` correctamente.

                                                                                                                                                                                                                                                                            ### Response wrapper estandar

                                                                                                                                                                                                                                                                            ```json
                                                                                                                                                                                                                                                                            {
                                                                                                                                                                                                                                                                              "success": true,
                                                                                                                                                                                                                                                                              "data": [...],
                                                                                                                                                                                                                                                                              "pagination": {
                                                                                                                                                                                                                                                                                "page": 0,
                                                                                                                                                                                                                                                                                "size": 10,
                                                                                                                                                                                                                                                                                "totalElements": 50,
                                                                                                                                                                                                                                                                                "totalPages": 5
                                                                                                                                                                                                                                                                              },
                                                                                                                                                                                                                                                                              "message": "opcional"
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                            ```
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          