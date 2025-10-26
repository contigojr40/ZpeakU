#!/usr/bin/env bash
set -euo pipefail

mkdir -p api db/migrations docs/{legal,ops,ux} public/assets/branding src/{components,context,hooks,i18n,lib,pages,styles,tests} tests

# mover migraciones si existen en supabase/
if [ -d "supabase/migrations" ]; then
  mv -n supabase/migrations/* db/migrations/ 2>/dev/null || true
fi

# mover tests si existen en supabase/tests/database
if [ -d "supabase/tests/database" ]; then
  mv -n supabase/tests/database/* tests/ 2>/dev/null || true
fi

# crear UX viva mínima
mkdir -p src/lib src/styles docs
cat > src/styles/v16-ux.css <<'CSS'
:root{--z-violet:#7C3AED;--z-green:#16A34A;--z-blue:#2563EB;--z-amber:#CA8A04;--z-red:#DC2626;--z-glass:rgba(12,0,20,.85)}
.z-btn{border:0;border-radius:14px;padding:.7rem 1rem;font-weight:700;color:#fff;background:var(--z-violet);cursor:pointer}
.z-toast{position:fixed;left:16px;right:16px;bottom:18px;background:var(--z-glass);color:#EDEDED;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px 14px;backdrop-filter:blur(10px);z-index:9999}
CSS
cat > src/lib/v16-toast.js <<'JS'
export function ztoast(msg, tone="ok", ms=2200){const el=document.createElement("div");el.className="z-toast";el.textContent=msg;document.body.appendChild(el);setTimeout(()=>{el.style.opacity=.0;el.style.transform="translateY(6px)";setTimeout(()=>el.remove(),300);},ms);}
JS
cat > src/lib/v16-sfx.js <<'JS'
export function zping(kind="ok"){try{const c=new(window.AudioContext||window.webkitAudioContext)();const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type="sine";o.frequency.value={ok:420,warn:260,err:180,info:340}[kind]||420;g.gain.value=.05;o.start();o.stop(c.currentTime+.12);}catch{}}
JS

# README corto
cat > docs/README_legacy.md <<'TXT'
ZPEAKU™ LEGACY v16.1 — estructura limpia preparada para producción.
TXT

echo "OK"
