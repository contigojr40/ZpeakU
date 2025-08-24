// api/public.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Use GET' });
    return;
  }

  // Aquí devuelves los videos pendientes o públicos según la query
  const { status } = req.query;

  // Esto es un mock, luego se conecta a DB
  const videos = [
    { id: 1, title: 'Video de prueba', url: 'https://example.com/video1', status: 'pending' },
    { id: 2, title: 'Otro video', url: 'https://example.com/video2', status: 'approved' },
  ];

  res.status(200).json({ items: videos.filter(v => !status || v.status === status) });
}