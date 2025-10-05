export default function handler(req, res) {
  // Configuramos el encabezado para que el navegador sepa que estamos enviando JSON
  res.setHeader('Content-Type', 'application/json');

  // Si no es un POST (como lo envía el botón), lo rechazamos
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Mensaje de prueba: la API funciona, pero la lógica de pago no está lista.
  res.status(400).json({ 
    error: '¡Conexión Exitosa! Pero la lógica de Apple Pay todavía falta.',
    code: 'API_READY' 
  });
}
