import paramiko, time, gzip, os, sys

jar_path = r'c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar'
gz_path = os.path.join(os.environ.get('TEMP', '.'), 'newhype-backend.jar.gz')
remote_dir = '/home/ventas/public_html/New-Hype-Project'

# Compress locally
print('Compressing JAR...', flush=True)
with open(jar_path, 'rb') as f_in:
    with gzip.open(gz_path, 'wb') as f_out:
        f_out.writelines(f_in)
print(f'Compressed: {os.path.getsize(gz_path) / 1024 / 1024:.1f} MB', flush=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
print('Connecting...', flush=True)
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

# Stop backend
print('Stopping backend...', flush=True)
_, so, _ = ssh.exec_command("pkill -f 'newhype-backend-0.0.1-SNAPSHOT.jar'; sleep 2; echo STOPPED")
print(so.read().decode().strip(), flush=True)

# Upload compressed JAR
print('Uploading...', flush=True)
sftp = ssh.open_sftp()
sftp.put(gz_path, f'{remote_dir}/newhype-backend.jar.gz')
sftp.close()
print('Upload done', flush=True)

# Decompress + start
print('Decompress + start...', flush=True)
_, so, se = ssh.exec_command(f'cd {remote_dir} && gunzip -f newhype-backend.jar.gz && mv newhype-backend.jar newhype-backend-0.0.1-SNAPSHOT.jar && echo DECOMPRESSED')
print(so.read().decode().strip(), flush=True)

_, so, _ = ssh.exec_command(f'cd {remote_dir} && nohup java -jar {remote_dir}/newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &')
so.read()
print('Started, waiting 15s...', flush=True)
time.sleep(15)

_, so, _ = ssh.exec_command("pgrep -f 'newhype-backend-0.0.1-SNAPSHOT.jar'")
pid = so.read().decode().strip()
if pid:
    print(f'PID: {pid}', flush=True)
else:
    print('NOT RUNNING!', flush=True)
    _, so, _ = ssh.exec_command(f'tail -20 {remote_dir}/app.log')
    print(so.read().decode(), flush=True)

_, so, _ = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5001/New-Hype-Project/api/v1/configuracion/empresa")
print(f'Health: HTTP {so.read().decode().strip()}', flush=True)

ssh.close()
print('DONE', flush=True)
