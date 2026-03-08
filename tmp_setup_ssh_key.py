import paramiko
import os
import sys

# Read the public key
pub_key_path = os.path.expanduser("~/.ssh/id_rsa.pub")
with open(pub_key_path, "r") as f:
    pub_key = f.read().strip()

print(f"Public key loaded: {pub_key[:50]}...")

# Ask for password
password = input("Ingresa la contraseña del servidor: ")

# Connect with password
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect('spring.informaticapp.com', username='ventas', password=password)
except paramiko.AuthenticationException:
    print("ERROR: Contraseña incorrecta")
    sys.exit(1)
print("Connected to server!")

# Setup authorized_keys
cmd = f'''
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '{pub_key}' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo "SSH key installed successfully!"
'''
_, stdout, stderr = ssh.exec_command(cmd)
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print(f"Errors: {err}")

ssh.close()
print("Done! You can now SSH without password.")
