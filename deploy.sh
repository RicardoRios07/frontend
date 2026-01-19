#!/bin/bash

# Script de despliegue para E-Commerce Frontend
# Uso: ./deploy.sh [environment]
# Ejemplo: ./deploy.sh production

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Variables
ENVIRONMENT=${1:-production}
APP_NAME="ecommerce-frontend"
PORT=${PORT:-3000}

print_message "Iniciando despliegue en modo: $ENVIRONMENT"

# 1. Verificar Node.js y pnpm
print_message "Verificando dependencias del sistema..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm no está instalado. Instalando..."
    npm install -g pnpm
fi

if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 no está instalado. Instalando..."
    npm install -g pm2
fi

# 2. Instalar dependencias
print_message "Instalando dependencias..."
pnpm install --frozen-lockfile

# 3. Verificar variables de entorno
if [ ! -f .env.local ] && [ ! -f .env.production ]; then
    print_warning "No se encontró archivo .env.local o .env.production"
    print_message "Creando .env.local desde .env.example si existe..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        print_warning "Por favor, configura las variables de entorno en .env.local"
    fi
fi

# 4. Limpiar build anterior
print_message "Limpiando builds anteriores..."
rm -rf .next
rm -rf out

# 5. Build de la aplicación
print_message "Construyendo aplicación Next.js..."
if [ "$ENVIRONMENT" = "production" ]; then
    pnpm run build
else
    NODE_ENV=$ENVIRONMENT pnpm run build
fi

# 6. Detener proceso anterior si existe
print_message "Deteniendo proceso anterior de PM2..."
pm2 delete $APP_NAME 2>/dev/null || true

# 7. Iniciar aplicación con PM2
print_message "Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js --env $ENVIRONMENT

# 8. Guardar configuración de PM2
print_message "Guardando configuración de PM2..."
pm2 save

# 9. Configurar PM2 para inicio automático (solo en producción)
if [ "$ENVIRONMENT" = "production" ]; then
    print_message "Configurando PM2 para inicio automático..."
    pm2 startup || true
fi

# 10. Mostrar estado
print_message "Estado de la aplicación:"
pm2 status

# 11. Mostrar logs
print_message "==================================="
print_message "Despliegue completado exitosamente!"
print_message "==================================="
print_message "Aplicación: $APP_NAME"
print_message "Puerto: $PORT"
print_message "Ambiente: $ENVIRONMENT"
print_message ""
print_message "Comandos útiles:"
print_message "  - Ver logs:      pm2 logs $APP_NAME"
print_message "  - Ver estado:    pm2 status"
print_message "  - Reiniciar:     pm2 restart $APP_NAME"
print_message "  - Detener:       pm2 stop $APP_NAME"
print_message "  - Eliminar:      pm2 delete $APP_NAME"
print_message "  - Monitorear:    pm2 monit"
print_message ""
print_message "La aplicación debería estar disponible en: http://localhost:$PORT"
