"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  { icon: "📞", title: "Inquiry", desc: "Tell us what you need" },
  { icon: "📦", title: "Quote", desc: "We send best price" },
  { icon: "🏭", title: "Production", desc: "Quality checked" },
  { icon: "🚢", title: "Delivery", desc: "Pan-India shipping" },
];

export function HowItWorksAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Progress bar */}
      <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-brand/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand to-brand-3 transition-all duration-1000 ease-out"
          style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Animated ship */}
      <div
        className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10"
        style={{ left: `${((activeStep + 0.5) / steps.length) * 100}%` }}
      >
        <div className="text-4xl">🚢</div>
      </div>

      {/* Steps */}
      <div className="relative grid grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div key={i} className={`text-center transition-all duration-500 ${i <= activeStep ? "opacity-100 scale-100" : "opacity-40 scale-95"}`}>
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl transition-all duration-500 ${i === activeStep ? "bg-brand text-white shadow-lg shadow-brand/30" : "bg-brand/10"}`}>
              {step.icon}
            </div>
            <h3 className="mt-3 font-bold text-ink">{step.title}</h3>
            <p className="text-sm text-ink/60">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeliveryTruckAnimation() {
  const [position, setPosition] = useState(-100);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => (prev >= 110 ? -100 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-20 overflow-hidden rounded-2xl bg-gradient-to-r from-brand/5 to-brand/10">
      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-ink/10" />
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink/20" style={{ backgroundSize: "40px 2px", backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 30px)" }} />

      {/* Truck */}
      <div
        className="absolute bottom-2 transition-all duration-100"
        style={{ left: `${position}%` }}
      >
        <div className="text-3xl">🚛</div>
      </div>

      {/* Container */}
      <div
        className="absolute bottom-6 transition-all duration-100"
        style={{ left: `${position - 5}%` }}
      >
        <div className="rounded-lg bg-brand/20 px-3 py-1 text-xs font-bold text-brand">OASIS</div>
      </div>
    </div>
  );
}

export function ShipSailingAnimation() {
  const [waves, setWaves] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaves((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-sky-200">
      {/* Waves */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 400 40" preserveAspectRatio="none">
        <path
          d={`M0,20 Q${50 + Math.sin(waves * 0.05) * 20},${10 + Math.sin(waves * 0.05) * 5} 100,20 T200,20 T300,20 T400,20 V40 H0 Z`}
          fill="rgba(59,130,246,0.3)"
        />
        <path
          d={`M0,25 Q${70 + Math.sin(waves * 0.03) * 15},${18 + Math.sin(waves * 0.03) * 3} 150,25 T300,25 T400,25 V40 H0 Z`}
          fill="rgba(59,130,246,0.2)"
        />
      </svg>

      {/* Ship */}
      <div
        className="absolute bottom-8 transition-all duration-100"
        style={{
          left: `${30 + Math.sin(waves * 0.02) * 10}%`,
          transform: `rotate(${Math.sin(waves * 0.05) * 2}deg)`,
        }}
      >
        <div className="text-4xl">🚢</div>
      </div>

      {/* Container on ship */}
      <div
        className="absolute bottom-14 transition-all duration-100"
        style={{
          left: `${28 + Math.sin(waves * 0.02) * 10}%`,
          transform: `rotate(${Math.sin(waves * 0.05) * 2}deg)`,
        }}
      >
        <div className="flex gap-1">
          <div className="h-4 w-6 rounded-sm bg-red-400" />
          <div className="h-4 w-6 rounded-sm bg-blue-400" />
          <div className="h-4 w-6 rounded-sm bg-green-400" />
        </div>
      </div>

      {/* Sun */}
      <div className="absolute right-8 top-4 text-3xl">☀️</div>

      {/* Clouds */}
      <div className="absolute left-4 top-6 text-2xl opacity-60">☁️</div>
      <div className="absolute left-1/3 top-2 text-xl opacity-40">☁️</div>
    </div>
  );
}
