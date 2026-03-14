/**
 * Exchange client wrappers.
 * Each client takes credentials + order params, places the order, and returns a result string.
 * Currently these are SIMULATED — replace the body with real SDK calls when ready.
 *
 * HyperLiquid SDK: https://github.com/hyperliquid-dex/hyperliquid-ts-sdk
 * For a real integration you'd do:
 *   import { HyperliquidAPI } from "@hyperliquid/sdk";
 *   const api = new HyperliquidAPI({ privateKey: apiSecret });
 *   await api.placeOrder({ ... });
 */

export interface OrderParams {
  side: "LONG" | "SHORT";
  symbol: string;
  qty: number;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  message: string;
}

// ── HyperLiquid ──────────────────────────────────────────────

export async function executeHyperliquid(
  apiKey: string,
  apiSecret: string,
  params: OrderParams
): Promise<OrderResult> {
  console.log(
    `  🔵 [HyperLiquid] ${params.side} ${params.qty} ${params.symbol} (key: ••••${apiKey.slice(-4)})`
  );

  // TODO: Replace with real HyperLiquid SDK call
  // const sdk = new HyperliquidAPI({ privateKey: apiSecret });
  // const res = await sdk.placeOrder({ asset: params.symbol, sz: params.qty, isBuy: params.side === "LONG", ... });

  // Simulated response
  const orderId = `HL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    success: true,
    orderId,
    message: `Simulated ${params.side} ${params.qty} ${params.symbol} on HyperLiquid → ${orderId}`,
  };
}

// ── Backpack ─────────────────────────────────────────────────

export async function executeBackpack(
  apiKey: string,
  apiSecret: string,
  params: OrderParams
): Promise<OrderResult> {
  console.log(
    `  🟡 [Backpack] ${params.side} ${params.qty} ${params.symbol} (key: ••••${apiKey.slice(-4)})`
  );

  const orderId = `BP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    success: true,
    orderId,
    message: `Simulated ${params.side} ${params.qty} ${params.symbol} on Backpack → ${orderId}`,
  };
}

// ── Lighter ──────────────────────────────────────────────────

export async function executeLighter(
  apiKey: string,
  apiSecret: string,
  params: OrderParams
): Promise<OrderResult> {
  console.log(
    `  🟢 [Lighter] ${params.side} ${params.qty} ${params.symbol} (key: ••••${apiKey.slice(-4)})`
  );

  const orderId = `LT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    success: true,
    orderId,
    message: `Simulated ${params.side} ${params.qty} ${params.symbol} on Lighter → ${orderId}`,
  };
}
