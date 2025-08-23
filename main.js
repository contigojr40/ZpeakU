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
    "nav.home":"Inicio","nav.stream":"Transmisión","nav.fans":"Fans","nav.creator":"Creador","nav.support":"Soporte","nav.login":"Iniciar sesión",
    "hero.title":"✨ Bienvenidos a ZpeakU","hero.subtitle":"La plataforma puente entre Fans y Creadores","hero.fan":"🔔 Suscribirme como Fan","hero.creator":"🧰 Suscribirme como Creador",
    "home.shorts":"Shorts gratis de la comunidad","home.videos":"Videos públicos de la comunidad",
    "fan.title":"Acceso de Fan","fan.subtitle":"Verifica tu email con un código OTP. Tu cuenta es gratis; puedes desbloquear contenidos cuando quieras.","fan.send":"Enviar código al email","fan.codeLabel":"Código OTP de 6 dígitos","fan.verify":"Verificar","fan.resend":"Reenviar","fan.logged":"Conectado como:","fan.logout":"Salir","fan.unlockAll":"Desbloquear todo",
    "creator.title":"Cuenta de Creador","creator.login":"Login Creador","creator.send":"Enviar código al email","creator.verifyTitle":"Verificación","creator.verify":"Verificar","creator.resend":"Reenviar","creator.monthly":"Precio mensual (USD)","creator.saveAA":"Guardar All-Access",
    "creator.donations":"Donaciones","creator.saveDon":"Guardar métodos de donación","creator.front":"Mostrar en portada","creator.addShort":"Agregar Short","creator.addVideo":"Agregar Video/Playlist/Live/Evento",
    "support.title":"Soporte","support.text":"Escríbenos si necesitas ayuda con tu cuenta o transmisión.",
    "footer.support":"Soporte","footer.terms":"Términos","footer.privacy":"Privacidad",
    "modal.close":"Cerrar","donate.btn":"❤️ Donar al creador","donate.title":"Elige un método de donación","donate.note":"El pago va directo al creador (fuera de ZpeakU).",
    "don.paypal":"PayPal","don.cashapp":"Cash App","don.venmo":"Venmo","don.zelle":"Zelle","don.custom":"Otro"
  },
  en:{
    "nav.home":"Home","nav.stream":"Stream","nav.fans":"Fans","nav.creator":"Creator","nav.support":"Support","nav.login":"Log in",
    "hero.title":"✨ Welcome to ZpeakU","hero.subtitle":"A bridge platform for Fans & Creators","hero.fan":"🔔 Subscribe as Fan","hero.creator":"🧰 Subscribe as Creator",
    "home.shorts":"Community free Shorts","home.videos":"Community public Videos",
    "fan.title":"Fan Access","fan.subtitle":"Verify your email with an OTP. Your account is free; you can unlock content anytime.","fan.send":"Send code to email","fan.codeLabel":"6‑digit OTP","fan.verify":"Verify","fan.resend":"Resend","fan.logged":"Logged in as:","fan.logout":"Log out","fan.unlockAll":"Unlock all",
    "creator.title":"Creator account","creator.login":"Creator Login","creator.send":"Send code","creator.verifyTitle":"Verification","creator.verify":"Verify","creator.resend":"Resend","creator.monthly":"Monthly price (USD)","creator.saveAA":"Save All‑Access",
    "creator.donations":"Donations","creator.saveDon":"Save donation methods","creator.front":"Show on homepage","creator.addShort":"Add Short","creator.addVideo":"Add Video/Playlist/Live/Event",
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
  const fanEmail=$("#fanEmail"); if(fanEmail) fanEmail.placeholder = lang==="en" ? "email@example.com" : "email@correo.com";
  const pmDonate=$("#pmDonate"); if(pmDonate) pmDonate.textContent = t("donate.btn");
}

// ========== Theme & Router ==========
function setTheme(theme){ document.body.setAttribute("data-theme", theme); store.set("theme", theme); }
const ROUTES = ["home","stream","fans","creator","support"];
function show(route){
  ROUTES.forEach(r=> $("#view-"+r)?.classList.toggle("hidden", r!==route));
  $$("#mainNav a").forEach(a=>{
    const m = a.getAttribute("href").replace("#/","");
    a.classList.toggle("active", m===route);
  });
}
function handleHash(){ const r=(location.hash.replace("#/","")||"home"); show(ROUTES.includes(r)? r : "home"); }

