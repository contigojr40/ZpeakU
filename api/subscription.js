import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_KEY ?? '', { apiVersion: '2023-10-16' });

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }

    const priceId = process.env.STRIPE_PRICE_20;
    if (!priceId) { res.status(500).json({ error: 'STRIPE_PRICE_20 missing' }); return; }

    const host = process.env.PUBLIC_URL ?? 'http://localhost:3000';
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { email } = body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: `${host}/#/success?sub=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${host}/#/cancel`,
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      allow_promotion_codes: true
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-subscription error', err);
    res.status(500).json({ error: 'create-subscription failed', details: String(err?.message || err) });
  }
}