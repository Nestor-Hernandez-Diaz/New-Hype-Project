-- ============================================================================
-- NEW HYPE PROJECT - SCHEMA FINAL ACTUALIZADO (49 tablas)
-- ERP SaaS Multi-Tenant para Tiendas de Ropa y Accesorios
-- Incluye las 6 correcciones aprobadas en auditoría QA (2026-02-12)
-- Target: MySQL 8.0 / MariaDB 10.11 (Compatible con XAMPP/phpMyAdmin)
-- Fecha original: 2026-02-11 | Actualizado: 2026-02-12
-- ============================================================================
-- CONVENCIONES:
--   PK: id BIGINT AUTO_INCREMENT
--   FK: entidad_id (snake_case)
--   Auditoría: estado, created_at, updated_at
--   Multi-tenant: tenant_id en todas las tablas de negocio
--   Dinero: DECIMAL(10,2) - NUNCA FLOAT/DOUBLE
-- ============================================================================
-- CORRECCIONES APLICADAS (Auditoría QA 2026-02-12):
--   1. tenants.ultima_actividad DATETIME (RF-SUP-002, RF-SUP-003)
--   2. suscripciones.override_max_* x4 columnas (RF-SUP-004)
--   3. Nueva tabla modulos_tenant (RF-SUP-007)
--   4. productos.imagen_url VARCHAR(500) (RF-PRD-001)
--   5. Nueva tabla imagenes_producto (galería multi-imagen)
--   6. productos.slug + categorias.slug + índices (preparación B2C)
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- SECCIÓN 1: TABLAS DE PLATAFORMA (SaaS Global - sin tenant_id)
-- ============================================================================

