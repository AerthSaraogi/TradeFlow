import mongoose, { Schema, Document } from "mongoose";

interface NodeMetadata {
  [key: string]: unknown;
}

interface WorkflowNode {
  id: string;
  type: string;
  data: {
    kind: string;
    metadata: NodeMetadata;
  };
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface IWorkflow extends Document {
  name: string;
  status: string;
  exchange: string;
  pnl: string;
  runs: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  userId: mongoose.Types.ObjectId;
}

const WorkflowNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    data: {
      kind: { type: String, required: true },
      metadata: { type: Schema.Types.Mixed, default: {} },
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
  },
  { _id: false }
);

const WorkflowEdgeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
  },
  { _id: false }
);

const WorkflowSchema = new Schema<IWorkflow>(
  {
    name: { type: String, required: true },
    status: { type: String, default: "Paused" },
    exchange: { type: String, default: "Hyperliquid" },
    pnl: { type: String, default: "$0" },
    runs: { type: Number, default: 0 },
    nodes: { type: [WorkflowNodeSchema], default: [] },
    edges: { type: [WorkflowEdgeSchema], default: [] },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Transform _id → id, timestamps → ISO strings
WorkflowSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.createdAt = ret.createdAt?.toISOString?.() ?? ret.createdAt;
    ret.updatedAt = ret.updatedAt?.toISOString?.() ?? ret.updatedAt;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const WorkflowModel = mongoose.model<IWorkflow>("Workflow", WorkflowSchema);
