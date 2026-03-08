import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

REMOTE_DIR = '/home/ventas/public_html/New-Hype-Project'
REMOTE_JAR = f'{REMOTE_DIR}/newhype-backend-0.0.1-SNAPSHOT.jar'

# Start application using nohup
start_cmd = f'cd {REMOTE_DIR} && nohup java -jar {REMOTE_JAR} --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 & echo $!'
channel = ssh.get_transport().open_session()
channel.exec_command(start_cmd)
time.sleep(2)
if channel.recv_ready():
    pid = channel.recv(1024).decode().strip()
    print(f"Started with PID: {pid}")
else:
    print("Process started (no PID captured)")
channel.close()

ssh.close()
print("SSH connection closed. Waiting for Spring Boot startup...")
