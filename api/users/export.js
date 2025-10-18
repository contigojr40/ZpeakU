// /api/export.js — Exportar datos del usuario autenticado en un archivo ZIP
import { createClient } from '@supabase/supabase-js'
import JSZip from 'jszip'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Necesita privilegios elevados para leer todo
)

export default async function handler(req, res) {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No autorizado' })

  const { data: user, error: userError } = await supabase.auth.getUser(token)
  if (userError || !user) return res.status(401).json({ error: 'Token inválido' })

  const userId = user.id
  const zip = new JSZip()

  // Ejemplo: Agrega datos del perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profile) {
    zip.file('profile.json', JSON.stringify(profile, null, 2))
  }

  // Puedes agregar más tablas aquí si lo deseas (donaciones, publicaciones, etc.)

  const zipContent = await zip.generateAsync({ type: 'nodebuffer' })

  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', 'attachment; filename=data-export.zip')
  res.status(200).send(zipContent)
}