import { supabase } from './supabase'

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Gym', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'
]

export async function ensureDefaultCategories(userId) {
  const { data: existing, error: selErr } = await supabase
    .from('categories')
    .select('id,name')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (selErr) throw selErr

  const existingNames = new Set((existing ?? []).map(c => c.name))
  const toInsert = DEFAULT_CATEGORIES
    .filter(name => !existingNames.has(name))
    .map(name => ({ user_id: userId, name }))

  if (toInsert.length === 0) return existing ?? []

  const { data: inserted, error: insErr } = await supabase
    .from('categories')
    .insert(toInsert)
    .select('id,name')

  if (insErr) throw insErr

  return [...(existing ?? []), ...(inserted ?? [])]
}
