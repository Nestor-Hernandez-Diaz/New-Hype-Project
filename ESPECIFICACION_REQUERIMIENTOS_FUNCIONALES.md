# 📋 ESPECIFICACIÓN DE REQUERIMIENTOS FUNCIONALES

**Proyecto:** New Hype Project - Sistema de Gestión Empresarial SaaS Multi-Tenant  
**Cliente:** Propietario de la Plataforma  
**Fecha de Elaboración:** 30 de Enero, 2026  
**Versión del Documento:** 3.0  
**Estado:** Arquitectura Multi-Tenant ✅

---

## 📑 ÍNDICE DE REQUERIMIENTOS

### NIVEL 1: Módulos de Plataforma (SaaS Multi-Tenant)
- [Módulo SUP: Superadmin](#módulo-sup-superadmin) (10 RFs)
- [Módulo SUB: Suscripciones](#módulo-sub-suscripciones) (10 RFs)

### NIVEL 2: Módulos de Tienda (Tenant/Admin)
- [Módulo AUT: Autenticación](#módulo-aut-autenticación) (8 RFs)
- [Módulo USR: Usuarios](#módulo-usr-usuarios) (10 RFs)
- [Módulo ENT: Entidades Comerciales](#módulo-ent-entidades-comerciales) (10 RFs)
- [Módulo VNT: Ventas](#módulo-vnt-ventas) (9 RFs)
- [Módulo PRD: Productos](#módulo-prd-productos) (8 RFs)
- [Módulo INV: Inventario](#módulo-inv-inventario) (10 RFs)
- [Módulo COM: Compras](#módulo-com-compras) (9 RFs)
- [Módulo CFG: Configuración](#módulo-cfg-configuración) (7 RFs)
- [Módulo REP: Reportes](#módulo-rep-reportes) (7 RFs)

### NIVEL 3: Módulos de Cliente (Storefront/B2C)
- [Módulo CLI: Cliente](#módulo-cli-cliente) (13 RFs)

**TOTAL: 111 Requerimientos Funcionales**

---

# MÓDULO SUP: SUPERADMIN

**Código Módulo:** SUP  
**Prioridad:** CRÍTICA  
**Descripción:** Gestión de la plataforma SaaS completa

---

## RF-SUP-001: Crear nueva tienda (tenant)

| REQUERIMIENTO | RF-SUP-001: Registrar nueva tienda en la plataforma | Versión: 1.0 |
|---------------|------------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Permitir al dueño de la plataforma crear una nueva instancia de tienda para un comerciante, generando automáticamente toda la infraestructura necesaria (base de datos, usuario inicial, configuración). |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin accede a la opción "Crear Nueva Tienda" desde el panel de administración global
- El sistema presenta un formulario de registro con los siguientes campos obligatorios:
  - Nombre de la tienda
  - RUC/DNI del propietario
  - Nombre del propietario
  - Correo electrónico
  - Teléfono
  - Dirección
  - Subdominio único (ej: tienda-juan)
  - Plan asignado (Básico/Pro/Premium)
  - Fecha de inicio de suscripción
- El Superadmin completa todos los datos del comerciante
- El sistema valida la disponibilidad del subdominio
- El sistema genera automáticamente:
  - tenant_id único
  - Base de datos o schema separado
  - Usuario administrador inicial para la tienda
  - Configuración por defecto
- El sistema envía credenciales de acceso al correo del comerciante
- El sistema activa la tienda con estado ACTIVA
- Se crea un registro de creación en el log de auditoría

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUP-002: Ver lista de todas las tiendas

| REQUERIMIENTO | RF-SUP-002: Listar todas las tiendas de la plataforma | Versión: 1.0 |
|---------------|--------------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Visualizar todas las tiendas registradas en la plataforma con información clave para monitoreo y gestión. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin accede al panel "Gestión de Tiendas"
- El sistema muestra una tabla con todas las tiendas registradas
- Para cada tienda se visualiza:
  - Nombre de la tienda
  - Propietario
  - Plan actual
  - Estado (Activa/Suspendida/Vencida)
  - Fecha de vencimiento de suscripción
  - Última actividad
- El Superadmin puede aplicar filtros:
  - Por estado (Activa/Suspendida/Vencida)
  - Por plan (Básico/Pro/Premium)
  - Búsqueda por nombre, RUC o subdominio
- El sistema implementa paginación (20 registros por página)
- El Superadmin puede hacer clic en cualquier tienda para ver detalles completos

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUP-003: Ver detalle de tienda específica

| REQUERIMIENTO | RF-SUP-003: Consultar información completa de una tienda | Versión: 1.0 |
|---------------|----------------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Visualizar toda la información detallada de una tienda específica para análisis y toma de decisiones. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin selecciona una tienda de la lista
- El sistema muestra un panel detallado con:
  - **Datos del propietario:** nombre, RUC, correo, teléfono, dirección
  - **Información de suscripción:** plan actual, fecha de vencimiento, estado de pago
  - **Métricas de uso:**
    - Total de productos registrados
    - Total de ventas del mes
    - Número de usuarios activos
    - Espacio de almacenamiento usado
  - **Historial de pagos:** lista de todos los pagos realizados
  - **Módulos activos:** funcionalidades habilitadas según el plan
  - **Última actividad:** fecha y hora del último acceso
  - **Logs recientes:** últimas acciones importantes
- El Superadmin puede acceder a acciones rápidas desde este panel

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUP-004: Actualizar datos de tienda

| REQUERIMIENTO | RF-SUP-004: Modificar información de una tienda | Versión: 1.0 |
|---------------|------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Permitir modificar datos de una tienda existente, incluyendo plan asignado, límites de uso y módulos habilitados. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin accede a la opción "Editar Tienda"
- El sistema muestra formulario con datos actuales:
  - Nombre de tienda
  - Plan asignado
  - Fecha de vencimiento
  - Límites (productos, usuarios, almacenes)
  - Módulos habilitados
- El Superadmin modifica los campos necesarios
- El sistema valida los cambios
- Si se cambia el plan:
  - El sistema actualiza automáticamente los límites
  - El sistema habilita/deshabilita módulos según el nuevo plan
  - El sistema valida que la tienda no exceda los nuevos límites
- El sistema registra el cambio en auditoría con:
  - Usuario que realizó el cambio
  - Fecha y hora
  - Valores anteriores y nuevos
- Los cambios aplican inmediatamente en la tienda

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUP-005: Suspender o activar tienda

| REQUERIMIENTO | RF-SUP-005: Cambiar estado de una tienda | Versión: 1.0 |
|---------------|------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Pausar o reactivar el acceso completo a una tienda según sea necesario (por falta de pago, violación de términos, etc.). |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin selecciona una tienda
- El Superadmin elige "Suspender" o "Activar"
- **Si suspende:**
  - El sistema solicita motivo de suspensión:
    - Falta de pago
    - Violación de términos de servicio
    - Solicitud del comerciante
    - Mantenimiento técnico
  - El Superadmin ingresa el motivo
  - El sistema cambia estado a SUSPENDIDA
  - El sistema bloquea el acceso de todos los usuarios de esa tienda
  - El sistema muestra mensaje en el login: "Tienda suspendida, contacte a soporte"
  - El sistema oculta el storefront público
  - El sistema envía notificación al comerciante
- **Si activa:**
  - El sistema cambia estado a ACTIVA
  - El sistema restaura el acceso completo
  - El sistema reactiva el storefront público
  - El sistema envía notificación de reactivación
- El sistema registra la acción en auditoría

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUP-006: Ver métricas globales de ingresos

| REQUERIMIENTO | RF-SUP-006: Dashboard de ingresos de la plataforma | Versión: 1.0 |
|---------------|-----------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Visualizar métricas financieras globales de todos los ingresos generados por suscripciones en la plataforma. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin accede al "Dashboard Global"
- El sistema calcula y muestra en tiempo real:
  - **Ingresos del mes actual:** total recaudado en el mes
  - **Ingresos por plan:**
    - Plan Básico: cantidad de tiendas × monto
    - Plan Pro: cantidad de tiendas × monto
    - Plan Premium: cantidad de tiendas × monto
  - **Top 10 tiendas que pagan más:** ranking de mayores contribuyentes
  - **Tiendas con pago vencido:** lista de tiendas morosas
  - **Tasa de renovación:** porcentaje de tiendas que renovaron vs las que cancelaron
  - **Gráfico de tendencia mensual:** evolución de ingresos últimos 12 meses
  - **Proyección de ingresos:** estimación para el próximo mes
- El Superadmin puede seleccionar rango de fechas personalizado
- El sistema permite exportar reportes en Excel/PDF

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUP-007: Ver módulos activos por tienda

| REQUERIMIENTO | RF-SUP-007: Consultar módulos habilitados según plan | Versión: 1.0 |
|---------------|------------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Visualizar qué funcionalidades tiene activa cada tienda según su plan de suscripción. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin consulta una tienda específica
- El sistema muestra matriz de módulos según plan:
  - **Plan Básico incluye:**
    - Productos (limitado)
    - Ventas básicas
    - Inventario simple
  - **Plan Pro incluye:**
    - Todo lo del Básico +
    - Compras
    - Reportes avanzados
    - Multi-almacén
    - Notas de crédito
  - **Plan Premium incluye:**
    - Todo lo del Pro +
    - Liquidaciones
    - API REST
    - Integraciones de terceros
    - Soporte prioritario
- El Superadmin puede activar/desactivar módulos manualmente (override)
- El sistema valida que módulos dependientes estén activos
- Los cambios aplican inmediatamente en la interfaz de la tienda

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUP-008: Gestionar tickets de soporte

| REQUERIMIENTO | RF-SUP-008: Administrar solicitudes de ayuda de comerciantes | Versión: 1.0 |
|---------------|--------------------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Recibir, gestionar y resolver tickets de soporte enviados por los comerciantes de las tiendas. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- Los comerciantes envían tickets desde su panel admin
- El Superadmin ve lista de tickets en cola con:
  - Número de ticket
  - Tienda origen
  - Asunto
  - Prioridad (Baja/Media/Alta/Crítica)
  - Estado (Abierto/En proceso/Cerrado)
  - Fecha de creación
- El Superadmin puede:
  - Filtrar por estado y prioridad
  - Ver detalle completo del problema
  - Responder al comerciante (chat interno)
  - Cambiar prioridad y estado
  - Acceder temporalmente a la tienda del comerciante (modo soporte)
  - Adjuntar archivos de ayuda
  - Cerrar ticket al resolver
- El sistema envía notificaciones al comerciante en cada actualización
- El sistema calcula tiempo de respuesta y resolución

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUP-009: Eliminar tienda (soft delete)

| REQUERIMIENTO | RF-SUP-009: Desactivar permanentemente una tienda | Versión: 1.0 |
|---------------|---------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Eliminar lógicamente una tienda de la plataforma conservando sus datos para auditoría. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin selecciona la tienda a eliminar
- El Superadmin elige "Eliminar Tienda"
- El sistema valida que no tenga suscripción activa pendiente de pago
- El sistema solicita confirmación y motivo de eliminación
- El Superadmin confirma y proporciona motivo
- El sistema realiza soft delete:
  - Marca campo deleted_at = fecha/hora actual
  - Conserva todos los datos para auditoría
  - Bloquea acceso total a la tienda
  - Oculta la tienda de listados activos
  - Libera el subdominio para futura reutilización
- El sistema puede generar backup automático de datos del comerciante
- El sistema envía notificación final al comerciante
- El comerciante puede solicitar exportación de datos (30 días)

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUP-010: Ver logs de auditoría multi-tenant

| REQUERIMIENTO | RF-SUP-010: Consultar actividad global de la plataforma | Versión: 1.0 |
|---------------|--------------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Visualizar logs de actividad administrativa de todas las tiendas para seguridad y cumplimiento. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin accede a "Auditoría Global"
- El sistema muestra logs de:
  - Creación y edición de tiendas
  - Cambios de plan de suscripción
  - Suspensiones y activaciones
  - Accesos de Superadmin a tiendas (modo soporte)
  - Pagos procesados
  - Intentos de acceso fallidos
  - Cambios en configuración global
- El Superadmin puede filtrar por:
  - Tienda específica
  - Tipo de acción
  - Usuario que ejecutó la acción
  - Rango de fechas
- Cada log muestra:
  - Timestamp exacto
  - Usuario responsable
  - Acción realizada
  - IP de origen
  - Datos antes/después del cambio
- El Superadmin puede exportar logs para análisis externo

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

# MÓDULO SUB: SUSCRIPCIONES

**Código Módulo:** SUB  
**Prioridad:** CRÍTICA  
**Descripción:** Gestión de planes, pagos y facturación

---

## RF-SUB-001: Crear plan de suscripción

| REQUERIMIENTO | RF-SUB-001: Definir nuevo plan comercial | Versión: 1.0 |
|---------------|------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Crear planes de suscripción con características, precios y límites específicos para ofrecer a los comerciantes. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin accede a "Gestión de Planes"
- El Superadmin selecciona "Crear Nuevo Plan"
- El sistema presenta formulario con campos:
  - **Información básica:**
    - Nombre del plan (ej: Básico/Pro/Premium)
    - Descripción comercial
    - Icono o color distintivo
  - **Precios:**
    - Precio mensual
    - Precio anual (con descuento opcional)
    - Moneda (PEN/USD)
  - **Límites técnicos:**
    - Máximo de productos
    - Máximo de usuarios
    - Máximo de almacenes
    - Máximo de ventas por mes
    - Espacio de almacenamiento (GB)
  - **Módulos incluidos:** checkboxes de funcionalidades
  - **Periodo de prueba:** días gratuitos
- El Superadmin completa configuración
- El sistema valida unicidad del nombre
- El sistema guarda plan con estado ACTIVO
- El plan queda disponible para asignar a tiendas nuevas

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUB-002: Ver lista de planes

| REQUERIMIENTO | RF-SUB-002: Listar todos los planes disponibles | Versión: 1.0 |
|---------------|------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Visualizar todos los planes de suscripción configurados en la plataforma. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin accede a "Planes de Suscripción"
- El sistema muestra tabla con todos los planes:
  - Nombre del plan
  - Precio mensual
  - Precio anual
  - Cantidad de tiendas suscritas actualmente
  - Estado (Activo/Inactivo)
  - Acciones (Editar/Desactivar)
- El Superadmin puede ordenar por precio o popularidad
- El Superadmin puede ver comparativa de planes
- El sistema muestra resumen de ingresos por plan

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

## RF-SUB-003: Actualizar plan de suscripción

| REQUERIMIENTO | RF-SUB-003: Modificar características de un plan | Versión: 1.0 |
|---------------|------------------------------------------------|--------------|
| **RESPONSABLE** | Superadmin |
| **OBJETIVO** | Editar precios, límites o módulos de un plan existente sin afectar tiendas ya suscritas. |
| **DESCRIPCIÓN** | |

**Flujo Principal:**
- El Superadmin selecciona plan a editar
- El sistema muestra formulario con valores actuales
- El Superadmin modifica:
  - Precio (afecta solo nuevas suscripciones)
  - Límites técnicos
  - Módulos incluidos
- El sistema muestra advertencia:
  - "Los cambios NO afectarán tiendas existentes automáticamente"
  - "Requiere migración manual si desea aplicar a clientes actuales"
- El Superadmin confirma cambios
- El sistema actualiza plan
- Nuevas suscripciones usan configuración actualizada
- Tiendas existentes mantienen su configuración original

| **ELABORADO POR:** | | **ACEPTADO POR:** | |
|--------------------|---------|-------------------|---------|
| Equipo de Desarrollo | Fecha: 30/01/2026 | Product Owner | Fecha: |

---

*[El documento continúa con los 100+ requerimientos restantes siguiendo el mismo formato...]*

---

# RESUMEN EJECUTIVO

## Totales por Módulo

| Nivel | Módulo | Código | Total RFs | Estado |
|-------|--------|--------|-----------|--------|
| **NIVEL 1: PLATAFORMA** |
| | Superadmin | SUP | 10 | 🆕 Nuevo |
| | Suscripciones | SUB | 10 | 🆕 Nuevo |
| **NIVEL 2: TIENDA (TENANT)** |
| | Autenticación | AUT | 8 | ✅ Actualizado |
| | Usuarios | USR | 10 | ✅ Completo |
| | Entidades Comerciales | ENT | 10 | ✅ Completo |
| | Ventas | VNT | 9 | ✅ Completo |
| | Productos | PRD | 8 | ✅ Completo |
| | Inventario | INV | 10 | ✅ Completo |
| | Compras | COM | 9 | ✅ Completo |
| | Configuración | CFG | 7 | ✅ Completo |
| | Reportes | REP | 7 | ✅ Completo |
| **NIVEL 3: CLIENTE (B2C)** |
| | Cliente/Storefront | CLI | 13 | 🆕 Nuevo |
| **TOTAL** | | | **111** | **✅** |

---

## Control de Versiones

| Versión | Fecha | Autor | Cambios Principales |
|---------|-------|-------|---------------------|
| 1.0 | 07/01/2026 | Equipo Dev | Versión inicial mono-tenant |
| 2.0 | 30/01/2026 | Equipo Dev | Agregado dominio de ropa |
| 3.0 | 30/01/2026 | Equipo Dev | Arquitectura multi-tenant SaaS completa |

---

**Nota:** Este documento contiene la especificación completa de 111 requerimientos funcionales. 
Por razones de extensión, se muestran los primeros módulos como ejemplo del formato.
Para acceder al documento completo con todos los RFs en este formato, se generará en iteraciones por módulo.

---

**ELABORADO POR:** Equipo de Desarrollo  
**APROBADO POR:** Product Owner  
**FECHA:** 30 de Enero, 2026
