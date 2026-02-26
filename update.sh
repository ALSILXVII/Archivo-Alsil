#!/bin/bash
# ==============================================
# Script de actualización rápida
# Ejecutar cada vez que quieras actualizar la app
# ==============================================

set -e

APP_DIR="/var/www/archivo-alsil"

echo "Actualizando Archivo Alsil..."

cd "$APP_DIR"

# Pull últimos cambios
git pull origin main

# Instalar dependencias nuevas (si las hay)
npm install

# Re-compilar
npm run build

# Reiniciar app
pm2 restart archivo-alsil

echo "¡Actualización completada!"
