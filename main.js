// ===== Helpers =====
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

// ===== Rutas =====
const ROUTES = ["home","fans","creator","support"];

// ===== Idiomas (traducciones simples) =====
const I18N = {
  es: {
    "nav.home":"Inicio",
    "nav.fans":"Fans",
    "nav.creator":"Creador",
    "nav.support":"Soporte",
    "nav.login":"Iniciar sesión",
    "msg.construction":"🚧 En construcción..."
  },
  en: {
    "nav.home":"Home",
    "nav.fans":"Fans",
    "nav.creator":"Creator",
    "nav.support":"Support",
    "nav.login":"Log in",
    "msg.construction":"🚧 Under construction..."
  }
};

// ===== Mostrar/Ocultar Secciones =====
function show(route){
  ROUTES.forEach(r=>{
    $("#view-"+r)?.classList.toggle("hidden", r!==route);
  });

  // Marcar menú activo
  $$("#mainNav a").forEach(a=>{
    const m = a.getAttribute("href").replace("#/","");
    a.classList.toggle("active", m===route);
  });

  // Mostrar mensaje temporal "En construcción"
  const current = $("#view-"+route);
  if(current){
    if(!current.querySelector(".construction-msg")){
      const p = document.createElement("p");
      p.className="construction-msg muted";
      p.textContent = t("msg.construction");
      current.appendChild(p);
    }
  }
}

// ===== Router =====
function handleHash(){
  const r=(location.hash.replace("#/","")||"home");
  show(ROUTES.includes(r)? r : "home");
}

// ===== Idioma =====
function t(key){
  const lang = localStorage.getItem("lang") || "es";
  return (I18N[lang] && I18N[lang][key]) || key;
}
function applyI18n(){
  const lang = localStorage.getItem("lang") || "es";
  $("#langSel").value = lang;

  // Traducción de menús
  $$("#mainNav a").forEach(a=>{
    const key="nav."+a.getAttribute("href").replace("#/","");
    if(I18N[lang] && I18N[lang][key]) a.textContent=I18N[lang][key];
  });
  $$(".construction-msg").forEach(el=>{
    el.textContent = t("msg.construction");
  });
}

// ===== Tema =====
function setTheme(theme){
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", ()=>{
  // Restaurar tema
  setTheme(localStorage.getItem("theme") || "dark");

  // Restaurar idioma
  applyI18n();

  // Eventos de tema
  $("#btnTheme")?.addEventListener("click", ()=>{
    const newTheme = document.body.getAttribute("data-theme")==="dark" ? "light" : "dark";
    setTheme(newTheme);
  });

  // Eventos de idioma
  $("#langSel")?.addEventListener("change", (e)=>{
    localStorage.setItem("lang", e.target.value);
    applyI18n();
  });

  // Router
  window.addEventListener("hashchange", handleHash);
  handleHash(); // cargar al inicio
});