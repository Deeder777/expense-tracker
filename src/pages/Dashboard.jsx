import { useMemo } from "react";

function formatUZS(n) {
  const num = Number(n || 0);
  return num.toLocaleString("ru-RU") + " UZS";
}

export default function DashboardApple({
  email = "odijlanovjohongir@gmail.com",
  monthSpending = 100000,
  nextMonthPrediction = 0,
}) {
  const monthLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center text-sm font-semibold">
              ET
            </div>
            <div>
              <div className="text-sm font-semibold">Expense Tracker</div>
              <div className="text-xs text-black/50">{monthLabel}</div>
            </div>
          </div>

          <button className="rounded-xl bg-white px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-black/10 hover:bg-black/5 active:scale-[0.99]">
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Nav */}
        <nav className="mb-6 flex flex-wrap gap-2">
          <a
            href="#"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-black/10 hover:bg-black/5"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-black/10 hover:bg-black/5"
          >
            Add
          </a>
          <a
            href="#"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-black/10 hover:bg-black/5"
          >
            History
          </a>
        </nav>

        {/* Greeting */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
          <div className="text-sm text-black/60">Logged in as</div>
          <div className="mt-1 text-lg font-semibold">{email}</div>
          <div className="mt-4 text-sm text-black/55">
            Simple. Clean. Like iOS.
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
            <div className="text-sm font-medium text-black/60">This month spending</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">
              {formatUZS(monthSpending)}
            </div>
            <div className="mt-4 h-px w-full bg-black/10" />
            <div className="mt-4 text-xs text-black/45">
              Tip: add categories for better analytics.
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
            <div className="text-sm font-medium text-black/60">Next month prediction</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">
              {formatUZS(nextMonthPrediction)}
            </div>
            <div className="mt-2 text-sm text-black/50">
              Range (last 3 months): 0 – {formatUZS(nextMonthPrediction || 0)}
            </div>

            <div className="mt-5 rounded-2xl bg-[#F5F5F7] p-4 ring-1 ring-black/5">
              <div className="text-xs font-medium text-black/60">Quick actions</div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/90 active:scale-[0.99]">
                  Add expense
                </button>
                <button className="flex-1 rounded-xl bg-white px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-black/10 hover:bg-black/5 active:scale-[0.99]">
                  Add income
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-black/45">
          Built with Supabase + Vercel • Apple clean UI
        </footer>
      </main>
    </div>
  );
}
