import paramiko
import bcrypt

# Generate bcrypt hash
pwd_hash = bcrypt.hashpw(b'Admin2026', bcrypt.gensalt(rounds=10)).decode()
print(f'Generated hash: {pwd_hash}', flush=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)
print('Connected!', flush=True)

# Write SQL to a temp file on the server to avoid shell escaping issues
sftp = ssh.open_sftp()
sql = f"UPDATE usuarios SET password_hash='{pwd_hash}' WHERE id=3;\n"
with sftp.open('/tmp/update_pwd.sql', 'w') as f:
    f.write(sql)
sftp.close()
print('SQL file written', flush=True)

# Execute the SQL file
stdin, stdout, stderr = ssh.exec_command("mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod < /tmp/update_pwd.sql 2>/dev/null")
print('Execute:', stdout.read().decode(), flush=True)

# Verify the hash was stored correctly
stdin, stdout, stderr = ssh.exec_command("mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e \"SELECT id, email, password_hash FROM usuarios WHERE id=3;\" 2>/dev/null")
print('Verify:', stdout.read().decode(), flush=True)

# Try login
stdin, stdout, stderr = ssh.exec_command('''curl -s -X POST http://localhost:5001/New-Hype-Project/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@newhype-store.pe","password":"Admin2026"}' 2>&1''')
print('Login:', stdout.read().decode()[:500], flush=True)

# Cleanup
stdin, stdout, stderr = ssh.exec_command("rm /tmp/update_pwd.sql")
stdout.read()

ssh.close()
print('Done', flush=True)
