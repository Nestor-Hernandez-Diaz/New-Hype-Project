USE erp_db;

INSERT INTO categorias (codigo_categoria, nombre_categoria, descripcion) VALUES
('CAM', 'Camisetas', 'Camisetas y polos para todas las tallas'),
('PAN', 'Pantalones', 'Pantalones, jeans y bermudas'),
('ACE', 'Accesorios', 'Cinturones, gorras, pulseras, anillos'),
('ZAP', 'Calzado', 'Zapatos, tenis, sandalias'),
('MED', 'Medias', 'Medias y calcetines');

INSERT INTO almacenes (id, codigo_almacen, nombre_almacen, direccion, capacidad, tipo_almacen) VALUES
('WH-PRINCIPAL', 'ALM-001', 'Almacén Principal', 'Av. La Mar 1234, Lima', 1000, 'PRINCIPAL'),
('WH-SECUNDARIO', 'ALM-002', 'Almacén Secundario', 'Jr. Gamarra 567, Lima', 500, 'SECUNDARIO'),
('WH-TRANSITO', 'ALM-003', 'Almacén Tránsito', 'Calle Industrial 123, Lima', 200, 'TRANSITO');

INSERT INTO productos (
  codigo_producto, nombre, descripcion, categoria, 
  talla, color, marca, material, genero,
  precio_venta, precio_costo, 
  stock_actual, stock_minimo, stock_maximo,
  estado, activo
) VALUES

('CAM-POL-001', 'Camiseta Polo Básica', 'Polo clásico de alta calidad', 'Camisetas',
 'M', 'Blanco', 'Polo Ralph Lauren', 'Algodón 100%', 'Hombre',
 79.90, 35.00, 150, 25, 300, 'ACTIVO', TRUE),

('CAM-POL-002', 'Camiseta Polo Azul Marino', 'Polo en tono azul oscuro', 'Camisetas',
 'L', 'Azul Marino', 'Polo Ralph Lauren', 'Algodón 100%', 'Hombre',
 79.90, 35.00, 92, 25, 300, 'ACTIVO', TRUE),

('CAM-EST-001', 'Camiseta Estampada Floral', 'Camiseta mujer con diseño floral', 'Camisetas',
 'S', 'Estampado Floral Rosa', 'H&M', 'Viscosa', 'Mujer',
 59.90, 25.00, 18, 20, 150, 'ACTIVO', TRUE),

('CAM-DRY-001', 'Camiseta Deportiva Dry-Fit', 'Polo deportivo con tecnología dry-fit', 'Camisetas',
 'M', 'Negro', 'Forever 21', 'Algodón Jersey', 'Unisex',
 45.90, 18.00, 5, 50, 200, 'ACTIVO', TRUE),

('PAN-JEA-001', 'Pantalón Jean Slim Fit', 'Jean azul oscuro, ajuste slim', 'Pantalones',
 'M', 'Azul Oscuro', 'Levi''s', 'Mezclilla Stretch', 'Mujer',
 119.90, 52.00, 52, 15, 150, 'ACTIVO', TRUE),

('PAN-JEA-002', 'Pantalón Jean Clásico', 'Jean recto corte tradicional', 'Pantalones',
 'L', 'Azul Claro', 'Levi''s', 'Denim 100%', 'Hombre',
 129.90, 60.00, 38, 15, 150, 'ACTIVO', TRUE),

('PAN-BER-001', 'Bermuda Cargo Caqui', 'Bermuda de trabajo con bolsillos', 'Pantalones',
 'M', 'Caqui', 'Carhartt', 'Algodón Lona', 'Hombre',
 89.90, 40.00, 25, 10, 100, 'ACTIVO', TRUE),

('ACE-CIN-001', 'Cinturón Piel Negra', 'Cinturón de cuero genuino', 'Accesorios',
 'U', 'Negro', 'Gucci', 'Cuero Genuino', 'Unisex',
 159.90, 70.00, 45, 10, 100, 'ACTIVO', TRUE),

