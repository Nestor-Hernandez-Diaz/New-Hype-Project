import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

# Check table structure
_, so, _ = ssh.exec_command('mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e "DESCRIBE stock_almacen;" 2>/dev/null')
print('stock_almacen columns:')
print(so.read().decode())

# Fix: use correct columns
sql = """INSERT INTO stock_almacen (tenant_id, producto_id, almacen_id, cantidad, stock_minimo, created_at, updated_at)
SELECT sa.tenant_id, sa.producto_id, 2, sa.cantidad, sa.stock_minimo, NOW(), NOW()
FROM stock_almacen sa
WHERE sa.tenant_id = 1
  AND sa.almacen_id = 1
  AND sa.producto_id NOT IN (
    SELECT producto_id FROM stock_almacen WHERE tenant_id = 1 AND almacen_id = 2
  );"""

sftp = ssh.open_sftp()
with sftp.file('/tmp/fix_stock.sql', 'w') as f:
    f.write(sql)
sftp.close()

_, so, _ = ssh.exec_command('mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod < /tmp/fix_stock.sql 2>&1')
out = so.read().decode()
print(f'\nExecute: {out}')

# Verify
_, so, _ = ssh.exec_command('mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e "SELECT sa.id, sa.producto_id, sa.almacen_id, sa.cantidad FROM stock_almacen sa WHERE sa.tenant_id=1 AND sa.almacen_id=2 ORDER BY sa.producto_id;" 2>/dev/null')
print('\nStock for almacen_id=2:')
print(so.read().decode())

# Delete pending failed sales (VEN-00005, VEN-00006)
_, so, _ = ssh.exec_command('mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e "DELETE FROM detalle_ventas WHERE venta_id IN (13,14); DELETE FROM pagos_venta WHERE venta_id IN (13,14); DELETE FROM ventas WHERE id IN (13,14) AND estado=\'PENDIENTE\';" 2>/dev/null')
print('Cleaned up pending sales')

ssh.close()
print('DONE')
