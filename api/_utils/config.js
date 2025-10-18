// config.js — Configuración global y Supabase

// 🔒 Supabase (NO pongas esto en frontend público si vas a exponerlo)
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://TU-PROJECT.supabase.co"       // ⚡ reemplaza con tu URL real
const SUPABASE_ANON_KEY = "eyxxxx...tuAnonKey..."           // ⚡ reemplaza con tu ANON KEY real

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 🌐 Configuración pública
export const CONFIG = {
  PUBLIC_URL: (typeof location !== 'undefined') ? location.origin : '',
  DEFAULT_YT: 'dQw4w9WgXcQ',   // Video por defecto
  I18N_DEFAULT: 'es'
}