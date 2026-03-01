import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Profile() {
  const [name, setName] = useState("Aerth Saraogi");
  const [email, setEmail] = useState("aerth@tradeflow.io");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [bio, setBio] = useState("Crypto trader & automation enthusiast. Building smarter workflows on TradeFlow.");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-fuchsia-500/25">
              TF
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TradeFlow</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" className="rounded-xl border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <svg className="mr-2 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Profile Settings</h1>
          <p className="mt-2 text-sm text-slate-500">Manage your account information and preferences</p>
        </div>

        {/* Avatar section */}
        <div className="mb-8 flex items-center gap-6 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-400 to-violet-500 text-2xl font-black text-white shadow-lg shadow-violet-500/20">
            {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{name}</h2>
            <p className="text-sm text-slate-500">{email}</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg bg-linear-to-r from-fuchsia-600 to-violet-600 px-4 py-1.5 text-xs font-bold text-white shadow shadow-violet-500/20 transition-all hover:brightness-110">
                Change Avatar
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50">
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-bold text-slate-900">Personal Information</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-sm focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-sm focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-sm focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Role</label>
                <Input
                  disabled
                  value="Trader"
                  className="h-11 rounded-xl border-slate-200 bg-slate-100 shadow-sm text-slate-400"
                />
              </div>
            </div>
            <div className="mt-5 space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-bold text-slate-900">Security</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-sm focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">New Password</label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-sm focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-base font-bold text-slate-900">Connected Exchanges</h3>
            <p className="mb-5 text-sm text-slate-500">Manage your exchange API keys for automated trading</p>
            <div className="space-y-3">
              {[
                { name: "Hyperliquid", status: "Connected", color: "bg-cyan-500" },
                { name: "Backpack", status: "Connected", color: "bg-amber-500" },
                { name: "Lighter", status: "Not connected", color: "bg-slate-300" },
              ].map((ex) => (
                <div key={ex.name} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-2.5 rounded-full ${ex.color}`} />
                    <span className="text-sm font-semibold text-slate-700">{ex.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${ex.status === "Connected" ? "text-emerald-600" : "text-slate-400"}`}>
                      {ex.status}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                    >
                      {ex.status === "Connected" ? "Manage" : "Connect"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div>
              {saved && (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Changes saved successfully!
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Link to="/dashboard">
                <Button type="button" variant="outline" className="rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="rounded-xl bg-linear-to-r from-fuchsia-600 to-violet-600 px-8 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:brightness-110"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
