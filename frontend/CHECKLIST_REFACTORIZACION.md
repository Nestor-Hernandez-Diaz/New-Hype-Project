# CHECKLIST - Estado del Proyecto ERP
**Proyecto:** ERP New Hype - Tienda de Ropa y Accesorios
**Estrategia Actual:** Frontend conectado a API real (Spring Boot)
**Ultima Actualizacion:** 08/03/2026
**Tech Stack:** React + TypeScript + Vite + Tailwind | Spring Boot + MySQL

---

## ESTADO GENERAL

Todos los modulos frontend estan migrados a **API real** (Spring Boot backend). Los mock APIs fueron eliminados. El backend esta desplegado en `spring.informaticapp.com:5001`.

| Metrica | Valor |
|---------|-------|
| Modulos con API Real | **8/8** (100%) |
| Mock APIs eliminados | Todos |
| Backend endpoints | 40+ |
| E2E Tests ejecutados | 16/18 |

---

## MODULOS - ESTADO ACTUAL

### PRODUCTOS
**Ruta:** `/lista-productos`
**Estado:** COMPLETO
- [x] API Real: `productosRealApi.ts` (apiService)
- [x] Context: `ProductContext.tsx` con useReducer
- [x] Endpoints: GET/POST/PUT/DELETE `/productos`, PATCH estado, imagenes
- [x] Funcionalidades: CRUD, categorias, unidades medida, imagenes
- [x] Mock eliminado: `productosMockApi.ts` borrado
- [x] E2E: Productos visibles con stock real

### USUARIOS
**Ruta:** `/usuarios`
**Estado:** COMPLETO
- [x] API Real: `usuariosRealApi.ts` (apiService)
- [x] Context: `UsersContext.tsx` con useReducer
- [x] Endpoints: GET/POST `/usuarios`, GET/PUT `/{id}`, PATCH estado/password, roles CRUD
- [x] Funcionalidades: CRUD usuarios, roles, permisos, cambio estado
- [x] Mock eliminado: nunca tuvo archivo mock separado
- [x] E2E: Usuarios visibles

### ENTIDADES COMERCIALES (Clientes/Proveedores)
**Ruta:** `/lista-entidades`
**Estado:** COMPLETO
- [x] API Real: `entidadesRealApi.ts` (apiService)
- [x] Context: `ClientContext.tsx` con useReducer
- [x] Endpoints: GET/POST `/entidades`, GET/PUT/DELETE `/{id}`, reactivate, ubigeo
- [x] Funcionalidades: CRUD, filtros por tipo, validacion documento
- [x] Mock eliminado: `entidadesMockApi.ts` borrado
- [x] E2E: Entidades visibles

### VENTAS (POS + Lista + Cotizaciones + Caja)
**Ruta:** `/ventas/realizar`, `/ventas/lista`, `/ventas/cotizaciones`, `/gestion-caja`
**Estado:** COMPLETO
- [x] API Real: `ventasRealApi.ts` (apiService)
- [x] Context: `SalesContext.tsx` + `QuotesContext.tsx` con useReducer
- [x] Endpoints:
  - Ventas: GET/POST `/ventas`, completar, cancelar, confirmar-pago
  - Caja: GET/POST `/caja/sesiones`, cerrar, movimientos
  - Notas Credito: POST `/notas-credito`
  - Cotizaciones: CRUD + convertir a venta (8 endpoints)
- [x] Funcionalidades: POS completo, pagos, IGV configurable, notas credito, cotizaciones, cajas
- [x] Mock eliminado: `ventasApi.ts` borrado (08/03/2026)
- [x] E2E: 8 tests pasados (sesion 4) + 5 tests pasados (sesion 5)

### INVENTARIO (Stock + Kardex + Almacenes + Motivos)
**Ruta:** `/inventario/stock`, `/inventario/kardex`, `/inventario/almacenes`, `/inventario/motivos`
**Estado:** COMPLETO
- [x] API Real: `inventoryRealApi.ts` (apiService) + `almacenesApi.ts` + `movementReasonsApi.ts`
- [x] Context: `InventoryContext.tsx` con useReducer
- [x] Endpoints: GET stock, kardex, alertas, ajustes, almacenes CRUD, motivos CRUD
- [x] Funcionalidades: Stock por almacen, kardex movimientos, alertas stock bajo
- [x] Mock eliminado: `inventoryMockApi.ts` borrado
- [x] E2E: Stock y kardex verificados
- [ ] Pendiente: consolidar `inventarioApi.ts` (axios legacy) con `inventoryRealApi.ts`

