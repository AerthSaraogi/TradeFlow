import { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, BackgroundVariant, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSearchParams, Link } from 'react-router-dom';
import { TriggerSheet } from './TriggerSheet';
import { PriceTrigger, type PriceTriggerNodeMetadata } from "@/nodes/triggers/PriceTrigger";
import { Timer, type TimerNodeMetadata } from "@/nodes/triggers/Timer";
import { Lighter, type TradingMetadata } from '@/nodes/action/Lighter';
import { ActionSheet } from './ActionSheet';
import { Hyperliquid } from '@/nodes/action/HyperLiquid';
import { Backpack } from '@/nodes/action/BackPack';

const nodeTypes = {
    "price-trigger": PriceTrigger,
    "timer": Timer,
  "lighter": Lighter,
  "hyperliquid": Hyperliquid,
  "backpack": Backpack,
}

export type TriggerType = "action" | "trigger";
export type NodeKind = "price-trigger" |"timer" | "hyperliquid" | "backpack" | "lighter";
interface NodeType {
  type: NodeKind;
  data:{
    kind: TriggerType;
    metadata: NodeMetadata;
  }
  id: string, position:{ x:number, y:number};
}
export type NodeMetadata = TradingMetadata | PriceTriggerNodeMetadata | TimerNodeMetadata ;
interface Edge {
    id: string;
    source: string;
    target: string;
}  
export default function CreateWorkflow() {
  const [searchParams] = useSearchParams();
  const flowName = searchParams.get('name') || 'Untitled Workflow';
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showTriggerSheet, setShowTriggerSheet] = useState(true);
  const [selectAction, setSelectAction] = useState<{
    position:{
      x:number,
      y:number
    },
    startingNodeId: string,
  }|null>(null);
 
  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );
  const POSITION_OFFSET = 50;
  const onConnectEnd = useCallback((_params: any, connectionInfo: any) => {
    if (!connectionInfo.isValid) {
      setSelectAction({
        startingNodeId: connectionInfo.fromNode.id,
        position: {
          x: connectionInfo.from.x +POSITION_OFFSET,
          y: connectionInfo.from.y + POSITION_OFFSET,
        },
      })
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Header */}
      <nav className="z-50 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/90 px-5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-fuchsia-500 to-violet-600 text-[10px] font-black text-white shadow shadow-fuchsia-500/25">
              TF
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">TradeFlow</span>
          </Link>
          <div className="mx-2 h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <svg className="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="text-sm font-semibold text-slate-700">{flowName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50">
            Save Draft
          </button>
          <button className="rounded-lg bg-linear-to-r from-fuchsia-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:brightness-110">
            Deploy
          </button>
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-violet-500 text-[10px] font-bold text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
            >
              A
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Aerth Saraogi</p>
                  <p className="text-xs text-slate-500">aerth@tradeflow.io</p>
                </div>
                <div className="py-1">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    My Profile
                  </Link>
                  <Link to="/login" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    <div
      className="bg-linear-to-br from-slate-50 via-white to-blue-50 flex-1"
    >
      {!nodes.length && showTriggerSheet && <TriggerSheet onClose={() => setShowTriggerSheet(false)} onSelect={({type, metadata})=>{
        setNodes([...nodes,{
          id:Math.random().toString(),
          type,
          data:{
            kind: "trigger",
            metadata,
          },
          position:{x:0,y:0}
        }])
      }} />}
      {selectAction && <ActionSheet onClose={() => setSelectAction(null)} onSelect={({type, metadata})=>{
        const newNodeId = Math.random().toString();
        setNodes([...nodes,{
          id: newNodeId,
          type,
          data:{
            kind: "action",
            metadata,
          },
          position: selectAction.position
        }]);
        setEdges([...edges,{
          id: `${selectAction.startingNodeId}-${newNodeId}`,
          source: selectAction.startingNodeId,
          target: newNodeId,
        }])
        setSelectAction(null);
      }} />}
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
        fitView
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#c7d2e0"
        />
        <Controls
          className="rounded-xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur [&>button]:border-slate-200 [&>button]:text-slate-500 [&>button]:hover:bg-slate-50 [&>button]:hover:text-slate-700"
        />
      </ReactFlow>

      {/* Floating button when trigger sheet is closed and no nodes exist */}
      {!nodes.length && !showTriggerSheet && (
        <button
          onClick={() => setShowTriggerSheet(true)}
          className="fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-200 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Trigger
        </button>
      )}
    </div>
    </div>
  );
}