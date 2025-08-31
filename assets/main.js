// ==================== Helpers ====================
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const store = {
  get:(k,def)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? def }catch{ return def } },
  set:(k,v)=> localStorage.setItem(k, JSON.stringify(v)),
  del:(k)=> localStorage.removeItem(k)
};

// ==================== Supabase Init ====================
const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// ==================== Theme & Router ====================
function setTheme(theme){ document.body.setAttribute("data-theme", theme); store.set("theme", theme); }
const routes = ["home","fans","creator","support"];
function show(route){
  routes.forEach(r=>{
    const v = $("#view-"+r);
    if(v) v.classList.toggle("hidden", r!==route);
  });
  $$("#mainNav a").forEach(a=>{
    const match=a.getAttribute("href").replace("#/","");
    a.classList.toggle("active", match===route);
  });
}
function handleHash(){
  const route = location.hash.replace("#/","") || "home";
  show(routes.includes(route)?route:"home");
}

// ==================== i18n ====================
const I18N={
  es:{
    "nav.home":"Inicio","nav.fans":"Fans","nav.creator":"Creador","nav.support":"Soporte","nav.login":"Iniciar sesión",
    "hero.title":"✨ Bienvenidos a ZpeakU","hero.subtitle":"La plataforma puente entre Fans y Creadores",
    "fan.title":"Acceso de Fan","creator.title":"Cuenta de Creador",
    "support.title":"Soporte","donate.btn":"❤️ Donar al creador"
  },
  en:{
    "nav.home":"Home","nav.fans":"Fans","nav.creator":"Creator","nav.support":"Support","nav.login":"Login",
    "hero.title":"✨ Welcome to ZpeakU","hero.subtitle":"The bridge platform for Fans & Creators",
    "fan.title":"Fan Access","creator.title":"Creator Account",
    "support.title":"Support","donate.btn":"❤️ Donate to creator"
  }
};
function t(k){ const lang=store.get("lang","es"); return I18N[lang][k]||k; }
function applyI18n(){
  const lang=store.get("lang","es");
  $$("#mainNav a, [data-i18n], h1, h2, h3, button, .pill").forEach(el=>{
    const key = el.dataset.i18n;
    if(key && I18N[lang][key]) el.textContent = I18N[lang][key];
  });
}

// ==================== OTP ====================
async function sendOtpEmail(email){
  const { error } = await supabase.auth.signInWithOtp({ email, options:{ shouldCreateUser:true } });
  return error;
}
async function verifyOtpEmail(email, otp){
  const { error }=await supabase.auth.verifyOtp({ email, token:String(otp||"").trim(), type:"email" });
  return { error };
}

// ==================== Session ====================
function sessionFan(){ return store.get("zpk_session_fan", null); }
function setSessionFan(s){ store.set("zpk_session_fan", s); }
function clearSessionFan(){ store.del("zpk_session_fan"); }

function sessionCreator(){ return store.get("zpk_session_creator", null); }
function setSessionCreator(s){ store.set("zpk_session_creator", s); }
function clearSessionCreator(){ store.del("zpk_session_creator"); }

// ==================== Profile ====================
const PROFILE_KEY="zpk_creator_profile_v1";
const defaultProfile={ allAccessPrice:100, sections:{shorts:{items:[]},videos:{items:[]},playlists:{items:[]},live:{items:[]},special:{items:[]}} };
function getProfile(){ return store.get(PROFILE_KEY, JSON.parse(JSON.stringify(defaultProfile))); }
function saveProfile(p){ store.set(PROFILE_KEY, p); }
const newId=()=> 'it_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);

