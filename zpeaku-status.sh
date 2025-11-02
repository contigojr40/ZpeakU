#!/bin/bash
# ==========================================
# ZPEAKU™ STATUS CHECKER
# ==========================================
# Autor: Jorge Elio Ricardo Sarmiento
# Descripción: Verifica si el proyecto está
# en modo público o privado según las
# variables de entorno de Vercel.
# ==========================================

echo "=========================================="
echo "🔎 Verificando estado actual de ZPEAKU™..."
echo "=========================================="

# Captura el valor de la variable de entorno de Vercel
status=$(vercel env pull 2>/dev/null | grep -E "^DEPLOYMENT_PROTECTION_DISABLED=" | awk -F'=' '{print $2}')

if [ "$status" == "true" ]; then
  echo "🌐 ZPEAKU™ está actualmente en modo PÚBLICO (visible al mundo)"
else
  echo "🔒 ZPEAKU™ está actualmente en modo PRIVADO (protegido)"
fi

echo "=========================================="