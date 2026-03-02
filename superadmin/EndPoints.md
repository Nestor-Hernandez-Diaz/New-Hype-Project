Estos son los Endpoints que vamos a usar:

1. Cupones - Gestion de cupones promocionales

1.1. LISTAR CUPONES
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/cupones

1.2. CREAR CUPON
Metodo: POST
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/cupones
RequestBody:
{
  "codigo": "string",
  "tipoDescuento": "string",
  "valorDescuento": 0.01,
  "fechaExpiracion": "2026-03-01",
  "usosMaximos": 1073741824
}

2. Operaciones - Dashboard, pagos, tickets, auditoria

2.1. LISTAR TICKETS DE SOPORTE
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tickets
Parametros: estado, prioridad, tenantId, page, size

2.2. DETALLE DE TICKET
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tickets/{id}
Parametros: id

2.3. RESPONDER/CAMBIAR ESTADO/CAMBIAR PRIORIDAD DE TICKET
Metodo: PATCH
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tickets/{id}
Parametros: id
RequestBody:
{
  "estado": "string",
  "prioridad": "string",
  "respuesta": "string"
}

2.4. DASBOARD DE INGRESOS: METRICAS GLOBALES, POR PLA, POR TOP, ETC
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/dashboard/ingresos

2.5. DASHBOARD: ESTADO DE PAGOS: AL DIA, POR VENCER, VENCIDOS
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/suscripciones/estado-pagos

2.6. OBTENER FACTURA / DETALLE DE PAGO
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/pagos/{id}/factura
Parametros: id

2.7. LOGS DE AUDITORIA GLOBAL
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/auditoria
Parametros: tenantId, accion, fechaDesde, fechaHasta, page, size

2.8. REGISTRAR PAGO MANUAL -> EXTIENDE FECHA_FIN +30 DIAS
Metodo: POST
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/pagos
RequestBody:
{
  "tenantId": 9007199254740991,
  "monto": 0.01,
  "metodoPago": "string",
  "referenciaTransaccion": "string",
  "cuponCodigo": "string"
}

3. Planes - Gestion de planes de suscripcion

3.1. LISTAR PLANES CON CONTEO DE TENANTS
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/planes

3.2. ACTIVAR/DESACTIVAR PLAN
Metodo: PATCH
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/planes/{id}/estado
Parametros: id

3.3. CREAR PLAN DE SUSCRIPCION
Metodo: POST
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/planes
RequestBody:
{
  "nombre": "string",
  "descripcion": "string",
  "precioMensual": 0,
  "precioAnual": 0,
  "maxProductos": 1073741824,
  "maxUsuarios": 1073741824,
  "maxAlmacenes": 1073741824,
  "maxVentasMes": 1073741824,
  "periodoPruebaDias": 1073741824,
  "moduloIds": [
    9007199254740991
  ]
}

3.4. ACTUALIZAR PLAN (No afecta a tenants existentes)
Metodo: PUT
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/planes/{id}
Parametros: id

4. Tenants - Gestion de tenants para superadmin

4.1. SOFTDELETE DE UN TENANT
Metodo: DELETE
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants/{id}
Parametros: id

4.2. DETALLE DE TENANT CON PLAN, METRICAS
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants/{id}
Parametros: id

4.3. MODULOS ACTIVOS DEL TENANT (PLAN+ OVERRIDES)
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants/{id}/modulos
Parametros: id

4.4. LISTAR TENANTS CON FILTROS
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants
Parametros: estado, q, page, size

4.5. HISTORIAL DE PAGOS DE UN TENANT
Metodo: GET
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants/{id}/pagos
Parametros: id

4.6. SUSPENDER/ACTIVAR TENANT (Motivo obligatorio si SUSPENDIDA)
Metodo: PATCH
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants/{id}/estado
Parametros: id
RequestBody:
{
  "estado": "string",
  "motivo": "string"
}

4.7. CREAR TENANT + ADMIN USER + SUSCRIPCION (Opcional)
Metodo: POST
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants
RequestBody:
{
  "nombre": "string",
  "subdominio": "string",
  "propietarioNombre": "string",
  "propietarioTipoDocumento": "string",
  "propietarioNumeroDocumento": "string",
  "email": "string",
  "telefono": "string",
  "direccion": "string",
  "planId": 9007199254740991,
  "adminPassword": "stringst"
}

4.8. ASIGNAR/CAMBIAR PLAN A TENANT
Metodo: POST
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants/{id}/suscripcion
Parametros: id
RequestBody:
{
  "planId": 9007199254740991,
  "fechaInicio": "2026-03-02",
  "fechaFin": "2026-03-02",
  "autoRenovar": true
}

4.9. ENVIAR RECORDATORIO DE PAGO AL TENANT
Metodo: POST
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants/{id}/recordatorio-pago
Parametros: id

4.10. ACTUALIZAR DATOS DEL TENANT + OVERRIDES DE LIMITES
Metodo: PUT
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants/{id}
Parametros: id
RequestBody:
{
  "nombre": "string",
  "email": "string",
  "telefono": "string",
  "direccion": "string",
  "overrideMaxProductos": 1073741824,
  "overrideMaxUsuarios": 1073741824,
  "overrideMaxAlmacenes": 1073741824,
  "overrideMaxVentasMes": 1073741824
}

4.11.OVERRIDE MANUAL DE MODULOS DEL TENANT
Metodo: PUT
RequestURL: http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/tenants/{id}/modulos
Parametros: id
RequestBody: 
{
  "modulos": [
    {
      "moduloId": 9007199254740991,
      "activo": true
    }
  ]
}