('ACE-ARO-001', 'Aros de Plata Ley 925', 'Aros en plata esterlina', 'Accesorios',
 'Único', 'Plateado', 'Pandora', 'Plata Ley 925', 'Mujer',
 99.90, 45.00, 145, 30, 300, 'ACTIVO', TRUE),

('ACE-GOR-001', 'Gorra Deportiva Negra', 'Gorra ajustable para deporte', 'Accesorios',
 'U', 'Negro', 'Nike', 'Algodón Poliéster', 'Unisex',
 39.90, 15.00, 200, 50, 500, 'ACTIVO', TRUE),

('ZAP-TEN-001', 'Tenis Running Blanco', 'Tenis para correr confort máximo', 'Calzado',
 '9', 'Blanco', 'Nike', 'Malla Sintética', 'Unisex',
 249.90, 110.00, 78, 15, 200, 'ACTIVO', TRUE),

('ZAP-SAN-001', 'Sandalia Verano Dorada', 'Sandalia elegante para verano', 'Calzado',
 '7', 'Dorado', 'Havaianas', 'Caucho EVA', 'Mujer',
 59.90, 22.00, 156, 20, 300, 'ACTIVO', TRUE),

('MED-ALC-001', 'Medias Algodón Paquete', 'Pack de 6 pares de medias', 'Medias',
 'U', 'Blanco', 'Genérico', 'Algodón 100%', 'Unisex',
 29.90, 12.00, 500, 100, 1000, 'ACTIVO', TRUE);

INSERT INTO stock_almacen (producto_id, almacen_id, cantidad) 
SELECT p.id, a.id, 
  CASE 
    WHEN a.id = 'WH-PRINCIPAL' THEN FLOOR(p.stock_actual * 0.7)
    WHEN a.id = 'WH-SECUNDARIO' THEN FLOOR(p.stock_actual * 0.2)
    ELSE FLOOR(p.stock_actual * 0.1)
  END
FROM productos p
CROSS JOIN almacenes a;

INSERT INTO kardex (producto_id, almacen_id, tipo_movimiento, cantidad, descripcion, referencia) 
SELECT id, 'WH-PRINCIPAL', 'ENTRADA', stock_actual, 
  CONCAT('Stock inicial: ', nombre),
  CONCAT('INIT-', codigo_producto)
FROM productos;

INSERT INTO usuarios (id, username, email, password_hash, nombres, apellidos, rol, activo) VALUES
('user-001', 'admin', 'admin@newhype.local', SHA2('admin123', 256), 'Admin', 'System', 'ADMINISTRADOR', TRUE),
('user-002', 'vendedor1', 'vendedor1@newhype.local', SHA2('pass123', 256), 'Juan', 'Pérez', 'VENDEDOR', TRUE),
('user-003', 'vendedor2', 'vendedor2@newhype.local', SHA2('pass123', 256), 'María', 'García', 'VENDEDOR', TRUE),
('user-004', 'almacenero', 'almacen@newhype.local', SHA2('pass123', 256), 'Carlos', 'López', 'ALMACENERO', TRUE);

INSERT INTO entidades_comerciales (id, tipo_entidad, tipo_documento, numero_documento, razon_social, email, telefono, activo) VALUES
('cliente-001', 'CLIENTE', 'DNI', '12345678', 'Ana María Torres', 'ana.torres@gmail.com', '987654321', TRUE),
('cliente-002', 'CLIENTE', 'RUC', '20123456789', 'Boutique Fashion EIRL', 'info@boutiquefashion.pe', '016789012', TRUE),
('cliente-003', 'CLIENTE', 'DNI', '87654321', 'Roberto Silva', 'rsilva@gmail.com', '945678901', TRUE);

SELECT '✅ DATOS DE PRUEBA INSERTADOS CORRECTAMENTE' AS status;
