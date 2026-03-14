import type { ActionType, NodeMetadata, TradingMetadata } from "@tradeflow/common";
import { SUPPORTED_ASSETS } from "@tradeflow/common";
import {  } from "@tradeflow/common";
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

const SUPPORTEDACTIONS = [
  {
    id: "hyperliquid" as const,
    title: "Hyperliquid",
    description:
      "Place a trade on Hyperliquid.",
  },
  {
    id: "backpack" as const,
    title: "Backpack",
    description: "Place a trade on Backpack.",
  },
  {
    id: "lighter" as const,
    title: "Lighter",
    description: "Place a trade on Lighter.",
  }
];

export function ActionSheet({ onClose, onSelect }: {
    onClose: () => void;
    onSelect: (data: { type: ActionType; metadata: NodeMetadata }) => void;
}) {
  const [metadata, setMetadata] = useState<TradingMetadata>({
    type: "LONG",
    qty: 0,
    symbol: "SOL",
  });
  const [selectedAction, setselectedAction] = useState<ActionType>(
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
          onValueChange={(value) => setselectedAction(value as ActionType)}
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
              value={metadata.type}
              onValueChange={(value) =>
                setMetadata((prev) => ({
                  ...prev,
                  type: value as TradingMetadata["type"],
                }))
              }
            >
              <SelectTrigger className="w-full rounded-lg border-slate-300 bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                      <SelectItem value={"LONG"}>
                        Long
                      </SelectItem>
                      <SelectItem value={"SHORT"}>
                        Short
                      </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
              <div className="pt-1 text-sm font-medium text-slate-700">
                Symbol
            </div>
            <Select
              value={metadata.symbol}
              onValueChange={(value) =>
                setMetadata((prev) => ({
                  ...prev,
                  symbol: value,
                }))
              }
            >
              <SelectTrigger className="w-full rounded-lg border-slate-300 bg-white">
                <SelectValue placeholder="Select a symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                     {SUPPORTED_ASSETS.map((asset) => <SelectItem key={asset} value={asset}>{asset}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="pt-1 text-sm font-medium text-slate-700">
                Quantity
            </div>
            <Input
              className="rounded-lg border-slate-300 bg-white"
              value={metadata.qty}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  qty: Number(e.target.value),
                }))
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
