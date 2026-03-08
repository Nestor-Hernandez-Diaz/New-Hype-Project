import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)
print('Connected!', flush=True)

# Check if user was created in DB
cmd = "mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e \"SELECT id, email, username, nombre, apellido, rol_id FROM usuarios ORDER BY id DESC LIMIT 5;\" 2>/dev/null"
stdin, stdout, stderr = ssh.exec_command(cmd)
print('Latest users:')
print(stdout.read().decode())

# Try login again
stdin, stdout, stderr = ssh.exec_command('''curl -s -X POST http://localhost:5001/New-Hype-Project/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"test@newhype-store.pe","password":"Test1234"}' 2>&1''')
print('Login test@newhype-store.pe:')
print(stdout.read().decode()[:500])

# Let's check the login endpoint - maybe it uses 'username' not 'email'
stdin, stdout, stderr = ssh.exec_command('''curl -s -X POST http://localhost:5001/New-Hype-Project/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin","password":"Admin2026"}' 2>&1''')
print('\nLogin with username "admin":')
print(stdout.read().decode()[:300])

# Check the AuthController to understand the login request format
# Maybe try with all old passwords from the e2e test
stdin, stdout, stderr = ssh.exec_command('''curl -s -X POST http://localhost:5001/New-Hype-Project/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@newhype-store.pe","password":"Test1234"}' 2>&1''')
print('\nLogin admin with Test1234:')
print(stdout.read().decode()[:300])

ssh.close()
print('Done', flush=True)
