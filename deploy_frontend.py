import paramiko
import os
import stat

print('Connecting...', flush=True)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)
print('Connected!', flush=True)

sftp = ssh.open_sftp()

local_dist = r'C:\Dev\New-Hype-Project\frontend\dist'
remote_base = '/home/ventas/public_html'

def upload_dir(local_path, remote_path):
    """Recursively upload a directory via SFTP."""
    for item in os.listdir(local_path):
        local_item = os.path.join(local_path, item)
        remote_item = remote_path + '/' + item

        if os.path.isdir(local_item):
            # Create remote directory if it doesn't exist
            try:
                sftp.stat(remote_item)
            except FileNotFoundError:
                sftp.mkdir(remote_item)
                print(f'  mkdir {remote_item}', flush=True)
            upload_dir(local_item, remote_item)
        else:
            size = os.path.getsize(local_item)
            print(f'  upload {item} ({size:,} bytes)', flush=True)
            sftp.put(local_item, remote_item)

# Clean up old assets first
print('Cleaning old assets...', flush=True)
stdin, stdout, stderr = ssh.exec_command('rm -rf /home/ventas/public_html/assets')
stdout.read()

# Upload dist contents to public_html
print('Uploading frontend dist...', flush=True)
upload_dir(local_dist, remote_base)

# Write SPA .htaccess for client-side routing
htaccess_content = """# php -- BEGIN cPanel-generated handler, do not edit
# Set the "ea-php81" package as the default "PHP" programming language.
<IfModule mime_module>
  AddHandler application/x-httpd-ea-php81 .php .php8 .phtml
</IfModule>
# php -- END cPanel-generated handler, do not edit

# SPA Routing - redirect all non-file requests to index.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^New-Hype-Project/api/ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
"""

print('Writing .htaccess for SPA routing...', flush=True)
with sftp.open(remote_base + '/.htaccess', 'w') as f:
    f.write(htaccess_content)

sftp.close()

# Verify
print('Verifying...', flush=True)
stdin, stdout, stderr = ssh.exec_command('ls -la /home/ventas/public_html/ | head -20')
print(stdout.read().decode(), flush=True)

stdin, stdout, stderr = ssh.exec_command('ls -la /home/ventas/public_html/assets/ | head -10')
print(stdout.read().decode(), flush=True)

ssh.close()
print('DONE!', flush=True)
