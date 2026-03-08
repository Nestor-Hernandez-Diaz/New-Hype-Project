import paramiko
import time
import sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)

action = sys.argv[1] if len(sys.argv) > 1 else 'start'

if action == 'start':
    # Start without reading stdout (avoids blocking)
    ssh.exec_command('cd /home/ventas && nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &')
    print('Start command sent. Waiting 15s for boot...')
    time.sleep(15)
    action = 'check'

if action == 'check':
    stdin, stdout, stderr = ssh.exec_command('ps aux | grep newhype-backend | grep -v grep | head -1')
    ps = stdout.read().decode().strip()
    print(f'Process: {"RUNNING" if ps else "NOT FOUND"}')

    stdin, stdout, stderr = ssh.exec_command('tail -10 /home/ventas/app.log')
    log = stdout.read().decode()
    print(f'Last log lines:\n{log}')

ssh.close()
