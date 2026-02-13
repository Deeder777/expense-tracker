// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

function fmtUZS(n) {
  return new Intl.NumberFormat("ru-RU").format(Number(n || 0)) + " UZS";
}
function yyyymm(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function Dashboard({ session }) {
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [tx, setTx] = useState([]);
  const [err, setErr] = useState("");

  // form
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  async function loadTx() {
    if (!user) return;
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("transactions")
      .select("id, amount, type, category, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setErr(error.message);
      setTx([]);
    } else {
      setTx(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const thisMonthKey = useMemo(() => yyyymm(new Date()), []);
  const monthStats = useMemo(() => {
    const inMonth = tx.filter((t) => (t.created_at || "").slice(0, 7) === thisMonthKey);
    const spent = inMonth
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const income = inMonth
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    return { spent, income, net: income - spent, count: inMonth.length };
  }, [tx, thisMonthKey]);

  async function addTx(e) {
    e.preventDefault();
    setErr("");

    const n = Number(amount);
    if (!n || n <= 0) return setErr("Amount must be > 0");

    // store date as timestamp
    const created_at = new Date(date + "T12:00:00.000Z").toISOString();

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        type,
        amount: n,
        category,
        note: note.trim() || null,
        created_at,
      },
    ]);

    if (error) return setErr(error.message);

    setAmount("");
    setNote("");
    await loadTx();
  }

  async function removeTx(id) {
    setErr("");
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) setErr(error.message);
    else setTx((prev) => prev.filter((t) => t.id !== id));
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center px-6 bg-[#F5F5F7]">
        <div className="w-full max-w-5xl">
          <div className="h-24 rounded-3xl bg-black/5 animate-pulse" />
          <div className="mt-6 h-56 rounded-3xl bg-black/5 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Expense Tracker</h1>
            <p className="mt-1 text-sm text-black/50">{user?.email}</p>
          </div>

          <button
            onClick={logout}
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 active:scale-[0.98]"
          >
            Sign out
          </button>
        </div>

        {/* Error */}
        {err ? (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
            <p className="text-sm text-black/60">This month spending</p>
            <p className="mt-2 text-3xl font-semibold">{fmtUZS(monthStats.spent)}</p>
            <p className="mt-2 text-xs text-black/45">{monthStats.count} tx this month</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
            <p className="text-sm text-black/60">This month income</p>
            <p className="mt-2 text-3xl font-semibold">{fmtUZS(monthStats.income)}</p>
            <p className="mt-2 text-xs text-black/45">Net: {fmtUZS(monthStats.net)}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
            <p className="text-sm text-black/60">Quick</p>
            <p className="mt-2 text-sm text-black/55">Add a transaction below 👇</p>
          </div>
        </div>

        {/* Main */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {/* Add form */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
            <h2 className="text-lg font-semibold">Add transaction</h2>

            <form onSubmit={addTx} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-black/60">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-black/60">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-black/60">Amount (UZS)</label>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="numeric"
                    placeholder="e.g. 120000"
                    className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div>
                  <label className="text-sm text-black/60">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                    <option value="Health">Health</option>
                    <option value="Fun">Fun</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-black/60">Note</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="optional…"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <button className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90 active:scale-[0.99]">
                Add
              </button>
            </form>
          </div>

          {/* Recent */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent transactions</h2>
              <button
                onClick={loadTx}
                className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
              >
                Refresh
              </button>
            </div>

            {tx.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-[#F5F5F7] p-4 text-sm text-black/60 ring-1 ring-black/5">
                No transactions yet. Add your first one 🙂
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {tx.slice(0, 10).map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-2xl bg-[#F5F5F7] px-4 py-3 ring-1 ring-black/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {t.category || "General"}
                        {t.note ? <span className="font-normal text-black/50"> — {t.note}</span> : null}
                      </p>
                      <p className="text-xs text-black/45">
                        {new Date(t.created_at).toLocaleString()} • {t.type}
                      </p>
                    </div>

                    <div className="ml-4 flex items-center gap-3">
                      <p
                        className={`text-sm font-semibold ${
                          t.type === "income" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {fmtUZS(Math.abs(Number(t.amount || 0)))}
                      </p>

                      <button
                        onClick={() => removeTx(t.id)}
                        className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs hover:bg-black/5"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
