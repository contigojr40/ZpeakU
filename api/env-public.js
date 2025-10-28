// api/env-public.js
export default async function handler(_req, res) {
  res.setHeader("cache-control", "public, max-age=300");
  res.status(200).json({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SITE_URL: process.env.SITE_URL || "https://zpeaku-clean.vercel.app"
  });
}