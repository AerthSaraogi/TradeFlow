import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br from-violet-950 via-indigo-900 to-fuchsia-900 p-12 lg:flex">
        <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-600 text-lg font-black text-white shadow-lg shadow-fuchsia-500/30">
              TF
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">TradeFlow</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            Automate your trading strategies with{" "}
            <span className="bg-linear-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              zero code.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-indigo-200/80">
            Connect triggers to actions, set conditions, and let your workflows
            execute trades across Hyperliquid, Backpack, and Lighter — 24/7.
          </p>
        </div>

        <p className="relative z-10 text-sm text-indigo-300/50">© 2026 TradeFlow. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-600 text-lg font-black text-white shadow-lg shadow-fuchsia-500/30">
              TF
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">TradeFlow</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account to continue</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-violet-500 focus:ring-violet-500/20" required />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <button type="button" className="text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-500">Forgot password?</button>
              </div>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-violet-500 focus:ring-violet-500/20" required />
            </div>

            <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-linear-to-r from-fuchsia-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:brightness-110 disabled:opacity-50">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-fuchsia-600 hover:text-fuchsia-500">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
