import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)

# Check if app is running
stdin, stdout, stderr = ssh.exec_command('ps aux | grep newhype-backend | grep -v grep')
print('Process:', stdout.read().decode().strip()[:200])

# Test product list endpoint
stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:5001/api/v1/storefront/productos?page=0\\&size=2')
data = stdout.read().decode()
print('\nProducts list:', data[:1000])

# Test product detail endpoint
stdin, stdout, stderr = ssh.exec_command('curl -sv http://localhost:5001/api/v1/storefront/productos/casaca-denim-oversize-premium 2>&1 | head -30')
data = stdout.read().decode()
print('\nProduct detail:', data)

# Check logs
stdin, stdout, stderr = ssh.exec_command('tail -20 /home/ventas/app.log')
print('\nLast log lines:', stdout.read().decode())

ssh.close()
