const ROUTES = ["home", "fans", "creator", "support"];

function show(route) {
  ROUTES.forEach(r => {
    const el = document.getElementById("view-" + r);
    if (el) el.classList.toggle("hidden", r !== route);
  });

  document.querySelectorAll("#mainNav a").forEach(a => {
    const m = a.getAttribute("href").replace("#/", "");
    a.classList.toggle("active", m === route);
  });
}

function handleHash() {
  const r = location.hash.replace("#/", "") || "home";
  show(ROUTES.includes(r) ? r : "home");
}

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

// Traducciones
const I18N = {
  es: {
    "nav.home": "Inicio",
    "nav.fans": "Fans",
    "nav.creator": "Creador",
    "nav.support": "Soporte",
    "nav.login": "Iniciar sesión",
    "hero.title": "✨ Bienvenidos a ZpeakU",
    "hero.subtitle": "La plataforma puente entre Fans y Creadores.",
    "hero.fan": "🔔 Suscribirme como Fan",
    "hero.creator": "🧰 Suscribirme como Creador",
    "fan.title": "Acceso de Fan",
    "fan.subtitle": "Aquí podrás acceder a contenido exclusivo como fan registrado.",
    "creator.title": "Panel de Creador",
    "creator.subtitle": "Aquí los creadores gestionan sus contenidos y suscripciones.",
    "support.title": "Soporte",
    "support.text": "¿Tienes dudas o problemas? Escríbenos a soporte@zpeaku.com",
    "footer.support": "Soporte",
    "footer.terms": "Términos",
    "footer.privacy": "Privacidad"
  },
  en: {
    "nav.home": "Home",
    "nav.fans": "Fans",
    "nav.creator": "Creator",
    "nav.support": "Support",
    "nav.login": "Log in",
    "hero.title": "✨ Welcome to ZpeakU",
    "hero.subtitle": "The bridge platform between Fans and Creators.",
    "hero.fan": "🔔 Subscribe as Fan",
    "hero.creator": "🧰 Subscribe as Creator",
    "fan.title": "Fan Access",
    "fan.subtitle": "Here you can access exclusive content as a registered fan.",
    "creator.title": "Creator Panel",
    "creator.subtitle": "Here creators manage their content and subscriptions.",
    "support.title": "Support",
    "support.text": "Need help? Contact us at support@zpeaku.com",
    "footer.support": "Support",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy"
  }
};

function applyI18n() {
  const lang = localStorage.getItem("lang") || "es";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (I18N[lang] && I18N[lang][key]) {
      el.textContent = I18N[lang][key];
    }
  });
  document.getElementById("langSel").value = lang;
}

document.addEventListener("DOMContentLoaded", () => {
  // Navegación
  window.addEventListener("hashchange", handleHash);
  handleHash();

  // Tema
  const saved = localStorage.getItem("theme") || "dark";
  setTheme(saved);
  document.getElementById("btnTheme").addEventListener("click", () => {
    const next = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
  });

  // Idioma
  const langSel = document.getElementById("langSel");
  langSel.addEventListener("change", () => {
    localStorage.setItem("lang", langSel.value);
    applyI18n();
  });
  applyI18n();
});