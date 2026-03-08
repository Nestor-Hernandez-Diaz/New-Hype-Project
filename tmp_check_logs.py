import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

_, so, _ = ssh.exec_command("tail -60 /home/ventas/public_html/New-Hype-Project/app.log")
print(so.read().decode())

ssh.close()
