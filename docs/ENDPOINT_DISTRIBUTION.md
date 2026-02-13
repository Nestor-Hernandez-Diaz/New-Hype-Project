# DISTRIBUCIÓN COMPLETA DE ENDPOINTS REST

**Proyecto:** New Hype Project - ERP SaaS Multi-Tenant
**Stack Backend:** Spring Boot 3.2 / Java 17 / Spring Data JPA / MySQL 8.0
**Schema:** 49 tablas (newhype_dev en XAMPP)
**Fuente:** REQUERIMIENTOS_FUNCIONALES_ORDENADOS.md v3.0 (111 RFs)
**Fecha:** 2026-02-12

---

## CONVENCIONES GLOBALES

### Prefijos de URL por nivel de acceso

| Nivel | Prefijo | JWT Scope | Tabla de usuarios |
|-------|---------|-----------|-------------------|
| Tenant (Admin/Cajero) | `/api/v1/` | `tenant` | `usuarios` |
| Plataforma (Superadmin) | `/api/v1/platform/` | `platform:admin` | `usuarios_plataforma` |
| B2C (Cliente final) | `/api/v1/storefront/` | `customer` | `clientes_tienda` |

### Multi-tenant

- **tenant_id** se extrae del JWT del usuario autenticado (nunca del path ni query param)
- Todas las queries de nivel Tenant filtran por `WHERE tenant_id = :tenantId`
- Nivel Plataforma no tiene tenant_id (accede cross-tenant)
- Nivel Storefront resuelve tenant por subdominio del request

