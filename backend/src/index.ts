import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./db/index.js";

// ── Route modules ───────────────────────────────────────────
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import workflowRoutes from "./routes/workflow.js";
import executorRoutes from "./routes/executor.js";

const app = express();

// ── Global middleware ───────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 3001;

// ── Mount routes ────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/executor", executorRoutes);

// ── Health check ────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Global error handler ────────────────────────────────────
app.use(
  (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("❌ Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
);

// ── Start ───────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 TradeFlow server running on http://localhost:${PORT}`);
  });
});
