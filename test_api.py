import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)

stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:5001/api/v1/storefront/productos/casaca-denim-oversize-premium')
data = stdout.read().decode()
print(data[:5000])

ssh.close()
