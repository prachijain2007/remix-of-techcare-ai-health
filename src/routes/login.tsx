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
      { title: "Doctor Sign In — TECHCARE AI" },
      {
        name: "description",
        content: "Secure doctor sign in for the TECHCARE AI clinical workspace and patient records.",
      },
      { property: "og:title", content: "Doctor Sign In — TECHCARE AI" },
      {
        property: "og:description",
        content: "Secure doctor sign in for the TECHCARE AI clinical workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Those login details didn't work. Please check the ID and password.");
      return;
    }
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
            <p className="text-xs text-slate-400">Clinical workspace — doctor access</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-bold tracking-wider text-slate-500">
              LOGIN ID / EMAIL
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor1@techcare.ai"
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
              placeholder="••••••••"
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-7 rounded-2xl bg-slate-50 p-4">
          <div className="text-[11px] font-black tracking-widest text-slate-400">DEMO ACCOUNTS</div>
          <ul className="mt-2 space-y-1 text-[12px] text-slate-600">
            <li>doctor1@techcare.ai · Pass@123</li>
            <li>doctor2@techcare.ai · Pass@456</li>
            <li>doctor3@techcare.ai · Pass@789</li>
          </ul>
          <p className="mt-3 text-[11px] text-slate-400">
            Each doctor only sees the patient cases saved under their own login.
          </p>
        </div>
      </div>
    </main>
  );
}
