import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg('Account created. Now login.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setMsg(err.message || 'Error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <form onSubmit={submit} style={{ width: 360, display: 'grid', gap: 10 }}>
        <h2>{mode === 'signup' ? 'Create account' : 'Login'}</h2>

        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" required />

        <button type="submit">{mode === 'signup' ? 'Sign up' : 'Login'}</button>

        <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
          {mode === 'signup' ? 'I already have an account' : 'Create an account'}
        </button>

        {msg && <p>{msg}</p>}
      </form>
    </div>
  )
}
