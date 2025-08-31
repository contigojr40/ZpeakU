// /api/subscribe.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { type } = req.body;

    if (!type || !["fan", "creator"].includes(type)) {
      return res.status(400).json({ error: "Tipo de suscripción inválido" });
    }

    // Selecciona el PRICE_ID correcto desde .env
    const priceId =
      type === "fan"
        ? process.env.STRIPE_FAN_PRICE_ID
        : process.env.STRIPE_CREATOR_PRICE_ID;

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/thanks?status=success`,
      cancel_url: `${req.headers.origin}/thanks?status=cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Error en subscribe.js:", err);
    return res.status(500).json({ error: "Error al crear la sesión" });
  }
}