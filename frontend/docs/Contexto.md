# Contexto Completo del Proyecto Monorepo

## 📍 Ubicación y Repositorio
- **Ruta local**: proyecto-monorepo
- **GitHub**: https://github.com/Nestor-Hernandez-Diaz/proyecto-monorepo
- **Servidor dev**: http://localhost:5174 (puerto 5174)

## 🏗️ Arquitectura del Proyecto

### Monorepo con npm workspaces
```
proyecto-monorepo/
├── apps/
│   ├── alexa-tech/          # Proyecto original (styled-components + Context API)
│   └── nuevo-proyecto/      # Nuevo proyecto (shadcn + TanStack Query + Zustand)
└── packages/
    ├── shared-types/        # Interfaces TypeScript compartidas
    ├── shared-utils/        # Utilidades (formatDate, validateEmail, etc.)
    ├── shared-api-client/   # Cliente Axios con interceptors
    └── shared-constants/    # Constantes (DOCUMENT_TYPES, STOCK_STATUS, etc.)
```

## 🛠️ Stack Tecnológico Nuevo Proyecto

- **React 19** + **Vite** + **TypeScript**
- **shadcn/ui** + **Tailwind CSS** (UI components)
- **TanStack Query v5** (server state, pendiente configurar)
- **Zustand** (client state, ya instalado y configurado)
- **React Router v6** (navegación)

## ✅ Archivos Creados y Configurados

### 1. Zustand Auth Store
**Ubicación**: `src/stores/authStore.ts`
- Maneja autenticación con persistencia en localStorage
- Métodos: `login()`, `logout()`, `updateUser()`
- Estado: `user`, `token`, `isAuthenticated`

### 2. Layout Component
**Ubicación**: `src/components/layout/Layout.tsx`
- Header con navegación (Dashboard, Productos, Ventas, Compras, Inventario)
- Menú de usuario con nombre y rol
- Botón de logout
- Outlet para rutas hijas
- Footer

### 3. Login Page
**Ubicación**: `src/pages/Login.tsx`
- Form con email y password usando componentes shadcn
- Integración con authStore
- Mock de autenticación (acepta cualquier credencial)
- Redirección a dashboard tras login exitoso

### 4. Dashboard Page
**Ubicación**: `src/pages/Dashboard.tsx`
- Página de bienvenida mostrando tech stack
- Lista de componentes shadcn instalados
- Guía de próximos pasos

### 5. Componentes shadcn Instalados
**Ubicación**: `src/components/ui/`
- `button.tsx`
- `input.tsx`
- `label.tsx`
- `card.tsx`
- `select.tsx`
- `dialog.tsx`
- `alert.tsx`

### 6. Estructura de Carpetas
```
src/
├── components/
│   ├── layout/
│   │   └── Layout.tsx
│   └── ui/              # Componentes shadcn
├── pages/
│   ├── Dashboard.tsx
│   └── Login.tsx
├── stores/
│   └── authStore.ts
├── hooks/               # (vacío, listo para usar)
├── services/            # (vacío, listo para APIs)
└── lib/
    └── utils.ts         # cn() para clsx + tailwind-merge
```

## 📦 Dependencias Clave

### Instaladas en nuevo-proyecto:
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^6.29.0",
  "zustand": "^5.0.3",
  "@radix-ui/react-*": "varios componentes de shadcn",
  "tailwindcss": "^3.4.17",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0"
}
```

### Pendiente de instalar:
```bash
npm install @tanstack/react-query
```

## 🔧 Configuraciones Importantes

### PostCSS Config (`postcss.config.js`):
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Components Config (`components.json`):
- Base color: Neutral
- CSS variables: `src/index.css`
- Import alias: `@/` → `src/`

### Tailwind Config (`tailwind.config.js`):
- Configurado con shadcn preset
- CSS variables para theming
- Animaciones incluidas

## 🚧 Estado Actual del Código

### App.tsx (NECESITA ACTUALIZACIÓN)
Actualmente solo tiene rutas básicas. Debe actualizarse con:
- Importar Layout y Login
- Crear ProtectedRoute component
- Envolver rutas en Layout
- Agregar ruta `/login`

```typescript
// Código que debe reemplazar App.tsx:
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Layout } from './components/layout/Layout';
import { useAuthStore } from './stores/authStore';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## 📋 Próximos Pasos Recomendados

### 1. Actualizar App.tsx
Reemplazar contenido actual con el código de rutas protegidas mostrado arriba.

### 2. Configurar TanStack Query
```bash
cd C:\Dev\proyecto-monorepo\apps\nuevo-proyecto
npm install @tanstack/react-query
```

Crear `src/lib/queryClient.ts`:
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      retry: 1,
    },
  },
});
```

Envolver App en `main.tsx`:
```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### 3. Crear Servicio de API
Crear `src/services/api.ts` que use el shared-api-client:
```typescript
import { ApiClient } from '@repo/shared-api-client';

export const api = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});
```

### 4. Ejemplo de Hook con TanStack Query
Crear `src/hooks/useProducts.ts`:
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Product } from '@repo/shared-types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get<Product[]>('/productos');
      return response.data;
    },
  });
};
```

## 🔑 Comandos Útiles

```bash
# Iniciar servidor de desarrollo
cd C:\Dev\proyecto-monorepo\apps\nuevo-proyecto
npm run dev

# Compilar todos los paquetes compartidos
cd C:\Dev\proyecto-monorepo
npm run build:packages

# Instalar dependencias en todo el monorepo
npm install

# Agregar más componentes shadcn
cd apps/nuevo-proyecto
npx shadcn@latest add [component-name]
```

## 🎯 Estado de Completitud

**Completado (100%):**
- ✅ Estructura monorepo
- ✅ 4 paquetes compartidos
- ✅ Componentes shadcn básicos
- ✅ Store de autenticación con Zustand
- ✅ Layout con navegación
- ✅ Página de Login funcional
- ✅ Estructura de carpetas

**Pendiente:**
- ⏳ Actualizar App.tsx con rutas protegidas
- ⏳ Instalar y configurar TanStack Query
- ⏳ Crear servicios de API
- ⏳ Crear hooks personalizados
- ⏳ Implementar páginas restantes (Productos, Ventas, Compras, Inventario)

## 💡 Notas Importantes

1. **Persistencia de Auth**: El store de Zustand persiste en localStorage con la key `auth-storage`
2. **Login Demo**: Acepta cualquier email/password para pruebas
3. **Paquetes Compartidos**: Ya compilados y listos para importar con `@repo/shared-*`
4. **Puerto**: El proyecto corre en 5174 (no 5173) para evitar conflictos
5. **Tailwind**: Configurado con CSS variables para theming dinámico

---

**Última actualización**: 24 de enero de 2026
**Proyecto**: Sistema ERP con Monorepo
**Branch activo**: main