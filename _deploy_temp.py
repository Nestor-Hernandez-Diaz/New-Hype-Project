"""Temporary deployment script - upload JAR and restart backend"""
import paramiko
import sys
import os

HOST = 'spring.informaticapp.com'
USER = 'ventas'
# Password from docs/DEPLOY_CORS_PASOS.md line 108
PWD = 'AC$%$#es0r1Oz20#26&#'

LOCAL_JAR = r'C:\Dev\New-Hype-Project\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar'

def main():
    action = sys.argv[1] if len(sys.argv) > 1 else 'check'

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print(f'Connecting to {HOST} as {USER}...')
    ssh.connect(HOST, username=USER, password=PWD, timeout=30)
    print('Connected!')

    if action == 'check':
        # Check current state
        cmds = [
            ('JAVA PROCESSES', 'ps aux | grep java | grep -v grep'),
            ('JAR LOCATIONS', 'find ~ -name "newhype-backend*.jar" -type f 2>/dev/null'),
            ('~/New-Hype-Project/', 'ls -la ~/New-Hype-Project/ 2>/dev/null || echo "Not found"'),
            ('HOME DIR', 'ls -la ~ | head -20'),
        ]
        for label, cmd in cmds:
            _, stdout, stderr = ssh.exec_command(cmd)
            out = stdout.read().decode().strip()
            err = stderr.read().decode().strip()
            print(f'\n=== {label} ===')
            print(out if out else '(empty)')
            if err:
                print(f'STDERR: {err}')

    elif action == 'upload':
        # Find the correct remote path first
        _, stdout, _ = ssh.exec_command('find ~ -name "newhype-backend*.jar" -type f 2>/dev/null')
        jar_paths = stdout.read().decode().strip().split('\n')
        jar_paths = [p for p in jar_paths if p.strip()]

        if jar_paths:
            remote_path = jar_paths[0]
            remote_dir = os.path.dirname(remote_path)
        else:
            remote_dir = os.path.expanduser('~/New-Hype-Project')
            remote_path = f'{remote_dir}/newhype-backend-0.0.1-SNAPSHOT.jar'

        print(f'Uploading JAR to {remote_path}...')
        sftp = ssh.open_sftp()

        local_size = os.path.getsize(LOCAL_JAR)
        print(f'Local JAR size: {local_size / 1024 / 1024:.1f} MB')

        sftp.put(LOCAL_JAR, remote_path, callback=lambda sent, total: print(f'\r  Progress: {sent*100//total}%', end='', flush=True))
        print(f'\nUpload complete!')

        # Verify
        remote_stat = sftp.stat(remote_path)
        print(f'Remote file size: {remote_stat.st_size / 1024 / 1024:.1f} MB')
        assert remote_stat.st_size == local_size, 'Size mismatch!'
        print('Size verified OK')

        sftp.close()

    elif action == 'restart':
        # Find JAR location
        _, stdout, _ = ssh.exec_command('find ~ -name "newhype-backend*.jar" -type f 2>/dev/null')
        jar_paths = stdout.read().decode().strip().split('\n')
        jar_paths = [p for p in jar_paths if p.strip()]

        if not jar_paths:
            print('ERROR: No JAR found on server!')
            ssh.close()
            return

        remote_jar = jar_paths[0]
        remote_dir = os.path.dirname(remote_jar)
        jar_name = os.path.basename(remote_jar)

        print(f'JAR found at: {remote_jar}')

        # Kill existing java process
        print('\nStopping current backend...')
        _, stdout, _ = ssh.exec_command('pkill -f "java -jar" 2>/dev/null; echo "done"')
        print(stdout.read().decode().strip())

        import time
        time.sleep(3)

        # Verify stopped
        _, stdout, _ = ssh.exec_command('ps aux | grep java | grep -v grep')
        out = stdout.read().decode().strip()
        if out:
            print(f'WARNING: Java still running: {out}')
            print('Force killing...')
            _, stdout, _ = ssh.exec_command('pkill -9 -f "java -jar" 2>/dev/null; echo "done"')
            print(stdout.read().decode().strip())
            time.sleep(2)

        # Start new process
        print(f'\nStarting new backend from {remote_dir}...')
        start_cmd = f'cd {remote_dir} && nohup java -jar {jar_name} --spring.profiles.active=prod --server.port=5001 > app.log 2>&1 & echo $!'
        _, stdout, stderr = ssh.exec_command(start_cmd)
        pid = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        print(f'Started with PID: {pid}')
        if err:
            print(f'STDERR: {err}')

        # Wait for startup
        print('\nWaiting 40 seconds for application startup...')
        time.sleep(40)

        # Check process is running
        _, stdout, _ = ssh.exec_command('ps aux | grep java | grep -v grep')
        out = stdout.read().decode().strip()
        if out:
            print(f'Process running: {out[:150]}')
        else:
            print('ERROR: Process not running!')

        # Check log tail
        _, stdout, _ = ssh.exec_command(f'tail -30 {remote_dir}/app.log 2>/dev/null')
        log = stdout.read().decode().strip()
        print(f'\n=== LAST 30 LINES OF LOG ===')
        print(log)

    elif action == 'log':
        _, stdout, _ = ssh.exec_command('find ~ -name "newhype-backend*.jar" -type f 2>/dev/null')
        jar_paths = stdout.read().decode().strip().split('\n')
        remote_dir = os.path.dirname(jar_paths[0]) if jar_paths[0].strip() else '~/New-Hype-Project'

        _, stdout, _ = ssh.exec_command(f'tail -50 {remote_dir}/app.log 2>/dev/null')
        print(stdout.read().decode())

    ssh.close()
    print('\nDone.')

if __name__ == '__main__':
    main()
