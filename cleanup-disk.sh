#!/bin/bash

# Script para limpiar espacio en disco
# Útil para servidores con poco almacenamiento

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Limpieza de Espacio en Disco${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Mostrar uso actual
echo "Espacio en disco actual:"
df -h /
echo ""

echo "Los 10 directorios más grandes en raíz:"
du -sh /* 2>/dev/null | sort -h | tail -10
echo ""

# Opciones de limpieza
echo -e "${YELLOW}Opciones de limpieza:${NC}"
echo "1. Limpiar cache de npm/pnpm"
echo "2. Limpiar archivos temporales"
echo "3. Limpiar logs antiguos"
echo "4. Limpiar builds antiguos (.next, dist, build)"
echo "5. Limpiar paquetes no utilizados (apt autoremove)"
echo "6. Todo lo anterior"
echo "7. Análisis detallado (ver qué ocupa espacio)"
echo ""
read -p "Selecciona una opción [6]: " CLEAN_OPTION
CLEAN_OPTION=${CLEAN_OPTION:-6}

case $CLEAN_OPTION in
    1|6)
        echo -e "${YELLOW}Limpiando cache de npm...${NC}"
        npm cache clean --force 2>/dev/null || true
        
        echo -e "${YELLOW}Limpiando cache de pnpm...${NC}"
        pnpm store prune 2>/dev/null || true
        
        echo -e "${GREEN}✓ Cache limpiado${NC}"
        ;;& # Continuar al siguiente caso si es 6
    2|6)
        echo -e "${YELLOW}Limpiando archivos temporales...${NC}"
        sudo rm -rf /tmp/* 2>/dev/null || true
        sudo rm -rf /var/tmp/* 2>/dev/null || true
        
        echo -e "${GREEN}✓ Archivos temporales eliminados${NC}"
        ;;& # Continuar al siguiente caso si es 6
    3|6)
        echo -e "${YELLOW}Limpiando logs antiguos...${NC}"
        sudo find /var/log -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
        sudo find /var/log -name "*.gz" -type f -delete 2>/dev/null || true
        sudo journalctl --vacuum-time=3d 2>/dev/null || true
        
        echo -e "${GREEN}✓ Logs antiguos eliminados${NC}"
        ;;& # Continuar al siguiente caso si es 6
    4|6)
        echo -e "${YELLOW}Limpiando builds antiguos...${NC}"
        find /home -name ".next" -type d -exec du -sh {} \; 2>/dev/null
        read -p "¿Deseas eliminar estos directorios? (s/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            find /home -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
            find /home -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
            find /home -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
            echo -e "${GREEN}✓ Builds antiguos eliminados${NC}"
        fi
        ;;& # Continuar al siguiente caso si es 6
    5|6)
        if command -v apt &> /dev/null; then
            echo -e "${YELLOW}Limpiando paquetes no utilizados...${NC}"
            sudo apt autoremove -y 2>/dev/null || true
            sudo apt clean 2>/dev/null || true
            echo -e "${GREEN}✓ Paquetes no utilizados eliminados${NC}"
        fi
        ;;
    7)
        echo ""
        echo -e "${YELLOW}Analizando uso de disco...${NC}"
        echo ""
        echo "Directorios más grandes en /home:"
        sudo du -h /home 2>/dev/null | sort -h | tail -20
        echo ""
        echo "Archivos más grandes en el sistema:"
        sudo find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null | awk '{ print $9 ": " $5 }'
        echo ""
        exit 0
        ;;
    *)
        echo "Opción no válida"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Limpieza completada${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Espacio en disco después de la limpieza:"
df -h /
echo ""

# Calcular espacio liberado
AVAILABLE_NOW=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
echo -e "${GREEN}Espacio disponible: ${AVAILABLE_NOW}GB${NC}"
echo ""

if [ "$AVAILABLE_NOW" -lt 2 ]; then
    echo -e "${YELLOW}Todavía tienes poco espacio (<2GB).${NC}"
    echo ""
    echo "Considera:"
    echo "  - Aumentar el tamaño del disco en tu proveedor cloud"
    echo "  - Eliminar archivos grandes manualmente"
    echo "  - Mover node_modules a un volumen más grande"
    echo ""
    echo "Para encontrar archivos grandes:"
    echo "  sudo find / -type f -size +100M -exec ls -lh {} \\; 2>/dev/null"
fi
