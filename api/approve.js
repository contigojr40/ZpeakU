// api/approve.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  const { id } = req.body;

  // Aquí deberías marcar el video como aprobado en tu DB
  console.log(`Video aprobado: ${id}`);

  res.status(200).json({ success: true });
}