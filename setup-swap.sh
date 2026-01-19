#!/bin/bash

# Script para configurar swap en servidores con poca memoria
# Esto ayuda cuando npm/pnpm consumen mucha RAM

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Configurar Swap${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar si ya existe swap
CURRENT_SWAP=$(free -m | awk '/^Swap:/ {print $2}')
echo "Swap actual: ${CURRENT_SWAP}MB"

if [ "$CURRENT_SWAP" -gt 0 ]; then
    echo -e "${YELLOW}Ya existe swap configurado.${NC}"
    read -p "¿Deseas agregar más swap? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Saliendo..."
        exit 0
    fi
fi

# Tamaño de swap recomendado (en GB)
echo ""
echo "Tamaños recomendados de swap:"
echo "  - 1GB: Para servidores con 512MB-1GB RAM"
echo "  - 2GB: Para servidores con 1-2GB RAM"
echo "  - 4GB: Para servidores con 2-4GB RAM"
echo ""
read -p "¿Cuántos GB de swap deseas crear? [2]: " SWAP_SIZE
SWAP_SIZE=${SWAP_SIZE:-2}

echo ""
echo -e "${YELLOW}Creando ${SWAP_SIZE}GB de swap...${NC}"

# Crear archivo de swap
sudo fallocate -l ${SWAP_SIZE}G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=$((SWAP_SIZE * 1024))

# Configurar permisos
sudo chmod 600 /swapfile

# Configurar swap
sudo mkswap /swapfile

# Activar swap
sudo swapon /swapfile

# Verificar
echo ""
echo -e "${GREEN}✓ Swap activado:${NC}"
free -h

# Hacer permanente
if ! grep -q '/swapfile' /etc/fstab; then
    echo ""
    echo -e "${YELLOW}Haciendo el swap permanente...${NC}"
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}✓ Swap configurado para persistir después de reiniciar${NC}"
fi

# Optimizar configuración de swap
echo ""
echo -e "${YELLOW}Optimizando configuración de swap...${NC}"
sudo sysctl vm.swappiness=10
sudo sysctl vm.vfs_cache_pressure=50

# Hacer permanente
if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
fi
if ! grep -q 'vm.vfs_cache_pressure' /etc/sysctl.conf; then
    echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
fi

echo -e "${GREEN}✓ Configuración optimizada${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ¡Swap configurado exitosamente!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Memoria total disponible:"
free -h
echo ""
echo "Ahora puedes ejecutar el script de deploy nuevamente:"
echo -e "  ${GREEN}bash deploy.sh${NC}"
