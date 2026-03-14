const API_BASE = "/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────

export async function signup(name: string, email: string, password: string) {
  const data = await request<{ user: any; token: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function login(email: string, password: string) {
  const data = await request<{ user: any; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getStoredUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

export function isLoggedIn() {
  return !!getToken();
}

// ── User ────────────────────────────────────────────────────

export async function fetchMe() {
  return request<any>("/user/me");
}

export async function updateMe(updates: Record<string, any>) {
  return request<any>("/user/me", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function saveCredentials(exchange: string, apiKey: string, apiSecret: string) {
  return request<any>("/user/credentials", {
    method: "PUT",
    body: JSON.stringify({ exchange, apiKey, apiSecret }),
  });
}

export async function removeCredentials(exchange: string) {
  return request<any>(`/user/credentials/${exchange}`, {
    method: "DELETE",
  });
}

// ── Workflows ───────────────────────────────────────────────

export async function fetchWorkflows() {
  return request<any[]>("/workflows");
}

export async function fetchWorkflow(id: string) {
  return request<any>(`/workflows/${id}`);
}

export async function createWorkflow(data: { name: string; nodes?: any[]; edges?: any[] }) {
  return request<{ workflow: any }>("/workflows", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateWorkflow(id: string, updates: Record<string, any>) {
  return request<any>(`/workflows/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteWorkflow(id: string) {
  return request<{ success: boolean }>(`/workflows/${id}`, {
    method: "DELETE",
  });
}

// ── Executor ────────────────────────────────────────────────

export async function startExecutor() {
  return request<{ running: boolean; message: string }>("/executor/start", { method: "POST" });
}

export async function stopExecutor() {
  return request<{ running: boolean; message: string }>("/executor/stop", { method: "POST" });
}

export async function getExecutorStatus() {
  return request<{
    running: boolean;
    tickCount: number;
    interval: number;
    activeWorkflows: number;
    totalExecutions: number;
    successCount: number;
    failedCount: number;
  }>("/executor/status");
}

export async function runWorkflowManually(id: string) {
  return request<{ success: boolean; message: string }>(`/executor/run/${id}`, { method: "POST" });
}

export async function getExecutionLogs(params?: { page?: number; limit?: number; status?: string; workflowId?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.status) q.set("status", params.status);
  if (params?.workflowId) q.set("workflowId", params.workflowId);
  const qs = q.toString();
  return request<{
    logs: any[];
    total: number;
    page: number;
    limit: number;
  }>(`/executor/logs${qs ? `?${qs}` : ""}`);
}

export async function clearExecutionLogs() {
  return request<{ success: boolean }>("/executor/logs", { method: "DELETE" });
}
