// api/videos-public.js
import { listPublicVideos } from './_store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    // Solo devuelve los que están public=true y status='approved'
    const items = listPublicVideos();

    // cache rápido
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');

    return res.json({ ok: true, items });
  } catch (err) {
    console.error('videos-public error', err);
    return res.status(500).json({ ok: false, error: 'error interno' });
  }
}