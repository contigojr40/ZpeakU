/* =========================
   Zpeaku - main.js (FIXED)
   ========================= */

// ===== Helpers =====
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const store = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k)    => localStorage.removeItem(k),
};
const log = (...a) => console.log("[Zpeaku]", ...a);

// ===== Supabase (inicialización tolerante) =====
// Carga por CDN recomendada en index.html ANTES de main.js:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// Y define (públicas) las vars en window:
// <script>window.SUPABASE_URL="..."; window.SUPABASE_ANON_KEY="...";</script>
let supabase = null;
try {
  if (window?.supabase?.createClient && window?.SUPABASE_URL && window?.SUPABASE_ANON_KEY) {
    supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    log("Supabase listo");
  } else {
    log("Supabase no inicializado (faltan SDK o vars públicas). Continuamos sin-auth.");
  }
} catch (e) {
  console.warn("Supabase init error:", e);
}

// ===== Router =====
const ROUTES = ["home","fans","creator","support"];
const ALIAS  = { inicio: "home", fans: "fans", creador: "creator", soporte: "support" };

function show(route){
  ROUTES.forEach(r => { $("#view-" + r)?.classList.toggle("hidden", r !== route); });
  $$("#mainNav a").forEach(a => {
    const m = (a.getAttribute("href") || "").replace("#/","").replace("#","");
    const normalized = ALIAS[m] || m;
    a.classList.toggle("active", normalized === route);
  });
}

function handleHash(){
  const raw = (location.hash || "").replace("#/","").replace("#","");
  const route = ALIAS[raw] || raw || "home";
  show(ROUTES.includes(route) ? route : "home");
}

// ===== Theme =====
function setTheme(theme){
  document.body.setAttribute("data-theme", theme);
  store.set("theme", theme);
}

// ===== i18n =====
const I18N = {
  es:{ home:"Inicio", fans:"Fans", creator:"Creador", support:"Soporte", login:"Iniciar sesión",
       subFan:"🔔 Suscribirme como Fan", subCreator:"🧰 Suscribirme como Creador",
       export:"Descargar mis datos (ZIP)", delete:"🗑️ Eliminar cuenta" },
  en:{ home:"Home", fans:"Fans", creator:"Creator", support:"Support", login:"Log in",
       subFan:"🔔 Subscribe as Fan", subCreator:"🧰 Subscribe as Creator",
       export:"Download my data (ZIP)", delete:"🗑️ Delete account" }
};
function applyI18n(){
  const lang = store.get("lang","es");
  $("#langSel") && ($("#langSel").value = lang);
  const t = I18N[lang] || I18N.es;
  $$("#mainNav a").forEach(a=>{
    const key = (a.getAttribute("href") || "").replace("#/","").replace("#","");
    const norm = ALIAS[key] || key;
    if (t[norm]) a.textContent = t[norm];
  });
  // Nota: en index.html estamos usando <button>s, no <a> con clase .pill, 
  // por eso nos basaremos en los IDs, pero mantengo el código .pill por si lo usas después.
  $("#btn-fan")  && ($("#btn-fan").textContent  = t.subFan);
  $("#btn-creator")  && ($("#btn-creator").textContent  = t.subCreator);
  $("#btnExportData")  && ($("#btnExportData").textContent  = t.export);
  $("#btnDeleteAccount") && ($("#btnDeleteAccount").textContent = t.delete);
}

// ===== Player Modal =====
function openPlayerById(id){
  $("#pmTitle") && ($("#pmTitle").textContent = "Video demo " + id);
  if ($("#ytFrame")) $("#ytFrame").src = "https://www.youtube.com/embed/dQw4w9WgXcQ";
  $("#playerModal")?.classList.remove("hidden");
}
$("#pmClose")?.addEventListener("click", ()=>{
  if ($("#ytFrame")) $("#ytFrame").src = "about:blank";
  $("#playerModal")?.classList.add("hidden");
});
$("#playerModal")?.addEventListener("click",(e)=>{
  if(e.target.id === "playerModal"){
    if ($("#ytFrame")) $("#ytFrame").src = "about:blank";
    $("#playerModal")?.classList.add("hidden");
  }
});

