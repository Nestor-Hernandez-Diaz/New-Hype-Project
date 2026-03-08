import paramiko
import json

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)

stdin, stdout, stderr = ssh.exec_command('curl -s "http://localhost:5001/New-Hype-Project/api/v1/storefront/productos/casaca-denim-oversize-premium?tenantId=1"')
data = stdout.read().decode()
print('Response length:', len(data))

try:
    parsed = json.loads(data)
    print(json.dumps(parsed, indent=2, ensure_ascii=False)[:8000])
except:
    print(data[:5000])

ssh.close()
