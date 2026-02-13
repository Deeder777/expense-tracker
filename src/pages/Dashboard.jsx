import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getNextMonthPrediction } from '../lib/prediction'

export default function Dashboard({ session }) {
  const userId = session.user.id
  const [monthTotal, setMonthTotal] = useState(0)
  const [pred, setPred] = useState(null)
  const [msg, setMsg] = useState('')

  const range = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const iso = (d) => d.toISOString().slice(0,10)
    return { start: iso(start), end: iso(end) }
  }, [])

  useEffect(() => {
    ;(async () => {
      setMsg('')
      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('spent_at', range.start)
        .lt('spent_at', range.end)

      if (error) throw error
      setMonthTotal((data ?? []).reduce((s,r) => s + (Number(r.amount)||0), 0))

      const p = await getNextMonthPrediction(userId)
      setPred(p)
    })().catch(e => setMsg(e.message || 'Error'))
  }, [userId, range.start, range.end])

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <p>Logged in as: <b>{session.user.email}</b></p>

      <h3>This month spending</h3>
      <div style={{ fontSize: 28, fontWeight: 800 }}>
        {Math.round(monthTotal).toLocaleString()} UZS
      </div>

      <hr />

      <h3>Next month prediction</h3>
      {!pred ? (
        <p>Need past data (at least 1–2 months).</p>
      ) : (
        <>
          <div style={{ fontSize: 26, fontWeight: 800 }}>
            {Math.round(pred.predictedTotal).toLocaleString()} UZS
          </div>
          <div>
            Range (last 3 months): {Math.round(pred.range.low).toLocaleString()} – {Math.round(pred.range.high).toLocaleString()} UZS
          </div>

          {pred.byCategory?.length > 0 && (
            <>
              <h4>Top categories</h4>
              <ul>
                {pred.byCategory.slice(0,5).map(c => (
                  <li key={c.name}>
                    {c.name}: <b>{Math.round(c.predicted).toLocaleString()} UZS</b>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {msg && <p style={{ color: 'orange' }}>{msg}</p>}
    </div>
  )
}
