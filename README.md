# Proyecto Frontend - Monorepo

Sistema de gestión empresarial desarrollado con React + Vite y arquitectura de monorepo.

## 📁 Estructura

```
proyecto-monorepo/
├── frontend/               # Aplicación principal
│   ├── src/
│   │   ├── modules/        # Módulos por funcionalidad
│   │   │   ├── auth/
│   │   │   ├── sales/
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── purchases/
│   │   │   ├── clients/
│   │   │   ├── users/
│   │   │   ├── configuration/
│   │   │   ├── reports/
│   │   │   ├── audit/
│   │   │   └── dashboard/
│   │   ├── components/     # Componentes compartidos
│   │   ├── context/        # Contextos globales
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utilidades
│   └── docs/               # Documentación del proyecto
│
├── packages/               # Paquetes compartidos
│   ├── shared-types/         # Tipos TypeScript
│   ├── shared-utils/         # Utilidades comunes
│   ├── shared-api-client/    # Cliente API Axios
│   └── shared-constants/     # Constantes
│
└── package.json              # Configuración de workspaces
```

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias del monorepo, incluyendo la app y los paquetes compartidos.

### 2. Compilar Paquetes Compartidos

```bash
npm run build:packages
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Comandos Disponibles

### Desarrollo
```bash
npm run dev              # Ejecutar app en modo desarrollo
```

### Build
```bash
npm run build:packages   # Compilar solo los packages compartidos
npm run build            # Compilar la aplicación
npm run build:all        # Compilar packages + aplicación
```

### Testing y Calidad
```bash
npm run test             # Ejecutar tests
npm run lint             # Ejecutar linter
npm run preview          # Preview de la build de producción
```

### Mantenimiento
```bash
npm run clean            # Limpiar node_modules de todo el monorepo
```

## 📚 Paquetes Compartidos

### @monorepo/shared-types
Tipos TypeScript compartidos entre módulos:
```typescript
import type { User, Product, Sale } from '@monorepo/shared-types';
```

### @monorepo/shared-utils
Utilidades comunes (validación, formateo, etc.):
```typescript
import { formatCurrency, validateRUC } from '@monorepo/shared-utils';
```

### @monorepo/shared-api-client
Cliente API configurado con Axios:
```typescript
import { createApiClient } from '@monorepo/shared-api-client';
```

### @monorepo/shared-constants
Constantes de la aplicación:
```typescript
import { API_ENDPOINTS, USER_ROLES } from '@monorepo/shared-constants';
```

## 🏗️ Arquitectura

El proyecto sigue una arquitectura modular donde cada funcionalidad está contenida en su propio módulo con:
- **pages/** - Páginas del módulo
- **components/** - Componentes específicos del módulo
- **context/** - Contextos del módulo
- **services/** - Servicios API del módulo
- **types/** - Tipos específicos del módulo
- **utils/** - Utilidades del módulo

## 🛠️ Stack Tecnológico

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **styled-components** - CSS-in-JS
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP

## 📝 Notas

- Node.js >= 18.0.0 requerido
- npm >= 9.0.0 requerido
- Los paquetes compartidos deben compilarse antes de ejecutar la aplicación
