import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password=r'AC$%$#es0r1Oz20#26&#')

sql = """
CREATE TABLE IF NOT EXISTS cotizaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    codigo_cotizacion VARCHAR(30) NOT NULL,
    cliente_id BIGINT NULL,
    almacen_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    fecha_emision DATETIME NOT NULL,
    fecha_vencimiento DATETIME NULL,
    dias_validez INT DEFAULT 30,
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    igv DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    observaciones TEXT NULL,
    motivo_rechazo TEXT NULL,
    intentos_conversion INT DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_cotizaciones_tenant (tenant_id),
    INDEX idx_cotizaciones_estado (estado),
    INDEX idx_cotizaciones_cliente (cliente_id)
);

CREATE TABLE IF NOT EXISTS detalle_cotizaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cotizacion_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_detalle_cotizaciones_cotizacion (cotizacion_id),
    CONSTRAINT fk_detalle_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id)
);

SHOW TABLES LIKE '%cotizacion%';
"""

cmd = f'mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e "{sql}"'
stdin, stdout, stderr = ssh.exec_command(cmd)
print('STDOUT:', stdout.read().decode())
err = stderr.read().decode()
if err:
    print('STDERR:', err)
ssh.close()
print('Done')
