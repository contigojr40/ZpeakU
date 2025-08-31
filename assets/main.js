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

// ========== i18n ==========
const I18N = {
  es:{
    "nav.home":"Inicio","nav.fans":"Fans","nav.creator":"Creador","nav.support":"Soporte","nav.login":"Iniciar sesión",
    "hero.title":"✨ Bienvenidos a ZpeakU","hero.subtitle":"La plataforma puente entre Fans y Creadores",
    "hero.fan":"🔔 Suscribirme como Fan","hero.creator":"🧰 Suscribirme como Creador",
    "home.shorts":"Shorts gratis de la comunidad","home.videos":"Videos públicos de la comunidad",
    "fan.title":"Acceso de Fan","fan.subtitle":"Verifica tu email con un código OTP. Tu cuenta es gratis; puedes desbloquear contenidos cuando quieras.",
    "fan.send":"Enviar código al email","fan.codeLabel":"Código OTP de 6 dígitos","fan.verify":"Verificar","fan.resend":"Reenviar",
    "fan.logged":"Conectado como:","fan.logout":"Salir","fan.unlockAll":"Desbloquear todo",
    "creator.title":"Cuenta de Creador","creator.login":"Login Creador","creator.send":"Enviar código al email",
    "creator.verifyTitle":"Verificación","creator.verify":"Verificar","creator.resend":"Reenviar",
    "creator.monthly":"Precio mensual (USD)","creator.saveAA":"Guardar All-Access","creator.donations":"Donaciones",
    "creator.saveDon":"Guardar métodos de donación","creator.front":"Mostrar en portada","creator.addShort":"Agregar Short","creator.addVideo":"Agregar Video",
    "support.title":"Soporte","support.text":"Escríbenos si necesitas ayuda con tu cuenta o transmisión.",
    "footer.support":"Soporte","footer.terms":"Términos","footer.privacy":"Privacidad",
    "modal.close":"Cerrar","donate.btn":"❤️ Donar al creador","donate.title":"Elige un método de donación","donate.note":"El pago va directo al creador (fuera de ZpeakU).",
    "don.paypal":"PayPal","don.cashapp":"Cash App","don.venmo":"Venmo","don.zelle":"Zelle","don.custom":"Otro"
  },
  en:{
    "nav.home":"Home","nav.fans":"Fans","nav.creator":"Creator","nav.support":"Support","nav.login":"Log in",
    "hero.title":"✨ Welcome to ZpeakU","hero.subtitle":"A bridge platform for Fans & Creators",
    "hero.fan":"🔔 Subscribe as Fan","hero.creator":"🧰 Subscribe as Creator",
    "home.shorts":"Community free Shorts","home.videos":"Community public Videos",
    "fan.title":"Fan Access","fan.subtitle":"Verify your email with an OTP. Your account is free; you can unlock content anytime.",
    "fan.send":"Send code to email","fan.codeLabel":"6-digit OTP","fan.verify":"Verify","fan.resend":"Resend",
    "fan.logged":"Logged in as:","fan.logout":"Log out","fan.unlockAll":"Unlock all",
    "creator.title":"Creator account","creator.login":"Creator Login","creator.send":"Send code",
    "creator.verifyTitle":"Verification","creator.verify":"Verify","creator.resend":"Resend",
    "creator.monthly":"Monthly price (USD)","creator.saveAA":"Save All-Access","creator.donations":"Donations",
    "creator.saveDon":"Save donation methods","creator.front":"Show on homepage","creator.addShort":"Add Short","creator.addVideo":"Add Video",
    "support.title":"Support","support.text":"Write us if you need help with your account or streaming.",
    "footer.support":"Support","footer.terms":"Terms","footer.privacy":"Privacy",
    "modal.close":"Close","donate.btn":"❤️ Donate to creator","donate.title":"Choose a donation method","donate.note":"Payment goes directly to the creator (outside ZpeakU).",
    "don.paypal":"PayPal","don.cashapp":"Cash App","don.venmo":"Venmo","don.zelle":"Zelle","don.custom":"Other"
  }
};
function t(key){ const lang=store.get("lang","es"); return (I18N[lang] && I18N[lang][key]) || key; }
function applyI18n(){
  const lang=store.get("lang","es");
  $$("[data-i18n]").forEach(el=>{
    const k=el.getAttribute("data-i18n");
    if(I18N[lang] && I18N[lang][k]) el.textContent = I18N[lang][k];
  });
}

