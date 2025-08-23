export const Moderation = {
  async loadPending(){
    const container = document.getElementById('admin-pending');
    if(!container) return;
    container.textContent = 'Cargando…';
    const res = await fetch('/api/videos-public.js?status=pending'); // demo: el endpoint responde mock si no hay DB
    const data = await res.json();
    container.innerHTML = '';
    (data.items||[]).forEach(v=>{
      const row = document.createElement('div');
      row.className='item';
      row.innerHTML = `
        <div><strong>${v.title}</strong><div class="muted">${v.url}</div></div>
        <div class="row gap">
          <button class="btn outline" data-act="approve" data-id="${v.id}">Aprobar</button>
          <button class="btn ghost" data-act="reject" data-id="${v.id}">Rechazar</button>
        </div>
      `;
      container.appendChild(row);
    });
    container.addEventListener('click', async (e)=>{
      const btn = e.target.closest('button'); if(!btn) return;
      const id = btn.getAttribute('data-id'); const act = btn.getAttribute('data-act');
      if (act==='approve'){
        await fetch('/api/video-approve.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
      } else if (act==='reject'){
        await fetch('/api/video-reject.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id, reason:'Contenido no apto'})});
      }
      await Moderation.loadPending();
    }, { once:true });
  }
};