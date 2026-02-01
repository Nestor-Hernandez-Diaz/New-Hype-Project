# 🔄 WORKFLOW - Refactorizar Módulos Frontend

**Audiencia:** Desarrolladores refactorizando módulos con mocks  
**Tiempo estimado por módulo:** 2-4 horas  
**Patrón de referencia:** `src/modules/inventory/` (ya completado)

---

## 📋 Resumen: 4 Pasos Principales

```
1. 📐 DISEÑO: Crear tipos TypeScript en @monorepo/shared-types
2. 🧠 MOCK: Crear servicio mock con datos hardcoded
3. 🔌 INTEGRACIÓN: Conectar mock a Context con useReducer
4. ✅ QA: Verificar con protocolo + crear PR
```

---

## PASO 1: Preparar Rama Git

### 1.1 Crear rama desde main

```bash
# Actualizar main
git checkout main
git pull origin main

# Crear rama de feature
git checkout -b feature/refactor-[nombre-modulo]-mocks

# Ejemplo:
git checkout -b feature/refactor-productos-mocks
git checkout -b feature/refactor-usuarios-mocks
git checkout -b feature/refactor-clientes-mocks
```

### 1.2 Nombrar rama: Convención Obligatoria

```
feature/refactor-[nombre-modulo-en-plural]-mocks

✅ CORRECTO:
- feature/refactor-productos-mocks
- feature/refactor-usuarios-mocks
- feature/refactor-clientes-mocks

❌ INCORRECTO:
- feature/fix-prod
- refactor-stuff
- nueva-rama
```

---

## PASO 2: Crear Tipos TypeScript (Contrato)

### 2.1 Ubicación

```
packages/shared-types/src/domain/[modulo].ts
```

### 2.2 Estructura de tipos

```typescript
// filepath: packages/shared-types/src/domain/productos.ts
/**
 * ============================================
 * TIPOS - MÓDULO PRODUCTOS
 * ============================================
 */

// ========== INTERFACES ==========

export interface Producto {
  id: string;                    // ID único
  codigoProducto: string;       // Código (ej: CAM-POL-001)
  nombre: string;               // Nombre del producto
  descripcion?: string;         // Descripción opcional
  
  // Atributos de ropa (OBLIGATORIO para ropa/accesorios)
  categoria: string;            // Camisetas, Pantalones, etc.
  talla?: string;               // XS, S, M, L, XL, XXL, U
  color?: string;               // Blanco, Azul Marino, etc.
  marca?: string;               // Polo Ralph Lauren, Nike, etc.
  material?: string;            // Algodón 100%, Poliéster, etc.
  
  // Precios y stock
  precioVenta: number;          // Precio unitario
  precioCoste?: number;         // Costo (opcional)
  stockActual: number;          // Stock actual
  stockMinimo: number;          // Mínimo antes de alerta
  
  // Estado
  estado: EstadoProducto;       // ACTIVO, INACTIVO
  
  // Auditoría
  usuarioCreacion: string;
  fechaCreacion: string;        // ISO 8601
  fechaModificacion?: string;
}

export enum EstadoProducto {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export const CATEGORIAS_ROPA = [
  'Camisetas',
  'Pantalones',
  'Accesorios',
  'Calzado',
  'Medias',
] as const;
```

### 2.3 Verificación de tipos

```bash
# Compilar para verificar sintaxis
npx tsc --noEmit

# Esperado: Sin output
```

---

## PASO 3: Crear Mock API Service

### 3.1 Ubicación

```
frontend/src/modules/[modulo]/services/[modulo]MockApi.ts
```

### 3.2 Estructura obligatoria del archivo

