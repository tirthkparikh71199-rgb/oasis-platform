"use client";

import { useEffect, useRef, useState } from "react";

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }> = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 181, 62, ${p.opacity})`;
        ctx.fill();
      });
      animFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animFrame);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

export function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-2xl bg-white transition-shadow duration-300 hover:shadow-xl ${className}`}
      style={{
        background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(229,181,62,0.06), transparent 40%)`,
      }}
    >
      {children}
    </div>
  );
}

export function MorphingBlob({ className = "" }: { className?: string }) {
  const [path, setPath] = useState("M44.5,-76.3C56.9,-69.2,65.5,-54.8,72.1,-40.1C78.7,-25.4,83.3,-10.4,81.5,3.8C79.7,18,71.5,31.5,62.3,43.3C53.1,55.1,42.9,65.2,30.5,72.1C18.1,79,3.5,82.7,-11.3,81.5C-26.1,80.3,-41.1,74.2,-53.4,64.5C-65.7,54.8,-75.3,41.5,-79.8,26.5C-84.3,11.5,-83.7,-5.2,-77.8,-19.5C-71.9,-33.8,-60.7,-45.7,-47.5,-52.6C-34.3,-59.5,-19.1,-61.4,-1.9,-58.8C15.3,-56.2,32.1,-83.4,44.5,-76.3Z");

  useEffect(() => {
    const paths = [
      "M44.5,-76.3C56.9,-69.2,65.5,-54.8,72.1,-40.1C78.7,-25.4,83.3,-10.4,81.5,3.8C79.7,18,71.5,31.5,62.3,43.3C53.1,55.1,42.9,65.2,30.5,72.1C18.1,79,3.5,82.7,-11.3,81.5C-26.1,80.3,-41.1,74.2,-53.4,64.5C-65.7,54.8,-75.3,41.5,-79.8,26.5C-84.3,11.5,-83.7,-5.2,-77.8,-19.5C-71.9,-33.8,-60.7,-45.7,-47.5,-52.6C-34.3,-59.5,-19.1,-61.4,-1.9,-58.8C15.3,-56.2,32.1,-83.4,44.5,-76.3Z",
      "M39.9,-65.7C54.1,-60.1,69.5,-53.2,77.1,-41.1C84.7,-29,84.5,-11.7,79.3,3.3C74.1,18.3,63.9,31,53.4,42.8C42.9,54.6,32.1,65.5,18.8,71.5C5.5,77.5,-10.3,78.6,-24.4,73.5C-38.5,68.4,-50.9,57.1,-60.5,43.7C-70.1,30.3,-76.9,14.8,-77.2,-0.9C-77.5,-16.6,-71.3,-32.5,-61,-44.5C-50.7,-56.5,-36.3,-64.6,-22.3,-70.4C-8.3,-76.2,5.3,-79.7,19.9,-77.8C34.5,-75.9,25.7,-71.3,39.9,-65.7Z",
      "M42.3,-73.1C54.5,-66.8,63.7,-54.1,70.2,-40.8C76.7,-27.5,80.5,-13.8,79.2,-0.7C77.9,12.3,71.5,24.6,63.1,35.1C54.7,45.6,44.3,54.3,32.4,60.2C20.5,66.1,7.1,69.2,-6.1,68.4C-19.3,67.6,-32.3,62.9,-44.2,55.5C-56.1,48.1,-66.9,38,-72.3,25.2C-77.7,12.4,-77.7,-3,-72.7,-16.2C-67.7,-29.4,-57.7,-40.4,-46,-48.6C-34.3,-56.8,-21,-62.2,-5.8,-64.2C9.4,-66.2,30.1,-79.4,42.3,-73.1Z",
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % paths.length;
      setPath(paths[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`absolute ${className}`}>
      <svg viewBox="-100 -100 200 200" className="w-full h-full">
        <path d={path} fill="rgba(229,181,62,0.1)" className="transition-all duration-[2000ms] ease-in-out" />
      </svg>
    </div>
  );
}

export function AnimatedGradientBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[2px] bg-gradient-to-r from-brand via-brand-3 to-brand animate-gradient ${className}`}>
      <div className="rounded-2xl bg-white">{children}</div>
    </div>
  );
}
