import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = 'AC$%$#es0r1Oz20#26&#'
ssh.connect('spring.informaticapp.com', username='ventas', password=password)

sql = """
ALTER TABLE ventas ADD COLUMN incluye_igv BOOLEAN DEFAULT TRUE;
ALTER TABLE notas_credito MODIFY COLUMN motivo_sunat VARCHAR(50) NOT NULL;
"""

sftp = ssh.open_sftp()
with sftp.file('/tmp/alter_tables.sql', 'w') as f:
    f.write(sql)
sftp.close()

_, so, se = ssh.exec_command('mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod < /tmp/alter_tables.sql 2>&1')
print("OUTPUT:", so.read().decode())
print("ERROR:", se.read().decode())

# Verify
_, so, se = ssh.exec_command("mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e \"DESCRIBE ventas;\" 2>&1")
print("VENTAS TABLE:", so.read().decode())

_, so, se = ssh.exec_command("mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e \"DESCRIBE notas_credito;\" 2>&1")
print("NOTAS_CREDITO TABLE:", so.read().decode())

ssh.close()
