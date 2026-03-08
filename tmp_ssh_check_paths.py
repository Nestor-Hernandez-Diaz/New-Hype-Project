import paramiko
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

# Check what files exist on server
stdin, stdout, stderr = ssh.exec_command("ls -la /home/ventas/ && ls -la /home/ventas/New-Hype-Project/ 2>/dev/null || echo 'DIR NOT FOUND'")
print(stdout.read().decode())

# Find the running jar
stdin, stdout, stderr = ssh.exec_command("ps aux | grep java | grep -v grep")
print("RUNNING JAVA:")
print(stdout.read().decode())

# Find the jar file location
stdin, stdout, stderr = ssh.exec_command("find /home/ventas -name '*.jar' 2>/dev/null")
print("JAR FILES:")
print(stdout.read().decode())

ssh.close()
