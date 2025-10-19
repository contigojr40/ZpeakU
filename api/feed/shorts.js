// Endpoint de Feed de Shorts (Bloque 3 - Optimizado para Edge Runtime)
import { createClient } from 'npm:@supabase/supabase-js';

// --- LÓGICA DE CARGA DE ENV CON FALLBACK ---
// El código busca las variables con prefijo VERCEL_ (entorno Vercel) o sin prefijo (.env local)
const SUPA_URL = process.env.VERCEL_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPA_KEY = process.env.VERCEL_SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE;
// --- FIN DE LÓGICA DE CARGA DE ENV CON FALLBACK ---

// Función principal de la Edge Function
export default async (request) => {
  try {
    // Verificación de configuración
    if (!SUPA_URL || !SUPA_KEY) {
      throw new Error("Missing Supabase configuration. URL or Service Role Key is undefined. Check .env and VERCEL_ prefix.");
    }

    // Inicialización del cliente de servicio (Service Role para saltar RLS en este caso)
    const supabase = createClient(SUPA_URL, SUPA_KEY);

    // Consulta simple del feed (usando la tabla 'shorts')
    const { data: shorts, error } = await supabase
      .from('shorts')
      .select('id, url, platform')
      .limit(10);

    if (error) {
      console.error(`[API/SHORTS] Supabase Error: ${error.message}`);
      return new Response(JSON.stringify({
        error: "Supabase query failed.",
        details: error.message,
        context: "Shorts Feed Fetch"
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Respuesta exitosa (JSON limpio)
    return new Response(JSON.stringify(shorts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Headers de caché (Bloque 3)
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    });
  } catch (e) {
    // Captura de errores de conexión o configuración
    console.error(`[API/SHORTS] Edge Runtime Catch Error: ${e.message}`);
    
    return new Response(JSON.stringify({
      error: "Database connection failed or environment variables not loaded.",
      details: e.message,
      context: "Initial Smoke Test"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
