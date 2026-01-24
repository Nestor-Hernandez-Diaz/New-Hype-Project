# 📡 Documentación de API - AlexaTech Backend

> **Generado desde el frontend existente**  
> Este documento contiene TODOS los endpoints que el frontend espera del backend.  
> Úsalo como especificación para desarrollar tu API REST.

---

## 🎯 Información General

- **Base URL**: `http://localhost:3001/api`
- **Autenticación**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **Respuesta estándar**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
```

---

## 🔐 Autenticación (`/auth`)

### POST `/auth/login`
Iniciar sesión
```typescript
// Request
{
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Response
{
  success: true,
  message: "Login exitoso",
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
      permissions?: string[];
    },
    accessToken: string;
    refreshToken: string;
  }
}
```

### POST `/auth/register`
Registrar nuevo usuario
```typescript
// Request
{
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Response: Same as login
```

### POST `/auth/refresh`
Refrescar token
```typescript
// Request
{
  refreshToken: string;
}

// Response: Same as login
```

### POST `/auth/logout`
Cerrar sesión
```typescript
// Request: (empty, usa Authorization header)
// Response
{
  success: true,
  message: "Logout exitoso"
}
```

### GET `/auth/me`
Obtener usuario actual
```typescript
// Response
{
  success: true,
  data: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    role?: {
      id: string;
      name: string;
      permissions: string[];
    }
  }
}
```

### POST `/auth/validate-token`
Validar token
```typescript
// Request
{
  token: string;
}

// Response
{
  success: boolean,
  message: string
}
```

### GET `/auth/check-email/:email`
Verificar si email existe
```typescript
// Response
{
  success: true,
  data: {
    exists: boolean
  }
}
```

### GET `/auth/health`
Health check de autenticación

---

## 📦 Productos (`/productos`)

### GET `/productos`
Listar productos con filtros
```typescript
// Query params
{
  categoria?: string;
  estado?: boolean;
  unidadMedida?: string;
  q?: string;               // Búsqueda general
  minPrecio?: number;
  maxPrecio?: number;
  minStock?: number;
  maxStock?: number;
  page?: number;
  limit?: number;
}

// Response
{
  success: true,
  data: {
    products: Product[];
    total: number;
    filters: Record<string, any>;
    pagination?: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }
  }
}
```

### POST `/productos`
Crear producto
```typescript
// Request
{
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precioVenta: number;
  estado?: boolean;
  unidadMedida: string;
  stockInitial?: {
    warehouseId: string;
    cantidad: number;
  }
}
```

### GET `/productos/:codigo`
Obtener producto por código

### PUT `/productos/:codigo`
Actualizar producto
```typescript
// Request
{
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  precioVenta?: number;
  estado?: boolean;
  unidadMedida?: string;
}
```

### PATCH `/productos/:codigo/status`
Actualizar estado del producto
```typescript
// Request
{
  estado: boolean
}
```

### DELETE `/productos/:codigo`
Eliminar producto (soft delete)

---

## 🛒 Compras (`/compras`)

### GET `/compras/ordenes`
Listar órdenes de compra
```typescript
// Query params
{
  estado?: 'Pendiente' | 'Recibida' | 'Cancelada';
  proveedorId?: string;
  almacenId?: string;
  fechaInicio?: string;  // ISO date
  fechaFin?: string;     // ISO date
  q?: string;
  page?: number;
  limit?: number;
}

