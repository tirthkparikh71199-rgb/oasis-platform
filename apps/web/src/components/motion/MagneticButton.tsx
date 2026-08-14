"use client";

import { useRef, type ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

/**
 * Magnetic hover effect for CTAs — fine-pointer only.
 * Touch devices simply render a normal button (no effect, no interference).
 */
export function MagneticButton({ children, className, strength = 0.32 }: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
  }

  function onLeave() {
    const el = ref.current;
    if (el) el.style.transform = "translate3d(0, 0, 0)";
  }

  return (
    <span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ display: "inline-block", willChange: "transform", transition: "transform 240ms cubic-bezier(0.22,1,0.36,1)" }}>
      {children}
    </span>
  );
}
