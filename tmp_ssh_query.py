import paramiko
import json

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

queries = [
    # 1. All products with their SKU, slug, imagen_url, talla_id, color_id
    "SELECT id, sku, nombre, slug, imagen_url, talla_id, color_id, estado FROM productos WHERE tenant_id = 1 ORDER BY id;",
    # 2. All images in imagenes_producto
    "SELECT ip.id, ip.producto_id, ip.url, ip.orden, ip.es_principal FROM imagenes_producto ip ORDER BY ip.producto_id, ip.orden;",
    # 3. Stock per product
    "SELECT producto_id, almacen_id, cantidad FROM stock_almacen WHERE tenant_id = 1 ORDER BY producto_id;",
    # 4. Tallas catalog
    "SELECT id, codigo, descripcion, estado FROM tallas WHERE tenant_id = 1;",
    # 5. Colores catalog
    "SELECT id, codigo, nombre, codigo_hex, estado FROM colores WHERE tenant_id = 1;",
]

labels = ["PRODUCTS", "IMAGES", "STOCK", "TALLAS", "COLORES"]

for label, q in zip(labels, queries):
    cmd = f'mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e "{q}"'
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(f"\n=== {label} ===")
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err and 'Warning' not in err:
        print('ERROR:', err)

ssh.close()
