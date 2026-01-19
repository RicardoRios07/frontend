#!/bin/bash

# Script de Deploy para E-Commerce Frontend con Nginx
# Autor: Deploy Script Generator
# Fecha: 2026-01-19

set -e  # Detener el script si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="ecommerce-frontend"
PORT=3000
DOMAIN="${1:-localhost}"  # Usar el primer argumento o localhost por defecto

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deploy E-Commerce Frontend${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Directorio del proyecto: $PROJECT_DIR"
echo "Puerto: $PORT"
echo "Dominio: $DOMAIN"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json no encontrado. Asegúrate de estar en el directorio correcto.${NC}"
    exit 1
fi

# Verificar Node.js y pnpm
echo -e "${YELLOW}Verificando dependencias...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js no está instalado${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm no encontrado. Instalando pnpm...${NC}"
    npm install -g pnpm
fi

# Verificar nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}Error: Nginx no está instalado${NC}"
    echo "Instala nginx con: brew install nginx (macOS) o sudo apt install nginx (Ubuntu)"
    exit 1
fi

echo -e "${GREEN}✓ Todas las dependencias están instaladas${NC}"
echo ""

# Instalar dependencias
echo -e "${YELLOW}Instalando dependencias del proyecto...${NC}"
pnpm install

# Build del proyecto
echo -e "${YELLOW}Construyendo el proyecto...${NC}"
pnpm run build

if [ ! -d ".next" ]; then
    echo -e "${RED}Error: El build falló. No se encontró el directorio .next${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completado exitosamente${NC}"
echo ""

# Crear archivo de configuración de nginx
echo -e "${YELLOW}Creando configuración de nginx...${NC}"

NGINX_CONF="$PROJECT_DIR/nginx.conf"
cat > "$NGINX_CONF" << EOF
# Configuración de Nginx para E-Commerce Frontend
# Puerto del servidor Next.js: $PORT

upstream nextjs_upstream {
    server 127.0.0.1:$PORT;
    keepalive 64;
}

server {
    listen 80;
    server_name $DOMAIN;

    # Logs
    access_log /var/log/nginx/${PROJECT_NAME}_access.log;
    error_log /var/log/nginx/${PROJECT_NAME}_error.log;

    # Comprimir respuestas
    gzip on;
    gzip_proxied any;
    gzip_comp_level 4;
    gzip_types text/css application/javascript image/svg+xml;

    # Archivos estáticos de Next.js
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://nextjs_upstream;
        
        # Cache más agresivo para archivos estáticos
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Optimización para imágenes
    location ~ \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://nextjs_upstream;
        proxy_cache STATIC;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API y páginas dinámicas
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Configuración de cache
proxy_cache_path /var/cache/nginx/static levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;
EOF

echo -e "${GREEN}✓ Configuración de nginx creada en: $NGINX_CONF${NC}"
echo ""

# Instrucciones para configurar nginx
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Siguientes pasos:${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "1. Crear directorio de cache (requiere sudo):"
echo -e "   ${GREEN}sudo mkdir -p /var/cache/nginx/static${NC}"
echo ""
echo "2. Copiar la configuración de nginx (requiere sudo):"
echo -e "   ${GREEN}sudo cp $NGINX_CONF /usr/local/etc/nginx/servers/${PROJECT_NAME}.conf${NC}"
echo "   (macOS con Homebrew)"
echo ""
echo "   O para Linux:"
echo -e "   ${GREEN}sudo cp $NGINX_CONF /etc/nginx/sites-available/${PROJECT_NAME}${NC}"
echo -e "   ${GREEN}sudo ln -s /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/${NC}"
echo ""
echo "3. Verificar la configuración de nginx:"
echo -e "   ${GREEN}sudo nginx -t${NC}"
echo ""
echo "4. Recargar nginx:"
echo -e "   ${GREEN}sudo nginx -s reload${NC}"
echo "   O reiniciar nginx:"
echo -e "   ${GREEN}brew services restart nginx${NC} (macOS)"
echo -e "   ${GREEN}sudo systemctl restart nginx${NC} (Linux)"
echo ""
echo "5. Iniciar el servidor Next.js:"
echo -e "   ${GREEN}pnpm start${NC}"
echo "   O usar PM2 para mantenerlo en ejecución:"
echo -e "   ${GREEN}pm2 start 'pnpm start' --name ${PROJECT_NAME}${NC}"
echo -e "   ${GREEN}pm2 save${NC}"
echo ""
echo "¿Deseas ejecutar estos comandos automáticamente? (requiere sudo)"
read -p "Presiona 'y' para continuar o cualquier otra tecla para salir: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Configurando nginx...${NC}"
    
    # Crear directorio de cache
    sudo mkdir -p /var/cache/nginx/static
    
    # Detectar sistema operativo y copiar configuración
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sudo mkdir -p /usr/local/etc/nginx/servers
        sudo cp "$NGINX_CONF" "/usr/local/etc/nginx/servers/${PROJECT_NAME}.conf"
    else
        # Linux
        sudo cp "$NGINX_CONF" "/etc/nginx/sites-available/${PROJECT_NAME}"
        sudo ln -sf "/etc/nginx/sites-available/${PROJECT_NAME}" /etc/nginx/sites-enabled/
    fi
    
    # Verificar configuración
    echo -e "${YELLOW}Verificando configuración de nginx...${NC}"
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Configuración válida${NC}"
        echo -e "${YELLOW}Recargando nginx...${NC}"
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew services restart nginx
        else
            sudo systemctl restart nginx
        fi
        
        echo -e "${GREEN}✓ Nginx configurado y reiniciado${NC}"
        echo ""
        echo -e "${YELLOW}Iniciando servidor Next.js...${NC}"
        
        # Verificar si PM2 está instalado
        if command -v pm2 &> /dev/null; then
            pm2 delete $PROJECT_NAME 2>/dev/null || true
            pm2 start "pnpm start" --name $PROJECT_NAME
            pm2 save
            echo -e "${GREEN}✓ Servidor iniciado con PM2${NC}"
            echo ""
            echo "Comandos útiles de PM2:"
            echo "  - Ver logs: pm2 logs $PROJECT_NAME"
            echo "  - Reiniciar: pm2 restart $PROJECT_NAME"
            echo "  - Detener: pm2 stop $PROJECT_NAME"
        else
            echo -e "${YELLOW}PM2 no está instalado. Iniciando servidor manualmente...${NC}"
            echo "Para instalarlo: npm install -g pm2"
            echo ""
            echo "Ejecuta manualmente: pnpm start"
        fi
        
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  ¡Deploy completado!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "Tu aplicación está disponible en:"
        echo -e "  ${GREEN}http://$DOMAIN${NC}"
        echo ""
    else
        echo -e "${RED}Error en la configuración de nginx${NC}"
        exit 1
    fi
else
    echo ""
    echo -e "${YELLOW}Configuración manual requerida. Sigue los pasos anteriores.${NC}"
fi