// ==================== YouTube Helpers ====================
function extractYouTubeId(urlOrId){
  const s=(urlOrId||"").trim(); if(!s) return "";
  if(/^[A-Za-z0-9_-]{6,}$/.test(s)&&!s.includes("http")) return s;
  try{ const u=new URL(s);
    if(u.hostname.includes("youtu.be")) return u.pathname.split("/").pop();
    if(u.hostname.includes("youtube.com")){
      if(u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
      if(u.searchParams.get("v")) return u.searchParams.get("v");
      const parts=u.pathname.split("/"); return parts.pop();
    }
  }catch{} return s;
}
function ytWatchUrl(idOrUrl){ const id=extractYouTubeId(idOrUrl); return `https://www.youtube.com/watch?v=${id}`; }
function ytEmbedSrc(idOrUrl){ const id=extractYouTubeId(idOrUrl); return `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&playsinline=1`; }
function ytThumb(idOrUrl){ const id=extractYouTubeId(idOrUrl); return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; }

// ==================== HOME ====================
function renderHome(){
  const rail=$("#homeShortsRail"); if(!rail) return;
  rail.innerHTML="";
  const p=getProfile(); const shorts=(p.sections.shorts.items||[]).filter(s=>s.front&&!s.private);
  if(!shorts.length){ rail.innerHTML=`<div class="tiny muted">— No shorts —</div>`; return; }
  shorts.forEach(s=>{
    const card=document.createElement("div"); card.className="short-card";
    card.innerHTML=`
      <img class="short-thumb" src="${s.thumb||ytThumb(s.url)}" data-play="${s.id}">
      <div class="short-meta"><div class="title">${s.title}</div><div class="tags">${(s.tags||[]).map(t=>"#"+t).join(" ")}</div></div>
    `;
    rail.appendChild(card);
  });
  $$("#homeShortsRail [data-play]").forEach(el=>{
    el.onclick=()=>{
      const s=(getProfile().sections.shorts.items||[]).find(x=>x.id===el.getAttribute("data-play"));
      if(s) openPlayerModal(s);
    };
  });
}

// ==================== Player Modal ====================
function openPlayerModal(s){
  $("#pmTitle").textContent=s.title||"";
  $("#pmTags").textContent=(s.tags||[]).map(t=>"#"+t).join(" ");
  $("#ytFrame").src=ytEmbedSrc(s.url);
  $("#playerModal").classList.remove("hidden");
}
function closePlayerModal(){
  $("#ytFrame").src="about:blank";
  $("#playerModal").classList.add("hidden");
}
$("#pmClose")?.addEventListener("click", closePlayerModal);

// ==================== FAN ====================
function renderFanHub(){
  const f=sessionFan(); if(!f) return;
  $("#fanBadge").textContent=f.email;
  $("#fanHub").classList.remove("hidden");
}

// ==================== CREATOR ====================
function renderCreatorPanel(){
  const c=sessionCreator(); if(!c) return;
  const p=getProfile();
  $("#allAccessPrice").value=p.allAccessPrice;

  const shortsPane=$("#pub-shorts"); shortsPane.innerHTML="";
  (p.sections.shorts.items||[]).forEach(it=>{
    const li=document.createElement("li");
    li.innerHTML=`<strong>${it.title}</strong> <a href="${ytWatchUrl(it.url)}" target="_blank">YouTube</a>`;
    shortsPane.appendChild(li);
  });

  $("#creatorPanel").classList.remove("hidden");
}

// Add Short
function addShort(){
  const t=$("#shortTitle").value.trim(), u=$("#shortUrl").value.trim();
  const tags=($("#shortTags").value||"").split(",").map(s=>s.trim());
  if(!t||!u) return alert("Completa título y URL");
  const p=getProfile(); p.sections.shorts.items.unshift({id:newId(),title:t,url:u,tags,front:true,private:false});
  saveProfile(p); renderCreatorPanel(); renderHome();
}

// Add Video
function addVideo(){
  const t=$("#videoTitle").value.trim(), u=$("#videoUrl").value.trim();
  const price=Number($("#videoPrice").value||0), bill=$("#videoBilling").value;
  if(!t||!u) return alert("Completa título y URL");
  const p=getProfile(); p.sections.videos.items.unshift({id:newId(),title:t,url:u,price,billing:bill});
  saveProfile(p); renderCreatorPanel();
}

// ==================== Delete Account ====================
$("#btnDeleteAccount")?.addEventListener("click", async()=>{
  if(!confirm("¿Eliminar tu cuenta?")) return;
  const token=(await supabase.auth.getSession()).data?.session?.access_token;
  const res=await fetch("/api/delete",{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
  if(res.ok){ alert("Cuenta eliminada."); await supabase.auth.signOut(); location.reload(); }
});

// ==================== Export ZIP ====================
$("#btnExportData")?.addEventListener("click", async()=>{
  const token=(await supabase.auth.getSession()).data?.session?.access_token;
  const res=await fetch("/api/export",{headers:{Authorization:`Bearer ${token}`}});
  if(!res.ok) return alert("Error exportando");
  const blob=await res.blob(); const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download="mis-datos.zip"; a.click();
  URL.revokeObjectURL(url);
});

// ==================== Bind UI ====================
function bindUI(){
  // Tema
  $("#btnTheme")?.addEventListener("click",()=>setTheme(document.body.getAttribute("data-theme")==="dark"?"light":"dark"));

  // Idioma
  const sel=$("#langSel"); sel.value=store.get("lang","es");
  sel.addEventListener("change",()=>{ store.set("lang",sel.value); applyI18n(); });

  // Nav
  window.addEventListener("hashchange", handleHash);
  $$("#mainNav a").forEach(a=> a.addEventListener("click",()=>setTimeout(handleHash,0)));

  // Fan OTP
  $("#btnFanSendOtp")?.addEventListener("click", async()=>{
    const email=$("#fanEmail").value.trim(); if(!email) return alert("Escribe tu email");
    const err=await sendOtpEmail(email); if(err) return alert("Error: "+err.message);
    $("#fanStepEmail").classList.add("hidden"); $("#fanStepOtp").classList.remove("hidden");
  });
  $("#btnFanVerifyOtp")?.addEventListener("click", async()=>{
    const email=$("#fanEmail").value.trim(), otp=$("#fanOtp").value.trim();
    const {error}=await verifyOtpEmail(email,otp); if(error) return alert("OTP incorrecto");
    setSessionFan({email}); $("#fanStepOtp").classList.add("hidden"); renderFanHub();
  });
  $("#btnFanLogout")?.addEventListener("click", async()=>{ await supabase.auth.signOut(); clearSessionFan(); location.reload(); });

  // Creator OTP
  $("#btnCreatorSendOtp")?.addEventListener("click", async()=>{
    const email=$("#creatorEmail").value.trim(); if(!email) return alert("Escribe email");
    const err=await sendOtpEmail(email); if(err) return alert("Error: "+err.message);
    $("#creatorStepEmail").classList.add("hidden"); $("#creatorStepOtp").classList.remove("hidden");
  });
  $("#btnCreatorVerifyOtp")?.addEventListener("click", async()=>{
    const email=$("#creatorEmail").value.trim(), otp=$("#creatorOtp").value.trim();
    const {error}=await verifyOtpEmail(email,otp); if(error) return alert("OTP incorrecto");
    setSessionCreator({email}); $("#creatorStepOtp").classList.add("hidden"); renderCreatorPanel();
  });
  $("#btnCreatorLogout")?.addEventListener("click", async()=>{ await supabase.auth.signOut(); clearSessionCreator(); location.reload(); });

  // Add Content
  $("#btnAddShort")?.addEventListener("click", addShort);
  $("#btnAddVideo")?.addEventListener("click", addVideo);
}

// ==================== Init ====================
document.addEventListener("DOMContentLoaded",()=>{
  setTheme(store.get("theme","dark"));
  applyI18n();
  bindUI();
  handleHash();
  renderHome();
  renderFanHub();
  renderCreatorPanel();
});