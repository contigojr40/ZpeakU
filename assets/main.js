// ========== Helpers ==========
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const store = {
  get: (k,def)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? def }catch{ return def } },
  set: (k,v)=> localStorage.setItem(k, JSON.stringify(v)),
  del: (k)=> localStorage.removeItem(k)
};

// ========== Supabase ==========
const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// ========== Router ==========
const ROUTES = ["home","fans","creator","support"];
function show(route){
  ROUTES.forEach(r => $("#view-"+r)?.classList.toggle("hidden", r!==route));
  $$("#mainNav a").forEach(a=>{
    const r=a.getAttribute("href").replace("#/","");
    a.classList.toggle("active", r===route);
  });
}
function handleHash(){ const r=location.hash.replace("#/","")||"home"; show(ROUTES.includes(r)?r:"home"); }

// ========== Theme ==========
function setTheme(theme){ document.body.setAttribute("data-theme", theme); store.set("theme", theme); }

// ========== I18n ==========
const I18N = {
  es:{ home:"Inicio", fans:"Fans", creator:"Creador", support:"Soporte", login:"Iniciar sesión" },
  en:{ home:"Home", fans:"Fans", creator:"Creator", support:"Support", login:"Login" }
};
function applyI18n(){
  const lang=store.get("lang","es");
  $$("#mainNav a").forEach(a=>{
    const r=a.getAttribute("href").replace("#/","");
    if(I18N[lang][r]) a.textContent=I18N[lang][r];
  });
  $("#langSel").value=lang;
}

// ========== Perfil Demo Local ==========
const PROFILE_KEY="zpk_creator_profile";
const defaultProfile={allAccessPrice:100,sections:{shorts:{items:[]},videos:{items:[]},playlists:{items:[]},live:{items:[]},special:{items:[]}}};
function getProfile(){ return store.get(PROFILE_KEY, JSON.parse(JSON.stringify(defaultProfile))); }
function saveProfile(p){ store.set(PROFILE_KEY,p); }
function newId(){ return 'it_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }

// ========== Sesiones ==========
function sessionFan(){ return store.get("zpk_session_fan",null); }
function setSessionFan(s){ store.set("zpk_session_fan",s); }
function clearSessionFan(){ store.del("zpk_session_fan"); }
function sessionCreator(){ return store.get("zpk_session_creator",null); }
function setSessionCreator(s){ store.set("zpk_session_creator",s); }
function clearSessionCreator(){ store.del("zpk_session_creator"); }

// ========== OTP ==========
async function sendOtpEmail(email){ const {error}=await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true}}); return error; }
async function verifyOtpEmail(email,otp){ const {error}=await supabase.auth.verifyOtp({email,token:String(otp||"").trim(),type:"email"}); return {error}; }

// ========== YouTube helpers ==========
function extractYouTubeId(urlOrId){ try{const u=new URL(urlOrId); if(u.hostname.includes("youtu.be")) return u.pathname.split("/").pop(); if(u.searchParams.get("v")) return u.searchParams.get("v"); return urlOrId;}catch{return urlOrId;} }
function ytWatchUrl(idOrUrl){ return `https://www.youtube.com/watch?v=${extractYouTubeId(idOrUrl)}`; }
function ytEmbedSrc(idOrUrl){ return `https://www.youtube.com/embed/${extractYouTubeId(idOrUrl)}?modestbranding=1&rel=0&playsinline=1`; }
function ytThumb(idOrUrl){ return `https://i.ytimg.com/vi/${extractYouTubeId(idOrUrl)}/hqdefault.jpg`; }

// ========== Player ==========
function openPlayerModal({id,title,url,tags=[]}){
  $("#pmTitle").textContent=title;
  $("#pmTags").textContent=(tags||[]).map(t=>"#"+t).join(" ");
  $("#ytFrame").src=ytEmbedSrc(url);
  $("#playerModal").classList.remove("hidden");
}
function closePlayerModal(){ $("#ytFrame").src="about:blank"; $("#playerModal").classList.add("hidden"); }
$("#pmClose")?.addEventListener("click", closePlayerModal);
$("#playerModal")?.addEventListener("click", e=>{ if(e.target.id==="playerModal") closePlayerModal(); });

