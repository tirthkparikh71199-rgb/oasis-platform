"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Realistic, self-contained SVG logistics scene for Oasis Impex — a branded
 * cargo ship sailing past a port warehouse while a delivery truck rolls out.
 * All vector art (no external images), animated with framer-motion so it works
 * offline and under the site's strict CSP.
 */
export function LogisticsScene() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: false });

  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
      <svg viewBox="0 0 1200 500" className="h-auto w-full" role="img" aria-label="Oasis Impex logistics: cargo ship, port warehouse and delivery truck">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bfe3ff" />
            <stop offset="0.55" stopColor="#e8f4ff" />
            <stop offset="1" stopColor="#f4fbff" />
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b7fd4" />
            <stop offset="1" stopColor="#155fa8" />
          </linearGradient>
          <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c0392b" />
            <stop offset="1" stopColor="#8e281d" />
          </linearGradient>
          <linearGradient id="warehouse" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f1f5f9" />
            <stop offset="1" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="1200" height="360" fill="url(#sky)" />
        {/* Sun */}
        <circle cx="1050" cy="90" r="42" fill="#ffe08a" />
        <circle cx="1050" cy="90" r="42" fill="#ffd45e" opacity="0.5" />

        {/* Drifting clouds */}
        <motion.g animate={inView ? { x: [0, 60, 0] } : {}} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} fill="#ffffff" opacity="0.9">
          <ellipse cx="240" cy="80" rx="46" ry="20" />
          <ellipse cx="290" cy="72" rx="34" ry="18" />
          <ellipse cx="200" cy="72" rx="30" ry="16" />
        </motion.g>
        <motion.g animate={inView ? { x: [0, -50, 0] } : {}} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }} fill="#ffffff" opacity="0.75">
          <ellipse cx="720" cy="110" rx="40" ry="17" />
          <ellipse cx="760" cy="104" rx="28" ry="14" />
        </motion.g>

        {/* ---- Port / warehouse on the left shore ---- */}
        <g>
          {/* dock */}
          <rect x="0" y="330" width="360" height="40" fill="#9aa6b2" />
          <rect x="0" y="330" width="360" height="8" fill="#b6c0cc" />
          {/* warehouse building */}
          <rect x="40" y="210" width="230" height="120" fill="url(#warehouse)" stroke="#94a3b8" strokeWidth="2" />
          {/* roof */}
          <polygon points="30,210 155,168 280,210" fill="#64748b" />
          {/* roller doors */}
          <rect x="60" y="250" width="60" height="80" fill="#475569" />
          <rect x="140" y="250" width="60" height="80" fill="#475569" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1="60" x2="120" y1={260 + i * 15} y2={260 + i * 15} stroke="#334155" strokeWidth="2" />
          ))}
          {/* Oasis Impex sign */}
          <rect x="150" y="180" width="110" height="24" rx="4" fill="#0e355e" />
          <text x="205" y="197" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">OASIS IMPEX</text>
          {/* stacked white calcium carbonate bags on the dock */}
          <g>
            {[
              [300, 300], [326, 300], [352, 300],
              [312, 282], [338, 282],
              [325, 264],
            ].map(([x, y], i) => (
              <g key={i}>
                <rect x={x} y={y} width="24" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <rect x={x + 3} y={y + 6} width="18" height="6" rx="1" fill="#0e355e" opacity="0.85" />
              </g>
            ))}
          </g>
        </g>

        {/* Sea */}
        <rect y="360" width="1200" height="140" fill="url(#sea)" />

        {/* ---- Cargo ship sailing across ---- */}
        <motion.g
          initial={{ x: -260 }}
          animate={inView ? { x: [-260, 1260] } : { x: -260 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        >
          <motion.g animate={{ y: [0, -6, 0], rotate: [-0.6, 0.6, -0.6] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            {/* hull */}
            <path d="M120 372 h300 l-30 46 h-240 z" fill="url(#hull)" stroke="#6f1f16" strokeWidth="2" />
            <rect x="120" y="366" width="300" height="8" fill="#e2e8f0" />
            {/* deck house */}
            <rect x="360" y="330" width="46" height="38" fill="#ecf0f3" stroke="#b6c0cc" />
            <rect x="368" y="338" width="8" height="8" fill="#3b82f6" />
            <rect x="382" y="338" width="8" height="8" fill="#3b82f6" />
            <rect x="396" y="322" width="6" height="10" fill="#c0392b" />
            {/* stacked containers with Oasis labels */}
            {[
              ["#c0392b", 150], ["#2563eb", 196], ["#059669", 242], ["#eab308", 288],
            ].map(([c, x], i) => (
              <g key={i}>
                <rect x={x as number} y={338} width="42" height="28" rx="2" fill={c as string} stroke="#00000022" />
                <rect x={(x as number) + 6} y={347} width="30" height="8" rx="1" fill="#ffffff" opacity="0.9" />
              </g>
            ))}
            {[
              ["#2563eb", 172], ["#059669", 218], ["#c0392b", 264],
            ].map(([c, x], i) => (
              <rect key={`t${i}`} x={x as number} y={312} width="42" height="26" rx="2" fill={c as string} stroke="#00000022" />
            ))}
          </motion.g>
        </motion.g>

        {/* Animated wave crests over the sea */}
        <motion.g animate={inView ? { x: [0, -80, 0] } : {}} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" fill="none">
          <path d="M-40 420 q40 -14 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" />
          <path d="M-40 452 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" strokeOpacity="0.2" />
        </motion.g>

        {/* ---- Delivery truck rolling along the dock road ---- */}
        <motion.g
          initial={{ x: 380 }}
          animate={inView ? { x: [380, 1220] } : { x: 380 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        >
          <motion.g animate={{ y: [0, -1, 0] }} transition={{ duration: 0.25, repeat: Infinity }}>
            {/* container box with Oasis branding */}
            <rect x="0" y="300" width="96" height="42" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="0" y="300" width="96" height="14" fill="#0e355e" />
            <text x="48" y="311" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">OASIS IMPEX</text>
            <text x="48" y="333" textAnchor="middle" fill="#0e355e" fontSize="8" fontWeight="600" fontFamily="system-ui, sans-serif">Polymer Raw Materials</text>
            {/* cab */}
            <path d="M96 312 h30 l14 16 v14 h-44 z" fill="#c0392b" />
            <rect x="104" y="316" width="18" height="12" rx="2" fill="#bfe3ff" />
          </motion.g>
          {/* wheels (spin) */}
          {[26, 70, 116].map((cx, i) => (
            <g key={i}>
              <circle cx={cx} cy="346" r="9" fill="#1f2937" />
              <motion.circle cx={cx} cy="346" r="4" fill="#6b7280" animate={inView ? { rotate: 360 } : {}} transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
            </g>
          ))}
        </motion.g>

        {/* road surface on the dock */}
        <rect x="360" y="352" width="840" height="10" fill="#334155" />
      </svg>
    </div>
  );
}
