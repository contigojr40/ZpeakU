#!/usr/bin/env bash
set -euo pipefail
echo "🧩 Iniciando limpieza estructural de ZPEAKU™..."

# --- 1) Crear estructura base si no existe ---
mkdir -p api db/migrations docs/{legal,ops,ux} public/assets/branding src/{components,context,hooks,i18n,lib,pages,styles,tests} tests

# --- 2) Mover migraciones duplicadas ---
if [ -d "supabase/migrations" ]; then
  echo "→ Moviendo migraciones desde /supabase/migrations/ a /db/migrations/"
  mv -n supabase/migrations/* db/migrations/ 2>/dev/null || true
fi

# --- 3) Fusionar pruebas ---
if [ -d "supabase/tests/database" ]; then
  echo "→ Moviendo tests desde /supabase/tests/database/ a /tests/"
  mv -n supabase/tests/database/* tests/ 2>/dev/null || true
fi

# --- 4) Eliminar carpetas vacías y duplicadas ---
for d in supabase .temp node_modules cache builders mod jury middleware; do
  [ -d "$d" ] && echo "→ Eliminando carpeta innecesaria: $d" && rm -rf "$d"
done

# --- 5) Crear archivos UX Viva (v16) ---
echo "→ Creando UX Viva (v16)"
cat > src/styles/v16-ux.css <<'CSS'
:root{--z-violet:#7C3AED;--z-green:#16A34A;--z-blue:#2563EB;--z-amber:#CA8A04;--z-red:#DC2626;--z-glass:rgba(12,0,20,.85)}
.z-btn{border:0;border-radius:14px;padding:.7rem 1rem;font-weight:700;color:#fff;background:var(--z-violet);cursor:pointer}
.z-btn:active{transform:scale(.97)}
.z-toast{position:fixed;left:16px;right:16px;bottom:18px;background:var(--z-glass);color:#EDEDED;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px 14px;backdrop-filter:blur(10px);z-index:9999}
CSS

cat > src/lib/v16-toast.js <<'JS'
export function ztoast(msg, tone="ok", ms=2200){
  const el=document.createElement("div");el.className="z-toast";el.textContent=msg;
  document.body.appendChild(el);
  setTimeout(()=>{el.style.opacity=.0;el.style.transform="translateY(6px)";setTimeout(()=>el.remove(),300);},ms);
}
JS

cat > src/lib/v16-sfx.js <<'JS'
export function zping(kind="ok"){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value={ok:420,warn:260,err:180,info:340}[kind]||420;g.gain.value=0.05;o.start();o.stop(ctx.currentTime+0.12);}catch{}}
JS

# --- 6) Crear README de mantenimiento ---
echo "→ Generando docs/README_legacy.md"
cat > docs/README_legacy.md <<'TXT'
# ZPEAKU™ — Estructura final (LEGACY v16.1)
Este repositorio fue limpiado y reordenado automáticamente.
Incluye:
- api/: endpoints serverless
- db/: migraciones SQL con RLS
- src/: componentes, estilos, scripts UX viva
- public/: estáticos (branding, index.html)
- tests/: smoke & QA scripts
TXT

# --- 7) Reporte final ---
echo "✅ Limpieza completada."
echo "📁 Verifica la nueva estructura con: tree -L 3 | less"
