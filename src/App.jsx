import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Add from './pages/Add'
import History from './pages/History'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>
  if (!session) return <Login />

  return (
    <div>
      <header style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Expense Tracker</h1>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>

      <nav style={{ padding: 20, display: 'flex', gap: 12 }}>
        <Link to="/">Dashboard</Link>
        <Link to="/add">Add</Link>
        <Link to="/history">History</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard session={session} />} />
        <Route path="/add" element={<Add session={session} />} />
        <Route path="/history" element={<History session={session} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
