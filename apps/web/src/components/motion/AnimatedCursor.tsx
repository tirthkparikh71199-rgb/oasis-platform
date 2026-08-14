"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Enterprise-grade interactive cursor.
 * - Hidden entirely on touch devices (mobile / tablet) via pointer media query.
 * - Dot + trailing glow that reacts on interactive elements.
 */
export function AnimatedCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(fine.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    fine.addEventListener("change", onChange);
    return () => fine.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let x = -100;
    let y = -100;
    let gx = -100;
    let gy = -100;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement | null;
      setHovering(Boolean(t?.closest("a, button, [data-cursor]")));
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      x = -100;
      y = -100;
    };

    const loop = () => {
      gx += (x - gx) * 0.16;
      gy += (y - gy) * 0.16;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="custom-cursor pointer-events-none fixed inset-0 z-[120] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <div
        ref={glowRef}
        className="fixed left-0 top-0 will-change-transform transition-[width,height,opacity,background] duration-200"
        style={{
          width: hovering ? 44 : 30,
          height: hovering ? 44 : 30,
          marginLeft: -22,
          marginTop: -22,
          borderRadius: 9999,
          background: hovering ? "rgba(232,163,61,0.14)" : "rgba(28,111,232,0.12)",
          border: `1px solid ${hovering ? "rgba(232,163,61,0.5)" : "rgba(28,111,232,0.28)"}`,
          backdropFilter: "blur(1px)",
          opacity: pressed ? 0.5 : 1,
          scale: pressed ? 0.9 : 1,
        }}
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 will-change-transform transition-transform duration-75"
        style={{
          width: 8,
          height: 8,
          marginLeft: -4,
          marginTop: -4,
          borderRadius: 9999,
          background: "#e8a33d",
        }}
      />
    </div>
  );
}
