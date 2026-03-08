import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

# Full debug login
_, so, _ = ssh.exec_command("""curl -sv -X POST http://localhost:5001/New-Hype-Project/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@newhype-store.pe","password":"Admin2026"}' 2>&1""")
print(so.read().decode())

ssh.close()
