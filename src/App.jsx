import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!session) return <Login />;

  return (
   <Dashboard
    session={session}
    userEmail={session.user.email}
    onAddClick={() => (window.location.hash = "#/add")}
  />
  );
}
