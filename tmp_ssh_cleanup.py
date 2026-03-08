import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#')

commands = [
    # 1. Remove duplicate .jar from home directory
    ("Removing duplicate .jar from home",
     "rm -f /home/ventas/newhype-backend-0.0.1-SNAPSHOT.jar"),

    # 2. Remove .jar.bak from NHP directory
    ("Removing .jar.bak from NHP",
     "rm -f /home/ventas/public_html/New-Hype-Project/newhype-backend-0.0.1-SNAPSHOT.jar.bak"),

    # 3. Remove newhype-backend.pid from home (if exists)
    ("Removing pid file from home",
     "rm -f /home/ventas/newhype-backend.pid"),

    # 4. Remove app.log from home (duplicate - the real one is in NHP dir)
    ("Removing duplicate app.log from home",
     "rm -f /home/ventas/app.log"),

    # 5. Remove frontend files from public_html (index.html, sw.js, vite.svg, assets/)
    ("Removing frontend files from public_html",
     "rm -f /home/ventas/public_html/index.html /home/ventas/public_html/sw.js /home/ventas/public_html/vite.svg && rm -rf /home/ventas/public_html/assets/"),

    # 6. Verify: list home directory after cleanup
    ("=== HOME AFTER CLEANUP ===",
     "ls -la /home/ventas/ | grep -v '^\\.\\|^d'"),

    # 7. Verify: list public_html after cleanup
    ("=== PUBLIC_HTML AFTER CLEANUP ===",
     "ls -la /home/ventas/public_html/"),

    # 8. Verify: list NHP dir after cleanup
    ("=== NHP DIR AFTER CLEANUP ===",
     "ls -la /home/ventas/public_html/New-Hype-Project/"),

    # 9. Verify: find all .jar files
    ("=== ALL JAR FILES AFTER ===",
     "find /home/ventas/ -name '*.jar' -type f 2>/dev/null"),

    # 10. Verify backend still running
    ("=== BACKEND PROCESS ===",
     "ps aux | grep 'ventas.*java' | grep -v grep"),
]

for label, cmd in commands:
    print(f"\n{label}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        print(out)
    if err and 'Warning' not in err and 'Permission denied' not in err:
        print(f'STDERR: {err}')
    if not out and not err:
        print('(done)')

ssh.close()
print("\n=== CLEANUP COMPLETE ===")
