// ===== Helpers =====
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const store = {
  get:(k,def)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? def }catch{ return def } },
  set:(k,v)=> localStorage.setItem(k, JSON.stringify(v)),
  del:(k)=> localStorage.removeItem(k),
};

// ===== Supabase =====
const supabase = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

// ===== Router =====
const ROUTES = ["home","fans","creator","support"];
function show(route){
  ROUTES.forEach(r => {
    $("#view-"+r)?.classList.toggle("hidden", r!==route);
  });
  $$("#mainNav a").forEach(a=>{
    const m = a.getAttribute("href").replace("#/","");
    a.classList.toggle("active", m===route);
  });
}
function handleHash(){
  const r = location.hash.replace("#/","") || "home";
  show(ROUTES.includes(r) ? r : "home");
}

// ===== Theme =====
function setTheme(theme){
  document.body.setAttribute("data-theme", theme);
  store.set("theme", theme);
}

// ===== i18n =====
const I18N = {
  es:{
    home:"Inicio", fans:"Fans", creator:"Creador", support:"Soporte", login:"Iniciar sesión",
    subFan:"🔔 Suscribirme como Fan", subCreator:"🧰 Suscribirme como Creador",
    export:"Descargar mis datos (ZIP)", delete:"🗑️ Eliminar cuenta"
  },
  en:{
    home:"Home", fans:"Fans", creator:"Creator", support:"Support", login:"Log in",
    subFan:"🔔 Subscribe as Fan", subCreator:"🧰 Subscribe as Creator",
    export:"Download my data (ZIP)", delete:"🗑️ Delete account"
  }
};
function applyI18n(){
  const lang = store.get("lang","es");
  $("#langSel").value = lang;
  const t = I18N[lang];
  $$("#mainNav a").forEach(a=>{
    const key=a.getAttribute("href").replace("#/","");
    if(t[key]) a.textContent=t[key];
  });
  $("a.pill.primary") && ($("a.pill.primary").textContent = t.subFan);
  $("a.pill.outline") && ($("a.pill.outline").textContent = t.subCreator);
  $("#btnExportData") && ($("#btnExportData").textContent = t.export);
  $("#btnDeleteAccount") && ($("#btnDeleteAccount").textContent = t.delete);
}

// ===== Player Modal =====
function openPlayerById(id){
  $("#pmTitle").textContent = "Video demo "+id;
  $("#ytFrame").src = "https://www.youtube.com/embed/dQw4w9WgXcQ";
  $("#playerModal").classList.remove("hidden");
}
$("#pmClose")?.addEventListener("click", ()=>{
  $("#ytFrame").src="about:blank";
  $("#playerModal").classList.add("hidden");
});
$("#playerModal")?.addEventListener("click",(e)=>{
  if(e.target.id==="playerModal"){
    $("#ytFrame").src="about:blank";
    $("#playerModal").classList.add("hidden");
  }
});

// ===== Donate Modal =====
$("#pmDonate")?.addEventListener("click",()=>{
  $("#donateModal").classList.remove("hidden");
});
$("#donClose")?.addEventListener("click",()=>{
  $("#donateModal").classList.add("hidden");
});

// ===== Account Center =====
$("#btnExportData")?.addEventListener("click", async ()=>{
  const token=(await supabase.auth.getSession()).data?.session?.access_token;
  const res = await fetch("/api/export",{
    headers:{Authorization:`Bearer ${token}`}
  });
  if(!res.ok) return alert("Error exportando ZIP");
  const blob=await res.blob();
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="mis-datos-zpeaku.zip";
  a.click();
});

$("#btnDeleteAccount")?.addEventListener("click", async ()=>{
  if(!confirm("¿Seguro que quieres eliminar tu cuenta?")) return;
  const token=(await supabase.auth.getSession()).data?.session?.access_token;
  const res=await fetch("/api/delete",{
    method:"DELETE", headers:{Authorization:`Bearer ${token}`}
  });
  if(res.ok){
    alert("Cuenta eliminada");
    await supabase.auth.signOut();
    location.reload();
  } else {
    alert("Error al eliminar cuenta");
  }
});

// ===== Stripe Subscribe Buttons =====
document.querySelectorAll("a.pill.primary").forEach(btn=>{
  btn.addEventListener("click", async e=>{
    e.preventDefault();
    const res=await fetch("/api/subscribe",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({type:"fan"})
    });
    const data=await res.json();
    if(data.url) window.location.href=data.url;
  });
});

document.querySelectorAll("a.pill.outline").forEach(btn=>{
  btn.addEventListener("click", async e=>{
    e.preventDefault();
    const res=await fetch("/api/subscribe",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({type:"creator"})
    });
    const data=await res.json();
    if(data.url) window.location.href=data.url;
  });
});

// ===== Bind UI =====
function bindUI(){
  $("#btnTheme")?.addEventListener("click",()=>{
    setTheme(document.body.getAttribute("data-theme")==="dark"?"light":"dark");
  });
  $("#langSel")?.addEventListener("change",()=>{
    store.set("lang",$("#langSel").value);
    applyI18n();
  });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded",()=>{
  setTheme(store.get("theme","dark"));
  applyI18n();
  handleHash();
  window.addEventListener("hashchange",handleHash);
  bindUI();
});