-- 1.1 Planes de suscripción
CREATE TABLE planes_suscripcion (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(50)     NOT NULL,
    descripcion     TEXT,
    precio_mensual  DECIMAL(10,2)   NOT NULL,
    precio_anual    DECIMAL(10,2),
    max_productos   INT             DEFAULT 0 COMMENT '0 = ilimitado',
    max_usuarios    INT             DEFAULT 0,
    max_almacenes   INT             DEFAULT 0,
    max_ventas_mes  INT             DEFAULT 0,
    periodo_prueba_dias INT         DEFAULT 0,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.2 Módulos del sistema
CREATE TABLE modulos_sistema (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    codigo          VARCHAR(10)     NOT NULL,
    nombre          VARCHAR(50)     NOT NULL,
    descripcion     TEXT,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_modulos_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.3 Módulos incluidos por plan (M:N)
CREATE TABLE modulos_plan (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    plan_id         BIGINT          NOT NULL,
    modulo_id       BIGINT          NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_plan_modulo (plan_id, modulo_id),
    CONSTRAINT fk_mp_plan FOREIGN KEY (plan_id) REFERENCES planes_suscripcion(id),
    CONSTRAINT fk_mp_modulo FOREIGN KEY (modulo_id) REFERENCES modulos_sistema(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.3b Módulos habilitados por tenant (override manual del Superadmin)
CREATE TABLE modulos_tenant (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    modulo_id       BIGINT          NOT NULL,
    activo          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_modtenant (tenant_id, modulo_id),
    CONSTRAINT fk_modtenant_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_modtenant_modulo FOREIGN KEY (modulo_id) REFERENCES modulos_sistema(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.4 Tenants (tiendas)
CREATE TABLE tenants (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(150)    NOT NULL,
    subdominio      VARCHAR(50)     NOT NULL,
    propietario_nombre VARCHAR(200) NOT NULL,
    propietario_tipo_documento VARCHAR(10) NOT NULL COMMENT 'DNI o RUC',
    propietario_numero_documento VARCHAR(20) NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    telefono        VARCHAR(20),
    direccion       TEXT,
    estado          ENUM('ACTIVA','SUSPENDIDA','ELIMINADA') DEFAULT 'ACTIVA',
    motivo_suspension TEXT,
    ultima_actividad DATETIME        NULL COMMENT 'Denormalizado: se actualiza via app-layer en cada accion del tenant',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME        NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenants_subdominio (subdominio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.5 Suscripciones
CREATE TABLE suscripciones (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    plan_id         BIGINT          NOT NULL,
    fecha_inicio    DATE            NOT NULL,
    fecha_fin       DATE            NOT NULL,
    estado          ENUM('ACTIVA','VENCIDA','CANCELADA') DEFAULT 'ACTIVA',
    auto_renovar    TINYINT(1)      DEFAULT 1,
    -- Overrides por tenant (si NULL, usa el valor del plan)
    override_max_productos  INT     NULL COMMENT 'Si NULL, usa el del plan',
    override_max_usuarios   INT     NULL COMMENT 'Si NULL, usa el del plan',
    override_max_almacenes  INT     NULL COMMENT 'Si NULL, usa el del plan',
    override_max_ventas_mes INT     NULL COMMENT 'Si NULL, usa el del plan',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_susc_tenant (tenant_id),
    INDEX idx_susc_estado (estado),
    CONSTRAINT fk_susc_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_susc_plan FOREIGN KEY (plan_id) REFERENCES planes_suscripcion(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.6 Cupones de descuento
CREATE TABLE cupones (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    codigo          VARCHAR(50)     NOT NULL,
    tipo_descuento  ENUM('PORCENTAJE','MONTO_FIJO') NOT NULL,
    valor_descuento DECIMAL(10,2)   NOT NULL,
    fecha_expiracion DATE,
    usos_maximos    INT             DEFAULT 0 COMMENT '0 = ilimitado',
    usos_actuales   INT             DEFAULT 0,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cupones_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.7 Pagos de suscripción
CREATE TABLE pagos_suscripcion (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    suscripcion_id  BIGINT          NOT NULL,
    tenant_id       BIGINT          NOT NULL,
    monto           DECIMAL(10,2)   NOT NULL,
    metodo_pago     VARCHAR(50),
    referencia_transaccion VARCHAR(200),
    fecha_pago      DATETIME        NOT NULL,
    periodo_inicio  DATE            NOT NULL,
    periodo_fin     DATE            NOT NULL,
    cupon_id        BIGINT          NULL,
    descuento_aplicado DECIMAL(10,2) DEFAULT 0,
    estado          ENUM('PENDIENTE','CONFIRMADO','RECHAZADO') DEFAULT 'PENDIENTE',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_pagos_tenant (tenant_id),
    CONSTRAINT fk_pagos_susc FOREIGN KEY (suscripcion_id) REFERENCES suscripciones(id),
    CONSTRAINT fk_pagos_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_pagos_cupon FOREIGN KEY (cupon_id) REFERENCES cupones(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.8 Usuarios de plataforma (Superadmin)
CREATE TABLE usuarios_plataforma (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    email           VARCHAR(150)    NOT NULL,
    username        VARCHAR(50)     NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    nombre_completo VARCHAR(200)    NOT NULL,
    tiene_2fa       TINYINT(1)      DEFAULT 0,
    secreto_2fa     VARCHAR(100),
    ultimo_acceso   DATETIME,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_uplat_email (email),
    UNIQUE KEY uk_uplat_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.9 Tickets de soporte
CREATE TABLE tickets_soporte (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    usuario_plataforma_id BIGINT    NULL COMMENT 'Quién atendió',
    asunto          VARCHAR(200)    NOT NULL,
    descripcion     TEXT            NOT NULL,
    prioridad       ENUM('BAJA','MEDIA','ALTA','CRITICA') DEFAULT 'MEDIA',
    estado          ENUM('ABIERTO','EN_PROCESO','CERRADO') DEFAULT 'ABIERTO',
    respuesta       TEXT,
    fecha_respuesta DATETIME,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_tickets_tenant (tenant_id),
    INDEX idx_tickets_estado (estado),
    CONSTRAINT fk_tickets_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_tickets_uplat FOREIGN KEY (usuario_plataforma_id) REFERENCES usuarios_plataforma(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.10 Auditoría de plataforma
CREATE TABLE auditoria_plataforma (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    usuario_plataforma_id BIGINT    NULL,
    tenant_id       BIGINT          NULL,
    accion          VARCHAR(100)    NOT NULL,
    detalle         TEXT,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_audplat_fecha (created_at),
    CONSTRAINT fk_audplat_uplat FOREIGN KEY (usuario_plataforma_id) REFERENCES usuarios_plataforma(id),
    CONSTRAINT fk_audplat_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 2: DATOS DE REFERENCIA GLOBAL (Ubigeo Perú)
-- ============================================================================

CREATE TABLE departamentos (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    codigo          VARCHAR(6)      NOT NULL,
    nombre          VARCHAR(100)    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_dep_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE provincias (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    codigo          VARCHAR(6)      NOT NULL,
    nombre          VARCHAR(100)    NOT NULL,
    departamento_id BIGINT          NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_prov_codigo (codigo),
    CONSTRAINT fk_prov_dep FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE distritos (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    codigo          VARCHAR(6)      NOT NULL,
    nombre          VARCHAR(100)    NOT NULL,
    provincia_id    BIGINT          NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_dist_codigo (codigo),
    CONSTRAINT fk_dist_prov FOREIGN KEY (provincia_id) REFERENCES provincias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 3: TABLAS DE TENANT - Configuración
-- ============================================================================

-- 3.1 Configuración de empresa (una por tenant)
CREATE TABLE configuracion_empresa (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    ruc             VARCHAR(11)     NOT NULL,
    razon_social    VARCHAR(200)    NOT NULL,
    nombre_comercial VARCHAR(200),
    direccion       TEXT            NOT NULL,
    telefono        VARCHAR(20),
    email           VARCHAR(150),
    website         VARCHAR(200),
    logo_url        VARCHAR(500),
    departamento    VARCHAR(100),
    provincia       VARCHAR(100),
    distrito        VARCHAR(100),
    -- Configuración fiscal
    igv_activo      TINYINT(1)      DEFAULT 1,
    igv_porcentaje  DECIMAL(5,2)    DEFAULT 18.00,
    moneda          VARCHAR(3)      DEFAULT 'PEN',
    -- SUNAT (facturación electrónica)
    sunat_usuario   VARCHAR(100),
    sunat_clave     VARCHAR(200)    COMMENT 'Almacenar cifrado',
    sunat_servidor  ENUM('HOMOLOGACION','PRODUCCION') DEFAULT 'HOMOLOGACION',
    -- Política de devoluciones
    dias_devolucion_boleta   INT    DEFAULT 7,
    dias_devolucion_factura  INT    DEFAULT 30,
    requiere_etiquetas_originales TINYINT(1) DEFAULT 1,
    requiere_producto_sin_uso     TINYINT(1) DEFAULT 1,
    dias_vigencia_vale       INT    DEFAULT 90,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_confempresa_tenant (tenant_id),
    CONSTRAINT fk_confempresa_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.2 Roles por tenant
CREATE TABLE roles (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    nombre          VARCHAR(50)     NOT NULL,
    descripcion     TEXT,
    permisos        JSON            COMMENT 'Array de strings: ["VENTAS_CREAR","INVENTARIO_VER",...]',
    es_sistema      TINYINT(1)      DEFAULT 0 COMMENT 'Roles protegidos que no se pueden eliminar',
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_roles_tenant_nombre (tenant_id, nombre),
    CONSTRAINT fk_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.3 Usuarios de tenant
CREATE TABLE usuarios (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    rol_id          BIGINT          NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    username        VARCHAR(50)     NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    nombre          VARCHAR(100)    NOT NULL,
    apellido        VARCHAR(100)    NOT NULL,
    ultimo_acceso   DATETIME,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuarios_tenant_email (tenant_id, email),
    UNIQUE KEY uk_usuarios_tenant_username (tenant_id, username),
    CONSTRAINT fk_usuarios_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.4 Almacenes
CREATE TABLE almacenes (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    nombre          VARCHAR(100)    NOT NULL,
    ubicacion       VARCHAR(200),
    capacidad       INT,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_almacenes_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_almacenes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.5 Cajas registradoras
CREATE TABLE cajas_registradoras (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    nombre          VARCHAR(100)    NOT NULL,
    ubicacion       VARCHAR(200),
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cajas_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_cajas_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.6 Series de comprobantes (SUNAT)
CREATE TABLE series_comprobantes (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    tipo_comprobante ENUM('BOLETA','FACTURA','NOTA_CREDITO','NOTA_DEBITO','GUIA_REMISION') NOT NULL,
    serie           VARCHAR(4)      NOT NULL COMMENT 'Ej: B001, F001, NC01',
    numero_actual   INT             DEFAULT 0,
    numero_inicio   INT             DEFAULT 1,
    numero_fin      INT             DEFAULT 99999999,
    punto_emision   VARCHAR(50),
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_series_tenant_tipo_serie (tenant_id, tipo_comprobante, serie),
    CONSTRAINT fk_series_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.7 Métodos de pago configurados
CREATE TABLE metodos_pago (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    nombre          VARCHAR(50)     NOT NULL,
    descripcion     TEXT,
    tipo            VARCHAR(30)     NOT NULL COMMENT 'EFECTIVO, TARJETA, TRANSFERENCIA, DIGITAL',
    requiere_referencia TINYINT(1)  DEFAULT 0,
    predeterminado  TINYINT(1)      DEFAULT 0,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_metpago_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_metpago_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.8 Motivos de movimiento de inventario
CREATE TABLE motivos_movimiento (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    tipo            ENUM('ENTRADA','SALIDA','AJUSTE') NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    nombre          VARCHAR(100)    NOT NULL,
    descripcion     TEXT,
    requiere_documento TINYINT(1)   DEFAULT 0,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_motmov_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_motmov_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 4: TABLAS DE TENANT - Catálogos Maestros (Ropa y Accesorios)
-- ============================================================================

CREATE TABLE categorias (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    nombre          VARCHAR(100)    NOT NULL,
    slug            VARCHAR(120)    NULL,
    descripcion     TEXT,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cat_tenant_codigo (tenant_id, codigo),
    INDEX idx_cat_slug (tenant_id, slug),
    CONSTRAINT fk_cat_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tallas (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(10)     NOT NULL COMMENT 'XS, S, M, L, XL, XXL, UNICO',
    descripcion     VARCHAR(50)     NOT NULL,
    orden_visualizacion INT         DEFAULT 0,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tallas_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_tallas_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE colores (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    nombre          VARCHAR(50)     NOT NULL,
    codigo_hex      VARCHAR(7)      COMMENT '#FF0000',
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_colores_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_colores_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marcas (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    nombre          VARCHAR(100)    NOT NULL,
    logo_url        VARCHAR(500),
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_marcas_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_marcas_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE materiales (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    descripcion     VARCHAR(100)    NOT NULL,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_mat_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_mat_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE generos (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(10)     NOT NULL COMMENT 'H, M, U, N',
    descripcion     VARCHAR(50)     NOT NULL COMMENT 'Hombre, Mujer, Unisex, Niño',
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_gen_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_gen_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE unidades_medida (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(10)     NOT NULL,
    nombre          VARCHAR(50)     NOT NULL,
    simbolo         VARCHAR(10),
    descripcion     TEXT,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_um_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_um_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 5: TABLAS DE TENANT - Entidades Comerciales
-- ============================================================================

CREATE TABLE entidades_comerciales (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    tipo_entidad    ENUM('CLIENTE','PROVEEDOR','AMBOS') DEFAULT 'CLIENTE',
    tipo_documento  VARCHAR(10)     NOT NULL COMMENT 'DNI, RUC, CE, PASAPORTE',
    numero_documento VARCHAR(20)    NOT NULL,
    nombres         VARCHAR(100),
    apellidos       VARCHAR(100),
    razon_social    VARCHAR(200)    COMMENT 'Para proveedores con RUC',
    email           VARCHAR(150),
    telefono        VARCHAR(20),
    direccion       TEXT,
    departamento_id BIGINT          NULL,
    provincia_id    BIGINT          NULL,
    distrito_id     BIGINT          NULL,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ent_tenant_doc (tenant_id, tipo_documento, numero_documento),
    INDEX idx_ent_tipo (tenant_id, tipo_entidad),
    CONSTRAINT fk_ent_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_ent_dep FOREIGN KEY (departamento_id) REFERENCES departamentos(id),
    CONSTRAINT fk_ent_prov FOREIGN KEY (provincia_id) REFERENCES provincias(id),
    CONSTRAINT fk_ent_dist FOREIGN KEY (distrito_id) REFERENCES distritos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 6: TABLAS DE TENANT - Productos
-- ============================================================================

CREATE TABLE productos (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    sku             VARCHAR(50)     NOT NULL,
    nombre          VARCHAR(200)    NOT NULL,
    slug            VARCHAR(250)    NULL,
    descripcion     TEXT,
    categoria_id    BIGINT          NULL,
    talla_id        BIGINT          NULL,
    color_id        BIGINT          NULL,
    marca_id        BIGINT          NULL,
    material_id     BIGINT          NULL,
    genero_id       BIGINT          NULL,
    unidad_medida_id BIGINT         NULL,
    codigo_barras   VARCHAR(20)     COMMENT 'EAN-13',
    imagen_url      VARCHAR(500)    NULL COMMENT 'URL de la imagen principal del producto',
    precio_costo    DECIMAL(10,2)   NOT NULL DEFAULT 0,
    precio_venta    DECIMAL(10,2)   NOT NULL,
    stock_minimo    INT             DEFAULT 0,
    controla_inventario TINYINT(1)  DEFAULT 1,
    -- Liquidación
    en_liquidacion  TINYINT(1)      DEFAULT 0,
    porcentaje_liquidacion DECIMAL(5,2) DEFAULT 0,
    fecha_inicio_liquidacion DATE   NULL,
    fecha_fin_liquidacion    DATE   NULL,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_prod_tenant_sku (tenant_id, sku),
    INDEX idx_prod_barras (tenant_id, codigo_barras),
    INDEX idx_prod_categoria (tenant_id, categoria_id),
    INDEX idx_prod_estado (tenant_id, estado),
    INDEX idx_prod_slug (tenant_id, slug),
    CONSTRAINT fk_prod_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_prod_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT fk_prod_talla FOREIGN KEY (talla_id) REFERENCES tallas(id),
    CONSTRAINT fk_prod_color FOREIGN KEY (color_id) REFERENCES colores(id),
    CONSTRAINT fk_prod_marca FOREIGN KEY (marca_id) REFERENCES marcas(id),
    CONSTRAINT fk_prod_material FOREIGN KEY (material_id) REFERENCES materiales(id),
    CONSTRAINT fk_prod_genero FOREIGN KEY (genero_id) REFERENCES generos(id),
    CONSTRAINT fk_prod_um FOREIGN KEY (unidad_medida_id) REFERENCES unidades_medida(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6.2 Imágenes de producto (galería multi-imagen)
CREATE TABLE imagenes_producto (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    producto_id     BIGINT          NOT NULL,
    url             VARCHAR(500)    NOT NULL,
    alt_text        VARCHAR(200),
    orden           INT             DEFAULT 0,
    es_principal    TINYINT(1)      DEFAULT 0,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_imgprod_producto (producto_id),
    CONSTRAINT fk_imgprod_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 7: TABLAS DE TENANT - Inventario y Kardex
-- ============================================================================

-- 7.1 Stock por almacén
CREATE TABLE stock_almacen (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    producto_id     BIGINT          NOT NULL,
    almacen_id      BIGINT          NOT NULL,
    cantidad        INT             DEFAULT 0,
    stock_minimo    INT             DEFAULT 0,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_stock_tenant_prod_alm (tenant_id, producto_id, almacen_id),
    CONSTRAINT fk_stock_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_stock_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
    CONSTRAINT fk_stock_almacen FOREIGN KEY (almacen_id) REFERENCES almacenes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.2 Movimientos de inventario (Kardex)
CREATE TABLE movimientos_inventario (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    producto_id     BIGINT          NOT NULL,
    almacen_id      BIGINT          NOT NULL,
    tipo            ENUM('ENTRADA','SALIDA','AJUSTE_INGRESO','AJUSTE_EGRESO') NOT NULL,
    cantidad        INT             NOT NULL,
    stock_antes     INT             NOT NULL,
    stock_despues   INT             NOT NULL,
    motivo_id       BIGINT          NULL,
    documento_referencia VARCHAR(100) COMMENT 'VEN-xxx, OC-xxx, TRF-xxx',
    usuario_id      BIGINT          NULL,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_movinv_tenant_prod (tenant_id, producto_id),
    INDEX idx_movinv_tenant_alm (tenant_id, almacen_id),
    INDEX idx_movinv_fecha (tenant_id, created_at),
    CONSTRAINT fk_movinv_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_movinv_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
    CONSTRAINT fk_movinv_almacen FOREIGN KEY (almacen_id) REFERENCES almacenes(id),
    CONSTRAINT fk_movinv_motivo FOREIGN KEY (motivo_id) REFERENCES motivos_movimiento(id),
    CONSTRAINT fk_movinv_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.3 Transferencias entre almacenes (cabecera)
CREATE TABLE transferencias (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    almacen_origen_id  BIGINT       NOT NULL,
    almacen_destino_id BIGINT       NOT NULL,
    motivo          TEXT,
    solicitado_por_id  BIGINT       NOT NULL,
    aprobado_por_id    BIGINT       NULL,
    fecha_aprobacion   DATETIME     NULL,
    recibido_por_id    BIGINT       NULL,
    fecha_recepcion    DATETIME     NULL,
    estado          ENUM('PENDIENTE','APROBADA','CANCELADA') DEFAULT 'PENDIENTE',
    observaciones   TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_transf_tenant_codigo (tenant_id, codigo),
    INDEX idx_transf_estado (tenant_id, estado),
    CONSTRAINT fk_transf_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_transf_alm_orig FOREIGN KEY (almacen_origen_id) REFERENCES almacenes(id),
    CONSTRAINT fk_transf_alm_dest FOREIGN KEY (almacen_destino_id) REFERENCES almacenes(id),
    CONSTRAINT fk_transf_solicitante FOREIGN KEY (solicitado_por_id) REFERENCES usuarios(id),
    CONSTRAINT fk_transf_aprobador FOREIGN KEY (aprobado_por_id) REFERENCES usuarios(id),
    CONSTRAINT fk_transf_receptor FOREIGN KEY (recibido_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.4 Detalle de transferencias
CREATE TABLE detalle_transferencias (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    transferencia_id BIGINT         NOT NULL,
    producto_id     BIGINT          NOT NULL,
    cantidad        INT             NOT NULL,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_dettransf_transferencia FOREIGN KEY (transferencia_id) REFERENCES transferencias(id),
    CONSTRAINT fk_dettransf_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 8: TABLAS DE TENANT - Compras
-- ============================================================================

-- 8.1 Órdenes de compra
CREATE TABLE ordenes_compra (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    proveedor_id    BIGINT          NOT NULL,
    almacen_destino_id BIGINT       NOT NULL,
    usuario_id      BIGINT          NOT NULL,
    fecha_emision   DATE            NOT NULL,
    fecha_entrega_estimada DATE,
    condiciones_pago VARCHAR(200),
    forma_pago      VARCHAR(50),
    moneda          VARCHAR(3)      DEFAULT 'PEN',
    subtotal        DECIMAL(10,2)   DEFAULT 0,
    descuento       DECIMAL(10,2)   DEFAULT 0,
    igv             DECIMAL(10,2)   DEFAULT 0,
    total           DECIMAL(10,2)   DEFAULT 0,
    estado          ENUM('PENDIENTE','ENVIADA','CONFIRMADA','EN_RECEPCION','PARCIAL','COMPLETADA','CANCELADA') DEFAULT 'PENDIENTE',
    observaciones   TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_oc_tenant_codigo (tenant_id, codigo),
    INDEX idx_oc_estado (tenant_id, estado),
    INDEX idx_oc_proveedor (tenant_id, proveedor_id),
    CONSTRAINT fk_oc_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_oc_proveedor FOREIGN KEY (proveedor_id) REFERENCES entidades_comerciales(id),
    CONSTRAINT fk_oc_almacen FOREIGN KEY (almacen_destino_id) REFERENCES almacenes(id),
    CONSTRAINT fk_oc_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8.2 Detalle de órdenes de compra
CREATE TABLE detalle_ordenes_compra (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    orden_compra_id BIGINT          NOT NULL,
    producto_id     BIGINT          NOT NULL,
    cantidad_ordenada INT           NOT NULL,
    cantidad_recibida INT           DEFAULT 0,
    precio_unitario DECIMAL(10,2)   NOT NULL,
    descuento       DECIMAL(10,2)   DEFAULT 0,
    subtotal        DECIMAL(10,2)   NOT NULL,
    igv             DECIMAL(10,2)   NOT NULL,
    total           DECIMAL(10,2)   NOT NULL,
    observaciones   TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_detoc_orden FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id),
    CONSTRAINT fk_detoc_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8.3 Recepciones de compra
CREATE TABLE recepciones_compra (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    orden_compra_id BIGINT          NOT NULL,
    almacen_id      BIGINT          NOT NULL,
    recibido_por_id BIGINT          NOT NULL,
    fecha_recepcion DATETIME        NOT NULL,
    guia_remision   VARCHAR(50),
    es_recepcion_completa TINYINT(1) DEFAULT 0,
    observaciones   TEXT,
    estado          ENUM('PENDIENTE','CONFIRMADA','CANCELADA') DEFAULT 'PENDIENTE',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_rec_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_rec_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_rec_oc FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id),
    CONSTRAINT fk_rec_almacen FOREIGN KEY (almacen_id) REFERENCES almacenes(id),
    CONSTRAINT fk_rec_usuario FOREIGN KEY (recibido_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8.4 Detalle de recepciones de compra
CREATE TABLE detalle_recepciones_compra (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    recepcion_id    BIGINT          NOT NULL,
    detalle_orden_compra_id BIGINT  NOT NULL,
    producto_id     BIGINT          NOT NULL,
    cantidad_recibida  INT          NOT NULL,
    cantidad_aceptada  INT          NOT NULL,
    cantidad_rechazada INT          DEFAULT 0,
    motivo_rechazo  TEXT,
    observaciones   TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_detrec_recepcion FOREIGN KEY (recepcion_id) REFERENCES recepciones_compra(id),
    CONSTRAINT fk_detrec_detoc FOREIGN KEY (detalle_orden_compra_id) REFERENCES detalle_ordenes_compra(id),
    CONSTRAINT fk_detrec_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 9: TABLAS DE TENANT - Ventas y POS
-- ============================================================================

-- 9.1 Sesiones de caja
CREATE TABLE sesiones_caja (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    caja_registradora_id BIGINT     NOT NULL,
    usuario_id      BIGINT          NOT NULL,
    fecha_apertura  DATETIME        NOT NULL,
    fecha_cierre    DATETIME,
    monto_apertura  DECIMAL(10,2)   DEFAULT 0,
    monto_cierre    DECIMAL(10,2),
    total_ventas    DECIMAL(10,2)   DEFAULT 0,
    diferencia      DECIMAL(10,2),
    estado          ENUM('ABIERTA','CERRADA') DEFAULT 'ABIERTA',
    observaciones   TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_sesion_tenant_estado (tenant_id, estado),
    CONSTRAINT fk_sesion_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_sesion_caja FOREIGN KEY (caja_registradora_id) REFERENCES cajas_registradoras(id),
    CONSTRAINT fk_sesion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9.2 Movimientos de caja
CREATE TABLE movimientos_caja (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    sesion_caja_id  BIGINT          NOT NULL,
    tipo            ENUM('INGRESO','EGRESO') NOT NULL,
    monto           DECIMAL(10,2)   NOT NULL,
    motivo          VARCHAR(200)    NOT NULL,
    descripcion     TEXT,
    usuario_id      BIGINT          NOT NULL,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_movcaja_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_movcaja_sesion FOREIGN KEY (sesion_caja_id) REFERENCES sesiones_caja(id),
    CONSTRAINT fk_movcaja_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9.3 Ventas (cabecera)
CREATE TABLE ventas (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo_venta    VARCHAR(30)     NOT NULL,
    sesion_caja_id  BIGINT          NULL,
    cliente_id      BIGINT          NULL,
    almacen_id      BIGINT          NOT NULL,
    usuario_id      BIGINT          NOT NULL,
    fecha_emision   DATETIME        NOT NULL,
    -- Comprobante SUNAT
    tipo_comprobante ENUM('BOLETA','FACTURA','NOTA_VENTA') DEFAULT 'BOLETA',
    serie           VARCHAR(4),
    numero          VARCHAR(8),
    -- Montos
    subtotal        DECIMAL(10,2)   DEFAULT 0,
    igv             DECIMAL(10,2)   DEFAULT 0,
    descuento       DECIMAL(10,2)   DEFAULT 0,
    total           DECIMAL(10,2)   DEFAULT 0,
    monto_recibido  DECIMAL(10,2)   DEFAULT 0,
    monto_cambio    DECIMAL(10,2)   DEFAULT 0,
    -- Estado
    estado          ENUM('PENDIENTE','COMPLETADA','CANCELADA') DEFAULT 'PENDIENTE',
    fecha_pago      DATETIME,
    observaciones   TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ventas_tenant_codigo (tenant_id, codigo_venta),
    INDEX idx_ventas_fecha (tenant_id, fecha_emision),
    INDEX idx_ventas_estado (tenant_id, estado),
    INDEX idx_ventas_cliente (tenant_id, cliente_id),
    CONSTRAINT fk_ventas_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_ventas_sesion FOREIGN KEY (sesion_caja_id) REFERENCES sesiones_caja(id),
    CONSTRAINT fk_ventas_cliente FOREIGN KEY (cliente_id) REFERENCES entidades_comerciales(id),
    CONSTRAINT fk_ventas_almacen FOREIGN KEY (almacen_id) REFERENCES almacenes(id),
    CONSTRAINT fk_ventas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9.4 Detalle de ventas
CREATE TABLE detalle_ventas (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    venta_id        BIGINT          NOT NULL,
    producto_id     BIGINT          NOT NULL,
    nombre_producto VARCHAR(200)    NOT NULL COMMENT 'Snapshot al momento de la venta',
    cantidad        INT             NOT NULL,
    precio_unitario DECIMAL(10,2)   NOT NULL,
    descuento       DECIMAL(10,2)   DEFAULT 0,
    subtotal        DECIMAL(10,2)   NOT NULL,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_detven_producto (producto_id),
    CONSTRAINT fk_detven_venta FOREIGN KEY (venta_id) REFERENCES ventas(id),
    CONSTRAINT fk_detven_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9.5 Pagos de venta (soporte multi-pago)
CREATE TABLE pagos_venta (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    venta_id        BIGINT          NOT NULL,
    metodo_pago_id  BIGINT          NOT NULL,
    monto           DECIMAL(10,2)   NOT NULL,
    referencia      VARCHAR(100),
    observaciones   TEXT,
    orden           INT             DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_pagovent_venta FOREIGN KEY (venta_id) REFERENCES ventas(id),
    CONSTRAINT fk_pagovent_metodo FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9.6 Notas de crédito
CREATE TABLE notas_credito (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    codigo          VARCHAR(30)     NOT NULL,
    venta_origen_id BIGINT          NOT NULL,
    -- Comprobante SUNAT
    serie           VARCHAR(4)      NOT NULL,
    numero          VARCHAR(8)      NOT NULL,
    motivo_sunat    VARCHAR(5)      NOT NULL COMMENT 'Código SUNAT 01-13',
    tipo            ENUM('ANULACION','DESCUENTO','DEVOLUCION','CORRECCION') NOT NULL,
    descripcion     TEXT,
    -- Montos
    subtotal        DECIMAL(10,2)   DEFAULT 0,
    igv             DECIMAL(10,2)   DEFAULT 0,
    total           DECIMAL(10,2)   DEFAULT 0,
    -- Devolución
    metodo_devolucion ENUM('EFECTIVO','TRANSFERENCIA','VALE') DEFAULT 'VALE',
    fecha_reembolso DATETIME,
    usuario_id      BIGINT          NOT NULL,
    estado          ENUM('PENDIENTE','APLICADA','CANCELADA') DEFAULT 'PENDIENTE',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_nc_tenant_codigo (tenant_id, codigo),
    CONSTRAINT fk_nc_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_nc_venta FOREIGN KEY (venta_origen_id) REFERENCES ventas(id),
    CONSTRAINT fk_nc_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9.7 Detalle de notas de crédito
CREATE TABLE detalle_notas_credito (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    nota_credito_id BIGINT          NOT NULL,
    producto_id     BIGINT          NOT NULL,
    detalle_venta_id BIGINT         NOT NULL COMMENT 'Línea original de la venta',
    cantidad        INT             NOT NULL,
    precio_unitario DECIMAL(10,2)   NOT NULL,
    subtotal        DECIMAL(10,2)   NOT NULL,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_detnc_nc FOREIGN KEY (nota_credito_id) REFERENCES notas_credito(id),
    CONSTRAINT fk_detnc_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
    CONSTRAINT fk_detnc_detven FOREIGN KEY (detalle_venta_id) REFERENCES detalle_ventas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 10: TABLAS DE TENANT - Clientes B2C (Storefront)
-- ============================================================================

CREATE TABLE clientes_tienda (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    password_hash   VARCHAR(255),
    nombre          VARCHAR(100)    NOT NULL,
    apellido        VARCHAR(100),
    telefono        VARCHAR(20),
    direccion       TEXT,
    proveedor_oauth VARCHAR(20)     COMMENT 'GOOGLE, FACEBOOK, null',
    oauth_id        VARCHAR(200),
    ultimo_acceso   DATETIME,
    estado          TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_clitda_tenant_email (tenant_id, email),
    CONSTRAINT fk_clitda_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 11: TABLAS DE TENANT - Auditoría
-- ============================================================================

CREATE TABLE auditoria (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT          NOT NULL,
    usuario_id      BIGINT          NULL,
    accion          VARCHAR(100)    NOT NULL,
    entidad         VARCHAR(50)     COMMENT 'Tabla/entidad afectada',
    entidad_id      BIGINT          COMMENT 'ID del registro afectado',
    detalle         TEXT,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_aud_tenant_fecha (tenant_id, created_at),
    INDEX idx_aud_tenant_accion (tenant_id, accion),
    CONSTRAINT fk_aud_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_aud_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- FIN DEL SCRIPT DDL
-- Total: 49 tablas
-- Plataforma: 11 (planes_suscripcion, modulos_sistema, modulos_plan,
--                  modulos_tenant, tenants, suscripciones, cupones,
--                  pagos_suscripcion, usuarios_plataforma, tickets_soporte,
--                  auditoria_plataforma)
-- Referencia Global: 3 (departamentos, provincias, distritos)
-- Tenant: 35 (configuracion_empresa, roles, usuarios, almacenes,
--              cajas_registradoras, series_comprobantes, metodos_pago,
--              motivos_movimiento, categorias, tallas, colores, marcas,
--              materiales, generos, unidades_medida, entidades_comerciales,
--              productos, imagenes_producto, stock_almacen,
--              movimientos_inventario, transferencias, detalle_transferencias,
--              ordenes_compra, detalle_ordenes_compra, recepciones_compra,
--              detalle_recepciones_compra, sesiones_caja, movimientos_caja,
--              ventas, detalle_ventas, pagos_venta, notas_credito,
--              detalle_notas_credito, clientes_tienda, auditoria)
-- ============================================================================
--
-- INSTRUCCIONES DE EJECUCIÓN EN phpMyAdmin (XAMPP - C:\xampp):
--
--   1. Abre phpMyAdmin en XAMPP: http://localhost/phpmyadmin
--   2. Selecciona tu base de datos de desarrollo (ej: newhype_dev)
--      en el panel izquierdo.
--   3. Ve a la pestaña 'SQL' y pega todo este script.
--   4. Haz clic en 'Ejecutar' (o 'Go').
--      Si hay errores, revisa que no existan ya las columnas/tablas nuevas.
--   5. Si prefieres empezar limpio: crea una nueva BD vacía
--      (pestaña 'Bases de datos' → nombre ej: newhype_final → Crear),
--      selecciona esa BD y ejecuta el script completo.
--
-- VERIFICACIÓN POST-EJECUCIÓN (ejecutar en pestaña SQL de phpMyAdmin):
--
--   SHOW TABLES;
--   -- Deberías ver 49 tablas listadas
--
--   DESCRIBE tenants;
--   -- Verificar columna: ultima_actividad DATETIME NULL
--
--   DESCRIBE suscripciones;
--   -- Verificar columnas: override_max_productos, override_max_usuarios,
--   --   override_max_almacenes, override_max_ventas_mes (todos INT NULL)
--
--   DESCRIBE productos;
--   -- Verificar columnas: slug VARCHAR(250), imagen_url VARCHAR(500)
--
--   DESCRIBE categorias;
--   -- Verificar columna: slug VARCHAR(120)
--
--   SHOW CREATE TABLE modulos_tenant;
--   -- Verificar tabla nueva con FK a tenants e modulos_sistema
--
--   SHOW CREATE TABLE imagenes_producto;
--   -- Verificar tabla nueva con FK a productos
--
-- ============================================================================
