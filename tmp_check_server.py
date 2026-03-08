import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)
print('Connected!', flush=True)

# Check if process exists
stdin, stdout, stderr = ssh.exec_command('ps aux | grep java | grep -v grep')
print('JAVA PROCESSES:')
print(stdout.read().decode())

# Check logs
stdin, stdout, stderr = ssh.exec_command('tail -60 /home/ventas/public_html/New-Hype-Project/app.log 2>/dev/null || echo NO_LOG_FOUND')
log = stdout.read().decode()
print('LOG:')
print(log[-2000:] if len(log) > 2000 else log)

# Check if JAR exists
stdin, stdout, stderr = ssh.exec_command('ls -la /home/ventas/public_html/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar')
print('JAR:', stdout.read().decode())

# Try to start
print('Attempting to start...', flush=True)
start_cmd = (
    'cd /home/ventas/public_html/New-Hype-Project && '
    'nohup java -jar newhype-backend-0.0.1-SNAPSHOT.jar '
    '--spring.profiles.active=prod '
    '--server.port=5001 '
    '> app.log 2>&1 &'
)
stdin, stdout, stderr = ssh.exec_command(start_cmd)
stdout.read()
time.sleep(8)

# Check again
stdin, stdout, stderr = ssh.exec_command('ps aux | grep java | grep -v grep')
ps = stdout.read().decode()
print('AFTER START:')
print(ps)

if 'newhype-backend' not in ps:
    stdin, stdout, stderr = ssh.exec_command('cat /home/ventas/public_html/New-Hype-Project/app.log 2>/dev/null | tail -40')
    print('ERROR LOG:')
    print(stdout.read().decode())

ssh.close()
print('Done')