```typescript
// filepath: frontend/src/modules/productos/services/productosMockApi.ts
import type { Producto } from '@monorepo/shared-types';

// ========== DATOS MOCK ==========

const MOCK_PRODUCTOS: Producto[] = [
  {
    id: 'PRD-001',
    codigoProducto: 'CAM-POL-001',
    nombre: 'Camiseta Polo Básica',
    descripcion: 'Polo clásico de alta calidad para hombre',
    
    categoria: 'Camisetas',
    talla: 'M',
    color: 'Blanco',
    marca: 'Polo Ralph Lauren',
    material: 'Algodón 100%',
    
    precioVenta: 79.90,
    precioCoste: 35.00,
    stockActual: 150,
    stockMinimo: 25,
    
    estado: 'ACTIVO' as const,
    usuarioCreacion: 'SYSTEM',
    fechaCreacion: '2024-01-15T09:30:00Z',
  },
  // ... 13 productos totales
];

// ========== SIMULADOR DE LATENCIA ==========

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ========== FUNCIONES ==========

export const productosMockApi = {
  async getProductos(): Promise<Producto[]> {
    await delay(600); // 🔴 OBLIGATORIO: Simular latencia
    return MOCK_PRODUCTOS;
  },

  async getProductoById(id: string): Promise<Producto | null> {
    await delay(400);
    return MOCK_PRODUCTOS.find(p => p.id === id) || null;
  },

  async crearProducto(data: Omit<Producto, 'id' | 'usuarioCreacion' | 'fechaCreacion'>): Promise<Producto> {
    await delay(700);
    
    const nuevoProducto: Producto = {
      ...data,
      id: `PRD-${Date.now()}`,
      usuarioCreacion: 'SYSTEM',
      fechaCreacion: new Date().toISOString(),
    };

    MOCK_PRODUCTOS.push(nuevoProducto);
    return nuevoProducto;
  },

  async actualizarProducto(
    id: string,
    data: Partial<Producto>
  ): Promise<Producto | null> {
    await delay(700);
    
    const index = MOCK_PRODUCTOS.findIndex(p => p.id === id);
    if (index === -1) return null;

    MOCK_PRODUCTOS[index] = {
      ...MOCK_PRODUCTOS[index],
      ...data,
      fechaModificacion: new Date().toISOString(),
    };

    return MOCK_PRODUCTOS[index];
  },
};

export default productosMockApi;
```

### 3.3 Convenciones Obligatorias de Nombres

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| **Archivo** | `[modulo]MockApi.ts` | `productosMockApi.ts` |
| **Constante datos** | `MOCK_[ENTIDAD]S` | `MOCK_PRODUCTOS` |
| **Función get lista** | `get[Entidad]s()` | `getProductos()` |
| **Función get por ID** | `get[Entidad]ById()` | `getProductoById()` |
| **Función crear** | `crear[Entidad]()` | `crearProducto()` |
| **Export objeto** | `[modulo]MockApi` | `productosMockApi` |

### 3.4 Latencia Simulada (OBLIGATORIO)

```typescript
// ✅ CORRECTO
async getProductos() {
  await delay(600);  // 🔴 OBLIGATORIO
  return MOCK_PRODUCTOS;
}

// ❌ INCORRECTO
async getProductos() {
  return MOCK_PRODUCTOS;  // Falta delay!
}
```

---

## PASO 4: Refactorizar Context con useReducer

### 4.1 Ubicación

```
frontend/src/modules/[modulo]/context/[Modulo]Context.tsx
```

### 4.2 Estructura de Context

