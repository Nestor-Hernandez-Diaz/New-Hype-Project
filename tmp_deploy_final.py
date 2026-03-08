import paramiko, gzip, os, time, sys

password = 'AC$%$#es0r1Oz20#26&#'
jar_path = r'c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar'
gz_path = jar_path + '.gz'
remote_gz = '/home/ventas/public_html/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar.gz'
remote_jar = '/home/ventas/public_html/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar'

# Compress
sys.stdout.write("Compressing... "); sys.stdout.flush()
with open(jar_path, 'rb') as f_in:
    with gzip.open(gz_path, 'wb', compresslevel=6) as f_out:
        f_out.write(f_in.read())
gz_mb = os.path.getsize(gz_path) / (1024*1024)
print(f"{gz_mb:.1f}MB")

# Connect
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

# Stop backend
print("Stopping backend...")
ssh.exec_command("pkill -f 'newhype-backend-0.0.1-SNAPSHOT.jar'")
time.sleep(3)

# Upload
print("Uploading...")
sftp = ssh.open_sftp()
# Set larger window/buffer
sftp.get_channel().settimeout(600)
sftp.put(gz_path, remote_gz)
sftp.close()
print("Uploaded OK")

# Decompress
print("Decompressing...")
_, so, se = ssh.exec_command(f"gunzip -f {remote_gz}")
so.read(); se.read()

# Verify
_, so, _ = ssh.exec_command(f"ls -la {remote_jar}")
print(so.read().decode().strip())

# Start
print("Starting...")
ssh.exec_command(f"cd /home/ventas/public_html/New-Hype-Project/ && nohup java -jar {remote_jar} --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &")
time.sleep(15)

# Check
_, so, _ = ssh.exec_command("pgrep -f 'newhype-backend'")
pid = so.read().decode().strip()
print(f"PID: {pid}" if pid else "NOT RUNNING")

if not pid:
    _, so, _ = ssh.exec_command("tail -30 /home/ventas/public_html/New-Hype-Project/app.log")
    print(so.read().decode())

# Health
_, so, _ = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5001/New-Hype-Project/api/v1/configuracion/empresa 2>/dev/null || echo FAIL")
print(f"HTTP: {so.read().decode().strip()}")

os.remove(gz_path)
ssh.close()
print("DONE")
