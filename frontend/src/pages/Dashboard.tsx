import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchWorkflows, getStoredUser, isLoggedIn, logout, createWorkflow, deleteWorkflow } from "@/lib/api";

const WEEKLY_DATA = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 56 },
  { day: "Thu", value: 91 },
  { day: "Fri", value: 64 },
  { day: "Sat", value: 83 },
  { day: "Sun", value: 70 },
];

const MONTHLY_PNL = [
  { month: "Jan", value: 2400 },
  { month: "Feb", value: 1398 },
  { month: "Mar", value: 5800 },
  { month: "Apr", value: 3908 },
  { month: "May", value: 4800 },
  { month: "Jun", value: 3800 },
  { month: "Jul", value: 6300 },
  { month: "Aug", value: 5200 },
];

const EXCHANGE_DIST = [
  { name: "Hyperliquid", pct: 45, color: "#06b6d4" },
  { name: "Backpack", pct: 30, color: "#f59e0b" },
  { name: "Lighter", pct: 25, color: "#10b981" },
];

function BarChart() {
  const max = Math.max(...WEEKLY_DATA.map((d) => d.value));
  return (
    <div className="flex h-48 items-end gap-3">
      {WEEKLY_DATA.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-bold text-slate-500">{d.value}</span>
          <div
            className="w-full rounded-t-lg bg-linear-to-t from-fuchsia-600 to-violet-500 transition-all hover:from-fuchsia-500 hover:to-violet-400"
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className="text-xs font-semibold text-slate-400">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function AreaChart() {
  const max = Math.max(...MONTHLY_PNL.map((d) => d.value));
  const w = 600;
  const h = 180;
  const pts = MONTHLY_PNL.map((d, i) => ({
    x: (i / (MONTHLY_PNL.length - 1)) * w,
    y: h - (d.value / max) * h,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#a855f7" stroke="white" strokeWidth="2" />
      ))}
      {MONTHLY_PNL.map((d, i) => (
        <text key={i} x={pts[i].x} y={h + 20} textAnchor="middle" className="fill-slate-400 text-[11px] font-semibold">
          {d.month}
        </text>
      ))}
    </svg>
  );
}

function DonutChart() {
  const size = 120;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-8">
      <svg width={size} height={size} className="shrink-0">
        {EXCHANGE_DIST.map((seg) => {
          const dash = (seg.pct / 100) * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={seg.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="space-y-2">
        {EXCHANGE_DIST.map((seg) => (
          <div key={seg.name} className="flex items-center gap-2">
            <div className="size-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-sm font-semibold text-slate-600">{seg.name}</span>
            <span className="text-sm font-bold text-slate-900">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Active"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : status === "Paused"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-500 border-slate-200";
  return <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${cls}`}>{status}</span>;
}

export default function Dashboard() {
  const [showNameModal, setShowNameModal] = useState(false);
  const [flowName, setFlowName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = getStoredUser();

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/login"); return; }
    fetchWorkflows()
      .then(setWorkflows)
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateFlow = async () => {
    if (flowName.trim()) {
      navigate(`/createflow?name=${encodeURIComponent(flowName.trim())}`);
      setShowNameModal(false);
      setFlowName("");
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm("Delete this workflow?")) return;
    try {
      await deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Workflow Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-fuchsia-500/25">
                ⚡
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Name your workflow</h2>
            </div>
            <p className="mb-5 text-sm text-slate-500">Give your trading workflow a descriptive name to easily identify it later.</p>
            <Input
              autoFocus
              placeholder="e.g. BTC Momentum Scalper"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFlow()}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base shadow-sm focus:border-violet-500 focus:ring-violet-500/20"
            />
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowNameModal(false); setFlowName(""); }}
                className="flex-1 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFlow}
                disabled={!flowName.trim()}
                className="flex-1 rounded-xl bg-linear-to-r from-fuchsia-600 to-violet-600 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
              >
                Create Workflow
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-fuchsia-500/25">
              TF
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TradeFlow</span>
          </div>
          <div className="flex items-center gap-3">
              <Link to="/executor">
                <Button variant="outline" className="rounded-xl border-cyan-200 px-5 text-sm font-bold text-cyan-700 hover:bg-cyan-50">
                  ⚡ Executor
                </Button>
              </Link>
              <Button onClick={() => setShowNameModal(true)} className="rounded-xl bg-linear-to-r from-fuchsia-600 to-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:brightness-110">
                + New Workflow
              </Button>
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-violet-500 text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-500">{user?.email || ""}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700">
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      My Profile
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-violet-950 via-indigo-900 to-fuchsia-900 p-8 text-white shadow-2xl shadow-violet-500/10">
          <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold">Welcome back! &#x1f680;</h1>
            <p className="mt-2 max-w-lg text-base text-indigo-200/80">
              Your automated trading workflows are running smoothly. Monitor performance, create new strategies, and manage your portfolio &mdash; all from one place.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Workflows", value: String(workflows.length), icon: "\u26a1", gradient: "from-violet-500 to-fuchsia-500" },
            { label: "Total Executions", value: String(workflows.reduce((a, w) => a + (w.runs || 0), 0)), icon: "\ud83d\udd04", gradient: "from-cyan-500 to-blue-500" },
            { label: "Total P&L", value: workflows.length ? workflows.map(w => w.pnl || "$0").join(", ") : "$0", icon: "\ud83d\udcb0", gradient: "from-emerald-500 to-teal-500" },
            { label: "Active", value: String(workflows.filter(w => w.status === "Active").length), icon: "\ud83c\udfaf", gradient: "from-amber-500 to-orange-500" },
          ].map((s) => (
            <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-violet-500/5">
              <div className={`flex size-12 items-center justify-center rounded-xl bg-linear-to-br ${s.gradient} text-xl shadow-lg`}>
                {s.icon}
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">{s.label}</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-900">Weekly Executions</h3>
            <BarChart />
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-900">Monthly P&amp;L</h3>
            <AreaChart />
          </div>
        </div>

        {/* Exchange distribution + About */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-900">Exchange Distribution</h3>
            <DonutChart />
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 bg-linear-to-br from-violet-50 to-fuchsia-50 p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-violet-900">About TradeFlow</h3>
            <p className="text-sm leading-relaxed text-violet-700/80">
              <strong>TradeFlow</strong> is a visual, no-code trading automation platform. Build workflows by connecting trigger nodes (price alerts, timers) to action nodes (place orders on Hyperliquid, Backpack, or Lighter). Every strategy runs 24/7 with real-time monitoring, detailed analytics, and one-click deployment.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["No-Code", "24/7 Execution", "Multi-Exchange", "Real-Time", "Visual Builder"].map((t) => (
                <span key={t} className="rounded-full bg-violet-200/60 px-3 py-1 text-xs font-bold text-violet-700">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { title: "Create Workflow", desc: "Build a new automated trading strategy", icon: "\u2795", gradient: "from-fuchsia-600 to-violet-600", link: "", action: () => setShowNameModal(true) },
            { title: "View Analytics", desc: "Deep dive into your trading performance", icon: "\ud83d\udcca", gradient: "from-cyan-500 to-blue-600", link: "/executor" },
            { title: "Manage Keys", desc: "Connect and manage exchange API keys", icon: "\ud83d\udd11", gradient: "from-amber-500 to-orange-600", link: "/profile" },
          ].map((a) => (
            <div
              key={a.title}
              onClick={() => { if ('action' in a && a.action) { a.action(); } else if (a.link) { navigate(a.link); } }}
              className="group cursor-pointer rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-violet-500/5"
            >
              <div className={`flex size-12 items-center justify-center rounded-xl bg-linear-to-br ${a.gradient} text-xl text-white shadow-lg`}>{a.icon}</div>
              <h4 className="mt-4 text-base font-bold text-slate-900 group-hover:text-violet-700">{a.title}</h4>
              <p className="mt-1 text-sm text-slate-500">{a.desc}</p>
            </div>
          ))}
        </div>

        {/* Workflows table */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900">Your Workflows</h3>
            <span className="text-sm text-slate-400">{workflows.length} workflow{workflows.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Name</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Exchange</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">P&amp;L</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Runs</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workflows.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">No workflows yet. Create your first one!</td></tr>
                ) : workflows.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => navigate(`/workflow/${w.id}`)}
                    className="cursor-pointer border-b border-slate-50 transition-colors hover:bg-violet-50/30"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{w.name}</td>
                    <td className="px-6 py-4"><StatusBadge status={w.status} /></td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{w.exchange}</td>
                    <td className={`px-6 py-4 text-sm font-bold ${(w.pnl || "").startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>{w.pnl || "$0"}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{w.runs || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/workflow/${w.id}`)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-violet-600 shadow-sm transition-all hover:bg-violet-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(w.id)}
                          className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Brand */}
            <div className="space-y-4 text-center sm:text-left">
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-600 text-xs font-black text-white shadow-lg shadow-fuchsia-500/25">
                  TF
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">TradeFlow</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">Visual, no-code trading automation for Hyperliquid, Backpack &amp; Lighter.</p>
            </div>
            {/* Connect */}
            <div className="flex items-center gap-5">
              <a href="https://github.com/AerthSaraogi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-violet-600">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/aerth-saraogi/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-violet-600">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
              <a href="mailto:aerthsaraogi9@gmail.com" className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-violet-600">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Email
              </a>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
            <p className="text-sm text-slate-400">&copy; 2026 TradeFlow. All rights reserved.</p>
            <p className="text-sm text-slate-400">Built by Aerth Saraogi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
