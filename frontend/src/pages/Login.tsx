import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

          <form className="mt-8 space-y-5" onSubmit={(e) => { e.preventDefault(); }}>
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

            <Button type="submit" className="h-11 w-full rounded-xl bg-linear-to-r from-fuchsia-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:brightness-110">
              Sign in
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-slate-50 px-3 font-medium text-slate-400">or continue with</span></div>
          </div>

          <Button variant="outline" className="h-11 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <svg className="mr-2 size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-fuchsia-600 hover:text-fuchsia-500">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
