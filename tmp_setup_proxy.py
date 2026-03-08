import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('spring.informaticapp.com', username='ventas', password='AC$%$#es0r1Oz20#26&#', timeout=15)
print('Connected!', flush=True)

sftp = ssh.open_sftp()

htaccess_content = """# php -- BEGIN cPanel-generated handler, do not edit
# Set the "ea-php81" package as the default "PHP" programming language.
<IfModule mime_module>
  AddHandler application/x-httpd-ea-php81 .php .php8 .phtml
</IfModule>
# php -- END cPanel-generated handler, do not edit

# Reverse proxy for Spring Boot backend
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Proxy API requests to backend on port 5001
  RewriteRule ^New-Hype-Project/api/(.*)$ http://127.0.0.1:5001/New-Hype-Project/api/$1 [P,L]

  # SPA Routing - redirect all non-file requests to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/New-Hype-Project/
  RewriteRule . /index.html [L]
</IfModule>
"""

print('Writing .htaccess with reverse proxy...', flush=True)
with sftp.open('/home/ventas/public_html/.htaccess', 'w') as f:
    f.write(htaccess_content)
print('Done writing .htaccess', flush=True)

sftp.close()

# Test
import time
time.sleep(2)
stdin, stdout, stderr = ssh.exec_command('curl -sI https://ventas.spring.informaticapp.com/New-Hype-Project/api/v1/storefront/productos?tenantId=1 2>&1 | head -15')
print('Test proxy:')
print(stdout.read().decode())

ssh.close()
print('Done', flush=True)
