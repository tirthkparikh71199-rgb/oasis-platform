"use client";

import { motion } from "framer-motion";

interface Node {
  id: string;
  x: number;
  y: number;
  r: number;
  label?: string;
  origin?: boolean;
}

interface Edge {
  from: string;
  to: string;
}

const NODES: Node[] = [
  { id: "in", x: 460, y: 300, r: 9, label: "India" },
  { id: "sea", x: 250, y: 240, r: 6, label: "SE Asia" },
  { id: "kr", x: 350, y: 190, r: 5, label: "Korea" },
  { id: "cn", x: 400, y: 170, r: 5, label: "China" },
  { id: "eu", x: 150, y: 130, r: 6, label: "Europe" },
  { id: "me", x: 310, y: 330, r: 5, label: "M.East" },
  { id: "us", x: 120, y: 290, r: 5, label: "N.America" },
  { id: "af", x: 280, y: 410, r: 4, label: "Africa" },
];

const EDGES: Edge[] = [
  { from: "eu", to: "in" },
  { from: "sea", to: "in" },
  { from: "kr", to: "in" },
  { from: "cn", to: "in" },
  { from: "me", to: "in" },
  { from: "us", to: "in" },
  { from: "af", to: "in" },
  { from: "sea", to: "kr" },
];

const byId = new Map(NODES.map((n) => [n.id, n]));

export function TradeRoutes() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <svg viewBox="0 0 560 460" className="h-full w-full opacity-90" fill="none">
        <defs>
          <radialGradient id="orb-in" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1c6fe8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1c6fe8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="edge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e8a33d" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#e8a33d" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* central glow */}
        <circle cx={byId.get("in")!.x} cy={byId.get("in")!.y} r={90} fill="url(#orb-in)" className="animate-orb" />

        {/* edges */}
        {EDGES.map((e) => {
          const a = byId.get(e.from)!;
          const b = byId.get(e.to)!;
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2 - 34;
          return (
            <motion.g key={`${e.from}-${e.to}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}>
              <path
                d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`}
                stroke="url(#edge-grad)"
                strokeWidth="1.2"
                strokeLinecap="round"
                className="route-line"
              />
            </motion.g>
          );
        })}

        {/* nodes */}
        {NODES.map((n, i) => {
          const isOrigin = n.id === "in";
          return (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.08 }}
            >
              {isOrigin && (
                <circle cx={n.x} cy={n.y} r={n.r + 6} fill="#e8a33d" opacity={0.25} className="pulse-ring" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
              )}
              <circle cx={n.x} cy={n.y} r={isOrigin ? n.r + 3 : n.r} fill={isOrigin ? "#e8a33d" : "#1c6fe8"} stroke="#fff" strokeOpacity="0.5" strokeWidth="1" />
              {n.label && (
                <text x={n.x} y={n.y + (isOrigin ? 30 : 24)} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.55)" fontFamily="var(--font-inter)">
                  {n.label}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
