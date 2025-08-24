import Stripe from 'stripe';
import getRawBody from 'raw-body';

export const config = { api: { bodyParser: false } }; // importante: raw body

const stripe = new Stripe(process.env.STRIPE_KEY ?? '', { apiVersion: '2023-10-16' });

export default async function handler(req, res) {
  try {
    const sig = req.headers['stripe-signature'];
    const raw = (await getRawBody(req)).toString('utf8');

    let event;
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // sin verificación (solo dev): procesamos como JSON
      event = JSON.parse(raw || '{}');
    }

    // Manejos mínimos
    if (event.type === 'checkout.session.completed') {
      // Podrías leer event.data.object y marcar en DB
      console.log('✔ checkout.session.completed');
    }
    if (event.type?.startsWith('customer.subscription.')) {
      console.log('✔ subscription event:', event.type);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('stripe-webhook error', err);
    res.status(400).json({ error: 'Invalid webhook', details: String(err?.message || err) });
  }
}