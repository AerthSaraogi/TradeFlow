/**
 * Workflow Executor Engine
 *
 * Runs on an interval, fetches all "Active" workflows, evaluates triggers,
 * and executes the corresponding action nodes using the user's exchange API keys.
 *
 * Workflow graph: Trigger → Action (connected via edges)
 *
 * Trigger types:
 *   - timer:         fires every N seconds (metadata.time)
 *   - price-trigger: fires when asset price crosses a threshold
 *
 * Action types:
 *   - hyperliquid, backpack, lighter: place an order on the exchange
 */

import { WorkflowModel, type IWorkflow } from "../db/models/Workflow.js";
import { UserModel } from "../db/models/User.js";
import { ExecutionLogModel } from "../db/models/ExecutionLog.js";
import { getPrice } from "./priceService.js";
import {
  executeHyperliquid,
  executeBackpack,
  executeLighter,
  type OrderParams,
  type OrderResult,
} from "./exchangeClients.js";

// ── State ────────────────────────────────────────────────────

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let running = false;
let tickCount = 0;
const TICK_INTERVAL = parseInt(process.env.EXECUTOR_INTERVAL || "10000", 10); // default 10s

// Per-workflow last-fired timestamp (for timer triggers)
const lastFiredMap = new Map<string, number>();

// ── Public API ───────────────────────────────────────────────

export function startExecutor() {
  if (running) return;
  running = true;
  tickCount = 0;
  console.log(`⚡ Executor started (tick every ${TICK_INTERVAL / 1000}s)`);
  intervalHandle = setInterval(tick, TICK_INTERVAL);
  // run once immediately
  tick();
}

export function stopExecutor() {
  if (!running) return;
  running = false;
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = null;
  console.log("⏹  Executor stopped");
}

export function isExecutorRunning() {
  return running;
}

export function getExecutorStats() {
  return { running, tickCount, interval: TICK_INTERVAL };
}

// Run a single workflow on demand (manual trigger)
export async function runWorkflowOnce(workflowId: string) {
  const wf = await WorkflowModel.findById(workflowId);
  if (!wf) throw new Error("Workflow not found");
  return executeWorkflow(wf, true);
}

// ── Core tick ────────────────────────────────────────────────

async function tick() {
  tickCount++;
  const activeWorkflows = await WorkflowModel.find({ status: "Active" });
  if (activeWorkflows.length === 0) return;

  console.log(`\n🔄 Executor tick #${tickCount} — ${activeWorkflows.length} active workflow(s)`);

  for (const wf of activeWorkflows) {
    try {
      await executeWorkflow(wf, false);
    } catch (err: any) {
      console.error(`  ❌ Workflow "${wf.name}" error:`, err.message);
    }
  }
}

// ── Execute one workflow ─────────────────────────────────────

async function executeWorkflow(wf: IWorkflow, forceRun: boolean) {
  const start = Date.now();
  const wfId = wf._id.toString();

  // Find trigger nodes and action nodes
  const triggerNodes = wf.nodes.filter((n) => n.data.kind === "trigger");
  const actionNodes = wf.nodes.filter((n) => n.data.kind === "action");

  if (triggerNodes.length === 0 || actionNodes.length === 0) {
    return; // incomplete workflow, skip
  }

  // Evaluate each trigger
  let shouldFire = forceRun;
  let triggerDesc = forceRun ? "Manual trigger" : "";
  let triggerType = forceRun ? "manual" : "";

  if (!forceRun) {
    for (const trigger of triggerNodes) {
      const result = await evaluateTrigger(trigger, wfId);
      if (result.fired) {
        shouldFire = true;
        triggerType = trigger.type;
        triggerDesc = result.description;
        break; // one trigger firing is enough
      }
    }
  }

  if (!shouldFire) return;

  console.log(`  ⚡ Firing workflow "${wf.name}" — trigger: ${triggerDesc}`);

  // Get user + credentials
  const user = await UserModel.findById(wf.userId);
  if (!user) {
    await logExecution(wf, "failed", triggerType, triggerDesc, "", "", "User not found", Date.now() - start);
    return;
  }

  // Execute each action node that is reachable from a trigger via edges
  const reachableActionIds = getReachableActions(triggerNodes, actionNodes, wf.edges);

  for (const action of actionNodes) {
    if (!reachableActionIds.has(action.id)) continue;

    const meta = action.data.metadata as any;
    const orderParams: OrderParams = {
      side: meta.type || "LONG",
      symbol: meta.symbol || "SOL",
      qty: meta.qty || 1,
    };

    // Find credentials for this exchange
    const exchangeName = action.type; // "hyperliquid" | "backpack" | "lighter"
    const cred = user.connectedExchanges.find(
      (e) => e.exchange.toLowerCase() === exchangeName.toLowerCase()
    );

    if (!cred || !cred.apiKey || !cred.apiSecret) {
      await logExecution(
        wf, "failed", triggerType, triggerDesc, exchangeName,
        JSON.stringify(orderParams),
        `No API credentials for ${exchangeName}`,
        Date.now() - start
      );
      continue;
    }

    let result: OrderResult;
    try {
      result = await executeOnExchange(exchangeName, cred.apiKey, cred.apiSecret, orderParams);
    } catch (err: any) {
      await logExecution(
        wf, "failed", triggerType, triggerDesc, exchangeName,
        JSON.stringify(orderParams), err.message, Date.now() - start
      );
      continue;
    }

    // Log success
    await logExecution(
      wf,
      result.success ? "success" : "failed",
      triggerType, triggerDesc, exchangeName,
      result.message,
      result.success ? "" : result.message,
      Date.now() - start
    );

    // Increment run count
    await WorkflowModel.updateOne({ _id: wf._id }, { $inc: { runs: 1 } });
  }
}

