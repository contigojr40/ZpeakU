// api/reject.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  const { id, reason = 'No cumple las reglas' } = req.body;

  // Aquí deberías marcar el video como rechazado en tu DB
  console.log(`Video rechazado: ${id} | Razón: ${reason}`);

  res.status(200).json({ success: true });
}