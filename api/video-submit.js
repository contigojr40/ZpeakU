// api/video-submit.js
import { addVideo } from './store.js';

function parseBody(req) {
  // Vercel normalmente entrega req.body ya parseado cuando
  // el cliente envía "Content-Type: application/json".
  // Aun así, soportamos string o Buffer por si acaso.
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'string') {
    try { return JSON.parse(b); } catch { return {}; }
  }
  if (Buffer.isBuffer(b)) {
    try { return JSON.parse(b.toString('utf8')); } catch { return {}; }
  }
  return b; // ya era objeto
}

export default async function handler(req, res) {
  // Headers básicos
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  // Preflight CORS simple (opcional, ayuda en pruebas locales con fetch)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Usa POST' });
  }

  const { url, title, creator } = parseBody(req);

  if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ ok: false, error: 'URL requerida y válida (http/https)' });
  }

  // Crea el registro en memoria (centralizado en store.js)
  const video = addVideo({
    url: url.trim(),
    title: (title && String(title).trim()) || 'Sin título',
    creator: (creator && String(creator).trim()) || 'anon',
  });

  // Respuesta
  return res.status(201).json({ ok: true, video });
}