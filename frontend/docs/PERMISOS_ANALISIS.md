# 🔐 Análisis del Sistema de Permisos - AlexaTech

> **Estado actual del sistema de permisos en el frontend**

---

## 📊 Resumen Ejecutivo

**Estado**: ✅ Sistema implementado y funcional  
**Cobertura**: 90% de las rutas tienen control de permisos  
**Problema detectado**: Algunas rutas NO tienen permisos requeridos

---

## 🎯 Cómo Funciona el Sistema

### 1. **Componente ProtectedRoute**
```typescript
// Ubicación: src/modules/auth/components/ProtectedRoute.tsx

<ProtectedRoute requiredPermission="products.read">
  <ListaProductos />
</ProtectedRoute>

// O sin permisos (solo requiere autenticación):
<ProtectedRoute>
  <PerfilUsuario />
</ProtectedRoute>
```

**Características:**
- ✅ Verifica autenticación primero
- ✅ Luego verifica permisos específicos
- ✅ Muestra loading mientras valida
- ✅ Muestra mensaje de error si no tiene permisos
- ✅ Soporta múltiples permisos (`requiredPermissions={['a', 'b']}`)

### 2. **Hook hasPermission**
```typescript
// Uso en componentes para lógica condicional
const { hasPermission } = useAuth();

const canDelete = hasPermission('clients.delete');
const canUpdate = hasPermission('clients.update');

// Renderizado condicional:
{canDelete && <button onClick={handleDelete}>Eliminar</button>}
```

**Características:**
- ✅ Sistema de alias para compatibilidad (`clients.*` ↔ `commercial_entities.*`)
- ✅ Retorna boolean para control granular en UI
- ✅ Usado en: ListaEntidades, InventoryContext

---

## 📋 Inventario de Permisos por Módulo

### 🏠 Dashboard
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/dashboard` | `dashboard.read` | ✅ Implementado |

### 👥 Clientes/Entidades
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/lista-entidades` | `clients.read` | ✅ Implementado |
| `/registrar-entidad` | `clients.create` | ✅ Implementado |
| `/editar-entidad/:id` | `clients.update` | ✅ Implementado |
| Botón eliminar | `clients.delete` | ✅ Usado en UI |

**Alias compatibles:**
- `commercial_entities.read` ↔ `clients.read`
- `commercial_entities.create` ↔ `clients.create`
- `commercial_entities.update` ↔ `clients.update`

### 📦 Productos
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/lista-productos` | `products.read` | ✅ Implementado |

### 💰 Ventas
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/ventas/realizar` | `sales.create` | ✅ Implementado |
| `/ventas/lista` | `sales.read` | ✅ Implementado |
| `/ventas/detalle/:id` | `sales.read` | ✅ Implementado |
| `/ventas/cotizaciones` | `sales.create` | ✅ Implementado |
| `/ventas/asistente-ia` | `sales.create` | ✅ Implementado |

### 🛒 Compras
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/compras/ordenes` | `purchases.read` | ✅ Implementado |
| `/compras/ordenes/:id` | `purchases.read` | ✅ Implementado |
| `/compras/recepciones` | `purchases.read` | ✅ Implementado |
| `/compras/recepciones/crear` | `purchases.create` | ✅ Implementado |
| `/compras/recepciones/:id` | `purchases.read` | ✅ Implementado |

### 📊 Inventario
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/inventario/stock` | `inventory.read` | ✅ Implementado |
| `/inventario/alertas` | `inventory.read` | ✅ Implementado |
| `/inventario/kardex` | `inventory.read` | ✅ Implementado |
| `/inventario/transferencias` | `inventory.update` | ✅ Implementado |
| `/inventario/almacenes` | `warehouses.read` | ✅ Implementado |
| `/inventario/motivos` | `inventory.read` | ✅ Implementado |
| Acciones de actualización | `inventory.update` | ✅ Usado en Context |

