#!/bin/bash

# ==================== GEELY TRACKER - COOLIFY QUICK SETUP ====================
# Script para inicializar rápidamente en Coolify

echo "🚀 Inicializando Geely Tracker en Coolify..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_warning "Archivo .env.local no encontrado"
    echo "Creando .env.local desde .env.example..."
    cp .env.example .env.local
    print_status ".env.local creado"
    print_warning "⚠️ Por favor, edita .env.local con tus credenciales reales"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    echo "Instala Docker desde https://docs.docker.com/install/"
    exit 1
fi

print_status "Docker instalado"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
    exit 1
fi

print_status "Docker Compose instalado"

# Start containers
echo ""
echo "📦 Iniciando contenedores..."
docker-compose up -d

if [ $? -eq 0 ]; then
    print_status "Contenedores iniciados"
else
    print_error "Error al iniciar contenedores"
    exit 1
fi

# Wait for database
echo ""
echo "⏳ Esperando PostgreSQL..."
sleep 10

# Check database
if docker-compose exec -T db psql -U geely_user -d geely_db -c "SELECT 1" &>/dev/null; then
    print_status "PostgreSQL conectado"
else
    print_warning "PostgreSQL aún no está listo, esperando..."
    sleep 10
fi

# Show status
echo ""
echo "📊 Estado de contenedores:"
docker-compose ps

# Show access info
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Geely Tracker está iniciando!${NC}"
echo ""
echo "Acceso:"
echo "  🌐 Frontend: http://localhost:5173"
echo "  🗄️  PostgreSQL: localhost:5432"
echo ""
echo "Próximos pasos:"
echo "  1. Abre http://localhost:5173 en tu navegador"
echo "  2. Verifica que los webhooks de n8n están activos"
echo "  3. Prueba agregar ingresos/gastos en la UI"
echo ""
echo "Ver logs:"
echo "  docker-compose logs -f frontend"
echo "  docker-compose logs -f db"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
