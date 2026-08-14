"use client";

import { useEffect, useRef, useState } from "react";

export function TradeRouteAnimation() {
  const [activeRoute, setActiveRoute] = useState(0);
  const routes = [
    { from: "Southeast Asia", to: "Mundra Port", type: "sea", icon: "🚢", distance: "4,500 km" },
    { from: "Mundra Port", to: "Ahmedabad", type: "road", icon: "🚛", distance: "350 km" },
    { from: "Ahmedabad", to: "Pan-India", type: "road", icon: "🚛", distance: "All India" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRoute((prev) => (prev + 1) % routes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl border border-line bg-gradient-to-br from-white to-mist p-6 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      <h3 className="text-lg font-bold text-ink relative z-10">Our Supply Chain</h3>
      <p className="text-sm text-ink/60 relative z-10">From global producers to your factory floor</p>

      {/* Route visualization */}
      <div className="mt-6 relative z-10">
        {routes.map((route, i) => (
          <div key={i} className={`flex items-center gap-4 rounded-xl p-4 transition-all duration-500 ${i === activeRoute ? "bg-brand/10 border border-brand/30 scale-[1.02]" : "opacity-60"}`}>
            {/* From */}
            <div className="flex-1 text-right">
              <p className="text-sm font-bold text-ink">{route.from}</p>
              <p className="text-xs text-ink/50">{route.distance}</p>
            </div>

            {/* Arrow/Icon */}
            <div className="flex flex-col items-center gap-1">
              <div className={`text-2xl transition-all duration-500 ${i === activeRoute ? "scale-125" : ""}`}>
                {route.icon}
              </div>
              <div className={`h-0.5 w-16 rounded-full transition-all duration-500 ${i === activeRoute ? "bg-brand" : "bg-ink/20"}`} />
              <div className={`text-xs font-medium ${i === activeRoute ? "text-brand" : "text-ink/40"}`}>
                {i === activeRoute ? "● Active" : ""}
              </div>
            </div>

            {/* To */}
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">{route.to}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Animated dots */}
      <div className="absolute top-4 right-4 flex gap-1">
        {routes.map((_, i) => (
          <div key={i} className={`h-2 w-2 rounded-full transition-all duration-300 ${i === activeRoute ? "bg-brand scale-125" : "bg-ink/20"}`} />
        ))}
      </div>
    </div>
  );
}

export function ContainerAnimation() {
  const [stage, setStage] = useState(0);
  const stages = ["Loading", "In Transit", "At Port", "Delivered"];
  const icons = ["📦", "🚢", "🏗️", "✅"];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl border border-line bg-gradient-to-br from-white to-mist p-6 overflow-hidden">
      <h3 className="text-lg font-bold text-ink relative z-10">Container Journey</h3>
      <p className="text-sm text-ink/60 relative z-10">Track your shipment in real-time</p>

      <div className="mt-6 flex items-center justify-between relative z-10">
        {stages.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl transition-all duration-500 ${i <= stage ? "bg-brand text-white shadow-lg shadow-brand/30" : "bg-ink/5 text-ink/30"}`}>
              {icons[i]}
            </div>
            <p className={`text-xs font-medium text-center transition-all duration-500 ${i <= stage ? "text-ink" : "text-ink/30"}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 bg-ink/5 rounded-full overflow-hidden">
        <div className="h-full bg-brand transition-all duration-1000 ease-out rounded-full" style={{ width: `${((stage + 1) / stages.length) * 100}%` }} />
      </div>
    </div>
  );
}

export function ManufacturingAnimation() {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: "🔬", title: "Quality Testing", desc: "Lab verified grades" },
    { icon: "🏭", title: "Packaging", desc: "25kg bags / jumbo" },
    { icon: "📋", title: "Documentation", desc: "BIS, ISI, CoA" },
    { icon: "🚛", title: "Dispatch", desc: "Pan-India logistics" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl border border-line bg-gradient-to-br from-white to-mist p-6 overflow-hidden">
      <h3 className="text-lg font-bold text-ink relative z-10">Our Process</h3>
      <p className="text-sm text-ink/60 relative z-10">From quality check to delivery</p>

      <div className="mt-6 space-y-3 relative z-10">
        {steps.map((s, i) => (
          <div key={i} className={`flex items-center gap-4 rounded-xl p-3 transition-all duration-500 ${i === step ? "bg-brand/10 border border-brand/30" : "opacity-50"}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl transition-all duration-500 ${i === step ? "bg-brand text-white" : "bg-ink/5"}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{s.title}</p>
              <p className="text-xs text-ink/50">{s.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`ml-auto h-8 w-0.5 rounded-full transition-all duration-500 ${i < step ? "bg-brand" : "bg-ink/10"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