### COMPRAS (Ordenes + Recepciones)
**Ruta:** `/compras/ordenes`, `/compras/recepciones`
**Estado:** COMPLETO
- [x] API Real: `comprasRealApi.ts` (apiService)
- [x] Context: `PurchasesContext.tsx` con useReducer
- [x] Endpoints: CRUD ordenes, cambiar estado, CRUD recepciones, confirmar
- [x] Funcionalidades: Ordenes compra, recepciones, vinculacion proveedor
- [x] Mock eliminado: `ordenesComprasMockApi.ts` y `recepcionesMockApi.ts` borrados
- [x] E2E: Ordenes visibles
- [ ] Pendiente: consolidar `purchaseOrderService.ts` + `purchaseReceiptService.ts` (axios legacy) con `comprasRealApi.ts`

### CONFIGURACION (Empresa + Comprobantes + Metodos Pago + Catalogos)
**Ruta:** `/configuracion/*`
**Estado:** COMPLETO
- [x] API Real: `configuracionApi.ts` (apiService)
- [x] Endpoints: empresa, series-comprobantes, categorias, unidades-medida, metodos-pago, tallas, colores, marcas, materiales, generos
- [x] Funcionalidades: CRUD completo para todos los catalogos
- [x] Nunca tuvo mocks
- [x] E2E: Metodos pago y comprobantes verificados

### STOREFRONT (Tienda Online)
**Ruta:** `/tienda/*`
**Estado:** COMPLETO
- [x] API Real: `storefrontApi.ts` + `storefrontFetch.ts` (fetch nativo con JWT separado)
- [x] Context: `StorefrontContext.tsx`
- [x] Endpoints: productos, categorias, catalogos, empresa, metodos-pago, pedidos, ubigeo, auth
- [x] Funcionalidades: Catalogo, carrito, checkout, pedidos, favoritos, auth cliente
- [x] Nunca tuvo mocks

---

## PENDIENTES TECNICOS

### Consolidacion de servicios duplicados
Algunos modulos tienen dos archivos de servicio que llaman al mismo backend:

| Modulo | Archivo nuevo (apiService) | Archivo legacy (axios) | Accion |
|--------|---------------------------|----------------------|--------|
| Inventario | `inventoryRealApi.ts` | `inventarioApi.ts` | Migrar `FiltersKardex.tsx` al nuevo, eliminar legacy |
| Compras | `comprasRealApi.ts` | `purchaseOrderService.ts`, `purchaseReceiptService.ts`, `auxiliaryEntitiesService.ts` | Migrar pages al nuevo, eliminar legacy |

### Verificacion E2E pendiente por modulo

| Modulo | Rutas por verificar |
|--------|-------------------|
| Inventario | `/inventario/almacenes`, `/inventario/motivos` |
| Compras | `/compras/recepciones` (flujo completo) |
| Configuracion | `/configuracion/mi-perfil`, `/configuracion/empresa`, `/configuracion/productos` |
| Reportes | `/reportes/ventas`, `/reportes/compras`, `/reportes/inventario`, `/reportes/caja` |
| Auditoria | `/auditoria` |

### Limpieza menor
- [ ] `EditarUsuario.tsx` linea 241: tiene `mockUsers` fallback hardcoded — reemplazar con API call
- [ ] `PlatformLogin.tsx` linea 26-30: usa token mock temporal para superadmin

---

## ARQUITECTURA DE SERVICIOS

```
frontend/src/utils/api.ts              -> ApiService singleton (fetch + JWT)
frontend/src/modules/
  products/services/productosRealApi.ts     -> apiService
  users/services/usuariosRealApi.ts         -> apiService
  clients/services/entidadesRealApi.ts      -> apiService
  sales/services/ventasRealApi.ts           -> apiService
  inventory/services/inventoryRealApi.ts    -> apiService
  inventory/services/almacenesApi.ts        -> apiService
  inventory/services/movementReasonsApi.ts  -> apiService
  purchases/services/comprasRealApi.ts      -> apiService
  configuration/services/configuracionApi.ts -> apiService
  storefront/services/storefrontApi.ts      -> storefrontFetch (fetch + JWT storefront)
```

Backend: `spring.informaticapp.com:5001/New-Hype-Project/api/v1`

---

**Ultima Actualizacion:** 08/03/2026
**Estado:** COMPLETO - Todos los modulos en API real
