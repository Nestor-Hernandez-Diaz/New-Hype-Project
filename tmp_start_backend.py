import paramiko
import time

print('Connecting...', flush=True)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)
print('Connected!', flush=True)

# Check if already running
stdin, stdout, stderr = ssh.exec_command('ps aux | grep newhype-backend | grep -v grep | head -1')
ps = stdout.read().decode().strip()
if ps:
    print('Backend already running:', ps, flush=True)
    # Check health
    stdin, stdout, stderr = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/New-Hype-Project/api/v1/storefront/catalogos?tenantId=1')
    print('Health:', stdout.read().decode(), flush=True)
    ssh.close()
    print('DONE', flush=True)
    exit(0)

# Kill old process
print('Killing old process...', flush=True)
stdin, stdout, stderr = ssh.exec_command('pkill -9 -f "newhype-backend" 2>/dev/null; echo KILLED')
print(stdout.read().decode().strip(), flush=True)
time.sleep(2)

# Start
print('Starting backend...', flush=True)
stdin, stdout, stderr = ssh.exec_command('cd /home/ventas/public_html/New-Hype-Project && nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &')
time.sleep(5)

# Wait for Spring Boot to initialize
for i in range(20):
    time.sleep(5)
    stdin, stdout, stderr = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/New-Hype-Project/api/v1/storefront/catalogos?tenantId=1')
    status = stdout.read().decode().strip()
    print(f'  Attempt {i+1}: HTTP {status}', flush=True)
    if status == '200':
        print('  Backend is UP!', flush=True)
        break
else:
    # Check logs for errors
    stdin, stdout, stderr = ssh.exec_command('tail -30 /home/ventas/public_html/New-Hype-Project/app.log')
    print('LAST LOG:', stdout.read().decode(), flush=True)

ssh.close()
print('DONE', flush=True)
