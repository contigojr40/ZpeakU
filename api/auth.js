// /api/auth.js — Login con Magic Link + OTP + Logout
import { supabase } from '../config'

export default async function handler(req, res) {
  const { method } = req

  if (method === 'POST') {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' })
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.PUBLIC_URL}/auth/connected`,
      },
    })

    if (error) {
      console.error('Error al enviar OTP:', error)
      return res.status(500).json({ error: 'Fallo al enviar enlace mágico' })
    }

    return res.status(200).json({ message: 'Enlace enviado al correo' })
  }

  if (method === 'DELETE') {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error al cerrar sesión:', error)
      return res.status(500).json({ error: 'Error al cerrar sesión' })
    }

    return res.status(200).json({ message: 'Sesión cerrada correctamente' })
  }

  res.setHeader('Allow', ['POST', 'DELETE'])
  return res.status(405).end(`Método ${method} no permitido`)
}