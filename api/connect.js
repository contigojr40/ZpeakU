import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const account = await stripe.accounts.create({
      type: "express",
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.origin}/#/creator?refresh=true`,
      return_url: `${req.headers.origin}/#/creator?connected=true`,
      type: "account_onboarding",
    });

    res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error("Error Connect:", err);
    res.status(500).json({ error: "Error iniciando onboarding" });
  }
}