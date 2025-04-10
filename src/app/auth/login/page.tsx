import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Omdirigér til signin-siden
  redirect('/auth/signin')
  
  // Dette vil aldrig blive vist, da redirect stopper renderingen
  return null
} 