import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg("Logged in ✅");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Account created ✅ (check email if confirmation is enabled)");
      }
    } catch (err) {
      setMsg(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10">
        <div className="grid w-full gap-6 md:grid-cols-2">
          {/* Left card */}
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/10">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white font-semibold">
                ET
              </div>
              <div>
                <div className="text-lg font-semibold">Expense Tracker</div>
                <div className="text-sm text-black/55">Clean Apple-style UI</div>
              </div>
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-black/55">
              {mode === "login"
                ? "Sign in to track expenses across devices."
                : "Sign up to start tracking and predicting next month spending."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-black/70">Email</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black/70">Password</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
                <p className="mt-2 text-xs text-black/45">Minimum 6 characters.</p>
              </div>

              <button
                disabled={loading}
                className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-black/90 active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </button>

              {msg && (
                <div className="rounded-2xl bg-[#F5F5F7] px-4 py-3 text-sm text-black/70 ring-1 ring-black/5">
                  {msg}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-sm font-medium text-black/70 hover:text-black"
                >
                  {mode === "login" ? "Create account" : "I already have an account"}
                </button>

                <span className="text-xs text-black/45">PWA ready ✅</span>
              </div>
            </form>
          </div>

          {/* Right info card */}
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/10">
            <div className="text-sm font-medium text-black/60">What you can do</div>
            <ul className="mt-4 space-y-3 text-sm text-black/70">
              <li className="flex gap-3">
                <span className="mt-[2px] inline-block h-2.5 w-2.5 rounded-full bg-black/70" />
                Add expenses & incomes with categories
              </li>
              <li className="flex gap-3">
                <span className="mt-[2px] inline-block h-2.5 w-2.5 rounded-full bg-black/70" />
                See monthly total and transaction history
              </li>
              <li className="flex gap-3">
                <span className="mt-[2px] inline-block h-2.5 w-2.5 rounded-full bg-black/70" />
                Prediction for next month (we’ll improve the model)
              </li>
              <li className="flex gap-3">
                <span className="mt-[2px] inline-block h-2.5 w-2.5 rounded-full bg-black/70" />
                Install on iPhone Home Screen
              </li>
            </ul>

            <div className="mt-8 rounded-3xl bg-[#F5F5F7] p-6 ring-1 ring-black/5">
              <div className="text-sm font-semibold">Tip</div>
              <p className="mt-2 text-sm text-black/60">
                If you get “Email not confirmed”, open Supabase → Auth → Users and confirm the user, or
                disable email confirmation in Auth settings for development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
