import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

# 1. Kill existing process
print('=== Killing existing process ===')
stdin, stdout, stderr = ssh.exec_command('pkill -9 -f "newhype-backend" 2>/dev/null; sleep 2; echo DONE')
print(stdout.read().decode())

# 2. Upload JAR via SFTP
print('=== Uploading JAR ===')
sftp = ssh.open_sftp()
local_path = r'C:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar'
remote_path = '/home/ventas/newhype-backend-0.0.1-SNAPSHOT.jar'
sftp.put(local_path, remote_path)
print(f'Uploaded to {remote_path}')
sftp.close()

# 3. Start new process
print('=== Starting new process ===')
start_cmd = 'cd /home/ventas && nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &'
stdin, stdout, stderr = ssh.exec_command(start_cmd)
stdout.read()

time.sleep(10)

# 4. Verify it's running
stdin, stdout, stderr = ssh.exec_command('ps aux | grep newhype-backend | grep -v grep')
ps_out = stdout.read().decode()
print('=== Process check ===')
print(ps_out if ps_out else 'NO PROCESS FOUND')

# 5. Check last few lines of log
stdin, stdout, stderr = ssh.exec_command('tail -8 /home/ventas/app.log')
print('=== Last log lines ===')
print(stdout.read().decode())

ssh.close()
