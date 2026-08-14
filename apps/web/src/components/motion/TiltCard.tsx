"use client";

import { useRef, useState, type ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

/**
 * Subtle 3D tilt on fine-pointer devices only.
 * On touch devices (phone/tablet) the card stays static — no parallax,
 * no perspective traps, full tap reliability. Honour reduced motion.
 */
export function TiltCard({ children, className, maxTilt = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(900px) rotateX(${-py * maxTilt}deg) rotateY(${px * maxTilt}deg) translateY(-2px)`);
  }

  function onLeave() {
    setTransform("");
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transform, transition: transform ? "transform 80ms ease-out" : "transform 400ms cubic-bezier(0.22,1,0.36,1)" }}
    >
      {children}
    </div>
  );
}