### Formato de respuesta estándar

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... },
  "pagination": {
    "page": 1,
    "size": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

### Patrones de endpoints

| Operación | Método | Patrón | Ejemplo |
|-----------|--------|--------|---------|
| Listar (paginado + filtros) | GET | `/recurso` | `GET /api/v1/productos?page=0&size=20&categoria=1` |
| Detalle | GET | `/recurso/{id}` | `GET /api/v1/productos/15` |
| Crear | POST | `/recurso` | `POST /api/v1/productos` |
| Actualizar completo | PUT | `/recurso/{id}` | `PUT /api/v1/productos/15` |
| Acción parcial | PATCH | `/recurso/{id}/accion` | `PATCH /api/v1/productos/15/estado` |
| Eliminar (soft delete) | DELETE | `/recurso/{id}` | `DELETE /api/v1/productos/15` |
| Acción de negocio | POST | `/recurso/{id}/accion` | `POST /api/v1/ventas/8/confirmar-pago` |
| Sub-recurso | GET/POST | `/recurso/{id}/sub` | `GET /api/v1/productos/15/imagenes` |

---

## TABLA RESUMEN POR MÓDULO

| # | Módulo (Bounded Context) | Código | Fase | Endpoints | RFs Cubiertos | Notas |
|---|--------------------------|--------|------|-----------|---------------|-------|
| 1 | Autenticación | AUT | 1 | 8 | RF-AUT-001→008 | 3 niveles de login (tenant, platform, storefront) |
| 2 | Productos | PRD | 1 | 11 | RF-PRD-001→006, 011, 012 | Incluye galería de imágenes |
| 3 | Catálogos Maestros | CFG-B | 1 | 28 | RF-CFG-005 | 7 catálogos × 4 CRUD (patrón idéntico) |
| 4 | Inventario | INV | 1+3 | 10 | RF-INV-001→010 | Fase 1: stock/kardex/alertas. Fase 3: ajustes/transferencias |
| 5 | Entidades Comerciales | ENT | 2 | 7 | RF-ENT-001→010 | Clientes y Proveedores unificados (tipo_entidad) |
| 6 | Ventas y POS | VNT | 2 | 15 | RF-VNT-001→009 | Incluye notas de crédito + sesiones de caja |
| 7 | Compras | COM | 3 | 12 | RF-COM-001→009 | Órdenes + recepciones (parcial/completa) |
| 8 | Usuarios y Roles | USR | 4 | 10 | RF-USR-001→010 | RBAC con permisos JSON |
| 9 | Configuración General | CFG-A | 4 | 26 | RF-CFG-001→004, 006, 007 | Empresa + series + métodos + política + almacenes + motivos + cajas + ubigeo |
| 10 | Superadmin | SUP | 5 | 13 | RF-SUP-001→010 | Gestión de tenants + tickets + auditoría global |
| 11 | Suscripciones | SUB | 5 | 12 | RF-SUB-001→010 | Planes + pagos + cupones |
| 12 | Reportes | REP | 6 | 7 | RF-REP-001→007 | Todos GET con filtros de fecha |
| 13 | Cliente / Storefront | CLI | 7 | 10 | RF-CLI-001→013 | Catálogo público + pedidos + perfil |
| | **TOTAL** | | **1-7** | **169** | **111 RFs** | |

> **Nota sobre Catálogos (28 endpoints):** Los 7 catálogos maestros (categorías, tallas, colores, marcas, materiales, géneros, unidades de medida) siguen un patrón CRUD idéntico. En Spring Boot se implementan con un `AbstractCatalogController<T>` genérico y 7 subclases delgadas. El esfuerzo real de codificación equivale a ~4 endpoints únicos.

---

## DETALLE POR FASE

---

### FASE 1: Fundación (Auth + Productos + Catálogos + Stock básico)

**Objetivo:** Login funcional, CRUD de productos con todos sus catálogos para dropdowns, consulta de stock.
**Endpoints:** 50 | **Justificación:** Los catálogos son prerequisito para crear productos. Sin catálogos poblados, Postman no puede probar productos.

---

#### 1.1 Autenticación (AUT) — 8 endpoints

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 1 | POST | `/api/v1/auth/login` | RF-AUT-001 | Login usuario tenant → JWT (access + refresh) | usuarios |
| 2 | POST | `/api/v1/auth/logout` | RF-AUT-002 | Invalidar token actual | — |
| 3 | POST | `/api/v1/auth/logout-all` | RF-AUT-003 | Invalidar todos los tokens del usuario | — |
| 4 | POST | `/api/v1/auth/refresh` | RF-AUT-004 | Renovar access token con refresh token | — |
| 5 | GET | `/api/v1/auth/check-email` | RF-AUT-005 | Verificar si email ya existe (?email=x) | usuarios |
| 6 | GET | `/api/v1/auth/me` | RF-AUT-006 | Info del usuario autenticado + permisos | usuarios, roles |
| 7 | POST | `/api/v1/platform/auth/login` | RF-AUT-007 | Login superadmin → JWT scope platform | usuarios_plataforma |
| 8 | POST | `/api/v1/storefront/auth/login` | RF-AUT-008 | Login cliente B2C → JWT scope customer | clientes_tienda |

**Notas:**
- JWT con claims: `sub` (userId), `tenantId`, `scope` (tenant|platform:admin|customer), `role`, `permissions[]`
- Access token: 15 min. Refresh token: 7 días.
- RF-AUT-007 soporta 2FA opcional (`tiene_2fa`, `secreto_2fa` en `usuarios_plataforma`)

---

#### 1.2 Productos (PRD) — 11 endpoints

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 9 | POST | `/api/v1/productos` | RF-PRD-001 | Crear producto (SKU único, validar precios > 0) | productos |
| 10 | GET | `/api/v1/productos` | RF-PRD-002 | Listar con filtros: categoría, talla, color, marca, género, estado, búsqueda | productos + JOINs |
| 11 | GET | `/api/v1/productos/{id}` | RF-PRD-003 | Detalle con stock por almacén | productos, stock_almacen |
| 12 | PUT | `/api/v1/productos/{id}` | RF-PRD-004 | Actualizar (no puede cambiar SKU) | productos |
| 13 | PATCH | `/api/v1/productos/{id}/estado` | RF-PRD-005 | Activar / desactivar | productos |
| 14 | DELETE | `/api/v1/productos/{id}` | RF-PRD-006 | Soft delete (validar sin stock ni ventas) | productos |
| 15 | GET | `/api/v1/productos/buscar` | RF-PRD-011 | Buscar por código barras o SKU (?q=xxx) | productos |
| 16 | POST | `/api/v1/productos/liquidacion` | RF-PRD-012 | Marcar batch para liquidación (body: ids[], porcentaje, fechas) | productos |
| 17 | POST | `/api/v1/productos/{id}/imagenes` | — | Subir imagen a galería (multipart) | imagenes_producto |
| 18 | GET | `/api/v1/productos/{id}/imagenes` | — | Listar imágenes del producto | imagenes_producto |
| 19 | DELETE | `/api/v1/productos/{id}/imagenes/{imgId}` | — | Eliminar imagen | imagenes_producto |

**Notas:**
- GET lista soporta: `?page=0&size=20&sort=nombre,asc&categoriaId=5&tallaId=2&colorId=3&marcaId=1&generoId=1&estado=1&q=polo`
- Endpoint #15 (buscar) es autocomplete rápido por código de barras EAN-13 o SKU exacto
- Endpoint #16 (liquidación) recibe array de IDs y aplica porcentaje + fechas a todos

---

#### 1.3 Catálogos Maestros (CFG-B) — 28 endpoints (7 catálogos × 4 CRUD)

**Patrón único para los 7 catálogos** (RF-CFG-005):

| # | Método | Path Pattern | Descripción |
|---|--------|-------------|-------------|
| — | GET | `/api/v1/configuracion/{catalogo}` | Listar (paginado o completo para dropdowns) |
| — | POST | `/api/v1/configuracion/{catalogo}` | Crear nuevo elemento |
| — | PUT | `/api/v1/configuracion/{catalogo}/{id}` | Actualizar elemento |
| — | DELETE | `/api/v1/configuracion/{catalogo}/{id}` | Desactivar (validar que no esté en uso) |

**Catálogos (reemplace `{catalogo}`):**

| # | Recurso | Ruta concreta | Tabla | Campos clave |
|---|---------|---------------|-------|--------------|
| 1 | Categorías | `/api/v1/configuracion/categorias` | categorias | codigo, nombre, slug |
| 2 | Tallas | `/api/v1/configuracion/tallas` | tallas | codigo, descripcion, orden_visualizacion |
| 3 | Colores | `/api/v1/configuracion/colores` | colores | codigo, nombre, codigo_hex |
| 4 | Marcas | `/api/v1/configuracion/marcas` | marcas | codigo, nombre, logo_url |
| 5 | Materiales | `/api/v1/configuracion/materiales` | materiales | codigo, descripcion |
| 6 | Géneros | `/api/v1/configuracion/generos` | generos | codigo, descripcion |
| 7 | Unidades de medida | `/api/v1/configuracion/unidades-medida` | unidades_medida | codigo, nombre, simbolo |

**Conteo:** 7 × 4 = **28 endpoints**

**Notas:**
- GET sin paginación (`?all=true`) para poblar dropdowns del frontend
- GET con paginación para pantalla de administración de catálogos
- DELETE valida que ningún producto use el elemento antes de desactivar
- Categorías incluye campo `slug` para futuras URLs B2C

---

#### 1.4 Inventario — Stock básico (INV parcial) — 3 endpoints

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 48 | GET | `/api/v1/inventario/stock` | RF-INV-001 | Stock por almacén (?almacenId=x&productoId=y&tallaId=z&colorId=w) | stock_almacen + JOINs |
| 49 | GET | `/api/v1/inventario/kardex` | RF-INV-002 | Historial movimientos (?productoId=x&almacenId=y&tipo=ENTRADA&fechaDesde=&fechaHasta=) | movimientos_inventario |
| 50 | GET | `/api/v1/inventario/alertas` | RF-INV-003 | Productos con stock < stock_mínimo (?almacenId=x) | stock_almacen, productos |

---

**RESUMEN FASE 1:** 8 (AUT) + 11 (PRD) + 28 (Catálogos) + 3 (INV parcial) = **50 endpoints**

---

### FASE 2: Flujo de Ventas (Entidades + Ventas/POS)

**Objetivo:** Completar el ciclo de venta: seleccionar cliente → crear venta → confirmar pago → emitir comprobante. Incluye caja y notas de crédito.
**Endpoints:** 22

---

#### 2.1 Entidades Comerciales (ENT) — 7 endpoints

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 51 | POST | `/api/v1/entidades` | RF-ENT-001, 008 | Crear cliente o proveedor (tipo_entidad en body) | entidades_comerciales |
| 52 | GET | `/api/v1/entidades` | RF-ENT-002, 009 | Listar (?tipoEntidad=CLIENTE&q=nombre&page=0) | entidades_comerciales |
| 53 | GET | `/api/v1/entidades/{id}` | RF-ENT-004 | Detalle con historial de compras | entidades_comerciales |
| 54 | PUT | `/api/v1/entidades/{id}` | RF-ENT-003, 010 | Actualizar (no puede cambiar tipo_documento ni numero_documento) | entidades_comerciales |
| 55 | GET | `/api/v1/entidades/buscar-documento` | RF-ENT-005 | Buscar por documento exacto (?tipo=DNI&numero=12345678) | entidades_comerciales |
| 56 | GET | `/api/v1/entidades/buscar-email` | RF-ENT-006 | Buscar por email exacto (?email=x@y.com) | entidades_comerciales |
| 57 | GET | `/api/v1/entidades/estadisticas` | RF-ENT-007 | Totales por tipo, activos, registrados este mes | entidades_comerciales |

**Notas:**
- Clientes (DNI/RUC) y Proveedores (RUC obligatorio) comparten tabla `entidades_comerciales`
- tipo_entidad ENUM: CLIENTE, PROVEEDOR, AMBOS
- Validación formato: DNI = 8 dígitos, RUC = 11 dígitos, CE = 9-12 caracteres

---

#### 2.2 Ventas y POS (VNT) — 15 endpoints

**Ventas:**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 58 | POST | `/api/v1/ventas` | RF-VNT-001 | Crear venta (estado PENDIENTE, no descuenta stock) | ventas, detalle_ventas |
| 59 | GET | `/api/v1/ventas` | RF-VNT-002 | Listar (?estado=COMPLETADA&fechaDesde=&clienteId=&page=0) | ventas |
| 60 | GET | `/api/v1/ventas/{id}` | RF-VNT-003 | Detalle con productos, pagos, cliente | ventas + JOINs |
| 61 | PATCH | `/api/v1/ventas/{id}/estado` | RF-VNT-004 | Cambiar estado (validar transiciones válidas) | ventas |
| 62 | POST | `/api/v1/ventas/{id}/confirmar-pago` | RF-VNT-005 | Confirmar pago → COMPLETADA + descuenta stock + registra kardex | ventas, pagos_venta, stock_almacen, movimientos_inventario |
| 63 | DELETE | `/api/v1/ventas/{id}` | RF-VNT-006 | Eliminar venta PENDIENTE | ventas |
| 64 | GET | `/api/v1/ventas/{id}/comprobante/pdf` | RF-VNT-007 | Descargar PDF del comprobante | ventas |
| 65 | GET | `/api/v1/ventas/{id}/comprobante/preview` | RF-VNT-008 | Previsualizar comprobante (render HTML/PDF en navegador) | ventas |

**Notas de crédito:**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 66 | POST | `/api/v1/notas-credito` | RF-VNT-009 | Emitir NC (devuelve stock, genera vale o reembolso) | notas_credito, detalle_notas_credito, stock_almacen |
| 67 | GET | `/api/v1/notas-credito` | — | Listar notas de crédito (?ventaOrigenId=x&estado=&page=0) | notas_credito |
| 68 | GET | `/api/v1/notas-credito/{id}` | — | Detalle con productos devueltos | notas_credito + JOINs |

**Sesiones de caja (requeridas por RF-VNT-001 precondición):**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 69 | POST | `/api/v1/caja/sesiones` | — | Abrir sesión de caja (monto_apertura) | sesiones_caja |
| 70 | GET | `/api/v1/caja/sesiones` | — | Listar sesiones (?estado=ABIERTA&cajaId=x) | sesiones_caja |
| 71 | PATCH | `/api/v1/caja/sesiones/{id}/cerrar` | — | Cerrar sesión (monto_cierre, calcula diferencia) | sesiones_caja |
| 72 | POST | `/api/v1/caja/sesiones/{id}/movimientos` | — | Registrar ingreso/egreso de caja | movimientos_caja |

---

**RESUMEN FASE 2:** 7 (ENT) + 15 (VNT) = **22 endpoints**

---

### FASE 3: Cadena de Suministro (Inventario avanzado + Compras)

**Objetivo:** Ajustes manuales de inventario, transferencias entre almacenes, órdenes de compra completas con recepciones parciales.
**Endpoints:** 19

---

#### 3.1 Inventario — Avanzado (INV restante) — 7 endpoints

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 73 | POST | `/api/v1/inventario/ajustes` | RF-INV-004 | Ajuste manual (ingreso/egreso + motivo) → registra kardex | stock_almacen, movimientos_inventario |
| 74 | GET | `/api/v1/inventario/stock/exportar` | RF-INV-010 | Exportar stock a Excel (.xlsx) (?almacenId=x) | stock_almacen |
| 75 | POST | `/api/v1/transferencias` | RF-INV-005 | Crear transferencia (estado PENDIENTE) | transferencias, detalle_transferencias |
| 76 | GET | `/api/v1/transferencias` | RF-INV-006 | Listar (?estado=PENDIENTE&almacenOrigenId=x&page=0) | transferencias |
| 77 | GET | `/api/v1/transferencias/{id}` | RF-INV-007 | Detalle con productos | transferencias + detalle |
| 78 | PATCH | `/api/v1/transferencias/{id}/aprobar` | RF-INV-008 | Aprobar → mueve stock + registra kardex en ambos almacenes | transferencias, stock_almacen, movimientos_inventario |
| 79 | PATCH | `/api/v1/transferencias/{id}/cancelar` | RF-INV-009 | Cancelar transferencia pendiente | transferencias |

---

#### 3.2 Compras (COM) — 12 endpoints

**Órdenes de compra:**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 80 | POST | `/api/v1/compras/ordenes` | RF-COM-001 | Crear OC (calcula subtotal/IGV/total) | ordenes_compra, detalle_ordenes_compra |
| 81 | GET | `/api/v1/compras/ordenes` | RF-COM-002 | Listar (?estado=PENDIENTE&proveedorId=x&fechaDesde=&page=0) | ordenes_compra |
| 82 | GET | `/api/v1/compras/ordenes/{id}` | RF-COM-003 | Detalle con productos y recepciones | ordenes_compra + JOINs |
| 83 | PUT | `/api/v1/compras/ordenes/{id}` | RF-COM-005 | Actualizar OC pendiente | ordenes_compra, detalle_ordenes_compra |
| 84 | PATCH | `/api/v1/compras/ordenes/{id}/estado` | RF-COM-006 | Cambiar estado (workflow 7 estados) | ordenes_compra |
| 85 | DELETE | `/api/v1/compras/ordenes/{id}` | RF-COM-007 | Cancelar OC (no completada) | ordenes_compra |
| 86 | GET | `/api/v1/compras/ordenes/{id}/pdf` | RF-COM-004 | Descargar OC en PDF | ordenes_compra |
| 87 | GET | `/api/v1/compras/estadisticas` | RF-COM-009 | Totales: órdenes por estado, monto total | ordenes_compra |

**Recepciones:**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 88 | POST | `/api/v1/compras/recepciones` | RF-COM-008 | Registrar recepción → incrementa stock + registra kardex | recepciones_compra, detalle_recepciones_compra, stock_almacen, movimientos_inventario |
| 89 | GET | `/api/v1/compras/recepciones` | — | Listar recepciones (?ordenCompraId=x&estado=&page=0) | recepciones_compra |
| 90 | GET | `/api/v1/compras/recepciones/{id}` | — | Detalle con productos recibidos/aceptados/rechazados | recepciones_compra + detalle |
| 91 | PATCH | `/api/v1/compras/recepciones/{id}/confirmar` | — | Confirmar recepción → actualiza estado OC (PARCIAL o COMPLETADA) | recepciones_compra, ordenes_compra |

**Notas:**
- Workflow OC: PENDIENTE → ENVIADA → CONFIRMADA → EN_RECEPCION → PARCIAL → COMPLETADA | CANCELADA
- Recepción parcial: cantidad_recibida < cantidad_ordenada → OC estado PARCIAL
- POST recepción valida: cantidad_recibida no excede (cantidad_ordenada - ya_recibida)

---

**RESUMEN FASE 3:** 7 (INV avanzado) + 12 (COM) = **19 endpoints**

---

### FASE 4: Administración (Usuarios/Roles + Configuración completa)

**Objetivo:** RBAC completo, configuración de empresa, series SUNAT, métodos de pago, almacenes, política de devoluciones.
**Endpoints:** 36

---

#### 4.1 Usuarios y Roles (USR) — 10 endpoints

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 92 | POST | `/api/v1/usuarios` | RF-USR-001 | Crear usuario (password 8+ chars, mayúsc, minúsc, números) | usuarios |
| 93 | GET | `/api/v1/usuarios` | RF-USR-002 | Listar (?rolId=x&estado=1&q=nombre&page=0) | usuarios |
| 94 | GET | `/api/v1/usuarios/{id}` | RF-USR-006 | Detalle con rol, permisos, último acceso | usuarios, roles |
| 95 | PUT | `/api/v1/usuarios/{id}` | RF-USR-003 | Actualizar datos (email único en tenant) | usuarios |
| 96 | PATCH | `/api/v1/usuarios/{id}/password` | RF-USR-004 | Cambiar contraseña (sin conocer la anterior, solo Admin) | usuarios |
| 97 | PATCH | `/api/v1/usuarios/{id}/estado` | RF-USR-005 | Activar/desactivar (no puede desactivarse a sí mismo) | usuarios |
| 98 | POST | `/api/v1/roles` | RF-USR-007 | Crear rol con permisos JSON | roles |
| 99 | GET | `/api/v1/roles` | RF-USR-008 | Listar roles con conteo de usuarios | roles |
| 100 | PUT | `/api/v1/roles/{id}` | RF-USR-009 | Actualizar permisos (no roles es_sistema=1) | roles |
| 101 | PATCH | `/api/v1/roles/{id}/estado` | RF-USR-010 | Desactivar rol (validar sin usuarios asignados, no es_sistema) | roles |

---

#### 4.2 Configuración General (CFG-A) — 23 endpoints

**Empresa (RF-CFG-001, RF-CFG-002):**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 102 | GET | `/api/v1/configuracion/empresa` | RF-CFG-001 | Datos de la empresa del tenant | configuracion_empresa |
| 103 | PUT | `/api/v1/configuracion/empresa` | RF-CFG-002 | Actualizar datos empresa + config fiscal + SUNAT | configuracion_empresa |

**Series de comprobantes (RF-CFG-003, RF-CFG-006):**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 104 | GET | `/api/v1/configuracion/series-comprobantes` | RF-CFG-003 | Listar series (?tipoComprobante=BOLETA) | series_comprobantes |
| 105 | POST | `/api/v1/configuracion/series-comprobantes` | RF-CFG-006 | Crear serie (formato SUNAT: 4 chars) | series_comprobantes |
| 106 | PUT | `/api/v1/configuracion/series-comprobantes/{id}` | RF-CFG-006 | Actualizar serie | series_comprobantes |
| 107 | PATCH | `/api/v1/configuracion/series-comprobantes/{id}/estado` | RF-CFG-006 | Activar/desactivar serie | series_comprobantes |

**Métodos de pago (RF-CFG-004):**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 108 | GET | `/api/v1/configuracion/metodos-pago` | RF-CFG-004 | Listar métodos de pago | metodos_pago |
| 109 | POST | `/api/v1/configuracion/metodos-pago` | — | Crear método de pago | metodos_pago |
| 110 | PUT | `/api/v1/configuracion/metodos-pago/{id}` | — | Actualizar método | metodos_pago |
| 111 | PATCH | `/api/v1/configuracion/metodos-pago/{id}/estado` | — | Activar/desactivar | metodos_pago |

**Política de devoluciones (RF-CFG-007):**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 112 | GET | `/api/v1/configuracion/politica-devoluciones` | RF-CFG-007 | Ver política actual | configuracion_empresa |
| 113 | PUT | `/api/v1/configuracion/politica-devoluciones` | RF-CFG-007 | Actualizar política | configuracion_empresa |

**Almacenes (implícito — requerido por RF-INV-001, RF-VNT-001):**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 114 | GET | `/api/v1/almacenes` | — | Listar almacenes del tenant | almacenes |
| 115 | POST | `/api/v1/almacenes` | — | Crear almacén | almacenes |
| 116 | PUT | `/api/v1/almacenes/{id}` | — | Actualizar almacén | almacenes |
| 117 | PATCH | `/api/v1/almacenes/{id}/estado` | — | Activar/desactivar | almacenes |

**Cajas registradoras (implícito — requerido por RF-VNT-001 precondición):**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 118 | GET | `/api/v1/configuracion/cajas-registradoras` | — | Listar cajas del tenant | cajas_registradoras |
| 119 | POST | `/api/v1/configuracion/cajas-registradoras` | — | Crear caja | cajas_registradoras |
| 120 | PUT | `/api/v1/configuracion/cajas-registradoras/{id}` | — | Actualizar caja | cajas_registradoras |
| 121 | PATCH | `/api/v1/configuracion/cajas-registradoras/{id}/estado` | — | Activar/desactivar | cajas_registradoras |

**Motivos de movimiento (implícito — requerido por RF-INV-004):**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 122 | GET | `/api/v1/configuracion/motivos-movimiento` | — | Listar motivos (?tipo=ENTRADA) | motivos_movimiento |
| 123 | POST | `/api/v1/configuracion/motivos-movimiento` | — | Crear motivo | motivos_movimiento |
| 124 | PUT | `/api/v1/configuracion/motivos-movimiento/{id}` | — | Actualizar motivo | motivos_movimiento |

**Ubigeo — Datos de referencia (read-only, sin tenant_id):**

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 125 | GET | `/api/v1/ubigeo/departamentos` | — | Listar 25 departamentos del Perú | departamentos |
| 126 | GET | `/api/v1/ubigeo/provincias` | — | Provincias (?departamentoId=x) | provincias |
| 127 | GET | `/api/v1/ubigeo/distritos` | — | Distritos (?provinciaId=x) | distritos |

---

**RESUMEN FASE 4:** 10 (USR) + 26 (CFG-A) = **36 endpoints**

---

### FASE 5: Plataforma SaaS (Superadmin + Suscripciones)

**Objetivo:** Panel de administración global: gestión de tenants, planes, pagos, tickets, auditoría cross-tenant.
**Endpoints:** 25 | **Prefijo:** `/api/v1/platform/`

---

#### 5.1 Superadmin (SUP) — 13 endpoints

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 128 | POST | `/api/v1/platform/tenants` | RF-SUP-001 | Crear tenant + suscripción + usuario admin inicial | tenants, suscripciones, configuracion_empresa, usuarios, roles |
| 129 | GET | `/api/v1/platform/tenants` | RF-SUP-002 | Listar tenants (?estado=ACTIVA&planId=x&q=nombre&page=0) | tenants + suscripciones |
| 130 | GET | `/api/v1/platform/tenants/{id}` | RF-SUP-003 | Detalle: propietario, plan, pagos, métricas, módulos, última actividad | tenants + múltiples JOINs |
| 131 | PUT | `/api/v1/platform/tenants/{id}` | RF-SUP-004 | Actualizar datos + overrides de límites | tenants, suscripciones |
| 132 | PATCH | `/api/v1/platform/tenants/{id}/estado` | RF-SUP-005 | Suspender/activar (motivo obligatorio si SUSPENDIDA) | tenants |
| 133 | DELETE | `/api/v1/platform/tenants/{id}` | RF-SUP-009 | Soft delete (deleted_at + estado=ELIMINADA) | tenants |
| 134 | GET | `/api/v1/platform/dashboard/ingresos` | RF-SUP-006 | Métricas globales: ingresos mes, por plan, top 10, tasa renovación | pagos_suscripcion, suscripciones |
| 135 | GET | `/api/v1/platform/tenants/{id}/modulos` | RF-SUP-007 | Módulos activos del tenant (plan + overrides) | modulos_plan, modulos_tenant |
| 136 | PUT | `/api/v1/platform/tenants/{id}/modulos` | RF-SUP-007 | Override manual de módulos | modulos_tenant |
| 137 | GET | `/api/v1/platform/tickets` | RF-SUP-008 | Listar tickets (?estado=ABIERTO&prioridad=ALTA&page=0) | tickets_soporte |
| 138 | GET | `/api/v1/platform/tickets/{id}` | RF-SUP-008 | Detalle del ticket | tickets_soporte |
| 139 | PATCH | `/api/v1/platform/tickets/{id}` | RF-SUP-008 | Responder / cambiar estado / cambiar prioridad | tickets_soporte |
| 140 | GET | `/api/v1/platform/auditoria` | RF-SUP-010 | Logs globales (?tenantId=x&accion=y&fechaDesde=&page=0) | auditoria_plataforma |

---

#### 5.2 Suscripciones (SUB) — 12 endpoints

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 141 | POST | `/api/v1/platform/planes` | RF-SUB-001 | Crear plan (precios, límites, módulos incluidos) | planes_suscripcion, modulos_plan |
| 142 | GET | `/api/v1/platform/planes` | RF-SUB-002 | Listar planes con conteo de tenants suscritos | planes_suscripcion |
| 143 | PUT | `/api/v1/platform/planes/{id}` | RF-SUB-003 | Actualizar plan (no afecta tenants existentes) | planes_suscripcion, modulos_plan |
| 144 | PATCH | `/api/v1/platform/planes/{id}/estado` | — | Activar/desactivar plan | planes_suscripcion |
| 145 | POST | `/api/v1/platform/tenants/{id}/suscripcion` | RF-SUB-004 | Asignar/cambiar plan a tenant | suscripciones |
| 146 | GET | `/api/v1/platform/suscripciones/estado-pagos` | RF-SUB-005 | Dashboard: al día, por vencer (7d), vencidos | suscripciones, pagos_suscripcion |
| 147 | POST | `/api/v1/platform/tenants/{id}/recordatorio-pago` | RF-SUB-006 | Enviar recordatorio de pago por email | suscripciones |
| 148 | POST | `/api/v1/platform/pagos` | RF-SUB-007 | Registrar pago manual → extiende fecha_fin +30d | pagos_suscripcion, suscripciones |
| 149 | GET | `/api/v1/platform/pagos/{id}/factura` | RF-SUB-008 | Generar/descargar factura PDF | pagos_suscripcion |
| 150 | GET | `/api/v1/platform/tenants/{id}/pagos` | RF-SUB-009 | Historial de pagos de un tenant | pagos_suscripcion |
| 151 | POST | `/api/v1/platform/cupones` | RF-SUB-010 | Crear cupón promocional | cupones |
| 152 | GET | `/api/v1/platform/cupones` | — | Listar cupones (?estado=1&page=0) | cupones |

---

**RESUMEN FASE 5:** 13 (SUP) + 12 (SUB) = **25 endpoints**

---

### FASE 6: Reportes y Analítica

**Objetivo:** Todos los reportes del negocio con filtros por fecha. Todos son GET, solo lectura.
**Endpoints:** 7

---

#### 6.1 Reportes (REP) — 7 endpoints

| # | Método | Path | RF | Descripción | Query Params |
|---|--------|------|-----|-------------|--------------|
| 153 | GET | `/api/v1/reportes/resumen` | RF-REP-001 | Dashboard ejecutivo: ventas día/mes, stock bajo, alertas | — |
| 154 | GET | `/api/v1/reportes/ventas` | RF-REP-002 | Reporte de ventas con totales y tendencias | fechaDesde, fechaHasta, usuarioId, clienteId, tipoComprobante, metodoPagoId |
| 155 | GET | `/api/v1/reportes/inventario` | RF-REP-003 | Estado del inventario + valorización | almacenId, categoriaId, estado |
| 156 | GET | `/api/v1/reportes/compras` | RF-REP-004 | Reporte de compras por proveedor | fechaDesde, fechaHasta, proveedorId, estado |
| 157 | GET | `/api/v1/reportes/financiero` | RF-REP-005 | Balance: ingresos (ventas) vs egresos (compras) | fechaDesde, fechaHasta |
| 158 | GET | `/api/v1/reportes/caja` | RF-REP-006 | Sesiones de caja: ventas, diferencias | fechaDesde, fechaHasta, cajaId, usuarioId |
| 159 | GET | `/api/v1/reportes/productos-mas-vendidos` | RF-REP-007 | Ranking top N productos | fechaDesde, fechaHasta, categoriaId, top (default 10) |

---

**RESUMEN FASE 6:** 7 (REP) = **7 endpoints**

---

### FASE 7: B2C / Storefront (Cliente final)

**Objetivo:** Tienda online pública: catálogo, registro/login, perfil, pedidos. Requiere tablas adicionales futuras (pedidos_tienda).
**Endpoints:** 10 | **Prefijo:** `/api/v1/storefront/`

---

#### 7.1 Cliente / Storefront (CLI) — 10 endpoints

| # | Método | Path | RF | Descripción | Tabla(s) |
|---|--------|------|-----|-------------|----------|
| 160 | POST | `/api/v1/storefront/auth/register` | RF-CLI | Registro cliente (email/password o OAuth) | clientes_tienda |
| 161 | GET | `/api/v1/storefront/perfil` | RF-CLI | Ver perfil del cliente autenticado | clientes_tienda |
| 162 | PUT | `/api/v1/storefront/perfil` | RF-CLI | Actualizar nombre, teléfono, dirección | clientes_tienda |
| 163 | GET | `/api/v1/storefront/productos` | RF-CLI | Catálogo público (filtros: categoría, talla, color, marca, precio) | productos (estado=1) |
| 164 | GET | `/api/v1/storefront/productos/{slug}` | RF-CLI | Detalle producto por slug (SEO-friendly) | productos, imagenes_producto |
| 165 | GET | `/api/v1/storefront/categorias` | RF-CLI | Categorías activas con slug | categorias (estado=1) |
| 166 | POST | `/api/v1/storefront/pedidos` | RF-CLI | Crear pedido online | * (tablas nuevas en Fase 7) |
| 167 | GET | `/api/v1/storefront/pedidos` | RF-CLI | Mis pedidos | * |
| 168 | GET | `/api/v1/storefront/pedidos/{id}` | RF-CLI | Detalle de mi pedido | * |
| 169 | PATCH | `/api/v1/storefront/pedidos/{id}/cancelar` | RF-CLI | Cancelar pedido (si estado permite) | * |

**Notas importantes Fase 7:**
- Los 13 RF-CLI no están detallados en el documento de requerimientos v3.0. Los endpoints listados son inferidos del schema existente (`clientes_tienda`) y patrones comunes de e-commerce.
- Pedidos online requieren tablas nuevas que NO existen en el schema actual: `pedidos_tienda`, `detalle_pedidos_tienda`, `direcciones_envio`. Se crearán como parte de esta fase.
- El login de cliente B2C ya está en Fase 1 (#8: `POST /api/v1/storefront/auth/login`).
- Endpoints de storefront usan `slug` en lugar de `id` para productos y categorías (SEO-friendly).

---

**RESUMEN FASE 7:** 10 (CLI) = **10 endpoints**

---

## RESUMEN DE FASES

| Fase | Nombre | Módulos | Endpoints | % del Total | Prerequisitos |
|------|--------|---------|-----------|-------------|---------------|
| **1** | Fundación | AUT + PRD + Catálogos + INV básico | 50 | 30% | — |
| **2** | Flujo de Ventas | ENT + VNT/POS | 22 | 13% | Fase 1 |
| **3** | Cadena de Suministro | INV avanzado + COM | 19 | 11% | Fases 1-2 |
| **4** | Administración | USR + CFG completa | 36 | 21% | Fases 1-3 |
| **5** | Plataforma SaaS | SUP + SUB | 25 | 15% | Fases 1-4 |
| **6** | Reportes | REP | 7 | 4% | Fases 1-5 |
| **7** | Storefront B2C | CLI | 10 | 6% | Fases 1-6 |
| | **TOTAL** | **12 módulos** | **169** | **100%** | |

> **Nota sobre Fase 1 (50 endpoints):** 28 de los 50 son CRUD de catálogos que siguen un patrón idéntico. En Spring Boot se implementan con una clase abstracta genérica + 7 subclases mínimas. El esfuerzo real de codificación de Fase 1 equivale a ~25 endpoints únicos.

---

## CONTEO POR MÉTODO HTTP

| Método | Cantidad | % | Uso principal |
|--------|----------|---|---------------|
| GET | 75 | 44% | Listados, detalles, reportes, búsquedas |
| POST | 41 | 24% | Creación de recursos, acciones de negocio |
| PUT | 23 | 14% | Actualización completa de recursos |
| PATCH | 18 | 11% | Acciones parciales: estado, password, aprobar, cerrar |
| DELETE | 12 | 7% | Soft delete / cancelar |
| **TOTAL** | **169** | **100%** | |

---

## CONTEO POR NIVEL DE ACCESO

| Nivel | Prefijo | Endpoints | Módulos |
|-------|---------|-----------|---------|
| Tenant (Admin/Cajero) | `/api/v1/` | 132 | AUT(6), PRD, INV, ENT, VNT, COM, USR, CFG, REP |
| Plataforma (Superadmin) | `/api/v1/platform/` | 26 | AUT(1), SUP, SUB |
| Storefront (Cliente B2C) | `/api/v1/storefront/` | 11 | AUT(1), CLI |
| **TOTAL** | | **169** | |

---

## MAPA: TABLAS DE SCHEMA → ENDPOINTS

| Tabla | Tipo de endpoint | Módulo | Endpoints |
|-------|-----------------|--------|-----------|
| usuarios | Full CRUD + auth | AUT, USR | 8 |
| usuarios_plataforma | Auth only | AUT | 1 |
| clientes_tienda | Auth + CRUD | AUT, CLI | 4 |
| roles | CRUD | USR | 4 |
| productos | Full CRUD + búsqueda + liquidación | PRD | 8 |
| imagenes_producto | Sub-recurso de productos | PRD | 3 |
| categorias | Catálogo CRUD | CFG-B | 4 |
| tallas | Catálogo CRUD | CFG-B | 4 |
| colores | Catálogo CRUD | CFG-B | 4 |
| marcas | Catálogo CRUD | CFG-B | 4 |
| materiales | Catálogo CRUD | CFG-B | 4 |
| generos | Catálogo CRUD | CFG-B | 4 |
| unidades_medida | Catálogo CRUD | CFG-B | 4 |
| entidades_comerciales | CRUD + búsqueda + stats | ENT | 7 |
| ventas | CRUD + acciones negocio + PDF | VNT | 8 |
| detalle_ventas | Embebido en ventas | VNT | 0 (via POST/GET ventas) |
| pagos_venta | Embebido en confirmar-pago | VNT | 0 (via POST confirmar-pago) |
| notas_credito | CRUD | VNT | 3 |
| detalle_notas_credito | Embebido en notas_credito | VNT | 0 |
| sesiones_caja | CRUD + cerrar | VNT | 3 |
| movimientos_caja | Sub-recurso sesiones | VNT | 1 |
| stock_almacen | Consulta + exportar | INV | 2 |
| movimientos_inventario | Consulta (kardex) | INV | 1 |
| transferencias | CRUD + aprobar/cancelar | INV | 5 |
| detalle_transferencias | Embebido en transferencias | INV | 0 |
| ordenes_compra | Full CRUD + PDF + estadísticas | COM | 8 |
| detalle_ordenes_compra | Embebido en ordenes | COM | 0 |
| recepciones_compra | CRUD + confirmar | COM | 4 |
| detalle_recepciones_compra | Embebido en recepciones | COM | 0 |
| configuracion_empresa | Singleton GET/PUT | CFG-A | 2 (+2 política) |
| series_comprobantes | CRUD | CFG-A | 4 |
| metodos_pago | CRUD | CFG-A | 4 |
| almacenes | CRUD | CFG-A | 4 |
| cajas_registradoras | CRUD | CFG-A | 4 |
| motivos_movimiento | CRUD (3 ops) | CFG-A | 3 |
| departamentos | Read-only | CFG-A | 1 |
| provincias | Read-only | CFG-A | 1 |
| distritos | Read-only | CFG-A | 1 |
| tenants | Full CRUD platform | SUP | 6 |
| modulos_sistema | Referencia interna | — | 0 (usado internamente) |
| modulos_plan | Embebido en planes | SUB | 0 |
| modulos_tenant | Sub-recurso tenants | SUP | 2 |
| suscripciones | Via tenants | SUP, SUB | 2 |
| planes_suscripcion | CRUD platform | SUB | 4 |
| cupones | CRUD platform | SUB | 2 |
| pagos_suscripcion | Crear + historial + factura | SUB | 3 |
| tickets_soporte | CRUD platform | SUP | 3 |
| auditoria_plataforma | Consulta platform | SUP | 1 |
| auditoria | Consulta tenant (futuro) | — | 0 (implícito en cada operación) |

---

## ENDPOINTS SIN RF EXPLÍCITO (INFERIDOS DEL SCHEMA)

Estos endpoints no tienen RF directo pero son necesarios para que los RFs funcionen:

| Endpoint | Justificación | Requerido por |
|----------|--------------|---------------|
| CRUD almacenes | RF-INV-001 necesita almacenes para filtrar stock | RF-INV-001, RF-VNT-001 |
| CRUD cajas_registradoras | RF-VNT-001 precondición: "sesión de caja activa" | RF-VNT-001 |
| CRUD motivos_movimiento | RF-INV-004 usa motivo_id al ajustar inventario | RF-INV-004 |
| Sesiones de caja | RF-VNT-001 precondición: "sesión de caja activa" | RF-VNT-001, RF-VNT-005 |
| Ubigeo (3 GETs) | entidades_comerciales tiene FK a departamentos/provincias/distritos | RF-ENT-001 |
| Imágenes producto (3) | imagenes_producto existe en schema, UI necesita galería | RF-PRD-001 |
| Notas de crédito list/detail | RF-VNT-009 crea NC pero no dice cómo consultarlas | RF-VNT-009 |
| Recepción list/detail/confirm | RF-COM-008 registra recepción pero necesita flujo completo | RF-COM-008 |

---

## ORDEN RECOMENDADO DENTRO DE CADA FASE (para Postman)

### Fase 1 — Secuencia de prueba en Postman:
1. `POST /auth/login` → obtener JWT
2. POST catálogos: crear 2 categorías, 4 tallas, 3 colores, 2 marcas, 2 materiales, 2 géneros, 1 unidad
3. GET catálogos: verificar que se crearon
4. `POST /productos` → crear 5 productos usando IDs de catálogos
5. GET productos: verificar listado y filtros
6. GET stock: verificar stock inicial (0 sin movimientos)

### Fase 2 — Secuencia de prueba:
1. POST entidad tipo CLIENTE (DNI 8 dígitos)
2. POST entidad tipo PROVEEDOR (RUC 11 dígitos)
3. POST sesión de caja (abrir)
4. POST venta (estado PENDIENTE)
5. POST confirmar-pago → verificar stock decrementó
6. GET kardex → verificar movimiento SALIDA registrado
7. GET comprobante/pdf
8. POST nota de crédito → verificar stock restaurado

### Fase 3 — Secuencia de prueba:
1. POST orden de compra al proveedor creado en Fase 2
2. PATCH estado OC → ENVIADA → CONFIRMADA
3. POST recepción de compra → verificar stock incrementó
4. GET kardex → verificar movimiento ENTRADA
5. POST ajuste de inventario (merma)
6. POST transferencia entre almacenes
7. PATCH aprobar transferencia → verificar stocks en ambos almacenes

---

**FIN DEL DOCUMENTO**
**Total: 169 endpoints | 7 fases | 12 módulos | 49 tablas**
**Cobertura: 111/111 RFs del documento v3.0**
