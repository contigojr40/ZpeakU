// /api/upload.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { filename, fileData, userId } = req.body

  if (!filename || !fileData || !userId) {
    return res.status(400).json({ error: 'Faltan datos requeridos' })
  }

  // Decodificar el archivo base64 a binario
  const buffer = Buffer.from(fileData, 'base64')

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filename, buffer, {
      contentType: 'image/png',
      upsert: true,
      metadata: {
        owner: userId
      }
    })

  if (uploadError) {
    return res.status(500).json({ error: 'Error al subir avatar' })
  }

  return res.status(200).json({ message: 'Avatar subido correctamente' })
}