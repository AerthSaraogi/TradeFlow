import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchMe, updateMe, isLoggedIn, saveCredentials, removeCredentials } from "@/lib/api";

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [connectedExchanges, setConnectedExchanges] = useState<{exchange: string; connected: boolean; apiKey?: string; apiSecret?: string}[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [credModal, setCredModal] = useState<{exchange: string; apiKey: string; apiSecret: string} | null>(null);
  const [credSaving, setCredSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/login"); return; }
    fetchMe()
      .then((user) => {
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setBio(user.bio || "");
        setConnectedExchanges(user.connectedExchanges || []);
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await updateMe({ name, email, phone, bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-slate-500">Loading profile...</p></div>;

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
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
            )}
            <div className="space-y-3">
              {connectedExchanges.map((ex) => {
                const colorMap: Record<string, string> = { Hyperliquid: "bg-cyan-500", Backpack: "bg-amber-500", Lighter: "bg-emerald-500" };
                return (
                <div key={ex.exchange} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-2.5 rounded-full ${colorMap[ex.exchange] || "bg-slate-300"}`} />
                    <span className="text-sm font-semibold text-slate-700">{ex.exchange}</span>
                    {ex.connected && ex.apiKey && (
                      <span className="text-xs text-slate-400 font-mono">Key: {ex.apiKey}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${ex.connected ? "text-emerald-600" : "text-slate-400"}`}>
                      {ex.connected ? "Connected" : "Not connected"}
                    </span>
                    {ex.connected ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCredModal({ exchange: ex.exchange, apiKey: "", apiSecret: "" })}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await removeCredentials(ex.exchange);
                              setConnectedExchanges((prev) =>
                                prev.map((e) => e.exchange === ex.exchange ? { ...e, connected: false, apiKey: undefined, apiSecret: undefined } : e)
                              );
                            } catch (err: any) { setError(err.message); }
                          }}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCredModal({ exchange: ex.exchange, apiKey: "", apiSecret: "" })}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Credential Modal */}
          {credModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-fuchsia-500/25">
                    🔑
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{credModal.exchange}</h2>
                    <p className="text-sm text-slate-500">Enter your API credentials</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">API Key</label>
                    <Input
                      autoFocus
                      placeholder="Enter API Key"
                      value={credModal.apiKey}
                      onChange={(e) => setCredModal({ ...credModal, apiKey: e.target.value })}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 font-mono text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">API Secret</label>
                    <Input
                      type="password"
                      placeholder="Enter API Secret"
                      value={credModal.apiSecret}
                      onChange={(e) => setCredModal({ ...credModal, apiSecret: e.target.value })}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 font-mono text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500/20"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCredModal(null)}
                    className="flex-1 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={!credModal.apiKey.trim() || !credModal.apiSecret.trim() || credSaving}
                    onClick={async () => {
                      setCredSaving(true);
                      try {
                        await saveCredentials(credModal.exchange, credModal.apiKey, credModal.apiSecret);
                        setConnectedExchanges((prev) =>
                          prev.map((e) => e.exchange === credModal.exchange ? { ...e, connected: true } : e)
                        );
                        setCredModal(null);
                      } catch (err: any) { setError(err.message); }
                      finally { setCredSaving(false); }
                    }}
                    className="flex-1 rounded-xl bg-linear-to-r from-fuchsia-600 to-violet-600 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
                  >
                    {credSaving ? "Saving..." : "Save Credentials"}
                  </Button>
                </div>
              </div>
            </div>
          )}

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
