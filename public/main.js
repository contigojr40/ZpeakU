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
    const m = a.getAttribute("href").replace("#/","");
    a.classList.toggle("active", m===route);
  });
}
function handleHash(){ const r=(location.hash.replace("#/","")||"home"); show(ROUTES.includes(r)? r : "home"); }

// ========== i18n ==========
const I18N = {
  es:{
    "nav.home":"Inicio","nav.fans":"Fans","nav.creator":"Creador","nav.support":"Soporte","nav.login":"Iniciar sesión",
    "creator.donations":"Donaciones","creator.saveDon":"Guardar métodos de donación",
    "btn.delete":"Eliminar cuenta","btn.export":"Descargar mis datos (ZIP)"
  },
  en:{
    "nav.home":"Home","nav.fans":"Fans","nav.creator":"Creator","nav.support":"Support","nav.login":"Log in",
    "creator.donations":"Donations","creator.saveDon":"Save donation methods",
    "btn.delete":"Delete Account","btn.export":"Download my data (ZIP)"
  }
};
function applyI18n(){
  const lang=store.get("lang","es");
  $$("#mainNav a").forEach(a=>{
    const key="nav."+a.getAttribute("href").replace("#/","");
    if(I18N[lang] && I18N[lang][key]) a.textContent=I18N[lang][key];
  });
  $("#btnDeleteAccount") && ($("#btnDeleteAccount").textContent=I18N[lang]["btn.delete"]);
  $("#btnExportData") && ($("#btnExportData").textContent=I18N[lang]["btn.export"]);
  $("#langSel").value=lang;
}

