import paramiko
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

# Upload the new JAR
jar_path = r'c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar'
remote_jar = '/home/ventas/New-Hype-Project/backend-0.0.1-SNAPSHOT.jar'

print("Uploading JAR...")
sftp = ssh.open_sftp()
sftp.put(jar_path, remote_jar)
sftp.close()
print("JAR uploaded.")

# Stop existing backend
print("Stopping backend...")
stdin, stdout, stderr = ssh.exec_command("pkill -f 'backend-0.0.1-SNAPSHOT.jar' 2>/dev/null; sleep 2; echo STOPPED")
print(stdout.read().decode())

# Start the backend
print("Starting backend...")
start_cmd = 'cd /home/ventas/New-Hype-Project && nohup java -jar backend-0.0.1-SNAPSHOT.jar --server.port=5001 > app.log 2>&1 &'
stdin, stdout, stderr = ssh.exec_command(start_cmd)
stdout.read()

import time
time.sleep(8)

# Check if running
stdin, stdout, stderr = ssh.exec_command("pgrep -f 'backend-0.0.1-SNAPSHOT.jar'")
pid = stdout.read().decode().strip()
if pid:
    print(f"Backend started with PID: {pid}")
else:
    print("WARNING: Backend not found!")
    stdin, stdout, stderr = ssh.exec_command("tail -30 /home/ventas/New-Hype-Project/app.log")
    print(stdout.read().decode())

# Quick health check
stdin, stdout, stderr = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5001/New-Hype-Project/api/v1/configuracion/empresa 2>/dev/null || echo 'CURL_FAILED'")
status = stdout.read().decode().strip()
print(f"Health check: HTTP {status}")

ssh.close()
print("DONE")
