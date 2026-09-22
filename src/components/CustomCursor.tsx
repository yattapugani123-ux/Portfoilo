import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    let mouseX = -200;
    let mouseY = -200;
    let ringX = -200;
    let ringY = -200;
    let animId: number;

    // --- Comet trail points ---
    interface TrailPoint {
      x: number;
      y: number;
      age: number;
      maxAge: number;
      size: number;
      hue: number;
    }
    const trail: TrailPoint[] = [];

    // --- Click starburst particles ---
    interface StarParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
      color: string;
    }
    const sparkles: StarParticle[] = [];
    const colors = ["#38bdf8", "#fb923c", "#a855f7", "#34d399", "#fbbf24", "#f43f5e"];

    const canvas = trailCanvasRef.current;
    const ctx = canvas?.getContext("2d");

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      trail.push({
        x: mouseX,
        y: mouseY,
        age: 0,
        maxAge: 28,
        size: 5.5,
        hue: (Date.now() / 20) % 360,
      });
      if (trail.length > 32) trail.shift();
    };

    const handleMouseDown = () => {
      setIsClicked(true);
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.2;
        const speed = 2 + Math.random() * 4.5;
        sparkles.push({
          x: mouseX,
          y: mouseY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          size: 1.5 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const handleMouseUp = () => {
      setTimeout(() => setIsClicked(false), 150);
    };

    // Detect hoverable elements
    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, textarea, select, label, .tool-card")
      ) {
        setIsHovered(true);
      }
    };
    const handlePointerOut = () => setIsHovered(false);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerout", handlePointerOut, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const draw = () => {
      animId = requestAnimationFrame(draw);

      // --- Move dot (snap) ---
      const dot = dotRef.current;
      if (dot) {
        dot.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
      }

      // --- Move ring (lag) ---
      const ring = ringRef.current;
      if (ring) {
        ringX += (mouseX - ringX) * 0.085;
        ringY += (mouseY - ringY) * 0.085;
        ring.style.transform = `translate(${ringX - 22}px, ${ringY - 22}px)`;
      }

      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Draw comet trail ---
      for (let i = trail.length - 1; i >= 0; i--) {
        const pt = trail[i];
        pt.age++;
        const lifeRatio = 1 - pt.age / pt.maxAge;
        if (lifeRatio <= 0) {
          trail.splice(i, 1);
          continue;
        }
        const size = pt.size * lifeRatio * 0.85;
        const alpha = lifeRatio * 0.7;
        // Color shift: cyan → violet → amber
        const hue = (pt.hue + i * 4) % 360;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
        ctx.shadowColor = `hsla(${hue}, 100%, 65%, ${alpha * 0.8})`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // --- Draw sparkles on click ---
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.12; // gentle gravity
        sp.alpha -= 0.032;
        if (sp.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color + Math.floor(sp.alpha * 255).toString(16).padStart(2, "0");
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resizeCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Trail canvas */}
      <canvas
        ref={trailCanvasRef}
        className="pointer-events-none fixed inset-0 z-[9998]"
        aria-hidden="true"
      />

      {/* Inner dot: bright neon glow */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform"
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: isClicked
            ? "radial-gradient(circle, #fbbf24 30%, #fb923c 100%)"
            : isHovered
              ? "radial-gradient(circle, #a855f7 30%, #38bdf8 100%)"
              : "radial-gradient(circle, #38bdf8 20%, #6366f1 100%)",
          boxShadow: isClicked
            ? "0 0 14px 5px rgba(251,191,36,0.85), 0 0 28px 8px rgba(251,191,36,0.4)"
            : isHovered
              ? "0 0 14px 5px rgba(168,85,247,0.85), 0 0 28px 8px rgba(168,85,247,0.5)"
              : "0 0 12px 4px rgba(56,189,248,0.8), 0 0 22px 6px rgba(56,189,248,0.35)",
          opacity: isVisible ? 1 : 0,
          transform: "translate(-200px,-200px)",
          transition: "background 0.25s, box-shadow 0.25s, opacity 0.3s, width 0.2s, height 0.2s",
          ...(isClicked ? { width: 14, height: 14 } : {}),
        }}
      />

      {/* Outer ring: orbit ring with dashes */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9997] will-change-transform"
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: isHovered
            ? "1.5px solid rgba(168,85,247,0.8)"
            : "1.5px dashed rgba(56,189,248,0.55)",
          boxShadow: isHovered
            ? "0 0 18px 4px rgba(168,85,247,0.3), inset 0 0 10px rgba(168,85,247,0.1)"
            : "0 0 12px 2px rgba(56,189,248,0.2)",
          opacity: isVisible ? 1 : 0,
          transform: "translate(-200px,-200px)",
          transition:
            "opacity 0.4s, width 0.3s cubic-bezier(0.34,1.56,0.64,1), height 0.3s cubic-bezier(0.34,1.56,0.64,1), border 0.25s, box-shadow 0.25s",
          animation: "cursor-spin 5s linear infinite",
          ...(isHovered ? { width: 56, height: 56 } : {}),
        }}
      />

      <style>{`
        @keyframes cursor-spin {
          to { transform: rotate(360deg); }
        }
        * { cursor: none !important; }
        @media (pointer: coarse) { * { cursor: auto !important; } }
      `}</style>
    </>
  );
}