// ========== Supabase (OTP demo/real) ==========
const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
async function sendOtpEmail(email){ if(DEMO_MODE) return null; const { error }=await supabase.auth.signInWithOtp({ email, options:{ shouldCreateUser:true } }); return error; }
async function verifyOtpEmail(email, otp){ if(DEMO_MODE) return { error:null }; const { error }=await supabase.auth.verifyOtp({ email, token:String(otp||"").trim(), type:"email" }); return { error }; }

// ========== Storage del creador ==========
const PROFILE_KEY = "zpk_creator_profile";
const LEGACY_KEYS = ["zpk_creator_profile_v8","zpk_creator_profile_v7","zpk_creator_profile_v6","zpk_creator_profile_v5","zpk_creator_profile_v4"];
const defaultProfile = {
  allAccessPrice: 100,
  donations:{ paypal:"", cashapp:"", venmo:"", zelle:"", custom:"" },
  sections:{
    shorts:{items:[]},           // {id,title,url,tags[],front:boolean,private:boolean,thumb}
    videos:{items:[]},           // {id,title,url,price,billing,front,private}
    playlists:{items:[]},
    live:{items:[]},
    special:{items:[]}
  }
};
function migrate(){
  let cur=store.get(PROFILE_KEY,null);
  if(cur && cur.sections) return cur;
  for(const k of LEGACY_KEYS){
    const old=store.get(k,null);
    if(old && old.sections){ store.set(PROFILE_KEY, old); return old; }
  }
  store.set(PROFILE_KEY, defaultProfile);
  return defaultProfile;
}
function getProfile(){ return store.get(PROFILE_KEY, migrate()); }
function saveProfile(p){ store.set(PROFILE_KEY, p); }

// ========== Sesiones (demo) ==========
function sessionFan(){ return store.get("zpk_session_fan", null); }
function setSessionFan(s){ store.set("zpk_session_fan", s); }
function clearSessionFan(){ store.del("zpk_session_fan"); }
function sessionCreator(){ return store.get("zpk_session_creator", null); }
function setSessionCreator(s){ store.set("zpk_session_creator", s); }
function clearSessionCreator(){ store.del("zpk_session_creator"); }