// ========== Profile & Content ==========
const PROFILE_KEY = "zpk_creator_profile";
const defaultProfile = {
  allAccessPrice: 100,
  donations:{ paypal:"", cashapp:"", venmo:"", zelle:"", custom:"" },
  sections:{ shorts:{items:[]}, videos:{items:[]}, playlists:{items:[]}, live:{items:[]}, special:{items:[]} }
};
function getProfile(){ return store.get(PROFILE_KEY, defaultProfile); }
function saveProfile(p){ store.set(PROFILE_KEY, p); }
function newId(){ return 'it_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }

// ========== YouTube Helpers ==========
function extractYouTubeId(urlOrId){
  try{ const u=new URL(urlOrId); if(u.searchParams.get("v")) return u.searchParams.get("v"); if(u.pathname.includes("/shorts/")) return u.pathname.split("/")[2]; return u.pathname.split("/").pop(); }catch{return urlOrId;}
}
function ytWatchUrl(id){ return `https://youtube.com/watch?v=${id}`; }
function ytThumb(id){ return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; }
function ytEmbedSrc(id){ return `https://www.youtube.com/embed/${extractYouTubeId(id)}?modestbranding=1&rel=0`; }

// ========== Render Feeds ==========
function shortCardHtml(s){
  return `
  <div class="feed-item">
    <img class="feed-thumb" src="${s.thumb||ytThumb(s.url)}" alt="" data-play="${s.id}">
    <div class="feed-meta">
      <div class="title">${s.title||""}</div>
      <div class="sub"><span class="tags">${(s.tags||[]).map(t=>"#"+t).join(" ")}</span></div>
      <div class="cta"><a class="pill outline tiny-btn" target="_blank" href="${ytWatchUrl(s.url)}">YouTube</a></div>
    </div>
  </div>`;}
function renderShortsFeed(){
  const p=getProfile(); const list=(p.sections.shorts.items||[]).filter(s=>s.front&&!s.private);
  const feed=$("#homeShortsRail"); feed.innerHTML=list.length? list.map(shortCardHtml).join("") : `<div class="tiny muted">—</div>`;
  feed.querySelectorAll("[data-play]").forEach(b=> b.onclick=()=> openPlayerById(b.getAttribute("data-play")));
}
function videoCardHtml(v){
  return `
  <div class="feed-item">
    <img class="feed-thumb" src="${v.thumb||ytThumb(v.url)}" alt="" data-play="${v.id}">
    <div class="feed-meta">
      <div class="title">${v.title||""}</div>
      <div class="cta"><a class="pill outline tiny-btn" target="_blank" href="${ytWatchUrl(v.url)}">YouTube</a></div>
    </div>
  </div>`;}
function renderVideosFeed(){
  const p=getProfile(); const list=(p.sections.videos.items||[]).filter(v=>!v.private);
  const feed=$("#videosFeed"); if(!feed) return;
  feed.innerHTML=list.length? list.map(videoCardHtml).join("") : `<div class="tiny muted">—</div>`;
  feed.querySelectorAll("[data-play]").forEach(b=> b.onclick=()=> openPlayerById(b.getAttribute("data-play")));
}

// ========== Player Modal ==========
function openPlayerById(id){
  const p=getProfile(); const all=[...p.sections.shorts.items,...p.sections.videos.items];
  const it=all.find(x=>x.id===id); if(!it) return;
  $("#pmTitle").textContent=it.title; $("#pmTags").textContent=(it.tags||[]).join(" "); $("#ytFrame").src=ytEmbedSrc(it.url);
  $("#playerModal").classList.remove("hidden");
}
$("#pmClose")?.addEventListener("click", ()=>{ $("#ytFrame").src="about:blank"; $("#playerModal").classList.add("hidden"); });
$("#playerModal")?.addEventListener("click", e=>{ if(e.target.id==="playerModal") { $("#ytFrame").src="about:blank"; $("#playerModal").classList.add("hidden"); }});

// ========== Donations ==========
function saveDonations(){
  const p=getProfile(); p.donations={ paypal:$("#donPayPal")?.value||"", cashapp:$("#donCashApp")?.value||"", venmo:$("#donVenmo")?.value||"", zelle:$("#donZelle")?.value||"", custom:$("#donCustom")?.value||"" };
  saveProfile(p); $("#donSaved").textContent="✅ Guardado"; setTimeout(()=>$("#donSaved").textContent="",1500);
}
$("#pmDonate")?.addEventListener("click", ()=>{ $("#donateModal").classList.remove("hidden"); });
$("#donClose")?.addEventListener("click", ()=>{ $("#donateModal").classList.add("hidden"); });

// ========== Account Center ==========
$("#btnExportData")?.addEventListener("click", async()=>{
  const token=(await supabase.auth.getSession()).data?.session?.access_token;
  const res=await fetch("/api/export",{headers:{Authorization:`Bearer ${token}`}}); if(!res.ok) return alert("Error al exportar");
  const blob=await res.blob(); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="mis-datos.zip"; a.click();
});
$("#btnDeleteAccount")?.addEventListener("click", async()=>{
  if(!confirm("¿Eliminar cuenta?")) return;
  const token=(await supabase.auth.getSession()).data?.session?.access_token;
  const res=await fetch("/api/delete",{method:"DELETE",headers:{Authorization:`Bearer ${token}`}}); if(res.ok){ alert("Cuenta eliminada"); await supabase.auth.signOut(); location.reload(); }
});

// ========== CREATOR: agregar contenido ==========
function addShort(){ /* agrega short con título, URL y portada */ }
function addVideo(){ /* agrega video con precio y tipo */ }

// ========== Bind UI ==========
function bindUI(){
  $("#btnTheme")?.addEventListener("click", ()=> setTheme(document.body.getAttribute("data-theme")==="dark"?"light":"dark"));
  $("#langSel")?.addEventListener("change", ()=>{ store.set("lang",$("#langSel").value); applyI18n(); });
  $("#btnSaveDonations")?.addEventListener("click", saveDonations);
}
document.addEventListener("DOMContentLoaded",()=>{
  setTheme(store.get("theme","dark")); applyI18n(); handleHash(); bindUI(); renderShortsFeed(); renderVideosFeed();
  window.addEventListener("hashchange", handleHash);
});