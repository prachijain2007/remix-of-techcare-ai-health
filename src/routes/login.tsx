import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Sign In — TECHCARE AI" },
      {
        name: "description",
        content: "Secure sign in for patients and doctors on the TECHCARE AI clinical workspace.",
      },
      { property: "og:title", content: "Sign In — TECHCARE AI" },
      {
        property: "og:description",
        content: "Secure sign in for patients and doctors on the TECHCARE AI clinical workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

type Role = "patient" | "doctor";

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setLoading(false);
      setError("Those login details didn't work. Please check the email and password.");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const hasRole = (roles ?? []).some((r) => r.role === role);
    if (!hasRole) {
      await supabase.auth.signOut();
      setLoading(false);
      setError(
        role === "doctor"
          ? "This account is not registered as a doctor."
          : "This account is not registered as a patient.",
      );
      return;
    }

    setLoading(false);
    navigate({ to: "/", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_10px_35px_rgba(15,23,42,.07)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-xl text-white">
            ⚕
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">TECHCARE AI</h1>
            <p className="text-xs text-slate-400">Clinical workspace</p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          {(["patient", "doctor"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setError(null);
              }}
              aria-pressed={role === r}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${
                role === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {r === "patient" ? "Log in as Patient" : "Log in as Doctor"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-bold tracking-wider text-slate-500">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-bold tracking-wider text-slate-500">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-500"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
}
