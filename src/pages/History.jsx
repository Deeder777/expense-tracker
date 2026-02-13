import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function History({ session }) {
  const userId = session.user.id
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState('')

  const load = async () => {
    setMsg('')
    const start = `${month}-01`
    const d = new Date(start + 'T00:00:00')
    const end = new Date(d.getFullYear(), d.getMonth()+1, 1).toISOString().slice(0,10)

    const { data, error } = await supabase
      .from('transactions')
      .select('id,type,amount,note,spent_at, categories(name)')
      .eq('user_id', userId)
      .gte('spent_at', start)
      .lt('spent_at', end)
      .order('spent_at', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) setMsg(error.message)
    setRows(data ?? [])
  }

  useEffect(() => { load() }, [month])

  const del = async (id) => {
    setMsg('')
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) setMsg(error.message)
    else load()
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>History</h2>

      <label>
        Month:
        <input type="month" value={month} onChange={(e)=>setMonth(e.target.value)} />
      </label>

      {rows.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <ul>
          {rows.map(r => (
            <li key={r.id} style={{ margin: '10px 0' }}>
              <b>{r.type === 'expense' ? '-' : '+'}{Number(r.amount).toLocaleString()} UZS</b>
              {' '}• {r.categories?.name ?? 'Uncategorized'}
              {' '}• {r.spent_at}
              {r.note ? ` • ${r.note}` : ''}
              {' '}
              <button onClick={() => del(r.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {msg && <p style={{ color: 'orange' }}>{msg}</p>}
    </div>
  )
}
