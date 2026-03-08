import paramiko
import time
import gzip
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

jar_path = r'c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar'
gz_path = jar_path + '.gz'
remote_gz = '/home/ventas/public_html/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar.gz'
remote_jar = '/home/ventas/public_html/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar'

# Step 1: Compress locally
print("Compressing JAR locally...")
with open(jar_path, 'rb') as f_in:
    with gzip.open(gz_path, 'wb', compresslevel=6) as f_out:
        f_out.write(f_in.read())
gz_size = os.path.getsize(gz_path) / (1024*1024)
orig_size = os.path.getsize(jar_path) / (1024*1024)
print(f"  Original: {orig_size:.1f}MB -> Compressed: {gz_size:.1f}MB")

# Step 2: Stop backend
print("Stopping backend...")
stdin, stdout, stderr = ssh.exec_command("pkill -f 'newhype-backend-0.0.1-SNAPSHOT.jar'; sleep 3; echo STOPPED")
print(stdout.read().decode().strip())

# Step 3: Upload compressed file
print("Uploading compressed JAR...")
sftp = ssh.open_sftp()
sftp.put(gz_path, remote_gz)
sftp.close()
print("Upload complete.")

# Step 4: Decompress on server
print("Decompressing on server...")
stdin, stdout, stderr = ssh.exec_command(f"gunzip -f {remote_gz}")
out = stdout.read().decode()
err = stderr.read().decode()
if err:
    print(f"  Error: {err}")
else:
    print("  Decompressed OK")

# Step 5: Verify file exists
stdin, stdout, stderr = ssh.exec_command(f"ls -la {remote_jar}")
print(stdout.read().decode().strip())

# Step 6: Start backend
print("Starting backend...")
start_cmd = f"cd /home/ventas/public_html/New-Hype-Project/ && nohup java -jar {remote_jar} --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &"
stdin, stdout, stderr = ssh.exec_command(start_cmd)
stdout.read()

print("Waiting for startup...")
time.sleep(15)

# Step 7: Verify
stdin, stdout, stderr = ssh.exec_command("pgrep -f 'newhype-backend-0.0.1-SNAPSHOT.jar'")
pid = stdout.read().decode().strip()
if pid:
    print(f"Backend started: PID {pid}")
else:
    print("WARNING: Backend NOT running! Checking logs...")
    stdin, stdout, stderr = ssh.exec_command(f"tail -40 /home/ventas/public_html/New-Hype-Project/app.log")
    print(stdout.read().decode())

# Health check
time.sleep(5)
stdin, stdout, stderr = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5001/New-Hype-Project/api/v1/configuracion/empresa 2>/dev/null || echo 'FAIL'")
status = stdout.read().decode().strip()
print(f"Health check: HTTP {status}")

# Cleanup local gz
os.remove(gz_path)
ssh.close()
print("DONE")
