import { Router } from "express";
import { WorkflowModel } from "../db/models/Workflow.js";
import { authenticateToken } from "../middleware/auth.js";
import type { CreateWorkflowRequest } from "@tradeflow/common";

const router = Router();

// ── List all workflows ──────────────────────────────────────
router.get("/", authenticateToken, async (req, res) => {
  try {
    const workflows = await WorkflowModel.find({ userId: (req as any).userId });
    res.json(workflows.map((w) => w.toJSON()));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});

// ── Get single workflow ─────────────────────────────────────
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const wf = await WorkflowModel.findOne({ _id: req.params.id, userId: (req as any).userId });
    if (!wf) return res.status(404).json({ error: "Workflow not found" });
    res.json(wf.toJSON());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch workflow" });
  }
});

// ── Create workflow ─────────────────────────────────────────
router.post("/", authenticateToken, async (req, res) => {
  try {
    const body = req.body as CreateWorkflowRequest;
    const workflow = await WorkflowModel.create({
      name: body.name,
      nodes: body.nodes,
      edges: body.edges,
      userId: (req as any).userId,
    });
    res.status(201).json({ workflow: workflow.toJSON() });
  } catch (err) {
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

// ── Update workflow ─────────────────────────────────────────
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const wf = await WorkflowModel.findOneAndUpdate(
      { _id: req.params.id, userId: (req as any).userId },
      { $set: updates },
      { new: true }
    );
    if (!wf) return res.status(404).json({ error: "Workflow not found" });
    res.json(wf.toJSON());
  } catch (err) {
    res.status(500).json({ error: "Failed to update workflow" });
  }
});

// ── Delete workflow ─────────────────────────────────────────
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const wf = await WorkflowModel.findOneAndDelete({
      _id: req.params.id,
      userId: (req as any).userId,
    });
    if (!wf) return res.status(404).json({ error: "Workflow not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete workflow" });
  }
});

export default router;
