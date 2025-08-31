// /api/webhook.js — Manejo de eventos Stripe
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Inicializa Stripe con tu secret key (desde .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Conexión Supabase (service role porque vamos a escribir datos)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Endpoint seguro: Stripe requiere raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // viene de Stripe Dashboard
    );
  } catch (err) {
    console.error("⚠️  Error verificando webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerEmail = session.customer_details.email;
        const priceId = session.metadata.price_id;

        // Determinar tipo de suscripción
        let role = null;
        if (priceId === process.env.STRIPE_FAN_PRICE_ID) role = "fan";
        if (priceId === process.env.STRIPE_CREATOR_PRICE_ID) role = "creator";

        if (role) {
          const { error } = await supabase.from("profiles").upsert(
            {
              email: customerEmail,
              role_hint: role,
              stripe_customer_id: session.customer,
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "email" }
          );
          if (error) console.error("Supabase error:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer;

        // Marca como cancelada en Supabase
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "inactive",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) console.error("Supabase error:", error);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler failed:", err);
    res.status(500).send("Internal Server Error");
  }
}