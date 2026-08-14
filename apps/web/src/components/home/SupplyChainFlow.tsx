"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type NodeProps,
  type Edge,
  type Node,
  type NodeTypes,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type FlowNodeData = { label: string; sub?: string };
type FlowNode = Node<FlowNodeData>;

function SourceNode({ data, selected }: NodeProps<FlowNode>) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-center shadow-card transition-all ${
        selected ? "border-accent ring-2 ring-accent/30" : "border-brand/20 bg-white"
      }`}
    >
      <Handle type="target" position={Position.Bottom} className="!bg-brand-3" />
      <div className="font-display text-xs font-bold text-ink">{data.label}</div>
      {data.sub && <div className="mt-0.5 text-[10px] text-ink/50">{data.sub}</div>}
      <Handle type="source" position={Position.Bottom} className="!bg-brand-3" />
    </div>
  );
}

function HubNode({ data, selected }: NodeProps<FlowNode>) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-brand to-brand-ink px-5 py-3 text-center shadow-lift ${
        selected ? "ring-4 ring-accent/40" : ""
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent" />
      <div className="font-display text-sm font-extrabold text-white">{data.label}</div>
      {data.sub && <div className="mt-0.5 text-[10px] text-white/70">{data.sub}</div>}
      <Handle type="source" position={Position.Bottom} className="!bg-accent" />
    </div>
  );
}

function IndustryNode({ data, selected }: NodeProps<FlowNode>) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-center shadow-card transition-all ${
        selected ? "border-accent ring-2 ring-accent/30" : "border-line bg-mist"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent" />
      <div className="font-display text-xs font-bold text-ink">{data.label}</div>
      {data.sub && <div className="mt-0.5 text-[10px] text-ink/50">{data.sub}</div>}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  source: SourceNode,
  hub: HubNode,
  industry: IndustryNode,
};

const INITIAL_NODES: FlowNode[] = [
  { id: "s1", type: "source", position: { x: 0, y: 0 }, data: { label: "Korea", sub: "PVC resin" } },
  { id: "s2", type: "source", position: { x: 140, y: 0 }, data: { label: "Taiwan", sub: "PET resin" } },
  { id: "s3", type: "source", position: { x: 280, y: 0 }, data: { label: "Middle East", sub: "PET / PVC" } },
  { id: "s4", type: "source", position: { x: 420, y: 0 }, data: { label: "S.E. Asia", sub: "PVC / fillers" } },
  { id: "s5", type: "source", position: { x: 560, y: 0 }, data: { label: "Europe", sub: "Speciality" } },
  { id: "hub", type: "hub", position: { x: 230, y: 150 }, data: { label: "Oasis Impex", sub: "Ahmedabad · India" } },
  { id: "i1", type: "industry", position: { x: 40, y: 300 }, data: { label: "Pipe manufacturers", sub: "PVC rigid pipes" } },
  { id: "i2", type: "industry", position: { x: 220, y: 300 }, data: { label: "Water bottling", sub: "PET bottles" } },
  { id: "i3", type: "industry", position: { x: 400, y: 300 }, data: { label: "Compounders", sub: "Regrind · fillers" } },
];

const INITIAL_EDGES: Edge[] = [
  ...["s1", "s2", "s3", "s4", "s5"].map((s) => ({
    id: `e-${s}`,
    source: s,
    target: "hub",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#1c6fe8", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#1c6fe8" },
  })),
  ...["i1", "i2", "i3"].map((i) => ({
    id: `e-${i}`,
    source: "hub",
    target: i,
    type: "smoothstep",
    animated: true,
    style: { stroke: "#e8a33d", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#e8a33d" },
  })),
];

export function SupplyChainFlow() {
  const nodes = useMemo(() => INITIAL_NODES, []);
  const edges = useMemo(() => INITIAL_EDGES, []);

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-line bg-white shadow-card sm:h-[460px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.5}
        maxZoom={1.6}
        proOptions={{ hideAttribution: false }}
        nodesConnectable={false}
        elementsSelectable
        onNodeDragStop={useCallback(() => undefined, [])}
        className="bg-mist/40"
      >
        <Background color="#cbd5e1" gap={24} size={1} />
        <Controls position="bottom-left" showInteractive={false} className="!shadow-card !rounded-lg !border !border-line" />
      </ReactFlow>
    </div>
  );
}
