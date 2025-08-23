export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { id, reason } = body;
  const store = globalThis.__ZPEAKU_STORE__ || (globalThis.__ZPEAKU_STORE__ = { videos: [], seq: 1 });
  const v = store.videos.find(x => x.id === Number(id));
  if (!v) { res.status(404).json({ error: 'video no encontrado' }); return; }
  v.status = 'rejected';
  v.public = false;
  v.reason = reason || 'No cumple las reglas';
  res.status(200).json({ ok: true, video: v });
}