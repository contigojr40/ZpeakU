export default async function handler(req, res) {
  // En producción deberías mirar tu DB o Stripe para saber si la sub está activa.
  // Por ahora devolvemos "false" para no romper la UI.
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ active: false });
}