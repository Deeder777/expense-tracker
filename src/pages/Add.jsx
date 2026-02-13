import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDefaultCategories } from '../lib/categories'

export default function Add({ session }) {
  const userId = session.user.id
  const [categories, setCategories] = useState([])
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [spentAt, setSpentAt] = useState(() => new Date().toISOString().slice(0,10))
  const [msg, setMsg] = useState('')

  useEffect(() => {
    ;(async () => {
      const cats = await ensureDefaultCategories(userId)
      setCategories(cats)
      setCategoryId(cats?.[0]?.id ?? '')
    })().catch(e => setMsg(e.message || 'Error'))
  }, [userId])

  const canSave = useMemo(() => {
    const a = Number(amount)
    return !Number.isNaN(a) && a > 0 && spentAt
  }, [amount, spentAt])

  const save = async () => {
    setMsg('')
    try {
      if (!canSave) throw new Error('Enter a valid amount')

      const payload = {
        user_id: userId,
        type,
        amount: Number(amount),
        category_id: categoryId || null,
        note: note || null,
        spent_at: spentAt
      }

      const { error } = await supabase.from('transactions').insert(payload)
      if (error) throw error

      setAmount('')
      setNote('')
      setMsg('Saved ✅')
    } catch (e) {
      setMsg(e.message || 'Error')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Add transaction</h2>

      <div style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
        <label>
          Type
          <select value={type} onChange={(e)=>setType(e.target.value)} style={{ width: '100%' }}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label>
          Amount (UZS)
          <input value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="e.g. 45000" />
        </label>

        <label>
          Category
          <select value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} style={{ width: '100%' }}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <label>
          Date
          <input type="date" value={spentAt} onChange={(e)=>setSpentAt(e.target.value)} />
        </label>

        <label>
          Note (optional)
          <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Taxi, Lunch, etc" />
        </label>

        <button onClick={save} disabled={!canSave}>Save</button>

        {msg && <p style={{ color: 'orange' }}>{msg}</p>}
      </div>
    </div>
  )
}
