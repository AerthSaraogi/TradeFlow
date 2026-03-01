import { Handle, Position } from "@xyflow/react";

export type PriceTriggerNodeMetadata = {
    asset: string;
    price: number;
};
export function PriceTrigger({ data, isConnectable }: {
    data: {
        metadata: PriceTriggerNodeMetadata
    },
    isConnectable: boolean
}) {
    return <div className="min-w-45 rounded-xl border border-blue-200 bg-white/90 p-4 shadow-sm backdrop-blur">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
            Price Trigger
        </div>
        <div className="text-sm font-medium text-slate-900">
            {data.metadata.asset} 
         </div> 
         <div className="mt-1 text-sm text-slate-600">
            {data.metadata.price}
        </div>
        <Handle type="source" position={Position.Right} ></Handle>
    </div>
}