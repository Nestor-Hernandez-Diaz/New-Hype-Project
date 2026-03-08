import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

mysql_cmd = 'mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod'

# 1. Check current metodos_pago
print("=== METODOS DE PAGO ACTUALES ===")
stdin, stdout, stderr = ssh.exec_command(f"{mysql_cmd} -e \"SELECT id, codigo, nombre, tipo, estado, predeterminado FROM metodos_pago WHERE tenant_id = 1;\"")
print(stdout.read().decode())
print(stderr.read().decode())

# 2. Check current series_comprobantes
print("=== SERIES COMPROBANTES ACTUALES ===")
stdin, stdout, stderr = ssh.exec_command(f"{mysql_cmd} -e \"SELECT id, tipo_comprobante, serie, numero_actual, numero_inicio, numero_fin, estado FROM series_comprobantes WHERE tenant_id = 1;\"")
print(stdout.read().decode())
print(stderr.read().decode())

# 3. Insert new metodos de pago
print("=== INSERTANDO METODOS DE PAGO ===")
insert_metodos = """
INSERT INTO metodos_pago (tenant_id, codigo, nombre, descripcion, tipo, requiere_referencia, predeterminado, estado, created_at, updated_at)
SELECT 1, 'TARJETA', 'Tarjeta', 'Pago con tarjeta de crédito/débito', 'TARJETA', 1, 0, 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE tenant_id = 1 AND codigo = 'TARJETA');

INSERT INTO metodos_pago (tenant_id, codigo, nombre, descripcion, tipo, requiere_referencia, predeterminado, estado, created_at, updated_at)
SELECT 1, 'YAPE', 'Yape', 'Pago con Yape', 'DIGITAL', 1, 0, 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE tenant_id = 1 AND codigo = 'YAPE');

INSERT INTO metodos_pago (tenant_id, codigo, nombre, descripcion, tipo, requiere_referencia, predeterminado, estado, created_at, updated_at)
SELECT 1, 'PLIN', 'Plin', 'Pago con Plin', 'DIGITAL', 1, 0, 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE tenant_id = 1 AND codigo = 'PLIN');

INSERT INTO metodos_pago (tenant_id, codigo, nombre, descripcion, tipo, requiere_referencia, predeterminado, estado, created_at, updated_at)
SELECT 1, 'TRANSFERENCIA', 'Transferencia', 'Transferencia bancaria', 'TRANSFERENCIA', 1, 0, 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE tenant_id = 1 AND codigo = 'TRANSFERENCIA');
"""
stdin, stdout, stderr = ssh.exec_command(f"{mysql_cmd} -e \"{insert_metodos}\"")
print(stdout.read().decode())
err = stderr.read().decode()
if err and 'Warning' not in err:
    print("ERROR:", err)
else:
    print("OK (insertados)")

# 4. Also make sure existing Efectivo is active
print("=== ACTIVAR EFECTIVO SI ESTABA INACTIVO ===")
stdin, stdout, stderr = ssh.exec_command(f"{mysql_cmd} -e \"UPDATE metodos_pago SET estado = 1 WHERE tenant_id = 1 AND codigo = 'EFECTIVO';\"")
print(stdout.read().decode())
print(stderr.read().decode())

# 5. Insert series comprobantes if needed
print("=== INSERTANDO SERIES COMPROBANTES ===")
insert_series = """
INSERT INTO series_comprobantes (tenant_id, tipo_comprobante, serie, numero_actual, numero_inicio, numero_fin, punto_emision, estado, created_at, updated_at)
SELECT 1, 'BOLETA', 'B001', 0, 1, 99999999, 'Principal', 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM series_comprobantes WHERE tenant_id = 1 AND tipo_comprobante = 'BOLETA');

INSERT INTO series_comprobantes (tenant_id, tipo_comprobante, serie, numero_actual, numero_inicio, numero_fin, punto_emision, estado, created_at, updated_at)
SELECT 1, 'FACTURA', 'F001', 0, 1, 99999999, 'Principal', 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM series_comprobantes WHERE tenant_id = 1 AND tipo_comprobante = 'FACTURA');

INSERT INTO series_comprobantes (tenant_id, tipo_comprobante, serie, numero_actual, numero_inicio, numero_fin, punto_emision, estado, created_at, updated_at)
SELECT 1, 'NOTA_CREDITO', 'NC01', 0, 1, 99999999, 'Principal', 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM series_comprobantes WHERE tenant_id = 1 AND tipo_comprobante = 'NOTA_CREDITO');

INSERT INTO series_comprobantes (tenant_id, tipo_comprobante, serie, numero_actual, numero_inicio, numero_fin, punto_emision, estado, created_at, updated_at)
SELECT 1, 'NOTA_DEBITO', 'ND01', 0, 1, 99999999, 'Principal', 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM series_comprobantes WHERE tenant_id = 1 AND tipo_comprobante = 'NOTA_DEBITO');
"""
stdin, stdout, stderr = ssh.exec_command(f"{mysql_cmd} -e \"{insert_series}\"")
print(stdout.read().decode())
err = stderr.read().decode()
if err and 'Warning' not in err:
    print("ERROR:", err)
else:
    print("OK (insertados)")

# 6. Also activate all existing series
print("=== ACTIVAR TODAS LAS SERIES ===")
stdin, stdout, stderr = ssh.exec_command(f"{mysql_cmd} -e \"UPDATE series_comprobantes SET estado = 1 WHERE tenant_id = 1;\"")
print(stdout.read().decode())
print(stderr.read().decode())

# 7. Verify final state
print("=== METODOS DE PAGO FINALES ===")
stdin, stdout, stderr = ssh.exec_command(f"{mysql_cmd} -e \"SELECT id, codigo, nombre, tipo, estado, predeterminado FROM metodos_pago WHERE tenant_id = 1;\"")
print(stdout.read().decode())

print("=== SERIES COMPROBANTES FINALES ===")
stdin, stdout, stderr = ssh.exec_command(f"{mysql_cmd} -e \"SELECT id, tipo_comprobante, serie, numero_actual, estado FROM series_comprobantes WHERE tenant_id = 1;\"")
print(stdout.read().decode())

ssh.close()
print("DONE")
