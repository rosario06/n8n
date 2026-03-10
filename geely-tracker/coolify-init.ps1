# ==================== GEELY TRACKER - COOLIFY QUICK SETUP (PowerShell) ====================

Write-Host "`n🚀 Inicializando Geely Tracker en Coolify..." -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Archivo .env.local no encontrado" -ForegroundColor Yellow
    Write-Host "Creando .env.local desde .env.example..."
    Copy-Item ".env.example" ".env.local"
    Write-Host "✓ .env.local creado" -ForegroundColor Green
    Write-Host "`n⚠️ Por favor, edita .env.local con tus credenciales reales" -ForegroundColor Yellow
    exit 1
}

# Check Docker
try {
    $docker = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker instalado: $docker" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Docker no está instalado" -ForegroundColor Red
    exit 1
}

# Check Docker Compose
try {
    $compose = docker-compose --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker Compose instalado: $compose" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Docker Compose no está instalado" -ForegroundColor Red
    exit 1
}

# Start containers
Write-Host "`n📦 Iniciando contenedores..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Contenedores iniciados" -ForegroundColor Green
} else {
    Write-Host "✗ Error al iniciar contenedores" -ForegroundColor Red
    exit 1
}

# Wait for database
Write-Host "`n⏳ Esperando PostgreSQL (15 segundos)..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Show status
Write-Host "`n📊 Estado de contenedores:" -ForegroundColor Cyan
docker-compose ps

# Show access info
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ Geely Tracker está iniciando!                          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Acceso:" -ForegroundColor Green
Write-Host "  🌐 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  🗄️  PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Green
Write-Host "  1. Abre http://localhost:5173 en tu navegador" -ForegroundColor White
Write-Host "  2. Verifica que los webhooks de n8n están activos" -ForegroundColor White
Write-Host "  3. Prueba agregar ingresos/gastos en la UI" -ForegroundColor White
Write-Host ""
Write-Host "Ver logs:" -ForegroundColor Green
Write-Host "  docker-compose logs -f frontend" -ForegroundColor White
Write-Host "  docker-compose logs -f db" -ForegroundColor White
Write-Host ""