// ========== Render HOME ==========
function renderHome(){
  const rail=$("#homeShortsRail"); if(!rail) return;
  rail.innerHTML="";
  const shorts=(getProfile().sections.shorts.items||[]).filter(s=>!s.private);
  if(!shorts.length){ rail.innerHTML="<div class='muted tiny'>— Sin shorts aún —</div>"; return; }
  shorts.forEach(s=>{
    const card=document.createElement("div"); card.className="short-card";
    card.innerHTML=`
      <img class="short-thumb" src="${s.thumb||ytThumb(s.url)}" data-play="${s.id}">
      <div class="short-meta">
        <div class="title">${s.title}</div>
        <div class="tags">${(s.tags||[]).map(t=>"#"+t).join(" ")}</div>
      </div>`;
    rail.appendChild(card);
  });
  $$("#homeShortsRail [data-play]").forEach(el=>{
    el.onclick=()=>openPlayerModal({id:el.dataset.play,title:"Short",url:shorts.find(x=>x.id===el.dataset.play).url});
  });
}

// ========== Render FANS ==========
function renderFanHub(){
  const f=sessionFan(); if(!f){ $("#fanHub")?.classList.add("hidden"); return; }
  $("#fanBadge").textContent=f.email; $("#fanHub").classList.remove("hidden");
}

// ========== Render CREATOR ==========
function renderCreatorPanel(){
  const c=sessionCreator(); if(!c){ $("#creatorPanel")?.classList.add("hidden"); return; }
  $("#creatorPanel").classList.remove("hidden");
}

// ========== Export ZIP ==========
const btnExportData=$("#btnExportData");
if(btnExportData){
  btnExportData.addEventListener("click", async()=>{
    const token=(await supabase.auth.getSession()).data?.session?.access_token;
    const res=await fetch("/api/export",{headers:{Authorization:`Bearer ${token}`}});
    if(!res.ok) return alert("Error al exportar");
    const blob=await res.blob(); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="mis-datos.zip"; a.click(); URL.revokeObjectURL(url);
  });
}

// ========== Eliminar cuenta ==========
const btnDeleteAccount=$("#btnDeleteAccount");
if(btnDeleteAccount){
  btnDeleteAccount.addEventListener("click", async()=>{
    if(!confirm("¿Eliminar cuenta definitivamente?")) return;
    const token=(await supabase.auth.getSession()).data?.session?.access_token;
    const res=await fetch("/api/delete",{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
    if(res.ok){ alert("Cuenta eliminada ✅"); await supabase.auth.signOut(); location.reload(); }
    else alert("Error al eliminar cuenta");
  });
}

// ========== Bind UI ==========
function bindUI(){
  $("#btnTheme")?.addEventListener("click", ()=>setTheme(document.body.getAttribute("data-theme")==="dark"?"light":"dark"));
  $("#langSel")?.addEventListener("change",()=>{ store.set("lang",$("#langSel").value); applyI18n(); });

  // FAN OTP
  $("#btnFanSendOtp")?.addEventListener("click",async()=>{
    const email=$("#fanEmail").value.trim().toLowerCase();
    if(!email) return alert("Escribe tu email.");
    const err=await sendOtpEmail(email); if(err) return alert("Error: "+err.message);
    $("#fanStepEmail").classList.add("hidden"); $("#fanStepOtp").classList.remove("hidden");
  });
  $("#btnFanVerifyOtp")?.addEventListener("click",async()=>{
    const email=$("#fanEmail").value.trim().toLowerCase(), otp=$("#fanOtp").value.trim();
    const {error}=await verifyOtpEmail(email,otp); if(error) return alert("OTP incorrecto");
    setSessionFan({email}); renderFanHub();
  });
  $("#btnFanLogout")?.addEventListener("click",()=>{ clearSessionFan(); renderFanHub(); });

  // CREATOR OTP
  $("#btnCreatorSendOtp")?.addEventListener("click",async()=>{
    const email=$("#creatorEmail").value.trim().toLowerCase();
    if(!email) return alert("Escribe tu email.");
    const err=await sendOtpEmail(email); if(err) return alert("Error: "+err.message);
    $("#creatorStepEmail").classList.add("hidden"); $("#creatorStepOtp").classList.remove("hidden");
  });
  $("#btnCreatorVerifyOtp")?.addEventListener("click",async()=>{
    const email=$("#creatorEmail").value.trim().toLowerCase(), otp=$("#creatorOtp").value.trim();
    const {error}=await verifyOtpEmail(email,otp); if(error) return alert("OTP incorrecto");
    setSessionCreator({email}); renderCreatorPanel();
  });
  $("#btnCreatorLogout")?.addEventListener("click",()=>{ clearSessionCreator(); renderCreatorPanel(); });
}

// ========== Init ==========
document.addEventListener("DOMContentLoaded",()=>{
  setTheme(store.get("theme","dark")); applyI18n();
  window.addEventListener("hashchange",handleHash); handleHash();
  bindUI(); renderHome(); renderFanHub(); renderCreatorPanel();
});