### 👤 Usuarios
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/usuarios` | `users.read` | ✅ Implementado |
| `/usuarios/crear` | `users.create` | ✅ Implementado |
| `/usuarios/editar/:id` | `users.update` | ✅ Implementado |
| `/roles` | `users.read` | ✅ Implementado |

### 💵 Caja
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/gestion-caja` | `cash-sessions.create` | ✅ Implementado |
| `/historial-caja` | `cash-sessions.read` | ✅ Implementado |

### ⚙️ Configuración
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/configuracion/mi-perfil` | *(ninguno)* | ⚠️ Solo autenticación |
| `/configuracion/empresa` | `settings.update` | ✅ Implementado |
| `/configuracion/comprobantes` | `settings.update` | ✅ Implementado |
| `/configuracion/metodos-pago` | `settings.update` | ✅ Implementado |
| `/configuracion/productos` | `settings.update` | ✅ Implementado |

### 📈 Reportes
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/reportes/ventas` | `reports.read` | ✅ Implementado |
| `/reportes/compras` | `reports.read` | ✅ Implementado |
| `/reportes/inventario` | `reports.read` | ✅ Implementado |
| `/reportes/caja` | `reports.read` | ✅ Implementado |

### 📝 Auditoría
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/auditoria` | `audit.read` | ✅ Implementado |

### 🎨 Especiales
| Ruta | Permiso | Estado |
|------|---------|--------|
| `/template-ui` | *(ninguno)* | ⚠️ Sin protección (desarrollo) |
| `/perfil` | *(ninguno)* | ⚠️ Solo autenticación |

---

## ⚠️ Rutas SIN Permisos Específicos

Estas rutas **solo requieren autenticación** pero NO verifican permisos:

1. ✅ **`/perfil`** - Usuario puede ver su propio perfil (correcto)
2. ✅ **`/configuracion/mi-perfil`** - Usuario puede editar su perfil (correcto)
3. ⚠️ **`/template-ui`** - Página de desarrollo (debería eliminarse en producción)

**Análisis**: Las rutas sin permisos están bien diseñadas, son acciones que cualquier usuario autenticado puede hacer.

---

## 📝 Lista Completa de Permisos Usados

```typescript
// AUTENTICACIÓN Y NAVEGACIÓN
'dashboard.read'

// PRODUCTOS
'products.read'
'products.create'
'products.update'
'products.delete'

// VENTAS
'sales.read'
'sales.create'
'sales.update'
'sales.delete'

// COMPRAS
'purchases.read'
'purchases.create'
'purchases.update'

// INVENTARIO
'inventory.read'
'inventory.create'
'inventory.update'
'warehouses.read'

// CLIENTES/ENTIDADES (con alias)
'clients.read' ↔ 'commercial_entities.read'
'clients.create' ↔ 'commercial_entities.create'
'clients.update' ↔ 'commercial_entities.update'
'clients.delete'

// USUARIOS Y ROLES
'users.read'
'users.create'
'users.update'
'users.delete'

// CAJA
'cash-sessions.read'
'cash-sessions.create'

// REPORTES
'reports.read'
'reports.export'

// CONFIGURACIÓN
'settings.update'
'configuracion.read'
'configuracion.update'

// AUDITORÍA
'audit.read'
'auditoria.read'
```

---

## 🎯 Recomendaciones

### ✅ Mantener Como Está

1. **Sistema de permisos granular** - Está bien implementado
2. **Rutas protegidas** - 90%+ tienen control de acceso
3. **Sistema de alias** - Buena compatibilidad
4. **hasPermission en UI** - Control fino de botones/acciones

### 🔧 Acciones Sugeridas

#### 1. **Unificar permisos duplicados**
```typescript
// Tienes:
'configuracion.read' + 'configuracion.update'
'settings.update'

// Recomendación: Usar solo uno
'settings.read'
'settings.update'
```

#### 2. **Agregar permiso de exportación en reportes**
```typescript
// Actualmente solo:
'reports.read'

