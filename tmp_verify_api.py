import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

# Login first
_, so, _ = ssh.exec_command("""curl -s -X POST http://localhost:5001/New-Hype-Project/api/v1/auth/login -H 'Content-Type: application/json' -d '{"username":"admin@newhype-store.pe","password":"Admin2026"}'""")
login_resp = so.read().decode()
print("Login:", login_resp[:200])

# Extract token
import json
data = json.loads(login_resp)
token = data.get('data', {}).get('token', '')

# Test metodos-pago
_, so, _ = ssh.exec_command(f"""curl -s http://localhost:5001/New-Hype-Project/api/v1/configuracion/metodos-pago -H 'Authorization: Bearer {token}'""")
print("\nMetodos pago:", so.read().decode()[:500])

# Test cotizaciones
_, so, _ = ssh.exec_command(f"""curl -s 'http://localhost:5001/New-Hype-Project/api/v1/cotizaciones?size=100' -H 'Authorization: Bearer {token}'""")
print("\nCotizaciones:", so.read().decode()[:500])

ssh.close()
