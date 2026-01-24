# 📋 Análisis Frontend → Backend - Estrategia de Implementación

**Fecha**: 24 de Enero, 2026  
**Estado**: Análisis completo de endpoints necesarios

---

## 🎯 RESUMEN EJECUTIVO

El frontend está **completamente desarrollado** con 11 módulos funcionales que consumen una API REST en `http://localhost:3001/api`. El backend debe implementarse siguiendo las especificaciones del frontend existente.

### Base URL
```
http://localhost:3001/api
```

---

## 📦 MÓDULOS FRONTEND IMPLEMENTADOS

### 1. **AUTH** - Autenticación y Autorización
- Login/Register/Logout
- Gestión de tokens (JWT)
- Verificación de sesiones
- Permisos de usuario

### 2. **USERS** - Gestión de Usuarios
- CRUD completo de usuarios
- Roles y permisos
- Activación/Desactivación
- Actividad de usuarios

### 3. **PRODUCTS** - Gestión de Productos
- CRUD de productos
- Categorías de productos
- Unidades de medida
- Búsqueda y filtros
- Stock inicial

### 4. **INVENTORY** - Gestión de Inventario
- Listado de stock por almacén
- Kardex de movimientos
- Ajustes de inventario
- Alertas de stock bajo
- Motivos de movimiento

### 5. **PURCHASES** - Gestión de Compras
- Órdenes de compra
- Recepciones de compra
- Proveedores
- Estadísticas de compras

### 6. **SALES** - Gestión de Ventas
- Realizar ventas
- Cotizaciones
- Gestión de caja
- Historial de ventas
- Métodos de pago

### 7. **CLIENTS** - Gestión de Clientes
- CRUD de clientes/proveedores
- Búsqueda y filtros
- Ubigeo (Departamento/Provincia/Distrito)
- Conversión cliente ↔ proveedor

### 8. **CONFIGURATION** - Configuración
- Datos de empresa
- Comprobantes
- Métodos de pago
- Categorías de productos
- Unidades de medida

### 9. **REPORTS** - Reportes
- Reporte de ventas
- Reporte de compras
- Reporte de inventario
- Reporte financiero
- Reporte de caja

### 10. **AUDIT** - Auditoría
- Logs del sistema
- Actividades de usuarios
- Eventos del sistema
- Filtros por fecha/módulo/acción

### 11. **DASHBOARD** - Panel Principal
- Estadísticas generales
- Gráficos y métricas
- Actividad reciente

---

## 🔌 ENDPOINTS NECESARIOS (Por Módulo)

### 🔐 1. AUTENTICACIÓN (`/auth`)

```typescript
POST   /auth/login              // Login de usuario
POST   /auth/register           // Registro de usuario
POST   /auth/logout             // Cerrar sesión
GET    /auth/me                 // Obtener usuario actual
GET    /auth/health             // Health check de autenticación
POST   /auth/refresh            // Refrescar token
```

**Modelo de datos:**
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  permissions?: string[];
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

---

### 👥 2. USUARIOS (`/usuarios`)

```typescript
GET    /usuarios                // Listar usuarios (con filtros)
GET    /usuarios/:id            // Obtener usuario por ID
POST   /usuarios                // Crear usuario
PUT    /usuarios/:id            // Actualizar usuario
DELETE /usuarios/:id            // Eliminar usuario
PATCH  /usuarios/:id/status     // Cambiar estado (activo/inactivo)
GET    /usuarios/activity       // Actividad reciente de usuarios
```

**Query params para GET /usuarios:**
```
?estado=activo|inactivo
&rol=admin|usuario|vendedor
&q=search_term
&page=1
&limit=10
```

---

### 📦 3. PRODUCTOS (`/productos`)

```typescript
GET    /productos               // Listar productos (con filtros)
GET    /productos/:codigo       // Obtener por código
POST   /productos               // Crear producto
PUT    /productos/:codigo       // Actualizar producto
DELETE /productos/:codigo       // Eliminar producto
PATCH  /productos/:codigo/status // Cambiar estado
GET    /productos/search        // Búsqueda para autocomplete
```

**Query params:**
```
?categoria=id
&estado=true|false
&unidadMedida=id
&q=search_term
&minPrecio=0
&maxPrecio=1000
&minStock=0
&maxStock=100
&page=1
&limit=10
```

**Modelo:**
```typescript
interface Product {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precioVenta: number;
  estado: boolean;
  unidadMedida: string;
  stockInitial?: { warehouseId: string; cantidad: number };
}
```

