"""Deploy helper - step by step operations"""
import paramiko
import sys
import time

HOST = 'spring.informaticapp.com'
USER = 'ventas'
PWD = 'AC$%$#es0r1Oz20#26&#'
REMOTE_DIR = '/home/ventas/public_html/New-Hype-Project'
JAR = 'newhype-backend-0.0.1-SNAPSHOT.jar'

def get_ssh():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PWD, timeout=30)
    return ssh

def run(ssh, cmd, timeout=10):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    return stdout.read().decode().strip(), stderr.read().decode().strip()

action = sys.argv[1] if len(sys.argv) > 1 else 'status'

ssh = get_ssh()
print(f'Connected to {HOST}')

if action == 'stop':
    print('Killing Java processes for ventas...')
    out, err = run(ssh, 'pkill -9 -f "newhype-backend" 2>/dev/null; echo "kill sent"')
    print(out)
    time.sleep(5)
    out, _ = run(ssh, 'ps aux | grep newhype | grep -v grep || echo "no process"')
    print(f'After kill: {out}')

elif action == 'start':
    # Start with nohup, but don't wait for it
    cmd = f'cd {REMOTE_DIR} && nohup java -jar {JAR} --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 & echo "PID=$!"'
    channel = ssh.get_transport().open_session()
    channel.exec_command(cmd)
    # Wait just long enough to get the PID echo
    time.sleep(2)
    if channel.recv_ready():
        output = channel.recv(4096).decode().strip()
        print(f'Start output: {output}')
    else:
        print('Command sent (no immediate output)')
    channel.close()

elif action == 'status':
    out, _ = run(ssh, 'ps aux | grep newhype | grep -v grep')
    print(f'Process: {out if out else "Not running"}')

elif action == 'log':
    out, _ = run(ssh, f'tail -40 {REMOTE_DIR}/app.log 2>/dev/null', timeout=15)
    print(out)

elif action == 'logcheck':
    # Check if "Started" appears in log
    out, _ = run(ssh, f'grep -c "Started" {REMOTE_DIR}/app.log 2>/dev/null || echo "0"', timeout=10)
    print(f'Started count: {out}')
    out, _ = run(ssh, f'tail -5 {REMOTE_DIR}/app.log 2>/dev/null', timeout=10)
    print(f'Last lines:\n{out}')

ssh.close()
