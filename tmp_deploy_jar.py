import paramiko
import scp as scp_module
import time

SSH_HOST = "spring.informaticapp.com"
SSH_USER = "ventas"
import base64
SSH_PASS = base64.b64decode("QUMkJSQjZXMwcjFPejIwIzI2JiM=").decode()
REMOTE_DIR = "/home/ventas/public_html/New-Hype-Project"
LOCAL_JAR = r"C:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting...")
ssh.connect(SSH_HOST, username=SSH_USER, password=SSH_PASS, timeout=30)
print("Connected!")

stdin, stdout, stderr = ssh.exec_command("ps aux | grep newhype-backend | grep -v grep")
procs = stdout.read().decode()
if procs.strip():
    print("Stopping backend...")
    ssh.exec_command("pkill -f newhype-backend")
    time.sleep(3)
    print("Stopped.")
else:
    print("No backend running.")

print("Uploading JAR...")
scp_client = scp_module.SCPClient(ssh.get_transport())
scp_client.put(LOCAL_JAR, REMOTE_DIR + "/newhype-backend-0.0.1-SNAPSHOT.jar")
scp_client.close()
print("Uploaded.")

print("Starting backend...")
cmd = "cd " + REMOTE_DIR + " && nohup java -jar " + REMOTE_DIR + "/newhype-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 &"
ssh.exec_command(cmd)
time.sleep(15)

stdin, stdout, stderr = ssh.exec_command("ps aux | grep newhype-backend | grep -v grep")
procs = stdout.read().decode()
if procs.strip():
    print("Backend running!")
    stdin, stdout, stderr = ssh.exec_command("curl -s -o /dev/null -w %{http_code} http://localhost:5001/New-Hype-Project/api/v1/configuracion/empresa")
    code = stdout.read().decode().strip()
    print("Health: " + code)
else:
    print("FAILED: Backend not running")
    stdin, stdout, stderr = ssh.exec_command("tail -30 " + REMOTE_DIR + "/app.log")
    print(stdout.read().decode())

ssh.close()
print("DONE")
