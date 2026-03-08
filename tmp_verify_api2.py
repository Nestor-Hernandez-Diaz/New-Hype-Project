import paramiko, json

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

# Login
_, so, _ = ssh.exec_command("""curl -s -X POST http://localhost:5001/New-Hype-Project/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@newhype-store.pe","password":"Admin2026"}'""")
login_resp = so.read().decode()
data = json.loads(login_resp)
token = data.get('data', {}).get('token', '')
print("Login:", "OK" if token else "FAILED")

# Test metodos-pago (should return ALL including inactive)
_, so, _ = ssh.exec_command(f"""curl -s http://localhost:5001/New-Hype-Project/api/v1/configuracion/metodos-pago -H 'Authorization: Bearer {token}'""")
resp = json.loads(so.read().decode())
print(f"\nMetodos pago: {len(resp.get('data', []))} items")
for m in resp.get('data', []):
    print(f"  - id={m['id']}, nombre={m['nombre']}, tipo={m['tipo']}, estado={m['estado']}")

# Test series-comprobantes
_, so, _ = ssh.exec_command(f"""curl -s http://localhost:5001/New-Hype-Project/api/v1/configuracion/series-comprobantes -H 'Authorization: Bearer {token}'""")
resp = json.loads(so.read().decode())
print(f"\nSeries comprobantes: {len(resp.get('data', []))} items")
for s in resp.get('data', []):
    print(f"  - id={s['id']}, tipo={s['tipoComprobante']}, serie={s['serie']}, estado={s['estado']}")

# Test cotizaciones
_, so, _ = ssh.exec_command(f"""curl -s 'http://localhost:5001/New-Hype-Project/api/v1/cotizaciones?size=100' -H 'Authorization: Bearer {token}'""")
resp = json.loads(so.read().decode())
cots = resp.get('data', [])
print(f"\nCotizaciones: {len(cots)} items")
for c in cots[:5]:
    print(f"  - id={c['id']}, codigo={c['codigoCotizacion']}, estado={c['estado']}, total={c.get('total')}")

ssh.close()
