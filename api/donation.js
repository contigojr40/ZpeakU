// api/donation.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_KEY ?? '', { apiVersion: '2023-10-16' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  try {
    const { amount, currency = 'usd' } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: 'Donation' },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      success_url: `${process.env.PUBLIC_URL ?? 'http://localhost:3000'}/?donated=true`,
      cancel_url: `${process.env.PUBLIC_URL ?? 'http://localhost:3000'}/?donation_canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}