---

### 📊 4. INVENTARIO (`/inventario`)

```typescript
GET    /inventario/stock        // Stock por almacén
GET    /inventario/kardex       // Movimientos de kardex
POST   /inventario/ajustes      // Crear ajuste de inventario
GET    /inventario/alertas      // Alertas de stock bajo
GET    /productos/search        // Búsqueda de productos
```

**Query params para stock:**
```
?almacenId=id
&productoId=id
&categoria=id
&estado=activo|inactivo
&stockMin=0
&stockMax=100
```

**Query params para kardex:**
```
?productoId=id
&almacenId=id
&tipoMovimiento=entrada|salida|ajuste|traspaso
&fechaInicio=YYYY-MM-DD
&fechaFin=YYYY-MM-DD
```

---

### 🏢 5. ALMACENES (`/almacenes`)

```typescript
GET    /almacenes               // Listar almacenes
GET    /almacenes/:id           // Obtener almacén por ID
POST   /almacenes               // Crear almacén
PUT    /almacenes/:id           // Actualizar almacén
DELETE /almacenes/:id           // Eliminar almacén (soft delete)
POST   /almacenes/:id/activate  // Reactivar almacén
```

**Modelo:**
```typescript
interface Warehouse {
  id: string;
  codigo: string;
  nombre: string;
  direccion?: string;
  responsable?: string;
  activo: boolean;
  esPrincipal?: boolean;
}
```

---

### 🔄 6. MOTIVOS DE MOVIMIENTO (`/movement-reasons`)

```typescript
GET    /movement-reasons        // Listar motivos
GET    /movement-reasons/:id    // Obtener por ID
POST   /movement-reasons        // Crear motivo
PUT    /movement-reasons/:id    // Actualizar motivo
DELETE /movement-reasons/:id    // Eliminar motivo
PATCH  /movement-reasons/:id/toggle // Activar/desactivar
```

---

### 🛒 7. COMPRAS - ÓRDENES (`/compras/ordenes`)

```typescript
GET    /compras/ordenes         // Listar órdenes de compra
GET    /compras/ordenes/:id     // Obtener orden por ID
POST   /compras/ordenes         // Crear orden
PUT    /compras/ordenes/:id     // Actualizar orden
DELETE /compras/ordenes/:id     // Eliminar orden
PATCH  /compras/ordenes/:id/status // Cambiar estado
GET    /compras/ordenes/:id/pdf // Descargar PDF
GET    /compras/ordenes/estadisticas // Estadísticas
```

**Query params:**
```
?estado=PENDIENTE|ENVIADA|CONFIRMADA|PARCIAL|EN_RECEPCION|COMPLETADA|CANCELADA
&proveedorId=id
&almacenId=id
&fechaInicio=YYYY-MM-DD
&fechaFin=YYYY-MM-DD
&search=term
&page=1
&pageSize=10
```

**Modelo:**
```typescript
interface PurchaseOrder {
  id: string;
  codigo: string;
  proveedorId: string;
  almacenDestinoId: string;
  fecha: string;
  fechaEntregaEsperada?: string;
  estado: PurchaseOrderStatus;
  subtotal: number;
  impuestos: number;
  descuentos: number;
  total: number;
  observaciones?: string;
  items: PurchaseOrderItem[];
}
```

---

### 📥 8. COMPRAS - RECEPCIONES (`/compras/recepciones`)

```typescript
GET    /compras/recepciones     // Listar recepciones
GET    /compras/recepciones/:id // Obtener recepción por ID
POST   /compras/recepciones     // Crear recepción
PATCH  /compras/recepciones/:id/confirm // Confirmar recepción
PATCH  /compras/recepciones/:id/cancel  // Cancelar recepción
GET    /compras/recepciones/pendientes/:ordenId // Recepciones pendientes de una orden
GET    /compras/recepciones/:id/pdf // PDF de recepción
```

**Modelo:**
```typescript
interface PurchaseReceipt {
  id: string;
  codigo: string;
  ordenCompraId: string;
  almacenId: string;
  fechaRecepcion: string;
  recibidoPorId: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  observaciones?: string;
  items: PurchaseReceiptItem[];
}
```

---

### 💰 9. VENTAS (`/sales`, `/ventas`)

```typescript
GET    /sales                   // Listar ventas
GET    /sales/:id               // Obtener venta por ID
POST   /sales                   // Crear venta
GET    /ventas/estadisticas     // Estadísticas de ventas
```

