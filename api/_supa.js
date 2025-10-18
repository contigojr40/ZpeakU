import { createClient } from "@supabase/supabase-js";

// Cliente Service Role (utiliza la llave SUPABASE_SERVICE_ROLE)
export const supa = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } }
);
