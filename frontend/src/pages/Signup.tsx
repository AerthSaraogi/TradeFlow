import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signup } from "@/lib/api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br from-violet-950 via-indigo-900 to-fuchsia-900 p-12 lg:flex">
        <div className="pointer-events-none absolute -top-40 -right-40 size-[500px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 size-[500px] rounded-full bg-fuchsia-500/15 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-600 text-lg font-black text-white shadow-lg shadow-fuchsia-500/30">
              TF
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">TradeFlow</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            Start building{" "}
            <span className="bg-linear-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              powerful workflows
            </span>{" "}
            today.
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Active traders", value: "12K+" },
              { label: "Workflows run", value: "1.5M" },
              { label: "Exchanges", value: "3" },
              { label: "Uptime", value: "99.9%" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs font-medium text-indigo-300/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-indigo-300/50">&copy; 2026 TradeFlow. All rights reserved.</p>
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

          <h1 className="text-3xl font-extrabold text-slate-900">Create an account</h1>
          <p className="mt-2 text-sm text-slate-500">Get started with TradeFlow for free</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSignup}>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Full name</label>
              <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-violet-500 focus:ring-violet-500/20" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-violet-500 focus:ring-violet-500/20" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <Input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-violet-500 focus:ring-violet-500/20" required />
            </div>

            <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-linear-to-r from-fuchsia-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:brightness-110 disabled:opacity-50">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-fuchsia-600 hover:text-fuchsia-500">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
