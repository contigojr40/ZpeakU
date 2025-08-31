// ========== Helpers ==========
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const store = {
  get:(k,def)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? def }catch{ return def } },
  set:(k,v)=> localStorage.setItem(k, JSON.stringify(v)),
  del:(k)=> localStorage.removeItem(k),
};

// ========== Supabase ==========
const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// ========== Theme & Router ==========
function setTheme(theme){ document.body.setAttribute("data-theme", theme); store.set("theme", theme); }
const ROUTES = ["home","fans","creator","support"];
function show(route){
  ROUTES.forEach(r=> $("#view-"+r)?.classList.toggle("hidden", r!==route));
  $$("#mainNav a").forEach(a=>{
    const match = a.getAttribute("href").replace("#/","");
    a.classList.toggle("active", match===route);
  });
}
function handleHash(){ const route = location.hash.replace("#/","")||"home"; show(ROUTES.includes(route)?route:"home"); }

// ========== i18n ==========
const I18N = {
  es:{
    "home.title":"✨ Bienvenidos a ZpeakU",
    "fan.title":"Acceso de Fan",
    "creator.title":"Cuenta de Creador",
    "support.title":"Soporte",
  },
  en:{
    "home.title":"✨ Welcome to ZpeakU",
    "fan.title":"Fan Access",
    "creator.title":"Creator Account",
    "support.title":"Support",
  }
};
function applyI18n(){
  const lang = store.get("lang","es");
  $$("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if(I18N[lang] && I18N[lang][key]) el.textContent = I18N[lang][key];
  });
}

