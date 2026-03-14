import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  getExecutorStatus,
  startExecutor,
  stopExecutor,
  getExecutionLogs,
  clearExecutionLogs,
  runWorkflowManually,
  fetchWorkflows,
  getStoredUser,
  isLoggedIn,
  logout,
} from "@/lib/api";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "success"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : status === "failed"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${cls}`}>
      {status}
    </span>
  );
}

export default function Executor() {
  const [executorStatus, setExecutorStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logMeta, setLogMeta] = useState({ total: 0, page: 1, limit: 25 });
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterWorkflow, setFilterWorkflow] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = getStoredUser();

  // Initial load
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    refreshAll();
  }, [navigate]);

  // Auto-refresh every 5s
  useEffect(() => {
    const id = setInterval(refreshAll, 5000);
    return () => clearInterval(id);
  }, [filterStatus, filterWorkflow, logMeta.page]);

  // Close user menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function refreshAll() {
    // Fetch independently so one failure doesn't block the others
    getExecutorStatus()
      .then(setExecutorStatus)
      .catch(() => {});

    getExecutionLogs({
      page: logMeta.page,
      limit: logMeta.limit,
      status: filterStatus || undefined,
      workflowId: filterWorkflow || undefined,
    })
      .then((res) => {
        setLogs(res.logs);
        setLogMeta({ total: res.total, page: res.page, limit: res.limit });
      })
      .catch(() => {});

    fetchWorkflows()
      .then(setWorkflows)
      .catch(() => {});
  }

  async function handleStart() {
    setLoading(true);
    try {
      await startExecutor();
      await refreshAll();
    } catch {}
    setLoading(false);
  }

  async function handleStop() {
    setLoading(true);
    try {
      await stopExecutor();
      await refreshAll();
    } catch {}
    setLoading(false);
  }

  async function handleRunWorkflow(id: string) {
    try {
      await runWorkflowManually(id);
      setTimeout(refreshAll, 1000);
    } catch {}
  }

  async function handleClearLogs() {
    if (!confirm("Clear all execution logs?")) return;
    try {
      await clearExecutionLogs();
      await refreshAll();
    } catch {}
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const totalPages = Math.ceil(logMeta.total / logMeta.limit) || 1;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-fuchsia-500/25">
                TF
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">TradeFlow</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="outline" className="rounded-xl border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
                ← Dashboard
              </Button>
            </Link>
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
                      My Profile
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
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
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-indigo-950 via-violet-900 to-cyan-900 p-8 text-white shadow-2xl shadow-violet-500/10">
          <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-violet-400/15 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">Workflow Executor ⚡</h1>
              <p className="mt-2 max-w-lg text-base text-indigo-200/80">
                Start the execution engine to automatically evaluate triggers and place trades across your connected exchanges.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${executorStatus?.running ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-300"}`}>
                <div className={`size-3 rounded-full ${executorStatus?.running ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                {executorStatus?.running ? "Running" : "Stopped"}
              </div>
              {executorStatus?.running ? (
                <Button
                  onClick={handleStop}
                  disabled={loading}
                  className="rounded-xl bg-red-500 px-6 font-bold text-white shadow-lg hover:bg-red-600"
                >
                  ⏹ Stop Engine
                </Button>
              ) : (
                <Button
                  onClick={handleStart}
                  disabled={loading}
                  className="rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 px-6 font-bold text-white shadow-lg hover:brightness-110"
                >
                  ▶ Start Engine
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Engine Status", value: executorStatus?.running ? "Running" : "Stopped", icon: executorStatus?.running ? "🟢" : "🔴", gradient: "from-emerald-500 to-teal-500" },
            { label: "Active Workflows", value: String(executorStatus?.activeWorkflows || 0), icon: "⚡", gradient: "from-violet-500 to-fuchsia-500" },
            { label: "Total Executions", value: String(executorStatus?.totalExecutions || 0), icon: "🔄", gradient: "from-cyan-500 to-blue-500" },
            { label: "Successful", value: String(executorStatus?.successCount || 0), icon: "✅", gradient: "from-emerald-500 to-green-500" },
            { label: "Failed", value: String(executorStatus?.failedCount || 0), icon: "❌", gradient: "from-red-500 to-orange-500" },
          ].map((s) => (
            <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:shadow-violet-500/5">
              <div className={`flex size-10 items-center justify-center rounded-xl bg-linear-to-br ${s.gradient} text-lg shadow-lg`}>
                {s.icon}
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Active Workflows - quick run */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900">Active Workflows</h3>
            <span className="text-sm text-slate-500">Click "Run" to trigger a workflow manually</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Name</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Exchange</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Runs</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workflows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">
                      No workflows found. Create one from the Dashboard.
                    </td>
                  </tr>
                ) : (
                  workflows.map((w) => (
                    <tr key={w.id} className="border-b border-slate-50 transition-colors hover:bg-violet-50/30">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{w.name}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${w.status === "Active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{w.exchange}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{w.runs || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRunWorkflow(w.id)}
                            className="rounded-lg border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm transition-all hover:bg-cyan-50"
                          >
                            ▶ Run Now
                          </button>
                          <Link
                            to={`/workflow/${w.id}`}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-violet-600 shadow-sm transition-all hover:bg-violet-50"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Execution Logs */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900">Execution Logs</h3>
            <div className="flex items-center gap-3">
              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setLogMeta((m) => ({ ...m, page: 1 })); }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
              >
                <option value="">All statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="skipped">Skipped</option>
              </select>
              {/* Workflow filter */}
              <select
                value={filterWorkflow}
                onChange={(e) => { setFilterWorkflow(e.target.value); setLogMeta((m) => ({ ...m, page: 1 })); }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
              >
                <option value="">All workflows</option>
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={handleClearLogs}
                className="rounded-lg border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Clear Logs
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Time</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Workflow</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Trigger</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Action</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Details</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Duration</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">
                      No execution logs yet. Start the engine or run a workflow manually.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                        {new Date(log.executedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-slate-900">{log.workflowName}</td>
                      <td className="px-6 py-3"><StatusBadge status={log.status} /></td>
                      <td className="px-6 py-3 text-xs text-slate-600">{log.triggerType || "—"}</td>
                      <td className="px-6 py-3 text-xs text-slate-600">{log.actionType || "—"}</td>
                      <td className="px-6 py-3 text-xs text-slate-500 max-w-xs truncate" title={log.error || log.actionDetails}>
                        {log.error ? (
                          <span className="text-red-500">{log.error}</span>
                        ) : (
                          log.actionDetails || log.triggerDetails || "—"
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs font-medium text-slate-500">{log.duration}ms</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {logMeta.total > logMeta.limit && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <span className="text-sm text-slate-500">
                Showing {(logMeta.page - 1) * logMeta.limit + 1}–{Math.min(logMeta.page * logMeta.limit, logMeta.total)} of {logMeta.total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={logMeta.page <= 1}
                  onClick={() => setLogMeta((m) => ({ ...m, page: m.page - 1 }))}
                  className="rounded-lg text-xs font-bold"
                >
                  ← Prev
                </Button>
                <span className="flex items-center px-3 text-sm font-semibold text-slate-700">
                  {logMeta.page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={logMeta.page >= totalPages}
                  onClick={() => setLogMeta((m) => ({ ...m, page: m.page + 1 }))}
                  className="rounded-lg text-xs font-bold"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="rounded-2xl border border-cyan-200/60 bg-linear-to-br from-cyan-50 to-indigo-50 p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-cyan-900">How the Executor Works</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-100 text-lg">1️⃣</div>
              <h4 className="text-sm font-bold text-slate-900">Fetch Active Workflows</h4>
              <p className="text-xs leading-relaxed text-slate-600">
                Every {(executorStatus?.interval || 10000) / 1000}s, the engine fetches all workflows with status "Active" from the database.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-lg">2️⃣</div>
              <h4 className="text-sm font-bold text-slate-900">Evaluate Triggers</h4>
              <p className="text-xs leading-relaxed text-slate-600">
                Timer triggers fire on schedule. Price triggers check the current asset price against your threshold.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-fuchsia-100 text-lg">3️⃣</div>
              <h4 className="text-sm font-bold text-slate-900">Execute Actions</h4>
              <p className="text-xs leading-relaxed text-slate-600">
                When a trigger fires, connected action nodes place orders on the exchange using your API credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