```typescript
// filepath: frontend/src/modules/productos/context/ProductosContext.tsx
import React, { createContext, useReducer, ReactNode } from 'react';
import type { Producto } from '@monorepo/shared-types';
import { productosMockApi } from '../services/productosMockApi';

// ========== TIPOS ==========

export interface ProductosState {
  productos: Producto[];
  loading: boolean;
  error: string | null;
}

type ProductosAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Producto[] }
  | { type: 'FETCH_ERROR'; payload: string };

// ========== ESTADO INICIAL ==========

const estadoInicial: ProductosState = {
  productos: [],
  loading: false,
  error: null,
};

// ========== REDUCER ==========

function productosReducer(
  state: ProductosState,
  action: ProductosAction
): ProductosState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, productos: action.payload };

    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

// ========== CONTEXT ==========

interface ProductosContextType extends ProductosState {
  cargarProductos: () => Promise<void>;
  crearProducto: (data: Omit<Producto, 'id' | 'usuarioCreacion' | 'fechaCreacion'>) => Promise<void>;
}

export const ProductosContext = createContext<ProductosContextType | undefined>(undefined);

// ========== PROVIDER ==========

export function ProductosProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(productosReducer, estadoInicial);

  const cargarProductos = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await productosMockApi.getProductos();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  const crearProducto = async (
    data: Omit<Producto, 'id' | 'usuarioCreacion' | 'fechaCreacion'>
  ) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await productosMockApi.crearProducto(data);
      await cargarProductos(); // Recargar lista
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: error instanceof Error ? error.message : 'Error al crear',
      });
    }
  };

  return (
    <ProductosContext.Provider
      value={{
        ...state,
        cargarProductos,
        crearProducto,
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
}

// ========== HOOK ==========

export function useProductos() {
  const context = React.useContext(ProductosContext);
  if (!context) {
    throw new Error('useProductos debe usarse dentro de ProductosProvider');
  }
  return context;
}
```

---

## PASO 5: Commits Git

### 5.1 Agregar archivos

```bash
git add packages/shared-types/src/domain/productos.ts
git add packages/shared-types/src/index.ts
git add frontend/src/modules/productos/services/productosMockApi.ts
git add frontend/src/modules/productos/context/ProductosContext.tsx
```

### 5.2 Commits separados

```bash
git commit -m "feat(shared-types): Agregar tipos para módulo Productos"
git commit -m "feat(productos): Crear Mock API con 13 productos hardcoded"
git commit -m "feat(productos): Refactorizar ProductosContext con useReducer"
```

### 5.3 Convención de commits

```
feat(scope): descripción
fix(scope): descripción
docs(scope): descripción

Scope = nombre del módulo
```

---

## PASO 6: Verificación QA Antes de PR

Ejecutar los tests de [QA-PROTOCOL.md](./QA-PROTOCOL.md):

```bash
npx tsc --noEmit
cd frontend && pnpm run build
pnpm dev
# Verificar Console y DOM (ver QA-PROTOCOL.md)
```

---

## PASO 7: Crear Pull Request

### 7.1 Push

```bash
git push origin feature/refactor-productos-mocks
```

### 7.2 Abrir PR en GitHub

**Título:** `[Refactor] Módulo Productos - Mock API con useReducer`

**Descripción:**

```markdown
## 📝 Descripción
Refactorización del módulo Productos siguiendo patrón Frontend-First.

## ✅ Cambios
- ✅ Tipos TypeScript en `shared-types/productos.ts`
- ✅ Mock API con 13 productos
- ✅ ProductosContext refactorizado con useReducer
- ✅ Latencia simulada: 600ms

## 📋 Checklist QA
- [x] TypeScript compila sin errores
- [x] Frontend compila sin errores
- [x] Console limpia (sin errores rojos)
- [x] Mock data visible en DOM

### 🛡️ Reporte de Calidad
| Tipo de Test | Estado | Detalles |
|--------------|--------|----------|
| **TypeScript** | ✅ PASÓ | Sin errores |
| **Runtime** | ✅ LIMPIO | 0 errores |
| **Data Binding** | ✅ VERIFICADO | "Camiseta Polo" en DOM |

**Estado Final:** 🟢 LISTO PARA MERGE
```

---

## 🔄 Resolver Conflictos Git

Si aparece conflicto:

```bash
git fetch origin
git rebase origin/main

# VS Code mostrará conflictos, resolver y:
git add .
git rebase --continue

# Push forzado
git push --force-with-lease origin feature/refactor-productos-mocks
```

---

## 📊 Cómo Copiar Datos BD → Mocks

**En DBeaver:**

```sql
SELECT 
  codigo_producto,
  nombre,
  talla,
  color,
  marca,
  material,
  precio_venta,
  stock_actual
FROM productos
LIMIT 5;
```

**Convertir a TypeScript:** Copiar datos y ajustar camelCase en MOCK_PRODUCTOS

---

**Última actualización:** 2026-02-01  
**Versión:** 1.0  
**Responsable:** Tech Lead
