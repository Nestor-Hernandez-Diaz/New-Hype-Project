# 📖 Manual de Uso — Panel Superadmin (New Hype ERP)

> **Versión:** 1.0  
> **Última actualización:** 01 de marzo de 2026  
> **Aplicación:** Panel de Control Global — Superadministrador  
> **URL por defecto:** `http://localhost:5174`

---

## 📋 Índice

1. [Descripción General](#1-descripción-general)
2. [Requisitos y Acceso](#2-requisitos-y-acceso)
3. [Inicio de Sesión](#3-inicio-de-sesión)
4. [Navegación General](#4-navegación-general)
5. [Dashboard Global](#5-dashboard-global)
6. [Gestión de Sucursales](#6-gestión-de-sucursales)
7. [Planes y Suscripciones](#7-planes-y-suscripciones)
8. [Estado de Pagos](#8-estado-de-pagos)
9. [Gestión de Usuarios](#9-gestión-de-usuarios)
10. [Soporte — Detalle de Tickets](#10-soporte--detalle-de-tickets)
11. [Persistencia de Datos](#11-persistencia-de-datos)
12. [Preguntas Frecuentes](#12-preguntas-frecuentes)

---

## 1. Descripción General

El **Panel Superadmin** es una aplicación web independiente que funciona como **centro de control global** para la plataforma multi-sucursal del ERP New Hype (tienda de ropa y accesorios).

Desde este panel, el superadministrador puede:

- Monitorear el estado general de todas las sucursales.
- Crear, editar, suspender y activar sucursales.
- Gestionar planes de suscripción y estado de pagos.
- Administrar usuarios del sistema (admins, vendedores, almaceneros).
- Atender tickets de soporte enviados por los usuarios de las sucursales.

> **Nota:** Actualmente el sistema opera con **datos mock locales** (simulados). Toda la información se almacena en el `localStorage` del navegador. No existe un backend real conectado aún.

---

## 2. Requisitos y Acceso

### Requisitos técnicos

| Requisito | Detalle |
|-----------|---------|
| Navegador | Chrome, Edge, Firefox (versiones recientes) |
| Resolución | Mínimo 1024×768 (optimizado para desktop) |
| Puerto | `5174` (por defecto en desarrollo) |

### Iniciar la aplicación (desarrollo)

```bash
# Desde la raíz del proyecto
cd superadmin
npm run dev
```

La aplicación estará disponible en `http://localhost:5174`.

---

## 3. Inicio de Sesión

Al abrir la aplicación, serás redirigido automáticamente a la **pantalla de login** si no tienes una sesión activa.

### Credenciales de acceso

| Campo | Valor |
|-------|-------|
| **Email** | `superadmin@newhype.com` |
| **Contraseña** | `super2026` |

### Pasos para ingresar

1. Ingresa el **email** en el campo correspondiente.
2. Ingresa la **contraseña**.
3. Haz clic en **"Iniciar Sesión"**.
4. Si las credenciales son correctas, serás redirigido al **Dashboard**.
5. Si las credenciales son incorrectas, aparecerá un mensaje de error en rojo.

> 💡 **Tip:** La pantalla de login muestra una caja informativa con las credenciales de demo para facilitar el acceso.

### Cerrar sesión

- En el **sidebar** (barra lateral izquierda), haz clic en el botón **"Cerrar Sesión"** ubicado en la parte inferior.
- Serás redirigido a la pantalla de login.

---

## 4. Navegación General

### Estructura de la interfaz

La aplicación tiene un diseño de **dos columnas**:

```
┌───────────────┬──────────────────────────────────────┐
│               │  Header (Título + Info de Usuario)    │
│   Sidebar     ├──────────────────────────────────────┤
│   (250px)     │                                      │
│               │         Contenido Principal           │
│   - Dashboard │         (scrollable)                  │
│   - Sucursales│                                      │
│   - Planes    │                                      │
│   - Pagos     │                                      │
│   - Usuarios  │                                      │
│   - Tickets   │                                      │
│               │                                      │
│  [Cerrar      │                                      │
│   Sesión]     │                                      │
└───────────────┴──────────────────────────────────────┘
```

### Menú de navegación (Sidebar)

| Ícono | Opción | Ruta |
|-------|--------|------|
| 📊 | Dashboard | `/dashboard` |
| 🏪 | Sucursales | `/sucursales` |
| 📋 | Planes & Suscripciones | `/suscripciones` |
| 💳 | Estado de Pagos | `/suscripciones/estado-pagos` |
| 👥 | Usuarios | `/usuarios` |
| 🎫 | Tickets | `/tickets/detalle` |

- La opción **activa** se resalta con un borde azul en el lado izquierdo.
- En **móvil** (≤768px), el sidebar se oculta automáticamente.

### Header

En la esquina superior derecha verás tu información de usuario:
- **Avatar** con tus iniciales.
- **Nombre completo** y rol "Superadministrador".

---

## 5. Dashboard Global

**Ruta:** `/dashboard`

El Dashboard es la **página principal** y ofrece una vista general del estado de la plataforma.

### Tarjetas de KPIs (Indicadores Clave)

Se muestran **4 tarjetas** en la parte superior:

| Tarjeta | Descripción |
|---------|-------------|
| **Total Sucursales** | Cantidad total de sucursales registradas |
| **Sucursales Activas** | Sucursales con estado "activa" + porcentaje del total |
| **Ingresos Mensuales** | Estimación de ingresos en Soles (S/) |
| **Usuarios Totales** | Cantidad total de usuarios en el sistema |

### Actividad Reciente

Debajo de las tarjetas se muestra una **línea de tiempo** con los eventos más recientes del sistema:

- 🏪 **Sucursal**: Registros, renovaciones, suspensiones.
- 📋 **Suscripción**: Cambios de plan, vencimientos.
- 👤 **Usuario**: Nuevos registros, desactivaciones.
- 💳 **Pago**: Pagos procesados.

Cada evento muestra:
- Ícono con color según tipo.
- Descripción del evento.
- Tiempo relativo (ej: "Hace 2 horas", "Hace 3 días").

---

## 6. Gestión de Sucursales

**Ruta:** `/sucursales`

Permite administrar todas las sucursales (tiendas) registradas en la plataforma.

### Vista principal

Una **tabla** con las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| **Sucursal** | Nombre de la tienda + número de RUC |
| **Propietario** | Nombre del dueño + email |
| **Plan** | Tipo de plan (Mensual / Anual) en badge |
| **Vencimiento** | Fecha de expiración del plan |
| **Estado** | Badge de color: 🟢 Activa, 🟡 Suspendida, 🔴 Vencida |
| **Acciones** | Botones de operación |

### Operaciones disponibles

#### ➕ Crear nueva sucursal

1. Haz clic en el botón **"+ Nueva Sucursal"** (esquina superior derecha).
2. Se te pedirá en orden:
   - **Nombre** de la sucursal (ej: "Fashion Store Lima").
   - **Nombre del propietario** (ej: "María López").
   - **Plan**: escribe `mensual` o `anual`.
3. El sistema generará automáticamente:
   - Un RUC aleatorio.
   - Un usuario administrador asociado a la sucursal.
4. La sucursal aparecerá en la tabla con estado **Activa**.

#### ✏️ Editar sucursal

1. Haz clic en el botón **"Ver/Editar"** en la fila de la sucursal.
2. Podrás modificar:
   - El **nombre** de la sucursal.
   - El **plan** (mensual/anual).
3. Los cambios se guardan inmediatamente.

#### 🔄 Suspender / Activar sucursal

- Si la sucursal está **Activa**: aparece un botón **"Suspender"** (rojo).
  - Al hacer clic, la sucursal cambia a estado **Suspendida**.
- Si la sucursal está **Suspendida**: aparece un botón **"Activar"** (verde).
  - Al hacer clic, la sucursal vuelve a estado **Activa**.

> **Nota:** Las sucursales con estado **Vencida** pueden reactivarse desde la sección de Suscripciones.

---

## 7. Planes y Suscripciones

**Ruta:** `/suscripciones`

Gestiona los planes de suscripción de las sucursales.

### Planes disponibles

| Plan | Precio | Usuarios | Productos | Soporte | Reportes |
|------|--------|----------|-----------|---------|----------|
| **Mensual** | S/ 99/mes | Hasta 5 | 500 máx. | Email | Básicos |
| **Anual** | S/ 990/año | Hasta 10 | Ilimitados | 24/7 | Avanzados + 15% dto. |

### Tarjetas de KPIs

| Tarjeta | Descripción |
|---------|-------------|
| **Total Suscripciones** | Cantidad de suscripciones registradas |
| **Activas** | Suscripciones vigentes |
| **Vencidas** | Suscripciones expiradas |
| **Ingresos Mensuales** | Estimación en S/ |

### Tabla de suscripciones

| Columna | Descripción |
|---------|-------------|
| **Sucursal** | Nombre + método de pago |
| **Plan** | Badge mensual/anual |
| **Precio** | Monto en S/ |
| **Inicio** | Fecha de inicio del plan |
| **Vencimiento** | Fecha de expiración |
| **Estado** | 🟢 Activa, 🟡 Suspendida, 🔴 Vencida |
| **Acciones** | Botones contextuales |

### Operaciones disponibles

#### ✏️ Ver/Editar suscripción

1. Haz clic en **"Ver/Editar"**.
2. Modifica el nombre de la sucursal o el plan.

#### 🔄 Renovar suscripción (solo para vencidas)

1. En una suscripción con estado **Vencida**, haz clic en **"Renovar"**.
2. Confirma la acción.
3. El sistema actualiza las fechas y reactiva la sucursal.

#### ❌ Cancelar suscripción (solo para activas)

1. En una suscripción **Activa**, haz clic en **"Cancelar"**.
2. Confirma la acción.
3. La suscripción cambia a estado **Suspendida**.

---

## 8. Estado de Pagos

**Ruta:** `/suscripciones/estado-pagos`

Monitorea el estado de los pagos de todas las suscripciones.

### Tarjetas de resumen (clickeables)

| Tarjeta | Color | Descripción |
|---------|-------|-------------|
| **Total** | 🟣 Violeta | Total de suscripciones (clic para ver todas) |
| **Al Día** | 🟢 Verde | Pagos al corriente |
| **Por Vencer** | 🟡 Amarillo | Vencen en los próximos 7 días |
| **Vencidas** | 🔴 Rojo | Pagos atrasados |

> 💡 **Tip:** Haz clic en cualquier tarjeta para **filtrar** la tabla por ese estado.

### Barra de filtros

Botones adicionales para filtrar: **Todos** | **Al día** | **Por vencer** | **Vencida**.

### Tabla de detalle

| Columna | Descripción |
|---------|-------------|
| **Sucursal** | Nombre de la tienda |
| **Plan** | Tipo de plan |
| **Estado** | Badge de estado de pago |
| **Último Pago** | Fecha del último pago registrado |
| **Próximo Pago** | Fecha del próximo pago esperado |
| **Monto Pendiente** | 🔴 Rojo si hay deuda, 🟢 Verde si está al día (S/ 0) |
| **Días Restantes** | Indicador visual con color según urgencia |
| **Acciones** | Botones contextuales |

### Operaciones disponibles

#### ✏️ Ver/Editar

- Permite modificar nombre de sucursal y plan.

#### 📧 Notificar (solo para vencidas)

1. En un pago **Vencido**, haz clic en **"Notificar"**.
2. El sistema marca la suscripción como gestionada y la renueva automáticamente.

---

## 9. Gestión de Usuarios

**Ruta:** `/usuarios`

Administra todos los usuarios de todas las sucursales.

### Tarjetas de KPIs

| Tarjeta | Descripción |
|---------|-------------|
| **Total Usuarios** | Cantidad total registrada |
| **Usuarios Activos** | Con estado activo |
| **Administradores** | Usuarios con rol admin |
| **Vendedores** | Usuarios con rol vendedor |

### Filtros disponibles

| Filtro | Opciones |
|--------|----------|
| **Por Estado** | Todos / Activos / Inactivos / Suspendidos |
| **Por Rol** | Todos / Administrador / Vendedor / Almacenero |

### Tabla de usuarios

| Columna | Descripción |
|---------|-------------|
| **Usuario** | Nombre completo + email |
| **Sucursal** | Tienda a la que pertenece |
| **Rol** | Badge con color según rol (Admin=azul, Vendedor=verde, Almacenero=naranja) |
| **Último Acceso** | Fecha y hora del último ingreso |
| **Estado** | 🟢 Activo, 🟡 Suspendido, 🔴 Inactivo |
| **Acciones** | Botones de operación |

### Roles de usuario

| Rol | Descripción | Permisos típicos |
|-----|-------------|------------------|
| **Administrador** | Gestiona toda la sucursal | Ventas, inventario, reportes, usuarios, configuración, clientes, compras |
| **Vendedor** | Atiende ventas y clientes | Ventas, clientes |
| **Almacenero** | Gestiona inventario | Inventario, compras |

### Operaciones disponibles

#### 👁️ Ver usuario

- Haz clic en **"Ver"** para consultar los detalles del usuario.
- *(Funcionalidad en desarrollo — actualmente muestra una alerta informativa.)*

#### 🔄 Activar / Desactivar usuario

- Si el usuario está **Activo**: aparece botón **"Desactivar"**.
- Si el usuario está **Inactivo/Suspendido**: aparece botón **"Activar"**.

#### ➕ Nuevo usuario

- Haz clic en **"+ Nuevo Usuario"**.
- *(Funcionalidad en desarrollo — actualmente muestra una alerta informativa.)*

> 📝 **Nota:** Cuando creas una nueva sucursal, el sistema genera automáticamente un usuario administrador para esa sucursal.

---

## 10. Soporte — Detalle de Tickets

**Ruta:** `/tickets/detalle`

Permite atender los tickets de soporte enviados por los usuarios de las sucursales.

### Diseño de la página

La página tiene un diseño de **dos paneles**:

```
┌─────────────────────┬────────────────────────────────────┐
│   Lista de Tickets  │        Detalle del Ticket          │
│                     │                                    │
│   [Ticket 1] ◄──── │   Información completa             │
│    Ticket 2         │   + Acciones rápidas               │
│    Ticket 3         │   + Historial de cambios           │
│                     │                                    │
└─────────────────────┴────────────────────────────────────┘
```

### Panel izquierdo — Lista de tickets

- Muestra todos los tickets disponibles.
- Cada ticket muestra: **Asunto** + ID + Nombre del tenant (sucursal).
- Haz clic en un ticket para ver su detalle en el panel derecho.
- La lista se **actualiza automáticamente** cada 5 segundos.

### Panel derecho — Detalle del ticket

Al seleccionar un ticket, verás:

#### Información del ticket

| Campo | Descripción |
|-------|-------------|
| **ID** | Identificador único |
| **Tenant** | Nombre de la sucursal que reportó |
| **Asunto** | Título del problema |
| **Descripción** | Detalle completo del problema |
| **Prioridad** | Baja / Media / Alta / Urgente |
| **Estado** | Abierto / En Proceso / Resuelto / Cerrado |
| **Respuesta** | Respuesta del agente (si existe) |
| **Fechas** | Creación y última actualización |

#### Acciones rápidas

1. **Cambiar estado del ticket:**
   - Selecciona el nuevo estado del dropdown: `Abierto`, `En Proceso`, `Resuelto`, `Cerrado`.
   - Haz clic en **"Guardar estado"**.
   - El cambio queda registrado en el historial.

2. **Asignar agente:**
   - Escribe el email o nombre del agente en el campo **"Atendido por"**.

3. **Responder ticket:**
   - Escribe la respuesta en el **textarea**.
   - Haz clic en **"Guardar respuesta"**.
   - La respuesta queda registrada y visible para el usuario de la sucursal.

#### Historial de cambios (Timeline)

Debajo de las acciones, se muestra una **línea de tiempo** con todos los eventos del ticket:

- 📝 **Creación** del ticket.
- 🔄 **Cambios de estado** (ej: de "Abierto" a "En Proceso").
- 💬 **Respuestas** del agente.

Cada evento muestra: tipo, usuario responsable y fecha/hora.

### Flujo típico de atención

1. **Selecciona** un ticket de la lista.
2. **Lee** la descripción del problema.
3. **Cambia el estado** a "En Proceso" y guarda.
4. **Escribe una respuesta** con la solución o solicitud de más información.
5. Cuando se resuelva, **cambia el estado** a "Resuelto" o "Cerrado".

> 🔄 **Sincronización:** Los tickets se comparten entre el frontend principal y el panel superadmin mediante `localStorage` y cookies, permitiendo una comunicación bidireccional.

---

## 11. Persistencia de Datos

Toda la información se almacena **localmente en el navegador**. No se envía nada a un servidor.

| Dato | Clave en localStorage | Notas |
|------|-----------------------|-------|
| Sesión de usuario | `superadmin_user` | Se borra al cerrar sesión |
| Sucursales | `sa_sucursales` | Datos de todas las tiendas |
| Usuarios | `sa_usuarios` | Datos de todos los usuarios |
| Tickets (lista) | `frontend.tickets.mock.list` | Compartido con el frontend principal |
| Tickets (historial) | `frontend.tickets.mock.historial` | Compartido con el frontend principal |
| Suscripciones | *(derivadas de sucursales)* | No tienen almacenamiento propio |
| Pagos | *(datos en memoria)* | Se calculan al cargar la página |

### ⚠️ Importante

- **Limpiar el `localStorage` del navegador borrará todos los datos.** Estos se regenerarán con los datos mock por defecto la próxima vez que cargues la aplicación.
- Para resetear los datos a su estado inicial, puedes abrir la consola del navegador (`F12` > Console) y ejecutar:
  ```javascript
  localStorage.removeItem('sa_sucursales');
  localStorage.removeItem('sa_usuarios');
  location.reload();
  ```

---

## 12. Preguntas Frecuentes

### ¿Cómo reseteo todos los datos?

Abre la consola del navegador (`F12` > Console) y ejecuta:
```javascript
localStorage.clear();
location.reload();
```

### ¿Por qué no veo cambios en los tickets desde el frontend principal?

Asegúrate de que ambas aplicaciones (frontend en puerto `5173` y superadmin en puerto `5174`) estén **corriendo en el mismo navegador y dominio** (`localhost`), ya que comparten datos mediante `localStorage` y cookies.

### ¿Los datos se pierden al cerrar el navegador?

No. Los datos persisten en `localStorage` hasta que sea limpiado manualmente o por el navegador (en modo incógnito se pierden al cerrar).

### ¿Puedo crear más de un superadministrador?

No. Actualmente solo existe un usuario superadmin con credenciales fijas. Esta funcionalidad se ampliará cuando se implemente el backend real.

### ¿Qué pasa si suspendo una sucursal?

- La sucursal cambia a estado **Suspendida**.
- Sus usuarios y suscripción reflejan el cambio.
- Puede reactivarse en cualquier momento desde la tabla de sucursales.

### ¿La aplicación funciona en móvil?

La interfaz es parcialmente responsive. El sidebar se oculta en pantallas menores a 768px. Se recomienda usar la aplicación en **desktop** para una experiencia completa.

---

> 📌 **Este manual corresponde a la versión de desarrollo con datos mock. Las funcionalidades pueden cambiar cuando se integre el backend real con Spring Boot.**
