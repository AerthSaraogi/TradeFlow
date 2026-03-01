import type { NodeKind, NodeMetadata } from "./Createworkflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { PriceTriggerNodeMetadata } from "@/nodes/triggers/PriceTrigger";
import type { TimerNodeMetadata } from "@/nodes/triggers/Timer";
import type { TradingMetadata } from "@/nodes/action/Lighter";
import { SUPPORTEDASSETS } from "./TriggerSheet";

const SUPPORTEDACTIONS = [
  {
    id: "hyperliquid",
    title: "Hyperliquid",
    description:
      "Place a trade on Hyperliquid.",
  },
  {
    id: "backpack",
    title: "Backpack",
    description: "Place a trade on Backpack.",
  },
  {
    id: "lighter",
    title: "Lighter",
    description: "Place a trade on Lighter.",}
];

export const ActionSheet = ({
  onSelect,
  onClose,
}: {
  onSelect: (data: { type: NodeKind; metadata: NodeMetadata }) => void;
  onClose: () => void;
}) => {
  const [metadata, setMetadata] = useState<
   TradingMetadata |{}
  >({});
  const [selectedAction, setselectedAction] = useState(
    SUPPORTEDACTIONS[1].id,
  );
  return (
    <Sheet open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-105 border-l border-slate-200 bg-white/95 p-6 backdrop-blur">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-slate-900">Select Action</SheetTitle>
          <SheetDescription className="text-sm text-slate-500">
            Select an action to add to your workflow.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-5 space-y-4">
        <Select
          value={selectedAction}
          onValueChange={(value) => setselectedAction(value)}
        >
          <SelectTrigger className="w-full rounded-lg border-slate-300">
            <SelectValue placeholder="Select an action" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SUPPORTEDACTIONS.map(({ id, title }) => (
                <SelectItem key={id} value={id}>
                  {title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {(selectedAction === "hyperliquid" || selectedAction === "backpack" || selectedAction === "lighter") && <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-medium text-slate-700">
                Type
            </div>
            <Select
              value={metadata?.type}
              onValueChange={(value) =>
                setMetadata((metadata) => {
                  return {
                    ...metadata,
                    type: value,
                  };
                })
              }
            >
              <SelectTrigger className="w-full rounded-lg border-slate-300 bg-white">
                <SelectValue placeholder="Select an symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                      <SelectItem value={"long"}>
                        Long
                      </SelectItem>
                      <SelectItem value={"short"}>
                        Short
                      </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
              <div className="pt-1 text-sm font-medium text-slate-700">
                Symbol
            </div>
            <Select
              value={metadata?.symbol}
              onValueChange={(value) =>
                setMetadata((metadata) => {
                  return {
                    ...metadata,
                    symbol: value,
                  };
                })
              }
            >
              <SelectTrigger className="w-full rounded-lg border-slate-300 bg-white">
                <SelectValue placeholder="Select an quantity" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                     {SUPPORTEDASSETS.map((asset) => <SelectItem key={asset} value={asset}>{asset}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="pt-1 text-sm font-medium text-slate-700">
                Quantity
            </div>
            <Input
              className="rounded-lg border-slate-300 bg-white"
              value={metadata.time}
              onChange={(e) =>
                setMetadata((metadata) => {
                  return {
                    ...metadata,
                    qty: Number(e.target.value),
                  };
                })
              }
            ></Input>
            </div>}
        </div>
        <SheetFooter>
          <Button
            className="mt-4 w-full rounded-lg bg-slate-900 font-medium text-white hover:bg-slate-800"
            onClick={() => {
              onSelect({
                type: selectedAction,
                metadata,
              });
            }}
            type="submit"
          >
            Create Action
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