**Query params:**
```
?estado=Pendiente|Completada|Cancelada
&cashSessionId=id
&clienteId=id
&almacenId=id
&fechaInicio=YYYY-MM-DD
&fechaFin=YYYY-MM-DD
&q=search_term
```

---

### 🏷️ 10. CLIENTES/PROVEEDORES (`/clientes`)

```typescript
GET    /clientes                // Listar clientes
GET    /clientes/:id            // Obtener cliente por ID
POST   /clientes                // Crear cliente
PUT    /clientes/:id            // Actualizar cliente
DELETE /clientes/:id            // Eliminar cliente (soft delete)
POST   /clientes/:id/reactivate // Reactivar cliente
```

**Query params:**
```
?tipo=cliente|proveedor|ambos
&tipoDocumento=DNI|RUC|Pasaporte
&estado=activo|inactivo
&departamentoId=id
&provinciaId=id
&distritoId=id
&q=search_term
&page=1
&limit=10
```

---

### 🌍 11. UBIGEO (Perú)

```typescript
GET    /ubigeo/departamentos    // Listar departamentos
GET    /ubigeo/provincias/:departamentoId // Provincias de un departamento
GET    /ubigeo/distritos/:provinciaId     // Distritos de una provincia
```

---

### ⚙️ 12. CONFIGURACIÓN (`/configuracion`)

```typescript
// Empresa
GET    /configuracion/empresa   // Obtener datos de empresa
PUT    /configuracion/empresa   // Actualizar empresa

// Comprobantes
GET    /configuracion/comprobantes       // Listar comprobantes
POST   /configuracion/comprobantes       // Crear comprobante
PUT    /configuracion/comprobantes/:id   // Actualizar comprobante
DELETE /configuracion/comprobantes/:id   // Eliminar comprobante

// Métodos de Pago
GET    /configuracion/metodos-pago       // Listar métodos
POST   /configuracion/metodos-pago       // Crear método
PUT    /configuracion/metodos-pago/:id   // Actualizar método
DELETE /configuracion/metodos-pago/:id   // Eliminar método

// Categorías
GET    /configuracion/categorias         // Listar categorías
GET    /configuracion/categorias/:id     // Obtener por ID
POST   /configuracion/categorias         // Crear categoría
PUT    /configuracion/categorias/:id     // Actualizar categoría
DELETE /configuracion/categorias/:id     // Soft delete
DELETE /configuracion/categorias/:id/hard // Hard delete

// Unidades de Medida
GET    /configuracion/unidades           // Listar unidades
GET    /configuracion/unidades/:id       // Obtener por ID
POST   /configuracion/unidades           // Crear unidad
PUT    /configuracion/unidades/:id       // Actualizar unidad
DELETE /configuracion/unidades/:id       // Soft delete
DELETE /configuracion/unidades/:id/hard  // Hard delete
```

---

### 📈 13. REPORTES (`/reportes`)

```typescript
GET    /reportes/ventas         // Reporte de ventas
GET    /reportes/compras        // Reporte de compras
GET    /reportes/inventario     // Reporte de inventario
GET    /reportes/financiero     // Reporte financiero
GET    /reportes/caja           // Reporte de caja
```

**Query params comunes:**
```
?fechaInicio=YYYY-MM-DD
&fechaFin=YYYY-MM-DD
&almacenId=id
&usuarioId=id
&cajaId=id
```

---

### 🔍 14. AUDITORÍA (`/audit`)

```typescript
GET    /audit/logs              // Logs del sistema
GET    /audit/user-activities   // Actividades de usuarios
GET    /audit/system-events     // Eventos del sistema
GET    /audit/stats             // Estadísticas de auditoría
```

**Query params:**
```
?usuarioId=id
&modulo=auth|productos|ventas|compras|inventario
&accion=CREATE|READ|UPDATE|DELETE|LOGIN|LOGOUT
&fechaInicio=YYYY-MM-DD
&fechaFin=YYYY-MM-DD
&page=1
&limit=50
```

