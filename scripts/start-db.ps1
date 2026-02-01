<#
    🐳 Script de Control de Base de Datos MySQL
    Uso: .\scripts\start-db.ps1 -Action [start|stop|restart|logs|status|clean]
    
    Ejemplos:
    .\scripts\start-db.ps1 -Action start      # Levantar MySQL
    .\scripts\start-db.ps1 -Action stop       # Detener MySQL
    .\scripts\start-db.ps1 -Action restart    # Reiniciar MySQL
    .\scripts\start-db.ps1 -Action logs       # Ver logs (últimas 30 líneas)
    .\scripts\start-db.ps1 -Action status     # Ver estado + conteos
    .\scripts\start-db.ps1 -Action clean      # Eliminar volumen y resetear
#>

param(
    [ValidateSet("start", "stop", "restart", "logs", "status", "clean")]
    [string]$Action = "status",
    
    [int]$LogLines = 30
)

# Colores
$Success = "Green"
$Warning = "Yellow"
$Error = "Red"
$Info = "Cyan"

function Show-Header {
    Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor $Info
    Write-Host "║  🐳 MySQL ERP - Database Control Script                         ║" -ForegroundColor $Info
    Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor $Info
}

function Start-DB {
    Write-Host "🚀 Levantando MySQL..." -ForegroundColor $Success
    docker compose -f docker-compose.dev.yml up -d
    
    Write-Host "`n⏳ Esperando que MySQL esté listo..." -ForegroundColor $Warning
    Start-Sleep -Seconds 3
    
    # Verificar health
    $health = docker compose -f docker-compose.dev.yml ps --format "table {{.Names}}\t{{.Status}}" 
    if ($health -match "healthy" -or $health -match "running") {
        Write-Host "✅ MySQL INICIADO CORRECTAMENTE" -ForegroundColor $Success
        Write-Host "`n📊 Conexión:" -ForegroundColor $Info
        Write-Host "   Host: localhost"
        Write-Host "   Puerto: 3307"
        Write-Host "   Usuario: devuser"
        Write-Host "   Contraseña: devpass"
        Write-Host "   BD: erp_db"
    } else {
        Write-Host "⏳ MySQL está iniciando (revisa logs con: .\scripts\start-db.ps1 -Action logs)" -ForegroundColor $Warning
    }
}

function Stop-DB {
    Write-Host "🛑 Deteniendo MySQL..." -ForegroundColor $Warning
    docker compose -f docker-compose.dev.yml stop
    Write-Host "✅ MySQL DETENIDO" -ForegroundColor $Success
}

function Restart-DB {
    Write-Host "🔄 Reiniciando MySQL..." -ForegroundColor $Warning
    docker compose -f docker-compose.dev.yml restart mysql
    
    Write-Host "⏳ Esperando..." -ForegroundColor $Warning
    Start-Sleep -Seconds 3
    
    Write-Host "✅ MySQL REINICIADO" -ForegroundColor $Success
}

function Show-Logs {
    Write-Host "📋 ÚLTIMAS $LogLines LÍNEAS DE LOGS:" -ForegroundColor $Info
    Write-Host ("━" * 70) -ForegroundColor $Info
    docker compose -f docker-compose.dev.yml logs --tail=$LogLines mysql
    Write-Host ("━" * 70) -ForegroundColor $Info
}

function Show-Status {
    Write-Host "📊 ESTADO DEL CONTENEDOR:" -ForegroundColor $Info
    docker ps --filter "name=erp-mysql-dev" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    Write-Host "`n🔍 DATOS EN BASE DE DATOS:" -ForegroundColor $Info
    
    $productos = docker compose -f docker-compose.dev.yml exec -T mysql mysql -u devuser -pdevpass -se "SELECT COUNT(*) FROM erp_db.productos" 2>$null
    $categorias = docker compose -f docker-compose.dev.yml exec -T mysql mysql -u devuser -pdevpass -se "SELECT COUNT(*) FROM erp_db.categorias" 2>$null
    $usuarios = docker compose -f docker-compose.dev.yml exec -T mysql mysql -u devuser -pdevpass -se "SELECT COUNT(*) FROM erp_db.usuarios" 2>$null
    $almacenes = docker compose -f docker-compose.dev.yml exec -T mysql mysql -u devuser -pdevpass -se "SELECT COUNT(*) FROM erp_db.almacenes" 2>$null
    
    Write-Host "   Productos: $productos"
    Write-Host "   Categorías: $categorias"
    Write-Host "   Usuarios: $usuarios"
    Write-Host "   Almacenes: $almacenes"
}

function Clean-DB {
    Write-Host "🗑️  Eliminando volúmenes y reiniciando..." -ForegroundColor $Warning
    Write-Host "⚠️  ESTO ELIMINA TODOS LOS DATOS" -ForegroundColor $Error
    
    $confirm = Read-Host "¿Continuar? (s/n)"
    if ($confirm -eq "s") {
        docker compose -f docker-compose.dev.yml down -v
        Write-Host "✅ Volúmenes eliminados" -ForegroundColor $Success
        
        Write-Host "`n🚀 Levantando MySQL limpio..." -ForegroundColor $Success
        docker compose -f docker-compose.dev.yml up -d
        Start-Sleep -Seconds 3
        Write-Host "✅ Base de datos recreada con seed inicial" -ForegroundColor $Success
    } else {
        Write-Host "❌ Operación cancelada" -ForegroundColor $Error
    }
}

# Ejecutar acción
Show-Header

switch ($Action) {
    "start" { Start-DB }
    "stop" { Stop-DB }
    "restart" { Restart-DB }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "clean" { Clean-DB }
    default { Show-Status }
}

Write-Host "`n✅ Operación completada`n" -ForegroundColor $Success
