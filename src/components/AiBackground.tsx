import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
  depth: number;
}

interface DataPacket {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
  color: string;
  trailLength: number;
}

interface PulseRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

// MatrixGlyph removed — floating code text was distracting and caused canvas overhead

export function AiBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animId: number;
    let width = 0;
    let height = 0;
    let isVisible = true;

    const mouse = {
      x: -9999,
      y: -9999,
      active: false,
    };

    // Soft & Attractive Neon Color Palette
    const nodeColors = [
      "rgba(6, 182, 212, ",   // Electric Cyan
      "rgba(251, 146, 60, ",  // Warm Amber
      "rgba(168, 85, 247, ",  // Cyber Violet
      "rgba(16, 185, 129, ",  // Emerald
      "rgba(244, 63, 94, ",   // Neon Rose
      "rgba(56, 189, 248, ",  // Sky Blue
      "rgba(234, 179, 8, ",   // Luminous Gold
    ];

    let nodes: Node[] = [];
    let packets: DataPacket[] = [];
    let ripples: PulseRipple[] = [];

    const initNodes = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Fewer nodes = less GPU work = smoother header scrolling
      const density = width < 768 ? 22000 : 16000;
      const count = Math.min(Math.max(Math.floor((width * height) / density), 28), 55);

      nodes = [];
      for (let i = 0; i < count; i++) {
        const color = nodeColors[Math.floor(Math.random() * nodeColors.length)];
        const depth = Math.random() > 0.3 ? 1 : 2;
        const speedScale = depth === 1 ? 0.18 : 0.09;

        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : speedScale),
          vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : speedScale),
          radius: depth === 1 ? 1.6 + Math.random() * 2.0 : 1.0 + Math.random() * 1.0,
          baseAlpha: depth === 1 ? 0.35 + Math.random() * 0.35 : 0.15 + Math.random() * 0.2,
          pulseSpeed: 0.012 + Math.random() * 0.016,
          pulsePhase: Math.random() * Math.PI * 2,
          color,
          depth,
        });
      }

      packets = [];
      ripples = [];
    };

    initNodes();

    const maybeSpawnPacket = (i: number, j: number) => {
      if (prefersReducedMotion) return;
      if (packets.length >= 28) return;
      if (Math.random() < 0.03) {
        packets.push({
          fromIndex: i,
          toIndex: j,
          progress: 0,
          speed: 0.012 + Math.random() * 0.016,
          color: nodes[i].color,
          trailLength: 0.22 + Math.random() * 0.12,
        });
      }
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const maxConnectDist = width < 768 ? 120 : 150;
      const mouseDistThreshold = 180;

      // 1. Smooth, Soft Node Floating & Physics
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.pulsePhase += a.pulseSpeed;

        if (!prefersReducedMotion) {
          a.x += a.vx * delta * 60;
          a.y += a.vy * delta * 60;

          if (a.x < -30) a.x = width + 30;
          if (a.x > width + 30) a.x = -30;
          if (a.y < -30) a.y = height + 30;
          if (a.y > height + 30) a.y = -30;

          if (mouse.active) {
            const dx = mouse.x - a.x;
            const dy = mouse.y - a.y;
            const mDist = Math.sqrt(dx * dx + dy * dy);
            if (mDist < mouseDistThreshold && mDist > 0) {
              const force = (1 - mDist / mouseDistThreshold) * 0.5;
              a.x += (dx / mDist) * force * 0.5;
              a.y += (dy / mDist) * force * 0.5;
            }
          }
        }

        // Soft, Smooth Neural Synaptic Connection Lines
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const distRatio = 1 - dist / maxConnectDist;
            const lineAlpha = (distRatio * 0.18 * (a.depth === 1 && b.depth === 1 ? 1 : 0.4)).toFixed(3);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `${a.color}${lineAlpha})`;
            ctx.lineWidth = distRatio * 1.2;
            ctx.stroke();

            if (a.depth === 1 && b.depth === 1) {
              maybeSpawnPacket(i, j);
            }
          }
        }
      }

      // 3. Smooth Glowing Data Packets
      for (let p = packets.length - 1; p >= 0; p--) {
        const pkt = packets[p];
        pkt.progress += pkt.speed * delta * 60;

        const a = nodes[pkt.fromIndex];
        const b = nodes[pkt.toIndex];

        if (!a || !b || pkt.progress >= 1) {
          if (b && ripples.length < 12) {
            ripples.push({
              x: b.x,
              y: b.y,
              radius: b.radius * 1.5,
              maxRadius: b.radius * 5.5,
              alpha: 0.55,
              color: pkt.color,
              lineWidth: 1.2,
            });
          }
          packets.splice(p, 1);
          continue;
        }

        const headX = a.x + (b.x - a.x) * pkt.progress;
        const headY = a.y + (b.y - a.y) * pkt.progress;

        const tailProgress = Math.max(0, pkt.progress - pkt.trailLength);
        const tailX = a.x + (b.x - a.x) * tailProgress;
        const tailY = a.y + (b.y - a.y) * tailProgress;

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        grad.addColorStop(0, `${pkt.color}0)`);
        grad.addColorStop(1, `${pkt.color}0.85)`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `${pkt.color}0.95)`;
        ctx.shadowColor = `${pkt.color}0.9)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 4. Smooth Expanding Shockwaves
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rp = ripples[r];
        rp.radius += 0.7 * delta * 60;
        rp.alpha -= 0.015 * delta * 60;

        if (rp.alpha <= 0 || rp.radius >= rp.maxRadius) {
          ripples.splice(r, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${rp.color}${rp.alpha.toFixed(3)})`;
        ctx.lineWidth = rp.lineWidth;
        ctx.stroke();
      }

      // 5. Soft Glowing Neural Nodes
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const pulse = Math.sin(a.pulsePhase) * 0.22;
        const alpha = Math.max(0.12, Math.min(0.95, a.baseAlpha + pulse));

        if (a.depth === 1 && a.radius > 1.8) {
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.radius * 3.4, 0, Math.PI * 2);
          ctx.fillStyle = `${a.color}${(alpha * 0.22).toFixed(3)})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${a.color}${alpha.toFixed(3)})`;
        ctx.shadowColor = `${a.color}0.7)`;
        ctx.shadowBlur = a.depth === 1 ? 6 : 2;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    const onResize = () => {
      initNodes();
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onClick = (e: MouseEvent) => {
      const burstColors = [
        "rgba(6, 182, 212, ",
        "rgba(251, 146, 60, ",
        "rgba(244, 63, 94, ",
        "rgba(168, 85, 247, ",
        "rgba(16, 185, 129, ",
      ];
      for (let k = 0; k < 2; k++) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 4 + k * 8,
          maxRadius: 120 + k * 35,
          alpha: 0.7 - k * 0.2,
          color: burstColors[Math.floor(Math.random() * burstColors.length)],
          lineWidth: 1.6 - k * 0.3,
        });
      }
    };

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !prefersReducedMotion) {
        lastTime = performance.now();
      }
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Soft dynamic ambient gradient orbs */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-cyan-500/12 blur-[130px] pointer-events-none animate-blob-1" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-amber-500/12 blur-[140px] pointer-events-none animate-blob-2" />
      <div className="absolute bottom-10 left-1/4 w-[650px] h-[650px] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none animate-blob-1" />

      {/* Interactive AI neural canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90" />
    </div>
  );
}
