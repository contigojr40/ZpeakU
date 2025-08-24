import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_KEY ?? '', { apiVersion: '2023-10-16' });

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let { amount, currency, account_id } = body;

    currency = (currency || 'usd').toLowerCase();
    account_id = account_id || process.env.DEFAULT_CREATOR_ACCOUNT;

    if (!account_id) { res.status(400).json({ error: 'account_id requerido (o DEFAULT_CREATOR_ACCOUNT)' }); return; }

    const cents = Math.max(100, Math.round(Number(amount) * 100 || 0)); // mínimo $1
    const host = process.env.PUBLIC_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${host}/#/success?donation=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${host}/#/cancel`,
      line_items: [{ price_data: { currency, unit_amount: cents, product_data: { name: 'Donation to creator' } }, quantity: 1 }],
      payment_intent_data: {
        transfer_data: { destination: account_id }   // 💸 depósito directo al conected account
      }
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-donation error', err);
    res.status(500).json({ error: 'create-donation failed', details: String(err?.message || err) });
  }
}