**Modelo:**
```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  modulo: string;
  accion: string;
  entidad: string;
  entidadId?: string;
  detalles?: any;
  ip?: string;
  userAgent?: string;
}
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS NECESARIA

### Tablas Principales

1. **users** - Usuarios del sistema
2. **productos** - Productos
3. **categorias** - Categorías de productos
4. **unidades_medida** - Unidades de medida
5. **almacenes** - Almacenes/bodegas
6. **inventario_stock** - Stock actual por producto/almacén
7. **inventario_kardex** - Movimientos de inventario
8. **motivos_movimiento** - Catálogo de motivos
9. **clientes** - Clientes y proveedores
10. **ordenes_compra** - Órdenes de compra
11. **ordenes_compra_items** - Detalle de órdenes
12. **recepciones_compra** - Recepciones
13. **recepciones_compra_items** - Detalle de recepciones
14. **ventas** - Ventas realizadas
15. **ventas_items** - Detalle de ventas
16. **caja_sesiones** - Sesiones de caja
17. **comprobantes** - Tipos de comprobante
18. **metodos_pago** - Métodos de pago
19. **empresa** - Datos de la empresa
20. **ubigeo_departamentos** - Departamentos
21. **ubigeo_provincias** - Provincias
22. **ubigeo_distritos** - Distritos
23. **audit_logs** - Logs de auditoría

---

## 🎯 ESTRATEGIA DE IMPLEMENTACIÓN RECOMENDADA

### FASE 1: INFRAESTRUCTURA BÁSICA (Semana 1)
**Prioridad: ALTA** 🔴

```
✅ Setup inicial del proyecto Backend
  - Node.js + Express/NestJS
  - PostgreSQL/MySQL
  - TypeScript
  - Estructura de carpetas

✅ Configuración de Base de Datos
  - Migraciones
  - Seeders (datos iniciales)
  - ORM (Prisma/TypeORM/Sequelize)

✅ Autenticación JWT
  - POST /auth/login
  - POST /auth/register
  - GET /auth/me
  - Middleware de autenticación

✅ Sistema de Roles y Permisos
  - Tabla roles
  - Tabla permisos
  - Middleware de autorización
```

---

### FASE 2: CATÁLOGOS Y CONFIGURACIÓN (Semana 2)
**Prioridad: ALTA** 🔴

```
✅ Configuración General
  - CRUD Empresa
  - CRUD Comprobantes
  - CRUD Métodos de Pago
  - CRUD Categorías
  - CRUD Unidades de Medida

✅ Ubigeo (Perú)
  - Endpoints de departamentos/provincias/distritos
  - Cargar data de Ubigeo

✅ Almacenes
  - CRUD completo de almacenes
  - Activación/desactivación
```

---

### FASE 3: GESTIÓN DE PRODUCTOS (Semana 3)
**Prioridad: ALTA** 🔴

```
✅ Módulo de Productos
  - CRUD completo
  - Búsqueda y filtros
  - Validaciones de negocio
  - Relación con categorías/unidades

✅ Clientes/Proveedores
  - CRUD completo
  - Filtros por tipo
  - Búsqueda
  - Soft delete
```

---

### FASE 4: INVENTARIO (Semana 4)
**Prioridad: ALTA** 🔴

```
✅ Stock de Inventario
  - GET /inventario/stock
  - Vistas por almacén
  - Alertas de stock bajo

✅ Kardex de Movimientos
  - GET /inventario/kardex
  - Registro de movimientos
  - Trazabilidad completa

✅ Ajustes de Inventario
  - POST /inventario/ajustes
  - Motivos de movimiento
  - Validaciones de stock

✅ Motivos de Movimiento
  - CRUD completo
```

---

### FASE 5: MÓDULO DE COMPRAS (Semana 5-6)
**Prioridad: MEDIA** 🟡

```
✅ Órdenes de Compra
  - CRUD completo
  - Cambio de estados
  - Cálculos de totales
  - Validaciones de negocio
  - PDF de orden

✅ Recepciones de Compra
  - Crear recepción
  - Confirmar/Cancelar
  - Actualizar stock automáticamente
  - Vincular con órdenes
  - PDF de recepción

✅ Estadísticas de Compras
```

---

### FASE 6: MÓDULO DE VENTAS (Semana 7)
**Prioridad: MEDIA** 🟡

```
✅ Ventas
  - Crear venta
  - Consultar ventas
  - Descuento de stock
  - Cálculos con IGV

✅ Gestión de Caja
  - Apertura/Cierre de caja
  - Movimientos de caja
  - Cuadre de caja

✅ Cotizaciones
  - CRUD de cotizaciones
  - Conversión a venta
```

---

### FASE 7: REPORTES Y AUDITORÍA (Semana 8)
**Prioridad: BAJA** 🟢

```
✅ Reportes
  - Ventas por período
  - Compras por período
  - Inventario valorizado
  - Reporte financiero
  - Reporte de caja

