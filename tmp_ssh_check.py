import paramiko
import json

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

# Test catalog listing - should show casaca only ONCE (slug dedup)
stdin, stdout, stderr = ssh.exec_command('curl -s "http://localhost:5001/New-Hype-Project/api/v1/storefront/productos?tenantId=1&page=0&size=50"')
raw = stdout.read().decode()
data = json.loads(raw)
products = data['data']['content']

print(f"Total products in catalog: {len(products)}")
print(f"Total elements (paginated): {data['data']['totalElements']}")
print()

casaca_count = 0
for p in products:
    if 'casaca' in p['slug'].lower():
        casaca_count += 1
        print(f"  Casaca found: id={p['id']}, slug={p['slug']}, tallas={p['tallasDisponibles']}, colores={p['coloresDisponibles']}, stock={p['stockTotal']}")

print(f"\nCasaca appearances in catalog: {casaca_count} (should be 1)")

ssh.close()
