// ui.js — tema, idioma, router SPA

const THEME_KEY = "zpeaku_theme";
const LANG_KEY  = "zpeaku_lang";

const I18N = {
  es: {
    "nav.home":"Inicio","nav.lottery":"Lotería","nav.stream":"Transmisión",
    "nav.support":"Soporte","nav.admin":"Administración","nav.login":"Iniciar sesión",
    "nav.theme":"Tema",
    "home.title":"Bienvenido a ZpeakU",
    "home.subtitle":"Plataforma puente de creadores y fans",
    "home.subscribe":"Suscribirme $20/mes",
    "home.connectStripe":"Conectar Stripe (Influencer)",
    "home.donateLabel":"Donar al creador","home.donateBtn":"Donar","home.amountPh":"10",
    "home.card1.title":"Embebe tu Live (YouTube)",
    "home.card1.body":"Pegas tu ID de YouTube y listo. El chat se muestra al lado.",
    "home.card1.placeholder":"YouTube Video ID (ej. dQw4w9WgXcQ)",
    "home.card1.btn":"Mostrar",
    "home.card2.title":"Cuenta de Fan e Influencer",
    "home.card2.body":"Los fans apoyan con donaciones y suscripciones; los creadores gestionan su canal.",
    "lottery.title":"Z Lotería",
    "lottery.desc":"Participan cuentas con suscripción activa. El ganador se calcula con tu regla.",
    "lottery.countdown":"Cuenta regresiva","lottery.lastWinner":"Ganador actual",
    "lottery.refresh":"Actualizar","lottery.elig":"Comprobar elegibilidad",
    "stream.title":"Transmisión",
    "support.title":"Soporte",
    "support.body":"Escríbenos si necesitas ayuda con tu cuenta, pagos o transmisiones.",
    "admin.title":"Panel de administración",
    "admin.note":"(UI demo) El panel REAL vive en backend privado. Aquí sólo listamos públicos.",
    "footer.support":"Soporte","footer.terms":"Términos","footer.privacy":"Privacidad",
    "login.btn":"Iniciar sesión","login.emailPh":"Email","login.passPh":"Contraseña"
  },
  en: {
    "nav.home":"Home","nav.lottery":"Lottery","nav.stream":"Stream",
    "nav.support":"Support","nav.admin":"Admin","nav.login":"Log in",
    "nav.theme":"Theme",
    "home.title":"Welcome to ZpeakU",
    "home.subtitle":"Bridge platform for creators and fans",
    "home.subscribe":"Subscribe $20/mo",
    "home.connectStripe":"Connect Stripe (Influencer)",
    "home.donateLabel":"Donate to creator","home.donateBtn":"Donate","home.amountPh":"10",
    "home.card1.title":"Embed your Live (YouTube)",
    "home.card1.body":"Paste your YouTube ID. The chat shows on the side.",
    "home.card1.placeholder":"YouTube Video ID (e.g. dQw4w9WgXcQ)",
    "home.card1.btn":"Show",
    "home.card2.title":"Fan & Influencer Accounts",
    "home.card2.body":"Fans support with donations/subscriptions; creators manage their channel.",
    "lottery.title":"Z Lottery",
    "lottery.desc":"Active subscriptions participate. The winner is computed by your rule.",
    "lottery.countdown":"Countdown","lottery.lastWinner":"Current winner",
    "lottery.refresh":"Refresh","lottery.elig":"Check eligibility",
    "stream.title":"Streaming",
    "support.title":"Support",
    "support.body":"Write to us if you need help with your account, payments or streams.",
    "admin.title":"Admin panel",
    "admin.note":"(UI demo) The REAL panel lives in a private backend. We only list public ones here.",
    "footer.support":"Support","footer.terms":"Terms","footer.privacy":"Privacy",
    "login.btn":"Log in","login.emailPh":"Email","login.passPh":"Password"
  }
};

// ---------- Tema ----------
function getSavedTheme(){
  return localStorage.getItem(THEME_KEY) || "light";
}
function setTheme(theme){
  const t = (theme === "dark") ? "dark" : "light";
  document.body.setAttribute("data-theme", t);
  localStorage.setItem(THEME_KEY, t);
}

// ---------- Idioma ----------
function currentLang(){
  const raw = localStorage.getItem(LANG_KEY) || "es";
  return String(raw).toLowerCase().slice(0,2) === "en" ? "en" : "es";
}
function setLang(lang){
  const normalized = String(lang || "es").toLowerCase().slice(0,2);
  const finalLang = (normalized === "en") ? "en" : "es";
  localStorage.setItem(LANG_KEY, finalLang);
  applyI18n(finalLang);
  const sel = document.getElementById("langSel");
  if (sel) sel.value = finalLang;
}
function applyI18n(lang){
  const dict = I18N[lang] || I18N.es;
  // textContent
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    if (dict[k] != null) el.textContent = dict[k];
  });
  // placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
    const k = el.getAttribute("data-i18n-placeholder");
    if (dict[k] != null) el.placeholder = dict[k];
  });
  // titles
  document.querySelectorAll("[data-i18n-title]").forEach(el=>{
    const k = el.getAttribute("data-i18n-title");
    if (dict[k] != null) el.title = dict[k];
  });
  // html lang
  document.documentElement.lang = lang;
}

// ---------- Router SPA ----------
const ROUTES = {
  "#/home":    "view-home",
  "#/lottery": "view-lottery",
  "#/stream":  "view-stream",
  "#/support": "view-support",
  "#/login":   "view-login",
  "#/admin":   "view-admin"
};
function showView(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}
function handleRoute(){
  const hash = location.hash || "#/home";
  const id = ROUTES[hash] || "view-home";
  showView(id);
}

export function initUI(){
  // Año en footer
  const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();

  // Tema
  setTheme(getSavedTheme());
  const btnTheme = document.getElementById("btnTheme");
  if (btnTheme) {
    btnTheme.addEventListener("click", ()=>{
      const now = document.body.getAttribute("data-theme")==="dark" ? "light":"dark";
      setTheme(now);
    }, { once:false });
  }

  // Idioma
  setLang(currentLang()); // aplica y sincroniza selector
  const langSel = document.getElementById("langSel");
  if (langSel) {
    langSel.addEventListener("change", (e)=> setLang(e.target.value), { once:false });
  }

  // Router
  window.addEventListener("hashchange", handleRoute, false);
  handleRoute(); // primera carga
}