import { supabase } from './supabase'

export async function getNextMonthPrediction(userId) {
  const now = new Date()
  const startThis = new Date(now.getFullYear(), now.getMonth(), 1)
  const m1 = new Date(startThis.getFullYear(), startThis.getMonth() - 1, 1)
  const m2 = new Date(startThis.getFullYear(), startThis.getMonth() - 2, 1)
  const m3 = new Date(startThis.getFullYear(), startThis.getMonth() - 3, 1)

  const iso = (d) => d.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, spent_at, category_id, categories(name)')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('spent_at', iso(m3))
    .lt('spent_at', iso(startThis))

  if (error) throw error

  const ym = (d) => d.getFullYear() * 12 + d.getMonth()
  const ym1 = ym(m1), ym2 = ym(m2), ym3 = ym(m3)

  const totalsByCat = new Map() // name -> [m1,m2,m3]
  const monthTotals = [0,0,0]

  for (const t of (data ?? [])) {
    const d = new Date(t.spent_at + 'T00:00:00')
    const key = ym(d)
    const idx = key === ym1 ? 0 : key === ym2 ? 1 : key === ym3 ? 2 : -1
    if (idx === -1) continue

    const name = t.categories?.name ?? 'Uncategorized'
    const arr = totalsByCat.get(name) ?? [0,0,0]
    const amt = Number(t.amount) || 0
    arr[idx] += amt
    totalsByCat.set(name, arr)
    monthTotals[idx] += amt
  }

  const w = [0.5, 0.3, 0.2]
  const byCategory = [...totalsByCat.entries()]
    .map(([name, a]) => ({ name, predicted: a[0]*w[0] + a[1]*w[1] + a[2]*w[2] }))
    .sort((a,b) => b.predicted - a.predicted)

  const predictedTotal = byCategory.reduce((s, x) => s + x.predicted, 0)

  const nonZero = monthTotals.filter(x => x > 0)
  const low = nonZero.length ? Math.min(...nonZero) : 0
  const high = nonZero.length ? Math.max(...nonZero) : 0

  return { predictedTotal, byCategory, range: { low, high } }
}
