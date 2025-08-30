// api/connected.js — Verifica si el usuario inició sesión (tras OTP login)
import { supabase } from '../config'

export default async function handler(req, res) {
  const { method } = req

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Usa método GET' })
  }

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.error('Error al obtener usuario:', error)
    return res.status(401).json({ error: 'Usuario no autenticado' })
  }

  return res.status(200).json({
    message: 'Usuario autenticado correctamente',
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
  })
}