import { Handle, Position } from "@xyflow/react";

export type TimerNodeMetadata = {
    time: number;
};
export function Timer({ data, isConnectable }: {
    data: {
        metadata: TimerNodeMetadata
    },
    isConnectable: boolean
}) {
    return <div className="min-w-45 rounded-xl border border-violet-200 bg-white/90 p-4 shadow-sm backdrop-blur">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-600">
            Timer Trigger
        </div>
        <div className="text-sm font-medium text-slate-900">
            Every {data.metadata.time/3600} seconds
        </div>
        <Handle type="source" position={Position.Right} ></Handle>
    </div>
}