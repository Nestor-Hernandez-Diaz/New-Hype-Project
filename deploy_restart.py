import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)

# Kill any Java process on port 5001
print('Killing processes on port 5001...')
ssh.exec_command('fuser -k 5001/tcp 2>/dev/null')
time.sleep(3)
ssh.exec_command('pkill -9 -f "newhype-backend" 2>/dev/null')
time.sleep(2)

# Start fresh
print('Starting backend...')
ssh.exec_command('cd /home/ventas && nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &')
print('Waiting 20s for Spring Boot to start...')
time.sleep(20)

# Check
stdin, stdout, stderr = ssh.exec_command('ps aux | grep newhype-backend | grep -v grep | head -1')
ps = stdout.read().decode().strip()
print(f'Process: {"RUNNING" if ps else "NOT FOUND"}')

stdin, stdout, stderr = ssh.exec_command('tail -15 /home/ventas/app.log')
log = stdout.read().decode()
print(f'Last log lines:\n{log}')

ssh.close()
