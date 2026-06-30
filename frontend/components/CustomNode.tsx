import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type CareerNodeData = {
  label: string;
  relation: "target" | "bridge" | "adjacent" | "aspiration";
};

const RELATION_STYLES: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
  target: {
    bg: "bg-emerald-50",
    border: "border-emerald-500 border-2",
    badge: "bg-emerald-500",
    badgeText: "text-white",
  },
  bridge: {
    bg: "bg-blue-50",
    border: "border-blue-400 border-2 border-dashed",
    badge: "bg-blue-500",
    badgeText: "text-white",
  },
  adjacent: {
    bg: "bg-amber-50",
    border: "border-amber-400 border-2",
    badge: "bg-amber-500",
    badgeText: "text-white",
  },
  aspiration: {
    bg: "bg-purple-50",
    border: "border-purple-400 border-2",
    badge: "bg-purple-500",
    badgeText: "text-white",
  },
};

const RELATION_LABELS: Record<string, string> = {
  target: "Utama",
  bridge: "Batu Loncat",
  adjacent: "Terdekat",
  aspiration: "Aspirasi",
};

function CustomNode({ data }: { data: CareerNodeData }) {
  const style = RELATION_STYLES[data.relation] || RELATION_STYLES.adjacent;

  return (
    <div className={`px-4 py-3 rounded-2xl shadow-sm min-w-[140px] ${style.bg} ${style.border}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-ink/40 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-ink/40 !border-0" />

      <div className="text-center">
        <p className="font-bold text-ink text-sm leading-tight">{data.label}</p>
        <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge} ${style.badgeText}`}>
          {RELATION_LABELS[data.relation]}
        </span>
      </div>
    </div>
  );
}

export default memo(CustomNode);
