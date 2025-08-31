// /api/auth.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email } = req.body;
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "OTP enviado a tu correo" });
  }
  res.status(405).json({ error: "Método no permitido" });
}