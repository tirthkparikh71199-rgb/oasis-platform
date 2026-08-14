"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  { icon: "📞", title: "Inquiry", desc: "Tell us what you need" },
  { icon: "📝", title: "Quote", desc: "We send best price" },
  { icon: "🏭", title: "Production", desc: "Quality checked" },
  { icon: "🚚", title: "Delivery", desc: "Pan-India shipping" },
];

export function HowItWorksAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [inView]);

  // Progress runs along the centre of the icon row.
  const progress = steps.length > 1 ? activeStep / (steps.length - 1) : 0;

  return (
    <div ref={ref} className="relative pt-10">
      {/* Track + progress fill, aligned to the icon centres */}
      <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[calc(2.5rem+2rem)] h-1 -translate-y-1/2 rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-3"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Sailing marker rides the fill, sitting ON the line (never over an icon) */}
        <motion.div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ left: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="block text-xl drop-shadow"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            🚢
          </motion.span>
        </motion.div>
      </div>

      {/* Steps */}
      <div className="relative grid grid-cols-4 gap-4">
        {steps.map((step, i) => {
          const done = i <= activeStep;
          return (
            <div key={i} className="text-center">
              <motion.div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl transition-colors duration-500 ${
                  i === activeStep
                    ? "bg-brand text-white shadow-lg shadow-brand/40 ring-4 ring-brand/20"
                    : done
                      ? "bg-brand/30"
                      : "bg-white/5"
                }`}
                animate={{ scale: i === activeStep ? 1.08 : 1, opacity: done ? 1 : 0.5 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {step.icon}
              </motion.div>
              <h3 className={`mt-3 font-bold transition-colors ${done ? "text-white" : "text-white/40"}`}>{step.title}</h3>
              <p className={`text-sm transition-colors ${done ? "text-white/60" : "text-white/25"}`}>{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Cohesive sea scene — the ship and its cargo are ONE unit that sails smoothly
   across, bobbing on layered parallax waves. */
export function ShipSailingAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <div ref={ref} className="relative h-40 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-200 to-sky-400">
      {/* Sun + drifting clouds */}
      <div className="absolute right-8 top-5 h-9 w-9 rounded-full bg-yellow-300 shadow-[0_0_28px_8px_rgba(253,224,71,0.6)]" />
      <motion.div className="absolute top-6 h-3 w-12 rounded-full bg-white/70" animate={inView ? { x: ["-20%", "120%"] } : {}} transition={{ duration: 22, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute top-12 h-2.5 w-9 rounded-full bg-white/50" animate={inView ? { x: ["-30%", "130%"] } : {}} transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 4 }} />

      {/* The ship + cargo, moving together as one group */}
      <motion.div
        className="absolute bottom-9 left-0"
        animate={inView ? { x: ["-15%", "115%"] } : {}}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <motion.div animate={{ y: [0, -4, 0], rotate: [-1.5, 1.5, -1.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          {/* stacked cargo */}
          <div className="mb-0.5 ml-3 flex gap-0.5">
            <div className="h-3 w-5 rounded-sm bg-red-500" />
            <div className="h-3 w-5 rounded-sm bg-blue-500" />
            <div className="h-3 w-5 rounded-sm bg-emerald-500" />
          </div>
          {/* hull */}
          <div className="relative h-4 w-20 rounded-b-[10px] rounded-t-sm bg-slate-700">
            <div className="absolute inset-x-2 top-1 h-1 rounded bg-white/30" />
          </div>
        </motion.div>
      </motion.div>

      {/* Layered parallax waves */}
      <WaveLayer className="text-sky-500/40" duration={7} />
      <WaveLayer className="text-sky-600/50" duration={5} offset />
    </div>
  );
}

function WaveLayer({ className, duration, offset }: { className?: string; duration: number; offset?: boolean }) {
  return (
    <motion.svg
      className={`absolute bottom-0 left-0 h-10 w-[200%] ${className ?? ""}`}
      viewBox="0 0 800 40"
      preserveAspectRatio="none"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      style={{ bottom: offset ? -2 : 0 }}
    >
      <path d="M0 20 Q100 8 200 20 T400 20 T600 20 T800 20 V40 H0 Z" fill="currentColor" />
    </motion.svg>
  );
}

/* Delivery truck rolling on a dashed road — truck + container move as one. */
export function DeliveryTruckAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <div ref={ref} className="relative h-40 overflow-hidden rounded-2xl bg-gradient-to-b from-slate-100 to-slate-300">
      {/* sky strip + sun */}
      <div className="absolute right-8 top-5 h-8 w-8 rounded-full bg-amber-300 shadow-[0_0_24px_6px_rgba(252,211,77,0.5)]" />

      {/* road */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-slate-700" />
      <motion.div
        className="absolute bottom-[18px] left-0 h-1 w-[200%]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, #fbbf24 0 24px, transparent 24px 48px)" }}
        animate={inView ? { x: ["0%", "-50%"] } : {}}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />

      {/* truck as one group */}
      <motion.div
        className="absolute bottom-[26px] left-0 flex items-end"
        animate={inView ? { x: ["-20%", "120%"] } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <motion.div animate={{ y: [0, -1, 0] }} transition={{ duration: 0.4, repeat: Infinity }} className="flex items-end">
          {/* container */}
          <div className="flex h-8 w-16 items-center justify-center rounded-sm bg-brand text-[10px] font-bold tracking-wide text-white">OASIS</div>
          {/* cab */}
          <div className="ml-0.5 h-6 w-6 rounded-sm rounded-tr-md bg-slate-800" />
        </motion.div>
      </motion.div>
    </div>
  );
}
