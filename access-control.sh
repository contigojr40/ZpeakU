#!/bin/bash
# ==========================================
# ZPEAKU™ Access Control Script
# ==========================================
# Autor: Jorge Elio Ricardo Sarmiento
# Descripción: Controla la visibilidad del
# despliegue de producción en Vercel.
# ==========================================

# Mostrar estado actual
estado=$(vercel env ls 2>/dev/null | grep DEPLOYMENT_PROTECTION_DISABLED)

echo "=========================================="
if [[ -n "$estado" ]]; then
  echo "🌐 Estado actual: PÚBLICO (variable activa)"
else
  echo "🔒 Estado actual: PRIVADO (protección activa)"
fi
echo "=========================================="
echo ""

# Menú principal
echo "🔐 ZPEAKU™ Access Control"
echo "1) 🔓 Hacer público (abrir)"
echo "2) 🔒 Volver a privado (cerrar)"
echo "3) ❌ Cancelar"
read -p "Elige una opción [1-3]: " opcion

case $opcion in
  1)
    echo ""
    echo "🌐 Activando modo público..."
    vercel env add DEPLOYMENT_PROTECTION_DISABLED true
    vercel redeploy --prod --force
    echo "✅ ZPEAKU™ ahora es visible al público."
    ;;
  2)
    echo ""
    echo "🔒 Cerrando acceso público..."
    vercel env rm DEPLOYMENT_PROTECTION_DISABLED
    vercel redeploy --prod --force
    echo "✅ ZPEAKU™ ahora está en modo privado (protegido)."
    ;;
  3)
    echo ""
    echo "❌ Operación cancelada."
    ;;
  *)
    echo ""
    echo "⚠️ Opción inválida. Ejecuta el script nuevamente."
    ;;
esac
chmod +x access-control.sh
./access-control.sh
å
