import type { SUPPORTEDASSETS } from "@/component/TriggerSheet";
import { Handle, Position } from "@xyflow/react";


export type TradingMetadata = {
    type: string;
    qty: number;
    symbol: typeof SUPPORTEDASSETS;
};

export function Lighter({data}:{
    data:{
        metadata:TradingMetadata
    }
}){
    return <div className="min-w-50 rounded-xl border border-emerald-200 bg-white/90 p-4 shadow-sm backdrop-blur">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">Lighter Action</div>
        <div className="text-sm text-slate-700">Type: <span className="font-medium text-slate-900">{data.metadata.type}</span></div>
        <div className="text-sm text-slate-700">Qty: <span className="font-medium text-slate-900">{data.metadata.qty}</span></div>
        <div className="text-sm text-slate-700">Symbol: <span className="font-medium text-slate-900">{data.metadata.symbol}</span></div>
        <Handle type="source" position={Position.Right} ></Handle>
        <Handle type="target" position={Position.Left} ></Handle>
    </div>
}