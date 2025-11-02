/* ==========================================================
   ZPEAKU™ — app.js (Frontend Core v7.0 Foundation Stable)
   ========================================================== */

// Helpers de selección
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const log = (...a) => console.log("[ZPEAKU]", ...a);

// =====================================================
// 1. Inicialización segura de Supabase
// =====================================================

let supabase = null;
try {
  // Config global desde env-public.js o supa.js
  if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase?.createClient) {
    supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    log("Supabase conectado ✅");
  } else {
    log("Supabase no inicializado (modo offline)");
  }
} catch (err) {
  console.warn("Error inicializando Supabase:", err);
}

// =====================================================
// 2. Control de sesión OTP / usuario actual
// =====================================================

async function loadSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const session = data?.session;
    if (session?.user) {
      log("Sesión activa:", session.user.email);
      document.body.classList.add("logged-in");
    } else {
      log("Sin sesión — visitante anónimo");
    }
  } catch (err) {
    console.error("Error cargando sesión:", err.message);
  }
}

// =====================================================
// 3. Cargar módulos de interfaz (toasts, sonidos, idioma)
// =====================================================

async function initUX() {
  try {
    // Carga dinámica de módulos UX
    const toast = await import("../src/lib/v16-toast.js");
    const sfx = await import("../src/lib/v16-sfx.js");
    window.ZPEAKU_TOAST = toast;
    window.ZPEAKU_SFX = sfx;

    log("UX viva inicializada (toasts + sfx)");

    // Mensaje visual
    toast.show?.("🎙️ Bienvenido a ZPEAKU™ Foundation Build", { duration: 4000 });
  } catch (err) {
    console.warn("UX modules no disponibles:", err);
  }
}

// =====================================================
// 4. Bucket de usuario (avatars / uploads)
// =====================================================

async function testBucketAccess() {
  try {
    const { data, error } = await supabase.storage.from("avatars").list();
    if (error) throw error;
    log("Bucket avatars listo:", data?.length, "archivos detectados");
  } catch (err) {
    log("No se pudo acceder al bucket (puede ser RLS o sin sesión).");
  }
}

// =====================================================
// 5. Feed dinámico (Shorts / Posts)
// =====================================================

async function loadFeed() {
  try {
    const res = await fetch("/api/feed/public");
    if (!res.ok) throw new Error("Feed error");
    const posts = await res.json();
    log("Feed cargado:", posts.length, "elementos");
  } catch (err) {
    console.error("Error cargando feed:", err);
  }
}

// =====================================================
// 6. Arranque general
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
  log("Frontend iniciado 🟢");

  await initUX();
  if (supabase) await loadSession();

  // Verifica conexión al bucket y feed
  if (supabase) {
    await Promise.allSettled([testBucketAccess(), loadFeed()]);
  }

  // Renderiza indicador visible de estado
  const banner = document.createElement("div");
  banner.style.cssText = `
    position:fixed;bottom:12px;left:50%;transform:translateX(-50%);
    background:#111;color:#0f0;font-family:sans-serif;
    padding:6px 12px;border-radius:8px;font-size:13px;
    box-shadow:0 0 12px rgba(0,255,100,.3);
  `;
  banner.textContent = "ZPEAKU™ Foundation v7.0 — Online ✅";
  document.body.appendChild(banner);
});