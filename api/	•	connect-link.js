import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY ?? '', { apiVersion: '2023-10-16' });

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST' }); return;
    }

    // Si ya tienes una cuenta conectada, pásala en el body: { account_id: "acct_xxx" }
    const { account_id } = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) || {};

    // Si no pasas account_id, crea una cuenta Express nueva (solo para pruebas rápidas)
    const account = account_id
      ? { id: account_id }
      : await stripe.accounts.create({ type: 'express' });

    const return_url = `${process.env.PUBLIC_URL ?? 'http://localhost:3000'}/#/auth?connected=1`;
    const refresh_url = `${process.env.PUBLIC_URL ?? 'http://localhost:3000'}/#/auth?refresh=1`;

    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url,
      return_url,
      type: 'account_onboarding'
    });

    res.status(200).json({ url: link.url, account_id: account.id });
  } catch (err) {
    console.error('connect-link error', err);
    res.status(500).json({ error: 'connect-link failed', details: String(err?.message || err) });
  }
}