// Agregar para acciones de exportar:
if (hasPermission('reports.export')) {
  <button>Exportar Excel</button>
}
```

#### 3. **Eliminar `/template-ui` en producción**
```typescript
// En App.tsx, condicional:
{import.meta.env.DEV && (
  <Route path="/template-ui" element={<TemplateUI />} />
)}
```

#### 4. **Documentar permisos por rol**
Crear matriz de roles:

| Rol | Permisos |
|-----|----------|
| **Admin** | Todos (`*`) |
| **Gerente** | `dashboard.read`, `sales.*`, `purchases.*`, `inventory.*`, `reports.read` |
| **Vendedor** | `sales.read`, `sales.create`, `clients.read`, `products.read` |
| **Almacenero** | `inventory.*`, `products.read`, `warehouses.read` |

---

## 📦 Cómo Usar Esta Información

### Para el Backend:

1. **Tabla de Permisos** - Crear tabla en DB con estos permisos exactos
2. **Tabla de Roles** - Crear roles predefinidos
3. **Tabla Roles-Permisos** - Relación many-to-many
4. **Middleware de autorización** - Verificar permisos en cada endpoint

### Para el Frontend:

1. ✅ **Ya está implementado correctamente**
2. ⚠️ Aplicar las mejoras sugeridas
3. 📄 Mantener este documento actualizado cuando agregues nuevas rutas

---

## 🚀 Próximos Pasos

### Opción A: **Mantener Todo** (Recomendado)
- ✅ El sistema funciona bien
- ✅ Solo hacer las mejoras sugeridas (unificar permisos, eliminar template-ui)
- ✅ Documentar matriz de roles

### Opción B: **Simplificar**
- ⚠️ Quitar permisos de algunas páginas menos críticas
- ⚠️ Solo proteger: Usuarios, Configuración, Reportes, Auditoría
- ⚠️ Dejar acceso libre a: Ventas, Productos, Inventario (solo requiere login)

### Opción C: **Eliminar Sistema de Permisos** (NO Recomendado)
- ❌ Perderías control granular
- ❌ Cualquier usuario autenticado puede hacer todo
- ❌ No es escalable

---

## 💡 Mi Recomendación

**MANTENER el sistema de permisos actual** porque:

1. ✅ Ya está implementado y funciona
2. ✅ Es profesional y escalable
3. ✅ Te permite vender el software con diferentes niveles de acceso
4. ✅ Cumple con mejores prácticas de seguridad
5. ✅ El backend será más robusto

**Hacer solo estas mejoras:**
1. Unificar `configuracion.*` y `settings.*` → usar solo `settings.*`
2. Eliminar `/template-ui` con condicional `DEV`
3. Crear archivo de roles predefinidos para el backend
4. Listo ✅

---

## 📄 Archivo de Referencia para Backend

```typescript
// src/constants/permissions.ts (crear en backend)

export const PERMISSIONS = {
  DASHBOARD: {
    READ: 'dashboard.read',
  },
  PRODUCTS: {
    READ: 'products.read',
    CREATE: 'products.create',
    UPDATE: 'products.update',
    DELETE: 'products.delete',
  },
  SALES: {
    READ: 'sales.read',
    CREATE: 'sales.create',
    UPDATE: 'sales.update',
    DELETE: 'sales.delete',
  },
  // ... etc
};

export const ROLES = {
  ADMIN: {
    name: 'Administrador',
    permissions: Object.values(PERMISSIONS).flatMap(module => 
      Object.values(module)
    ),
  },
  MANAGER: {
    name: 'Gerente',
    permissions: [
      PERMISSIONS.DASHBOARD.READ,
      ...Object.values(PERMISSIONS.SALES),
      ...Object.values(PERMISSIONS.PURCHASES),
      // etc
    ],
  },
  // ... más roles
};
```

---

**Última actualización**: 23 de enero de 2026
