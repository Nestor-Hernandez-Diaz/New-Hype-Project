# 📦 Módulo de Inventario - Refactorizado con Mock API

## 🎯 Objetivo

Este módulo ha sido refactorizado siguiendo el enfoque **"Frontend-First"** para trabajar con datos mockeados mientras se desarrolla el backend.

## 📂 Estructura

```
src/modules/inventory/
├── context/
│   └── InventoryContext.tsx       # Context con useReducer + Mock API
├── services/
│   └── inventoryMockApi.ts        # Mock API Service
├── demo/
│   └── mockApiDemo.ts             # Script de demostración
└── __tests__/
    └── mockApi.test.ts            # Tests del Mock API

packages/shared-types/src/
└── inventory.types.ts             # Tipos TypeScript compartidos
```

## 🔧 Cambios Realizados

### 1. **Tipos TypeScript (shared-types)**
- ✅ Creado `inventory.types.ts` con interfaces limpias
- ✅ Nombres de propiedades consistentes con JPA (bases de datos relacionales)
- ✅ Enums para estados y tipos de movimientos
- ✅ Interfaces para filtros, respuestas y paginación

### 2. **Mock Service**
- ✅ `inventoryMockApi.ts` con datos de prueba hardcodeados
- ✅ Simula delay de red (500ms)
- ✅ Implementa filtrado, paginación y búsqueda
- ✅ CRUD completo para ajustes de inventario
- ✅ Actualización local del estado

### 3. **Context Refactorizado**
- ✅ Usa `useReducer` para gestión de estado predecible
- ✅ Acciones tipadas con TypeScript
- ✅ Integrado con el Mock API
- ✅ Manejo de errores robusto
- ✅ Compatibilidad con permisos del sistema de auth

## 🚀 Cómo Usar

### En Componentes React

```typescript
import { useInventory } from '@/modules/inventory';

function MiComponente() {
  const { 
    stockItems, 
    loading, 
    fetchStock,
    crearAjuste 
  } = useInventory();

  useEffect(() => {
    fetchStock({ almacenId: 'WH-PRINCIPAL' });
  }, []);

  return (
    <div>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {stockItems.map(item => (
            <li key={item.stockByWarehouseId}>
              {item.codigo} - {item.nombre} ({item.cantidad} und.)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Desde la Consola del Navegador

```javascript
// 1. Importa la demo (si está en el bundle)
import { demoInventoryMockApi } from '@/modules/inventory/demo/mockApiDemo';

// 2. Ejecuta la demo completa
await demoInventory();

// 3. O prueba funciones individuales
import { inventoryMockApi } from '@/modules/inventory';

// Obtener stock
const stock = await inventoryMockApi.getStock();
console.log(stock);

// Filtrar por almacén
const filtered = await inventoryMockApi.getStock({ 
  almacenId: 'WH-PRINCIPAL' 
});

// Buscar productos
const results = await inventoryMockApi.searchProducts('laptop');

// Obtener kardex
const kardex = await inventoryMockApi.getKardex({ 
  warehouseId: 'WH-PRINCIPAL' 
});

// Crear ajuste
const ajuste = await inventoryMockApi.createAjuste({
  productId: 'PRD-003',
  warehouseId: 'WH-PRINCIPAL',
  cantidadAjuste: 5,
  reasonId: 'REASON-001',
  observaciones: 'Prueba'
});

