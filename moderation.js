// moderation.js
export const Moderation = async function loadPending() {
  const container = document.getElementById('admin-pending');
  if (!container) return;

  container.innerHTML = 'Cargando...';

  // ✅ Usamos el endpoint renombrado: public.js
  const res = await fetch('/api/public.js?status=pending');
  const data = await res.json();

  container.innerHTML = '';
  (data.items || []).forEach(v => {
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `
      <div><strong>${v.title}</strong> <div>(${v.url})</div></div>
      <div class="row gap">
        <button class="btn act-approve" data-id="${v.id}">Aprobar</button>
        <button class="btn ghost act-reject" data-id="${v.id}">Rechazar</button>
      </div>
    `;
    container.appendChild(row);
  });

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const act = btn.classList.contains('act-approve') ? 'approve' : 'reject';
    const id = btn.getAttribute('data-id');

    if (act === 'approve') {
      // ✅ Endpoint renombrado: approve.js
      await fetch('/api/approve.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } else {
      // ✅ Endpoint renombrado: reject.js
      await fetch('/api/reject.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    }

    await Moderation.loadPending();
  }, { once: true });
};