USE erp_db;

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_categoria VARCHAR(50) NOT NULL UNIQUE,
  nombre_categoria VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_codigo (codigo_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Categorías de productos';

CREATE TABLE IF NOT EXISTS almacenes (
  id VARCHAR(50) PRIMARY KEY,
  codigo_almacen VARCHAR(50) NOT NULL UNIQUE,
  nombre_almacen VARCHAR(100) NOT NULL,
  direccion VARCHAR(255),
  capacidad INT,
  tipo_almacen VARCHAR(50) COMMENT 'PRINCIPAL, SECUNDARIO, TRANSITO',
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_codigo (codigo_almacen),
  INDEX idx_tipo (tipo_almacen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Almacenes disponibles';

CREATE TABLE IF NOT EXISTS productos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  codigo_producto VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  
  categoria VARCHAR(100) NOT NULL,
  
  talla VARCHAR(20),
  color VARCHAR(100),
  marca VARCHAR(100),
  material VARCHAR(100),
  genero VARCHAR(50),
  
  precio_venta DECIMAL(10, 2) NOT NULL,
  precio_costo DECIMAL(10, 2),
  
  stock_inicial INT DEFAULT 0,
  stock_actual INT DEFAULT 0,
  stock_minimo INT DEFAULT 10,
  stock_maximo INT DEFAULT 500,
  
  estado VARCHAR(50) DEFAULT 'ACTIVO',
  activo BOOLEAN DEFAULT TRUE,
  
  usuario_creacion VARCHAR(100) DEFAULT 'SYSTEM',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_modificacion VARCHAR(100),
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_codigo (codigo_producto),
  INDEX idx_categoria (categoria),
  INDEX idx_estado (estado),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de productos - Tienda de ropa y accesorios';

CREATE TABLE IF NOT EXISTS stock_almacen (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  producto_id BIGINT NOT NULL,
  almacen_id VARCHAR(50) NOT NULL,
  cantidad INT DEFAULT 0,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (almacen_id) REFERENCES almacenes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_producto_almacen (producto_id, almacen_id),
  INDEX idx_almacen (almacen_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Distribución de stock por almacén';

CREATE TABLE IF NOT EXISTS kardex (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  producto_id BIGINT NOT NULL,
  almacen_id VARCHAR(50) NOT NULL,
  tipo_movimiento VARCHAR(50) NOT NULL COMMENT 'ENTRADA, SALIDA, AJUSTE',
  cantidad INT NOT NULL,
  descripcion TEXT,
  referencia VARCHAR(100),
  usuario_creacion VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (almacen_id) REFERENCES almacenes(id) ON DELETE CASCADE,
  INDEX idx_tipo (tipo_movimiento),
  INDEX idx_producto (producto_id),
  INDEX idx_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Kardex - Historial de movimientos de inventario';

CREATE TABLE IF NOT EXISTS entidades_comerciales (
  id VARCHAR(50) PRIMARY KEY,
  tipo_entidad VARCHAR(50) NOT NULL COMMENT 'CLIENTE, PROVEEDOR, AMBOS',
  tipo_documento VARCHAR(50) NOT NULL,
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  razon_social VARCHAR(255),
  nombre_comercial VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tipo_entidad (tipo_entidad),
  INDEX idx_documento (numero_documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Clientes y Proveedores';

CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombres VARCHAR(100),
  apellidos VARCHAR(100),
  rol VARCHAR(50) DEFAULT 'VENDEDOR',
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Usuarios del sistema';

GRANT ALL PRIVILEGES ON erp_db.* TO 'devuser'@'%';
FLUSH PRIVILEGES;
