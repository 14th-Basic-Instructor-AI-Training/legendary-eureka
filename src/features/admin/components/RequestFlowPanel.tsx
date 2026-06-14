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
import { useAdminStore } from "../store";
import { StatusChip } from "@/ui";
import type { AgencyRequest, EditRequest } from "../schema";

// ─── node data shape ────────────────────────────────────────────────────────

type RequestNodeData = {
  label: string;
  sublabel?: string;
  status?: string;
  kind: "requester" | "target";
} & Record<string, unknown>;

type RequestFlowNode = Node<RequestNodeData, "request">;

// ─── custom node ────────────────────────────────────────────────────────────

function RequestNodeComponent({ data }: NodeProps<RequestFlowNode>) {
  const isRequester = data.kind === "requester";
  return (
    <div
      className={[
        "rounded-xl border px-3 py-2.5 shadow-sm min-w-[148px] max-w-[148px]",
        isRequester
          ? "bg-bg-aliceblue border-primary/25"
          : "bg-white border-border",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <p className="text-[11px] font-semibold text-text-primary leading-tight truncate">
        {data.label}
      </p>
      {data.sublabel ? (
        <p className="text-[10px] text-text-secondary mt-0.5 truncate">{data.sublabel}</p>
      ) : null}
      {data.status ? (
        <div className="mt-1.5">
          <StatusChip status={data.status} />
        </div>
      ) : null}
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

// ─── graph builders ─────────────────────────────────────────────────────────

const LEFT_X = 10;
const RIGHT_X = 210;
const ROW_H = 100;
const START_Y = 20;

function buildAgencyGraph(requests: AgencyRequest[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  requests.forEach((r, i) => {
    const y = START_Y + i * ROW_H;
    nodes.push({
      id: `src-${r.id}`,
      type: "request",
      position: { x: LEFT_X, y },
      data: { label: r.applicantName, sublabel: r.country, kind: "requester" },
    });
    nodes.push({
      id: `tgt-${r.id}`,
      type: "request",
      position: { x: RIGHT_X, y },
      data: { label: r.agencyName, status: r.status, kind: "target" },
    });
    edges.push({
      id: `e-${r.id}`,
      source: `src-${r.id}`,
      target: `tgt-${r.id}`,
      type: "smoothstep",
      animated: r.status === "pending",
      style: {
        stroke: EDGE_COLOR[r.status] ?? "#94a3b8",
        strokeWidth: 2,
      },
    });
  });

  return { nodes, edges };
}

function buildEditGraph(requests: EditRequest[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  requests.forEach((r, i) => {
    const y = START_Y + i * ROW_H;
    nodes.push({
      id: `esrc-${r.id}`,
      type: "request",
      position: { x: LEFT_X, y },
      data: { label: r.agencyName, sublabel: "Agency", kind: "requester" },
    });
    nodes.push({
      id: `etgt-${r.id}`,
      type: "request",
      position: { x: RIGHT_X, y },
      data: { label: r.activityTitle, sublabel: r.submittedAtLabel, status: r.status, kind: "target" },
    });
    edges.push({
      id: `ee-${r.id}`,
      source: `esrc-${r.id}`,
      target: `etgt-${r.id}`,
      type: "smoothstep",
      animated: r.status === "pending",
      style: {
        stroke: EDGE_COLOR[r.status] ?? "#94a3b8",
        strokeWidth: 2,
      },
    });
  });

  return { nodes, edges };
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
    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 rounded-lg border border-border bg-white/90 px-2.5 py-1.5 shadow-primary backdrop-blur-sm">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[10px] text-text-secondary">
          <span
            className="inline-block h-0.5 w-5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ─── panel ──────────────────────────────────────────────────────────────────

const PANEL_HEIGHT = 680;
const HEADER_H = 61;

export function RequestFlowPanel({ tab }: { tab: "agencies" | "editRequests" }) {
  const { t } = useTranslation();
  const agencyRequests = useAdminStore((s) => s.agencyRequests);
  const editRequests = useAdminStore((s) => s.editRequests);

  const { nodes, edges } = useMemo(
    () =>
      tab === "agencies"
        ? buildAgencyGraph(agencyRequests)
        : buildEditGraph(editRequests),
    [tab, agencyRequests, editRequests],
  );

  const title =
    tab === "agencies"
      ? t("admin.requests.flow.agencyTitle")
      : t("admin.requests.flow.editTitle");
  const subtitle =
    tab === "agencies"
      ? t("admin.requests.flow.agencySub")
      : t("admin.requests.flow.editSub");

  return (
    <div
      className="bg-surface border-border flex flex-col overflow-hidden rounded-2xl border shadow-primary"
      style={{ height: PANEL_HEIGHT }}
    >
      {/* header */}
      <div className="shrink-0 border-b border-border px-4 py-3.5" style={{ height: HEADER_H }}>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>
      </div>

      {/* canvas */}
      <div className="relative flex-1" style={{ height: PANEL_HEIGHT - HEADER_H }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnScroll
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1}
            color="#e2e8f0"
          />
          <Controls showInteractive={false} position="top-right" />
        </ReactFlow>
        <Legend />
      </div>
    </div>
  );
}
