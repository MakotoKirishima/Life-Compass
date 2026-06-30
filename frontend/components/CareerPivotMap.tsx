import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode, { type CareerNodeData } from "./CustomNode";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

export interface CareerRelationships {
  targetCareer: { id: string; name: string };
  adjacentCareers: { id: string; name: string }[];
  bridgeCareers: { id: string; name: string }[];
  aspirationCareers: { id: string; name: string }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NODE_TYPES: any = { careerNode: CustomNode };

const SPACING_X = 280;
const SPACING_Y = 140;

function buildGraph(data: CareerRelationships): { nodes: Node<CareerNodeData>[]; edges: Edge[] } {
  const nodes: Node<CareerNodeData>[] = [];
  const edges: Edge[] = [];
  const targetId = `target-${data.targetCareer.id}`;

  // Center: target career
  nodes.push({
    id: targetId,
    type: "careerNode",
    position: { x: 400, y: 250 },
    data: { label: data.targetCareer.name, relation: "target" },
    draggable: true,
  });

  // Left: bridge careers (dashed edges toward target)
  data.bridgeCareers.forEach((c, i) => {
    const id = `bridge-${c.id}`;
    const total = data.bridgeCareers.length;
    const yOffset = total > 1 ? (i - (total - 1) / 2) * SPACING_Y : 0;
    nodes.push({
      id,
      type: "careerNode",
      position: { x: 80, y: 250 + yOffset },
      data: { label: c.name, relation: "bridge" },
      draggable: true,
    });
    edges.push({
      id: `e-bridge-${c.id}`,
      source: id,
      target: targetId,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#3b82f6", strokeWidth: 2, strokeDasharray: "6 3" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
    });
  });

  // Top/Bottom: adjacent careers (thin solid edges)
  data.adjacentCareers.forEach((c, i) => {
    const id = `adj-${c.id}`;
    const isTop = i % 2 === 0;
    const row = Math.floor(i / 2);
    const yPos = isTop ? 80 - row * SPACING_Y : 380 + row * SPACING_Y;
    nodes.push({
      id,
      type: "careerNode",
      position: { x: 300 + (i % 2) * 80, y: yPos },
      data: { label: c.name, relation: "adjacent" },
      draggable: true,
    });
    edges.push({
      id: `e-adj-${c.id}`,
      source: targetId,
      target: id,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#f59e0b", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
    });
  });

  // Right: aspiration careers (edges from target)
  data.aspirationCareers.forEach((c, i) => {
    const id = `asp-${c.id}`;
    const total = data.aspirationCareers.length;
    const yOffset = total > 1 ? (i - (total - 1) / 2) * SPACING_Y : 0;
    nodes.push({
      id,
      type: "careerNode",
      position: { x: 700, y: 250 + yOffset },
      data: { label: c.name, relation: "aspiration" },
      draggable: true,
    });
    edges.push({
      id: `e-asp-${c.id}`,
      source: targetId,
      target: id,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#a855f7", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" },
    });
  });

  return { nodes, edges };
}

interface CareerPivotMapProps {
  relationships: CareerRelationships;
}

export default function CareerPivotMap({ relationships }: CareerPivotMapProps) {
  const initial = useMemo(() => buildGraph(relationships), [relationships]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, , onEdgesChange] = useEdgesState(initial.edges);

  const nodeCount = nodes.length;
  const hasBridge = relationships.bridgeCareers.length > 0;
  const hasAdjacent = relationships.adjacentCareers.length > 0;
  const hasAspiration = relationships.aspirationCareers.length > 0;

  return (
    <Card padding="md" className="border-2 border-ink/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-ink">Peta Karir</h3>
        <div className="flex items-center gap-2 text-xs">
          {hasBridge && <Badge variant="blue">Batu Loncat</Badge>}
          {hasAdjacent && <Badge variant="amber">Terdekat</Badge>}
          {hasAspiration && <Badge variant="purple">Aspirasi</Badge>}
        </div>
      </div>

      <p className="text-xs text-ink/50 mb-4">
        Visualisasi relasi antar karir. Drag untuk memindahkan node. Scroll untuk zoom.
        {nodeCount > 1 && ` (${nodeCount} karir terkait)`}
      </p>

      <div className="h-[420px] w-full border-2 border-ink/10 rounded-xl overflow-hidden bg-warm">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.4}
          maxZoom={2}
          attributionPosition="bottom-left"
          defaultEdgeOptions={{
            style: { strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
        >
          <Background color="#e5e7eb" gap={20} size={1} />
          <Controls showInteractive={false} className="!border-ink/20 !rounded-lg" />
          <MiniMap
            nodeStrokeColor="#1a1a1a"
            nodeColor={(n) => {
              switch ((n.data as CareerNodeData)?.relation) {
                case "target": return "#10b981";
                case "bridge": return "#3b82f6";
                case "adjacent": return "#f59e0b";
                case "aspiration": return "#a855f7";
                default: return "#d1d5db";
              }
            }}
            maskColor="rgba(0,0,0,0.1)"
            className="!border-ink/10 !rounded-lg"
          />
        </ReactFlow>
      </div>
    </Card>
  );
}
