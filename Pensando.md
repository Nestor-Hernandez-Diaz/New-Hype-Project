# Storefront Multi-Tenant: Deploy del Nuevo Endpoint

## Problema Resuelto
Cada tenant ahora tiene su propio storefront accesible por subdominio en la URL:
```
ANTES:  /storefront/catalogo          (hardcoded tenant 1)
AHORA:  /tienda/store-juan/catalogo   (dinámico por subdominio)
        /tienda/moda-maria/catalogo   (otro tenant)
```

## Cambios Realizados

### Backend (3 archivos)
1. **Nuevo endpoint**: `GET /api/v1/storefront/resolver/{subdominio}` — público, sin auth
2. **Nuevo DTO**: `TenantPublicResponse.java` (id, nombre, subdominio, estado)
3. **SecurityConfig**: Agregado `/api/v1/storefront/resolver/**` a rutas públicas
4. **StorefrontService**: Inyectado `TenantRepository`, método `resolverTenantPorSubdominio()`

### Frontend (24+ archivos)
1. **storefrontFetch.ts**: `getTenantId()` ahora lee de variable dinámica (no hardcoded '1')
2. **TenantResolver.tsx**: Componente que lee `:subdominio` de la URL → llama al backend → configura tenantId
3. **StorefrontLayout.tsx**: Envuelto con `<TenantResolver>`
4. **App.tsx**: Ruta cambiada de `/storefront` a `/tienda/:subdominio`
5. **Todas las páginas y componentes**: Links actualizados de `/storefront/xxx` a `${getBasePath()}/xxx`

---

## Pasos para Deploy en cPanel

### 1. Compilar el Backend
```powershell
cd newhype-backend
mvn clean package -DskipTests
```

### 2. Desplegar el Backend
```powershell
cd ..
.\deploy_backend.ps1
```

### 3. Verificar el Nuevo Endpoint
```bash
# Desde cualquier terminal (reemplaza 'mi-tienda' con un subdominio real de tu BD)
curl http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/storefront/resolver/mi-tienda
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "nombre": "Mi Tienda",
    "subdominio": "mi-tienda",
    "estado": "ACTIVA"
  }
}
```

### 4. Verificar logs si hay error
```bash
ssh ventas@spring.informaticapp.com 'tail -20 /home/ventas/public_html/New-Hype-Project/app.log'
```

### 5. Probar el Frontend
```powershell
cd frontend
npm run dev
```
Navegar a: `http://localhost:5173/tienda/{subdominio-de-tu-tenant}/catalogo`

---

## Cómo Funciona

```
1. Usuario accede a /tienda/store-juan/catalogo
2. React Router extrae "store-juan" como :subdominio
3. TenantResolver llama GET /storefront/resolver/store-juan
4. Backend busca en tabla tenants WHERE subdominio = 'store-juan'
5. Devuelve { id: 1, nombre: "Store Juan", ... }
6. Frontend guarda tenantId=1 y basePath="/tienda/store-juan"
7. Todas las llamadas API usan tenantId=1
8. Todos los links internos usan /tienda/store-juan/xxx
```

## Nota
Para saber qué subdominios existen, revisa la tabla `tenants` en la BD:
```sql
SELECT id, nombre, subdominio, estado FROM tenants WHERE estado = 'ACTIVA';
```
