import type { NodeKind, } from "@tradeflow/common";
import { SUPPORTED_ASSETS } from "@tradeflow/common";
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
import type { PriceTriggerNodeMetadata, TimerNodeMetadata } from "@tradeflow/common";
import type { TriggerType, NodeMetadata } from "@tradeflow/common";

const SUPPORTEDTRIGGERS = [
  {
    id: "price-trigger" as const,
    title: "Price Trigger",
    description:
      "Runs whenever the price goes above or below a certain threshold.",
  },
  {
    id: "timer" as const,
    title: "Timer",
    description: "Runs at a specific time or on a recurring schedule.",
  },
];
export const SUPPORTEDASSETS = ["SOL", "BTC", "ETH"];
export function TriggerSheet({ onClose, onSelect }: {
  onClose: () => void;
  onSelect: (data: { type: TriggerType; metadata: NodeMetadata }) => void;
}) {
  const [metadata, setMetadata] = useState<
    PriceTriggerNodeMetadata | TimerNodeMetadata
  >({
    time: 3600,
  });
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("timer");
  return (
    <Sheet open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-105 border-l border-slate-200 bg-white/95 p-6 backdrop-blur">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-slate-900">Select Trigger</SheetTitle>
          <SheetDescription className="text-sm text-slate-500">
            Select a trigger to start your workflow.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-5 space-y-4">
        <Select
          value={selectedTrigger}
          onValueChange={(value) => setSelectedTrigger(value as TriggerType)}
        >
          <SelectTrigger className="w-full rounded-lg border-slate-300">
            <SelectValue placeholder="Select a trigger" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SUPPORTEDTRIGGERS.map(({ id, title }) => (
                <SelectItem key={id} value={id}>
                  {title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {selectedTrigger === "timer" && <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-medium text-slate-700">Number of seconds after which to run the timer</div>
            <Input
              className="rounded-lg border-slate-300 bg-white"
              value={"time" in metadata ? metadata.time : ""}
              onChange={(e) =>
                setMetadata((metadata) => {
                  return {
                    ...metadata,
                    time: Number(e.target.value),
                  };
                })
              }
            ></Input>
            </div>}
        {selectedTrigger === "price-trigger" && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-medium text-slate-700">Price</div>
            <Input
              className="rounded-lg border-slate-300 bg-white"
              type="text"
              onChange={(e) =>
                setMetadata((m) => ({
                  ...m,
                  price: Number(e.target.value),
                }))
              }
            />
            <div className="pt-1 text-sm font-medium text-slate-700">Assets</div>
            <Select
              value={"asset" in metadata ? metadata.asset : ""}
              onValueChange={(value) =>
                setMetadata((metadata) => {
                  return {
                    ...metadata,
                    asset: value,
                  };
                })
              }
            >
              <SelectTrigger className="w-full rounded-lg border-slate-300 bg-white">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SUPPORTED_ASSETS.map((asset) => (
                    <SelectItem key={asset} value={asset}>
                      {asset}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        </div>
        <SheetFooter>
          <Button
            className="mt-4 w-full rounded-lg bg-slate-900 font-medium text-white hover:bg-slate-800"
            onClick={() => {
              onSelect({
                type: selectedTrigger,
                metadata,
              });
            }}
            type="submit"
          >
            Create Trigger
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
