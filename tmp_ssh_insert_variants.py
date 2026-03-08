import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

# 5 tallas × 3 colores = 15 combos, minus existing (talla=5/L, color=4/Azul) = 14 inserts
tallas = [(2, 'XS'), (3, 'S'), (4, 'M'), (5, 'L'), (6, 'XXL')]
colores = [(1, 'NEG'), (2, 'BLA'), (4, 'AZU')]
existing = (5, 4)  # talla_id=5 (L), color_id=4 (Azul) already exists as id=18

inserts_productos = []
stock_map = {}

for talla_id, talla_code in tallas:
    for color_id, color_code in colores:
        if (talla_id, color_id) == existing:
            continue

        sku = f'CAS-DOP-{talla_code}-{color_code}'
        stock = 15 if talla_id in (4, 5) else 10 if talla_id == 3 else 8

        # 25 columns, 25 values:
        # tenant_id, sku, nombre, slug, descripcion,
        # categoria_id, talla_id, color_id, marca_id, material_id, genero_id, unidad_medida_id,
        # codigo_barras, imagen_url,
        # precio_costo, precio_venta, stock_minimo, controla_inventario,
        # en_liquidacion, porcentaje_liquidacion, fecha_inicio_liquidacion, fecha_fin_liquidacion,
        # estado, created_at, updated_at
        inserts_productos.append(
            f"(1, '{sku}', 'Casaca Denim Oversize Premium', 'casaca-denim-oversize-premium', "
            f"'Casaca denim oversize de corte premium, estilo urbano contemporaneo', "
            f"5, {talla_id}, {color_id}, 4, 4, 4, 6, "
            f"NULL, NULL, "
            f"85.00, 190.00, 0, 1, "
            f"0, 0.00, NULL, NULL, "
            f"1, NOW(), NOW())"
        )
        stock_map[sku] = stock

sql_products = (
    "INSERT INTO productos (tenant_id, sku, nombre, slug, descripcion, "
    "categoria_id, talla_id, color_id, marca_id, material_id, genero_id, unidad_medida_id, "
    "codigo_barras, imagen_url, "
    "precio_costo, precio_venta, stock_minimo, controla_inventario, "
    "en_liquidacion, porcentaje_liquidacion, fecha_inicio_liquidacion, fecha_fin_liquidacion, "
    "estado, created_at, updated_at) VALUES "
    + ", ".join(inserts_productos) + ";"
)

print(f"Inserting {len(inserts_productos)} variant products...")

# Write SQL to a file on server to avoid escaping issues
sftp = ssh.open_sftp()
with sftp.open('/tmp/insert_variants.sql', 'w') as f:
    f.write(sql_products)
sftp.close()

cmd = 'mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod < /tmp/insert_variants.sql'
stdin, stdout, stderr = ssh.exec_command(cmd)
out = stdout.read().decode()
err = stderr.read().decode()
if out: print(out)
if err and 'Warning' not in err:
    print('ERROR:', err)
    ssh.close()
    exit(1)

print("Products inserted successfully!")

# Get the IDs of newly inserted products
cmd2 = "mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e \"SELECT id, sku FROM productos WHERE slug = 'casaca-denim-oversize-premium' AND id > 18 ORDER BY id;\""
stdin, stdout, stderr = ssh.exec_command(cmd2)
out = stdout.read().decode()
print("\nNew product IDs:")
print(out)

# Parse IDs and build stock inserts
lines = out.strip().split('\n')[1:]  # skip header
stock_inserts = []
for line in lines:
    parts = line.split('\t')
    prod_id = parts[0].strip()
    sku = parts[1].strip()
    if sku in stock_map:
        stock_inserts.append(f"(1, {prod_id}, 1, {stock_map[sku]})")

if stock_inserts:
    sql_stock = "INSERT INTO stock_almacen (tenant_id, producto_id, almacen_id, cantidad) VALUES " + ", ".join(stock_inserts) + ";"
    print(f"\nInserting stock for {len(stock_inserts)} products...")

    sftp = ssh.open_sftp()
    with sftp.open('/tmp/insert_stock.sql', 'w') as f:
        f.write(sql_stock)
    sftp.close()

    cmd3 = 'mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod < /tmp/insert_stock.sql'
    stdin, stdout, stderr = ssh.exec_command(cmd3)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(out)
    if err and 'Warning' not in err:
        print('ERROR:', err)

print("\n=== FINAL VERIFICATION ===")
cmd4 = "mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e \"SELECT p.id, p.sku, p.talla_id, p.color_id, COALESCE(sa.cantidad, 0) as stock FROM productos p LEFT JOIN stock_almacen sa ON p.id = sa.producto_id WHERE p.slug = 'casaca-denim-oversize-premium' ORDER BY p.talla_id, p.color_id;\""
stdin, stdout, stderr = ssh.exec_command(cmd4)
print(stdout.read().decode())

# Clean up temp files
ssh.exec_command('rm -f /tmp/insert_variants.sql /tmp/insert_stock.sql')

ssh.close()
print("Done!")