// ========== YouTube helpers ==========
function extractYouTubeId(urlOrId){
  const s=(urlOrId||"").trim();
  if(!s) return "";
  if(/^[A-Za-z0-9_-]{6,}$/.test(s) && !s.includes("http")) return s;
  try{
    const u=new URL(s);
    if(u.hostname.includes("youtu.be")) return u.pathname.split("/").pop();
    if(u.hostname.includes("youtube.com")){
      if(u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
      if(u.searchParams.get("v")) return u.searchParams.get("v");
      const parts=u.pathname.split("/"); return parts.pop();
    }
  }catch{}
  return s;
}
function ytWatchUrl(idOrUrl){ return `https://www.youtube.com/watch?v=${extractYouTubeId(idOrUrl)}`; }
function ytEmbedSrc(idOrUrl){ const vid=extractYouTubeId(idOrUrl); return `https://www.youtube.com/embed/${vid}?modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`; }
function ytThumb(idOrUrl){ return `https://i.ytimg.com/vi/${extractYouTubeId(idOrUrl)}/hqdefault.jpg`; }

// ========== HOME Feeds (Shorts/Videos) ==========
function shortCardHtml(s){
  const thumb=s.thumb || ytThumb(s.url);
  return `
  <div class="feed-item">
    <img class="feed-thumb" src="${thumb}" alt="" data-play="${s.id}">
    <div class="feed-meta">
      <div class="title">${s.title||""}</div>
      <div class="sub"><span class="tags">${(s.tags||[]).map(t=>"#"+t).join(" ")}</span></div>
      <div class="cta">
        <a class="pill outline tiny-btn" target="_blank" rel="noopener" href="${ytWatchUrl(s.url)}">YouTube</a>
        <button class="pill tiny-btn" data-donate="${s.id}" data-kind="short">${t("donate.btn")}</button>
      </div>
    </div>
  </div>`;
}
function videoCardHtml(v){
  const thumb=v.thumb || ytThumb(v.url);
  return `
  <div class="feed-item">
    <img class="feed-thumb" src="${thumb}" alt="" data-play="${v.id}">
    <div class="feed-meta">
      <div class="title">${v.title||""}</div>
      <div class="sub"><span class="tags">${(v.tags||[]).map(t=>"#"+t).join(" ")}</span></div>
      <div class="cta">
        <a class="pill outline tiny-btn" target="_blank" rel="noopener" href="${ytWatchUrl(v.url)}">YouTube</a>
        <button class="pill tiny-btn" data-donate="${v.id}" data-kind="video">${t("donate.btn")}</button>
      </div>
    </div>
  </div>`;
}
function renderShortsFeed(){
  const p=getProfile();
  const list=(p.sections.shorts.items||[]).filter(s=> s.front && !s.private);
  const feed=$("#shortsFeed"); feed.innerHTML = list.length ? list.map(shortCardHtml).join("") : `<div class="tiny muted">—</div>`;
  bindPlayButtons(feed);
  bindDonateButtons(feed);
}
function renderVideosFeed(){
  const p=getProfile();
  const publics = (arr)=> (arr||[]).filter(it=> (it.price==null || Number(it.price)===0) && !it.private);
  const mix = [
    ...publics(p.sections.videos.items),
    ...publics(p.sections.playlists.items),
    ...publics(p.sections.live.items),
    ...publics(p.sections.special.items),
  ].sort((a,b)=> (a.id<b.id?1:-1));
  const feed=$("#videosFeed"); feed.innerHTML = mix.length ? mix.map(videoCardHtml).join("") : `<div class="tiny muted">—</div>`;
  bindPlayButtons(feed);
  bindDonateButtons(feed);
}
function bindPlayButtons(scope=document){
  scope.querySelectorAll("[data-play]")?.forEach(btn=>{
    btn.onclick=()=> openPlayerById(btn.getAttribute("data-play"));
  });
}

// ========== Player Modal ==========
function openPlayerById(id){
  const p=getProfile();
  const all=[
    ...p.sections.shorts.items,
    ...p.sections.videos.items,
    ...p.sections.playlists.items,
    ...p.sections.live.items,
    ...p.sections.special.items,
  ];
  const it=all.find(x=>x.id===id);
  if(!it) return;
  $("#pmTitle").textContent = it.title||"";
  $("#pmTags").textContent  = (it.tags||[]).map(t=>"#"+t).join(" ");
  $("#ytFrame").src = ytEmbedSrc(it.url);
  $("#playerModal").classList.remove("hidden");
}
function closePlayerModal(){
  $("#ytFrame").src="about:blank";
  $("#playerModal").classList.add("hidden");
}
$("#pmClose")?.addEventListener("click", closePlayerModal);
$("#playerModal")?.addEventListener("click", e=>{ if(e.target.id==="playerModal") closePlayerModal(); });

// ========== Donate Modal ==========
function openDonateModal(){
  const p=getProfile(), box=$("#donLinks"); box.innerHTML="";
  const methods=[["paypal","don.paypal"],["cashapp","don.cashapp"],["venmo","don.venmo"],["zelle","don.zelle"],["custom","don.custom"]];
  let any=false;
  methods.forEach(([k,label])=>{
    const v=(p.donations||{})[k];
    if(v){
      any=true;
      const a=document.createElement("a");
      a.className="pill"; a.target="_blank"; a.rel="noopener"; a.textContent=t(label);
      a.href = k==="zelle" && !/^https?:\/\//i.test(v) ? `mailto:${v}` : v;
      box.appendChild(a);
    }
  });
  if(!any){
    const pEl=document.createElement("p");
    pEl.className="tiny muted";
    pEl.textContent = store.get("lang","es")==="es" ? "El creador aún no configuró métodos de donación." : "Creator hasn’t set donation methods yet.";
    box.appendChild(pEl);
  }
  $("#donateModal").classList.remove("hidden");
  $("#donateModal").setAttribute("aria-hidden","false");
}
function closeDonateModal(){
  $("#donateModal").classList.add("hidden");
  $("#donateModal").setAttribute("aria-hidden","true");
}
function bindDonateButtons(scope=document){
  scope.querySelectorAll("[data-donate]")?.forEach(btn=>{
    btn.onclick=openDonateModal;
  });
  $("#donClose")?.addEventListener("click", closeDonateModal);
}
$("#pmDonate")?.addEventListener("click", openDonateModal);

// ========== CREATOR: publicaciones ==========
function renderPublications(){
  const p=getProfile();
  const panes={
    shorts:$("#pub-shorts"),
    videos:$("#pub-videos"),
    playlists:$("#pub-playlists"),
    lives:$("#pub-lives"),
    specials:$("#pub-specials")
  };
  const draw=(pane,items,sec)=>{
    pane.innerHTML="";
    if(!items.length){ pane.innerHTML=`<div class="empty tiny muted">—</div>`; return; }
    const ul=document.createElement("ul"); ul.className="list";
    items.forEach(it=>{
      const li=document.createElement("li");
      const price=(it.price==null || Number(it.price)===0) ? (store.get("lang","es")==="es"?"Gratis":"Free") : (it.billing==="monthly"? `$${it.price}/mes` : `$${it.price}`);
      li.innerHTML=`
        <div class="row wrap gap">
          <strong>${it.title}</strong>
          <a class="tiny" href="${ytWatchUrl(it.url)}" target="_blank" rel="noopener">${ytWatchUrl(it.url)}</a>
          ${sec==="shorts" ? `<span class="chip">${it.private?"Privado":"Público"}</span><span class="chip">Portada: ${it.front?"Sí":"No"}</span>` : `<span class="chip">${price}</span>`}
          ${sec==="shorts" ? `<button class="pill outline tiny-btn" data-toggle-private="${it.id}" data-sec="${sec}">${it.private?"Hacer público":"Poner privado"}</button>` : ""}
          ${sec==="shorts" ? `<button class="pill outline tiny-btn" data-toggle-front="${it.id}" data-sec="${sec}" ${it.private?"disabled":""}>${it.front?"Ocultar de portada":"Mostrar en portada"}</button>` : ""}
          <button class="pill outline tiny-btn" data-edit="${it.id}" data-sec="${sec}">Editar</button>
          <button class="pill outline tiny-btn danger" data-del="${it.id}" data-sec="${sec}">Eliminar</button>
        </div>`;
      ul.appendChild(li);
    });
    pane.appendChild(ul);
  };
  draw(panes.shorts,    p.sections.shorts.items,"shorts");
  draw(panes.videos,    p.sections.videos.items,"videos");
  draw(panes.playlists, p.sections.playlists.items,"playlists");
  draw(panes.lives,     p.sections.live.items,"live");
  draw(panes.specials,  p.sections.special.items,"special");

  // acciones
  $$("#creatorPanel [data-toggle-front]").forEach(b=> b.onclick=()=>{
    const id=b.getAttribute("data-toggle-front"),sec=b.getAttribute("data-sec");
    const p=getProfile(); const it=p.sections[sec].items.find(x=>x.id===id);
    if(!it || it.private) return; it.front=!it.front; saveProfile(p); renderPublications(); renderShortsFeed();
  });
  $$("#creatorPanel [data-toggle-private]").forEach(b=> b.onclick=()=>{
    const id=b.getAttribute("data-toggle-private"),sec=b.getAttribute("data-sec");
    const p=getProfile(); const it=p.sections[sec].items.find(x=>x.id===id);
    if(!it) return; it.private=!it.private; if(it.private) it.front=false; saveProfile(p); renderPublications(); renderShortsFeed();
  });
  $$("#creatorPanel [data-del]").forEach(b=> b.onclick=()=>{
    const id=b.getAttribute("data-del"),sec=b.getAttribute("data-sec");
    const p=getProfile(); p.sections[sec].items=p.sections[sec].items.filter(x=>x.id!==id);
    saveProfile(p); renderPublications(); renderShortsFeed(); renderVideosFeed();
  });
  $$("#creatorPanel [data-edit]").forEach(b=> b.onclick=()=>{
    const id=b.getAttribute("data-edit"),sec=b.getAttribute("data-sec");
    const p=getProfile(); const it=p.sections[sec].items.find(x=>x.id===id);
    if(!it) return;
    const nt=prompt("Título:", it.title); if(nt===null) return;
    const nu=prompt("URL (YouTube):", ytWatchUrl(it.url)); if(nu===null) return;
    if(sec==="shorts"){
      const tg=prompt("Etiquetas separadas por coma:", (it.tags||[]).join(", "));
      const priv=confirm("¿Poner como PRIVADO (monetizable)?");
      const fr = !priv && confirm("¿Mostrar en portada?");
      Object.assign(it,{ title:nt.trim(), url:ytWatchUrl(nu.trim()), tags:(tg||"").split(",").map(s=>s.trim()).filter(Boolean), private:priv, front:fr && !priv, thumb:ytThumb(nu.trim()) });
    }else{
      let np=Number(prompt("Precio (USD, 0 = público):", it.price ?? 0));
      let nb=prompt("Billing (monthly | one_time):", it.billing || "monthly") || "monthly";
      Object.assign(it,{ title:nt.trim(), url:nu.trim(), price:isNaN(np)?0:np, billing:nb, front: (Number(np)===0) });
    }
    saveProfile(p); renderPublications(); renderShortsFeed(); renderVideosFeed();
  });

  // tabs
  $$("#creatorPanel .tab").forEach(btn=>{
    btn.onclick=()=>{
      $$("#creatorPanel .tab").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      const id=btn.getAttribute("data-tab");
      $$("#creatorPanel .pub-pane").forEach(p=>p.classList.toggle("hidden", p.id!==id));
    };
  });
}

// ========== CREATOR: donaciones ==========
function saveDonations(){
  const p=getProfile();
  p.donations = {
    paypal:  $("#donPayPal")?.value.trim() || "",
    cashapp: $("#donCashApp")?.value.trim() || "",
    venmo:   $("#donVenmo")?.value.trim() || "",
    zelle:   $("#donZelle")?.value.trim() || "",
    custom:  $("#donCustom")?.value.trim() || ""
  };
  saveProfile(p);
  $("#donSaved").textContent = store.get("lang","es")==="es" ? "Guardado ✅" : "Saved ✅";
  setTimeout(()=> $("#donSaved").textContent="", 1500);
}

// ========== CREATOR: agregar contenido ==========
function newId(){ return 'it_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }
function addShort(){
  const t=$("#shortTitle").value.trim(), u=$("#shortUrl").value.trim(), tags=($("#shortTags").value||"").split(",").map(s=>s.trim()).filter(Boolean), f=$("#shortFront").checked;
  if(!t||!u) return alert("Completa título y URL.");
  const p=getProfile(); p.sections.shorts.items.unshift({ id:newId(), title:t, url:ytWatchUrl(u), tags, front:f, private:false, thumb:ytThumb(u) });
  saveProfile(p);
  $("#shortTitle").value=""; $("#shortUrl").value=""; $("#shortTags").value=""; $("#shortFront").checked=false;
  renderShortsFeed(); renderPublications();
}
function addVideo(){
  const t=$("#videoTitle").value.trim(), u=$("#videoUrl").value.trim();
  const price=Number($("#videoPrice").value||0), bill=$("#videoBilling").value;
  if(!t||!u) return alert("Completa título y URL.");
  const p=getProfile();

  let sec="videos";
  if(/playlist\?list=/.test(u)) sec="playlists";
  else if(/live|en vivo/i.test(t)) sec="live";
  else if(/evento|event/i.test(t)) sec="special";

  p.sections[sec].items.unshift({
    id:newId(), title:t, url:u.trim(), price:isNaN(price)?0:price, billing:bill, private: Number(price)>0, front: Number(price)===0, thumb:ytThumb(u)
  });
  saveProfile(p);
  $("#videoTitle").value=""; $("#videoUrl").value=""; $("#videoPrice").value="";
  renderVideosFeed(); renderPublications();
}

// ========== Bind UI ==========
function bindUI(){
  // Tema
  $("#btnTheme")?.addEventListener("click", ()=> setTheme(document.body.getAttribute("data-theme")==="dark"?"light":"dark"));

  // Idioma
  const langSel=$("#langSel"); langSel.value = store.get("lang","es");
  langSel.addEventListener("change", ()=>{ store.set("lang", langSel.value); applyI18n(); });

  // Navegación hash
  window.addEventListener("hashchange", handleHash);
  $$("#mainNav a").forEach(a=> a.addEventListener("click", ()=> setTimeout(handleHash,0)));

  // FAN OTP
  $("#btnFanSendOtp")?.addEventListener("click", async ()=>{
    const email=$("#fanEmail").value.trim().toLowerCase(); if(!email && !DEMO_MODE) return alert("Escribe tu email.");
    const err=await sendOtpEmail(email); if(err) return alert("Error enviando OTP: "+err.message);
    $("#fanStepEmail").classList.add("hidden"); $("#fanStepOtp").classList.remove("hidden");
  });
  $("#btnFanResendOtp")?.addEventListener("click", async ()=>{
    const email=$("#fanEmail").value.trim().toLowerCase(); if(!email && !DEMO_MODE) return alert("Escribe tu email primero.");
    const err=await sendOtpEmail(email); if(err) return alert("Error reenviando OTP: "+err.message);
  });
  $("#btnFanVerifyOtp")?.addEventListener("click", async ()=>{
    const email=$("#fanEmail").value.trim().toLowerCase(); const otp=$("#fanOtp").value.trim();
    if(!DEMO_MODE && otp.length<6) return alert("Código incompleto.");
    const { error }=await verifyOtpEmail(email, otp); if(error) return alert(error.message||"OTP incorrecto");
    setSessionFan({ email: email || "fan@demo" }); $("#fanStepOtp").classList.add("hidden");
  });
  $("#btnFanLogout")?.addEventListener("click", async ()=>{ try{await supabase.auth.signOut();}catch{} clearSessionFan(); $("#fanHub").classList.add("hidden"); $("#fanStepEmail").classList.remove("hidden"); });

  // CREATOR OTP (con DEMO_MODE)
  $("#btnCreatorSendOtp")?.addEventListener("click", async ()=>{
    const email=($("#creatorEmail")?.value||"").trim().toLowerCase();
    if(DEMO_MODE){
      setSessionCreator({ email: email || "demo@local" });
      $("#creatorStepEmail").classList.add("hidden");
      $("#creatorPanel").classList.remove("hidden");
      renderPublications();
      return;
    }
    if(!email) return alert("Escribe tu email.");
    const err=await sendOtpEmail(email); if(err) return alert("Error enviando OTP: "+err.message);
    $("#creatorStepEmail").classList.add("hidden");
    $("#creatorStepOtp").classList.remove("hidden");
  });
  $("#btnCreatorResendOtp")?.addEventListener("click", async ()=>{
    const email=$("#creatorEmail").value.trim().toLowerCase(); if(!email && !DEMO_MODE) return alert("Escribe tu email primero.");
    const err=await sendOtpEmail(email); if(err) return alert("Error reenviando OTP: "+err.message);
  });
  $("#btnCreatorVerifyOtp")?.addEventListener("click", async ()=>{
    const email=$("#creatorEmail").value.trim().toLowerCase(); const otp=$("#creatorOtp").value.trim();
    if(!DEMO_MODE && otp.length<6) return alert("Código incompleto.");
    const { error }=await verifyOtpEmail(email, otp); if(error) return alert(error.message||"OTP incorrecto");
    setSessionCreator({ email: email || "demo@local" });
    $("#creatorStepOtp").classList.add("hidden"); $("#creatorPanel").classList.remove("hidden");
    renderPublications();
  });
  $("#btnCreatorLogout")?.addEventListener("click", async ()=>{
    try{await supabase.auth.signOut();}catch{}
    clearSessionCreator(); $("#creatorPanel").classList.add("hidden"); $("#creatorStepEmail").classList.remove("hidden");
  });

  // CREATOR acciones
  $("#btnSaveAA")?.addEventListener("click", ()=>{
    const p=getProfile(); p.allAccessPrice = Number($("#allAccessPrice").value||0)||0; saveProfile(p); alert("All‑Access guardado.");
  });
  $("#btnSaveDonations")?.addEventListener("click", saveDonations);
  $("#btnAddShort")?.addEventListener("click", addShort);
  $("#btnAddVideo")?.addEventListener("click", addVideo);

  // Modales
  $("#pmClose")?.addEventListener("click", closePlayerModal);
  $("#donClose")?.addEventListener("click", closeDonateModal);
}

// ========== Init ==========
document.addEventListener("DOMContentLoaded", ()=>{
  // Tema e idioma
  setTheme(store.get("theme","dark"));
  applyI18n();

  // Si estás en demo y entras directo a #/creator, crea sesión local
  if(DEMO_MODE && !sessionCreator() && (location.hash.replace("#/","")==="creator")){
    setSessionCreator({ email:"demo@local" });
  }

  handleHash();
  bindUI();

  // Render feeds
  renderShortsFeed();
  renderVideosFeed();
});