// ===== Donate Modal =====
$("#pmDonate")?.addEventListener("click",()=> $("#donateModal")?.classList.remove("hidden"));
$("#donClose")?.addEventListener("click",()=> $("#donateModal")?.classList.add("hidden"));

// ===== Account Center (Funcionalidad avanzada) =====
$("#btnExportData")?.addEventListener("click", async ()=>{
  try {
    const token = supabase ? (await supabase.auth.getSession())?.data?.session?.access_token : null;
    const res = await fetch("/api/export", { headers: token ? {Authorization:`Bearer ${token}`} : {} });
    if(!res.ok) throw new Error("export fail");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mis-datos-zpeaku.zip";
    a.click();
  } catch (e) {
    alert("Error exportando ZIP");
    console.error(e);
  }
});

$("#btnDeleteAccount")?.addEventListener("click", async ()=>{
  if(!confirm("¿Seguro que quieres eliminar tu cuenta?")) return;
  try {
    const token = supabase ? (await supabase.auth.getSession())?.data?.session?.access_token : null;
    const res = await fetch("/api/delete", { method:"DELETE", headers: token ? {Authorization:`Bearer ${token}`} : {} });
    if(!res.ok) throw new Error("delete fail");
    alert("Cuenta eliminada");
    if (supabase) await supabase.auth.signOut();
    location.reload();
  } catch (e) {
    alert("Error al eliminar cuenta");
    console.error(e);
  }
});

// ===== Suscripciones (Fan / Creador) - Lógica de backend =====
async function postSubscribe(kind){
  const res = await fetch("/api/subscribe", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ type: kind })
  });
  const data = await res.json().catch(()=> ({}));
  if (!res.ok) throw new Error(data?.error || "subscribe failed");
  if (data?.url) window.location.href = data.url;
  return data;
}

// ===== UI básicos (funcionalidad de la app) =====
function bindUI(){
  $("#btnTheme")?.addEventListener("click", ()=>{
    setTheme(document.body.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });
  $("#langSel")?.addEventListener("change", ()=>{
    store.set("lang", $("#langSel").value);
    applyI18n();
  });
}

// ==================================================
//               FIX DE EJECUCIÓN: INIT
// ==================================================
document.addEventListener("DOMContentLoaded", ()=>{
  log("main.js cargado ✅");
  setTheme(store.get("theme","dark"));
  applyI18n();
  handleHash();
  window.addEventListener("hashchange", handleHash);
  bindUI();

  // FIX: Conexión de botones movida AQUÍ para garantizar que existen en el DOM
  // Handlers por ID (tus botones visibles de Suscripción)
  $("#btn-fan")?.addEventListener("click", async (e)=>{
    e.preventDefault();
    try { 
      // Si quieres probar si funciona sin el backend: log("CLICK: FAN");
      await postSubscribe("fan"); 
    } catch(err){ 
      alert("No se pudo suscribir como Fan. Revisa la consola para ver el error del /api/subscribe."); 
      console.error(err); 
    }
  });

  $("#btn-creator")?.addEventListener("click", async (e)=>{
    e.preventDefault();
    try { 
      // Si quieres probar si funciona sin el backend: log("CLICK: CREADOR");
      await postSubscribe("creator"); 
    } catch(err){ 
      alert("No se pudo iniciar el onboarding de Creador. Revisa la consola para ver el error del /api/subscribe."); 
      console.error(err); 
    }
  });

  // Handlers por clase (si también existen .pill, los mantengo por precaución)
  $$("a.pill.primary").forEach(btn=>{
    btn.addEventListener("click", async e=>{
      e.preventDefault();
      try { await postSubscribe("fan"); } catch(err){ alert("No se pudo suscribir como Fan"); console.error(err); }
    });
  });
  $$("a.pill.outline").forEach(btn=>{
    btn.addEventListener("click", async e=>{
      e.preventDefault();
      try { await postSubscribe("creator"); } catch(err){ alert("No se pudo iniciar el onboarding de Creador"); console.error(err); }
    });
  });
  // FIN DEL FIX
});
