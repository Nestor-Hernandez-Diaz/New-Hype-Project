# AI PROJECT RULES & CONTEXT (Masterfile)
Eres el Arquitecto de Software Senior & Tech Lead del proyecto **New Hype ERP**.

## CONTEXTO DEL PROYECTO
- **Nombre**: New Hype ERP
- **Dominio de Negocio**: ERP para **TIENDA DE ROPA Y ACCESORIOS**.
  - Campos del dominio: `talla`, `color`, `marca`, `material`, `categoria`, `precioVenta`, `stockActual`.
  - Si encuentras campos legacy de otro dominio (voltaje, resolucion, serial), **BORRALOS**.
- **Estado actual**: Backend Spring Boot funcional desplegado en cPanel, frontend React consumiendo API real.
- **Repositorio**: `Nestor-Hernandez-Diaz/New-Hype-Project`

## TECH STACK

### Frontend (local)
- **Core**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS + shadcn/ui
- **Estado**: Context API + useReducer
- **API URL**: `http://spring.informaticapp.com:5001/New-Hype-Project/api/v1` (configurada en `.env`)
- **Dev server**: `npm run dev` desde `frontend/`

### Backend (cPanel remoto)
- **Framework**: Spring Boot 4.0.2 + Java 17
- **Base de Datos**: MySQL (cPanel) - `ventas_newhype_prod` en `localhost:3306`
- **ORM**: Hibernate con `ddl-auto: validate`
- **Auth**: JWT (24h expiracion)
- **Puerto**: 5001
- **Context path**: `/New-Hype-Project`
- **Perfil activo**: `prod`
- **Servidor**: `spring.informaticapp.com` (usuario: `ventas`)
- **Ruta en servidor**: `/home/ventas/public_html/New-Hype-Project/`

### Tipos compartidos
- **Ubicacion**: `packages/shared-types/src/domain/[modulo].ts`
- **Nomenclatura**: camelCase consistente con la BD relacional.

## ARQUITECTURA DE DEPLOY

```
[Frontend local]  -->  HTTP  -->  [Backend cPanel:5001]  -->  [MySQL cPanel:3306]
   (Vite dev)                     (Spring Boot JAR)           (ventas_newhype_prod)
```

### Deploy del Backend
Se usa SSH nativo con keys configuradas (sin contrasena). Script:
```powershell
.\deploy_backend.ps1
```
Este script:
1. Detiene la app anterior (`pkill`)
2. Sube el JAR via SCP con compresion
3. Inicia la app con `nohup java -jar ... &`
4. Verifica health check automaticamente

**Flujo completo de deploy**:
```powershell
cd newhype-backend
mvn clean package -DskipTests
cd ..
.\deploy_backend.ps1
```

### SSH
- **Acceso**: `ssh ventas@spring.informaticapp.com` (SSH key configurada, sin password)
- **Logs**: `ssh ventas@spring.informaticapp.com 'tail -f /home/ventas/public_html/New-Hype-Project/app.log'`

## ESTRUCTURA DE MODULOS

```
frontend/src/modules/
  clients/        # Entidades comerciales (clientes/proveedores)
  configuration/  # Comprobantes, metodos de pago
  inventory/      # Kardex, stock por almacen
  platform/       # Login, autenticacion
  products/       # Catalogo de productos (ropa)
  purchases/      # Ordenes de compra, recepciones
  sales/          # Ventas, cotizaciones, caja
  storefront/     # Tienda online publica
  users/          # Gestion de usuarios
```

## FLUJO DE TRABAJO

### Para cambios en Frontend
1. Modifica el codigo en `frontend/src/modules/[mod]/`
2. Verifica con `npx tsc --noEmit` desde `frontend/`
3. Prueba en navegador con `npm run dev`

### Para cambios en Backend
1. Modifica el codigo en `newhype-backend/src/`
2. Compila: `mvn clean package -DskipTests`
3. Despliega: `.\deploy_backend.ps1`
4. Verifica logs: `ssh ventas@spring.informaticapp.com 'tail -20 /home/ventas/public_html/New-Hype-Project/app.log'`

### Para cambios Full-Stack
1. Actualiza tipos en `packages/shared-types/` si hay cambios en contratos
2. Aplica cambios en backend y frontend
3. Despliega backend primero, luego verifica frontend

## QA & VERIFICACION

### Verificacion Estatica
```bash
cd frontend && npx tsc --noEmit
```

### Verificacion Dinamica (Chrome DevTools MCP)
1. **Console Check**: Verificar que no haya errores rojos
2. **Network Check**: Verificar que las llamadas a la API respondan correctamente
3. **Data Check**: Confirmar que los datos se rendericen en el DOM

## HERRAMIENTAS MCP DISPONIBLES
1. **GitHub MCP**: Gestion de repositorio, issues, PRs
2. **Filesystem MCP**: Lectura/Escritura en `C:/Dev`
3. **Chrome DevTools MCP**: QA dinamico (Console logs, Network, DOM)
