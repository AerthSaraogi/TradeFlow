import mongoose, { Schema, Document } from "mongoose";

export interface IExecutionLog extends Document {
  workflowId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workflowName: string;
  status: "success" | "failed" | "skipped";
  triggerType: string;
  triggerDetails: string;
  actionType: string;
  actionDetails: string;
  error?: string;
  executedAt: Date;
  duration: number; // ms
}

const ExecutionLogSchema = new Schema<IExecutionLog>(
  {
    workflowId: { type: Schema.Types.ObjectId, ref: "Workflow", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workflowName: { type: String, required: true },
    status: { type: String, enum: ["success", "failed", "skipped"], required: true },
    triggerType: { type: String, default: "" },
    triggerDetails: { type: String, default: "" },
    actionType: { type: String, default: "" },
    actionDetails: { type: String, default: "" },
    error: { type: String, default: "" },
    executedAt: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ExecutionLogSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.workflowId = ret.workflowId?.toString?.() ?? ret.workflowId;
    ret.userId = ret.userId?.toString?.() ?? ret.userId;
    ret.executedAt = ret.executedAt?.toISOString?.() ?? ret.executedAt;
    ret.createdAt = ret.createdAt?.toISOString?.() ?? ret.createdAt;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ExecutionLogModel = mongoose.model<IExecutionLog>("ExecutionLog", ExecutionLogSchema);
