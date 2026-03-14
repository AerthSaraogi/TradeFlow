import { Router } from "express";
import { WorkflowModel } from "../db/models/Workflow.js";
import { ExecutionLogModel } from "../db/models/ExecutionLog.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  startExecutor,
  stopExecutor,
  getExecutorStats,
  runWorkflowOnce,
} from "../executor/engine.js";

const router = Router();

// ── Start executor engine ───────────────────────────────────
router.post("/start", authenticateToken, async (_req, res) => {
  try {
    startExecutor();
    res.json({ running: true, message: "Executor started" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Stop executor engine ────────────────────────────────────
router.post("/stop", authenticateToken, async (_req, res) => {
  try {
    stopExecutor();
    res.json({ running: false, message: "Executor stopped" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get executor status + stats ─────────────────────────────
router.get("/status", authenticateToken, async (_req, res) => {
  try {
    const stats = getExecutorStats();
    const activeWorkflows = await WorkflowModel.countDocuments({ status: "Active" });
    const totalLogs = await ExecutionLogModel.countDocuments();
    const successLogs = await ExecutionLogModel.countDocuments({ status: "success" });
    const failedLogs = await ExecutionLogModel.countDocuments({ status: "failed" });
    res.json({
      ...stats,
      activeWorkflows,
      totalExecutions: totalLogs,
      successCount: successLogs,
      failedCount: failedLogs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Manually run a single workflow ──────────────────────────
router.post("/run/:id", authenticateToken, async (req, res) => {
  try {
    await runWorkflowOnce(req.params.id as string);
    res.json({ success: true, message: `Workflow ${req.params.id} executed` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get execution logs (paginated, filterable) ──────────────
router.get("/logs", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const skip = (page - 1) * limit;

    const filter: any = { userId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.workflowId) filter.workflowId = req.query.workflowId;

    const [logs, total] = await Promise.all([
      ExecutionLogModel.find(filter).sort({ executedAt: -1 }).skip(skip).limit(limit),
      ExecutionLogModel.countDocuments(filter),
    ]);
    res.json({ logs: logs.map((l) => l.toJSON()), total, page, limit });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Clear all logs ──────────────────────────────────────────
router.delete("/logs", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    await ExecutionLogModel.deleteMany({ userId });
    res.json({ success: true, message: "All logs cleared" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
