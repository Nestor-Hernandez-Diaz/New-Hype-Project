import paramiko
import os
import time

print('Connecting...', flush=True)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)
print('Connected!', flush=True)

# 1) Kill old backend
print('Killing old backend...', flush=True)
stdin, stdout, stderr = ssh.exec_command('pkill -9 -f "newhype-backend" 2>/dev/null; echo KILLED')
print(stdout.read().decode().strip(), flush=True)
time.sleep(2)

sftp = ssh.open_sftp()

# 2) Upload JAR
print('Uploading JAR...', flush=True)
sftp.put(
    r'C:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar',
    '/home/ventas/public_html/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar'
)
print('JAR uploaded!', flush=True)

# 3) Upload frontend dist
local_dist = r'C:\Dev\New-Hype-Project\frontend\dist'
remote_base = '/home/ventas/public_html'

def upload_dir(local_path, remote_path):
    for item in os.listdir(local_path):
        local_item = os.path.join(local_path, item)
        remote_item = remote_path + '/' + item
        if os.path.isdir(local_item):
            try:
                sftp.stat(remote_item)
            except FileNotFoundError:
                sftp.mkdir(remote_item)
            upload_dir(local_item, remote_item)
        else:
            sftp.put(local_item, remote_item)

# Clean old assets
print('Cleaning old assets...', flush=True)
stdin, stdout, stderr = ssh.exec_command('rm -rf /home/ventas/public_html/assets')
stdout.read()

print('Uploading frontend...', flush=True)
upload_dir(local_dist, remote_base)
print('Frontend uploaded!', flush=True)

sftp.close()

# 4) Start backend
print('Starting backend...', flush=True)
stdin, stdout, stderr = ssh.exec_command(
    'cd /home/ventas/public_html/New-Hype-Project && '
    'nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar '
    '--spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &'
)
stdout.read()
print('Start command sent. Waiting for startup...', flush=True)

time.sleep(15)

# 5) CHECK
stdin, stdout, stderr = ssh.exec_command('ps aux | grep newhype-backend | grep -v grep | head -1')
ps = stdout.read().decode().strip()
print(f'Process: {"RUNNING" if ps else "NOT FOUND"}', flush=True)

stdin, stdout, stderr = ssh.exec_command('tail -3 /home/ventas/public_html/New-Hype-Project/app.log')
print('Log:', stdout.read().decode(), flush=True)

ssh.close()
print('DONE!', flush=True)
