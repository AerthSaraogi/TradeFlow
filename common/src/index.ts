/**
 * @tradeflow/common — Shared types, constants, and interfaces
 *
 * This package is consumed by both the frontend and backend.
 * It contains NO runtime dependencies — only type definitions and constants.
 */

// ── Constants ───────────────────────────────────────────────

export const SUPPORTED_ASSETS = ["SOL", "BC", "ETH"];

export const SUPPORTED_EXCHANGES = ["Hyperliquid", "Backpack", "Lighter"] as const;

// ── Node metadata types ─────────────────────────────────────

export type TradingMetadata = {
  type: "LONG" | "SHORT";
  qty: number;
  symbol: (typeof SUPPORTED_ASSETS)[number];
};

export type TimerNodeMetadata = {
  time: number;
};

export type PriceTriggerNodeMetadata = {
  asset: string;
  price: number;
  direction: "above" | "below";
};

export type NodeMetadata =
  | TradingMetadata
  | TimerNodeMetadata
  | PriceTriggerNodeMetadata;

// ── Node & workflow types ───────────────────────────────────

export type TriggerType = "price-trigger" | "timer";
export type ActionType = "lighter" | "hyperliquid" | "backpack";
export type NodeKind = "trigger" | "action";

export type WorkflowNode = {
  id: string;
  type: TriggerType | ActionType;
  data: {
    kind: NodeKind;
    metadata: NodeMetadata;
  };
  position: { x: number; y: number };
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
};

// ── User & exchange types ───────────────────────────────────

export type ExchangeName = (typeof SUPPORTED_EXCHANGES)[number];

export type ConnectedExchange = {
  exchange: ExchangeName;
  connected: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  connectedExchanges: ConnectedExchange[];
};

// ── Workflow type ───────────────────────────────────────────

export type Workflow = {
  id: string;
  name: string;
  status: string;
  exchange: string;
  pnl: string;
  runs: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
};

// ── API request / response types ────────────────────────────

export type CreateWorkflowRequest = {
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type UpdateUserRequest = Partial<
  Pick<User, "name" | "email" | "phone" | "bio">
>;