// Response
{
  success: true,
  data: {
    purchases: Purchase[];
    total: number;
    filters: Record<string, any>;
  }
}
```

### POST `/compras/ordenes`
Crear orden de compra
```typescript
// Request
{
  proveedorId: string;
  almacenId: string;
  fechaEmision: string;
  tipoComprobante?: string;
  items: Array<{
    productoId: string;
    nombreProducto?: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  formaPago?: string;
  observaciones?: string;
  fechaEntregaEstimada?: string;
  descuento?: number;
}
```

### GET `/compras/ordenes/:id`
Obtener orden de compra por ID

### PUT `/compras/ordenes/:id`
Actualizar orden de compra

### PATCH `/compras/ordenes/:id/estado`
Actualizar estado de la orden
```typescript
// Request
{
  estado: string;
}
```

### DELETE `/compras/ordenes/:id`
Eliminar orden de compra

---

## 💰 Ventas (`/sales`)

### GET `/sales`
Listar ventas
```typescript
// Query params
{
  estado?: 'Pendiente' | 'Completada' | 'Cancelada';
  cashSessionId?: string;
  clienteId?: string;
  almacenId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  q?: string;
}

// Response
{
  success: true,
  data: {
    sales: Sale[];
  }
}
```

---

## 👥 Usuarios (`/users`)

### GET `/users`
Listar usuarios
```typescript
// Query params
{
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// Response
{
  success: true,
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }
  }
}
```

### GET `/users/:id`
Obtener usuario por ID

### POST `/users`
Crear usuario
```typescript
// Request
{
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
```

### PUT `/users/:id`
Actualizar usuario completo

### PATCH `/users/:id`
Actualizar usuario parcial

### PATCH `/users/:id/status`
Cambiar estado del usuario
```typescript
// Request
{
  isActive: boolean;
}
```

### DELETE `/users/:id`
Eliminar usuario

### PATCH `/users/:id/change-password`
Cambiar contraseña
```typescript
// Request
{
  currentPassword: string;
  newPassword: string;
}
```

---

## 🏢 Entidades Comerciales (`/entidades`)

Clientes, Proveedores o Ambos

### GET `/entidades`
Listar entidades
```typescript
// Query params
{
  page?: number;
  limit?: number;
  search?: string;
  tipoEntidad?: 'Cliente' | 'Proveedor' | 'Ambos';
  tipoDocumento?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  includeInactive?: boolean;
}

// Response
{
  success: true,
  data: {
    clients: Entity[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalClients: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }
  }
}
```

### GET `/entidades/:id`
Obtener entidad por ID

### POST `/entidades`
Crear entidad
```typescript
// Request
{
  tipoEntidad: 'Cliente' | 'Proveedor' | 'Ambos';
  tipoDocumento: 'DNI' | 'CE' | 'RUC' | 'Pasaporte';
  numeroDocumento: string;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  email: string;
  telefono: string;
  direccion: string;
  departamentoId: string;
  provinciaId: string;
  distritoId: string;
  ciudad?: string;
}
```

### PUT `/entidades/:id`
Actualizar entidad

### DELETE `/entidades/:id`
Eliminar entidad (soft delete)

### POST `/entidades/:id/reactivate`
Reactivar entidad eliminada

---

## 🗺️ Ubigeo (Perú) (`/ubigeo`)

### GET `/ubigeo/departamentos`
Listar departamentos
```typescript
// Response
{
  success: true,
  data: {
    departamentos: Array<{
      id: string;
      nombre: string;
    }>
  }
}
```

### GET `/ubigeo/departamentos/:id/provincias`
Listar provincias de un departamento
```typescript
// Response
{
  success: true,
  data: {
    provincias: Array<{
      id: string;
      nombre: string;
      departamentoId: string;
    }>
  }
}
```

### GET `/ubigeo/provincias/:id/distritos`
Listar distritos de una provincia
```typescript
// Response
{
  success: true,
  data: {
    distritos: Array<{
      id: string;
      nombre: string;
      provinciaId: string;
    }>
  }
}
```

---

## 📊 Inventario (`/inventario` o `/inventory`)

### GET `/inventario/stock`
Obtener stock actual
```typescript
// Query params
{
  almacenId?: string;
  productoId?: string;
  q?: string;
  stockBajo?: boolean;
  page?: number;
  limit?: number;
}
```

### GET `/inventario/kardex`
Obtener kardex (movimientos)
```typescript
// Query params
{
  productoId?: string;
  almacenId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  tipoMovimiento?: string;
}
```

### GET `/inventario/alertas`
Obtener alertas de stock
```typescript
// Response
{
  success: true,
  data: {
    stockBajo: StockItem[];
    stockCritico: StockItem[];
  }
}
```

---

## 🏪 Almacenes (`/warehouses` o `/almacenes`)

### GET `/warehouses`
Listar almacenes
```typescript
// Response
{
  success: true,
  data: {
    warehouses: Array<{
      id: string;
      codigo: string;
      nombre: string;
      activo: boolean;
    }>
  }
}
```

### GET `/almacenes`
Listar almacenes (alias)
```typescript
// Query params
{
  activo?: boolean;
  q?: string;
}
```

### GET `/almacenes/:id`
Obtener almacén por ID

### POST `/almacenes`
Crear almacén

### PUT `/almacenes/:id`
Actualizar almacén

### DELETE `/almacenes/:id`
Eliminar almacén

---

## ⚙️ Configuración (`/configuracion`)

### Categorías de Productos

#### GET `/configuracion/categorias`
```typescript
// Query params
{
  activo?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}
```

#### GET `/configuracion/categorias/activas`
Obtener solo categorías activas

#### GET `/configuracion/categorias/:id`
Obtener categoría por ID

#### POST `/configuracion/categorias`
Crear categoría

#### PUT `/configuracion/categorias/:id`
Actualizar categoría

#### DELETE `/configuracion/categorias/:id`
Eliminar categoría

### Unidades de Medida

#### GET `/configuracion/unidades`
Listar unidades de medida

#### GET `/configuracion/unidades/activas`
Obtener solo unidades activas

#### GET `/configuracion/unidades/:id`
Obtener unidad por ID

#### POST `/configuracion/unidades`
Crear unidad

#### PUT `/configuracion/unidades/:id`
Actualizar unidad

#### DELETE `/configuracion/unidades/:id`
Eliminar unidad

### Motivos de Movimiento

#### GET `/configuracion/motivos-movimiento`
Listar motivos de movimiento de inventario

#### GET `/configuracion/motivos-movimiento/:id`
Obtener motivo por ID

#### POST `/configuracion/motivos-movimiento`
Crear motivo

#### PUT `/configuracion/motivos-movimiento/:id`
Actualizar motivo

#### DELETE `/configuracion/motivos-movimiento/:id`
Eliminar motivo

---

## 📈 Reportes (`/reportes`)

### GET `/reportes/ventas`
Reporte de ventas
```typescript
// Query params
{
  fechaInicio?: string;
  fechaFin?: string;
  almacenId?: string;
  usuarioId?: string;
}
```

### GET `/reportes/compras`
Reporte de compras
```typescript
// Query params
{
  fechaInicio?: string;
  fechaFin?: string;
}
```

### GET `/reportes/inventario`
Reporte de inventario
```typescript
// Query params
{
  almacenId?: string;
}
```

### GET `/reportes/financiero`
Reporte financiero
```typescript
// Query params
{
  fechaInicio?: string;
  fechaFin?: string;
}
```

### GET `/reportes/caja`
Reporte de caja
```typescript
// Query params
{
  fechaInicio?: string;
  fechaFin?: string;
  cajaId?: string;
}
```

---

## 📝 Auditoría (`/audit`)

### GET `/audit/my-activity`
Obtener actividad del usuario actual
```typescript
// Query params
{
  limit?: number;  // default: 10
}
```

### GET `/audit/logs`
Obtener logs de auditoría
```typescript
// Query params
{
  userId?: string;
  action?: string;
  entityType?: string;
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  limit?: number;
}
```

### GET `/audit/user/:userId/activity`
Obtener actividad de un usuario específico

### GET `/audit/system-events`
Obtener eventos del sistema

---

## 🏥 Health Checks

### GET `/health`
Health check general de la API

### GET `/auth/health`
Health check de autenticación

---

## 🔒 Permisos Requeridos

El sistema usa un sistema de permisos basado en roles. Permisos comunes:

```typescript
// Dashboard
'dashboard.read'

// Productos
'products.read'
'products.create'
'products.update'
'products.delete'

// Ventas
'sales.read'
'sales.create'
'sales.update'
'sales.delete'

// Compras
'purchases.read'
'purchases.create'
'purchases.update'

// Inventario
'inventory.read'
'inventory.create'
'inventory.update'

// Clientes/Entidades
'clients.read'
'clients.create'
'clients.update'
'clients.delete'
'commercial_entities.read'
'commercial_entities.create'
'commercial_entities.update'

// Usuarios
'users.read'
'users.create'
'users.update'
'users.delete'

// Reportes
'reports.read'
'reports.export'

// Configuración
'configuracion.read'
'configuracion.update'

// Auditoría
'auditoria.read'
```

---

## 🎨 Convenciones

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Códigos de Estado HTTP
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Manejo de Errores
```typescript
{
  success: false,
  message: "Descripción del error",
  error: "ERROR_CODE"
}
```

### Paginación
```typescript
{
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

---

## 🚀 Siguiente Paso

**Con esta documentación puedes:**

1. ✅ Desarrollar el backend con la especificación exacta
2. ✅ Usar herramientas como Swagger/OpenAPI
3. ✅ Implementar con Node.js + Express, NestJS, etc.
4. ✅ Crear tests basados en estos contratos

**Stack recomendado para el backend:**
- Node.js + Express/NestJS
- PostgreSQL/MySQL
- Prisma ORM
- JWT para autenticación
- TypeScript