✅ Sistema de Auditoría
  - Logs automáticos
  - Actividades de usuarios
  - Eventos del sistema
  - Filtros y búsquedas
```

---

### FASE 8: OPTIMIZACIÓN Y TESTING (Semana 9-10)
**Prioridad: MEDIA** 🟡

```
✅ Tests Unitarios
  - Servicios críticos
  - Validaciones de negocio

✅ Tests de Integración
  - Flujos completos
  - Endpoints críticos

✅ Optimización de Queries
  - Índices en BD
  - Paginación eficiente
  - Cache donde sea necesario

✅ Documentación
  - Swagger/OpenAPI
  - README técnico
  - Guía de deployment
```

---

## 🛠️ STACK TECNOLÓGICO RECOMENDADO

### Backend
- **Runtime**: Node.js 18+
- **Framework**: NestJS (recomendado) o Express
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL 14+
- **ORM**: Prisma (recomendado) o TypeORM
- **Auth**: JWT + bcrypt
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger/OpenAPI

### Herramientas
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Logs**: Winston
- **Monitoreo**: PM2

---

## 📋 FORMATO DE RESPUESTA ESTÁNDAR

Todas las respuestas del backend deben seguir este formato:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
```

### Éxito
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error al procesar la solicitud",
  "error": "Detalles del error"
}
```

### Paginación
```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
```

---

## 🔒 SEGURIDAD

### Implementar
1. **JWT Authentication** con refresh tokens
2. **CORS** configurado correctamente
3. **Rate Limiting** para prevenir ataques
4. **Helmet** para headers de seguridad
5. **Validación de inputs** en todos los endpoints
6. **SQL Injection prevention** (usar ORM)
7. **XSS protection**
8. **HTTPS** en producción
9. **Variables de entorno** para secretos
10. **Auditoría** de todas las operaciones críticas

---

## 📝 NOTAS IMPORTANTES

### Validaciones de Negocio Críticas

1. **Inventario**: No permitir stock negativo
2. **Compras**: Validar que el proveedor exista
3. **Ventas**: Validar stock disponible antes de vender
4. **Recepciones**: Solo recibir de órdenes CONFIRMADAS
5. **Productos**: Código único
6. **Usuarios**: Email único
7. **Almacenes**: Código único

### Cálculos Importantes

1. **IGV**: 18% (configurable en empresa)
2. **Subtotal**: suma de (cantidad × precioUnitario)
3. **Impuestos**: subtotal × (igvPorcentaje / 100)
4. **Descuentos**: aplicar antes de impuestos
5. **Total**: subtotal + impuestos - descuentos

---

## 🚀 COMANDO DE INICIO

Una vez implementado el backend:

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start:prod
```

**Puerto**: `3001` (http://localhost:3001/api)

---

## ✅ CHECKLIST DE COMPLETITUD

- [ ] Setup inicial del proyecto
- [ ] Base de datos configurada
- [ ] Autenticación JWT
- [ ] CRUD Usuarios
- [ ] CRUD Productos
- [ ] CRUD Categorías/Unidades
- [ ] CRUD Almacenes
- [ ] Sistema de Stock
- [ ] Sistema de Kardex
- [ ] Ajustes de Inventario
- [ ] CRUD Clientes/Proveedores
- [ ] Ubigeo endpoints
- [ ] Órdenes de Compra
- [ ] Recepciones de Compra
- [ ] Ventas
- [ ] Gestión de Caja
- [ ] Configuración
- [ ] Reportes
- [ ] Sistema de Auditoría
- [ ] Tests
- [ ] Documentación Swagger
- [ ] Deploy en servidor

---

## 🎯 PRIORIDAD DE DESARROLLO

### 🔴 CRÍTICO (Hacer primero)
1. Autenticación
2. Productos
3. Inventario (Stock + Kardex)
4. Almacenes

### 🟡 IMPORTANTE (Hacer segundo)
5. Compras
6. Ventas
7. Clientes/Proveedores

### 🟢 COMPLEMENTARIO (Hacer tercero)
8. Reportes
9. Auditoría
10. Optimizaciones

---

## 📞 CONTACTO Y SOPORTE

Para dudas sobre la implementación del backend basándose en este análisis, revisar:
- Frontend: `c:\Dev\proyecto-monorepo\frontend\`
- Servicios API: `frontend\src\utils\api.ts`
- Módulos: `frontend\src\modules\[nombre-modulo]\services\`

---

**FIN DEL ANÁLISIS** ✅
