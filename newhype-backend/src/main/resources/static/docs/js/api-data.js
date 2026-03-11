const API_DATA = {
    info: {
        title: "NewHype ERP API",
        description: "API REST Multi-Tenant para ERP de Tienda de Ropa",
        version: "1.0",
        baseUrl: "http://spring.informaticapp.com:5001/New-Hype-Project"
    },
    environments: {
        negocios: {
            name: "Negocios",
            description: "Entorno de administración por sucursal. Gestión completa del negocio: productos, ventas, inventario, compras y más.",
            icon: "briefcase",
            modules: {}
        },
        storefront: {
            name: "StoreFront (Cliente)",
            description: "Tienda online B2C para clientes finales. Catálogo de productos, pedidos, perfil y más.",
            icon: "shopping-cart",
            modules: {}
        },
        superadmin: {
            name: "Superadmin",
            description: "Administración de la plataforma. Gestión de planes, sucursales (tenants), pagos y cupones.",
            icon: "shield",
            modules: {}
        },
        auth: {
            name: "Autenticación",
            description: "Autenticación y registro para los 3 entornos. Login, registro, renovación de tokens y más.",
            icon: "key",
            modules: {}
        }
    }
};

// ===================== NEGOCIOS =====================

API_DATA.environments.negocios.modules = {
    almacenes: {
        name: "Almacenes",
        description: "Gestión completa de los almacenes o depósitos del negocio. Permite crear, consultar, actualizar y activar/desactivar almacenes dentro del tenant, incluyendo la designación de un almacén principal.",
        endpoints: [
            {
                method: "GET",
                path: "/api/v1/almacenes",
                summary: "Listar almacenes del tenant",
                description: "Recupera el listado completo de todos los almacenes registrados dentro del tenant actual. Cada almacén incluye su nombre, dirección física, si es el almacén principal y su estado activo/inactivo. Este endpoint es útil para poblar selectores de almacén en formularios de ventas, compras y transferencias.",
                parameters: [],
                requestBody: null,
                responses: {
                    "200": { description: "OK", schema: "ApiResponseListAlmacenResponse" }
                }
            },
            {
                method: "POST",
                path: "/api/v1/almacenes",
                summary: "Crear almacén",
                description: "Registra un nuevo almacén o depósito dentro del tenant actual. Se debe especificar un nombre único y opcionalmente una dirección física. Si se marca como principal, reemplazará al almacén principal existente. El almacén creado quedará en estado activo y disponible para recibir inventario, transferencias y asociarse a cajas registradoras.",
                parameters: [],
                requestBody: {
                    type: "CrearAlmacenRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre del almacén" },
                        direccion: { type: "string", required: false, description: "Dirección física del almacén" },
                        esPrincipal: { type: "boolean", required: false, description: "Indica si es el almacén principal" }
                    }
                },
                responses: {
                    "200": { description: "OK", schema: "ApiResponseAlmacenResponse" }
                }
            },
            {
                method: "PUT",
                path: "/api/v1/almacenes/{id}",
                summary: "Actualizar almacén",
                description: "Modifica la información de un almacén previamente registrado, como su nombre, dirección o designación como almacén principal. Los cambios se reflejan de inmediato en todo el sistema, incluyendo reportes de inventario y transferencias asociadas a este almacén.",
                parameters: [
                    { name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del almacén" }
                ],
                requestBody: {
                    type: "CrearAlmacenRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre del almacén" },
                        direccion: { type: "string", required: false, description: "Dirección física del almacén" },
                        esPrincipal: { type: "boolean", required: false, description: "Indica si es el almacén principal" }
                    }
                },
                responses: {
                    "200": { description: "OK", schema: "ApiResponseAlmacenResponse" }
                }
            },
            {
                method: "PATCH",
                path: "/api/v1/almacenes/{id}/estado",
                summary: "Activar/desactivar almacén",
                description: "Alterna el estado de un almacén entre activo e inactivo. Un almacén desactivado deja de estar disponible para nuevas operaciones como ventas, compras o transferencias, aunque su inventario y datos históricos se conservan intactos para consulta y reportes.",
                parameters: [
                    { name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del almacén" }
                ],
                requestBody: null,
                responses: {
                    "200": { description: "OK", schema: "ApiResponseAlmacenResponse" }
                }
            }
        ]
    },
    caja: {
        name: "Caja",
        description: "Módulo de gestión de sesiones de caja. Permite abrir y cerrar sesiones de caja con montos iniciales y finales, registrar movimientos de ingreso y egreso durante la jornada, y consultar el historial de operaciones por sesión.",
        endpoints: [
            {
                method: "GET",
                path: "/api/v1/caja/sesiones",
                summary: "Listar sesiones de caja",
                description: "Recupera el historial de sesiones de caja del tenant con filtros opcionales por estado (abierta, cerrada) y por caja registradora. Cada sesión muestra el monto de apertura, monto de cierre, diferencia y los totales de movimientos realizados durante la jornada.",
                parameters: [
                    { name: "estado", in: "query", type: "string", required: false, description: "Filtrar por estado de la sesión" },
                    { name: "cajaId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por ID de caja registradora" }
                ],
                requestBody: null,
                responses: {
                    "200": { description: "OK", schema: "ApiResponseListSesionCajaResponse" }
                }
            },
            {
                method: "POST",
                path: "/api/v1/caja/sesiones",
                summary: "Abrir sesión de caja",
                description: "Inicia una nueva sesión de caja para una caja registradora específica. Se debe indicar el monto inicial con el que se abre la caja. Solo puede existir una sesión activa por caja registradora a la vez. La sesión permanecerá abierta hasta que se cierre explícitamente, y durante ese período se podrán registrar movimientos de ingreso y egreso.",
                parameters: [],
                requestBody: {
                    type: "AbrirSesionRequest",
                    properties: {
                        cajaRegistradoraId: { type: "integer (int64)", required: true, description: "ID de la caja registradora" },
                        montoInicial: { type: "number", required: true, description: "Monto inicial de apertura" }
                    }
                },
                responses: {
                    "200": { description: "OK", schema: "ApiResponseSesionCajaResponse" }
                }
            },
            {
                method: "GET",
                path: "/api/v1/caja/sesiones/{id}",
                summary: "Obtener sesión de caja por ID",
                description: "Consulta el detalle completo de una sesión de caja específica, incluyendo el monto de apertura, monto de cierre (si fue cerrada), la diferencia entre lo esperado y lo real, y el listado de todos los movimientos de ingreso y egreso registrados durante esa sesión.",
                parameters: [
                    { name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la sesión de caja" }
                ],
                requestBody: null,
                responses: {
                    "200": { description: "OK", schema: "ApiResponseSesionCajaResponse" }
                }
            },
            {
                method: "PATCH",
                path: "/api/v1/caja/sesiones/{id}/cerrar",
                summary: "Cerrar sesión de caja",
                description: "Finaliza una sesión de caja activa registrando el monto final de cierre y observaciones opcionales. El sistema calcula automáticamente la diferencia entre el monto esperado (apertura + ingresos - egresos) y el monto final declarado, permitiendo identificar sobrantes o faltantes de caja.",
                parameters: [
                    { name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la sesión de caja" }
                ],
                requestBody: {
                    type: "CerrarSesionRequest",
                    properties: {
                        montoFinal: { type: "number", required: true, description: "Monto final al cerrar la caja" },
                        observaciones: { type: "string", required: false, description: "Observaciones del cierre" }
                    }
                },
                responses: {
                    "200": { description: "OK", schema: "ApiResponseSesionCajaResponse" }
                }
            },
            {
                method: "GET",
                path: "/api/v1/caja/sesiones/{id}/movimientos",
                summary: "Listar movimientos de una sesión de caja",
                description: "Recupera la lista completa de movimientos (ingresos y egresos) realizados durante una sesión de caja específica. Incluye el tipo de movimiento, monto, descripción y fecha/hora de cada operación, permitiendo un control detallado del flujo de efectivo.",
                parameters: [
                    { name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la sesión de caja" }
                ],
                requestBody: null,
                responses: {
                    "200": { description: "OK", schema: "ApiResponseListMovimientoCajaResponse" }
                }
            },
            {
                method: "POST",
                path: "/api/v1/caja/sesiones/{id}/movimientos",
                summary: "Registrar movimiento de caja (ingreso/egreso)",
                description: "Agrega un nuevo movimiento de dinero dentro de una sesión de caja activa. El movimiento puede ser de tipo INGRESO (entrada de dinero) o EGRESO (salida de dinero), y debe incluir el monto correspondiente. Solo es posible registrar movimientos en sesiones que se encuentren abiertas.",
                parameters: [
                    { name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la sesión de caja" }
                ],
                requestBody: {
                    type: "MovimientoCajaRequest",
                    properties: {
                        tipoMovimiento: { type: "string", required: true, description: "Tipo: INGRESO o EGRESO" },
                        monto: { type: "number", required: true, description: "Monto del movimiento" },
                        descripcion: { type: "string", required: false, description: "Descripción del movimiento" }
                    }
                },
                responses: {
                    "200": { description: "OK", schema: "ApiResponseMovimientoCajaResponse" }
                }
            }
        ]
    },
    cajasRegistradoras: {
        name: "Cajas Registradoras",
        description: "Administración de las cajas registradoras físicas del negocio. Cada caja registradora se asocia a un almacén y permite abrir sesiones de caja para el control de efectivo y movimientos diarios.",
        endpoints: [
            {
                method: "GET",
                path: "/api/v1/configuracion/cajas-registradoras",
                summary: "Listar cajas registradoras del tenant",
                description: "Recupera el listado de todas las cajas registradoras configuradas en el tenant. Cada registro incluye el nombre de la caja, el almacén al que está asociada y su estado activo/inactivo. Es útil para poblar selectores al abrir sesiones de caja.",
                parameters: [],
                requestBody: null,
                responses: {
                    "200": { description: "OK", schema: "ApiResponseListCajaRegistradoraResponse" }
                }
            },
            {
                method: "POST",
                path: "/api/v1/configuracion/cajas-registradoras",
                summary: "Crear caja registradora",
                description: "Registra una nueva caja registradora en el sistema, asociándola a un almacén específico. La caja creada quedará activa y lista para que los usuarios puedan abrir sesiones de caja y registrar movimientos de efectivo.",
                parameters: [],
                requestBody: {
                    type: "CrearCajaRegistradoraRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre de la caja" },
                        almacenId: { type: "integer (int64)", required: true, description: "ID del almacén al que pertenece" }
                    }
                },
                responses: {
                    "200": { description: "OK", schema: "ApiResponseCajaRegistradoraResponse" }
                }
            },
            {
                method: "PUT",
                path: "/api/v1/configuracion/cajas-registradoras/{id}",
                summary: "Actualizar caja registradora",
                description: "Modifica el nombre o la asignación de almacén de una caja registradora previamente registrada. Los cambios aplicados no afectan las sesiones de caja ya cerradas ni su historial de movimientos.",
                parameters: [
                    { name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la caja registradora" }
                ],
                requestBody: {
                    type: "CrearCajaRegistradoraRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre de la caja" },
                        almacenId: { type: "integer (int64)", required: true, description: "ID del almacén al que pertenece" }
                    }
                },
                responses: {
                    "200": { description: "OK", schema: "ApiResponseCajaRegistradoraResponse" }
                }
            },
            {
                method: "PATCH",
                path: "/api/v1/configuracion/cajas-registradoras/{id}/estado",
                summary: "Activar/desactivar caja registradora",
                description: "Alterna el estado de una caja registradora entre activa e inactiva. Una caja desactivada no permite abrir nuevas sesiones de caja, pero su historial de sesiones y movimientos permanece disponible para consulta y auditoría.",
                parameters: [
                    { name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la caja registradora" }
                ],
                requestBody: null,
                responses: {
                    "200": { description: "OK", schema: "ApiResponseCajaRegistradoraResponse" }
                }
            }
        ]
    },
    categorias: {
        name: "Categorías",
        description: "Administración del catálogo de categorías de productos. Las categorías permiten clasificar los productos del negocio (ej: Camisas, Pantalones, Zapatos) y son utilizadas como filtro en búsquedas, reportes y la tienda online.",
        endpoints: [
            {
                method: "GET",
                path: "/api/v1/configuracion/categorias",
                summary: "Listar registros activos",
                description: "Recupera todas las categorías que se encuentran en estado activo dentro del tenant. Las categorías eliminadas (soft delete) no aparecen en este listado. Se utiliza frecuentemente para poblar selectores en formularios de creación y edición de productos.",
                parameters: [],
                requestBody: null,
                responses: {
                    "200": { description: "OK", schema: "ApiResponseListCatalogResponse" }
                }
            },
            {
                method: "POST",
                path: "/api/v1/configuracion/categorias",
                summary: "Crear registro",
                description: "Registra una nueva categoría en el catálogo del tenant. El nombre debe ser único dentro del tenant. La categoría queda inmediatamente disponible para asocarse a productos nuevos o existentes.",
                parameters: [],
                requestBody: {
                    type: "CatalogRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre de la categoría" },
                        descripcion: { type: "string", required: false, description: "Descripción de la categoría" }
                    }
                },
                responses: {
                    "200": { description: "OK", schema: "ApiResponseCatalogResponse" }
                }
            },
            {
                method: "PUT",
                path: "/api/v1/configuracion/categorias/{id}",
                summary: "Actualizar registro",
                description: "Modifica el nombre o la descripción de una categoría existente. Los productos que ya tienen esta categoría asignada reflejarán automáticamente el cambio de nombre en todo el sistema.",
                parameters: [
                    { name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la categoría" }
                ],
                requestBody: {
                    type: "CatalogRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre de la categoría" },
                        descripcion: { type: "string", required: false, description: "Descripción de la categoría" }
                    }
                },
                responses: {
                    "200": { description: "OK", schema: "ApiResponseCatalogResponse" }
                }
            },
            {
                method: "DELETE",
                path: "/api/v1/configuracion/categorias/{id}",
                summary: "Eliminar registro (soft delete)",
                description: "Realiza una eliminación lógica de la categoría. El registro no se borra físicamente de la base de datos, sino que se marca como inactivo y deja de aparecer en los listados activos. Los productos asociados a esta categoría conservan la referencia para fines históricos.",
                parameters: [
                    { name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la categoría" }
                ],
                requestBody: null,
                responses: {
                    "200": { description: "OK", schema: "ApiResponseVoid" }
                }
            }
        ]
    },
    colores: {
        name: "Colores",
        description: "Catálogo de colores disponibles para la clasificación de productos. Los colores se asignan a cada producto y permiten filtrar el inventario y el catálogo de la tienda online por tonalidad.",
        endpoints: [
            {
                method: "GET",
                path: "/api/v1/configuracion/colores",
                summary: "Listar registros activos",
                description: "Recupera todos los colores activos del catálogo del tenant. Los colores eliminados lógicamente no se incluyen en la respuesta. Se utiliza para poblar selectores de color en formularios de productos.",
                parameters: [],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseListCatalogResponse" } }
            },
            {
                method: "POST",
                path: "/api/v1/configuracion/colores",
                summary: "Crear registro",
                description: "Agrega un nuevo color al catálogo del tenant. Una vez creado, estará disponible para ser asignado a productos nuevos o existentes.",
                parameters: [],
                requestBody: {
                    type: "CatalogRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre del color" },
                        descripcion: { type: "string", required: false, description: "Descripción" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } }
            },
            {
                method: "PUT",
                path: "/api/v1/configuracion/colores/{id}",
                summary: "Actualizar registro",
                description: "Modifica el nombre o descripción de un color existente. El cambio se refleja automáticamente en todos los productos que tengan este color asignado.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del color" }],
                requestBody: {
                    type: "CatalogRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre del color" },
                        descripcion: { type: "string", required: false, description: "Descripción" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } }
            },
            {
                method: "DELETE",
                path: "/api/v1/configuracion/colores/{id}",
                summary: "Eliminar registro (soft delete)",
                description: "Elimina lógicamente un color del catálogo. El color deja de aparecer en listados activos pero se conserva en la base de datos para mantener la integridad de los productos que lo tenían asignado.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del color" }],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseVoid" } }
            }
        ]
    },
    compras: {
        name: "Compras",
        description: "Gestión integral del ciclo de órdenes de compra. Permite crear, actualizar, confirmar, cancelar y dar seguimiento a las compras realizadas a proveedores, incluyendo el workflow de estados, descarga de documentos en PDF y consulta de estadísticas.",
        endpoints: [
            {
                method: "GET",
                path: "/api/v1/compras/ordenes",
                summary: "Listar órdenes de compra con filtros",
                description: "Recupera el listado de órdenes de compra del tenant con filtros opcionales por estado (PENDIENTE, ENVIADA, CONFIRMADA, etc.) y por proveedor. Soporta paginación para manejar grandes volúmenes de datos. Cada orden incluye su número, proveedor, almacén destino, estado actual y monto total.",
                parameters: [
                    { name: "estado", in: "query", type: "string", required: false, description: "Filtrar por estado" },
                    { name: "proveedorId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por proveedor" },
                    { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página (default: 0)" },
                    { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página (default: 20)" }
                ],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseListOrdenCompraResponse" } }
            },
            {
                method: "POST",
                path: "/api/v1/compras/ordenes",
                summary: "Crear orden de compra",
                description: "Genera una nueva orden de compra dirigida a un proveedor específico. Se debe indicar el almacén de destino donde se recibirá la mercancía y el detalle de productos con cantidades y precios unitarios. La orden se crea en estado PENDIENTE y puede ser modificada antes de ser enviada al proveedor.",
                parameters: [],
                requestBody: {
                    type: "CrearOrdenCompraRequest",
                    properties: {
                        proveedorId: { type: "integer (int64)", required: true, description: "ID del proveedor" },
                        almacenDestinoId: { type: "integer (int64)", required: true, description: "ID del almacén destino" },
                        observaciones: { type: "string", required: false, description: "Observaciones" },
                        productos: { type: "array", required: true, description: "Lista de productos con cantidades y precios" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseOrdenCompraResponse" } }
            },
            {
                method: "GET",
                path: "/api/v1/compras/ordenes/{id}",
                summary: "Detalle de orden de compra con productos",
                description: "Consulta la información completa de una orden de compra específica, incluyendo los datos del proveedor, almacén destino, el detalle de cada producto solicitado (cantidad, precio unitario, subtotal), observaciones y el estado actual de la orden dentro del workflow.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la orden de compra" }],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseOrdenCompraResponse" } }
            },
            {
                method: "PUT",
                path: "/api/v1/compras/ordenes/{id}",
                summary: "Actualizar orden de compra pendiente",
                description: "Permite modificar una orden de compra que aún se encuentre en estado PENDIENTE. Es posible cambiar el proveedor, almacén destino, observaciones y la lista de productos. Una vez que la orden avanza a otro estado del workflow, ya no puede ser editada.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la orden de compra" }],
                requestBody: {
                    type: "CrearOrdenCompraRequest",
                    properties: {
                        proveedorId: { type: "integer (int64)", required: true, description: "ID del proveedor" },
                        almacenDestinoId: { type: "integer (int64)", required: true, description: "ID del almacén destino" },
                        observaciones: { type: "string", required: false, description: "Observaciones" },
                        productos: { type: "array", required: true, description: "Lista de productos" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseOrdenCompraResponse" } }
            },
            {
                method: "DELETE",
                path: "/api/v1/compras/ordenes/{id}",
                summary: "Cancelar orden de compra",
                description: "Cancela una orden de compra que aún no haya sido completada. La cancelación es una acción definitiva que marca la orden como CANCELADA. No es posible cancelar órdenes que ya tengan recepciones confirmadas.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la orden de compra" }],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseVoid" } }
            },
            {
                method: "PATCH",
                path: "/api/v1/compras/ordenes/{id}/estado",
                summary: "Cambiar estado de OC",
                description: "Avanza o cambia el estado de una orden de compra siguiendo el workflow establecido: PENDIENTE → ENVIADA → CONFIRMADA → EN_RECEPCION → PARCIAL → COMPLETADA. Cada transición de estado es validada por el sistema para garantizar la integridad del flujo de compras.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la orden de compra" }],
                requestBody: {
                    type: "CambiarEstadoOCRequest",
                    properties: {
                        estado: { type: "string", required: true, description: "Nuevo estado de la OC" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseOrdenCompraResponse" } }
            },
            {
                method: "GET",
                path: "/api/v1/compras/ordenes/{id}/pdf",
                summary: "Descargar OC como PDF/HTML",
                description: "Genera y descarga la orden de compra en formato PDF o HTML listo para imprimir. El documento incluye los datos del proveedor, el detalle de productos solicitados, cantidades, precios y el total de la orden. Es útil para enviar al proveedor o archivar como respaldo físico.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la orden de compra" }],
                requestBody: null,
                responses: { "200": { description: "OK - Archivo byte[]" } }
            },
            {
                method: "GET",
                path: "/api/v1/compras/estadisticas",
                summary: "Estadísticas de compras",
                description: "Obtiene un resumen estadístico de las compras del tenant: totales por estado (pendientes, enviadas, completadas), montos acumulados y tendencias. Proporciona una visión general del volumen de compras para la toma de decisiones.",
                parameters: [],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseComprasEstadisticasResponse" } }
            }
        ]
    },
    configuracionGeneral: {
        name: "Configuración General",
        description: "Configuración central del tenant que incluye datos de la empresa, configuración fiscal para SUNAT, series de comprobantes (boletas, facturas), métodos de pago aceptados y política de devoluciones. Estos ajustes afectan el comportamiento global del sistema.",
        endpoints: [
            {
                method: "GET",
                path: "/api/v1/configuracion/empresa",
                summary: "Obtener datos de la empresa del tenant",
                description: "Recupera la configuración completa de la empresa del tenant, incluyendo razón social, RUC, dirección fiscal, datos de contacto y configuración de facturación electrónica con SUNAT. Estos datos se utilizan en comprobantes de venta, reportes y documentos generados por el sistema.",
                parameters: [],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseConfiguracionEmpresaResponse" } }
            },
            {
                method: "PUT",
                path: "/api/v1/configuracion/empresa",
                summary: "Actualizar datos empresa + config fiscal + SUNAT",
                description: "Modifica los datos de la empresa del tenant, incluyendo razón social, RUC, dirección fiscal, teléfono y email de contacto. Estos datos se reflejan en todos los comprobantes de venta, órdenes de compra y documentos fiscales generados por el sistema.",
                parameters: [],
                requestBody: {
                    type: "ConfiguracionEmpresaRequest",
                    properties: {
                        razonSocial: { type: "string", required: true, description: "Razón social de la empresa" },
                        ruc: { type: "string", required: true, description: "RUC de la empresa" },
                        direccion: { type: "string", required: false, description: "Dirección fiscal" },
                        telefono: { type: "string", required: false, description: "Teléfono de contacto" },
                        email: { type: "string", required: false, description: "Email de contacto" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseConfiguracionEmpresaResponse" } }
            },
            {
                method: "GET",
                path: "/api/v1/configuracion/series-comprobantes",
                summary: "Listar series de comprobantes",
                description: "Lista las series de comprobantes electrónicos configuradas para el tenant, con filtro opcional por tipo de comprobante (BOLETA, FACTURA, etc.). Cada serie tiene un código de 4 caracteres según normativa SUNAT y un correlativo automático.",
                parameters: [
                    { name: "tipoComprobante", in: "query", type: "string", required: false, description: "Filtrar por tipo (ej: BOLETA, FACTURA)" }
                ],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseListSerieComprobanteResponse" } }
            },
            {
                method: "POST",
                path: "/api/v1/configuracion/series-comprobantes",
                summary: "Crear serie (formato SUNAT: 4 chars)",
                description: "Registra una nueva serie de comprobante siguiendo el formato SUNAT de 4 caracteres alfanuméricos (ej: B001 para boletas, F001 para facturas). La serie inicia con correlativo en 1 y se incrementa automáticamente con cada comprobante emitido.",
                parameters: [],
                requestBody: {
                    type: "CrearSerieComprobanteRequest",
                    properties: {
                        serie: { type: "string", required: true, description: "Código de serie (4 caracteres)" },
                        tipoComprobante: { type: "string", required: true, description: "Tipo de comprobante" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseSerieComprobanteResponse" } }
            },
            {
                method: "PUT",
                path: "/api/v1/configuracion/series-comprobantes/{id}",
                summary: "Actualizar serie",
                description: "Modifica el código o tipo de comprobante de una serie existente. Solo se permite la actualización si la serie aún no ha sido utilizada para emitir comprobantes.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la serie" }],
                requestBody: {
                    type: "CrearSerieComprobanteRequest",
                    properties: {
                        serie: { type: "string", required: true, description: "Código de serie" },
                        tipoComprobante: { type: "string", required: true, description: "Tipo de comprobante" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseSerieComprobanteResponse" } }
            },
            {
                method: "PATCH",
                path: "/api/v1/configuracion/series-comprobantes/{id}/estado",
                summary: "Activar/desactivar serie",
                description: "Alterna el estado de una serie de comprobante entre activa e inactiva. Una serie desactivada deja de estar disponible para emitir nuevos comprobantes, pero los comprobantes ya emitidos con esa serie permanecen intactos.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la serie" }],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseSerieComprobanteResponse" } }
            },
            {
                method: "GET",
                path: "/api/v1/configuracion/politica-devoluciones",
                summary: "Ver política de devoluciones actual",
                description: "Consulta la política de devoluciones vigente del tenant, incluyendo el plazo máximo en días para aceptar devoluciones, si se requiere comprobante de compra y el texto completo de la política. Esta información también se muestra públicamente en la tienda online.",
                parameters: [],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponsePoliticaDevolucionesResponse" } }
            },
            {
                method: "PUT",
                path: "/api/v1/configuracion/politica-devoluciones",
                summary: "Actualizar política de devoluciones",
                description: "Modifica las reglas de la política de devoluciones del tenant: días máximos para devolución, requisito de comprobante y el texto descriptivo. Los cambios aplican a futuras devoluciones; las notas de crédito ya emitidas no se ven afectadas.",
                parameters: [],
                requestBody: {
                    type: "PoliticaDevolucionesRequest",
                    properties: {
                        diasMaxDevolucion: { type: "integer", required: true, description: "Días máximos para devolución" },
                        requiereComprobante: { type: "boolean", required: false, description: "Si requiere comprobante para devolver" },
                        politica: { type: "string", required: false, description: "Texto de la política" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponsePoliticaDevolucionesResponse" } }
            },
            {
                method: "GET",
                path: "/api/v1/configuracion/metodos-pago",
                summary: "Listar métodos de pago activos",
                description: "Recupera los métodos de pago habilitados en el tenant (ej: Efectivo, Tarjeta de crédito, Transferencia bancaria, Yape, Plin). Solo se muestran los métodos activos, que son los disponibles al momento de confirmar ventas y pagos.",
                parameters: [],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseListMetodoPagoResponse" } }
            },
            {
                method: "POST",
                path: "/api/v1/configuracion/metodos-pago",
                summary: "Crear método de pago",
                description: "Registra un nuevo método de pago en el tenant. Una vez creado, estará disponible como opción al confirmar ventas en el POS y al registrar pagos manuales en la plataforma.",
                parameters: [],
                requestBody: {
                    type: "CrearMetodoPagoRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre del método de pago" },
                        descripcion: { type: "string", required: false, description: "Descripción" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseMetodoPagoResponse" } }
            },
            {
                method: "PUT",
                path: "/api/v1/configuracion/metodos-pago/{id}",
                summary: "Actualizar método de pago",
                description: "Modifica el nombre o la descripción de un método de pago previamente registrado. Los cambios se reflejan en toda la interfaz del sistema donde se muestra este método de pago.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del método de pago" }],
                requestBody: {
                    type: "CrearMetodoPagoRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre del método de pago" },
                        descripcion: { type: "string", required: false, description: "Descripción" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseMetodoPagoResponse" } }
            },
            {
                method: "PATCH",
                path: "/api/v1/configuracion/metodos-pago/{id}/estado",
                summary: "Activar/desactivar método de pago",
                description: "Cambia el estado de un método de pago entre activo e inactivo. Un método desactivado deja de aparecer como opción al registrar ventas y pagos, pero las transacciones históricas que lo utilizaron conservan la referencia.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del método de pago" }],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseMetodoPagoResponse" } }
            }
        ]
    },
    cotizaciones: {
        name: "Cotizaciones",
        description: "Gestión del ciclo completo de cotizaciones comerciales. Permite crear, editar, aprobar/rechazar cotizaciones y convertirlas directamente en ventas cuando el cliente acepta la propuesta, evitando la re-captura de datos.",
        endpoints: [
            {
                method: "GET",
                path: "/api/v1/cotizaciones",
                summary: "Listar cotizaciones con filtros",
                description: "Recupera el listado de cotizaciones del tenant con filtros opcionales por estado (BORRADOR, ENVIADA, APROBADA, RECHAZADA, EXPIRADA), rango de fechas y cliente. Soporta paginación para facilitar la navegación entre grandes volúmenes de cotizaciones.",
                parameters: [
                    { name: "estado", in: "query", type: "string", required: false, description: "Filtrar por estado" },
                    { name: "fechaDesde", in: "query", type: "string", required: false, description: "Fecha desde (YYYY-MM-DD)" },
                    { name: "clienteId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por cliente" },
                    { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página (default: 0)" },
                    { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página (default: 10)" }
                ],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseListCotizacionResponse" } }
            },
            {
                method: "POST",
                path: "/api/v1/cotizaciones",
                summary: "Crear cotización",
                description: "Genera una nueva cotización para un cliente específico con el detalle de productos, cantidades y precios propuestos. La cotización se crea como borrador y puede ser editada antes de enviarla al cliente. Incluye cálculo automático de subtotales y total.",
                parameters: [],
                requestBody: {
                    type: "CrearCotizacionRequest",
                    properties: {
                        clienteId: { type: "integer (int64)", required: true, description: "ID del cliente" },
                        observaciones: { type: "string", required: false, description: "Observaciones" },
                        productos: { type: "array", required: true, description: "Lista de productos con cantidades y precios" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseCotizacionResponse" } }
            },
            {
                method: "GET",
                path: "/api/v1/cotizaciones/{id}",
                summary: "Obtener cotización por ID con detalles",
                description: "Consulta la información completa de una cotización incluyendo: datos del cliente, lista detallada de productos cotizados con cantidades y precios, observaciones, estado actual y las fechas de creación y última modificación.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la cotización" }],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseCotizacionResponse" } }
            },
            {
                method: "PUT",
                path: "/api/v1/cotizaciones/{id}",
                summary: "Actualizar cotización",
                description: "Modifica los datos de una cotización existente: cliente, productos, cantidades, precios y observaciones. Solo es posible editar cotizaciones que se encuentren en estado BORRADOR o ENVIADA; una vez aprobada o rechazada, la cotización queda bloqueada.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la cotización" }],
                requestBody: {
                    type: "CrearCotizacionRequest",
                    properties: {
                        clienteId: { type: "integer (int64)", required: true, description: "ID del cliente" },
                        observaciones: { type: "string", required: false, description: "Observaciones" },
                        productos: { type: "array", required: true, description: "Lista de productos" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseCotizacionResponse" } }
            },
            {
                method: "DELETE",
                path: "/api/v1/cotizaciones/{id}",
                summary: "Eliminar cotización",
                description: "Elimina una cotización del sistema. Esta acción es permanente y solo puede realizarse sobre cotizaciones en estado BORRADOR. Las cotizaciones en otros estados deben ser rechazadas o expiradas.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la cotización" }],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseVoid" } }
            },
            {
                method: "PATCH",
                path: "/api/v1/cotizaciones/{id}/status",
                summary: "Cambiar estado de cotización",
                description: "Avanza el estado de una cotización dentro del flujo comercial: BORRADOR → ENVIADA → APROBADA o RECHAZADA. El cambio de estado se registra con fecha y hora para mantener trazabilidad del proceso comercial.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la cotización" }],
                requestBody: {
                    type: "object",
                    properties: {
                        estado: { type: "string", required: true, description: "Nuevo estado" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseCotizacionResponse" } }
            },
            {
                method: "POST",
                path: "/api/v1/cotizaciones/{id}/convert",
                summary: "Convertir cotización a venta",
                description: "Transforma una cotización aprobada directamente en una venta, reutilizando toda la información del cliente y productos cotizados. Se debe indicar el almacén de donde se descontará el stock y opcionalmente el método de pago. Esto elimina la necesidad de recapturar datos y agiliza el proceso de venta.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la cotización" }],
                requestBody: {
                    type: "ConvertirCotizacionRequest",
                    properties: {
                        almacenId: { type: "integer (int64)", required: true, description: "ID del almacén" },
                        metodoPagoId: { type: "integer (int64)", required: false, description: "ID del método de pago" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseVentaResponse" } }
            }
        ]
    },
    entidadesComerciales: {
        name: "Entidades Comerciales",
        description: "Gestión unificada de clientes y proveedores del negocio. Las entidades comerciales se utilizan en ventas, compras, cotizaciones y reportes, y pueden buscarse por documento, email o texto libre.",
        endpoints: [
            {
                method: "GET",
                path: "/api/v1/entidades",
                summary: "Listar entidades con filtros",
                description: "Recupera el listado de entidades comerciales del tenant con filtros por tipo (CLIENTE, PROVEEDOR), búsqueda por texto libre en nombre o documento, y paginación. Cada entidad muestra su tipo, documento, nombre, datos de contacto y estado.",
                parameters: [
                    { name: "tipoEntidad", in: "query", type: "string", required: false, description: "Filtrar por tipo (CLIENTE, PROVEEDOR)" },
                    { name: "q", in: "query", type: "string", required: false, description: "Búsqueda por texto" },
                    { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página (default: 0)" },
                    { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página (default: 20)" }
                ],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseListEntidadResponse" } }
            },
            {
                method: "POST",
                path: "/api/v1/entidades",
                summary: "Crear cliente o proveedor",
                description: "Registra una nueva entidad comercial que puede ser de tipo CLIENTE o PROVEEDOR. Se valida la unicidad del número de documento dentro del tenant. La entidad queda disponible para asociarse a ventas, compras, cotizaciones y otros procesos del negocio.",
                parameters: [],
                requestBody: {
                    type: "EntidadRequest",
                    properties: {
                        tipoEntidad: { type: "string", required: true, description: "CLIENTE o PROVEEDOR" },
                        tipoDocumento: { type: "string", required: true, description: "Tipo de documento (DNI, RUC, etc.)" },
                        numeroDocumento: { type: "string", required: true, description: "Número de documento" },
                        nombre: { type: "string", required: true, description: "Nombre o razón social" },
                        email: { type: "string", required: false, description: "Email de contacto" },
                        telefono: { type: "string", required: false, description: "Teléfono" },
                        direccion: { type: "string", required: false, description: "Dirección" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseEntidadResponse" } }
            },
            {
                method: "GET",
                path: "/api/v1/entidades/{id}",
                summary: "Obtener entidad por ID",
                description: "Consulta el detalle completo de una entidad comercial incluyendo su tipo (CLIENTE/PROVEEDOR), documento de identidad, datos de contacto (email, teléfono, dirección) y su historial de transacciones asociadas.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la entidad" }],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseEntidadResponse" } }
            },
            {
                method: "PUT",
                path: "/api/v1/entidades/{id}",
                summary: "Actualizar entidad (no cambia documento)",
                description: "Modifica los datos de una entidad comercial existente como nombre, email, teléfono y dirección. Por seguridad, el tipo y número de documento no pueden ser modificados una vez registrados, ya que son campos de identidad única.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la entidad" }],
                requestBody: {
                    type: "EntidadRequest",
                    properties: {
                        nombre: { type: "string", required: true, description: "Nombre o razón social" },
                        email: { type: "string", required: false, description: "Email de contacto" },
                        telefono: { type: "string", required: false, description: "Teléfono" },
                        direccion: { type: "string", required: false, description: "Dirección" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseEntidadResponse" } }
            },
            {
                method: "GET",
                path: "/api/v1/entidades/estadisticas",
                summary: "Estadísticas de entidades comerciales",
                description: "Proporciona un resumen estadístico de las entidades comerciales del tenant: cantidad total de clientes y proveedores, nuevos registros por período y distribución por tipo. Útil para medir el crecimiento de la cartera comercial.",
                parameters: [],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseEntidadEstadisticasResponse" } }
            },
            {
                method: "GET",
                path: "/api/v1/entidades/buscar-email",
                summary: "Buscar por email",
                description: "Localiza una entidad comercial específica a través de su dirección de correo electrónico. Devuelve los datos completos de la entidad si existe una coincidencia exacta. Útil para validar si un cliente o proveedor ya está registrado en el sistema.",
                parameters: [{ name: "email", in: "query", type: "string", required: true, description: "Email a buscar" }],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseEntidadResponse" } }
            },
            {
                method: "GET",
                path: "/api/v1/entidades/buscar-documento",
                summary: "Buscar por tipo y número de documento",
                description: "Localiza una entidad comercial mediante la combinación de tipo de documento (DNI, RUC, CE, etc.) y número de documento. Es la forma más precisa de buscar ya que estos campos son únicos dentro del tenant. Útil para verificar duplicados antes de crear una nueva entidad.",
                parameters: [
                    { name: "tipo", in: "query", type: "string", required: true, description: "Tipo de documento" },
                    { name: "numero", in: "query", type: "string", required: true, description: "Número de documento" }
                ],
                requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseEntidadResponse" } }
            }
        ]
    },
    generos: {
        name: "Géneros",
        description: "Catálogo de géneros para la clasificación de productos (ej: Masculino, Femenino, Unisex, Niños). Se asignan a cada producto y permiten filtrar el catálogo tanto en el backoffice como en la tienda online.",
        endpoints: [
            {
                method: "GET", path: "/api/v1/configuracion/generos", summary: "Listar registros activos",
                description: "Recupera todos los géneros activos del catálogo del tenant. Los géneros eliminados lógicamente no se incluyen. Se utiliza para poblar selectores de género en formularios de productos y como filtro en búsquedas.", parameters: [], requestBody: null,
                responses: { "200": { description: "OK", schema: "ApiResponseListCatalogResponse" } }
            },
            {
                method: "POST", path: "/api/v1/configuracion/generos", summary: "Crear registro",
                description: "Agrega un nuevo género al catálogo del tenant. Una vez creado, estará disponible como opción al registrar o editar productos.", parameters: [],
                requestBody: { type: "CatalogRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del género" }, descripcion: { type: "string", required: false, description: "Descripción" } } },
                responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } }
            },
            {
                method: "PUT", path: "/api/v1/configuracion/generos/{id}", summary: "Actualizar registro",
                description: "Modifica el nombre o descripción de un género existente. El cambio se refleja automáticamente en todos los productos que tengan este género asignado.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del género" }],
                requestBody: { type: "CatalogRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del género" }, descripcion: { type: "string", required: false, description: "Descripción" } } },
                responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } }
            },
            {
                method: "DELETE", path: "/api/v1/configuracion/generos/{id}", summary: "Eliminar registro (soft delete)",
                description: "Elimina lógicamente un género del catálogo. El registro permanece en la base de datos para mantener la integridad referencial con los productos que lo tenían asignado, pero deja de aparecer en listados activos.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del género" }],
                requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } }
            }
        ]
    },
    inventario: {
        name: "Inventario",
        description: "Módulo central de control de inventario. Permite consultar el stock actual por almacén, visualizar el kardex (historial de movimientos) de cada producto, detectar alertas de stock bajo mínimo, realizar ajustes manuales con motivo y exportar el inventario completo a CSV.",
        endpoints: [
            {
                method: "GET", path: "/api/v1/inventario/stock", summary: "Consultar stock por almacén",
                description: "Consulta las existencias actuales de todos los productos, opcionalmente filtradas por almacén. Cada registro muestra el producto, almacén, cantidad disponible, stock mínimo configurado y si el producto se encuentra en alerta por stock bajo. Es la fuente principal de información para el control de inventario.",
                parameters: [{ name: "almacenId", in: "query", type: "integer (int64)", required: false, description: "ID del almacén" }],
                requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListStockResponse" } }
            },
            {
                method: "GET", path: "/api/v1/inventario/stock/exportar", summary: "Exportar stock a CSV",
                description: "Genera y descarga un archivo CSV con el inventario completo del tenant, opcionalmente filtrado por almacén. El archivo incluye producto, SKU, almacén, cantidad disponible, precio de costo y precio de venta. Ideal para respaldo, análisis externo o auditorías de inventario.",
                parameters: [{ name: "almacenId", in: "query", type: "integer (int64)", required: false, description: "ID del almacén" }],
                requestBody: null, responses: { "200": { description: "OK - Archivo CSV (byte[])" } }
            },
            {
                method: "GET", path: "/api/v1/inventario/kardex", summary: "Consultar kardex de un producto",
                description: "Recupera el historial de movimientos (kardex) de un producto específico, mostrando cada entrada y salida de inventario con su tipo (venta, compra, ajuste, transferencia), cantidad, saldo resultante y fecha. Es fundamental para la trazabilidad y auditoría de inventario. Soporta paginación.",
                parameters: [
                    { name: "productoId", in: "query", type: "integer (int64)", required: true, description: "ID del producto" },
                    { name: "almacenId", in: "query", type: "integer (int64)", required: false, description: "ID del almacén" },
                    { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página (default: 0)" },
                    { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página (default: 20)" }
                ],
                requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseMapStringObject" } }
            },
            {
                method: "GET", path: "/api/v1/inventario/alertas", summary: "Listar productos con stock bajo mínimo",
                description: "Identifica y lista todos los productos cuyo stock actual se encuentra por debajo del mínimo configurado. Permite al administrador tomar acciones preventivas como generar órdenes de compra o transferencias entre almacenes para reabastecer. Fundamental para evitar quiebres de stock.",
                parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListStockResponse" } }
            },
            {
                method: "POST", path: "/api/v1/inventario/ajustes", summary: "Ajuste manual de inventario (ingreso/egreso + motivo)",
                description: "Realiza un ajuste manual del stock de un producto en un almacén específico. Se debe indicar el tipo de movimiento (ENTRADA o SALIDA), la cantidad, un motivo de movimiento registrado previamente y observaciones opcionales. El ajuste registra automáticamente una entrada en el kardex del producto para mantener la trazabilidad completa.",
                parameters: [],
                requestBody: {
                    type: "AjusteInventarioRequest",
                    properties: {
                        productoId: { type: "integer (int64)", required: true, description: "ID del producto" },
                        almacenId: { type: "integer (int64)", required: true, description: "ID del almacén" },
                        cantidad: { type: "integer", required: true, description: "Cantidad a ajustar" },
                        tipoMovimiento: { type: "string", required: true, description: "ENTRADA o SALIDA" },
                        motivoMovimientoId: { type: "integer (int64)", required: true, description: "ID del motivo de movimiento" },
                        observaciones: { type: "string", required: false, description: "Observaciones del ajuste" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseKardexResponse" } }
            }
        ]
    },
    marcas: {
        name: "Marcas",
        description: "Catálogo de marcas comerciales de los productos del negocio (ej: Nike, Adidas, Levi's). Las marcas se asignan a cada producto y sirven como filtro en búsquedas, reportes y la tienda online.",
        endpoints: [
            { method: "GET", path: "/api/v1/configuracion/marcas", summary: "Listar registros activos", description: "Recupera todas las marcas activas del catálogo del tenant. Las marcas eliminadas lógicamente quedan excluidas del listado. Se usa para poblar selectores en formularios de productos.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListCatalogResponse" } } },
            { method: "POST", path: "/api/v1/configuracion/marcas", summary: "Crear registro", description: "Agrega una nueva marca al catálogo del tenant. Una vez creada, queda disponible para ser asignada a productos nuevos o existentes.", parameters: [], requestBody: { type: "CatalogRequest", properties: { nombre: { type: "string", required: true, description: "Nombre de la marca" }, descripcion: { type: "string", required: false, description: "Descripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } } },
            { method: "PUT", path: "/api/v1/configuracion/marcas/{id}", summary: "Actualizar registro", description: "Modifica el nombre o descripción de una marca existente. El cambio se refleja automáticamente en todos los productos que tienen esta marca asignada.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la marca" }], requestBody: { type: "CatalogRequest", properties: { nombre: { type: "string", required: true, description: "Nombre de la marca" }, descripcion: { type: "string", required: false, description: "Descripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } } },
            { method: "DELETE", path: "/api/v1/configuracion/marcas/{id}", summary: "Eliminar registro (soft delete)", description: "Elimina lógicamente una marca. El registro permanece en la base de datos para integridad referencial, pero deja de aparecer en listados activos.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la marca" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } }
        ]
    },
    materiales: {
        name: "Materiales",
        description: "Catálogo de materiales o tejidos de los productos (ej: Algodón, Poliéster, Cuero, Denim). Se asignan a cada producto para describir su composición y facilitar la búsqueda por tipo de material.",
        endpoints: [
            { method: "GET", path: "/api/v1/configuracion/materiales", summary: "Listar registros activos", description: "Recupera todos los materiales activos registrados en el tenant. Los materiales eliminados lógicamente quedan excluidos. Se utiliza para poblar selectores en formularios de productos.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListCatalogResponse" } } },
            { method: "POST", path: "/api/v1/configuracion/materiales", summary: "Crear registro", description: "Agrega un nuevo material al catálogo del tenant. Una vez creado, estará disponible para ser asignado a productos.", parameters: [], requestBody: { type: "CatalogRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del material" }, descripcion: { type: "string", required: false, description: "Descripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } } },
            { method: "PUT", path: "/api/v1/configuracion/materiales/{id}", summary: "Actualizar registro", description: "Modifica el nombre o descripción de un material existente. Los productos asociados reflejarán el cambio automáticamente.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del material" }], requestBody: { type: "CatalogRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del material" }, descripcion: { type: "string", required: false, description: "Descripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } } },
            { method: "DELETE", path: "/api/v1/configuracion/materiales/{id}", summary: "Eliminar registro (soft delete)", description: "Elimina lógicamente un material del catálogo. Se conserva en la base de datos para mantener la integridad de los productos asociados.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del material" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } }
        ]
    },
    motivosMovimiento: {
        name: "Motivos Movimiento",
        description: "Catálogo de motivos para justificar los movimientos de inventario (ej: Merma, Robo, Corrección de conteo, Donación). Se clasifican por tipo ENTRADA o SALIDA y son obligatorios al realizar ajustes manuales de inventario.",
        endpoints: [
            { method: "GET", path: "/api/v1/configuracion/motivos-movimiento", summary: "Listar motivos de movimiento", description: "Lista los motivos de movimiento registrados en el tenant con filtro opcional por tipo (ENTRADA o SALIDA). Cada motivo incluye su nombre, tipo y descripción. Se utiliza para poblar selectores al realizar ajustes manuales de inventario.", parameters: [{ name: "tipo", in: "query", type: "string", required: false, description: "Filtrar por tipo (ENTRADA, SALIDA)" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListMotivoMovimientoResponse" } } },
            { method: "POST", path: "/api/v1/configuracion/motivos-movimiento", summary: "Crear motivo de movimiento", description: "Registra un nuevo motivo de movimiento de inventario especificando si aplica para entradas o salidas de stock. Una vez creado, estará disponible como justificación obligatoria en los ajustes manuales de inventario.", parameters: [], requestBody: { type: "CrearMotivoMovimientoRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del motivo" }, tipo: { type: "string", required: true, description: "ENTRADA o SALIDA" }, descripcion: { type: "string", required: false, description: "Descripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseMotivoMovimientoResponse" } } },
            { method: "PUT", path: "/api/v1/configuracion/motivos-movimiento/{id}", summary: "Actualizar motivo de movimiento", description: "Modifica el nombre, tipo o descripción de un motivo de movimiento existente. Los movimientos de inventario ya registrados con este motivo conservan la referencia original.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del motivo" }], requestBody: { type: "CrearMotivoMovimientoRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del motivo" }, tipo: { type: "string", required: true, description: "ENTRADA o SALIDA" }, descripcion: { type: "string", required: false, description: "Descripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseMotivoMovimientoResponse" } } }
        ]
    },
    notasCredito: {
        name: "Notas de Crédito",
        description: "Gestión de notas de crédito y devoluciones de productos. Las notas de crédito se emiten asociadas a una venta original y permiten devolver stock al inventario automáticamente, registrando los movimientos correspondientes en el kardex.",
        endpoints: [
            { method: "GET", path: "/api/v1/notas-credito", summary: "Listar notas de crédito con filtros", description: "Recupera el listado de notas de crédito emitidas por el tenant con filtros opcionales por venta de origen, estado y paginación. Cada nota muestra la venta asociada, motivo de la devolución, productos devueltos y monto total acreditado.", parameters: [{ name: "ventaOrigenId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por venta origen" }, { name: "estado", in: "query", type: "string", required: false, description: "Filtrar por estado" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página (default: 0)" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página (default: 20)" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListNotaCreditoResponse" } } },
            { method: "POST", path: "/api/v1/notas-credito", summary: "Emitir nota de crédito (devuelve stock)", description: "Emite una nueva nota de crédito asociada a una venta existente. Al confirmar la emisión, el sistema devuelve automáticamente las cantidades especificadas al inventario del almacén correspondiente y registra los movimientos de entrada en el kardex de cada producto devuelto.", parameters: [], requestBody: { type: "CrearNotaCreditoRequest", properties: { ventaOrigenId: { type: "integer (int64)", required: true, description: "ID de la venta origen" }, motivo: { type: "string", required: true, description: "Motivo de la nota de crédito" }, productos: { type: "array", required: true, description: "Productos a devolver con cantidades" } } }, responses: { "200": { description: "OK", schema: "ApiResponseNotaCreditoResponse" } } },
            { method: "GET", path: "/api/v1/notas-credito/{id}", summary: "Detalle de nota de crédito con productos devueltos", description: "Consulta la información completa de una nota de crédito incluyendo la venta de origen, motivo de la devolución, el detalle de cada producto devuelto con cantidades y el monto total acreditado al cliente.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la nota de crédito" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseNotaCreditoResponse" } } }
        ]
    },
    productos: {
        name: "Productos",
        description: "Módulo central del catálogo de productos del tenant. Permite crear, editar y eliminar productos con atributos completos (categoría, marca, talla, color, material, género, unidad de medida), gestionar imágenes múltiples, aplicar liquidaciones masivas con descuento porcentual y realizar búsquedas rápidas por nombre o SKU.",
        endpoints: [
            {
                method: "GET", path: "/api/v1/productos", summary: "Listar productos con filtros y paginación",
                description: "Recupera el listado de productos del tenant con soporte de filtros y paginación. Se puede filtrar por nombre parcial y por categoría. Devuelve información resumida de cada producto incluyendo precios, estado, stock y sus atributos de clasificación. Esencial para la vista principal del catálogo en el backoffice.",
                parameters: [
                    { name: "nombre", in: "query", type: "string", required: false, description: "Filtrar por nombre" },
                    { name: "categoriaId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por categoría" },
                    { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página (default: 0)" },
                    { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página (default: 20)" }
                ],
                requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListProductoResponse" } }
            },
            {
                method: "POST", path: "/api/v1/productos", summary: "Crear producto",
                description: "Registra un nuevo producto en el catálogo del tenant. Requiere asignar obligatoriamente una categoría, talla, color, marca, material, género y unidad de medida de los catálogos previamente configurados. Se definen precios de costo y venta, opcionalmente un SKU, código de barras y stock mínimo para alertas. El campo controlaInventario determina si el producto participa en el control de existencias.",
                parameters: [],
                requestBody: {
                    type: "ProductoRequest",
                    properties: {
                        sku: { type: "string (max 50)", required: false, description: "Código SKU del producto" },
                        nombre: { type: "string (max 200)", required: true, description: "Nombre del producto" },
                        descripcion: { type: "string", required: false, description: "Descripción del producto" },
                        categoriaId: { type: "integer (int64)", required: true, description: "ID de la categoría" },
                        tallaId: { type: "integer (int64)", required: true, description: "ID de la talla" },
                        colorId: { type: "integer (int64)", required: true, description: "ID del color" },
                        marcaId: { type: "integer (int64)", required: true, description: "ID de la marca" },
                        materialId: { type: "integer (int64)", required: true, description: "ID del material" },
                        generoId: { type: "integer (int64)", required: true, description: "ID del género" },
                        unidadMedidaId: { type: "integer (int64)", required: true, description: "ID de la unidad de medida" },
                        codigoBarras: { type: "string (max 20)", required: false, description: "Código de barras" },
                        imagenUrl: { type: "string (max 500)", required: false, description: "URL de la imagen" },
                        precioCosto: { type: "number", required: true, description: "Precio de costo" },
                        precioVenta: { type: "number", required: true, description: "Precio de venta" },
                        stockMinimo: { type: "integer (int32)", required: false, description: "Stock mínimo para alertas" },
                        controlaInventario: { type: "boolean", required: false, description: "Si controla inventario" }
                    }
                },
                responses: { "200": { description: "OK", schema: "ApiResponseProductoResponse" } }
            },
            { method: "GET", path: "/api/v1/productos/{id}", summary: "Obtener producto por ID", description: "Consulta el detalle completo de un producto específico incluyendo todos sus atributos, precios, imágenes asociadas, estado de liquidación si aplica, y configuración de inventario. Se utiliza en la vista de detalle del producto y al editar sus datos.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del producto" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseProductoResponse" } } },
            {
                method: "PUT", path: "/api/v1/productos/{id}", summary: "Actualizar producto",
                description: "Modifica los datos de un producto existente. Se pueden actualizar nombre, precios, atributos de clasificación y configuración de inventario. Los cambios de precio se reflejan inmediatamente en futuras ventas y cotizaciones.",
                parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del producto" }],
                requestBody: { type: "ProductoRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del producto" }, precioCosto: { type: "number", required: true, description: "Precio de costo" }, precioVenta: { type: "number", required: true, description: "Precio de venta" } } },
                responses: { "200": { description: "OK", schema: "ApiResponseProductoResponse" } }
            },
            { method: "DELETE", path: "/api/v1/productos/{id}", summary: "Eliminar producto (soft delete)", description: "Elimina lógicamente un producto del catálogo. El producto deja de aparecer en listados y búsquedas activas, pero se conserva en la base de datos para mantener la integridad de ventas, cotizaciones y movimientos de inventario históricos.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del producto" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } },
            { method: "PATCH", path: "/api/v1/productos/{id}/estado", summary: "Cambiar estado de producto", description: "Activa o desactiva un producto sin eliminarlo. Un producto desactivado no aparece en la tienda online ni en el punto de venta, pero se mantiene visible en el backoffice para su reactivación posterior.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del producto" }], requestBody: { type: "EstadoRequest", properties: { estado: { type: "boolean", required: true, description: "Nuevo estado del producto" } } }, responses: { "200": { description: "OK", schema: "ApiResponseProductoResponse" } } },
            { method: "GET", path: "/api/v1/productos/{id}/imagenes", summary: "Listar imágenes de un producto", description: "Recupera todas las imágenes asociadas a un producto, ordenadas según su posición configurada. Las imágenes se muestran en la ficha del producto tanto en el backoffice como en la tienda online.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del producto" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListImagenResponse" } } },
            { method: "POST", path: "/api/v1/productos/{id}/imagenes", summary: "Agregar imagen a un producto", description: "Añade una nueva imagen al producto especificando su URL y opcionalmente un número de orden para controlar la posición en la galería. Un producto puede tener múltiples imágenes para mostrar diferentes ángulos o variantes.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del producto" }], requestBody: { type: "ImagenResponse", properties: { url: { type: "string", required: true, description: "URL de la imagen" }, orden: { type: "integer", required: false, description: "Orden de la imagen" } } }, responses: { "200": { description: "OK", schema: "ApiResponseImagenResponse" } } },
            { method: "DELETE", path: "/api/v1/productos/{productoId}/imagenes/{imagenId}", summary: "Eliminar imagen de un producto", description: "Elimina una imagen específica de la galería de un producto. La eliminación es permanente. Las imágenes restantes mantienen su orden relativo.", parameters: [{ name: "productoId", in: "path", type: "integer (int64)", required: true, description: "ID del producto" }, { name: "imagenId", in: "path", type: "integer (int64)", required: true, description: "ID de la imagen" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } },
            { method: "POST", path: "/api/v1/productos/liquidacion", summary: "Marcar productos en liquidación", description: "Aplica un descuento porcentual de liquidación a uno o varios productos simultáneamente. Los productos marcados muestran el precio original tachado junto al precio con descuento en la tienda online y el punto de venta. Retorna la cantidad de productos afectados.", parameters: [], requestBody: { type: "LiquidacionRequest", properties: { productoIds: { type: "array (int64)", required: true, description: "IDs de productos" }, porcentaje: { type: "number", required: true, description: "Porcentaje de liquidación" } } }, responses: { "200": { description: "OK", schema: "ApiResponseInteger" } } },
            { method: "GET", path: "/api/v1/productos/buscar", summary: "Buscar productos por nombre o SKU", description: "Realiza una búsqueda rápida de productos por coincidencia parcial en el nombre o código SKU. Soporta paginación. Es el endpoint utilizado por el buscador del punto de venta para localizar productos ágilmente durante el cobro.", parameters: [{ name: "q", in: "query", type: "string", required: true, description: "Texto de búsqueda" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página (default: 0)" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página (default: 20)" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListProductoResponse" } } }
        ]
    },
    recepciones: {
        name: "Recepciones",
        description: "Gestión de recepciones de mercancía originadas a partir de órdenes de compra. Cada recepción permite registrar los productos efectivamente recibidos, verificar cantidades aceptadas y rechazadas, y al confirmarla, el stock se incrementa automáticamente con su respectivo registro en el kardex.",
        endpoints: [
            { method: "GET", path: "/api/v1/compras/recepciones", summary: "Listar recepciones con filtros", description: "Recupera las recepciones de compra del tenant con filtros por orden de compra origen y estado. Soporta paginación. Permite rastrear qué mercancía ha sido recibida y cuál está pendiente de recepción.", parameters: [{ name: "ordenCompraId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por orden de compra" }, { name: "estado", in: "query", type: "string", required: false, description: "Filtrar por estado" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página (default: 0)" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página (default: 20)" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListRecepcionCompraResponse" } } },
            { method: "POST", path: "/api/v1/compras/recepciones", summary: "Registrar recepción de compra", description: "Registra una nueva recepción de mercancía asociada a una orden de compra existente. Se especifican los productos recibidos con sus cantidades reales. La recepción queda en estado pendiente hasta ser confirmada, momento en que impacta el inventario.", parameters: [], requestBody: { type: "CrearRecepcionRequest", properties: { ordenCompraId: { type: "integer (int64)", required: true, description: "ID de la orden de compra" }, productos: { type: "array", required: true, description: "Productos recibidos con cantidades" }, observaciones: { type: "string", required: false, description: "Observaciones" } } }, responses: { "200": { description: "OK", schema: "ApiResponseRecepcionCompraResponse" } } },
            { method: "GET", path: "/api/v1/compras/recepciones/{id}", summary: "Detalle de recepción", description: "Consulta la información completa de una recepción incluyendo el detalle de productos recibidos, cantidades aceptadas vs rechazadas, observaciones y el estado actual de la recepción.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la recepción" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseRecepcionCompraResponse" } } },
            { method: "PATCH", path: "/api/v1/compras/recepciones/{id}/confirmar", summary: "Confirmar recepción", description: "Confirma la recepción de mercancía. Esta acción incrementa automáticamente el stock de los productos aceptados en el almacén correspondiente, registra los movimientos de entrada en el kardex de cada producto y actualiza el estado de la orden de compra asociada.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la recepción" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseRecepcionCompraResponse" } } },
            { method: "PATCH", path: "/api/v1/compras/recepciones/{id}/anular", summary: "Anular recepción pendiente", description: "Anula una recepción que aún se encuentra en estado pendiente. Las cantidades registradas se revierten en la orden de compra asociada, permitiendo crear una nueva recepción corregida.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la recepción" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseRecepcionCompraResponse" } } }
        ]
    },
    reportes: {
        name: "Reportes",
        description: "Módulo de reportes y analítica del negocio. Ofrece un dashboard ejecutivo con métricas clave del día y mes, reportes detallados de ventas con tendencias, ranking de productos más vendidos, estado del inventario con valorización, balance financiero de ingresos vs egresos, estadísticas de compras por proveedor y análisis de sesiones de caja.",
        endpoints: [
            { method: "GET", path: "/api/v1/reportes/resumen", summary: "Dashboard ejecutivo", description: "Genera el panel de control ejecutivo con las métricas principales del negocio: total de ventas del día y del mes, cantidad de transacciones, productos con stock bajo mínimo y alertas activas. Es la vista principal del administrador al iniciar sesión.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseResumenDashboardResponse" } } },
            { method: "GET", path: "/api/v1/reportes/ventas", summary: "Reporte de ventas con totales y tendencias", description: "Genera un reporte detallado de ventas con totales, tendencias temporales y desglose por tipo de comprobante. Se puede filtrar por rango de fechas, usuario vendedor, cliente y tipo de comprobante. Incluye gráficos de tendencia para análisis de desempeño comercial.", parameters: [{ name: "fechaDesde", in: "query", type: "string", required: false, description: "Fecha desde" }, { name: "fechaHasta", in: "query", type: "string", required: false, description: "Fecha hasta" }, { name: "usuarioId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por usuario" }, { name: "clienteId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por cliente" }, { name: "tipoComprobante", in: "query", type: "string", required: false, description: "Tipo de comprobante" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseReporteVentasResponse" } } },
            { method: "GET", path: "/api/v1/reportes/productos-mas-vendidos", summary: "Ranking top N productos más vendidos", description: "Genera un ranking de los N productos más vendidos en un período determinado, opcionalmente filtrado por categoría. Muestra unidades vendidas, monto total y porcentaje de participación. Útil para identificar los productos estrella y tomar decisiones de abastecimiento.", parameters: [{ name: "fechaDesde", in: "query", type: "string", required: false, description: "Fecha desde" }, { name: "fechaHasta", in: "query", type: "string", required: false, description: "Fecha hasta" }, { name: "categoriaId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por categoría" }, { name: "top", in: "query", type: "integer (int32)", required: false, description: "Top N (default: 10)" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseProductosMasVendidosResponse" } } },
            { method: "GET", path: "/api/v1/reportes/inventario", summary: "Estado del inventario + valorización", description: "Muestra el estado actual del inventario con la valorización económica de las existencias a precio de costo y precio de venta. Se puede filtrar por almacén y categoría. Es fundamental para auditorías y control del valor del inventario en el balance.", parameters: [{ name: "almacenId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por almacén" }, { name: "categoriaId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por categoría" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseReporteInventarioResponse" } } },
            { method: "GET", path: "/api/v1/reportes/financiero", summary: "Balance: ingresos vs egresos", description: "Genera el balance financiero del negocio confrontando ingresos por ventas contra egresos por compras en un período determinado. Calcula el margen de ganancia bruta y permite visualizar la rentabilidad general del negocio.", parameters: [{ name: "fechaDesde", in: "query", type: "string", required: false, description: "Fecha desde" }, { name: "fechaHasta", in: "query", type: "string", required: false, description: "Fecha hasta" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseReporteFinancieroResponse" } } },
            { method: "GET", path: "/api/v1/reportes/compras", summary: "Reporte de compras por proveedor", description: "Genera un reporte de compras agrupado por proveedor con totales y desglose por estado. Se puede filtrar por rango de fechas, proveedor específico y estado de las compras. Útil para evaluar el volumen de negocio con cada proveedor.", parameters: [{ name: "fechaDesde", in: "query", type: "string", required: false, description: "Fecha desde" }, { name: "fechaHasta", in: "query", type: "string", required: false, description: "Fecha hasta" }, { name: "proveedorId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por proveedor" }, { name: "estado", in: "query", type: "string", required: false, description: "Filtrar por estado" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseReporteComprasResponse" } } },
            { method: "GET", path: "/api/v1/reportes/caja", summary: "Sesiones de caja: ventas, diferencias", description: "Genera un reporte de las sesiones de caja registradas con detalle de ventas realizadas, montos esperados vs declarados y diferencias (sobrantes/faltantes). Se puede filtrar por rango de fechas, caja específica y usuario cajero. Esencial para el control y auditoría de caja.", parameters: [{ name: "fechaDesde", in: "query", type: "string", required: false, description: "Fecha desde" }, { name: "fechaHasta", in: "query", type: "string", required: false, description: "Fecha hasta" }, { name: "cajaId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por caja" }, { name: "usuarioId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por usuario" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseReporteCajaResponse" } } }
        ]
    },
    roles: {
        name: "Roles",
        description: "Gestión de roles y permisos del tenant. Los roles definen qué módulos y acciones puede realizar cada usuario dentro del sistema. Los permisos se almacenan en formato JSON y se validan en cada solicitud. Los roles del sistema (ej: ADMIN) no pueden ser modificados ni desactivados.",
        endpoints: [
            { method: "GET", path: "/api/v1/roles", summary: "Listar roles con conteo de usuarios", description: "Recupera todos los roles del tenant incluyendo la cantidad de usuarios asignados a cada uno. Permite al administrador visualizar la estructura de permisos del negocio y planificar la asignación de roles.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListRolResponse" } } },
            { method: "POST", path: "/api/v1/roles", summary: "Crear rol con permisos JSON", description: "Crea un nuevo rol personalizado para el tenant con sus permisos definidos en formato JSON. El JSON de permisos especifica los módulos accesibles y las operaciones permitidas (leer, crear, editar, eliminar) en cada uno.", parameters: [], requestBody: { type: "CrearRolRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del rol" }, descripcion: { type: "string", required: false, description: "Descripción del rol" }, permisos: { type: "string (JSON)", required: true, description: "Permisos en formato JSON" } } }, responses: { "200": { description: "OK", schema: "ApiResponseRolResponse" } } },
            { method: "PUT", path: "/api/v1/roles/{id}", summary: "Actualizar permisos del rol", description: "Modifica el nombre, descripción o permisos de un rol personalizado. Los roles del sistema no pueden ser modificados. Los cambios de permisos se aplican inmediatamente a todos los usuarios con este rol asignado.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del rol" }], requestBody: { type: "CrearRolRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del rol" }, descripcion: { type: "string", required: false, description: "Descripción" }, permisos: { type: "string (JSON)", required: true, description: "Permisos" } } }, responses: { "200": { description: "OK", schema: "ApiResponseRolResponse" } } },
            { method: "PATCH", path: "/api/v1/roles/{id}/estado", summary: "Desactivar rol", description: "Desactiva un rol personalizado del tenant. Solo se puede desactivar si no tiene usuarios asignados actualmente y no es un rol del sistema. Los roles desactivados no aparecen como opción al crear o editar usuarios.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del rol" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseRolResponse" } } }
        ]
    },
    tallas: {
        name: "Tallas",
        description: "Catálogo de tallas para la clasificación de productos (ej: XS, S, M, L, XL, 36, 38, 40). Se asignan a cada producto y permiten filtrar en búsquedas tanto en el backoffice como en la tienda online.",
        endpoints: [
            { method: "GET", path: "/api/v1/configuracion/tallas", summary: "Listar registros activos", description: "Recupera todas las tallas activas del catálogo del tenant. Las tallas eliminadas lógicamente quedan excluidas. Se utiliza para poblar selectores en formularios de productos.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListCatalogResponse" } } },
            { method: "POST", path: "/api/v1/configuracion/tallas", summary: "Crear registro", description: "Agrega una nueva talla al catálogo del tenant. Una vez creada, estará disponible para ser asignada a productos nuevos o existentes.", parameters: [], requestBody: { type: "CatalogRequest", properties: { nombre: { type: "string", required: true, description: "Nombre de la talla" }, descripcion: { type: "string", required: false, description: "Descripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } } },
            { method: "PUT", path: "/api/v1/configuracion/tallas/{id}", summary: "Actualizar registro", description: "Modifica el nombre o descripción de una talla existente. El cambio se refleja automáticamente en los productos asociados.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la talla" }], requestBody: { type: "CatalogRequest", properties: { nombre: { type: "string", required: true, description: "Nombre de la talla" }, descripcion: { type: "string", required: false, description: "Descripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } } },
            { method: "DELETE", path: "/api/v1/configuracion/tallas/{id}", summary: "Eliminar registro (soft delete)", description: "Elimina lógicamente una talla del catálogo. El registro se conserva en la base de datos para mantener la integridad de los productos que la tenían asignada.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la talla" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } }
        ]
    },
    transferencias: {
        name: "Transferencias",
        description: "Gestión de transferencias de inventario entre almacenes del mismo tenant. Las transferencias siguen un flujo de aprobación: se crean con estado PENDIENTE y al ser aprobadas, el sistema descuenta el stock del almacén origen, lo incrementa en el destino y registra los movimientos en el kardex de ambos almacenes.",
        endpoints: [
            { method: "GET", path: "/api/v1/transferencias", summary: "Listar transferencias con filtros", description: "Recupera las transferencias de inventario del tenant con filtros por estado y almacén de origen. Soporta paginación. Permite supervisar el flujo de mercancía entre almacenes e identificar transferencias pendientes de aprobación.", parameters: [{ name: "estado", in: "query", type: "string", required: false, description: "Filtrar por estado" }, { name: "almacenOrigenId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por almacén origen" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListTransferenciaResponse" } } },
            { method: "POST", path: "/api/v1/transferencias", summary: "Crear transferencia (estado PENDIENTE)", description: "Crea una nueva solicitud de transferencia de inventario entre dos almacenes del tenant. Se especifican los productos a transferir con sus cantidades. La transferencia queda en estado PENDIENTE hasta que un usuario autorizado la apruebe o cancele.", parameters: [], requestBody: { type: "CrearTransferenciaRequest", properties: { almacenOrigenId: { type: "integer (int64)", required: true, description: "ID del almacén origen" }, almacenDestinoId: { type: "integer (int64)", required: true, description: "ID del almacén destino" }, productos: { type: "array", required: true, description: "Productos a transferir" }, observaciones: { type: "string", required: false, description: "Observaciones" } } }, responses: { "200": { description: "OK", schema: "ApiResponseTransferenciaResponse" } } },
            { method: "GET", path: "/api/v1/transferencias/{id}", summary: "Detalle de transferencia con productos", description: "Consulta la información completa de una transferencia incluyendo almacenes origen y destino, el detalle de cada producto con cantidades, el estado actual y las fechas de creación, aprobación o cancelación.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la transferencia" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseTransferenciaResponse" } } },
            { method: "PATCH", path: "/api/v1/transferencias/{id}/aprobar", summary: "Aprobar transferencia", description: "Aprueba una transferencia pendiente, ejecutando el movimiento de inventario. El sistema descuenta el stock del almacén origen, lo incrementa en el almacén destino y genera registros de salida y entrada en el kardex de ambos almacenes para mantener la trazabilidad completa.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la transferencia" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseTransferenciaResponse" } } },
            { method: "PATCH", path: "/api/v1/transferencias/{id}/cancelar", summary: "Cancelar transferencia pendiente", description: "Cancela una transferencia que aún se encuentra en estado PENDIENTE. No afecta el inventario ya que la mercancía no ha sido movida. Las transferencias ya aprobadas no pueden ser canceladas.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la transferencia" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseTransferenciaResponse" } } }
        ]
    },
    ubigeo: {
        name: "Ubigeo",
        description: "Datos geográficos del Perú en modo solo lectura. Proporciona el catálogo oficial de departamentos, provincias y distritos del Perú. Se utiliza para autocompletar direcciones de clientes, proveedores y almacenes con nombres geográficos estandarizados.",
        endpoints: [
            { method: "GET", path: "/api/v1/ubigeo/departamentos", summary: "Listar 25 departamentos del Perú", description: "Recupera la lista de los 25 departamentos del Perú. Es el primer nivel de la jerarquía geográfica y punto de partida para los selectores en cascada de ubicación (departamento → provincia → distrito).", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListUbigeoResponse" } } },
            { method: "GET", path: "/api/v1/ubigeo/provincias", summary: "Listar provincias por departamento", description: "Recupera las provincias pertenecientes a un departamento específico. Se utiliza como segundo nivel del selector en cascada de ubicación geográfica.", parameters: [{ name: "departamentoId", in: "query", type: "integer (int64)", required: true, description: "ID del departamento" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListUbigeoResponse" } } },
            { method: "GET", path: "/api/v1/ubigeo/distritos", summary: "Listar distritos por provincia", description: "Recupera los distritos pertenecientes a una provincia específica. Es el tercer y último nivel del selector en cascada de ubicación. El distrito seleccionado se almacena como referencia geográfica en la dirección del cliente, proveedor o almacén.", parameters: [{ name: "provinciaId", in: "query", type: "integer (int64)", required: true, description: "ID de la provincia" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListUbigeoResponse" } } }
        ]
    },
    unidadesMedida: {
        name: "Unidades de Medida",
        description: "Catálogo de unidades de medida aplicables a los productos (ej: Unidad, Par, Docena, Metro, Kilogramo). Se asignan a cada producto para definir cómo se cuantifica en inventario, ventas y compras.",
        endpoints: [
            { method: "GET", path: "/api/v1/configuracion/unidades-medida", summary: "Listar registros activos", description: "Recupera todas las unidades de medida activas del tenant. Las unidades eliminadas lógicamente quedan excluidas. Se utiliza para poblar selectores en formularios de productos.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListCatalogResponse" } } },
            { method: "POST", path: "/api/v1/configuracion/unidades-medida", summary: "Crear registro", description: "Agrega una nueva unidad de medida al catálogo del tenant. Una vez creada, estará disponible para ser asignada a productos.", parameters: [], requestBody: { type: "CatalogRequest", properties: { nombre: { type: "string", required: true, description: "Nombre de la unidad" }, descripcion: { type: "string", required: false, description: "Descripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } } },
            { method: "PUT", path: "/api/v1/configuracion/unidades-medida/{id}", summary: "Actualizar registro", description: "Modifica el nombre o descripción de una unidad de medida existente. Los productos asociados reflejarán el cambio automáticamente.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la unidad de medida" }], requestBody: { type: "CatalogRequest", properties: { nombre: { type: "string", required: true, description: "Nombre" }, descripcion: { type: "string", required: false, description: "Descripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseCatalogResponse" } } },
            { method: "DELETE", path: "/api/v1/configuracion/unidades-medida/{id}", summary: "Eliminar registro (soft delete)", description: "Elimina lógicamente una unidad de medida del catálogo. Se conserva en la base de datos para mantener la integridad de los productos que la tenían asignada.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la unidad de medida" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } }
        ]
    },
    usuarios: {
        name: "Usuarios",
        description: "Gestión de usuarios internos del tenant. Permite crear, listar, editar y activar/desactivar usuarios. Cada usuario se asocia a un rol que define sus permisos dentro del sistema. Las contraseñas deben cumplir requisitos mínimos de seguridad (8+ caracteres, mayúsculas, minúsculas y números).",
        endpoints: [
            { method: "GET", path: "/api/v1/usuarios", summary: "Listar usuarios con filtros", description: "Recupera los usuarios del tenant con filtros opcionales por rol asignado, estado activo/inactivo y búsqueda por texto libre (nombre, apellido o email). Soporta paginación. Es la vista principal de administración de usuarios.", parameters: [{ name: "rolId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por rol" }, { name: "estado", in: "query", type: "boolean", required: false, description: "Filtrar por estado" }, { name: "q", in: "query", type: "string", required: false, description: "Búsqueda por texto" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListUsuarioResponse" } } },
            { method: "POST", path: "/api/v1/usuarios", summary: "Crear usuario", description: "Registra un nuevo usuario dentro del tenant. El email debe ser único dentro del tenant. La contraseña debe cumplir con los requisitos de seguridad: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número. Se debe asignar un rol que definirá sus permisos.", parameters: [], requestBody: { type: "CrearUsuarioRequest", properties: { email: { type: "string", required: true, description: "Email del usuario (único en tenant)" }, password: { type: "string (min 8)", required: true, description: "Contraseña (8+ chars, mayúsc, minúsc, números)" }, nombre: { type: "string", required: true, description: "Nombre del usuario" }, apellido: { type: "string", required: true, description: "Apellido del usuario" }, rolId: { type: "integer (int64)", required: true, description: "ID del rol asignado" } } }, responses: { "200": { description: "OK", schema: "ApiResponseUsuarioResponse" } } },
            { method: "GET", path: "/api/v1/usuarios/{id}", summary: "Detalle de usuario con rol, permisos y último acceso", description: "Consulta la información completa de un usuario incluyendo sus datos personales, el rol asignado con sus permisos detallados, estado activo/inactivo y la fecha y hora de su último acceso al sistema.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del usuario" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseUsuarioResponse" } } },
            { method: "PUT", path: "/api/v1/usuarios/{id}", summary: "Actualizar datos de usuario", description: "Modifica los datos personales de un usuario y/o reasigna su rol. El email debe seguir siendo único dentro del tenant. No permite cambiar la contraseña desde este endpoint (usar el endpoint específico de cambio de contraseña).", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del usuario" }], requestBody: { type: "ActualizarUsuarioRequest", properties: { email: { type: "string", required: false, description: "Nuevo email" }, nombre: { type: "string", required: false, description: "Nombre" }, apellido: { type: "string", required: false, description: "Apellido" }, rolId: { type: "integer (int64)", required: true, description: "ID del rol" } } }, responses: { "200": { description: "OK", schema: "ApiResponseUsuarioResponse" } } },
            { method: "PATCH", path: "/api/v1/usuarios/{id}/password", summary: "Cambiar contraseña de usuario (solo admin)", description: "Permite al administrador del tenant cambiar la contraseña de cualquier usuario. La nueva contraseña debe cumplir con los mismos requisitos de seguridad (mínimo 8 caracteres con mayúsculas, minúsculas y números). El usuario afectado deberá usar la nueva contraseña en su próximo inicio de sesión.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del usuario" }], requestBody: { type: "CambiarPasswordRequest", properties: { password: { type: "string (min 8)", required: true, description: "Nueva contraseña" } } }, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } },
            { method: "PATCH", path: "/api/v1/usuarios/{id}/estado", summary: "Activar/desactivar usuario", description: "Activa o desactiva un usuario del tenant. Un usuario desactivado no puede iniciar sesión ni acceder a ninguna funcionalidad del sistema. El administrador no puede desactivarse a sí mismo para evitar quedarse sin acceso.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del usuario" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseUsuarioResponse" } } }
        ]
    },
    ventas: {
        name: "Ventas",
        description: "Módulo central de ventas y punto de venta (POS). Gestiona todo el ciclo de vida de una venta: creación con estado PENDIENTE, confirmación de pago que descuenta stock y registra kardex, cambios de estado, generación de comprobantes en formato HTML y PDF (boleta o factura), y eliminación de ventas pendientes.",
        endpoints: [
            { method: "GET", path: "/api/v1/ventas", summary: "Listar ventas con filtros", description: "Recupera el listado de ventas del tenant con filtros por estado, fecha, cliente y paginación. Cada venta muestra su número de comprobante, cliente, monto total, estado y fecha. Es la vista principal del módulo de ventas.", parameters: [{ name: "estado", in: "query", type: "string", required: false, description: "Filtrar por estado" }, { name: "fechaDesde", in: "query", type: "string", required: false, description: "Fecha desde" }, { name: "clienteId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por cliente" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Número de página" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListVentaResponse" } } },
            { method: "POST", path: "/api/v1/ventas", summary: "Crear venta (estado PENDIENTE)", description: "Crea una nueva venta con estado PENDIENTE. Se especifica el cliente, almacén de donde se despachará la mercancía, el tipo de comprobante (BOLETA o FACTURA), los productos con cantidades y precios, y observaciones opcionales. La venta aún no descuenta stock hasta que se confirme el pago.", parameters: [], requestBody: { type: "CrearVentaRequest", properties: { clienteId: { type: "integer (int64)", required: true, description: "ID del cliente" }, almacenId: { type: "integer (int64)", required: true, description: "ID del almacén" }, tipoComprobante: { type: "string", required: true, description: "Tipo de comprobante (BOLETA, FACTURA)" }, productos: { type: "array", required: true, description: "Lista de productos con cantidades y precios" }, observaciones: { type: "string", required: false, description: "Observaciones" } } }, responses: { "200": { description: "OK", schema: "ApiResponseVentaResponse" } } },
            { method: "GET", path: "/api/v1/ventas/{id}", summary: "Detalle de venta con productos, pagos y cliente", description: "Consulta la información completa de una venta incluyendo el detalle de cada producto vendido con cantidades y precios, los pagos registrados con sus métodos de pago, los datos del cliente y el historial de cambios de estado.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la venta" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVentaResponse" } } },
            { method: "DELETE", path: "/api/v1/ventas/{id}", summary: "Eliminar venta PENDIENTE", description: "Elimina una venta que aún se encuentra en estado PENDIENTE. Solo las ventas pendientes pueden ser eliminadas ya que aún no han afectado el inventario ni generado movimientos contables. Las ventas completadas o anuladas no pueden eliminarse.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la venta" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } },
            { method: "POST", path: "/api/v1/ventas/{id}/confirmar-pago", summary: "Confirmar pago → COMPLETADA", description: "Confirma el pago de una venta pendiente, cambiándola a estado COMPLETADA. Esta acción descuenta automáticamente el stock de los productos vendidos del almacén asignado, registra los movimientos de salida en el kardex de cada producto, y asocia el pago con su método, monto y referencia.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la venta" }], requestBody: { type: "ConfirmarPagoRequest", properties: { metodoPagoId: { type: "integer (int64)", required: true, description: "ID del método de pago" }, monto: { type: "number", required: true, description: "Monto pagado" }, referencia: { type: "string", required: false, description: "Referencia de pago" } } }, responses: { "200": { description: "OK", schema: "ApiResponseVentaResponse" } } },
            { method: "PATCH", path: "/api/v1/ventas/{id}/estado", summary: "Cambiar estado de venta", description: "Modifica el estado de una venta (ej: ANULADA). Se puede incluir un motivo que queda registrado en el historial. La anulación de una venta completada puede revertir el descuento de stock dependiendo de la configuración del tenant.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la venta" }], requestBody: { type: "CambiarEstadoVentaRequest", properties: { estado: { type: "string", required: true, description: "Nuevo estado" }, motivo: { type: "string", required: false, description: "Motivo del cambio" } } }, responses: { "200": { description: "OK", schema: "ApiResponseVentaResponse" } } },
            { method: "GET", path: "/api/v1/ventas/{id}/comprobante/preview", summary: "Preview comprobante HTML", description: "Genera una vista previa del comprobante de venta en formato HTML. Incluye los datos fiscales de la empresa, el detalle de productos, totales con IGV y los datos del cliente. Se utiliza para previsualizar el comprobante antes de imprimir o generar el PDF.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la venta" }], requestBody: null, responses: { "200": { description: "OK - HTML string" } } },
            { method: "GET", path: "/api/v1/ventas/{id}/comprobante/pdf", summary: "Descargar comprobante PDF", description: "Genera y descarga el comprobante de venta en formato PDF listo para imprimir o enviar al cliente. El PDF incluye datos fiscales de la empresa, serie y número correlativo del comprobante, detalle de productos, totales con desglose de IGV y datos del cliente.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID de la venta" }], requestBody: null, responses: { "200": { description: "OK - Archivo PDF (byte[])" } } }
        ]
    },
    soporteTickets: {
        name: "Soporte - Tickets",
        description: "Sistema de tickets de soporte para la comunicación entre el negocio (tenant) y el equipo de administración de la plataforma. Los tickets permiten reportar problemas técnicos, solicitar asistencia o enviar consultas, manteniendo un historial completo de la conversación.",
        endpoints: [
            { method: "POST", path: "/api/v1/soporte/tickets", summary: "Crear ticket de soporte", description: "Crea un nuevo ticket de soporte dirigido al equipo de administración de la plataforma. El ticket se crea en estado ABIERTO y se asocia automáticamente al tenant del usuario autenticado. Se puede asignar una prioridad (BAJA, MEDIA, ALTA o URGENTE) que determina el orden de atención.", parameters: [], requestBody: { type: "CrearTicketRequest", properties: { asunto: { type: "string", required: true, description: "Asunto del ticket" }, descripcion: { type: "string", required: true, description: "Descripción detallada del problema o consulta" }, prioridad: { type: "string", required: false, description: "Prioridad del ticket (BAJA, MEDIA, ALTA, URGENTE). Default: MEDIA" } } }, responses: { "200": { description: "OK", schema: "ApiResponseTicketResponse" } } },
            { method: "GET", path: "/api/v1/soporte/tickets", summary: "Listar mis tickets", description: "Recupera todos los tickets de soporte creados por el tenant autenticado con filtros opcionales por estado y paginación. Permite al negocio dar seguimiento a sus solicitudes de soporte abiertas, en proceso, resueltas o cerradas.", parameters: [{ name: "estado", in: "query", type: "string", required: false, description: "Filtrar por estado (ABIERTO, EN_PROCESO, RESUELTO, CERRADO)" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Página (default: 0)" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página (default: 20)" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListTicketResponse" } } },
            { method: "GET", path: "/api/v1/soporte/tickets/{id}", summary: "Detalle de ticket con conversación", description: "Consulta la información completa de un ticket incluyendo el hilo completo de conversación con todas las respuestas intercambiadas entre el tenant y el equipo de soporte de la plataforma, ordenadas cronológicamente.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del ticket" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseTicketResponse" } } },
            { method: "POST", path: "/api/v1/soporte/tickets/{id}/respuestas", summary: "Responder a ticket", description: "Agrega una nueva respuesta al ticket desde el lado del negocio (tenant). La respuesta queda registrada con el nombre del usuario autenticado y la fecha/hora exacta. El equipo de soporte recibirá una notificación para dar seguimiento.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del ticket" }], requestBody: { type: "RespuestaTicketRequest", properties: { mensaje: { type: "string", required: true, description: "Contenido de la respuesta" } } }, responses: { "200": { description: "OK", schema: "ApiResponseTicketResponse" } } }
        ]
    }
};

// ===================== STOREFRONT =====================

API_DATA.environments.storefront.modules = {
    storefront: {
        name: "StoreFront",
        description: "API pública de la tienda online B2C orientada a clientes finales. Incluye endpoints públicos sin autenticación (catálogo de productos, categorías, catálogos, datos de empresa, métodos de pago, ubigeo) y endpoints protegidos que requieren autenticación de cliente storefront (perfil, pedidos, cambio de contraseña).",
        endpoints: [
            { method: "GET", path: "/api/v1/storefront/productos", summary: "Catálogo público de productos", description: "Recupera el catálogo público de productos de un tenant específico. No requiere autenticación. Soporta filtros por categoría, marca, género y búsqueda por texto libre, con paginación. Es el endpoint principal que consume la tienda online para mostrar los productos disponibles a los clientes.", parameters: [{ name: "tenantId", in: "query", type: "integer (int64)", required: true, description: "ID del tenant" }, { name: "categoriaId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por categoría" }, { name: "marcaId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por marca" }, { name: "generoId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por género" }, { name: "q", in: "query", type: "string", required: false, description: "Búsqueda por texto" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Página" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponsePageProductoStorefrontResponse" } } },
            { method: "GET", path: "/api/v1/storefront/productos/{slug}", summary: "Detalle de producto por slug", description: "Consulta el detalle completo de un producto utilizando su slug URL-friendly en lugar del ID numérico. No requiere autenticación. Devuelve nombre, descripción, imágenes, precio, atributos (talla, color, marca, material) y disponibilidad. Se utiliza en la página de detalle de producto de la tienda online.", parameters: [{ name: "tenantId", in: "query", type: "integer (int64)", required: true, description: "ID del tenant" }, { name: "slug", in: "path", type: "string", required: true, description: "Slug del producto" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseProductoStorefrontResponse" } } },
            { method: "GET", path: "/api/v1/storefront/productos/por-ids", summary: "Obtener productos por lista de IDs", description: "Recupera múltiples productos simultáneamente a partir de una lista de IDs. No requiere autenticación. Se utiliza para cargar los productos del carrito de compras del cliente, donde los IDs se almacenan localmente en el navegador.", parameters: [{ name: "tenantId", in: "query", type: "integer (int64)", required: true, description: "ID del tenant" }, { name: "ids", in: "query", type: "array (int64)", required: true, description: "Lista de IDs de productos" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListProductoStorefrontResponse" } } },
            { method: "GET", path: "/api/v1/storefront/categorias", summary: "Categorías activas", description: "Recupera las categorías activas del tenant para mostrar en la navegación y filtros de la tienda online. No requiere autenticación. Cada categoría incluye nombre, descripción y cantidad de productos asociados.", parameters: [{ name: "tenantId", in: "query", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListCategoriaStorefrontResponse" } } },
            { method: "GET", path: "/api/v1/storefront/catalogos", summary: "Catálogos públicos", description: "Recupera todos los catálogos públicos del tenant en una sola llamada: tallas, colores, marcas, materiales y géneros. No requiere autenticación. Se utiliza para poblar los filtros laterales de la tienda online y las opciones de selección de variantes de producto.", parameters: [{ name: "tenantId", in: "query", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseCatalogosStorefrontResponse" } } },
            { method: "GET", path: "/api/v1/storefront/empresa", summary: "Datos de empresa públicos", description: "Recupera la información pública de la empresa del tenant: nombre comercial, razón social, RUC, dirección, teléfono, email de contacto y política de devoluciones. No requiere autenticación. Se muestra en el pie de página, página de contacto y sección legal de la tienda online.", parameters: [{ name: "tenantId", in: "query", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseEmpresaStorefrontResponse" } } },
            { method: "GET", path: "/api/v1/storefront/metodos-pago", summary: "Métodos de pago activos", description: "Recupera los métodos de pago activos configurados por el tenant. No requiere autenticación. Se utiliza en el proceso de checkout para mostrar al cliente las opciones de pago disponibles (efectivo, tarjeta, transferencia, etc.).", parameters: [{ name: "tenantId", in: "query", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListMetodoPagoStorefrontResponse" } } },
            { method: "GET", path: "/api/v1/storefront/perfil", summary: "Ver perfil del cliente autenticado", description: "Consulta la información del perfil del cliente autenticado en la tienda online. Incluye datos personales (nombre, apellido, email), teléfono, dirección y fecha de registro. Requiere autenticación storefront.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponsePerfilClienteResponse" } } },
            { method: "PUT", path: "/api/v1/storefront/perfil", summary: "Actualizar perfil del cliente", description: "Permite al cliente autenticado modificar sus datos personales: nombre, apellido, teléfono y dirección de entrega. El email no se puede cambiar desde este endpoint. Requiere autenticación storefront.", parameters: [], requestBody: { type: "ActualizarPerfilRequest", properties: { nombre: { type: "string", required: false, description: "Nombre" }, apellido: { type: "string", required: false, description: "Apellido" }, telefono: { type: "string", required: false, description: "Teléfono" }, direccion: { type: "string", required: false, description: "Dirección" } } }, responses: { "200": { description: "OK", schema: "ApiResponsePerfilClienteResponse" } } },
            { method: "PUT", path: "/api/v1/storefront/perfil/password", summary: "Cambiar contraseña del cliente", description: "Permite al cliente autenticado cambiar su contraseña. Se requiere ingresar la contraseña actual como verificación de identidad y la nueva contraseña debe tener un mínimo de 8 caracteres. Requiere autenticación storefront.", parameters: [], requestBody: { type: "CambiarPasswordStorefrontRequest", properties: { passwordActual: { type: "string", required: true, description: "Contraseña actual" }, passwordNueva: { type: "string (min 8)", required: true, description: "Nueva contraseña (min 8 caracteres)" } } }, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } },
            { method: "GET", path: "/api/v1/storefront/pedidos", summary: "Listar mis pedidos", description: "Recupera el historial de pedidos del cliente autenticado con paginación. Cada pedido muestra su estado (PENDIENTE, CONFIRMADO, EN_CAMINO, ENTREGADO, CANCELADO), productos, monto total y fechas. Requiere autenticación storefront.", parameters: [{ name: "page", in: "query", type: "integer (int32)", required: false, description: "Página (default: 0)" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño (default: 10)" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponsePagePedidoResponse" } } },
            { method: "POST", path: "/api/v1/storefront/pedidos", summary: "Crear pedido online", description: "Crea un nuevo pedido online desde la tienda. El cliente autenticado especifica los productos con cantidades, el método de pago y opcionalmente una dirección de envío. El pedido se crea en estado PENDIENTE y notifica al tenant para su procesamiento. Requiere autenticación storefront.", parameters: [], requestBody: { type: "CrearPedidoRequest", properties: { productos: { type: "array", required: true, description: "Lista de productos con cantidades" }, metodoPagoId: { type: "integer (int64)", required: true, description: "Método de pago" }, direccionEnvio: { type: "string", required: false, description: "Dirección de envío" } } }, responses: { "200": { description: "OK", schema: "ApiResponsePedidoResponse" } } },
            { method: "GET", path: "/api/v1/storefront/pedidos/{id}", summary: "Detalle de un pedido", description: "Consulta la información completa de un pedido del cliente autenticado incluyendo productos con cantidades y precios, método de pago, dirección de envío, estado actual y fechas de cada cambio de estado. Requiere autenticación storefront.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del pedido" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponsePedidoResponse" } } },
            { method: "PATCH", path: "/api/v1/storefront/pedidos/{id}/cancelar", summary: "Cancelar pedido", description: "Permite al cliente cancelar un pedido que se encuentre en estado PENDIENTE o CONFIRMADO. Los pedidos en estados posteriores (EN_CAMINO, ENTREGADO) no pueden ser cancelados desde la tienda. Requiere autenticación storefront.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del pedido" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponsePedidoResponse" } } },
            { method: "GET", path: "/api/v1/storefront/ubigeo/departamentos", summary: "Lista de departamentos", description: "Recupera los departamentos del Perú para el formulario de dirección de envío en el checkout de la tienda online. No requiere autenticación. Es el primer nivel del selector en cascada de ubicación.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListMapStringObject" } } },
            { method: "GET", path: "/api/v1/storefront/ubigeo/provincias", summary: "Provincias por departamento", description: "Recupera las provincias de un departamento específico para el selector en cascada del formulario de envío. No requiere autenticación.", parameters: [{ name: "departamentoId", in: "query", type: "integer (int64)", required: true, description: "ID del departamento" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListMapStringObject" } } },
            { method: "GET", path: "/api/v1/storefront/ubigeo/distritos", summary: "Distritos por provincia", description: "Recupera los distritos de una provincia específica para completar la dirección de envío en el checkout. No requiere autenticación. Es el tercer y último nivel del selector en cascada de ubicación.", parameters: [{ name: "provinciaId", in: "query", type: "integer (int64)", required: true, description: "ID de la provincia" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListMapStringObject" } } }
        ]
    }
};

// ===================== SUPERADMIN =====================

API_DATA.environments.superadmin.modules = {
    platformCupones: {
        name: "Cupones",
        description: "Gestión de cupones promocionales de la plataforma. Permite crear cupones con descuento porcentual o de monto fijo, definir períodos de vigencia y límites de uso. Los cupones pueden ser aplicados por los clientes durante el proceso de compra en la tienda online.",
        endpoints: [
            { method: "GET", path: "/api/v1/platform/cupones", summary: "Listar cupones", description: "Recupera todos los cupones promocionales registrados en la plataforma con su información completa: código, tipo de descuento, valor, fechas de vigencia, usos máximos y cantidad de usos actuales. Permite al superadmin supervisar las promociones activas e históricas.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListCuponResponse" } } },
            { method: "POST", path: "/api/v1/platform/cupones", summary: "Crear cupón promocional", description: "Crea un nuevo cupón promocional especificando su código único, tipo de descuento (PORCENTAJE o MONTO_FIJO), valor del descuento, período de vigencia con fechas de inicio y fin, y opcionalmente un límite máximo de usos. El cupón estará disponible para los clientes de la tienda online.", parameters: [], requestBody: { type: "CrearCuponRequest", properties: { codigo: { type: "string", required: true, description: "Código del cupón" }, tipo: { type: "string", required: true, description: "Tipo de descuento (PORCENTAJE, MONTO_FIJO)" }, valor: { type: "number", required: true, description: "Valor del descuento" }, fechaInicio: { type: "string (date)", required: true, description: "Fecha de inicio de vigencia" }, fechaFin: { type: "string (date)", required: true, description: "Fecha fin de vigencia" }, usosMaximos: { type: "integer", required: false, description: "Usos máximos permitidos" } } }, responses: { "200": { description: "OK", schema: "ApiResponseCuponResponse" } } }
        ]
    },
    platformOperaciones: {
        name: "Operaciones",
        description: "Módulo operativo del superadmin que centraliza la gestión de pagos de suscripciones, la atención de tickets de soporte de los tenants, dashboards de ingresos y estado de pagos, y el registro de auditoría global de todas las acciones realizadas en la plataforma.",
        endpoints: [
            { method: "POST", path: "/api/v1/platform/pagos", summary: "Registrar pago manual", description: "Registra un pago manual de suscripción para un tenant. Al confirmar el pago, el sistema extiende automáticamente la fecha de vencimiento de la suscripción del tenant en 30 días. Se debe especificar el monto, método de pago utilizado y opcionalmente una referencia bancaria.", parameters: [], requestBody: { type: "RegistrarPagoRequest", properties: { tenantId: { type: "integer (int64)", required: true, description: "ID del tenant" }, monto: { type: "number", required: true, description: "Monto del pago" }, metodoPago: { type: "string", required: true, description: "Método de pago usado" }, referencia: { type: "string", required: false, description: "Referencia del pago" } } }, responses: { "200": { description: "OK", schema: "ApiResponsePagoResponse" } } },
            { method: "GET", path: "/api/v1/platform/pagos/{id}/factura", summary: "Obtener factura/detalle del pago", description: "Consulta el detalle completo de un pago registrado incluyendo información del tenant, monto, método de pago, referencia, fecha del pago y el período de suscripción cubierto. Se utiliza para generar y consultar facturas de la plataforma.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del pago" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponsePagoResponse" } } },
            { method: "GET", path: "/api/v1/platform/tickets", summary: "Listar tickets de soporte", description: "Recupera todos los tickets de soporte enviados por los tenants con filtros por estado, prioridad y tenant específico. Soporta paginación. Es la vista principal del panel de soporte del superadmin para gestionar las solicitudes de ayuda de los negocios.", parameters: [{ name: "estado", in: "query", type: "string", required: false, description: "Estado del ticket" }, { name: "prioridad", in: "query", type: "string", required: false, description: "Prioridad" }, { name: "tenantId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por tenant" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Página" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListTicketResponse" } } },
            { method: "GET", path: "/api/v1/platform/tickets/{id}", summary: "Detalle del ticket con respuestas", description: "Consulta la información completa de un ticket de soporte incluyendo los datos del tenant solicitante, el asunto, descripción, prioridad, estado actual y todo el hilo de conversación con las respuestas del tenant y del equipo de soporte ordenadas cronológicamente.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del ticket" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseTicketResponse" } } },
            { method: "PATCH", path: "/api/v1/platform/tickets/{id}", summary: "Cambiar estado / prioridad del ticket", description: "Permite al superadmin actualizar el estado o prioridad de un ticket de soporte. Los estados disponibles son ABIERTO, EN_PROCESO, RESUELTO y CERRADO. Los cambios de estado quedan registrados en el historial del ticket y son visibles para el tenant.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del ticket" }], requestBody: { type: "ActualizarTicketRequest", properties: { estado: { type: "string", required: false, description: "Nuevo estado (ABIERTO, EN_PROCESO, RESUELTO, CERRADO)" }, prioridad: { type: "string", required: false, description: "Nueva prioridad (BAJA, MEDIA, ALTA, URGENTE)" } } }, responses: { "200": { description: "OK", schema: "ApiResponseTicketResponse" } } },
            { method: "POST", path: "/api/v1/platform/tickets/{id}/respuestas", summary: "Responder a ticket desde plataforma", description: "Agrega una respuesta al ticket desde el lado de la plataforma (superadmin). La respuesta queda registrada con el nombre del administrador y es visible para el tenant en su historial de conversación del ticket.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del ticket" }], requestBody: { type: "RespuestaTicketRequest", properties: { mensaje: { type: "string", required: true, description: "Contenido de la respuesta" } } }, responses: { "200": { description: "OK", schema: "ApiResponseTicketResponse" } } },
            { method: "GET", path: "/api/v1/platform/suscripciones/estado-pagos", summary: "Dashboard: al día, por vencer, vencidos", description: "Genera el dashboard de estado de pagos de suscripciones mostrando la cantidad de tenants al día, por vencer (próximos a expirar) y vencidos (suscripción expirada). Permite al superadmin tomar acciones proactivas para retención y cobranza.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseEstadoPagosResponse" } } },
            { method: "GET", path: "/api/v1/platform/dashboard/ingresos", summary: "Dashboard de ingresos", description: "Genera el dashboard de ingresos de la plataforma con métricas globales: ingresos totales, ingresos del mes actual, desglose por plan de suscripción y ranking de los tenants que más aportan. Fundamental para el análisis financiero de la plataforma.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseDashboardIngresosResponse" } } },
            { method: "GET", path: "/api/v1/platform/auditoria", summary: "Logs de auditoría global", description: "Consulta los registros de auditoría global de la plataforma con filtros por tenant, tipo de acción y rango de fechas. Cada registro muestra el usuario que realizó la acción, el tenant afectado, la acción ejecutada, la fecha/hora y detalles adicionales. Esencial para la seguridad y trazabilidad de operaciones.", parameters: [{ name: "tenantId", in: "query", type: "integer (int64)", required: false, description: "Filtrar por tenant" }, { name: "accion", in: "query", type: "string", required: false, description: "Filtrar por acción" }, { name: "fechaDesde", in: "query", type: "string", required: false, description: "Fecha desde" }, { name: "fechaHasta", in: "query", type: "string", required: false, description: "Fecha hasta" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Página" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño de página" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListAuditoriaResponse" } } }
        ]
    },
    platformPlanes: {
        name: "Planes",
        description: "Gestión de planes de suscripción de la plataforma. Cada plan define los límites operativos del tenant (máximo de productos, usuarios, almacenes y ventas por mes) y los módulos funcionales incluidos. Los tenants se suscriben a un plan que determina sus capacidades.",
        endpoints: [
            { method: "GET", path: "/api/v1/platform/planes", summary: "Listar planes con conteo de tenants", description: "Recupera todos los planes de suscripción disponibles con la cantidad de tenants actualmente suscritos a cada uno. Permite al superadmin evaluar la popularidad de cada plan y tomar decisiones comerciales.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListPlanResponse" } } },
            { method: "POST", path: "/api/v1/platform/planes", summary: "Crear plan de suscripción", description: "Crea un nuevo plan de suscripción definiendo su nombre, precio mensual, límites operativos (máximo de productos, usuarios, almacenes y ventas por mes) y los módulos funcionales incluidos. El plan queda disponible para ser asignado a tenants nuevos o existentes.", parameters: [], requestBody: { type: "CrearPlanRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del plan" }, precio: { type: "number", required: true, description: "Precio mensual" }, maxProductos: { type: "integer", required: true, description: "Máximo de productos" }, maxUsuarios: { type: "integer", required: true, description: "Máximo de usuarios" }, maxAlmacenes: { type: "integer", required: true, description: "Máximo de almacenes" }, maxVentasMes: { type: "integer", required: true, description: "Máximo de ventas por mes" }, modulos: { type: "array", required: true, description: "Módulos incluidos" } } }, responses: { "200": { description: "OK", schema: "ApiResponsePlanResponse" } } },
            { method: "PUT", path: "/api/v1/platform/planes/{id}", summary: "Actualizar plan", description: "Modifica las características de un plan existente (nombre, precio, límites, módulos). Los cambios no afectan a los tenants ya suscritos al plan; solo aplican para nuevas suscripciones o renovaciones.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del plan" }], requestBody: { type: "CrearPlanRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del plan" }, precio: { type: "number", required: true, description: "Precio mensual" } } }, responses: { "200": { description: "OK", schema: "ApiResponsePlanResponse" } } },
            { method: "PATCH", path: "/api/v1/platform/planes/{id}/estado", summary: "Activar/desactivar plan", description: "Activa o desactiva un plan de suscripción. Un plan desactivado no aparece como opción para nuevas suscripciones, pero los tenants ya suscritos mantienen sus condiciones hasta la renovación.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del plan" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponsePlanResponse" } } }
        ]
    },
    platformTenants: {
        name: "Tenants",
        description: "Gestión completa de tenants (negocios) de la plataforma. El superadmin puede crear tenants con su usuario administrador y suscripción, consultar métricas de uso, suspender o activar cuentas, asignar o cambiar planes, configurar overrides de límites individuales, gestionar módulos activos y administrar pagos y recordatorios.",
        endpoints: [
            { method: "GET", path: "/api/v1/platform/tenants", summary: "Listar tenants con filtros", description: "Recupera el listado de todos los tenants registrados en la plataforma con filtros por estado (ACTIVA, SUSPENDIDA, TRIAL) y búsqueda por texto libre (nombre, email). Soporta paginación. Es la vista principal de administración de negocios.", parameters: [{ name: "estado", in: "query", type: "string", required: false, description: "Filtrar por estado" }, { name: "q", in: "query", type: "string", required: false, description: "Búsqueda por texto" }, { name: "page", in: "query", type: "integer (int32)", required: false, description: "Página" }, { name: "size", in: "query", type: "integer (int32)", required: false, description: "Tamaño" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListTenantResponse" } } },
            { method: "POST", path: "/api/v1/platform/tenants", summary: "Crear tenant + admin user + suscripción opcional", description: "Crea un nuevo tenant (negocio) en la plataforma junto con su usuario administrador inicial. Opcionalmente se puede asignar un plan de suscripción en el momento de la creación. El usuario administrador recibirá las credenciales proporcionadas para acceder al sistema.", parameters: [], requestBody: { type: "CrearTenantRequest", properties: { nombre: { type: "string", required: true, description: "Nombre del tenant" }, email: { type: "string", required: true, description: "Email del administrador" }, password: { type: "string", required: true, description: "Contraseña del administrador" }, telefono: { type: "string", required: false, description: "Teléfono" }, direccion: { type: "string", required: false, description: "Dirección" }, planId: { type: "integer (int64)", required: false, description: "ID del plan de suscripción" } } }, responses: { "200": { description: "OK", schema: "ApiResponseTenantResponse" } } },
            { method: "GET", path: "/api/v1/platform/tenants/{id}", summary: "Detalle de tenant con plan, métricas", description: "Consulta la información completa de un tenant incluyendo datos de contacto, plan de suscripción asignado con sus límites, métricas de uso actuales (productos creados, usuarios activos, ventas del mes), estado de la suscripción y fecha de vencimiento.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseTenantResponse" } } },
            { method: "PUT", path: "/api/v1/platform/tenants/{id}", summary: "Actualizar datos del tenant + overrides de límites", description: "Modifica los datos del tenant y permite establecer overrides individuales de los límites del plan. Los overrides permiten ampliar o restringir los máximos de productos, usuarios, almacenes o ventas por mes para un tenant específico sin cambiar su plan.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: { type: "ActualizarTenantRequest", properties: { nombre: { type: "string", required: false, description: "Nombre" }, email: { type: "string", required: false, description: "Email" }, telefono: { type: "string", required: false, description: "Teléfono" }, direccion: { type: "string", required: false, description: "Dirección" }, overrideMaxProductos: { type: "integer", required: false, description: "Override máx. productos" }, overrideMaxUsuarios: { type: "integer", required: false, description: "Override máx. usuarios" }, overrideMaxAlmacenes: { type: "integer", required: false, description: "Override máx. almacenes" }, overrideMaxVentasMes: { type: "integer", required: false, description: "Override máx. ventas/mes" } } }, responses: { "200": { description: "OK", schema: "ApiResponseTenantResponse" } } },
            { method: "DELETE", path: "/api/v1/platform/tenants/{id}", summary: "Soft delete del tenant", description: "Elimina lógicamente un tenant de la plataforma. El tenant y todos sus datos se marcan como eliminados pero se conservan en la base de datos. Los usuarios del tenant pierden acceso inmediatamente.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } },
            { method: "PATCH", path: "/api/v1/platform/tenants/{id}/estado", summary: "Suspender/activar tenant", description: "Cambia el estado de un tenant entre ACTIVA y SUSPENDIDA. Al suspender, se debe proporcionar un motivo obligatorio que queda registrado. Los usuarios del tenant suspendido no pueden iniciar sesión hasta que se reactive la cuenta.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: { type: "CambiarEstadoTenantRequest", properties: { estado: { type: "string", required: true, description: "Nuevo estado" }, motivo: { type: "string", required: false, description: "Motivo (obligatorio si SUSPENDIDA)" } } }, responses: { "200": { description: "OK", schema: "ApiResponseTenantResponse" } } },
            { method: "GET", path: "/api/v1/platform/tenants/{id}/modulos", summary: "Módulos activos del tenant", description: "Consulta los módulos funcionales activos de un tenant, resultantes de la combinación del plan de suscripción base más los overrides manuales aplicados. Determina qué secciones del sistema (ventas, inventario, compras, etc.) tiene habilitadas el negocio.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListModuloResponse" } } },
            { method: "PUT", path: "/api/v1/platform/tenants/{id}/modulos", summary: "Override manual de módulos del tenant", description: "Permite al superadmin establecer un override manual de los módulos activos de un tenant, independientemente de lo que incluya su plan de suscripción. Útil para otorgar acceso temporal a módulos premium o restringir módulos por motivos específicos.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: { type: "ActualizarModulosTenantRequest", properties: { modulos: { type: "array", required: true, description: "Lista de módulos a activar" } } }, responses: { "200": { description: "OK", schema: "ApiResponseListModuloResponse" } } },
            { method: "POST", path: "/api/v1/platform/tenants/{id}/suscripcion", summary: "Asignar/cambiar plan a tenant", description: "Asigna un nuevo plan de suscripción a un tenant o cambia el plan actual. Al cambiar de plan, los nuevos límites y módulos se aplican inmediatamente. Si el tenant tenía overrides, estos se mantienen y se suman al nuevo plan.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: { type: "AsignarPlanRequest", properties: { planId: { type: "integer (int64)", required: true, description: "ID del plan" } } }, responses: { "200": { description: "OK", schema: "ApiResponseSuscripcionResponse" } } },
            { method: "POST", path: "/api/v1/platform/tenants/{id}/recordatorio-pago", summary: "Enviar recordatorio de pago al tenant", description: "Envía un recordatorio de pago por email al administrador del tenant. Se utiliza para notificar a los negocios con suscripciones próximas a vencer o vencidas para que realicen la renovación del pago.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseString" } } },
            { method: "GET", path: "/api/v1/platform/tenants/{id}/pagos", summary: "Historial de pagos de un tenant", description: "Recupera el historial completo de pagos realizados por un tenant incluyendo montos, métodos de pago, fechas, referencias y los períodos de suscripción cubiertos por cada pago. Útil para la gestión contable y resolución de disputas.", parameters: [{ name: "id", in: "path", type: "integer (int64)", required: true, description: "ID del tenant" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseListPagoResponse" } } }
        ]
    }
};

// ===================== AUTH =====================

API_DATA.environments.auth.modules = {
    auth: {
        name: "Auth",
        description: "Módulo de autenticación y gestión de sesiones de la API. Proporciona endpoints diferenciados para tres tipos de usuarios: usuarios de negocio (tenant), superadministradores de la plataforma y clientes de la tienda online (storefront). Maneja login, registro, renovación de tokens JWT y gestión de sesiones.",
        endpoints: [
            { method: "POST", path: "/api/v1/auth/login", summary: "Login de usuario tenant", description: "Autentica un usuario de negocio (tenant) mediante sus credenciales de email, contraseña y el ID del tenant al que pertenece. Si las credenciales son válidas, devuelve un par de tokens JWT (access token y refresh token) necesarios para acceder a todos los endpoints protegidos del entorno de Negocios.", parameters: [], requestBody: { type: "LoginRequest", properties: { email: { type: "string", required: true, description: "Email del usuario" }, password: { type: "string", required: true, description: "Contraseña" }, tenantId: { type: "integer (int64)", required: true, description: "ID del tenant" } } }, responses: { "200": { description: "OK", schema: "ApiResponseAuthResponse" } } },
            { method: "POST", path: "/api/v1/auth/register", summary: "Generar token de acceso para probar endpoints", description: "Genera un token de acceso temporal exclusivamente para pruebas de la API. A diferencia del login real, este endpoint no crea datos en la base de datos ni requiere credenciales válidas. Solo necesita un email y un tenantId para generar el token. Ideal para desarrolladores que necesitan probar endpoints rápidamente.", parameters: [], requestBody: { type: "RegisterRequest", properties: { email: { type: "string", required: true, description: "Email" }, tenantId: { type: "integer (int64)", required: true, description: "ID del tenant" } } }, responses: { "200": { description: "OK", schema: "ApiResponseAuthResponse" } } },
            { method: "POST", path: "/api/v1/auth/refresh", summary: "Renovar access token", description: "Renueva el access token expirado utilizando un refresh token válido. Cuando el access token caduca, este endpoint permite obtener uno nuevo sin necesidad de volver a autenticarse con credenciales. El refresh token tiene una vida útil más larga que el access token.", parameters: [], requestBody: { type: "RefreshRequest", properties: { refreshToken: { type: "string", required: true, description: "Refresh token válido" } } }, responses: { "200": { description: "OK", schema: "ApiResponseAuthResponse" } } },
            { method: "POST", path: "/api/v1/auth/logout", summary: "Invalidar token actual", description: "Invalida el token de sesión actual del usuario, cerrando efectivamente su sesión. Una vez invalidado, el token no puede volver a utilizarse para acceder a endpoints protegidos. El usuario deberá iniciar sesión nuevamente para obtener un nuevo token.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseVoid" } } },
            { method: "GET", path: "/api/v1/auth/me", summary: "Información del usuario autenticado", description: "Devuelve la información completa del usuario actualmente autenticado, incluyendo su nombre, email, rol, permisos y datos del tenant al que pertenece. Útil para que el frontend muestre los datos del perfil y determine qué opciones mostrar según el rol.", parameters: [], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseUserInfoResponse" } } },
            { method: "GET", path: "/api/v1/auth/check-email", summary: "Verificar si email está registrado", description: "Verifica si una dirección de email ya se encuentra registrada en el sistema. Devuelve un booleano indicando la existencia del email. Se utiliza típicamente en formularios de registro para validar en tiempo real si el email está disponible antes de completar el registro.", parameters: [{ name: "email", in: "query", type: "string", required: true, description: "Email a verificar" }], requestBody: null, responses: { "200": { description: "OK", schema: "ApiResponseMapStringBoolean" } } },
            { method: "POST", path: "/api/v1/platform/auth/login", summary: "Login de superadmin (plataforma)", description: "Autentica a un superadministrador de la plataforma mediante email y contraseña. Los superadmins tienen acceso al panel de administración global donde pueden gestionar tenants, planes de suscripción, pagos, tickets de soporte y auditoría. Este endpoint es independiente del login de tenants.", parameters: [], requestBody: { type: "PlatformLoginRequest", properties: { email: { type: "string", required: true, description: "Email del superadmin" }, password: { type: "string", required: true, description: "Contraseña" } } }, responses: { "200": { description: "OK", schema: "ApiResponseAuthResponse" } } },
            { method: "POST", path: "/api/v1/storefront/auth/login", summary: "Login de cliente tienda (storefront)", description: "Autentica a un cliente registrado en la tienda online (storefront) de un tenant específico. El cliente debe proporcionar su email, contraseña y el ID del tenant cuya tienda desea acceder. Devuelve tokens JWT para acceder a los endpoints del storefront.", parameters: [], requestBody: { type: "StorefrontLoginRequest", properties: { email: { type: "string", required: true, description: "Email del cliente" }, password: { type: "string", required: true, description: "Contraseña" }, tenantId: { type: "integer (int64)", required: true, description: "ID del tenant" } } }, responses: { "200": { description: "OK", schema: "ApiResponseAuthResponse" } } },
            { method: "POST", path: "/api/v1/storefront/auth/register", summary: "Registrar nuevo cliente B2C", description: "Registra un nuevo cliente en la tienda online (B2C) de un tenant específico. El cliente debe proporcionar sus datos personales (nombre, apellido, email) y una contraseña de al menos 8 caracteres. Una vez registrado, el cliente puede iniciar sesión y realizar compras en la tienda del tenant.", parameters: [], requestBody: { type: "StorefrontRegisterRequest", properties: { email: { type: "string", required: true, description: "Email del cliente" }, password: { type: "string (min 8)", required: true, description: "Contraseña" }, nombre: { type: "string", required: true, description: "Nombre" }, apellido: { type: "string", required: true, description: "Apellido" }, tenantId: { type: "integer (int64)", required: true, description: "ID del tenant" } } }, responses: { "200": { description: "OK", schema: "ApiResponseAuthResponse" } } }
        ]
    }
};
