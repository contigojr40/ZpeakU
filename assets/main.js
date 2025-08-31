// ========== Helpers ==========
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const store = {
  get:(k,def)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? def }catch{ return def } },
  set:(k,v)=> localStorage.setItem(k, JSON.stringify(v)),
  del:(k)=> localStorage.removeItem(k),
};

// ========== DEMO MODE ==========
const DEMO_MODE = !window.SUPABASE_URL || /TU-PROJECT-URL/i.test(window.SUPABASE_URL);

// ========== Supabase ==========
const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// ========== Export ZIP ==========
const btnExportData = document.getElementById('btnExportData');
if (btnExportData) {
  btnExportData.addEventListener('click', async () => {
    const token = (await supabase.auth.getSession()).data?.session?.access_token;
    const res = await fetch('/api/export', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return alert('Error al generar ZIP');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mis-datos-zpeaku.zip';
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

// ========== Eliminar cuenta ==========
const btnDeleteAccount = document.getElementById('btnDeleteAccount');
if (btnDeleteAccount) {
  btnDeleteAccount.addEventListener('click', async () => {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;
    const token = (await supabase.auth.getSession()).data?.session?.access_token;
    const res = await fetch('/api/delete', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      alert('Cuenta eliminada correctamente.');
      await supabase.auth.signOut();
      location.reload();
    } else {
      alert('Error al eliminar la cuenta.');
    }
  });
}

// ========== Navegación básica ==========
function setTheme(theme){ document.body.setAttribute("data-theme", theme); store.set("theme", theme); }
function handleHash(){
  const r = location.hash.replace("#/", "") || "home";
  $$(".view").forEach(v => v.classList.toggle("hidden", v.id !== `view-${r}`));
  $$("#mainNav a").forEach(a => {
    const m = a.getAttribute("href").replace("#/", "");
    a.classList.toggle("active", m === r);
  });
}

function applyI18n(){
  const lang = store.get("lang", "es");
  $$("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (I18N[lang] && I18N[lang][k]) el.textContent = I18N[lang][k];
  });
}

// ========== Init ==========
document.addEventListener("DOMContentLoaded", () => {
  setTheme(store.get("theme","dark"));
  applyI18n();
  handleHash();
  window.addEventListener("hashchange", handleHash);

  const langSel = $("#langSel");
  if (langSel) {
    langSel.value = store.get("lang", "es");
    langSel.addEventListener("change", () => {
      store.set("lang", langSel.value);
      applyI18n();
    });
  }

  const btnTheme = $("#btnTheme");
  if (btnTheme) {
    btnTheme.addEventListener("click", () => {
      const current = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(current);
    });
  }
});