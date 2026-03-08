import paramiko
import os

JAR_PATH = r'c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar'
REMOTE_DIR = '/home/ventas/public_html/New-Hype-Project/'
REMOTE_JAR = REMOTE_DIR + 'newhype-backend-0.0.1-SNAPSHOT.jar'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

# 1. Kill existing process
print("1. Killing existing backend process...")
stdin, stdout, stderr = ssh.exec_command('pkill -9 -f "newhype-backend" 2>/dev/null; echo "kill done"')
print(stdout.read().decode().strip())
import time
time.sleep(2)

# 2. Upload JAR via SFTP
print("2. Uploading JAR via SFTP...")
sftp = ssh.open_sftp()
local_size = os.path.getsize(JAR_PATH)
print(f"   Local JAR size: {local_size / 1024 / 1024:.1f} MB")
sftp.put(JAR_PATH, REMOTE_JAR)
remote_stat = sftp.stat(REMOTE_JAR)
print(f"   Remote JAR size: {remote_stat.st_size / 1024 / 1024:.1f} MB")
sftp.close()

if abs(local_size - remote_stat.st_size) > 100:
    print("ERROR: File size mismatch!")
    ssh.close()
    exit(1)

# 3. Start the application
print("3. Starting backend application...")
start_cmd = (
    f'cd {REMOTE_DIR} && '
    f'nohup java -jar {REMOTE_JAR} '
    f'--spring.profiles.active=prod '
    f'--server.port=5001 '
    f'> app.log 2>&1 &'
)
stdin, stdout, stderr = ssh.exec_command(start_cmd)
stdout.read()  # wait for command to finish
time.sleep(3)

# 4. Verify process is running
print("4. Verifying process...")
stdin, stdout, stderr = ssh.exec_command('ps aux | grep newhype-backend | grep -v grep')
out = stdout.read().decode()
if 'newhype-backend' in out:
    print("   Backend process is RUNNING!")
else:
    print("   WARNING: Process not found yet, may still be starting...")

# 5. Wait for Spring Boot to fully start, then check health
print("5. Waiting for Spring Boot to initialize...")
for i in range(12):
    time.sleep(5)
    stdin, stdout, stderr = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/New-Hype-Project/api/v1/storefront/catalogos?tenantId=1')
    status = stdout.read().decode().strip()
    print(f"   Attempt {i+1}: HTTP {status}")
    if status == '200':
        print("   Backend is UP and responding!")
        break
else:
    print("   Backend may still be starting. Check logs with: tail -f app.log")

ssh.close()
print("\nDeploy complete!")
