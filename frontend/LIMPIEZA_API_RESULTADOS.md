# Limpieza y Estandarizacion de APIs del Frontend

**Fecha:** 2026-03-07
**Objetivo:** Garantizar que el frontend SOLO consume la API del backend en cPanel y la API externa DECOLECTA.

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| Archivos modificados | 20 |
| Archivos eliminados (dead code) | 12 |
| Referencias a `localhost` eliminadas | 15+ |
| Variables `mockApi` renombradas | 4 |
| Comentarios legacy limpiados | 8 |
| Build exitoso | Si |
| Network tab: 0 requests a localhost | Si |

---

## 1. APIs Permitidas

| API | URL | Uso |
|-----|-----|-----|
| Backend cPanel | `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1` | Todos los endpoints del ERP |
| DECOLECTA | `https://api.decolecta.com/v1/` | Consulta RUC/DNI (API externa) |

---

## 2. Archivos .env Estandarizados

| Archivo | Antes | Despues |
|---------|-------|---------|
| `.env` | HTTPS proxy + variables extra | `VITE_API_URL=http://spring.informaticapp.com:5001/New-Hype-Project/api/v1` + `VITE_DECOLECTA_TOKEN` |
| `.env.development` | Solo API URL | Igual que `.env` (con DECOLECTA token) |
| `.env.example` | URL cPanel | Limpio, solo 2 variables documentadas |
| `.env.e2e` | `localhost:3001` | URL cPanel |

---

## 3. Archivos Modificados (Correccion de URLs)

### Fallbacks de URL corregidos (localhost -> cPanel)

| Archivo | URL Anterior | URL Nueva |
|---------|-------------|-----------|
| `src/utils/api.ts` | `localhost:8080` | cPanel URL |
| `src/utils/excelExport.ts` | `VITE_API_BASE_URL` (variable incorrecta) + `localhost:3001` | `VITE_API_URL` + cPanel URL |
| `src/modules/storefront/services/storefrontFetch.ts` | `localhost:5001` | cPanel URL |
| `src/components/AlertasBadge.tsx` | `localhost:3001` | cPanel URL |
| `src/modules/sales/pages/DetalleVenta.tsx` | `localhost:3001` | cPanel URL |
| `src/modules/sales/pages/Cotizaciones.tsx` | `localhost:3001` | cPanel URL |
| `src/modules/sales/components/ModalNotaCredito.tsx` | `localhost:3000` + doble `/api/` | cPanel URL + path corregido |
| `src/modules/inventory/services/inventarioApi.ts` | `getApiBaseUrl()` con deteccion de host | Simple fallback a cPanel |
| `src/modules/purchases/services/purchaseOrderService.ts` | `getApiBaseUrl()` con deteccion de host | Simple fallback a cPanel |
| `src/modules/purchases/services/purchaseReceiptService.ts` | `getApiBaseUrl()` con deteccion de host | Simple fallback a cPanel |
| `src/modules/purchases/services/auxiliaryEntitiesService.ts` | `getApiBaseUrl()` con deteccion de host | Simple fallback a cPanel |
| `src/modules/platform/pages/PlatformLogin.tsx` | Codigo comentado con `localhost:8080` | Codigo eliminado |

