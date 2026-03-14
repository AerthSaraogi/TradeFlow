import { Router } from "express";
import { UserModel } from "../db/models/User.js";


import { authenticateToken } from "../middleware/auth.js";
import type { UpdateUserRequest } from "@tradeflow/common";

const router = Router();

// ── Get current user ────────────────────────────────────────
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById((req as any).userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ── Update current user ─────────────────────────────────────
router.put("/me", authenticateToken, async (req, res) => {
  try {
    const updates = req.body as UpdateUserRequest;
    const user = await UserModel.findByIdAndUpdate(
      (req as any).userId,
      { $set: updates },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ── Save exchange credentials ───────────────────────────────
router.put("/credentials", authenticateToken, async (req, res) => {
  try {
    const { exchange, apiKey, apiSecret } = req.body;
    if (!exchange) return res.status(400).json({ error: "Exchange is required" });
    const user = await UserModel.findById((req as any).userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const ex = user.connectedExchanges.find((e) => e.exchange === exchange);
    if (ex) {
      ex.apiKey = apiKey || "";
      ex.apiSecret = apiSecret || "";
      ex.connected = !!(apiKey && apiSecret);
    } else {
      user.connectedExchanges.push({
        exchange,
        connected: !!(apiKey && apiSecret),
        apiKey: apiKey || "",
        apiSecret: apiSecret || "",
      });
    }
    await user.save();
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: "Failed to update credentials" });
  }
});

// ── Remove exchange credentials ─────────────────────────────
router.delete("/credentials/:exchange", authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById((req as any).userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const ex = user.connectedExchanges.find((e) => e.exchange === req.params.exchange);
    if (ex) {
      ex.apiKey = "";
      ex.apiSecret = "";
      ex.connected = false;
    }
    await user.save();
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: "Failed to remove credentials" });
  }
});

export default router;