// ========== Profiles & Storage ==========
const PROFILE_KEY = "zpk_creator_profile";
const defaultProfile = {
  allAccessPrice:100,
  donations:{ paypal:"", cashapp:"", venmo:"", zelle:"", custom:"" },
  sections:{
    shorts:{items:[]}, videos:{items:[]}, playlists:{items:[]}, live:{items:[]}, special:{items:[]}
  }
};
function getProfile(){ return store.get(PROFILE_KEY, defaultProfile); }
function saveProfile(p){ store.set(PROFILE_KEY,p); }
function newId(){ return 'it_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }

// ========== Sessions ==========
function sessionFan(){ return store.get("zpk_session_fan", null); }
function setSessionFan(s){ store.set("zpk_session_fan", s); }
function clearSessionFan(){ store.del("zpk_session_fan"); }
function sessionCreator(){ return store.get("zpk_session_creator", null); }
function setSessionCreator(s){ store.set("zpk_session_creator", s); }
function clearSessionCreator(){ store.del("zpk_session_creator"); }

// ========== OTP ==========
async function sendOtpEmail(email){ const { error } = await supabase.auth.signInWithOtp({ email, options:{ shouldCreateUser:true } }); return error; }
async function verifyOtpEmail(email, otp){ const { error }=await supabase.auth.verifyOtp({ email, token:String(otp||"").trim(), type:"email" }); return { error }; }

// ========== YouTube ==========
function extractYouTubeId(urlOrId){
  const s=(urlOrId||"").trim(); if(!s) return "";
  if(/^[A-Za-z0-9_-]{6,}$/.test(s) && !s.includes("http")) return s;
  try{ const u=new URL(s);
    if(u.hostname.includes("youtu.be")) return u.pathname.split("/").pop();
    if(u.hostname.includes("youtube.com")){
      if(u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
      if(u.searchParams.get("v")) return u.searchParams.get("v");
      return u.pathname.split("/").pop();
    }}catch{}
  return s;
}
function ytWatchUrl(idOrUrl){ return `https://www.youtube.com/watch?v=${extractYouTubeId(idOrUrl)}`; }
function ytEmbedSrc(idOrUrl){ const vid=extractYouTubeId(idOrUrl); return `https://www.youtube.com/embed/${vid}?modestbranding=1&rel=0`; }
function ytThumb(idOrUrl){ return `https://i.ytimg.com/vi/${extractYouTubeId(idOrUrl)}/hqdefault.jpg`; }

// ========== Player Modal ==========
function openPlayerById(id){
  const p=getProfile();
  const all=[...p.sections.shorts.items,...p.sections.videos.items,...p.sections.playlists.items,...p.sections.live.items,...p.sections.special.items];
  const it=all.find(x=>x.id===id); if(!it) return;
  $("#pmTitle").textContent=it.title||""; $("#pmTags").textContent=(it.tags||[]).map(t=>"#"+t).join(" ");
  $("#ytFrame").src=ytEmbedSrc(it.url); $("#playerModal").classList.remove("hidden");
}
function closePlayerModal(){ $("#ytFrame").src="about:blank"; $("#playerModal").classList.add("hidden"); }
$("#pmClose")?.addEventListener("click", closePlayerModal);
$("#playerModal")?.addEventListener("click", e=>{ if(e.target.id==="playerModal") closePlayerModal(); });

// ========== Donate Modal ==========
function openDonateModal(){
  const p=getProfile(); const box=$("#donLinks"); box.innerHTML="";
  const methods=[["paypal","PayPal"],["cashapp","Cash App"],["venmo","Venmo"],["zelle","Zelle"],["custom","Otro"]];
  methods.forEach(([k,label])=>{
    const v=p.donations[k]; if(v){ const a=document.createElement("a"); a.className="pill"; a.href=v; a.target="_blank"; a.textContent=label; box.appendChild(a); }
  });
  $("#donateModal").classList.remove("hidden");
}
function closeDonateModal(){ $("#donateModal").classList.add("hidden"); }
$("#pmDonate")?.addEventListener("click", openDonateModal);
$("#donClose")?.addEventListener("click", closeDonateModal);

// ========== Publications ==========
function renderPublications(){
  const p=getProfile();
  function draw(pane,items,sec){
    pane.innerHTML=""; if(!items.length){ pane.innerHTML="<div class='tiny muted'>—</div>"; return; }
    const ul=document.createElement("ul");
    items.forEach(it=>{
      const li=document.createElement("li");
      li.innerHTML=`<div class="row wrap gap">
        <strong>${it.title}</strong>
        <a href="${ytWatchUrl(it.url)}" target="_blank">${ytWatchUrl(it.url)}</a>
        <button class="pill tiny-btn" data-play="${it.id}">▶</button>
        <button class="pill outline tiny-btn" data-del="${it.id}" data-sec="${sec}">Eliminar</button>
      </div>`;
      ul.appendChild(li);
    });
    pane.appendChild(ul);
  }
  draw($("#pub-shorts"),p.sections.shorts.items,"shorts");
  draw($("#pub-videos"),p.sections.videos.items,"videos");
  draw($("#pub-playlists"),p.sections.playlists.items,"playlists");
  draw($("#pub-lives"),p.sections.live.items,"live");
  draw($("#pub-specials"),p.sections.special.items,"special");
}

// ========== Add Items ==========
function addShort(){ const t=$("#shortTitle").value,u=$("#shortUrl").value; if(!t||!u) return alert("Completa título y URL"); const tags=($("#shortTags").value||"").split(",").map(s=>s.trim()).filter(Boolean); const front=$("#shortFront").checked; const p=getProfile(); p.sections.shorts.items.unshift({id:newId(),title:t,url:u,tags,front,private:false}); saveProfile(p); renderPublications(); }
function addVideo(){ const t=$("#videoTitle").value,u=$("#videoUrl").value; if(!t||!u) return alert("Completa título y URL"); const price=Number($("#videoPrice").value||0),bill=$("#videoBilling").value; const p=getProfile(); p.sections.videos.items.unshift({id:newId(),title:t,url:u,price,billing:bill}); saveProfile(p); renderPublications(); }

// ========== Delete & Export ==========
$("#btnDeleteAccount")?.addEventListener("click", async ()=>{
  if(!confirm("¿Eliminar tu cuenta?")) return;
  const token=(await supabase.auth.getSession()).data?.session?.access_token;
  const res=await fetch("/api/delete",{method:"DELETE",headers:{Authorization:`Bearer ${token}`}}); if(res.ok){alert("Cuenta eliminada");await supabase.auth.signOut();location.reload();}
});
$("#btnExportData")?.addEventListener("click", async ()=>{
  const token=(await supabase.auth.getSession()).data?.session?.access_token;
  const res=await fetch("/api/export",{headers:{Authorization:`Bearer ${token}`}}); if(!res.ok) return alert("Error exportando"); const blob=await res.blob(); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="mis-datos.zip"; a.click(); URL.revokeObjectURL(url);
});

// ========== Bind UI ==========
function bindUI(){
  $("#btnTheme")?.addEventListener("click",()=> setTheme(document.body.getAttribute("data-theme")==="dark"?"light":"dark"));
  const langSel=$("#langSel"); langSel.value=store.get("lang","es"); langSel.onchange=()=>{store.set("lang",langSel.value);applyI18n();};
  $("#btnFanSendOtp")?.addEventListener("click",async()=>{const email=$("#fanEmail").value;const err=await sendOtpEmail(email);if(!err){$("#fanStepEmail").classList.add("hidden");$("#fanStepOtp").classList.remove("hidden");}});
  $("#btnFanVerifyOtp")?.addEventListener("click",async()=>{const email=$("#fanEmail").value,otp=$("#fanOtp").value;const {error}=await verifyOtpEmail(email,otp);if(!error){setSessionFan({email});$("#fanStepOtp").classList.add("hidden");$("#fanHub").classList.remove("hidden");}});
  $("#btnFanLogout")?.addEventListener("click",()=>{supabase.auth.signOut();clearSessionFan();$("#fanHub").classList.add("hidden");$("#fanStepEmail").classList.remove("hidden");});
  $("#btnCreatorSendOtp")?.addEventListener("click",async()=>{const email=$("#creatorEmail").value;const err=await sendOtpEmail(email);if(!err){$("#creatorStepEmail").classList.add("hidden");$("#creatorStepOtp").classList.remove("hidden");}});
  $("#btnCreatorVerifyOtp")?.addEventListener("click",async()=>{const email=$("#creatorEmail").value,otp=$("#creatorOtp").value;const {error}=await verifyOtpEmail(email,otp);if(!error){setSessionCreator({email});$("#creatorStepOtp").classList.add("hidden");$("#creatorPanel").classList.remove("hidden");renderPublications();}});
  $("#btnCreatorLogout")?.addEventListener("click",()=>{supabase.auth.signOut();clearSessionCreator();$("#creatorPanel").classList.add("hidden");$("#creatorStepEmail").classList.remove("hidden");});
  $("#btnSaveAA")?.addEventListener("click",()=>{const p=getProfile();p.allAccessPrice=Number($("#allAccessPrice").value||0);saveProfile(p);alert("All-Access guardado");});
  $("#btnSaveDonations")?.addEventListener("click",()=>{const p=getProfile();p.donations={paypal:$("#donPayPal").value,cashapp:$("#donCashApp").value,venmo:$("#donVenmo").value,zelle:$("#donZelle").value,custom:$("#donCustom").value};saveProfile(p);alert("Donaciones guardadas");});
  $("#btnAddShort")?.addEventListener("click",addShort);
  $("#btnAddVideo")?.addEventListener("click",addVideo);
}

// ========== Init ==========
document.addEventListener("DOMContentLoaded",()=>{
  setTheme(store.get("theme","dark"));
  applyI18n(); handleHash(); bindUI();
  window.addEventListener("hashchange", handleHash);
  renderPublications();
});