// ========== Theme & Router ==========
function setTheme(theme){ document.body.setAttribute("data-theme", theme); store.set("theme", theme); }
const ROUTES = ["home","fans","creator","support"];
function show(route){
  ROUTES.forEach(r=> $("#view-"+r)?.classList.toggle("hidden", r!==route));
  $$("#mainNav a").forEach(a=>{
    const m=a.getAttribute("href").replace("#/","");
    a.classList.toggle("active", m===route);
  });
}
function handleHash(){ const r=(location.hash.replace("#/","")||"home"); show(ROUTES.includes(r)? r : "home"); }

// ========== Supabase ==========
const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
async function sendOtpEmail(email){ if(DEMO_MODE) return null; const { error }=await supabase.auth.signInWithOtp({ email, options:{ shouldCreateUser:true } }); return error; }
async function verifyOtpEmail(email, otp){ if(DEMO_MODE) return { error:null }; const { error }=await supabase.auth.verifyOtp({ email, token:String(otp||"").trim(), type:"email" }); return { error }; }

// ========== CREATOR storage/profile ==========
const PROFILE_KEY = "zpk_creator_profile";
const defaultProfile = { allAccessPrice:100, donations:{ paypal:"",cashapp:"",venmo:"",zelle:"",custom:"" }, sections:{shorts:{items:[]},videos:{items:[]},playlists:{items:[]},live:{items:[]},special:{items:[]}} };
function getProfile(){ return store.get(PROFILE_KEY, defaultProfile); }
function saveProfile(p){ store.set(PROFILE_KEY,p); }

// ========== Donaciones ==========
function saveDonations(){
  const p=getProfile();
  p.donations={
    paypal:$("#donPayPal")?.value.trim()||"",
    cashapp:$("#donCashApp")?.value.trim()||"",
    venmo:$("#donVenmo")?.value.trim()||"",
    zelle:$("#donZelle")?.value.trim()||"",
    custom:$("#donCustom")?.value.trim()||""
  };
  saveProfile(p);
  $("#donSaved").textContent="Guardado ✅";
  setTimeout(()=>$("#donSaved").textContent="",1500);
}

// ========== Publicaciones ==========
function renderShortsFeed(){
  const p=getProfile(); const list=p.sections.shorts.items.filter(s=>s.front&&!s.private);
  $("#shortsFeed").innerHTML=list.length?list.map(s=>`<div>${s.title}</div>`).join(""):"<div class='tiny muted'>—</div>";
}
function renderVideosFeed(){
  const p=getProfile(); const list=p.sections.videos.items.filter(v=>(!v.price||Number(v.price)===0)&&!v.private);
  $("#videosFeed").innerHTML=list.length?list.map(v=>`<div>${v.title}</div>`).join(""):"<div class='tiny muted'>—</div>";
}

// ========== Export ZIP ==========
const btnExportData=document.getElementById("btnExportData");
if(btnExportData){
  btnExportData.addEventListener("click",async()=>{
    const token=(await supabase.auth.getSession()).data?.session?.access_token;
    const res=await fetch("/api/export",{headers:{Authorization:`Bearer ${token}`}});
    if(!res.ok) return alert("Error al generar ZIP");
    const blob=await res.blob(); const url=window.URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="mis-datos.zip"; a.click(); window.URL.revokeObjectURL(url);
  });
}

// ========== Eliminar cuenta ==========
const btnDeleteAccount=document.getElementById("btnDeleteAccount");
if(btnDeleteAccount){
  btnDeleteAccount.addEventListener("click",async()=>{
    if(!confirm("¿Estás seguro de que deseas eliminar tu cuenta?")) return;
    const token=(await supabase.auth.getSession()).data?.session?.access_token;
    const res=await fetch("/api/delete",{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
    if(res.ok){ alert("Cuenta eliminada correctamente."); await supabase.auth.signOut(); location.reload(); }
    else{ alert("Error al eliminar la cuenta."); }
  });
}

// ========== Bind UI ==========
function bindUI(){
  $("#btnTheme")?.addEventListener("click",()=>setTheme(document.body.getAttribute("data-theme")==="dark"?"light":"dark"));
  const langSel=$("#langSel"); langSel.value=store.get("lang","es");
  langSel.addEventListener("change",()=>{store.set("lang",langSel.value); applyI18n();});
  window.addEventListener("hashchange", handleHash);
  $$("#mainNav a").forEach(a=>a.addEventListener("click",()=>setTimeout(handleHash,0)));
}

// ========== Init ==========
document.addEventListener("DOMContentLoaded",()=>{
  setTheme(store.get("theme","dark")); applyI18n();
  handleHash(); bindUI(); renderShortsFeed(); renderVideosFeed();
});