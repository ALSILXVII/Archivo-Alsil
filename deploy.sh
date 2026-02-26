#!/bin/bash
# ==============================================
# Script de deployment para Archivo Alsil
# Ejecutar en el servidor VPS
# ==============================================

set -e

APP_DIR="/var/www/archivo-alsil"
REPO_URL="$1"

if [ -z "$REPO_URL" ]; then
  echo "Uso: ./deploy.sh <URL_DEL_REPOSITORIO_GIT>"
  echo "Ejemplo: ./deploy.sh https://github.com/tu-usuario/archivo-alsil.git"
  exit 1
fi

echo "=========================================="
echo "  Deployment de Archivo Alsil"
echo "=========================================="

# 1. Actualizar sistema
echo "[1/8] Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 20 LTS
echo "[2/8] Instalando Node.js..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

# 3. Instalar PM2
echo "[3/8] Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

# 4. Instalar Nginx
echo "[4/8] Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
  sudo apt install -y nginx
fi

# 5. Clonar o actualizar repositorio
echo "[5/8] Configurando repositorio..."
if [ -d "$APP_DIR" ]; then
  echo "Actualizando repositorio existente..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "Clonando repositorio..."
  sudo mkdir -p "$APP_DIR"
  sudo chown $USER:$USER "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# 6. Instalar dependencias y compilar
echo "[6/8] Instalando dependencias y compilando..."
npm install
npm run build

# 7. Crear directorios necesarios
echo "[7/8] Creando directorios..."
mkdir -p content/posts
mkdir -p public/uploads

# 8. Iniciar con PM2
echo "[8/8] Iniciando aplicación con PM2..."
pm2 delete archivo-alsil 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER 2>/dev/null || true

echo ""
echo "=========================================="
echo "  ¡Deployment completado!"
echo "=========================================="
echo ""
echo "La app está corriendo en http://localhost:3000"
echo ""
echo "Próximos pasos:"
echo "  1. Configura Nginx (ver nginx.conf en el repo)"
echo "  2. Apunta tu dominio al IP del servidor"
echo "  3. Configura SSL con: sudo certbot --nginx -d tudominio.com"
echo ""
