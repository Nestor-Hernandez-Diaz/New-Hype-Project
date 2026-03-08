import paramiko
import sys

print('Connecting...', flush=True)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)
print('Connected!', flush=True)

# Kill
print('Killing old process...', flush=True)
stdin, stdout, stderr = ssh.exec_command('pkill -9 -f "newhype-backend" 2>/dev/null; echo KILLED')
print(stdout.read().decode().strip(), flush=True)

# Upload silently
print('Uploading JAR (~68MB, no progress output)...', flush=True)
sftp = ssh.open_sftp()
sftp.put(
    r'C:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar',
    '/home/ventas/newhype-backend-0.0.1-SNAPSHOT.jar'
)
print('Upload complete!', flush=True)
sftp.close()

# Start
print('Starting backend...', flush=True)
stdin, stdout, stderr = ssh.exec_command('cd /home/ventas && nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &')
stdout.read()
print('Start command sent.', flush=True)

import time
time.sleep(10)

# Check
stdin, stdout, stderr = ssh.exec_command('ps aux | grep newhype-backend | grep -v grep | head -1')
ps = stdout.read().decode().strip()
print(f'Process: {"RUNNING" if ps else "NOT FOUND"}', flush=True)

stdin, stdout, stderr = ssh.exec_command('tail -5 /home/ventas/app.log')
print('Log:', stdout.read().decode(), flush=True)

ssh.close()
print('DONE', flush=True)
