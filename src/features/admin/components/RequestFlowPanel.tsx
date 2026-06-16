"use client";

import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
} from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { Buildings } from "iconsax-reactjs";
import { StatusChip } from "@/ui";
import { formatDate } from "@/lib/format";

/**
 * A single reviewable item plotted on the flow (an agency request, a tour package
 * submission, or a destination submission). `status` is the backend enum
 * ("PENDING" | "APPROVED" | "REJECTED"); `createdAt` drives the day grouping.
 */
export type FlowItem = {
  id: string;
  title: string;
  sub?: string;
  status: string;
  createdAt: string;
};

// ─── node data shape ────────────────────────────────────────────────────────

type RequestNodeData = {
  label: string;
  sublabel?: string;
  status?: string;
  count?: number;
  kind: "day" | "item";
} & Record<string, unknown>;

type RequestFlowNode = Node<RequestNodeData, "request">;

// ─── custom node ────────────────────────────────────────────────────────────

function RequestNodeComponent({ data }: NodeProps<RequestFlowNode>) {
  const isDay = data.kind === "day";
  return (
    <div
      className={[
        "rounded-xl border px-3 py-2.5 shadow-sm min-w-[160px] max-w-[160px]",
        isDay ? "bg-bg-aliceblue border-primary/30" : "bg-white border-border",
      ].join(" ")}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: "none" }} />

      {isDay ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-primary text-[11px] font-bold leading-tight">{data.label}</p>
          {typeof data.count === "number" ? (
            <span className="bg-primary/10 text-primary inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold">
              {data.count}
            </span>
          ) : null}
        </div>
      ) : (
        <>
          <p className="text-text-primary truncate text-[11px] font-semibold leading-tight">
            {data.label}
          </p>
          {data.sublabel ? (
            <p className="text-text-secondary mt-0.5 truncate text-[10px]">{data.sublabel}</p>
          ) : null}
          {data.status ? (
            <div className="mt-1.5">
              <StatusChip status={data.status} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

const NODE_TYPES: NodeTypes = { request: RequestNodeComponent };

// ─── edge colours ───────────────────────────────────────────────────────────

const EDGE_COLOR: Record<string, string> = {
  pending: "#FFCD38",
  approved: "#5FC381",
  rejected: "#FF0C3C",
};

// ─── graph builder (grouped by submission day) ────────────────────────────────

const LEFT_X = 10;
const RIGHT_X = 230;
const ROW_H = 96;
const START_Y = 20;
const GROUP_GAP = 28;

/** Lowercased backend status, used for edge color + StatusChip. */
const lower = (s: string) => s.toLowerCase();

/**
 * Lay items out as a timeline: one "day" node per calendar day (most recent
 * first), fanning out to one node per item submitted that day. Edge colour +
 * animation reflect each item's approval status.
 */
function buildByDayGraph(
  items: FlowItem[],
  lng: string,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Group by calendar day.
  const groups = new Map<string, FlowItem[]>();
  for (const it of items) {
    const key = new Date(it.createdAt).toDateString();
    const bucket = groups.get(key);
    if (bucket) bucket.push(it);
    else groups.set(key, [it]);
  }

  const days = [...groups.keys()].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  let y = START_Y;
  days.forEach((day, di) => {
    const dayItems = groups.get(day)!;
    const groupHeight = dayItems.length * ROW_H;
    const dayNodeY = y + (groupHeight - ROW_H) / 2;
    const dayId = `day-${di}`;

    nodes.push({
      id: dayId,
      type: "request",
      position: { x: LEFT_X, y: dayNodeY },
      data: { kind: "day", label: formatDate(day, lng), count: dayItems.length },
    });

    dayItems.forEach((it, j) => {
      const status = lower(it.status);
      nodes.push({
        id: `item-${it.id}`,
        type: "request",
        position: { x: RIGHT_X, y: y + j * ROW_H },
        data: { kind: "item", label: it.title, sublabel: it.sub, status },
      });
      edges.push({
        id: `e-${it.id}`,
        source: dayId,
        target: `item-${it.id}`,
        type: "smoothstep",
        animated: status === "pending",
        style: { stroke: EDGE_COLOR[status] ?? "#94a3b8", strokeWidth: 2 },
      });
    });

    y += groupHeight + GROUP_GAP;
  });

  return { nodes, edges };
}

// ─── stats strip ──────────────────────────────────────────────────────────────

function StatsStrip({ items }: { items: FlowItem[] }) {
  const { t } = useTranslation();
  const total = items.length;
  const pending = items.filter((i) => i.status === "PENDING").length;
  const approved = items.filter((i) => i.status === "APPROVED").length;
  const rejected = items.filter((i) => i.status === "REJECTED").length;
  const decided = approved + rejected;
  const approvalRate = decided > 0 ? Math.round((approved / decided) * 100) : 0;

  const tiles: Array<{ label: string; value: string; tone?: string }> = [
    { label: t("admin.requests.flow.total"), value: String(total) },
    { label: t("status.pending"), value: String(pending), tone: "text-warning" },
    { label: t("status.approved"), value: String(approved), tone: "text-green" },
    { label: t("status.rejected"), value: String(rejected), tone: "text-red" },
    { label: t("admin.requests.flow.approvalRate"), value: `${approvalRate}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="border-border bg-bg-ghostwhite flex flex-col gap-0.5 rounded-xl border px-3 py-2"
        >
          <span className="text-muted text-[11px]">{tile.label}</span>
          <span className={["text-lg font-bold tracking-tight", tile.tone ?? "text-primary"].join(" ")}>
            {tile.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── legend ─────────────────────────────────────────────────────────────────

function Legend() {
  const { t } = useTranslation();
  const items = [
    { color: EDGE_COLOR.pending, label: t("status.pending") },
    { color: EDGE_COLOR.approved, label: t("status.approved") },
    { color: EDGE_COLOR.rejected, label: t("status.rejected") },
  ];
  return (
    <div className="border-border absolute bottom-3 left-3 z-10 flex items-center gap-3 rounded-lg border bg-white/90 px-2.5 py-1.5 shadow-primary backdrop-blur-sm">
      {items.map((item) => (
        <span key={item.label} className="text-text-secondary flex items-center gap-1.5 text-[10px]">
          <span className="inline-block h-0.5 w-5 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ─── panel ──────────────────────────────────────────────────────────────────

export function RequestFlowPanel({
  items,
  title,
  subtitle,
}: {
  items: FlowItem[];
  title: string;
  subtitle: string;
}) {
  const { t, i18n } = useTranslation();

  const { nodes, edges } = useMemo(
    () => buildByDayGraph(items, i18n.language),
    [items, i18n.language],
  );

  return (
    <div className="bg-surface border-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-primary">
      {/* header + stats */}
      <div className="border-border shrink-0 border-b px-4 py-3.5">
        <p className="text-text-primary text-sm font-semibold">{title}</p>
        <p className="text-text-secondary mt-0.5 text-xs">{subtitle}</p>
        <div className="mt-3">
          <StatsStrip items={items} />
        </div>
      </div>

      {/* canvas */}
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-14 text-center">
          <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Buildings size={22} color="currentColor" className="text-muted" />
          </span>
          <p className="text-muted text-sm">{t("admin.requests.empty")}</p>
        </div>
      ) : (
        <div className="relative min-h-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnScroll
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#e2e8f0" />
            <Controls showInteractive={false} position="top-right" />
          </ReactFlow>
          <Legend />
        </div>
      )}
    </div>
  );
}
