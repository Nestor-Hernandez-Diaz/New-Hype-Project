import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

print("=== Running SQL migrations ===")

# ALTER TABLE
cmd1 = 'mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e "ALTER TABLE tickets_soporte ADD COLUMN usuario_id BIGINT NULL AFTER tenant_id;" 2>&1'
stdin, stdout, stderr = ssh.exec_command(cmd1)
out = stdout.read().decode().strip()
print(f"SQL 1 (ALTER): {out if out else 'OK'}")

# CREATE TABLE
cmd2 = '''mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e "
CREATE TABLE IF NOT EXISTS respuestas_ticket (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    autor_tipo VARCHAR(20) NOT NULL,
    autor_id BIGINT NOT NULL,
    mensaje TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_respuestas_ticket_id (ticket_id),
    CONSTRAINT fk_respuestas_ticket FOREIGN KEY (ticket_id) REFERENCES tickets_soporte(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
" 2>&1'''
stdin, stdout, stderr = ssh.exec_command(cmd2)
out = stdout.read().decode().strip()
print(f"SQL 2 (CREATE TABLE): {out if out else 'OK'}")

# Verify tables
cmd3 = 'mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e "DESCRIBE tickets_soporte;" 2>&1'
stdin, stdout, stderr = ssh.exec_command(cmd3)
print(f"\n=== tickets_soporte columns ===\n{stdout.read().decode()}")

cmd4 = 'mysql -u ventas_newhype_prod -pTarapoto2026 ventas_newhype_prod -e "DESCRIBE respuestas_ticket;" 2>&1'
stdin, stdout, stderr = ssh.exec_command(cmd4)
print(f"=== respuestas_ticket columns ===\n{stdout.read().decode()}")

ssh.close()
print("SQL Done!")
