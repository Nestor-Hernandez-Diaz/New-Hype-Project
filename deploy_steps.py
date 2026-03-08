import paramiko
import time
import sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

step = sys.argv[1] if len(sys.argv) > 1 else 'all'

if step in ('kill', 'all'):
    print('=== Killing existing process ===')
    stdin, stdout, stderr = ssh.exec_command('pkill -9 -f "newhype-backend" 2>/dev/null; sleep 1; echo KILLED')
    print(stdout.read().decode())

if step in ('upload', 'all'):
    print('=== Uploading JAR (68MB, please wait) ===')
    sftp = ssh.open_sftp()
    local_path = r'C:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar'
    remote_path = '/home/ventas/newhype-backend-0.0.1-SNAPSHOT.jar'
    sftp.put(local_path, remote_path)
    print('Upload complete!')
    sftp.close()

if step in ('start', 'all'):
    print('=== Starting backend ===')
    start_cmd = 'cd /home/ventas && nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &'
    stdin, stdout, stderr = ssh.exec_command(start_cmd)
    stdout.read()
    print('Start command sent, waiting 10s...')
    time.sleep(10)

if step in ('check', 'all'):
    stdin, stdout, stderr = ssh.exec_command('ps aux | grep newhype-backend | grep -v grep | head -1')
    ps_out = stdout.read().decode().strip()
    print('=== Process check ===')
    print(ps_out if ps_out else 'NO PROCESS FOUND')

    stdin, stdout, stderr = ssh.exec_command('tail -8 /home/ventas/app.log')
    print('=== Last log lines ===')
    print(stdout.read().decode())

ssh.close()
print('=== DONE ===')
