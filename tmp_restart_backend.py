import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)
print('Connected!', flush=True)

# 1. Kill any existing newhype process (don't wait for output)
ssh.exec_command("pkill -f 'newhype-backend.*SNAPSHOT.jar' 2>/dev/null")
time.sleep(3)
print('Killed existing process', flush=True)

# 2. Start with correct profile (use get_transport for fire-and-forget)
start_cmd = (
    'cd /home/ventas/public_html/New-Hype-Project && '
    'nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar '
    '--spring.profiles.active=prod '
    '> app.log 2>&1 &'
)
ssh.exec_command(start_cmd)
print('Start command sent', flush=True)

# 3. Wait and poll for readiness
for i in range(8):
    time.sleep(5)
    _, so, _ = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/New-Hype-Project/api/v1/configuracion/empresa 2>/dev/null || echo 000')
    status = so.read().decode().strip()
    print(f'  Check {i+1}/8: HTTP {status}', flush=True)
    if status in ('200', '401', '403'):
        print('Backend is UP!', flush=True)
        break
else:
    print('Backend did not start in time. Checking logs...', flush=True)
    _, so, _ = ssh.exec_command('tail -30 /home/ventas/public_html/New-Hype-Project/app.log')
    print(so.read().decode()[-2000:])

# 4. Final process check
_, so, _ = ssh.exec_command('ps aux | grep newhype | grep -v grep')
ps = so.read().decode()
print('Process:', ps.strip() if ps.strip() else 'NOT FOUND')

ssh.close()
print('Done')
