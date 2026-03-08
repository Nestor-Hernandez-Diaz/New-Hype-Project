import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

queries = [
    "SELECT id, nombre, codigo, parent_product_id FROM productos WHERE tenant_id=1 AND nombre LIKE '%Casaca Denim%' LIMIT 20;",
    "SELECT sa.id, sa.producto_id, sa.almacen_id, sa.cantidad, p.nombre, p.codigo FROM stock_almacen sa JOIN productos p ON sa.producto_id=p.id WHERE sa.tenant_id=1 AND p.nombre LIKE '%Casaca%' LIMIT 20;",
    "SELECT id, nombre FROM almacenes WHERE tenant_id=1;",
    "SELECT sa.id, sa.producto_id, sa.almacen_id, sa.cantidad FROM stock_almacen sa WHERE sa.tenant_id=1 AND sa.producto_id=22;",
    "SELECT sa.id, sa.producto_id, sa.almacen_id, sa.cantidad FROM stock_almacen sa WHERE sa.tenant_id=1 LIMIT 30;",
]

for q in queries:
    print(f'\n=== QUERY: {q[:80]}')
    cmd = f'mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e "{q}" 2>/dev/null'
    _, so, se = ssh.exec_command(cmd)
    out = so.read().decode()
    print(out if out.strip() else '(empty result)')

ssh.close()
print('\nDONE')
