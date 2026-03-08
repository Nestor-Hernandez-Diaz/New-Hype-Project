import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

# Kill existing process
print("Killing existing backend process...")
stdin, stdout, stderr = ssh.exec_command('pkill -9 -f "newhype-backend" 2>/dev/null; sleep 1; echo "done"')
print(stdout.read().decode().strip())

ssh.close()
print("Process killed.")
