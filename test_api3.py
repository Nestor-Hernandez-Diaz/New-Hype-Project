import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)

# Check actual java process
stdin, stdout, stderr = ssh.exec_command('ps aux | grep java | grep -v grep')
print('Java processes:', stdout.read().decode())

# Check if port 5001 is open
stdin, stdout, stderr = ssh.exec_command('ss -tlnp | grep 5001')
print('Port 5001:', stdout.read().decode())

# Check full log
stdin, stdout, stderr = ssh.exec_command('wc -l /home/ventas/app.log')
print('Log lines:', stdout.read().decode())

# Show more log
stdin, stdout, stderr = ssh.exec_command('tail -30 /home/ventas/app.log')
print('Full log tail:', stdout.read().decode())

# Try a simple endpoint
stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:5001/actuator/health 2>&1')
print('Health:', stdout.read().decode()[:500])

ssh.close()
