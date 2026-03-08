import paramiko, time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

remote_dir = '/home/ventas/public_html/New-Hype-Project'

# Check if running
_, so, _ = ssh.exec_command("pgrep -f 'newhype-backend-0.0.1-SNAPSHOT.jar'")
pid = so.read().decode().strip()
print(f'Current PID: {pid or "NOT RUNNING"}', flush=True)

if not pid:
    print('Starting backend...', flush=True)
    ch = ssh.get_transport().open_session()
    ch.exec_command(f'cd {remote_dir} && nohup java -jar {remote_dir}/newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &')
    ch.close()
    print('Waiting 20s for startup...', flush=True)
    time.sleep(20)
    _, so, _ = ssh.exec_command("pgrep -f 'newhype-backend-0.0.1-SNAPSHOT.jar'")
    pid = so.read().decode().strip()
    print(f'PID after start: {pid or "FAILED"}', flush=True)

# Health check
_, so, _ = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5001/New-Hype-Project/api/v1/configuracion/empresa")
status = so.read().decode().strip()
print(f'Health: HTTP {status}', flush=True)

if status != '200':
    _, so, _ = ssh.exec_command(f'tail -20 {remote_dir}/app.log')
    print(so.read().decode(), flush=True)

ssh.close()
print('DONE', flush=True)
