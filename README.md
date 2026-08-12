[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.21895543-blue?logo=doi)](https://doi.org/10.5281/zenodo.21895543)
# New Hype ERP

Sistema ERP SaaS multi-tenant para **tiendas de ropa y accesorios**, desarrollado con arquitectura moderna React + Spring Boot.

## Descripcion

New Hype ERP permite a negocios de moda gestionar toda su operacion desde una sola plataforma:
ventas, inventario, compras, clientes, reportes y mas. La arquitectura multi-tenant permite que
multiples tiendas operen de forma aislada sobre la misma infraestructura.

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Estilos | Tailwind CSS + shadcn/ui |
| Estado | Context API + useReducer |
| Backend | Spring Boot 4.0.2 + Java 17 |
| Base de datos | MySQL 8 |
| Auth | JWT (access 24h + refresh 7d) |
| Deploy | cPanel (backend JAR) + Vite dev/build |

## Arquitectura

```
[React Frontend]  -->  HTTPS  -->  [Spring Boot :5001]  -->  [MySQL]
  (Vite build)                     (cPanel JAR)              (cPanel)

Multi-tenant: cada tienda tiene su propio tenantId + prefijo de datos aislado
Superadmin:   plataforma separada para gestionar tenants y planes de suscripcion
Storefront:   tienda publica por tenant para clientes finales
```

## Modulos del sistema

### ERP Principal (por tenant)
| Modulo | Descripcion |
|--------|-------------|
| Dashboard | Metricas y KPIs en tiempo real |
| Ventas | Punto de venta, historial, gestion de caja |
| Compras | Ordenes de compra y recepcion de mercaderia |
| Productos | Catalogo con talla, color, marca, material, genero |
| Inventario | Stock por almacen, kardex, alertas de stock minimo |
| Clientes | Gestion de cartera de clientes |
| Usuarios | Roles y permisos del personal |
| Configuracion | Catalogos: tallas, colores, marcas, materiales, categorias |
| Reportes | Reportes de ventas, inventario y finanzas |
| Auditoria | Log de operaciones del sistema |

### Plataforma (Superadmin)
| Modulo | Descripcion |
|--------|-------------|
| Tenants | Alta, suspension y gestion de tiendas |
| Planes | Planes de suscripcion (mensual/anual) |
| Platform Auth | Login separado para administradores de plataforma |

### Storefront
Tienda publica de cada tenant para ventas al cliente final.

## Estructura del Repositorio

```
New-Hype-Project/
├── frontend/               # App ERP principal (React monorepo)
│   └── src/modules/        # Modulos por funcionalidad
├── newhype-backend/        # API REST (Spring Boot)
├── _superadmin_external/   # App React independiente del superadmin
├── packages/               # Paquetes TypeScript compartidos
│   ├── shared-types/
│   ├── shared-utils/
│   ├── shared-api-client/
│   └── shared-constants/
├── database/               # Scripts SQL y migraciones
├── postman/                # Colecciones Postman para testing
└── docs/                   # Documentacion tecnica y api_docs.json
```

## Inicio Rapido

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/Nestor-Hernandez-Diaz/New-Hype-Project.git
cd New-Hype-Project
npm install
```

### 2. Configurar variables de entorno

```bash
# frontend/.env
VITE_API_URL=http://spring.informaticapp.com:5001/New-Hype-Project/api/v1
```

### 3. Compilar paquetes compartidos

```bash
npm run build:packages
```

### 4. Ejecutar en desarrollo

```bash
npm run dev          # Frontend ERP  → http://localhost:5173
```

Para el **Superadmin** (app independiente):
```bash
cd _superadmin_external
npm run dev          # Superadmin    → http://localhost:5174
```

## Comandos Disponibles

```bash
npm run dev              # Frontend en modo desarrollo
npm run build            # Build de produccion del frontend
npm run build:packages   # Compilar paquetes compartidos
npm run build:all        # Compilar paquetes + frontend
npm run lint             # Ejecutar linter
npm run clean            # Limpiar node_modules del monorepo
```

## Credenciales por defecto

| Rol | Email | Notas |
|-----|-------|-------|
| Superadmin | `superadmin@newhype.pe` | Solo en `/platform/auth/login` |
| Tenant Admin | Configurado al registrar la tienda | En `/auth/login` |

## API Reference

La documentacion completa de la API se encuentra en `docs/api_docs.json` (formato OpenAPI 3.1).

Endpoints principales:
- `POST /api/v1/auth/login` — Login tenant
- `POST /api/v1/platform/auth/login` — Login superadmin
- `POST /api/v1/auth/register` — Registro de nueva tienda
- `GET  /api/v1/productos` — Catalogo de productos
- `GET  /api/v1/inventario/stock` — Stock por almacen

## Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Java 17 (solo para desarrollo del backend)
- Maven 3.9+ (solo para build del backend)
