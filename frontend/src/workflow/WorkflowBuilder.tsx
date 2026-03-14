import { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, ReactFlowProvider, applyNodeChanges, applyEdgeChanges, addEdge, Background, BackgroundVariant, Controls, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom';
import type { WorkflowNode, WorkflowEdge, NodeKind, NodeMetadata, TriggerType, ActionType } from "@tradeflow/common";
import { TriggerSheet } from '@/workflow/TriggerSheet';
import { PriceTrigger } from "@/workflow/nodes/PriceTrigger";
import { Timer } from "@/workflow/nodes/Timer";
import { Lighter } from '@/workflow/nodes/Lighter';
import { ActionSheet } from '@/workflow/ActionSheet';
import { Hyperliquid } from '@/workflow/nodes/HyperLiquid';
import { Backpack } from '@/workflow/nodes/BackPack';
import { createWorkflow, updateWorkflow, fetchWorkflow, getStoredUser, logout } from '@/lib/api';

const nodeTypes = {
  "price-trigger": PriceTrigger,
  "timer": Timer,
  "lighter": Lighter,
  "hyperliquid": Hyperliquid,
  "backpack": Backpack,
};  
function CreateWorkflowInner() {
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [flowName, setFlowName] = useState(searchParams.get('name') || 'Untitled Workflow');
  const [workflowDbId, setWorkflowDbId] = useState<string | null>(paramId || null);
  const [status, setStatus] = useState("Paused");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [showTriggerSheet, setShowTriggerSheet] = useState(!paramId);
  const [selectAction, setSelectAction] = useState<{
    position:{
      x:number,
      y:number
    },
    startingNodeId: string,
  }|null>(null);

  // Load existing workflow when editing
  useEffect(() => {
    if (paramId) {
      fetchWorkflow(paramId)
        .then((wf) => {
          setFlowName(wf.name);
          setNodes(wf.nodes || []);
          setEdges(wf.edges || []);
          setStatus(wf.status || "Paused");
          setWorkflowDbId(wf.id);
          setShowTriggerSheet(false);
        })
        .catch(() => navigate("/dashboard"));
    }
  }, [paramId, navigate]);

  const showToast = (msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 2500);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      if (workflowDbId) {
        await updateWorkflow(workflowDbId, { name: flowName, nodes, edges, status: "Paused" });
      } else {
        const res = await createWorkflow({ name: flowName, nodes, edges });
        setWorkflowDbId(res.workflow.id);
      }
      setStatus("Paused");
      showToast("✓ Draft saved!");
    } catch {
      showToast("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    setSaving(true);
    try {
      if (workflowDbId) {
        await updateWorkflow(workflowDbId, { name: flowName, nodes, edges, status: "Active" });
      } else {
        const res = await createWorkflow({ name: flowName, nodes, edges });
        setWorkflowDbId(res.workflow.id);
        await updateWorkflow(res.workflow.id, { status: "Active" });
      }
      setStatus("Active");
      showToast("Deployed! 🚀");
    } catch {
      showToast("Deploy failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
 
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
  const { screenToFlowPosition } = useReactFlow();
  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent, connectionInfo: any) => {
    if (!connectionInfo.isValid) {
      const clientX = 'changedTouches' in event ? event.changedTouches[0].clientX : (event as MouseEvent).clientX;
      const clientY = 'changedTouches' in event ? event.changedTouches[0].clientY : (event as MouseEvent).clientY;
      const position = screenToFlowPosition({ x: clientX, y: clientY });
      setSelectAction({
        startingNodeId: connectionInfo.fromNode.id,
        position,
      });
    }
  }, [screenToFlowPosition]);

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
      {/* Save toast */}
      {saveMsg && (
        <div className="fixed top-4 left-1/2 z-[200] -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xl animate-in fade-in">
          {saveMsg}
        </div>
      )}

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
            {status === "Active" && <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">LIVE</span>}
            {status === "Paused" && workflowDbId && <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">DRAFT</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handleDeploy}
            disabled={saving}
            className="rounded-lg bg-linear-to-r from-fuchsia-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "..." : status === "Active" ? "Update & Deploy" : "Deploy"}
          </button>
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-violet-500 text-[10px] font-bold text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-500">{user?.email || ""}</p>
                </div>
                <div className="py-1">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    My Profile
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    <div
      className="bg-linear-to-br from-slate-50 via-white to-blue-50 flex-1"
    >
      {!nodes.length && showTriggerSheet && <TriggerSheet onClose={() => setShowTriggerSheet(false)} onSelect={({type, metadata}:{type: TriggerType, metadata: NodeMetadata})=>{
        setNodes([...nodes,{
          id:Math.random().toString(),
          type,
          data:{
            kind: "trigger" as NodeKind,
            metadata,
          },
          position:{x:0,y:0}
        }])
      }} />}
      {selectAction && <ActionSheet onClose={() => setSelectAction(null)} onSelect={({type, metadata}:{type: ActionType, metadata: NodeMetadata})=>{
        const newNodeId = Math.random().toString();
        setNodes([...nodes,{
          id: newNodeId,
          type,
          data:{
            kind: "action" as NodeKind,
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

export default function CreateWorkflow() {
  return (
    <ReactFlowProvider>
      <CreateWorkflowInner />
    </ReactFlowProvider>
  );
}