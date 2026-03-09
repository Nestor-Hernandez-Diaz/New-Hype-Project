# Deploy Backend - New Hype Project
# Uso: .\deploy_backend.ps1
# Requisito: SSH key configurada (ejecutar tmp_setup_ssh_key.py primero)

$ErrorActionPreference = "Stop"

# === CONFIGURACION ===
$localJar = "$PSScriptRoot\newhype-backend\target\newhype-backend-0.0.1-SNAPSHOT.jar"
$remoteUser = "ventas@spring.informaticapp.com"
$remotePath = "/home/ventas/public_html/New-Hype-Project"
$remoteJar = "$remotePath/newhype-backend-0.0.1-SNAPSHOT.jar"
$port = 5001

# === VALIDACIONES ===
if (-not (Test-Path $localJar)) {
    Write-Host "ERROR: No se encontro el JAR en: $localJar" -ForegroundColor Red
    Write-Host "Ejecuta primero: mvn clean package -DskipTests" -ForegroundColor Yellow
    exit 1
}

$jarSize = [math]::Round((Get-Item $localJar).Length / 1MB, 1)
Write-Host "=== DEPLOY BACKEND NEW HYPE ===" -ForegroundColor White
Write-Host "JAR: $jarSize MB" -ForegroundColor Gray

# === PASO 1: DETENER APP ANTERIOR ===
Write-Host "`n[1/4] Deteniendo aplicacion anterior..." -ForegroundColor Yellow
ssh $remoteUser "pkill -f 'newhype-backend.*SNAPSHOT.jar' 2>/dev/null && echo 'Detenida' || echo 'No estaba corriendo'"

# === PASO 2: SUBIR JAR ===
Write-Host "`n[2/4] Subiendo JAR ($jarSize MB)..." -ForegroundColor Cyan
$sw = [System.Diagnostics.Stopwatch]::StartNew()
scp -C $localJar "${remoteUser}:${remoteJar}"
$sw.Stop()
Write-Host "Subido en $([math]::Round($sw.Elapsed.TotalSeconds, 1))s" -ForegroundColor Green

# === PASO 3: INICIAR APP ===
Write-Host "`n[3/4] Iniciando aplicacion en puerto $port..." -ForegroundColor Green
ssh $remoteUser "cd $remotePath && nohup java -jar $remoteJar --spring.profiles.active=prod --server.port=$port > app.log 2>&1 &"

# === PASO 4: VERIFICAR ===
Write-Host "`n[4/4] Verificando (esperando arranque)..." -ForegroundColor Magenta
$maxRetries = 12
$retryDelay = 5
$success = $false

for ($i = 1; $i -le $maxRetries; $i++) {
    Start-Sleep -Seconds $retryDelay
    $health = ssh $remoteUser "curl -s -o /dev/null -w '%{http_code}' http://localhost:${port}/New-Hype-Project/actuator/health 2>/dev/null || echo '000'"
    if ($health -eq "200") {
        $success = $true
        break
    }
    Write-Host "  Intento $i/$maxRetries - Estado: $health" -ForegroundColor Gray
}

if ($success) {
    Write-Host "`n=== DEPLOY EXITOSO ===" -ForegroundColor Green
    Write-Host "App corriendo en puerto $port" -ForegroundColor White
} else {
    Write-Host "`n=== ADVERTENCIA: App no respondio al health check ===" -ForegroundColor Yellow
    Write-Host "Revisando logs..." -ForegroundColor Gray
    ssh $remoteUser "tail -20 $remotePath/app.log"
}
