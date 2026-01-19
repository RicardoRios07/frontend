# Guía de Deploy - E-Commerce Frontend

Esta guía te ayudará a desplegar tu aplicación Next.js con Nginx.

## Pre-requisitos

### 1. Instalar dependencias del sistema

#### macOS
```bash
# Instalar Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js y Nginx
brew install node nginx

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 (opcional pero recomendado)
npm install -g pm2
```

#### Ubuntu/Debian
```bash
# Actualizar paquetes
sudo apt update

# Instalar Node.js (versión 18 o superior)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Nginx
sudo apt install -y nginx

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 (opcional pero recomendado)
npm install -g pm2
```

## Deploy Rápido

### Opción 1: Script Automatizado (Recomendado)

```bash
# Dar permisos de ejecución al script
chmod +x deploy.sh

# Ejecutar el script (usa tu dominio o localhost)
./deploy.sh midominio.com

# O simplemente:
./deploy.sh
```

El script te guiará paso a paso y puede configurar todo automáticamente.

### Opción 2: Deploy Manual

#### Paso 1: Build del proyecto
```bash
# Instalar dependencias
pnpm install

# Construir el proyecto
pnpm run build
```

#### Paso 2: Configurar Nginx

##### macOS (Homebrew)
```bash
# Ejecutar el script primero para generar nginx.conf
./deploy.sh

# Copiar la configuración
sudo mkdir -p /usr/local/etc/nginx/servers
sudo cp nginx.conf /usr/local/etc/nginx/servers/ecommerce-frontend.conf

# Crear directorio de cache
sudo mkdir -p /var/cache/nginx/static

# Verificar configuración
sudo nginx -t

# Reiniciar nginx
brew services restart nginx
```

##### Linux
```bash
# Ejecutar el script primero para generar nginx.conf
./deploy.sh

# Copiar la configuración
sudo cp nginx.conf /etc/nginx/sites-available/ecommerce-frontend
sudo ln -s /etc/nginx/sites-available/ecommerce-frontend /etc/nginx/sites-enabled/

# Crear directorio de cache
sudo mkdir -p /var/cache/nginx/static

# Verificar configuración
sudo nginx -t

# Reiniciar nginx
sudo systemctl restart nginx
```

#### Paso 3: Iniciar la aplicación

##### Con PM2 (Recomendado)
```bash
# Opción 1: Usando el archivo de configuración
pm2 start ecosystem.config.js

# Opción 2: Comando directo
pm2 start "pnpm start" --name ecommerce-frontend

# Guardar la configuración de PM2
pm2 save

# Configurar PM2 para iniciar en el arranque del sistema
pm2 startup
```

##### Sin PM2
```bash
pnpm start
```

## Configuración SSL (HTTPS)

### Usando Certbot (Let's Encrypt)

#### Ubuntu/Debian
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tudominio.com
```

#### macOS
```bash
# Instalar Certbot
brew install certbot

# Obtener certificado (requiere configuración manual)
sudo certbot certonly --standalone -d tudominio.com
```

Después de obtener el certificado, nginx.conf se actualizará automáticamente.

## Variables de Entorno

Asegúrate de configurar las variables de entorno en `.env.production`:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.tudominio.com
```

## Comandos Útiles

### PM2
```bash
# Ver estado de las aplicaciones
pm2 list

# Ver logs
pm2 logs ecommerce-frontend

# Ver logs en tiempo real
pm2 logs ecommerce-frontend --lines 100

# Reiniciar aplicación
pm2 restart ecommerce-frontend

# Detener aplicación
pm2 stop ecommerce-frontend

# Eliminar aplicación
pm2 delete ecommerce-frontend

# Monitoreo
pm2 monit
```

### Nginx
```bash
# Verificar configuración
sudo nginx -t

# Recargar configuración (sin tiempo de inactividad)
sudo nginx -s reload

# Reiniciar servicio (macOS)
brew services restart nginx

# Reiniciar servicio (Linux)
sudo systemctl restart nginx

# Ver logs
tail -f /var/log/nginx/ecommerce-frontend_access.log
tail -f /var/log/nginx/ecommerce-frontend_error.log
```

### Next.js
```bash
# Desarrollo
pnpm dev

# Build
pnpm run build

# Producción
pnpm start

# Linting
pnpm run lint
```

## Actualización de la Aplicación

```bash
# 1. Detener la aplicación
pm2 stop ecommerce-frontend

# 2. Obtener últimos cambios
git pull origin main

# 3. Instalar dependencias (si hay cambios)
pnpm install

# 4. Rebuild
pnpm run build

# 5. Reiniciar aplicación
pm2 restart ecommerce-frontend
```

O crear un script de actualización:
```bash
# Crear script de actualización
cat > update.sh << 'EOF'
#!/bin/bash
set -e
echo "Actualizando aplicación..."
pm2 stop ecommerce-frontend
git pull origin main
pnpm install
pnpm run build
pm2 restart ecommerce-frontend
echo "Actualización completada!"
EOF

chmod +x update.sh
```

## Troubleshooting

### Error: "nginx: command not found"
```bash
# macOS
brew install nginx

# Ubuntu/Debian
sudo apt install nginx
```

### Error: "Cannot find module 'next'"
```bash
# Reinstalar dependencias
rm -rf node_modules .next
pnpm install
pnpm run build
```

### Puerto 3000 en uso
```bash
# Ver qué proceso está usando el puerto
lsof -i :3000

# Matar el proceso
kill -9 <PID>
```

### Nginx no inicia
```bash
# Verificar configuración
sudo nginx -t

# Ver logs de error
tail -f /var/log/nginx/error.log
```

### La aplicación no responde
```bash
# Ver logs de PM2
pm2 logs ecommerce-frontend

# Reiniciar aplicación
pm2 restart ecommerce-frontend

# Si persiste, rebuild
pnpm run build
pm2 restart ecommerce-frontend
```

## Monitoreo y Logs

### Logs de la aplicación
Los logs se guardan en `./logs/` cuando usas PM2:
- `pm2-error.log`: Errores de la aplicación
- `pm2-out.log`: Output estándar

### Logs de Nginx
- Access log: `/var/log/nginx/ecommerce-frontend_access.log`
- Error log: `/var/log/nginx/ecommerce-frontend_error.log`

## Seguridad

1. **Firewall**: Configura el firewall para permitir solo los puertos necesarios
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Actualizar dependencias**: Mantén tus dependencias actualizadas
   ```bash
   pnpm update
   ```

3. **Variables de entorno**: Nunca comitas archivos con credenciales sensibles

4. **HTTPS**: Usa siempre SSL en producción

## Recursos Adicionales

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Let's Encrypt](https://letsencrypt.org/)

## Soporte

Si encuentras problemas durante el deploy, revisa:
1. Los logs de PM2: `pm2 logs ecommerce-frontend`
2. Los logs de Nginx: `/var/log/nginx/`
3. La configuración de Nginx: `sudo nginx -t`
