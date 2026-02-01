# 📋 REQUERIMIENTOS FUNCIONALES - SISTEMA

**Documento Oficial de Requerimientos Funcionales**  
**Proyecto:** New Hype Proyect - Sistema de Gestión Empresarial SaaS Multi-Tenant  
**Fecha:** 30 de Enero, 2026  
**Versión:** 3.0  
**Estado:** Arquitectura Multi-Tenant ✅

---

## 📑 ÍNDICE

### Módulos de Plataforma (SaaS Multi-Tenant)
1. [Módulo de Superadmin](#1-módulo-de-superadmin)
2. [Módulo de Suscripciones](#2-módulo-de-suscripciones)

### Módulos de Tienda (Tenant/Admin)
3. [Módulo de Autenticación](#3-módulo-de-autenticación)
4. [Módulo de Usuarios](#4-módulo-de-usuarios)
5. [Módulo de Entidades Comerciales](#5-módulo-de-entidades-comerciales)
6. [Módulo de Ventas](#6-módulo-de-ventas)
7. [Módulo de Productos](#7-módulo-de-productos)
8. [Módulo de Inventario](#8-módulo-de-inventario)
9. [Módulo de Compras](#9-módulo-de-compras)
10. [Módulo de Configuración](#10-módulo-de-configuración)
11. [Módulo de Reportes](#11-módulo-de-reportes)

### Módulos de Cliente (Storefront/B2C)
12. [Módulo de Cliente](#12-módulo-de-cliente)

---

## 1. MÓDULO DE SUPERADMIN

**Código Módulo:** SUP  
**Prioridad:** CRÍTICA  
**Estado:** 🆕 Nuevo (Arquitectura Multi-Tenant)

**Descripción:** Módulo para gestionar la plataforma SaaS completa. Permite al dueño del software (Superadmin) crear y administrar tiendas (tenants), monitorear métricas globales, gestionar suscripciones y brindar soporte técnico centralizado.

---

### RF-SUP-001: Crear nueva tienda (tenant)

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUP-001 |
| **Nombre** | Registrar nueva tienda en la plataforma |
| **Objetivo** | El sistema permite al Superadmin crear una nueva instancia de tienda para un comerciante. |
| **Actor** | Superadmin |
| **Entradas** | • Nombre de la tienda<br>• RUC/DNI del propietario<br>• Nombre del propietario<br>• Correo electrónico<br>• Teléfono<br>• Dirección<br>• Subdominio (ej: tienda-juan)<br>• Plan asignado (Básico/Pro/Premium)<br>• Fecha de inicio de suscripción |
| **Precondición** | El Superadmin debe estar autenticado en el sistema. |
| **Proceso** | 1. El Superadmin accede a la opción "Crear Nueva Tienda"<br>2. El sistema muestra el formulario de registro<br>3. El Superadmin completa los datos del comerciante<br>4. El Superadmin selecciona el subdominio único (valida disponibilidad)<br>5. El Superadmin asigna un plan de suscripción<br>6. El sistema genera automáticamente:<br>&nbsp;&nbsp;&nbsp;• tenant_id único<br>&nbsp;&nbsp;&nbsp;• Base de datos/schema separado (o partición lógica)<br>&nbsp;&nbsp;&nbsp;• Usuario administrador inicial para la tienda<br>&nbsp;&nbsp;&nbsp;• Configuración por defecto<br>7. El sistema envía credenciales de acceso al correo del comerciante<br>8. El sistema activa la tienda con estado ACTIVA |
| **Salidas / Resultado esperado** | Nueva tienda creada y funcional con acceso independiente. |
| **Postcondición** | El comerciante puede acceder a su panel admin en subdominio.tudominio.com |

---

### RF-SUP-002: Ver lista de todas las tiendas

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUP-002 |
| **Nombre** | Listar todas las tiendas de la plataforma |
| **Objetivo** | El sistema permite al Superadmin visualizar todas las tiendas registradas con información clave. |
| **Actor** | Superadmin |
| **Entradas** | • Filtros: estado (Activa/Suspendida/Vencida)<br>• Filtros: plan (Básico/Pro/Premium)<br>• Búsqueda: nombre, RUC, subdominio<br>• Cantidad de registros por página |
| **Precondición** | El Superadmin debe estar autenticado. |
| **Proceso** | 1. El Superadmin accede al panel "Gestión de Tiendas"<br>2. El sistema muestra tabla con todas las tiendas<br>3. El Superadmin puede filtrar y buscar<br>4. El sistema muestra: nombre, propietario, plan, estado, fecha vencimiento, última actividad |
| **Salidas / Resultado esperado** | Lista completa de tiendas con métricas principales. |
| **Postcondición** | El Superadmin obtiene visión global de todas las tiendas activas. |

---

### RF-SUP-003: Ver detalle de tienda específica

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUP-003 |
| **Nombre** | Consultar información completa de una tienda |
| **Objetivo** | El sistema permite al Superadmin ver todos los detalles de una tienda específica. |
| **Actor** | Superadmin |
| **Entradas** | • Identificador de tienda (tenant_id) |
| **Precondición** | La tienda debe existir en el sistema. |
| **Proceso** | 1. El Superadmin selecciona una tienda de la lista<br>2. El sistema muestra:<br>&nbsp;&nbsp;&nbsp;• Datos del propietario<br>&nbsp;&nbsp;&nbsp;• Plan actual y fecha de vencimiento<br>&nbsp;&nbsp;&nbsp;• Estado de pago (al día/vencido)<br>&nbsp;&nbsp;&nbsp;• Métricas: productos, ventas, usuarios<br>&nbsp;&nbsp;&nbsp;• Historial de pagos<br>&nbsp;&nbsp;&nbsp;• Módulos activos<br>&nbsp;&nbsp;&nbsp;• Última actividad |
| **Salidas / Resultado esperado** | Información detallada de la tienda seleccionada. |
| **Postcondición** | El Superadmin obtiene contexto completo para tomar decisiones. |

---

### RF-SUP-004: Actualizar datos de tienda

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUP-004 |
| **Nombre** | Modificar información de una tienda |
| **Objetivo** | El sistema permite al Superadmin actualizar datos de una tienda existente. |
| **Actor** | Superadmin |
| **Entradas** | • Nombre de tienda<br>• Plan asignado<br>• Fecha de vencimiento<br>• Límites (productos, usuarios, almacenes)<br>• Módulos habilitados |
| **Precondición** | La tienda debe existir en el sistema. |
| **Proceso** | 1. El Superadmin accede a editar tienda<br>2. El sistema muestra formulario con datos actuales<br>3. El Superadmin modifica campos necesarios<br>4. El sistema valida cambios<br>5. Si cambia el plan, actualiza límites y módulos<br>6. El sistema registra el cambio en auditoría |
| **Salidas / Resultado esperado** | Datos de la tienda actualizados. |
| **Postcondición** | Los cambios aplican inmediatamente en la tienda. |

---

### RF-SUP-005: Suspender o activar tienda

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUP-005 |
| **Nombre** | Cambiar estado de una tienda |
| **Objetivo** | El sistema permite al Superadmin pausar o reactivar el acceso a una tienda. |
| **Actor** | Superadmin |
| **Entradas** | • Nuevo estado (Activa/Suspendida)<br>• Motivo de suspensión |
| **Precondición** | La tienda debe existir. |
| **Proceso** | 1. El Superadmin selecciona tienda<br>2. El Superadmin elige "Suspender" o "Activar"<br>3. Si suspende, ingresa motivo (falta de pago, violación términos, etc.)<br>4. El sistema cambia estado<br>5. Si SUSPENDIDA:<br>&nbsp;&nbsp;&nbsp;• Bloquea acceso de usuarios de esa tienda<br>&nbsp;&nbsp;&nbsp;• Muestra mensaje "Tienda suspendida, contacte soporte"<br>&nbsp;&nbsp;&nbsp;• Oculta storefront público<br>6. Si ACTIVA:<br>&nbsp;&nbsp;&nbsp;• Restaura acceso completo |
| **Salidas / Resultado esperado** | Tienda suspendida o activada según acción. |
| **Postcondición** | El comerciante y clientes no pueden acceder si está suspendida. |

---

### RF-SUP-006: Ver métricas globales de ingresos

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUP-006 |
| **Nombre** | Dashboard de ingresos de la plataforma |
| **Objetivo** | El sistema permite al Superadmin ver métricas financieras globales. |
| **Actor** | Superadmin |
| **Entradas** | • Rango de fechas (opcional) |
| **Precondición** | El Superadmin debe estar autenticado. |
| **Proceso** | 1. El Superadmin accede al Dashboard Global<br>2. El sistema calcula y muestra:<br>&nbsp;&nbsp;&nbsp;• Ingresos totales del mes<br>&nbsp;&nbsp;&nbsp;• Ingresos por plan (Básico vs Pro vs Premium)<br>&nbsp;&nbsp;&nbsp;• Tiendas que pagan más (top 10)<br>&nbsp;&nbsp;&nbsp;• Tiendas con pago vencido<br>&nbsp;&nbsp;&nbsp;• Tasa de renovación<br>&nbsp;&nbsp;&nbsp;• Gráficos de tendencia mensual |
| **Salidas / Resultado esperado** | Dashboard ejecutivo con KPIs financieros. |
| **Postcondición** | El Superadmin toma decisiones estratégicas basadas en datos. |

---

### RF-SUP-007: Ver módulos activos por tienda

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUP-007 |
| **Nombre** | Consultar módulos habilitados según plan |
| **Objetivo** | El sistema permite ver qué funcionalidades tiene activa cada tienda. |
| **Actor** | Superadmin |
| **Entradas** | • Identificador de tienda |
| **Precondición** | La tienda debe existir. |
| **Proceso** | 1. El Superadmin consulta tienda específica<br>2. El sistema muestra módulos según plan:<br>&nbsp;&nbsp;&nbsp;• **Básico**: Productos, Ventas, Inventario Básico<br>&nbsp;&nbsp;&nbsp;• **Pro**: + Compras, Reportes, Multi-almacén<br>&nbsp;&nbsp;&nbsp;• **Premium**: + Liquidaciones, API, Integraciones<br>3. El Superadmin puede activar/desactivar módulos manualmente |
| **Salidas / Resultado esperado** | Lista de módulos activos/inactivos por tienda. |
| **Postcondición** | Módulos disponibles en la tienda según configuración. |

---

### RF-SUP-008: Gestionar tickets de soporte

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUP-008 |
| **Nombre** | Administrar solicitudes de ayuda de comerciantes |
| **Objetivo** | El sistema permite al Superadmin recibir y atender tickets de soporte. |
| **Actor** | Superadmin |
| **Entradas** | • Filtros: estado (Abierto/En proceso/Cerrado)<br>• Filtros: prioridad (Baja/Media/Alta/Crítica) |
| **Precondición** | El Superadmin debe estar autenticado. |
| **Proceso** | 1. Los comerciantes envían tickets desde su panel<br>2. El Superadmin ve lista de tickets en cola<br>3. El Superadmin puede:<br>&nbsp;&nbsp;&nbsp;• Ver detalle del problema<br>&nbsp;&nbsp;&nbsp;• Responder al comerciante<br>&nbsp;&nbsp;&nbsp;• Cambiar estado/prioridad<br>&nbsp;&nbsp;&nbsp;• Acceder a la tienda del comerciante (modo soporte)<br>&nbsp;&nbsp;&nbsp;• Cerrar ticket al resolver |
| **Salidas / Resultado esperado** | Tickets gestionados y comerciantes atendidos. |
| **Postcondición** | Comerciantes reciben soporte técnico efectivo. |

---

### RF-SUP-009: Eliminar tienda (soft delete)

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUP-009 |
| **Nombre** | Desactivar permanentemente una tienda |
| **Objetivo** | El sistema permite al Superadmin eliminar lógicamente una tienda. |
| **Actor** | Superadmin |
| **Entradas** | • Identificador de tienda<br>• Motivo de eliminación |
| **Precondición** | La tienda debe existir y no tener suscripción activa pendiente. |
| **Proceso** | 1. El Superadmin selecciona tienda<br>2. El Superadmin elige "Eliminar Tienda"<br>3. El sistema solicita confirmación y motivo<br>4. El sistema realiza soft delete:<br>&nbsp;&nbsp;&nbsp;• Marca deleted_at = NOW()<br>&nbsp;&nbsp;&nbsp;• Conserva datos para auditoría<br>&nbsp;&nbsp;&nbsp;• Bloquea acceso total<br>&nbsp;&nbsp;&nbsp;• Oculta de listas activas<br>5. El sistema puede generar backup de datos del comerciante |
| **Salidas / Resultado esperado** | Tienda eliminada lógicamente, datos conservados. |
| **Postcondición** | La tienda no aparece en listados activos pero se conserva historial. |

---

### RF-SUP-010: Ver logs de auditoría multi-tenant

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUP-010 |
| **Nombre** | Consultar actividad global de la plataforma |
| **Objetivo** | El sistema permite al Superadmin ver logs de actividad de todas las tiendas. |
| **Actor** | Superadmin |
| **Entradas** | • Filtros: tienda específica<br>• Filtros: tipo de acción<br>• Rango de fechas |
| **Precondición** | El Superadmin debe estar autenticado. |
| **Proceso** | 1. El Superadmin accede a "Auditoría Global"<br>2. El sistema muestra logs de:<br>&nbsp;&nbsp;&nbsp;• Creación/edición de tiendas<br>&nbsp;&nbsp;&nbsp;• Cambios de plan<br>&nbsp;&nbsp;&nbsp;• Suspensiones/activaciones<br>&nbsp;&nbsp;&nbsp;• Accesos de Superadmin a tiendas<br>&nbsp;&nbsp;&nbsp;• Pagos procesados<br>3. El Superadmin puede exportar logs |
| **Salidas / Resultado esperado** | Registro completo de actividad administrativa. |
| **Postcondición** | Trazabilidad completa para seguridad y cumplimiento. |

---

## 2. MÓDULO DE SUSCRIPCIONES

**Código Módulo:** SUB  
**Prioridad:** CRÍTICA  
**Estado:** 🆕 Nuevo (Monetización)

**Descripción:** Módulo para gestionar planes de suscripción, pagos recurrentes, facturación y control de vencimientos de las tiendas.

---

### RF-SUB-001: Crear plan de suscripción

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUB-001 |
| **Nombre** | Definir nuevo plan comercial |
| **Objetivo** | El sistema permite al Superadmin crear planes de suscripción con características específicas. |
| **Actor** | Superadmin |
| **Entradas** | • Nombre del plan (Básico/Pro/Premium)<br>• Descripción<br>• Precio mensual<br>• Precio anual (con descuento opcional)<br>• Límites:<br>&nbsp;&nbsp;&nbsp;- Máximo de productos<br>&nbsp;&nbsp;&nbsp;- Máximo de usuarios<br>&nbsp;&nbsp;&nbsp;- Máximo de almacenes<br>&nbsp;&nbsp;&nbsp;- Máximo de ventas/mes<br>• Módulos incluidos<br>• Periodo de prueba (días) |
| **Precondición** | El Superadmin debe estar autenticado. |
| **Proceso** | 1. El Superadmin accede a "Gestión de Planes"<br>2. El Superadmin crea nuevo plan<br>3. Define precios y límites<br>4. Selecciona módulos disponibles<br>5. El sistema valida y guarda configuración |
| **Salidas / Resultado esperado** | Plan creado y disponible para asignar a tiendas. |
| **Postcondición** | El plan aparece en opciones al crear tiendas. |

---

### RF-SUB-002: Ver lista de planes

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUB-002 |
| **Nombre** | Listar todos los planes disponibles |
| **Objetivo** | El sistema permite ver todos los planes de suscripción configurados. |
| **Actor** | Superadmin |
| **Entradas** | Ninguna |
| **Precondición** | El Superadmin debe estar autenticado. |
| **Proceso** | 1. El Superadmin accede a "Planes"<br>2. El sistema muestra tabla con:<br>&nbsp;&nbsp;&nbsp;• Nombre del plan<br>&nbsp;&nbsp;&nbsp;• Precio mensual/anual<br>&nbsp;&nbsp;&nbsp;• Cantidad de tiendas suscritas<br>&nbsp;&nbsp;&nbsp;• Estado (Activo/Inactivo) |
| **Salidas / Resultado esperado** | Lista completa de planes. |
| **Postcondición** | El Superadmin conoce la oferta comercial actual. |

---

### RF-SUB-003: Actualizar plan de suscripción

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUB-003 |
| **Nombre** | Modificar características de un plan |
| **Objetivo** | El sistema permite al Superadmin editar un plan existente. |
| **Actor** | Superadmin |
| **Entradas** | • Precio actualizado<br>• Límites ajustados<br>• Módulos modificados |
| **Precondición** | El plan debe existir. |
| **Proceso** | 1. El Superadmin selecciona plan<br>2. Modifica campos necesarios<br>3. El sistema aplica cambios<br>4. **Importante**: Los cambios NO afectan tiendas existentes automáticamente (requiere migración manual) |
| **Salidas / Resultado esperado** | Plan actualizado. |
| **Postcondición** | Nuevas suscripciones usan configuración actualizada. |

---

### RF-SUB-004: Asignar plan a tienda

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUB-004 |
| **Nombre** | Cambiar plan de una tienda |
| **Objetivo** | El sistema permite asignar o cambiar el plan de suscripción de una tienda. |
| **Actor** | Superadmin, Comerciante (upgrade/downgrade) |
| **Entradas** | • Tienda seleccionada<br>• Nuevo plan<br>• Fecha efectiva del cambio |
| **Precondición** | La tienda y el plan deben existir. |
| **Proceso** | 1. Se selecciona tienda<br>2. Se elige nuevo plan<br>3. El sistema valida:<br>&nbsp;&nbsp;&nbsp;• Si es upgrade: aplica inmediatamente<br>&nbsp;&nbsp;&nbsp;• Si es downgrade: valida que no exceda nuevos límites<br>4. El sistema ajusta módulos disponibles<br>5. El sistema recalcula próximo pago |
| **Salidas / Resultado esperado** | Plan cambiado y límites actualizados. |
| **Postcondición** | La tienda opera bajo las reglas del nuevo plan. |

---

### RF-SUB-005: Ver pagos y vencimientos

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUB-005 |
| **Nombre** | Monitorear estado de pagos de tiendas |
| **Objetivo** | El sistema permite al Superadmin ver el estado de pago de todas las tiendas. |
| **Actor** | Superadmin |
| **Entradas** | • Filtros: estado (Al día/Por vencer/Vencido) |
| **Precondición** | El Superadmin debe estar autenticado. |
| **Proceso** | 1. El Superadmin accede a "Estado de Pagos"<br>2. El sistema muestra:<br>&nbsp;&nbsp;&nbsp;• Tiendas al día (pago vigente)<br>&nbsp;&nbsp;&nbsp;• Tiendas por vencer (próximos 7 días)<br>&nbsp;&nbsp;&nbsp;• Tiendas vencidas (requieren renovación)<br>3. El Superadmin puede filtrar y ordenar |
| **Salidas / Resultado esperado** | Dashboard de estado de pagos. |
| **Postcondición** | El Superadmin identifica tiendas que requieren seguimiento. |

---

### RF-SUB-006: Enviar recordatorio de pago

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUB-006 |
| **Nombre** | Notificar a comerciantes sobre vencimiento |
| **Objetivo** | El sistema envía recordatorios automáticos cuando el pago está próximo a vencer. |
| **Actor** | Sistema (automático), Superadmin (manual) |
| **Entradas** | • Tienda seleccionada (si es manual) |
| **Precondición** | La tienda debe tener suscripción activa. |
| **Proceso** | **Automático:**<br>1. El sistema ejecuta tarea diaria<br>2. Detecta tiendas que vencen en 7 días<br>3. Envía email recordatorio con:<br>&nbsp;&nbsp;&nbsp;• Fecha de vencimiento<br>&nbsp;&nbsp;&nbsp;• Monto a pagar<br>&nbsp;&nbsp;&nbsp;• Link de pago<br>**Manual:**<br>1. Superadmin selecciona tienda<br>2. Envía recordatorio personalizado |
| **Salidas / Resultado esperado** | Email enviado al comerciante. |
| **Postcondición** | Comerciante informado sobre próximo vencimiento. |

---

### RF-SUB-007: Procesar pago de suscripción

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUB-007 |
| **Nombre** | Registrar pago de renovación |
| **Objetivo** | El sistema permite registrar el pago de una suscripción. |
| **Actor** | Sistema (webhook pago online), Superadmin (pago manual) |
| **Entradas** | • Tienda<br>• Monto pagado<br>• Método de pago<br>• Referencia de transacción |
| **Precondición** | La tienda debe existir. |
| **Proceso** | **Pago Online (Stripe/PayPal):**<br>1. Comerciante paga desde su panel<br>2. Pasarela envía webhook<br>3. El sistema verifica pago<br>4. El sistema extiende fecha de vencimiento (+30 días)<br>**Pago Manual:**<br>1. Superadmin recibe comprobante<br>2. Registra pago manualmente<br>3. Sistema extiende suscripción |
| **Salidas / Resultado esperado** | Suscripción renovada y tienda activa. |
| **Postcondición** | La tienda tiene acceso por 30 días adicionales. |

---

### RF-SUB-008: Generar factura de suscripción

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUB-008 |
| **Nombre** | Emitir comprobante de pago |
| **Objetivo** | El sistema genera factura automática al procesar pago. |
| **Actor** | Sistema |
| **Entradas** | • Pago procesado |
| **Precondición** | El pago debe estar confirmado. |
| **Proceso** | 1. Al confirmar pago (RF-SUB-007)<br>2. El sistema genera factura PDF con:<br>&nbsp;&nbsp;&nbsp;• Datos de la plataforma (tu empresa)<br>&nbsp;&nbsp;&nbsp;• Datos del comerciante<br>&nbsp;&nbsp;&nbsp;• Plan contratado<br>&nbsp;&nbsp;&nbsp;• Periodo de vigencia<br>&nbsp;&nbsp;&nbsp;• Monto + IGV<br>3. El sistema envía factura por email |
| **Salidas / Resultado esperado** | Factura PDF generada y enviada. |
| **Postcondición** | Comerciante tiene comprobante de pago. |

---

### RF-SUB-009: Ver historial de pagos

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUB-009 |
| **Nombre** | Consultar pagos de una tienda |
| **Objetivo** | El sistema permite ver todos los pagos realizados por una tienda. |
| **Actor** | Superadmin, Comerciante (solo sus pagos) |
| **Entradas** | • Tienda seleccionada |
| **Precondición** | La tienda debe existir. |
| **Proceso** | 1. Se accede al historial de tienda<br>2. El sistema muestra tabla con:<br>&nbsp;&nbsp;&nbsp;• Fecha de pago<br>&nbsp;&nbsp;&nbsp;• Monto<br>&nbsp;&nbsp;&nbsp;• Plan<br>&nbsp;&nbsp;&nbsp;• Método de pago<br>&nbsp;&nbsp;&nbsp;• Referencia<br>&nbsp;&nbsp;&nbsp;• Link a factura |
| **Salidas / Resultado esperado** | Historial completo de pagos. |
| **Postcondición** | Trazabilidad financiera de la tienda. |

---

### RF-SUB-010: Aplicar descuento/cupón

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-SUB-010 |
| **Nombre** | Crear y aplicar códigos promocionales |
| **Objetivo** | El sistema permite al Superadmin ofrecer descuentos en suscripciones. |
| **Actor** | Superadmin |
| **Entradas** | • Código del cupón<br>• Tipo de descuento (% o monto fijo)<br>• Valor del descuento<br>• Fecha de expiración<br>• Usos máximos |
| **Precondición** | El Superadmin debe estar autenticado. |
| **Proceso** | 1. El Superadmin crea cupón promocional<br>2. Define reglas (ej: 20% descuento primer mes)<br>3. El comerciante ingresa cupón al pagar<br>4. El sistema valida cupón<br>5. Aplica descuento al monto |
| **Salidas / Resultado esperado** | Descuento aplicado en suscripción. |
| **Postcondición** | Comerciante paga precio reducido. |

---

## 3. MÓDULO DE AUTENTICACIÓN

**Código Módulo:** AUT  
**Prioridad:** CRÍTICA  
**Estado:** ✅ Actualizado (Multi-Tenant)

---

### RF-AUT-001: Iniciar sesión

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-AUT-001 |
| **Nombre** | Iniciar sesión |
| **Objetivo** | El sistema permite a los usuarios registrados acceder al sistema mediante sus credenciales. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Correo electrónico o nombre de usuario<br>• Contraseña |
| **Precondición** | El usuario debe estar previamente registrado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Iniciar Sesión"<br>2. El sistema muestra el formulario de acceso<br>3. El usuario ingresa su correo electrónico o nombre de usuario<br>4. El usuario ingresa su contraseña<br>5. El sistema valida las credenciales contra la base de datos<br>6. El sistema verifica que la cuenta esté activa<br>7. Si las credenciales son correctas, el sistema genera tokens de acceso (JWT)<br>8. El sistema registra la fecha y hora del último acceso<br>9. Si las credenciales son incorrectas, el sistema muestra un mensaje de error |
| **Salidas / Resultado esperado** | El usuario accede correctamente al sistema y puede visualizar las funciones según su rol. |
| **Postcondición** | El usuario se encuentra autenticado dentro del sistema. |

---

### RF-AUT-002: Cerrar sesión

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-AUT-002 |
| **Nombre** | Cerrar sesión |
| **Objetivo** | El sistema permite al usuario finalizar su sesión actual de forma segura. |
| **Actor** | Administrador, Cajero |
| **Entradas** | Ninguna |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Cerrar Sesión"<br>2. El sistema solicita confirmación<br>3. El usuario confirma el cierre de sesión<br>4. El sistema invalida el token de acceso actual<br>5. El sistema limpia los datos de sesión del navegador<br>6. El sistema registra el cierre de sesión en la auditoría<br>7. El sistema redirige al usuario a la página de inicio de sesión |
| **Salidas / Resultado esperado** | La sesión del usuario queda finalizada y ya no puede acceder sin volver a iniciar sesión. |
| **Postcondición** | El usuario queda desconectado del sistema. |

---

### RF-AUT-003: Cerrar todas las sesiones

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-AUT-003 |
| **Nombre** | Cerrar todas las sesiones |
| **Objetivo** | El sistema permite al usuario cerrar todas las sesiones activas en diferentes dispositivos. |
| **Actor** | Administrador, Cajero |
| **Entradas** | Ninguna |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Cerrar Todas las Sesiones"<br>2. El sistema solicita confirmación<br>3. El usuario confirma la acción<br>4. El sistema invalida todos los tokens de acceso asociados al usuario<br>5. El sistema registra la acción en la auditoría<br>6. El sistema cierra la sesión actual |
| **Salidas / Resultado esperado** | Todas las sesiones activas del usuario quedan cerradas en todos los dispositivos. |
| **Postcondición** | El usuario debe iniciar sesión nuevamente en cualquier dispositivo. |

---

### RF-AUT-004: Renovar token de acceso

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-AUT-004 |
| **Nombre** | Renovar token de acceso |
| **Objetivo** | El sistema permite renovar automáticamente el token de acceso cuando está por expirar. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Token de renovación (Refresh Token) |
| **Precondición** | El usuario debe tener un token de renovación válido. |
| **Proceso** | 1. El sistema detecta que el token de acceso está por expirar<br>2. El sistema envía automáticamente el token de renovación<br>3. El sistema valida el token de renovación<br>4. Si es válido, el sistema genera un nuevo token de acceso<br>5. El sistema actualiza el token en el navegador<br>6. Si el token de renovación no es válido, el sistema solicita iniciar sesión nuevamente |
| **Salidas / Resultado esperado** | El usuario continúa con su sesión activa sin necesidad de volver a iniciar sesión. |
| **Postcondición** | El sistema mantiene la sesión del usuario activa de forma transparente. |

---

### RF-AUT-005: Verificar correo electrónico disponible

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-AUT-005 |
| **Nombre** | Verificar correo electrónico disponible |
| **Objetivo** | El sistema permite verificar si un correo electrónico ya está registrado. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Correo electrónico |
| **Precondición** | Ninguna |
| **Proceso** | 1. El usuario ingresa un correo electrónico en el formulario de registro<br>2. El sistema consulta la base de datos<br>3. Si el correo ya existe, el sistema muestra un mensaje de advertencia<br>4. Si el correo está disponible, el sistema permite continuar con el registro |
| **Salidas / Resultado esperado** | El usuario conoce si el correo electrónico está disponible o ya está en uso. |
| **Postcondición** | El usuario puede decidir usar otro correo o continuar con el registro. |

---

### RF-AUT-006: Ver información del usuario actual

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-AUT-006 |
| **Nombre** | Ver información del usuario actual |
| **Objetivo** | El sistema permite al usuario autenticado consultar su propia información. |
| **Actor** | Administrador, Cajero |
| **Entradas** | Ninguna |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Mi Perfil"<br>2. El sistema consulta la información del usuario autenticado<br>3. El sistema muestra: nombre, correo, rol y permisos<br>4. El sistema muestra la fecha del último acceso |
| **Salidas / Resultado esperado** | El usuario visualiza su información personal y permisos asignados. |
| **Postcondición** | El usuario conoce sus datos y nivel de acceso en el sistema.

---

### RF-AUT-007: Iniciar sesión como Superadmin

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-AUT-007 |
| **Nombre** | Autenticación de Superadmin (nivel plataforma) |
| **Objetivo** | El sistema permite al dueño de la plataforma acceder al panel de administración global. |
| **Actor** | Superadmin |
| **Entradas** | • Correo electrónico o nombre de usuario<br>• Contraseña<br>• Código 2FA (opcional) |
| **Precondición** | El usuario debe tener rol de Superadmin en la base de datos. |
| **Proceso** | 1. El Superadmin accede a la URL de administración global (ej: admin.tudominio.com)<br>2. El sistema muestra formulario de login especial<br>3. El Superadmin ingresa credenciales<br>4. El sistema valida contra tabla de usuarios globales (sin tenant_id)<br>5. El sistema verifica rol = 'SUPERADMIN'<br>6. Si tiene 2FA activo, solicita código<br>7. El sistema genera token JWT con scope 'platform:admin'<br>8. El sistema registra acceso en auditoría global<br>9. El sistema redirige al panel de Superadmin |
| **Salidas / Resultado esperado** | Superadmin autenticado con acceso a gestión de tiendas. |
| **Postcondición** | El Superadmin puede ver y gestionar todas las tiendas de la plataforma. |

---

### RF-AUT-008: Iniciar sesión como Cliente (Comprador)

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-AUT-008 |
| **Nombre** | Autenticación de Cliente en Storefront |
| **Objetivo** | El sistema permite a los compradores finales crear cuenta y acceder a la tienda online. |
| **Actor** | Cliente/Comprador |
| **Entradas** | • Correo electrónico<br>• Contraseña<br>• OAuth (Google/Facebook - opcional) |
| **Precondición** | El cliente debe haber creado una cuenta en la tienda (RF-CLI-005). |
| **Proceso** | 1. El cliente accede a la tienda online (ej: tienda-juan.tudominio.com)<br>2. El cliente selecciona "Iniciar Sesión"<br>3. **Opción A (Email/Contraseña):**<br>&nbsp;&nbsp;&nbsp;• Ingresa email y contraseña<br>&nbsp;&nbsp;&nbsp;• El sistema valida contra tabla customers WHERE tenant_id = :tenant_id<br>**Opción B (OAuth):**<br>&nbsp;&nbsp;&nbsp;• Cliente elige "Continuar con Google"<br>&nbsp;&nbsp;&nbsp;• Sistema redirige a OAuth provider<br>&nbsp;&nbsp;&nbsp;• Recibe token y crea/vincula cuenta<br>4. El sistema genera token JWT con scope 'customer'<br>5. El sistema muestra carrito guardado y wishlist<br>6. El sistema permite hacer pedidos |
| **Salidas / Resultado esperado** | Cliente autenticado y puede realizar compras. |
| **Postcondición** | El cliente accede a su perfil, pedidos e historial de compras. |

---

## 4. MÓDULO DE USUARIOS

**Código Módulo:** USR  
**Prioridad:** CRÍTICA  
**Estado:** ✅ Implementado

---

### RF-USR-001: Registrar nuevo usuario

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-USR-001 |
| **Nombre** | Registrar nuevo usuario |
| **Objetivo** | El sistema permite crear una cuenta de usuario para que pueda acceder al sistema con sus credenciales. |
| **Actor** | Administrador |
| **Entradas** | • Nombre completo<br>• Nombre de usuario<br>• Correo electrónico<br>• Contraseña<br>• Rol asignado |
| **Precondición** | El administrador debe estar autenticado en el sistema. |
| **Proceso** | 1. El administrador accede a la opción "Crear Usuario"<br>2. El sistema muestra el formulario de registro<br>3. El administrador ingresa los datos del nuevo usuario<br>4. El sistema valida que el correo y nombre de usuario no existan<br>5. El sistema valida que la contraseña cumpla los requisitos (8+ caracteres, mayúsculas, minúsculas, números)<br>6. Si los datos son correctos, el sistema registra al usuario<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El usuario queda registrado en el sistema y puede iniciar sesión con sus credenciales. |
| **Postcondición** | El nuevo usuario aparece en la lista de usuarios del sistema. |

---

### RF-USR-002: Ver lista de usuarios

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-USR-002 |
| **Nombre** | Ver lista de usuarios |
| **Objetivo** | El sistema permite visualizar todos los usuarios registrados con sus datos principales. |
| **Actor** | Administrador |
| **Entradas** | • Filtros de búsqueda (opcional)<br>• Cantidad de registros por página |
| **Precondición** | El administrador debe estar autenticado en el sistema. |
| **Proceso** | 1. El administrador accede a la opción "Lista de Usuarios"<br>2. El sistema muestra todos los usuarios registrados<br>3. El administrador puede buscar por nombre, correo o nombre de usuario<br>4. El administrador puede filtrar por rol o estado (activo/inactivo)<br>5. El sistema muestra los resultados con paginación |
| **Salidas / Resultado esperado** | El administrador visualiza la lista de usuarios con sus datos: nombre, correo, rol y estado. |
| **Postcondición** | El administrador obtiene la información actualizada de los usuarios del sistema. |

---

### RF-USR-003: Actualizar datos de usuario

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-USR-003 |
| **Nombre** | Actualizar datos de usuario |
| **Objetivo** | El sistema permite modificar la información de un usuario existente. |
| **Actor** | Administrador |
| **Entradas** | • Nombre completo<br>• Correo electrónico<br>• Rol asignado<br>• Estado (activo/inactivo) |
| **Precondición** | El usuario a modificar debe existir en el sistema. |
| **Proceso** | 1. El administrador selecciona un usuario de la lista<br>2. El administrador accede a la opción "Editar"<br>3. El sistema muestra el formulario con los datos actuales<br>4. El administrador modifica los campos deseados<br>5. El sistema valida que el correo sea único (si fue modificado)<br>6. Si los datos son correctos, el sistema actualiza la información<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | Los datos del usuario quedan actualizados en el sistema. |
| **Postcondición** | El usuario modificado muestra la nueva información en la lista de usuarios. |

---

### RF-USR-004: Cambiar contraseña de usuario

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-USR-004 |
| **Nombre** | Cambiar contraseña de usuario |
| **Objetivo** | El sistema permite modificar la contraseña de acceso de un usuario. |
| **Actor** | Administrador |
| **Entradas** | • Nueva contraseña<br>• Confirmación de contraseña |
| **Precondición** | El usuario debe existir en el sistema. |
| **Proceso** | 1. El administrador selecciona un usuario de la lista<br>2. El administrador accede a la opción "Cambiar Contraseña"<br>3. El sistema muestra el formulario para ingresar la nueva contraseña<br>4. El administrador ingresa y confirma la nueva contraseña<br>5. El sistema valida que la contraseña cumpla los requisitos (8+ caracteres, mayúsculas, minúsculas, números)<br>6. Si es correcta, el sistema actualiza la contraseña<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | La contraseña del usuario queda actualizada y puede usarla para iniciar sesión. |
| **Postcondición** | El usuario puede acceder al sistema con su nueva contraseña. |

---

### RF-USR-005: Activar o desactivar usuario

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-USR-005 |
| **Nombre** | Activar o desactivar usuario |
| **Objetivo** | El sistema permite habilitar o deshabilitar el acceso de un usuario sin eliminarlo permanentemente. |
| **Actor** | Administrador |
| **Entradas** | • Estado deseado (activo/inactivo) |
| **Precondición** | El usuario debe existir en el sistema. |
| **Proceso** | 1. El administrador selecciona un usuario de la lista<br>2. El administrador cambia el estado mediante un interruptor<br>3. El sistema valida que no sea el propio usuario autenticado<br>4. Si es válido, el sistema actualiza el estado del usuario<br>5. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El usuario activo puede iniciar sesión, el usuario inactivo no puede acceder al sistema. |
| **Postcondición** | El usuario queda con el nuevo estado y se registra el cambio en el historial. |

---

### RF-USR-006: Ver perfil de usuario específico

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-USR-006 |
| **Nombre** | Ver perfil de usuario específico |
| **Objetivo** | El sistema permite visualizar toda la información detallada de un usuario. |
| **Actor** | Administrador |
| **Entradas** | • Identificador del usuario |
| **Precondición** | El usuario debe existir en el sistema. |
| **Proceso** | 1. El administrador selecciona un usuario de la lista<br>2. El administrador accede a la opción "Ver Detalles"<br>3. El sistema muestra toda la información del usuario<br>4. El sistema muestra el historial de cambios y última conexión |
| **Salidas / Resultado esperado** | El administrador visualiza todos los datos del usuario: información personal, rol, permisos, estado y fecha de registro. |
| **Postcondición** | El administrador obtiene la información completa del usuario seleccionado. |

---

### RF-USR-007: Registrar nuevo rol

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-USR-007 |
| **Nombre** | Registrar nuevo rol |
| **Objetivo** | El sistema permite crear un rol personalizado con permisos específicos. |
| **Actor** | Administrador |
| **Entradas** | • Nombre del rol<br>• Descripción del rol<br>• Lista de permisos asignados |
| **Precondición** | El administrador debe estar autenticado en el sistema. |
| **Proceso** | 1. El administrador accede a la opción "Crear Rol"<br>2. El sistema muestra el formulario de registro<br>3. El administrador ingresa el nombre y descripción del rol<br>4. El administrador selecciona los permisos que tendrá el rol<br>5. El sistema valida que el nombre del rol sea único<br>6. Si los datos son correctos, el sistema registra el nuevo rol<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El rol queda registrado y puede ser asignado a usuarios. |
| **Postcondición** | El nuevo rol aparece en la lista de roles disponibles del sistema. |

---

### RF-USR-008: Ver lista de roles

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-USR-008 |
| **Nombre** | Ver lista de roles |
| **Objetivo** | El sistema permite visualizar todos los roles configurados con sus permisos. |
| **Actor** | Administrador |
| **Entradas** | Ninguna |
| **Precondición** | El administrador debe estar autenticado en el sistema. |
| **Proceso** | 1. El administrador accede a la opción "Lista de Roles"<br>2. El sistema muestra todos los roles registrados<br>3. El sistema muestra el nombre, descripción y cantidad de permisos de cada rol |
| **Salidas / Resultado esperado** | El administrador visualiza todos los roles con su información básica. |
| **Postcondición** | El administrador obtiene la información actualizada de los roles del sistema. |

---

### RF-USR-009: Actualizar permisos de rol

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-USR-009 |
| **Nombre** | Actualizar permisos de rol |
| **Objetivo** | El sistema permite modificar los permisos asignados a un rol existente. |
| **Actor** | Administrador |
| **Entradas** | • Nueva lista de permisos |
| **Precondición** | El rol debe existir y no ser un rol protegido del sistema. |
| **Proceso** | 1. El administrador selecciona un rol de la lista<br>2. El administrador accede a la opción "Editar Permisos"<br>3. El sistema muestra los permisos actuales del rol<br>4. El administrador marca o desmarca los permisos deseados<br>5. El sistema valida que no sea un rol protegido (Administrador)<br>6. Si es válido, el sistema actualiza los permisos del rol<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | Los permisos del rol quedan actualizados y afectan a todos los usuarios con ese rol. |
| **Postcondición** | Los usuarios con ese rol reciben automáticamente los nuevos permisos. |

---

### RF-USR-010: Desactivar rol

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-USR-010 |
| **Nombre** | Desactivar rol |
| **Objetivo** | El sistema permite deshabilitar un rol sin eliminarlo permanentemente. |
| **Actor** | Administrador |
| **Entradas** | • Identificador del rol |
| **Precondición** | El rol debe existir y no ser un rol protegido del sistema. |
| **Proceso** | 1. El administrador selecciona un rol de la lista<br>2. El administrador accede a la opción "Desactivar"<br>3. El sistema valida que no sea un rol protegido (Administrador)<br>4. El sistema valida que no haya usuarios asignados a ese rol<br>5. Si es válido, el sistema desactiva el rol<br>6. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El rol queda desactivado y no puede ser asignado a nuevos usuarios. |
| **Postcondición** | El rol desactivado no aparece en la lista de roles disponibles para asignar. |

## 3. MÓDULO DE ENTIDADES COMERCIALES

**Código Módulo:** ENT  
**Prioridad:** ALTA  
**Estado:** ✅ Implementado

---

### RF-ENT-001: Registrar nuevo cliente

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-ENT-001 |
| **Nombre** | Registrar nuevo cliente |
| **Objetivo** | El sistema permite registrar los datos de un cliente para poder realizar ventas a su nombre. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Tipo de entidad (Cliente)<br>• Tipo de documento (DNI o RUC)<br>• Número de documento<br>• Nombres completos<br>• Dirección<br>• Ciudad<br>• Teléfono (opcional)<br>• Correo electrónico (opcional) |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Registrar Cliente"<br>2. El sistema muestra el formulario de registro<br>3. El usuario selecciona el tipo de documento<br>4. El usuario ingresa el número de documento<br>5. El sistema valida el formato según el tipo (DNI: 8 dígitos, RUC: 11 dígitos)<br>6. El usuario completa los datos personales y de contacto<br>7. El sistema valida que el número de documento no exista<br>8. Si los datos son correctos, el sistema registra al cliente<br>9. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El cliente queda registrado y puede ser seleccionado al momento de realizar una venta. |
| **Postcondición** | El nuevo cliente aparece en la lista de clientes del sistema. |

---

### RF-ENT-002: Ver lista de clientes

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-ENT-002 |
| **Nombre** | Ver lista de clientes |
| **Objetivo** | El sistema permite visualizar todos los clientes registrados con sus datos principales. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Filtros de búsqueda (opcional)<br>• Tipo de entidad (opcional)<br>• Cantidad de registros por página |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Lista de Clientes"<br>2. El sistema muestra todos los clientes registrados<br>3. El usuario puede buscar por nombre o número de documento<br>4. El usuario puede filtrar por tipo de entidad (Cliente, Proveedor, Ambos)<br>5. El sistema muestra los resultados con paginación |
| **Salidas / Resultado esperado** | El usuario visualiza la lista de clientes con sus datos: nombre, documento, teléfono y correo. |
| **Postcondición** | El usuario obtiene la información actualizada de los clientes del sistema. |

---

### RF-ENT-003: Actualizar datos de cliente

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-ENT-003 |
| **Nombre** | Actualizar datos de cliente |
| **Objetivo** | El sistema permite modificar la información de un cliente existente. |
| **Actor** | Administrador |
| **Entradas** | • Nombres completos<br>• Dirección<br>• Ciudad<br>• Teléfono<br>• Correo electrónico |
| **Precondición** | El cliente debe existir en el sistema. |
| **Proceso** | 1. El usuario selecciona un cliente de la lista<br>2. El usuario accede a la opción "Editar"<br>3. El sistema muestra el formulario con los datos actuales<br>4. El usuario modifica los campos deseados (no puede cambiar el documento)<br>5. El sistema valida los nuevos datos<br>6. Si los datos son correctos, el sistema actualiza la información<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | Los datos del cliente quedan actualizados en el sistema. |
| **Postcondición** | El cliente modificado muestra la nueva información en la lista de clientes. |

---

### RF-ENT-004: Ver perfil de cliente específico

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-ENT-004 |
| **Nombre** | Ver perfil de cliente específico |
| **Objetivo** | El sistema permite visualizar toda la información detallada de un cliente. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Identificador del cliente |
| **Precondición** | El cliente debe existir en el sistema. |
| **Proceso** | 1. El usuario selecciona un cliente de la lista<br>2. El usuario accede a la opción "Ver Detalles"<br>3. El sistema muestra toda la información del cliente<br>4. El sistema muestra el historial de compras (si aplica) |
| **Salidas / Resultado esperado** | El usuario visualiza todos los datos del cliente: información personal, contacto y tipo de entidad. |
| **Postcondición** | El usuario obtiene la información completa del cliente seleccionado. |

---

### RF-ENT-005: Buscar cliente por número de documento

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-ENT-005 |
| **Nombre** | Buscar cliente por número de documento |
| **Objetivo** | El sistema permite encontrar rápidamente un cliente usando su número de documento. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Número de documento |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario ingresa el número de documento en el campo de búsqueda<br>2. El sistema busca coincidencias exactas en la base de datos<br>3. Si encuentra el cliente, el sistema muestra su información<br>4. Si no encuentra coincidencias, el sistema muestra un mensaje |
| **Salidas / Resultado esperado** | El usuario obtiene los datos del cliente encontrado o un mensaje indicando que no existe. |
| **Postcondición** | El usuario puede continuar con la operación que necesita realizar con ese cliente. |

---

### RF-ENT-006: Buscar cliente por correo electrónico

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-ENT-006 |
| **Nombre** | Buscar cliente por correo electrónico |
| **Objetivo** | El sistema permite encontrar rápidamente un cliente usando su correo electrónico. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Correo electrónico |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario ingresa el correo electrónico en el campo de búsqueda<br>2. El sistema busca coincidencias exactas en la base de datos<br>3. Si encuentra el cliente, el sistema muestra su información<br>4. Si no encuentra coincidencias, el sistema muestra un mensaje |
| **Salidas / Resultado esperado** | El usuario obtiene los datos del cliente encontrado o un mensaje indicando que no existe. |
| **Postcondición** | El usuario puede continuar con la operación que necesita realizar con ese cliente. |

---

### RF-ENT-007: Ver estadísticas de clientes

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-ENT-007 |
| **Nombre** | Ver estadísticas de clientes |
| **Objetivo** | El sistema permite visualizar información resumida sobre los clientes registrados. |
| **Actor** | Administrador |
| **Entradas** | Ninguna |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Estadísticas"<br>2. El sistema calcula el total de clientes registrados<br>3. El sistema calcula el total por tipo (Cliente, Proveedor, Ambos)<br>4. El sistema muestra los datos en pantalla |
| **Salidas / Resultado esperado** | El usuario visualiza estadísticas: total de clientes, total por tipo y clientes activos. |
| **Postcondición** | El usuario obtiene información resumida para tomar decisiones. |

---

### RF-ENT-008: Registrar nuevo proveedor

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-ENT-008 |
| **Nombre** | Registrar nuevo proveedor |
| **Objetivo** | El sistema permite registrar los datos de un proveedor para poder realizar compras a su nombre. |
| **Actor** | Administrador |
| **Entradas** | • Tipo de entidad (Proveedor)<br>• Tipo de documento (RUC obligatorio)<br>• Número de RUC<br>• Razón social<br>• Dirección<br>• Ciudad<br>• Teléfono (opcional)<br>• Correo electrónico (opcional) |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Registrar Proveedor"<br>2. El sistema muestra el formulario de registro<br>3. El usuario ingresa el número de RUC (11 dígitos)<br>4. El sistema valida el formato del RUC<br>5. El usuario completa los datos de la empresa y contacto<br>6. El sistema valida que el RUC no exista<br>7. Si los datos son correctos, el sistema registra al proveedor<br>8. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El proveedor queda registrado y puede ser seleccionado al momento de realizar una compra. |
| **Postcondición** | El nuevo proveedor aparece en la lista de proveedores del sistema. |

---

### RF-ENT-009: Ver lista de proveedores

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-ENT-009 |
| **Nombre** | Ver lista de proveedores |
| **Objetivo** | El sistema permite visualizar todos los proveedores registrados con sus datos principales. |
| **Actor** | Administrador |
| **Entradas** | • Filtros de búsqueda (opcional)<br>• Cantidad de registros por página |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Lista de Proveedores"<br>2. El sistema muestra todos los proveedores registrados<br>3. El usuario puede buscar por razón social o número de RUC<br>4. El sistema muestra los resultados con paginación |
| **Salidas / Resultado esperado** | El usuario visualiza la lista de proveedores con sus datos: razón social, RUC, teléfono y correo. |
| **Postcondición** | El usuario obtiene la información actualizada de los proveedores del sistema. |

---

### RF-ENT-010: Actualizar datos de proveedor

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-ENT-010 |
| **Nombre** | Actualizar datos de proveedor |
| **Objetivo** | El sistema permite modificar la información de un proveedor existente. |
| **Actor** | Administrador |
| **Entradas** | • Razón social<br>• Dirección<br>• Ciudad<br>• Teléfono<br>• Correo electrónico |
| **Precondición** | El proveedor debe existir en el sistema. |
| **Proceso** | 1. El usuario selecciona un proveedor de la lista<br>2. El usuario accede a la opción "Editar"<br>3. El sistema muestra el formulario con los datos actuales<br>4. El usuario modifica los campos deseados (no puede cambiar el RUC)<br>5. El sistema valida los nuevos datos<br>6. Si los datos son correctos, el sistema actualiza la información<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | Los datos del proveedor quedan actualizados en el sistema. |
| **Postcondición** | El proveedor modificado muestra la nueva información en la lista de proveedores. |

---

## 4. MÓDULO DE VENTAS

**Código Módulo:** VNT  
**Prioridad:** CRÍTICA  
**Estado:** ✅ Implementado

---

### RF-VNT-001: Registrar nueva venta

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-VNT-001 |
| **Nombre** | Registrar nueva venta |
| **Objetivo** | El sistema permite crear una venta de productos al cliente seleccionado. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Cliente<br>• Tipo de comprobante (Boleta/Factura)<br>• Lista de productos con cantidades<br>• Método de pago<br>• Descuentos (opcional) |
| **Precondición** | El usuario debe tener una sesión de caja activa y los productos deben tener stock disponible. |
| **Proceso** | 1. El cajero accede a la opción "Punto de Venta"<br>2. El cajero selecciona o busca al cliente<br>3. El cajero busca y agrega productos al carrito<br>4. El cajero ingresa la cantidad de cada producto<br>5. El sistema valida que haya stock suficiente<br>6. El sistema calcula el subtotal, IGV (18%) y total<br>7. El cajero selecciona el tipo de comprobante<br>8. El cajero selecciona el método de pago<br>9. Si los datos son correctos, el sistema registra la venta con estado PENDIENTE<br>10. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | La venta queda registrada en estado pendiente y puede ser confirmada al recibir el pago. |
| **Postcondición** | La venta aparece en el historial con estado PENDIENTE hasta que se confirme el pago. |

---

### RF-VNT-002: Ver lista de ventas

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-VNT-002 |
| **Nombre** | Ver lista de ventas |
| **Objetivo** | El sistema permite visualizar todas las ventas registradas con sus datos principales. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Filtros de búsqueda (opcional)<br>• Estado de venta (opcional)<br>• Fecha (opcional)<br>• Cantidad de registros por página |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Historial de Ventas"<br>2. El sistema muestra todas las ventas registradas<br>3. El usuario puede filtrar por estado (Pendiente/Completada/Cancelada)<br>4. El usuario puede filtrar por rango de fechas<br>5. El usuario puede buscar por número de venta o cliente<br>6. El sistema muestra los resultados con paginación |
| **Salidas / Resultado esperado** | El usuario visualiza la lista de ventas con sus datos: número, cliente, fecha, total y estado. |
| **Postcondición** | El usuario obtiene la información actualizada de las ventas del sistema. |

---

### RF-VNT-003: Ver detalle de venta específica

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-VNT-003 |
| **Nombre** | Ver detalle de venta específica |
| **Objetivo** | El sistema permite visualizar toda la información detallada de una venta. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Identificador de la venta |
| **Precondición** | La venta debe existir en el sistema. |
| **Proceso** | 1. El usuario selecciona una venta de la lista<br>2. El usuario accede a la opción "Ver Detalles"<br>3. El sistema muestra toda la información de la venta<br>4. El sistema muestra los productos vendidos con cantidades y precios<br>5. El sistema muestra el método de pago utilizado |
| **Salidas / Resultado esperado** | El usuario visualiza todos los datos: cliente, productos, precios, descuentos, impuestos, total y estado. |
| **Postcondición** | El usuario obtiene la información completa de la venta seleccionada. |

---

### RF-VNT-004: Actualizar estado de venta

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-VNT-004 |
| **Nombre** | Actualizar estado de venta |
| **Objetivo** | El sistema permite cambiar el estado de una venta (Pendiente, Completada, Cancelada). |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Nuevo estado de la venta |
| **Precondición** | La venta debe existir en el sistema. |
| **Proceso** | 1. El usuario selecciona una venta de la lista<br>2. El usuario accede a la opción "Cambiar Estado"<br>3. El sistema muestra los estados disponibles<br>4. El usuario selecciona el nuevo estado<br>5. El sistema valida que el cambio de estado sea válido<br>6. Si es válido, el sistema actualiza el estado<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El estado de la venta queda actualizado según la selección. |
| **Postcondición** | La venta muestra el nuevo estado en el historial. |

---

### RF-VNT-005: Confirmar pago de venta

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-VNT-005 |
| **Nombre** | Confirmar pago de venta |
| **Objetivo** | El sistema permite confirmar que se recibió el pago de una venta y descuenta el stock automáticamente. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Monto recibido<br>• Método de pago<br>• Número de operación (opcional) |
| **Precondición** | La venta debe estar en estado PENDIENTE. |
| **Proceso** | 1. El usuario selecciona una venta pendiente<br>2. El usuario accede a la opción "Confirmar Pago"<br>3. El sistema muestra el monto total a pagar<br>4. El usuario ingresa el monto recibido<br>5. El sistema calcula el cambio (si aplica)<br>6. El usuario confirma el método de pago<br>7. El sistema actualiza el estado a COMPLETADA<br>8. El sistema descuenta el stock de todos los productos<br>9. El sistema registra el movimiento en el kardex<br>10. El sistema actualiza el total de ventas en la sesión de caja |
| **Salidas / Resultado esperado** | El pago queda confirmado, el stock se descuenta y la venta se marca como completada. |
| **Postcondición** | La venta aparece como completada y el inventario se actualiza automáticamente. |

---

### RF-VNT-006: Eliminar venta pendiente

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-VNT-006 |
| **Nombre** | Eliminar venta pendiente |
| **Objetivo** | El sistema permite eliminar una venta que aún no ha sido confirmada. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Identificador de la venta |
| **Precondición** | La venta debe estar en estado PENDIENTE. |
| **Proceso** | 1. El usuario selecciona una venta pendiente<br>2. El usuario accede a la opción "Eliminar"<br>3. El sistema solicita confirmación<br>4. El usuario confirma la eliminación<br>5. El sistema valida que la venta esté en estado PENDIENTE<br>6. Si es válido, el sistema elimina la venta<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | La venta pendiente queda eliminada del sistema. |
| **Postcondición** | La venta ya no aparece en el historial de ventas. |

---

### RF-VNT-007: Descargar comprobante de venta en PDF

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-VNT-007 |
| **Nombre** | Descargar comprobante de venta en PDF |
| **Objetivo** | El sistema permite generar y descargar el comprobante de venta en formato PDF. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Identificador de la venta |
| **Precondición** | La venta debe estar en estado COMPLETADA. |
| **Proceso** | 1. El usuario selecciona una venta completada<br>2. El usuario accede a la opción "Descargar Comprobante"<br>3. El sistema genera el PDF con todos los datos de la venta<br>4. El sistema incluye: número de comprobante, fecha, cliente, productos, precios, impuestos y total<br>5. El sistema descarga el archivo PDF |
| **Salidas / Resultado esperado** | El usuario obtiene un archivo PDF con el comprobante de venta. |
| **Postcondición** | El comprobante queda disponible para ser impreso o enviado al cliente. |

---

### RF-VNT-008: Previsualizar comprobante de venta

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-VNT-008 |
| **Nombre** | Previsualizar comprobante de venta |
| **Objetivo** | El sistema permite visualizar el comprobante de venta antes de descargarlo. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Identificador de la venta |
| **Precondición** | La venta debe estar en estado COMPLETADA. |
| **Proceso** | 1. El usuario selecciona una venta completada<br>2. El usuario accede a la opción "Vista Previa"<br>3. El sistema genera el comprobante en formato PDF<br>4. El sistema muestra el PDF en el navegador<br>5. El usuario puede revisar el contenido antes de descargar |
| **Salidas / Resultado esperado** | El usuario visualiza el comprobante en pantalla sin necesidad de descargarlo. |
| **Postcondición** | El usuario puede decidir si descarga o imprime el comprobante. |

---

### RF-VNT-009: Emitir Nota de Crédito por devolución

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-VNT-009 |
| **Nombre** | Generar Nota de Crédito electrónica |
| **Objetivo** | El sistema permite anular total o parcialmente una venta mediante Nota de Crédito conforme a normativa SUNAT. |
| **Actor** | Administrador, Cajero (con permiso) |
| **Entradas** | • Venta original (Boleta/Factura)<br>• Productos a devolver con cantidades<br>• Motivo SUNAT (código 01-13)<br>• Tipo: Anulación/Descuento/Devolución/Corrección<br>• Observaciones adicionales |
| **Precondición** | La venta debe estar en estado COMPLETADA y cumplir plazos SUNAT (Boleta: <7 días, Factura: sin límite). |
| **Proceso** | 1. El usuario busca la venta original por número de comprobante<br>2. El usuario accede a la opción "Emitir Nota de Crédito"<br>3. El usuario selecciona los productos a devolver (puede ser parcial)<br>4. El usuario selecciona el motivo según catálogo SUNAT<br>5. El sistema valida los plazos permitidos según tipo de comprobante<br>6. El sistema valida que el cliente acepte devolución (política de empresa)<br>7. El sistema verifica condición del producto (etiquetas originales, sin uso)<br>8. El sistema calcula el monto total a devolver<br>9. El sistema genera la Nota de Crédito con numeración correlativa (NC01-XXXXXXXX)<br>10. El sistema devuelve el stock al inventario (por SKU específico)<br>11. El sistema genera vale de cambio o procesa reembolso según política<br>12. El sistema registra la operación en auditoría |
| **Salidas / Resultado esperado** | Nota de Crédito electrónica generada, stock devuelto al inventario, vale de cambio o reembolso procesado. |
| **Postcondición** | La venta original queda vinculada a la Nota de Crédito y el inventario actualizado. |

---

## 5. MÓDULO DE PRODUCTOS

**Código Módulo:** PRD  
**Prioridad:** ALTA  
**Estado:** ✅ Implementado

---

### RF-PRD-001: Registrar nuevo producto

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-PRD-001 |
| **Nombre** | Registrar nuevo producto |
| **Objetivo** | El sistema permite crear un nuevo producto con toda su información para la venta. |
| **Actor** | Administrador |
| **Entradas** | • Código del producto (SKU)<br>• Nombre del producto<br>• Descripción<br>• Categoría<br>• Talla (XS/S/M/L/XL/XXL/Único)<br>• Color<br>• Género (Hombre/Mujer/Unisex/Niño)<br>• Marca<br>• Material (Algodón/Poliéster/Mezcla/Lino/Cuero/etc.)<br>• Código de Barra (EAN-13)<br>• Unidad de medida<br>• Precio de costo<br>• Precio de venta<br>• Stock mínimo |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El administrador accede a la opción "Registrar Producto"<br>2. El sistema muestra el formulario de registro<br>3. El administrador ingresa el código único del producto (SKU)<br>4. El administrador completa todos los campos obligatorios<br>5. El administrador selecciona talla, color y género desde catálogos maestros<br>6. El sistema valida que el código de barra sea único<br>7. El sistema valida que el SKU no exista<br>8. El sistema valida que los precios sean mayores a cero<br>9. Si los datos son correctos, el sistema registra el producto<br>10. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El producto queda registrado y disponible para ser vendido. |
| **Postcondición** | El nuevo producto aparece en el catálogo de productos del sistema. |

---

### RF-PRD-002: Ver lista de productos

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-PRD-002 |
| **Nombre** | Ver lista de productos |
| **Objetivo** | El sistema permite visualizar todos los productos registrados con sus datos principales. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Filtros de búsqueda (opcional)<br>• Categoría (opcional)<br>• Género (opcional)<br>• Marca (opcional)<br>• Talla (opcional)<br>• Color (opcional)<br>• Estado (opcional)<br>• Cantidad de registros por página |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Catálogo de Productos"<br>2. El sistema muestra todos los productos registrados<br>3. El usuario puede buscar por nombre, código o código de barra<br>4. El usuario puede filtrar por categoría<br>5. El usuario puede filtrar por género (Hombre/Mujer/Unisex/Niño)<br>6. El usuario puede filtrar por marca<br>7. El usuario puede filtrar por talla<br>8. El usuario puede filtrar por color<br>9. El usuario puede filtrar por estado (activo/inactivo)<br>10. El sistema muestra los resultados con paginación |
| **Salidas / Resultado esperado** | El usuario visualiza la lista de productos con sus datos: código, nombre, talla, color, género, marca, categoría, precio y stock. |
| **Postcondición** | El usuario obtiene la información actualizada de los productos del sistema. |

---

### RF-PRD-003: Ver detalle de producto específico

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-PRD-003 |
| **Nombre** | Ver detalle de producto específico |
| **Objetivo** | El sistema permite visualizar toda la información detallada de un producto. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Código del producto |
| **Precondición** | El producto debe existir en el sistema. |
| **Proceso** | 1. El usuario busca el producto por su código<br>2. El usuario accede a la opción "Ver Detalles"<br>3. El sistema muestra toda la información del producto<br>4. El sistema muestra el stock actual en cada almacén |
| **Salidas / Resultado esperado** | El usuario visualiza todos los datos: código, nombre, descripción, precios, categoría y stock disponible. |
| **Postcondición** | El usuario obtiene la información completa del producto seleccionado. |

---

### RF-PRD-004: Actualizar información de producto

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-PRD-004 |
| **Nombre** | Actualizar información de producto |
| **Objetivo** | El sistema permite modificar la información de un producto existente. |
| **Actor** | Administrador |
| **Entradas** | • Nombre del producto<br>• Descripción<br>• Categoría<br>• Precio de costo<br>• Precio de venta<br>• Stock mínimo |
| **Precondición** | El producto debe existir en el sistema. |
| **Proceso** | 1. El administrador busca el producto por su código<br>2. El administrador accede a la opción "Editar"<br>3. El sistema muestra el formulario con los datos actuales<br>4. El administrador modifica los campos deseados (no puede cambiar el código)<br>5. El sistema valida los nuevos datos<br>6. Si los datos son correctos, el sistema actualiza la información<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | Los datos del producto quedan actualizados en el sistema. |
| **Postcondición** | El producto modificado muestra la nueva información en el catálogo. |

---

### RF-PRD-005: Activar o desactivar producto

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-PRD-005 |
| **Nombre** | Activar o desactivar producto |
| **Objetivo** | El sistema permite habilitar o deshabilitar la disponibilidad de un producto sin eliminarlo. |
| **Actor** | Administrador |
| **Entradas** | • Estado deseado (activo/inactivo) |
| **Precondición** | El producto debe existir en el sistema. |
| **Proceso** | 1. El administrador busca el producto por su código<br>2. El administrador cambia el estado mediante un interruptor<br>3. El sistema actualiza el estado del producto<br>4. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El producto activo puede ser vendido, el producto inactivo no aparece disponible para venta. |
| **Postcondición** | El producto queda con el nuevo estado y se registra el cambio. |

---

### RF-PRD-006: Eliminar producto

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-PRD-006 |
| **Nombre** | Eliminar producto |
| **Objetivo** | El sistema permite eliminar un producto que ya no se comercializa. |
| **Actor** | Administrador |
| **Entradas** | • Código del producto |
| **Precondición** | El producto no debe tener stock en ningún almacén ni ventas asociadas. |
| **Proceso** | 1. El administrador busca el producto por su código<br>2. El administrador accede a la opción "Eliminar"<br>3. El sistema solicita confirmación<br>4. El sistema valida que no tenga stock ni movimientos recientes<br>5. Si es válido, el sistema realiza una eliminación lógica (soft delete)<br>6. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El producto queda eliminado y ya no aparece en el catálogo. |
| **Postcondición** | El producto eliminado no está disponible para nuevas operaciones pero se conserva el historial. |

---

### RF-PRD-011: Buscar producto por código de barra

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-PRD-011 |
| **Nombre** | Buscar producto por código de barra en punto de venta |
| **Objetivo** | El sistema permite localizar rápidamente un producto específico (con talla/color exactos) mediante código de barra o SKU. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Código de barra (EAN-13)<br>• SKU del producto |
| **Precondición** | El producto debe estar registrado en el sistema y activo. |
| **Proceso** | 1. El cajero escanea el código de barra o ingresa el SKU manualmente<br>2. El sistema busca el producto específico en la base de datos<br>3. El sistema valida que el producto esté activo<br>4. El sistema muestra: nombre, talla, color, género, marca, precio y stock disponible<br>5. En punto de venta, el sistema agrega automáticamente el producto al carrito<br>6. Si no encuentra coincidencias, el sistema muestra un mensaje de error |
| **Salidas / Resultado esperado** | El sistema localiza y muestra el producto específico con talla y color exactos. |
| **Postcondición** | El producto queda listo para ser agregado a una venta o consulta. |

---

### RF-PRD-012: Marcar productos para liquidación

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-PRD-012 |
| **Nombre** | Aplicar descuento de liquidación a productos |
| **Objetivo** | El sistema permite marcar productos de temporada anterior para venta con descuento especial. |
| **Actor** | Administrador |
| **Entradas** | • Productos seleccionados (individual o por lote)<br>• Porcentaje de descuento (30%, 50%, 70%)<br>• Fecha de inicio de liquidación<br>• Fecha de fin de liquidación (opcional)<br>• Motivo de liquidación |
| **Precondición** | Los productos deben existir y estar activos en el sistema. |
| **Proceso** | 1. El administrador accede a la opción "Liquidaciones"<br>2. El administrador selecciona productos (puede filtrar por temporada, marca, género, antigüedad)<br>3. El administrador define el porcentaje de descuento<br>4. El administrador establece la vigencia de la liquidación<br>5. El sistema calcula el nuevo precio de venta temporal<br>6. El sistema marca los productos con etiqueta "LIQUIDACIÓN"<br>7. El sistema registra el descuento en el historial del producto<br>8. Los productos aparecen con precio reducido en el punto de venta |
| **Salidas / Resultado esperado** | Los productos quedan marcados con precio de liquidación y son visibles con descuento en el sistema. |
| **Postcondición** | Los productos se venden al precio de liquidación durante el periodo definido. |

---

## 6. MÓDULO DE INVENTARIO

**Código Módulo:** INV  
**Prioridad:** CRÍTICA  
**Estado:** ✅ Implementado

---

### RF-INV-001: Ver stock de productos por almacén

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-INV-001 |
| **Nombre** | Ver stock de productos por almacén |
| **Objetivo** | El sistema permite visualizar las cantidades disponibles de cada producto (por SKU específico) en los diferentes almacenes. |
| **Actor** | Administrador, Cajero |
| **Entradas** | • Filtros de almacén (opcional)<br>• Filtros de producto (opcional)<br>• Filtros de talla (opcional)<br>• Filtros de color (opcional) |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Consultar Stock"<br>2. El sistema muestra el stock de todos los productos por SKU único<br>3. El sistema muestra la cantidad disponible por cada almacén y variante (talla/color)<br>4. El usuario puede filtrar por almacén específico<br>5. El usuario puede buscar un producto específico por nombre, código o código de barra<br>6. El usuario puede filtrar por talla o color específico |
| **Salidas / Resultado esperado** | El usuario visualiza el stock actual de cada SKU (producto + talla + color) separado por almacén. |
| **Postcondición** | El usuario obtiene información actualizada de las existencias en cada almacén. |

---

### RF-INV-002: Consultar kardex de movimientos

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-INV-002 |
| **Nombre** | Consultar kardex de movimientos |
| **Objetivo** | El sistema permite visualizar el historial completo de movimientos de entrada y salida de productos. |
| **Actor** | Administrador |
| **Entradas** | • Producto (opcional)<br>• Almacén (opcional)<br>• Rango de fechas (opcional)<br>• Tipo de movimiento (opcional) |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Kardex"<br>2. El sistema muestra todos los movimientos de inventario<br>3. El usuario puede filtrar por producto específico<br>4. El usuario puede filtrar por almacén<br>5. El usuario puede filtrar por tipo de movimiento (Entrada/Salida/Ajuste/Transferencia)<br>6. El usuario puede filtrar por rango de fechas<br>7. El sistema muestra los movimientos con fecha, tipo, cantidad, motivo y saldo resultante |
| **Salidas / Resultado esperado** | El usuario visualiza el historial detallado de movimientos con todas las operaciones realizadas. |
| **Postcondición** | El usuario obtiene trazabilidad completa de los movimientos de inventario. |

---

### RF-INV-003: Ver alertas de stock bajo

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-INV-003 |
| **Nombre** | Ver alertas de stock bajo |
| **Objetivo** | El sistema permite visualizar los productos que tienen cantidades por debajo del stock mínimo establecido. |
| **Actor** | Administrador |
| **Entradas** | • Filtros de almacén (opcional) |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Alertas de Inventario"<br>2. El sistema identifica productos con stock menor al mínimo<br>3. El sistema muestra la lista de productos en alerta<br>4. El sistema muestra el stock actual vs stock mínimo<br>5. El sistema muestra la diferencia faltante |
| **Salidas / Resultado esperado** | El usuario visualiza todos los productos que necesitan reposición. |
| **Postcondición** | El usuario puede tomar decisiones de compra para reponer el inventario. |

---

### RF-INV-004: Registrar ajuste de inventario

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-INV-004 |
| **Nombre** | Registrar ajuste de inventario |
| **Objetivo** | El sistema permite modificar manualmente las cantidades de stock por diferencias encontradas. |
| **Actor** | Administrador |
| **Entradas** | • Producto<br>• Almacén<br>• Tipo de ajuste (Ingreso/Egreso)<br>• Cantidad<br>• Motivo del ajuste<br>• Observaciones |
| **Precondición** | El producto y almacén deben existir en el sistema. |
| **Proceso** | 1. El administrador accede a la opción "Ajustes de Inventario"<br>2. El administrador selecciona el producto y almacén<br>3. El administrador selecciona si es ingreso o egreso<br>4. El administrador ingresa la cantidad a ajustar<br>5. El administrador selecciona el motivo del ajuste<br>6. El administrador agrega observaciones<br>7. El sistema valida que el ajuste no genere stock negativo<br>8. Si es válido, el sistema actualiza el stock<br>9. El sistema registra el movimiento en el kardex<br>10. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El stock queda ajustado según la cantidad ingresada y se registra en el historial. |
| **Postcondición** | El ajuste aparece en el kardex y el stock del producto se actualiza. |

---

### RF-INV-005: Registrar nueva transferencia entre almacenes

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-INV-005 |
| **Nombre** | Registrar nueva transferencia entre almacenes |
| **Objetivo** | El sistema permite solicitar el traslado de productos de un almacén a otro. |
| **Actor** | Administrador |
| **Entradas** | • Almacén origen<br>• Almacén destino<br>• Lista de productos con cantidades<br>• Motivo de la transferencia |
| **Precondición** | Los almacenes deben existir y el almacén origen debe tener stock suficiente. |
| **Proceso** | 1. El administrador accede a la opción "Transferencias"<br>2. El administrador selecciona el almacén origen<br>3. El administrador selecciona el almacén destino<br>4. El administrador agrega productos con sus cantidades<br>5. El sistema valida que haya stock suficiente en el origen<br>6. El administrador ingresa el motivo de la transferencia<br>7. Si los datos son correctos, el sistema crea la transferencia en estado PENDIENTE<br>8. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | La transferencia queda registrada en estado pendiente esperando aprobación. |
| **Postcondición** | La transferencia aparece en la lista con estado PENDIENTE. |

---

### RF-INV-006: Ver lista de transferencias

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-INV-006 |
| **Nombre** | Ver lista de transferencias |
| **Objetivo** | El sistema permite visualizar todas las transferencias solicitadas entre almacenes. |
| **Actor** | Administrador |
| **Entradas** | • Filtros de estado (opcional)<br>• Filtros de almacén (opcional)<br>• Rango de fechas (opcional) |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Lista de Transferencias"<br>2. El sistema muestra todas las transferencias registradas<br>3. El usuario puede filtrar por estado (Pendiente/Aprobada/Cancelada)<br>4. El usuario puede filtrar por almacén origen o destino<br>5. El usuario puede filtrar por rango de fechas |
| **Salidas / Resultado esperado** | El usuario visualiza todas las transferencias con su estado actual. |
| **Postcondición** | El usuario obtiene información de las transferencias realizadas. |

---

### RF-INV-007: Ver detalle de transferencia específica

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-INV-007 |
| **Nombre** | Ver detalle de transferencia específica |
| **Objetivo** | El sistema permite visualizar toda la información de una transferencia. |
| **Actor** | Administrador |
| **Entradas** | • Identificador de la transferencia |
| **Precondición** | La transferencia debe existir en el sistema. |
| **Proceso** | 1. El usuario selecciona una transferencia de la lista<br>2. El usuario accede a la opción "Ver Detalles"<br>3. El sistema muestra toda la información de la transferencia<br>4. El sistema muestra los productos transferidos con cantidades |
| **Salidas / Resultado esperado** | El usuario visualiza: almacenes origen y destino, productos, cantidades, estado y fechas. |
| **Postcondición** | El usuario obtiene la información completa de la transferencia seleccionada. |

---

### RF-INV-008: Aprobar transferencia entre almacenes

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-INV-008 |
| **Nombre** | Aprobar transferencia entre almacenes |
| **Objetivo** | El sistema permite aprobar una transferencia pendiente y ejecuta automáticamente el movimiento de stock. |
| **Actor** | Administrador |
| **Entradas** | • Identificador de la transferencia |
| **Precondición** | La transferencia debe estar en estado PENDIENTE. |
| **Proceso** | 1. El administrador selecciona una transferencia pendiente<br>2. El administrador accede a la opción "Aprobar"<br>3. El sistema solicita confirmación<br>4. El administrador confirma la aprobación<br>5. El sistema valida que aún haya stock suficiente en el origen<br>6. El sistema descuenta el stock del almacén origen<br>7. El sistema incrementa el stock del almacén destino<br>8. El sistema registra los movimientos en el kardex (SALIDA en origen, ENTRADA en destino)<br>9. El sistema actualiza el estado a APROBADA<br>10. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | La transferencia se ejecuta, el stock se mueve entre almacenes y se registra en el kardex. |
| **Postcondición** | La transferencia queda con estado APROBADA y los stocks se actualizan automáticamente. |

---

### RF-INV-009: Cancelar transferencia pendiente

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-INV-009 |
| **Nombre** | Cancelar transferencia pendiente |
| **Objetivo** | El sistema permite cancelar una transferencia que aún no ha sido aprobada. |
| **Actor** | Administrador |
| **Entradas** | • Identificador de la transferencia |
| **Precondición** | La transferencia debe estar en estado PENDIENTE. |
| **Proceso** | 1. El administrador selecciona una transferencia pendiente<br>2. El administrador accede a la opción "Cancelar"<br>3. El sistema solicita confirmación<br>4. El administrador confirma la cancelación<br>5. El sistema valida que la transferencia esté en estado PENDIENTE<br>6. Si es válido, el sistema actualiza el estado a CANCELADA<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | La transferencia queda cancelada y no se realiza ningún movimiento de stock. |
| **Postcondición** | La transferencia aparece con estado CANCELADA en el historial. |

---

### RF-INV-010: Exportar stock a Excel

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-INV-010 |
| **Nombre** | Exportar stock a Excel |
| **Objetivo** | El sistema permite descargar un archivo Excel con el stock actual de todos los productos. |
| **Actor** | Administrador |
| **Entradas** | • Filtros de almacén (opcional) |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Exportar Stock"<br>2. El usuario puede seleccionar almacenes específicos o todos<br>3. El sistema genera un archivo Excel con la información<br>4. El sistema incluye: código, nombre, categoría, almacén y cantidad<br>5. El sistema descarga el archivo |
| **Salidas / Resultado esperado** | El usuario obtiene un archivo Excel con el inventario actual. |
| **Postcondición** | El usuario puede usar el archivo para análisis externos o respaldos. |

---

## 7. MÓDULO DE COMPRAS

**Código Módulo:** COM  
**Prioridad:** ALTA  
**Estado:** ✅ Implementado

---

### RF-COM-001: Registrar nueva orden de compra

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-COM-001 |
| **Nombre** | Registrar nueva orden de compra |
| **Objetivo** | El sistema permite crear una orden de compra para solicitar productos a un proveedor. |
| **Actor** | Administrador |
| **Entradas** | • Proveedor<br>• Lista de productos con cantidades<br>• Precio unitario de cada producto<br>• Fecha esperada de entrega<br>• Términos de pago<br>• Observaciones (opcional) |
| **Precondición** | El usuario debe estar autenticado y debe existir al menos un proveedor registrado. |
| **Proceso** | 1. El administrador accede a la opción "Nueva Orden de Compra"<br>2. El administrador selecciona al proveedor<br>3. El administrador agrega productos con cantidades y precios<br>4. El sistema calcula el subtotal, IGV (18%) y total<br>5. El administrador ingresa la fecha esperada de entrega<br>6. El administrador ingresa los términos de pago<br>7. Si los datos son correctos, el sistema crea la orden en estado PENDIENTE<br>8. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | La orden de compra queda registrada y puede ser enviada al proveedor. |
| **Postcondición** | La orden aparece en la lista con estado PENDIENTE. |

---

### RF-COM-002: Ver lista de órdenes de compra

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-COM-002 |
| **Nombre** | Ver lista de órdenes de compra |
| **Objetivo** | El sistema permite visualizar todas las órdenes de compra registradas. |
| **Actor** | Administrador |
| **Entradas** | • Filtros de estado (opcional)<br>• Filtros de proveedor (opcional)<br>• Rango de fechas (opcional)<br>• Cantidad de registros por página |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Órdenes de Compra"<br>2. El sistema muestra todas las órdenes registradas<br>3. El usuario puede filtrar por estado<br>4. El usuario puede filtrar por proveedor<br>5. El usuario puede filtrar por rango de fechas<br>6. El sistema muestra los resultados con paginación |
| **Salidas / Resultado esperado** | El usuario visualiza la lista de órdenes con: número, proveedor, fecha, total y estado. |
| **Postcondición** | El usuario obtiene información actualizada de las órdenes de compra. |

---

### RF-COM-003: Ver detalle de orden de compra específica

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-COM-003 |
| **Nombre** | Ver detalle de orden de compra específica |
| **Objetivo** | El sistema permite visualizar toda la información de una orden de compra. |
| **Actor** | Administrador |
| **Entradas** | • Identificador de la orden |
| **Precondición** | La orden de compra debe existir en el sistema. |
| **Proceso** | 1. El usuario selecciona una orden de la lista<br>2. El usuario accede a la opción "Ver Detalles"<br>3. El sistema muestra toda la información de la orden<br>4. El sistema muestra los productos solicitados con cantidades y precios |
| **Salidas / Resultado esperado** | El usuario visualiza: proveedor, productos, cantidades, precios, total, estado y fechas. |
| **Postcondición** | El usuario obtiene la información completa de la orden seleccionada. |

---

### RF-COM-004: Descargar orden de compra en PDF

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-COM-004 |
| **Nombre** | Descargar orden de compra en PDF |
| **Objetivo** | El sistema permite generar y descargar la orden de compra en formato PDF para enviarla al proveedor. |
| **Actor** | Administrador |
| **Entradas** | • Identificador de la orden |
| **Precondición** | La orden de compra debe existir en el sistema. |
| **Proceso** | 1. El usuario selecciona una orden de compra<br>2. El usuario accede a la opción "Descargar PDF"<br>3. El sistema genera el PDF con todos los datos de la orden<br>4. El sistema incluye: número de orden, proveedor, productos, cantidades, precios y total<br>5. El sistema descarga el archivo PDF |
| **Salidas / Resultado esperado** | El usuario obtiene un archivo PDF con la orden de compra. |
| **Postcondición** | La orden puede ser impresa o enviada por correo al proveedor. |

---

### RF-COM-005: Actualizar orden de compra

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-COM-005 |
| **Nombre** | Actualizar orden de compra |
| **Objetivo** | El sistema permite modificar los datos de una orden de compra que aún no ha sido enviada. |
| **Actor** | Administrador |
| **Entradas** | • Productos actualizados<br>• Cantidades actualizadas<br>• Precios actualizados<br>• Fecha de entrega<br>• Términos de pago |
| **Precondición** | La orden debe estar en estado PENDIENTE. |
| **Proceso** | 1. El usuario selecciona una orden pendiente<br>2. El usuario accede a la opción "Editar"<br>3. El sistema muestra el formulario con los datos actuales<br>4. El usuario modifica los campos deseados<br>5. El sistema recalcula los totales<br>6. Si es válido, el sistema actualiza la orden<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | Los datos de la orden quedan actualizados. |
| **Postcondición** | La orden modificada muestra la nueva información. |

---

### RF-COM-006: Cambiar estado de orden de compra

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-COM-006 |
| **Nombre** | Cambiar estado de orden de compra |
| **Objetivo** | El sistema permite actualizar el estado de una orden según su progreso (Enviada, Confirmada, Completada, Cancelada). |
| **Actor** | Administrador |
| **Entradas** | • Nuevo estado<br>• Observaciones (opcional) |
| **Precondición** | La orden debe existir en el sistema. |
| **Proceso** | 1. El usuario selecciona una orden de compra<br>2. El usuario accede a la opción "Cambiar Estado"<br>3. El sistema muestra los estados disponibles<br>4. El usuario selecciona el nuevo estado<br>5. El usuario puede agregar observaciones<br>6. El sistema valida que el cambio de estado sea válido<br>7. Si es válido, el sistema actualiza el estado<br>8. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | El estado de la orden queda actualizado. |
| **Postcondición** | La orden muestra el nuevo estado en el historial. |

---

### RF-COM-007: Cancelar orden de compra

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-COM-007 |
| **Nombre** | Cancelar orden de compra |
| **Objetivo** | El sistema permite cancelar una orden de compra que ya no será procesada. |
| **Actor** | Administrador |
| **Entradas** | • Identificador de la orden |
| **Precondición** | La orden no debe estar en estado COMPLETADA o CERRADA. |
| **Proceso** | 1. El usuario selecciona una orden de compra<br>2. El usuario accede a la opción "Cancelar"<br>3. El sistema solicita confirmación<br>4. El usuario confirma la cancelación<br>5. El sistema valida que la orden no esté completada<br>6. Si es válido, el sistema actualiza el estado a CANCELADA<br>7. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | La orden queda cancelada y no se procesa. |
| **Postcondición** | La orden aparece con estado CANCELADA en el historial. |

---

### RF-COM-008: Registrar recepción de compra

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-COM-008 |
| **Nombre** | Registrar recepción de compra |
| **Objetivo** | El sistema permite registrar la llegada de productos de una orden de compra y actualiza el inventario automáticamente. |
| **Actor** | Administrador |
| **Entradas** | • Orden de compra<br>• Almacén destino<br>• Productos recibidos con cantidades<br>• Número de guía de remisión<br>• Observaciones |
| **Precondición** | La orden debe estar en estado CONFIRMADA o EN_RECEPCION. |
| **Proceso** | 1. El administrador accede a la opción "Registrar Recepción"<br>2. El administrador selecciona la orden de compra<br>3. El administrador selecciona el almacén destino<br>4. El administrador ingresa las cantidades recibidas de cada producto<br>5. El administrador ingresa el número de guía<br>6. El sistema valida que las cantidades no excedan lo solicitado<br>7. El sistema incrementa el stock en el almacén seleccionado<br>8. El sistema registra el movimiento en el kardex<br>9. El sistema actualiza el estado de la orden (PARCIAL o COMPLETADA)<br>10. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | La recepción queda registrada y el stock se actualiza automáticamente. |
| **Postcondición** | El inventario refleja los productos recibidos y la orden actualiza su estado. |

---

### RF-COM-009: Ver estadísticas de compras

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-COM-009 |
| **Nombre** | Ver estadísticas de compras |
| **Objetivo** | El sistema permite visualizar información resumida sobre las compras realizadas. |
| **Actor** | Administrador |
| **Entradas** | Ninguna |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Estadísticas"<br>2. El sistema calcula el total de órdenes<br>3. El sistema calcula órdenes por estado<br>4. El sistema calcula el monto total de compras<br>5. El sistema muestra los datos en pantalla |
| **Salidas / Resultado esperado** | El usuario visualiza: total de órdenes, órdenes pendientes, órdenes completadas y monto total. |
| **Postcondición** | El usuario obtiene información resumida para tomar decisiones. |

---

## 8. MÓDULO DE CONFIGURACIÓN

**Código Módulo:** CFG  
**Prioridad:** MEDIA  
**Estado:** ✅ Implementado

---

### RF-CFG-001: Ver información de la empresa

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-CFG-001 |
| **Nombre** | Ver información de la empresa |
| **Objetivo** | El sistema permite visualizar los datos generales de la empresa para usar en documentos y reportes. |
| **Actor** | Administrador, Cajero |
| **Entradas** | Ninguna |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Información de Empresa"<br>2. El sistema muestra los datos registrados<br>3. El sistema muestra: nombre, RUC, dirección, teléfono, correo y logo |
| **Salidas / Resultado esperado** | El usuario visualiza toda la información de la empresa. |
| **Postcondición** | El usuario obtiene los datos necesarios para generar documentos. |

---

### RF-CFG-002: Actualizar información de la empresa

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-CFG-002 |
| **Nombre** | Actualizar información de la empresa |
| **Objetivo** | El sistema permite modificar los datos generales de la empresa. |
| **Actor** | Administrador |
| **Entradas** | • Nombre de la empresa<br>• RUC<br>• Dirección<br>• Teléfono<br>• Correo electrónico<br>• Logo (opcional) |
| **Precondición** | El usuario debe tener permisos de configuración del sistema. |
| **Proceso** | 1. El administrador accede a la opción "Configuración de Empresa"<br>2. El sistema muestra el formulario con los datos actuales<br>3. El administrador modifica los campos deseados<br>4. El sistema valida los nuevos datos<br>5. Si los datos son correctos, el sistema actualiza la información<br>6. Si hay errores, el sistema muestra un mensaje indicando el problema |
| **Salidas / Resultado esperado** | Los datos de la empresa quedan actualizados para usar en todos los documentos. |
| **Postcondición** | La información actualizada aparece en comprobantes y reportes. |

---

### RF-CFG-003: Ver lista de tipos de comprobantes

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-CFG-003 |
| **Nombre** | Ver lista de tipos de comprobantes |
| **Objetivo** | El sistema permite visualizar los tipos de comprobantes disponibles (Boleta, Factura, etc.). |
| **Actor** | Administrador, Cajero |
| **Entradas** | Ninguna |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Tipos de Comprobantes"<br>2. El sistema muestra todos los tipos registrados<br>3. El sistema muestra: código, nombre, serie y estado |
| **Salidas / Resultado esperado** | El usuario visualiza todos los tipos de comprobantes disponibles. |
| **Postcondición** | El usuario conoce los comprobantes que puede emitir. |

---

### RF-CFG-004: Ver lista de métodos de pago

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-CFG-004 |
| **Nombre** | Ver lista de métodos de pago |
| **Objetivo** | El sistema permite visualizar los métodos de pago disponibles (Efectivo, Tarjeta, Transferencia, etc.). |
| **Actor** | Administrador, Cajero |
| **Entradas** | Ninguna |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede a la opción "Métodos de Pago"<br>2. El sistema muestra todos los métodos registrados<br>3. El sistema muestra: código, nombre y estado |
| **Salidas / Resultado esperado** | El usuario visualiza todos los métodos de pago disponibles. |
| **Postcondición** | El usuario conoce las formas de pago que puede aceptar. |

---

### RF-CFG-005: Gestionar catálogo de productos

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-CFG-005 |
| **Nombre** | Administrar catálogos maestros de productos |
| **Objetivo** | El sistema permite crear y mantener los catálogos maestros para la gestión de productos de ropa y accesorios. |
| **Actor** | Administrador |
| **Entradas** | **Catálogo de Tallas:**<br>• Código de talla<br>• Descripción (XS, S, M, L, XL, XXL, Único, Ajustable)<br>• Orden de visualización<br><br>**Catálogo de Colores:**<br>• Código de color<br>• Nombre del color<br>• Código hexadecimal (opcional)<br><br>**Catálogo de Marcas:**<br>• Código de marca<br>• Nombre de marca<br>• Logo (opcional)<br><br>**Catálogo de Materiales:**<br>• Código de material<br>• Descripción (Algodón, Poliéster, Lino, Cuero, Mezcla, etc.)<br><br>**Catálogo de Géneros:**<br>• Código de género<br>• Descripción (Hombre, Mujer, Unisex, Niño) |
| **Precondición** | El usuario debe tener permisos de configuración del sistema. |
| **Proceso** | 1. El administrador accede a la opción "Catálogos de Productos"<br>2. El administrador selecciona el catálogo que desea gestionar (Tallas/Colores/Marcas/Materiales/Géneros)<br>3. El administrador puede realizar operaciones CRUD:<br>&nbsp;&nbsp;&nbsp;• **Crear:** Agregar nuevos elementos al catálogo<br>&nbsp;&nbsp;&nbsp;• **Leer:** Visualizar todos los elementos registrados<br>&nbsp;&nbsp;&nbsp;• **Actualizar:** Modificar elementos existentes<br>&nbsp;&nbsp;&nbsp;• **Eliminar:** Desactivar elementos (validando que no estén en uso)<br>4. El sistema valida que no haya duplicados<br>5. El sistema valida que elementos en uso no puedan eliminarse<br>6. El sistema registra los cambios en auditoría |
| **Salidas / Resultado esperado** | Los catálogos maestros quedan actualizados y disponibles para uso en registro de productos. |
| **Postcondición** | Los nuevos valores aparecen en los formularios de productos como opciones seleccionables. |

---

### RF-CFG-006: Configurar series de comprobantes

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-CFG-006 |
| **Nombre** | Administrar series de comprobantes del sistema |
| **Objetivo** | El sistema permite configurar y gestionar las series de numeración para todos los tipos de comprobantes. |
| **Actor** | Administrador |
| **Entradas** | • Tipo de comprobante (Boleta/Factura/Nota de Crédito/Nota de Débito/Guía de Remisión)<br>• Serie (ej: B001, F001, NC01, ND01, GR01)<br>• Número inicial<br>• Número actual (correlativo)<br>• Estado (Activo/Inactivo)<br>• Punto de emisión (opcional) |
| **Precondición** | El usuario debe tener permisos de configuración del sistema. |
| **Proceso** | 1. El administrador accede a la opción "Series de Comprobantes"<br>2. El administrador puede crear nuevas series:<br>&nbsp;&nbsp;&nbsp;• Selecciona el tipo de comprobante<br>&nbsp;&nbsp;&nbsp;• Define la serie (debe cumplir formato SUNAT: 4 caracteres alfanuméricos)<br>&nbsp;&nbsp;&nbsp;• Establece el número inicial (ej: 00000001)<br>3. El sistema valida que la serie no esté duplicada<br>4. El sistema asigna automáticamente números correlativos al emitir comprobantes<br>5. El administrador puede activar/desactivar series<br>6. El administrador puede consultar el último número usado por serie<br>7. El sistema no permite eliminar series con comprobantes emitidos |
| **Salidas / Resultado esperado** | Las series quedan configuradas y disponibles para emisión de comprobantes. |
| **Postcondición** | Los comprobantes se emiten con numeración correlativa automática según la serie activa. |

---

### RF-CFG-007: Configurar política de devoluciones

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-CFG-007 |
| **Nombre** | Definir política de devoluciones y cambios |
| **Objetivo** | El sistema permite establecer las reglas de negocio para devoluciones y cambios de productos. |
| **Actor** | Administrador |
| **Entradas** | • Días límite para devolución con Boleta (ej: 7 días)<br>• Días límite para devolución con Factura (ej: 30 días)<br>• Días límite por defecto de fábrica (ej: 90 días)<br>• Condiciones requeridas:<br>&nbsp;&nbsp;&nbsp;- Etiquetas originales (Sí/No)<br>&nbsp;&nbsp;&nbsp;- Producto sin uso (Sí/No)<br>&nbsp;&nbsp;&nbsp;- Empaque original (Sí/No)<br>• Porcentaje de reposición (ej: 100%, 80%, 50%)<br>• Categorías excluidas de devolución<br>• Política de vale de cambio:<br>&nbsp;&nbsp;&nbsp;- Días de vigencia del vale (ej: 90 días)<br>&nbsp;&nbsp;&nbsp;- Permite uso parcial (Sí/No) |
| **Precondición** | El usuario debe tener permisos de configuración del sistema. |
| **Proceso** | 1. El administrador accede a la opción "Política de Devoluciones"<br>2. El administrador configura los plazos permitidos por tipo de comprobante<br>3. El administrador define las condiciones que debe cumplir el producto<br>4. El administrador establece el porcentaje de reposición según motivo<br>5. El administrador puede excluir categorías específicas (ej: ropa interior, trajes de baño)<br>6. El administrador configura las reglas de vales de cambio<br>7. El sistema valida y guarda la configuración<br>8. El sistema aplica estas reglas en el proceso RF-VNT-009 |
| **Salidas / Resultado esperado** | La política de devoluciones queda definida y se aplica automáticamente en el módulo de ventas. |
| **Postcondición** | El sistema valida automáticamente las condiciones al emitir Notas de Crédito. |

---

## 9. MÓDULO DE REPORTES

**Código Módulo:** REP  
**Prioridad:** MEDIA  
**Estado:** ✅ Implementado

---

### RF-REP-001: Ver resumen ejecutivo del sistema

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-REP-001 |
| **Nombre** | Ver resumen ejecutivo del sistema |
| **Objetivo** | El sistema permite visualizar un resumen con las métricas más importantes del negocio. |
| **Actor** | Administrador |
| **Entradas** | Ninguna |
| **Precondición** | El usuario debe estar autenticado en el sistema. |
| **Proceso** | 1. El usuario accede al dashboard principal<br>2. El sistema calcula las métricas principales<br>3. El sistema muestra: ventas del día, ventas del mes, productos con stock bajo y alertas<br>4. El sistema muestra gráficos de tendencias |
| **Salidas / Resultado esperado** | El usuario visualiza un resumen completo del estado del negocio. |
| **Postcondición** | El usuario obtiene información clave para tomar decisiones rápidas. |

---

### RF-REP-002: Ver reporte de ventas

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-REP-002 |
| **Nombre** | Ver reporte de ventas |
| **Objetivo** | El sistema permite generar un reporte detallado de las ventas realizadas en un período. |
| **Actor** | Administrador |
| **Entradas** | • Fecha de inicio<br>• Fecha de fin<br>• Usuario (opcional)<br>• Cliente (opcional)<br>• Tipo de comprobante (opcional)<br>• Método de pago (opcional) |
| **Precondición** | El usuario debe tener permisos de reportes de ventas. |
| **Proceso** | 1. El usuario accede a la opción "Reporte de Ventas"<br>2. El usuario selecciona el rango de fechas<br>3. El usuario puede aplicar filtros adicionales<br>4. El sistema consulta todas las ventas del período<br>5. El sistema calcula totales y estadísticas<br>6. El sistema muestra los resultados en pantalla |
| **Salidas / Resultado esperado** | El usuario visualiza un reporte detallado con: número de ventas, monto total, ventas por producto y tendencias. |
| **Postcondición** | El usuario obtiene análisis de las ventas para evaluar el desempeño. |

---

### RF-REP-003: Ver reporte de inventario

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-REP-003 |
| **Nombre** | Ver reporte de inventario |
| **Objetivo** | El sistema permite generar un reporte del estado actual del inventario. |
| **Actor** | Administrador |
| **Entradas** | • Almacén (opcional)<br>• Categoría (opcional)<br>• Estado (opcional) |
| **Precondición** | El usuario debe tener permisos de reportes de inventario. |
| **Proceso** | 1. El usuario accede a la opción "Reporte de Inventario"<br>2. El usuario puede aplicar filtros<br>3. El sistema consulta el stock de todos los productos<br>4. El sistema identifica productos con stock bajo<br>5. El sistema calcula la valorización total del inventario<br>6. El sistema muestra los resultados en pantalla |
| **Salidas / Resultado esperado** | El usuario visualiza: stock por producto, productos con stock bajo y valor total del inventario. |
| **Postcondición** | El usuario obtiene información para planificar compras y reposiciones. |

---

### RF-REP-004: Ver reporte de compras

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-REP-004 |
| **Nombre** | Ver reporte de compras |
| **Objetivo** | El sistema permite generar un reporte de las compras realizadas a proveedores. |
| **Actor** | Administrador |
| **Entradas** | • Fecha de inicio<br>• Fecha de fin<br>• Proveedor (opcional)<br>• Estado (opcional) |
| **Precondición** | El usuario debe tener permisos de reportes de inventario (las compras están relacionadas). |
| **Proceso** | 1. El usuario accede a la opción "Reporte de Compras"<br>2. El usuario selecciona el rango de fechas<br>3. El usuario puede aplicar filtros adicionales<br>4. El sistema consulta todas las órdenes de compra del período<br>5. El sistema calcula totales y estadísticas<br>6. El sistema muestra los resultados en pantalla |
| **Salidas / Resultado esperado** | El usuario visualiza: número de órdenes, monto total, órdenes por proveedor y estado. |
| **Postcondición** | El usuario obtiene análisis de las compras para evaluar proveedores. |

---

### RF-REP-005: Ver reporte financiero

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-REP-005 |
| **Nombre** | Ver reporte financiero |
| **Objetivo** | El sistema permite generar un reporte de los movimientos financieros (ingresos y egresos). |
| **Actor** | Administrador |
| **Entradas** | • Fecha de inicio<br>• Fecha de fin |
| **Precondición** | El usuario debe tener permisos de reportes financieros. |
| **Proceso** | 1. El usuario accede a la opción "Reporte Financiero"<br>2. El usuario selecciona el rango de fechas<br>3. El sistema consulta todas las ventas (ingresos)<br>4. El sistema consulta todas las compras (egresos)<br>5. El sistema calcula el balance<br>6. El sistema muestra los resultados en pantalla |
| **Salidas / Resultado esperado** | El usuario visualiza: total de ingresos, total de egresos y balance final. |
| **Postcondición** | El usuario obtiene un panorama financiero del negocio. |

---

### RF-REP-006: Ver reporte de caja

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-REP-006 |
| **Nombre** | Ver reporte de caja |
| **Objetivo** | El sistema permite generar un reporte de los movimientos de las sesiones de caja. |
| **Actor** | Administrador |
| **Entradas** | • Fecha de inicio<br>• Fecha de fin<br>• Caja (opcional)<br>• Usuario (opcional) |
| **Precondición** | El usuario debe tener permisos de reportes financieros. |
| **Proceso** | 1. El usuario accede a la opción "Reporte de Caja"<br>2. El usuario selecciona el rango de fechas<br>3. El usuario puede aplicar filtros adicionales<br>4. El sistema consulta todas las sesiones de caja<br>5. El sistema calcula totales de ventas, ingresos, egresos y diferencias<br>6. El sistema muestra los resultados en pantalla |
| **Salidas / Resultado esperado** | El usuario visualiza: sesiones abiertas/cerradas, montos de ventas, diferencias (sobrantes/faltantes). |
| **Postcondición** | El usuario obtiene control de los movimientos de caja. |

---

### RF-REP-007: Ver productos más vendidos

| Campo | Descripción |
|-------|-------------|
| **Código** | RF-REP-007 |
| **Nombre** | Ver productos más vendidos |
| **Objetivo** | El sistema permite visualizar un ranking de los productos con mayor cantidad de ventas. |
| **Actor** | Administrador |
| **Entradas** | • Fecha de inicio<br>• Fecha de fin<br>• Categoría (opcional)<br>• Cantidad de productos a mostrar |
| **Precondición** | El usuario debe tener permisos de reportes de ventas. |
| **Proceso** | 1. El usuario accede a la opción "Productos Más Vendidos"<br>2. El usuario selecciona el rango de fechas<br>3. El usuario puede filtrar por categoría<br>4. El usuario define cuántos productos mostrar (top 10, 20, etc.)<br>5. El sistema consulta las ventas y agrupa por producto<br>6. El sistema ordena por cantidad vendida de mayor a menor<br>7. El sistema muestra los resultados con gráficos |
| **Salidas / Resultado esperado** | El usuario visualiza los productos más demandados con cantidades vendidas y monto generado. |
| **Postcondición** | El usuario identifica los productos estrella para optimizar el inventario. |

---

## 📊 RESUMEN

### Total de Requerimientos Funcionales

| Módulo | Código | RF Total | Estado |
|--------|--------|----------|--------|
| **Módulos de Plataforma (SaaS)** |
| Superadmin | SUP | 10 | 🆕 Nuevo |
| Suscripciones | SUB | 10 | 🆕 Nuevo |
| **Módulos de Tienda (Tenant/Admin)** |
| Autenticación | AUT | 8 | ✅ Actualizado |
| Usuarios | USR | 10 | ✅ 100% |
| Entidades Comerciales | ENT | 10 | ✅ 100% |
| Ventas | VNT | 9 | ✅ 100% |
| Productos | PRD | 8 | ✅ 100% |
| Inventario | INV | 10 | ✅ 100% |
| Compras | COM | 9 | ✅ 100% |
| Configuración | CFG | 7 | ✅ 100% |
| Reportes | REP | 7 | ✅ 100% |
| **Módulos de Cliente (B2C)** |
| Cliente/Storefront | CLI | 13 | 🆕 Nuevo |
| **TOTAL** | - | **111** | **✅ Completo** |

---

## 🛡️ REQUERIMIENTOS NO FUNCIONALES

Los requerimientos no funcionales describen cómo debe funcionar el sistema en aspectos de calidad, seguridad y rendimiento.

---

### RNF-001: Velocidad de respuesta

**Categoría:** Rendimiento

| Aspecto | Descripción |
|---------|-------------|
| **Objetivo** | El sistema debe responder rápidamente a las acciones del usuario para una buena experiencia. |
| **Descripción** | • Las páginas del sistema deben cargar en menos de 3 segundos<br>• Las búsquedas de productos deben mostrar resultados en menos de 1 segundo<br>• Las operaciones de venta deben completarse en menos de 2 segundos<br>• Los reportes simples deben generarse en menos de 5 segundos |

---

### RNF-002: Protección de información

**Categoría:** Seguridad

| Aspecto | Descripción |
|---------|-------------|
| **Objetivo** | El sistema debe proteger la información sensible de los usuarios y del negocio. |
| **Descripción** | • Las contraseñas deben estar encriptadas y no mostrarse en ningún lugar<br>• Solo usuarios autorizados pueden acceder a información financiera<br>• El sistema debe cerrar sesión automáticamente después de 30 minutos de inactividad<br>• Todas las conexiones deben usar protocolo seguro (HTTPS)<br>• Los datos sensibles no deben aparecer en los registros del sistema |

---

### RNF-003: Facilidad de uso

**Categoría:** Usabilidad

| Aspecto | Descripción |
|---------|-------------|
| **Objetivo** | El sistema debe ser fácil de entender y usar para cualquier persona. |
| **Descripción** | • Los menús y opciones deben tener nombres claros y fáciles de entender<br>• Los mensajes de error deben explicar el problema y cómo solucionarlo<br>• El sistema debe mostrar ayuda o sugerencias cuando sea necesario<br>• Los formularios deben indicar claramente qué campos son obligatorios<br>• El sistema debe funcionar igual en computadoras y tablets |

---

### RNF-004: Disponibilidad del sistema

**Categoría:** Disponibilidad

| Aspecto | Descripción |
|---------|-------------|
| **Objetivo** | El sistema debe estar disponible cuando los usuarios lo necesiten. |
| **Descripción** | • El sistema debe estar disponible el 99% del tiempo (máximo 7 horas de caída al mes)<br>• Las actualizaciones y mantenimiento deben hacerse fuera del horario de trabajo<br>• Si hay una falla, el sistema debe recuperarse en menos de 1 hora<br>• Debe existir una copia de respaldo de la información cada día |

---

### RNF-005: Compatibilidad con navegadores

**Categoría:** Compatibilidad

| Aspecto | Descripción |
|---------|-------------|
| **Objetivo** | El sistema debe funcionar correctamente en los navegadores más usados. |
| **Descripción** | • El sistema debe funcionar en Google Chrome (versión 90 o superior)<br>• El sistema debe funcionar en Microsoft Edge (versión 90 o superior)<br>• El sistema debe funcionar en Mozilla Firefox (versión 88 o superior)<br>• El sistema debe funcionar en Safari (versión 14 o superior)<br>• El sistema debe verse bien en pantallas desde 1366x768 píxeles |

---

### RNF-006: Capacidad de crecimiento

**Categoría:** Escalabilidad

| Aspecto | Descripción |
|---------|-------------|
| **Objetivo** | El sistema debe poder manejar más usuarios y datos sin perder velocidad. |
| **Descripción** | • El sistema debe soportar hasta 50 usuarios trabajando al mismo tiempo<br>• El sistema debe poder almacenar hasta 100,000 productos sin problemas<br>• El sistema debe poder registrar hasta 1,000 ventas por día<br>• La base de datos debe poder crecer hasta 50 GB sin afectar el rendimiento |

---

### RNF-007: Respaldo de información

**Categoría:** Confiabilidad

| Aspecto | Descripción |
|---------|-------------|
| **Objetivo** | El sistema debe proteger la información contra pérdidas accidentales. |
| **Descripción** | • El sistema debe hacer copias de seguridad automáticas todos los días<br>• Las copias de seguridad deben guardarse en un lugar diferente al servidor principal<br>• Debe ser posible recuperar información de los últimos 30 días<br>• Las copias deben probarse mensualmente para verificar que funcionan |

---

### RNF-008: Facilidad de mantenimiento

**Categoría:** Mantenibilidad

| Aspecto | Descripción |
|---------|-------------|
| **Objetivo** | El sistema debe ser fácil de actualizar y corregir cuando sea necesario. |
| **Descripción** | • El código del sistema debe estar documentado y organizado<br>• Los errores del sistema deben registrarse con información clara del problema<br>• Las actualizaciones deben poder instalarse sin perder información<br>• Debe existir un manual técnico para el personal de soporte |

---

### RNF-009: Registro de actividades

**Categoría:** Auditoría

| Aspecto | Descripción |
|---------|-------------|
| **Objetivo** | El sistema debe guardar registro de las operaciones importantes para control. |
| **Descripción** | • El sistema debe registrar quién hizo cada venta con fecha y hora<br>• El sistema debe registrar todos los cambios en precios de productos<br>• El sistema debe registrar los movimientos de inventario con usuario responsable<br>• El sistema debe registrar los intentos de acceso fallidos<br>• Los registros deben conservarse por al menos 1 año |

---

### RNF-010: Validación de datos

**Categoría:** Integridad

| Aspecto | Descripción |
|---------|-------------|
| **Objetivo** | El sistema debe verificar que la información ingresada sea correcta. |
| **Descripción** | • El sistema no debe permitir precios negativos o en cero<br>• El sistema no debe permitir ventas sin seleccionar un cliente<br>• El sistema no debe permitir vender más productos de los que hay en stock<br>• Los documentos de identidad deben tener el formato correcto (DNI 8 dígitos, RUC 11 dígitos)<br>• Las fechas futuras no deben ser permitidas en registros pasados |

---

## 📊 RESUMEN COMPLETO

### Requerimientos Funcionales

| Módulo | Código | Total | Estado |
|--------|--------|-------|--------|
| **NIVEL 1: Plataforma SaaS** |
| Superadmin | SUP | 10 | 🆕 Nuevo |
| Suscripciones | SUB | 10 | 🆕 Nuevo |
| **NIVEL 2: Tienda (Tenant)** |
| Autenticación | AUT | 8 | ✅ Actualizado |
| Usuarios | USR | 10 | ✅ 100% |
| Entidades Comerciales | ENT | 10 | ✅ 100% |
| Ventas | VNT | 9 | ✅ 100% |
| Productos | PRD | 8 | ✅ 100% |
| Inventario | INV | 10 | ✅ 100% |
| Compras | COM | 9 | ✅ 100% |
| Configuración | CFG | 7 | ✅ 100% |
| Reportes | REP | 7 | ✅ 100% |
| **NIVEL 3: Cliente (B2C)** |
| Cliente/Storefront | CLI | 13 | 🆕 Nuevo |
| **TOTAL RF** | - | **111** | **✅ 100%** |

### Requerimientos No Funcionales

| Categoría | Código | Total |
|-----------|--------|-------|
| Rendimiento | RNF-001 | 1 |
| Seguridad | RNF-002 | 1 |
| Usabilidad | RNF-003 | 1 |
| Disponibilidad | RNF-004 | 1 |
| Compatibilidad | RNF-005 | 1 |
| Escalabilidad | RNF-006 | 1 |
| Confiabilidad | RNF-007 | 1 |
| Mantenibilidad | RNF-008 | 1 |
| Auditoría | RNF-009 | 1 |
| Integridad | RNF-010 | 1 |
| **TOTAL RNF** | - | **10** |

### **TOTAL GENERAL: 121 REQUERIMIENTOS**
**Arquitectura:** Multi-Tenant SaaS (3 Niveles)

---

**Preparado por:** Equipo de Desarrollo  
**Revisado por:** GitHub Copilot  
**Fecha:** 30 de Enero, 2026  
**Versión:** 3.0 (Arquitectura Multi-Tenant)  

**FIN DEL DOCUMENTO**
