import paramiko
import sys

print('Connecting...', flush=True)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)
    print('Connected!', flush=True)
except Exception as e:
    print(f'Connection failed: {e}', flush=True)
    sys.exit(1)

# Kill
print('Killing old process...', flush=True)
stdin, stdout, stderr = ssh.exec_command('pkill -9 -f "newhype-backend" 2>/dev/null; echo KILLED')
print(stdout.read().decode().strip(), flush=True)

# Upload
print('Starting SFTP upload (~68MB)...', flush=True)
try:
    sftp = ssh.open_sftp()
    sftp.put(
        r'C:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar',
        '/home/ventas/newhype-backend-0.0.1-SNAPSHOT.jar',
        callback=lambda transferred, total: print(f'\r  {transferred*100//total}% ({transferred//1024//1024}MB/{total//1024//1024}MB)', end='', flush=True)
    )
    print('\nUpload complete!', flush=True)
    sftp.close()
except Exception as e:
    print(f'\nUpload failed: {e}', flush=True)
    ssh.close()
    sys.exit(1)

# Start
print('Starting backend...', flush=True)
stdin, stdout, stderr = ssh.exec_command('cd /home/ventas && nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &')
stdout.read()
print('Start command sent.', flush=True)

import time
time.sleep(8)

# Check
stdin, stdout, stderr = ssh.exec_command('ps aux | grep newhype-backend | grep -v grep | head -1')
ps = stdout.read().decode().strip()
print(f'Process: {"RUNNING" if ps else "NOT FOUND"}', flush=True)

stdin, stdout, stderr = ssh.exec_command('tail -5 /home/ventas/app.log')
print('Log:', stdout.read().decode(), flush=True)

ssh.close()
print('DONE', flush=True)
