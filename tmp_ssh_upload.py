import paramiko
import os
import time

JAR_PATH = r'c:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar'
REMOTE_JAR = '/home/ventas/public_html/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar'

local_size = os.path.getsize(JAR_PATH)
print(f"Local JAR size: {local_size / 1024 / 1024:.1f} MB")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

print("Uploading JAR via SFTP...")
start = time.time()
sftp = ssh.open_sftp()
sftp.put(JAR_PATH, REMOTE_JAR, callback=lambda transferred, total: None)
remote_stat = sftp.stat(REMOTE_JAR)
sftp.close()
elapsed = time.time() - start

print(f"Remote JAR size: {remote_stat.st_size / 1024 / 1024:.1f} MB")
print(f"Upload took {elapsed:.0f} seconds ({local_size / 1024 / elapsed:.0f} KB/s)")

if abs(local_size - remote_stat.st_size) > 100:
    print("ERROR: Size mismatch!")
else:
    print("Upload successful!")

ssh.close()
