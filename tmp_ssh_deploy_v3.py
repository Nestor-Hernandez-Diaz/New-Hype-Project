import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

jar_path = r'c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar'
remote_jar = '/home/ventas/public_html/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar'

# Stop backend
print("Stopping backend...")
stdin, stdout, stderr = ssh.exec_command("pkill -f 'newhype-backend-0.0.1-SNAPSHOT.jar'; sleep 3; echo STOPPED")
print(stdout.read().decode().strip())

# Upload JAR
print("Uploading JAR...")
sftp = ssh.open_sftp()
sftp.put(jar_path, remote_jar)
sftp.close()
print("JAR uploaded.")

# Start backend
print("Starting backend...")
start_cmd = "cd /home/ventas/public_html/New-Hype-Project/ && nohup java -jar /home/ventas/public_html/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &"
stdin, stdout, stderr = ssh.exec_command(start_cmd)
stdout.read()

time.sleep(12)

# Verify
stdin, stdout, stderr = ssh.exec_command("pgrep -f 'newhype-backend-0.0.1-SNAPSHOT.jar'")
pid = stdout.read().decode().strip()
if pid:
    print(f"Backend started: PID {pid}")
else:
    print("WARNING: Backend NOT running!")
    stdin, stdout, stderr = ssh.exec_command("tail -40 /home/ventas/public_html/New-Hype-Project/app.log")
    print(stdout.read().decode())

# Health check
stdin, stdout, stderr = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5001/New-Hype-Project/api/v1/configuracion/empresa 2>/dev/null || echo 'FAIL'")
status = stdout.read().decode().strip()
print(f"Health check: HTTP {status}")

ssh.close()
print("DONE")