// Obtener alertas
const alertas = await inventoryMockApi.getAlertas();
console.log('Stock bajo:', alertas.stockBajo);
console.log('Stock crítico:', alertas.stockCritico);
```

## 📊 Datos Mock Disponibles

### Productos en Stock
- **LAP-001**: Laptop Dell Inspiron 15 (45 und.) - NORMAL
- **MOU-001**: Mouse Logitech MX Master 3 (8 und.) - BAJO
- **TEC-001**: Teclado Mecánico Razer (2 und.) - **CRITICO**
- **MON-001**: Monitor LG 27" 4K (12 und.) - NORMAL
- **HDD-001**: Disco Duro Externo 1TB (30 und.) - NORMAL
- **CAM-001**: Cámara Web Logitech C920 (1 und.) - **CRITICO**

### Almacenes
- **WH-PRINCIPAL**: Almacén Principal
- **WH-SECUNDARIO**: Almacén Secundario

### Movimientos Kardex
- 5 movimientos de ejemplo (ENTRADA, SALIDA, AJUSTE)
- Se actualizan automáticamente al crear ajustes

## 🧪 Verificación con Dev Tools

### Opción 1: Componente de Prueba Visual

Agrega el componente de prueba a tu router:

```typescript
// En tu archivo de rutas (ej: App.tsx o router.tsx)
import { InventoryMockTest } from '@/modules/inventory/demo/InventoryMockTest';

// Agrega esta ruta temporal
{
  path: '/test/inventory',
  element: <InventoryMockTest />
}
```

Luego visita: `http://localhost:5173/test/inventory`

Este componente te permite:
- ✅ Ver el stock completo con paginación
- ✅ Ver movimientos kardex
- ✅ Ver alertas de stock bajo/crítico
- ✅ Probar crear ajustes
- ✅ Filtrar por almacén
- ✅ Ver estadísticas en tiempo real

### Opción 2: Consola del Navegador

1. Abre tu app en el navegador
2. Abre DevTools (F12)
3. Ve a la pestaña Console
4. Ejecuta:
   ```javascript
   // Si la demo está expuesta globalmente
   await demoInventory();
   
   // O importa manualmente (si usas módulos)
   const { inventoryMockApi } = await import('/src/modules/inventory/services/inventoryMockApi.ts');
   const stock = await inventoryMockApi.getStock();
   console.table(stock.data);
   ```

### Opción 2: React DevTools

1. Instala React DevTools (extensión del navegador)
2. Inspecciona el componente que use `InventoryProvider`
3. Ve a la pestaña Components
4. Busca `InventoryContext.Provider`
5. Inspecciona el valor del contexto

### Opción 3: Redux DevTools (compatible con useReducer)

1. Instala Redux DevTools
2. El reducer de inventario se puede monitorear
3. Verás las acciones dispatch en tiempo real

## 🔄 Migración al Backend Real

Cuando el backend esté listo:

1. **Crea `inventoryRealApi.ts`** con la misma interfaz que el mock
2. **Actualiza el import en `InventoryContext.tsx`**:
   ```typescript
   // Antes
   import { inventoryMockApi } from '../services/inventoryMockApi';
   
   // Después
   import { inventoryRealApi } from '../services/inventoryRealApi';
   ```
3. **Mantén el mock para testing**

## ✅ Checklist de Verificación

- [x] Tipos TypeScript creados en `shared-types`
- [x] Mock Service implementado
- [x] Context refactorizado con useReducer
- [x] Exports actualizados en index.ts
- [x] No hay errores de compilación en el módulo
- [x] Demo script creado
- [x] README con instrucciones

## 🎓 Conceptos Aplicados

1. **Separation of Concerns**: Tipos, servicios y contexto separados
2. **Single Source of Truth**: useReducer para estado predecible
3. **Dependency Inversion**: Context depende de interfaces, no implementaciones
4. **Mock-First Development**: Desarrollo independiente del backend
5. **Type Safety**: Todo tipado con TypeScript

## 🚧 Próximos Pasos

1. Repetir este patrón para:
   - Módulo de Productos
   - Módulo de Clientes
   - Módulo de Ventas
   - Módulo de Compras
   
2. Implementar el backend en Spring Boot
3. Mapear las interfaces TypeScript a entidades JPA
4. Reemplazar Mock API por API real

## 📝 Notas

- Los mocks persisten los cambios **solo en memoria** durante la sesión
- Al recargar la página, los datos vuelven al estado inicial
- Para persistencia, considera usar `localStorage` o `IndexedDB` temporalmente
