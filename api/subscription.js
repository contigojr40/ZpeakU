// api/subscription.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_KEY ?? '', { apiVersion: '2023-10-16' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  try {
    const priceId = process.env.STRIPE_PRICE_20;
    if (!priceId) {
      res.status(500).json({ error: 'STRIPE_PRICE_20 missing' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.PUBLIC_URL ?? 'http://localhost:3000'}/?success=true`,
      cancel_url: `${process.env.PUBLIC_URL ?? 'http://localhost:3000'}/?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}