### Patron estandarizado en todos los archivos:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';
```

---

## 4. Variables Renombradas (mockApi -> api)

| Archivo | Variable Antes | Variable Despues |
|---------|---------------|-----------------|
| `src/modules/clients/context/ClientContext.tsx` | `entidadesMockApi` | `entidadesApi` |
| `src/modules/products/context/ProductContext.tsx` | `productosMockApi` | `productosApi` |
| `src/modules/inventory/context/InventoryContext.tsx` | `inventoryMockApi` | `inventoryApi` |
| `src/modules/inventory/services/inventoryRealApi.ts` | `export const inventoryMockApi` | `export const inventoryApi` |
| `src/modules/inventory/index.ts` | `export { inventoryMockApi }` | `export { inventoryApi }` |

---

## 5. Comentarios Legacy Limpiados

| Archivo | Antes | Despues |
|---------|-------|---------|
| `src/modules/clients/context/ClientContext.tsx` | "Conectado a Mock API local" | "Conectado a API backend via entidadesRealApi" |
| `src/modules/inventory/context/InventoryContext.tsx` | "Usa useReducer + Mock API" | "Usa useReducer + Real API (inventoryRealApi)" |
| `src/modules/clients/services/entidadesRealApi.ts` | "Reemplaza entidadesMockApi.ts" | "Llamadas al backend via apiService" |
| `src/modules/products/services/productosRealApi.ts` | "Reemplaza productosMockApi" | "Llamadas al backend via apiService" |
| `src/modules/purchases/services/comprasRealApi.ts` | "Reemplaza los mock APIs" | "Llamadas al backend via apiService" |
| `src/modules/inventory/services/inventoryRealApi.ts` | "Reemplaza inventoryMockApi" + "Exportado como inventoryMockApi" | "Llamadas al backend via apiService" |
| `src/modules/users/services/usuariosRealApi.ts` | "Reemplaza usuariosMockApi.ts" | "Servicio que conecta con el backend" |
| `src/utils/api.ts` | "legacy", "soporta clave legacy" | Comentarios limpios |

---

## 6. Archivos Eliminados (Dead Code)

| Archivo | Razon |
|---------|-------|
| `src/modules/clients/services/entidadesMockApi.ts` | Mock API reemplazada por `entidadesRealApi.ts` |
| `src/modules/products/services/productosMockApi.ts` | Mock API reemplazada por `productosRealApi.ts` |
| `src/modules/inventory/services/inventoryMockApi.ts` | Mock API reemplazada por `inventoryRealApi.ts` |
| `src/modules/purchases/services/ordenesComprasMockApi.ts` | Mock API reemplazada por `comprasRealApi.ts` |
| `src/modules/purchases/services/recepcionesMockApi.ts` | Mock API reemplazada por `comprasRealApi.ts` |
| `src/modules/inventory/demo/InventoryMockTest.tsx` | Componente de prueba, sin importaciones activas |
| `src/modules/inventory/demo/mockApiDemo.ts` | Demo de mock API, sin importaciones activas |
| `src/components/Inventario/AuthDiagnostic.tsx` | Componente diagnostico, sin importaciones activas |
| `src/modules/inventory/components/Inventario/AuthDiagnostic.tsx` | Duplicado, sin importaciones activas |
| `src/modules/inventory/__tests__/mockApi.test.ts.bak` | Test backup obsoleto |
| `src/modules/inventory/__tests__/InventoryContext.test.tsx.bak` | Test backup obsoleto |
| `src/modules/inventory/README_REFACTORING.md` | Documentacion de refactoring obsoleta |

---

## 7. Verificacion

### Build
```
$ npm run build
tsc -b && vite build
✓ 1950 modules transformed
✓ built in 2.79s
```
**Resultado:** 0 errores TypeScript, 0 errores Vite.

### Network Tab (DevTools F12)

#### Storefront (sin autenticacion)
| Endpoint | Status |
|----------|--------|
| `GET /storefront/catalogos?tenantId=1` | 200 |
| `GET /storefront/categorias?tenantId=1` | 200 |
| `GET /storefront/productos?tenantId=1&page=0&size=50` | 200 |

**Total requests:** 13 — Todas a `spring.informaticapp.com:5001`

#### Tenant (con autenticacion admin@newhype-store.pe)
| Endpoint | Status |
|----------|--------|
| `POST /auth/login` | 200 |
| `GET /auth/me` | 200 |
| `GET /productos?page=0&size=10` | 200 |
| `GET /entidades?page=0&size=10` | 200 |
| `GET /cotizaciones` | 200 |
| `GET /ventas` | 200 |
| `GET /caja/sesiones` | 200 |
| `GET /configuracion/cajas-registradoras` | 200 |
| `GET /configuracion/empresa` | 200 |
| `GET /configuracion/categorias` | 200 |
| `GET /configuracion/unidades-medida` | 200 |
| `GET /configuracion/metodos-pago` | 200 |
| `GET /configuracion/series-comprobantes` | 200 |
| `GET /usuarios?page=0&size=10` | 200 |
| `GET /roles` | 200 |
| `GET /inventario/alertas` | 200 |
| `GET /inventario/stock` | 200 |
| `GET /almacenes` | 200 |

**Total requests:** 29 — Todas a `spring.informaticapp.com:5001`

### Resultado Final
- **0 requests a localhost** en Network tab
- **0 requests a APIs externas no autorizadas**
- **100% de requests van a** `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/*`

---

## 8. Checklist Final

- [x] Investigacion exhaustiva de todo el frontend (grep localhost, 3001, 3000, 8080, 127.0.0.1, mockApi, Mock, legacy)
- [x] Archivos .env estandarizados (solo VITE_API_URL + VITE_DECOLECTA_TOKEN)
- [x] Todos los fallback URLs apuntan a cPanel
- [x] Variables `mockApi` renombradas a nombres apropiados
- [x] Comentarios legacy/mock eliminados
- [x] Archivos mock/dead code eliminados (12 archivos)
- [x] Build TypeScript + Vite exitoso (0 errores)
- [x] Network tab verificado: Storefront (13 requests) + Tenant (29 requests) = 100% cPanel
- [x] Documentacion generada