// ── Trigger evaluation ───────────────────────────────────────

async function evaluateTrigger(
  node: { id: string; type: string; data: { kind: string; metadata: any } },
  wfId: string
): Promise<{ fired: boolean; description: string }> {
  const meta = node.data.metadata;

  if (node.type === "timer") {
    const intervalSec = meta.time || 60; // seconds
    const now = Date.now();
    const lastFired = lastFiredMap.get(`${wfId}:${node.id}`) || 0;

    if (now - lastFired >= intervalSec * 1000) {
      lastFiredMap.set(`${wfId}:${node.id}`, now);
      return { fired: true, description: `Timer fired (every ${intervalSec}s)` };
    }
    return { fired: false, description: "" };
  }

  if (node.type === "price-trigger") {
    const { asset, price: threshold, direction } = meta;
    try {
      const current = await getPrice(asset);
      const crossed =
        direction === "above" ? current >= threshold : current <= threshold;

      if (crossed) {
        return {
          fired: true,
          description: `${asset} price $${current} is ${direction} $${threshold}`,
        };
      }
    } catch (err: any) {
      console.warn(`  ⚠️  Price check failed for ${asset}:`, err.message);
    }
    return { fired: false, description: "" };
  }

  return { fired: false, description: `Unknown trigger type: ${node.type}` };
}

// ── Exchange dispatch ────────────────────────────────────────

async function executeOnExchange(
  exchange: string,
  apiKey: string,
  apiSecret: string,
  params: OrderParams
): Promise<OrderResult> {
  switch (exchange.toLowerCase()) {
    case "hyperliquid":
      return executeHyperliquid(apiKey, apiSecret, params);
    case "backpack":
      return executeBackpack(apiKey, apiSecret, params);
    case "lighter":
      return executeLighter(apiKey, apiSecret, params);
    default:
      return { success: false, message: `Unsupported exchange: ${exchange}` };
  }
}

// ── Graph helper ─────────────────────────────────────────────

function getReachableActions(
  triggers: { id: string }[],
  actions: { id: string }[],
  edges: { source: string; target: string }[]
): Set<string> {
  const triggerIds = new Set(triggers.map((t) => t.id));
  const actionIds = new Set(actions.map((a) => a.id));
  const reachable = new Set<string>();

  // BFS from trigger nodes through edges
  const queue = [...triggerIds];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    for (const edge of edges) {
      if (edge.source === current) {
        if (actionIds.has(edge.target)) {
          reachable.add(edge.target);
        }
        queue.push(edge.target);
      }
    }
  }

  return reachable;
}

// ── Logging helper ───────────────────────────────────────────

async function logExecution(
  wf: IWorkflow,
  status: "success" | "failed" | "skipped",
  triggerType: string,
  triggerDetails: string,
  actionType: string,
  actionDetails: string,
  error: string,
  duration: number
) {
  try {
    await ExecutionLogModel.create({
      workflowId: wf._id,
      userId: wf.userId,
      workflowName: wf.name,
      status,
      triggerType,
      triggerDetails,
      actionType,
      actionDetails,
      error,
      executedAt: new Date(),
      duration,
    });
  } catch (err) {
    console.error("  ❌ Failed to write execution log:", err);
  }
}
