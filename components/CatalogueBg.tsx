"use client";

import { useEffect, useRef, useState } from "react";

export function CatalogueBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ghost, setGhost] = useState(false);

  /* Ghost pulse: catalogue.png fades in/out every 5s */
  useEffect(() => {
    const id = setInterval(() => setGhost((v) => !v), 5000);
    return () => clearInterval(id);
  }, []);

  /* Gold dust motes */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth, h = window.innerHeight;
    const setSize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
    };
    setSize();
    window.addEventListener("resize", setSize);

    type Mote = { x: number; y: number; r: number; vx: number; vy: number; a: number; da: number };
    const motes: Mote[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: 0.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(0.05 + Math.random() * 0.2),
      a: 0.1 + Math.random() * 0.5,
      da: (Math.random() - 0.5) * 0.004,
    }));

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx; m.y += m.vy;
        m.a = Math.max(0.05, Math.min(0.65, m.a + m.da));
        if (m.a <= 0.05 || m.a >= 0.65) m.da *= -1;
        if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
        if (m.x < -4) m.x = w + 4;
        if (m.x > w + 4) m.x = -4;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
        g.addColorStop(0,   `rgba(212,175,55,${m.a})`);
        g.addColorStop(0.5, `rgba(212,175,55,${m.a * 0.25})`);
        g.addColorStop(1,   "rgba(212,175,55,0)");
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("resize", setSize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: -1,
      pointerEvents: "none", overflow: "hidden"
    }}>

      {/* ── 1. Solid dark base ── */}
      <div style={{ position: "absolute", inset: 0, background: "#07040a" }} />

      {/* ── 2. Base wine cellar photo ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/asset/OL3V7P0.jpg')",
        backgroundSize: "cover", backgroundPosition: "center 35%",
        filter: "brightness(0.45) saturate(1.3)",
        animation: "catalogueBgZoom 40s ease-in-out infinite alternate",
      }} />

      {/* ── 3. catalogue.png — always partially visible, ghosts deeper ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/asset/catalogue.png')",
        backgroundSize: "cover", backgroundPosition: "center center",
        opacity: ghost ? 0.18 : 0.55,
        filter: "brightness(0.7) saturate(0.8)",
        transition: "opacity 4s cubic-bezier(0.4,0,0.6,1)",
        mixBlendMode: "normal",
      }} />

      {/* ── 4. catalogue.png ghost echo — offset, blurred, pure white spirit ── */}
      <div style={{
        position: "absolute", inset: "-4px 0 0 0",
        backgroundImage: "url('/asset/catalogue.png')",
        backgroundSize: "cover", backgroundPosition: "center calc(50% - 6px)",
        opacity: ghost ? 0.08 : 0.0,
        filter: "brightness(3) saturate(0) blur(3px)",
        transition: "opacity 3s ease-in-out",
        mixBlendMode: "screen",
      }} />

      {/* ── 5. Shimmer wipe — sweeps across when ghost is showing ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.06) 50%,transparent 70%)",
        backgroundSize: "300% 100%",
        animation: "catalogueShimmer 4s linear infinite",
        opacity: ghost ? 1 : 0,
        transition: "opacity 2s ease",
        mixBlendMode: "screen",
      }} />

      {/* ── 6. Colour grade — deep wine vignette ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 110% 80% at 50% 50%,
            transparent 28%,
            rgba(20,5,10,0.5) 65%,
            rgba(8,2,5,0.82) 100%
          ),
          radial-gradient(ellipse 50% 30% at 50% 0%,
            rgba(180,120,30,0.15) 0%,
            transparent 70%
          )
        `,
      }} />

      {/* ── 7. SVG god-rays ── */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "screen" }}
        viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="cbRayGrad" cx="50%" cy="0%" r="75%">
            <stop offset="0%"   stopColor="rgba(212,175,55,0.18)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)"    />
          </radialGradient>
          <filter id="cbRayBlur"><feGaussianBlur stdDeviation="22" /></filter>
        </defs>
        <ellipse cx="720" cy="-80" rx="640" ry="460"
          fill="url(#cbRayGrad)" filter="url(#cbRayBlur)"
          style={{ animation: "catalogueRayBreathe 8s ease-in-out infinite" }} />
        {[140,280,440,600,720,840,1000,1160,1300].map((x2, i) => (
          <line key={i} x1={720} y1={-30} x2={x2} y2={920}
            stroke={`rgba(212,175,55,${0.10 + (i === 4 ? 0.14 : 0.02 * (4 - Math.abs(i - 4)))})`}
            strokeWidth="50" filter="url(#cbRayBlur)"
            style={{
              animation: `catalogueRayFlicker ${5 + i * 0.6}s ease-in-out infinite`,
              animationDelay: `${i * 0.35}s`,
            }} />
        ))}
      </svg>

      {/* ── 8. Canvas dust motes ── */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "screen" }} />

      {/* ── 9. Edge vignette ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 95% 95% at 50% 50%, transparent 35%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.85) 100%)",
      }} />

      {/* ── 10. Bottom fog ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
        background: "linear-gradient(to top, rgba(7,4,10,0.92) 0%, rgba(7,4,10,0.4) 45%, transparent 100%)",
      }} />

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes catalogueBgZoom {
          from { transform: scale(1.0) translateY(0px);    }
          to   { transform: scale(1.09) translateY(-20px); }
        }
        @keyframes catalogueShimmer {
          0%   { background-position:  220% center; }
          100% { background-position: -120% center; }
        }
        @keyframes catalogueRayBreathe {
          0%,100% { opacity: 0.65; transform: scaleX(1);    }
          50%     { opacity: 1.0;  transform: scaleX(1.15); }
        }
        @keyframes catalogueRayFlicker {
          0%,100% { opacity: 1;   }
          25%     { opacity: 0.5; }
          50%     { opacity: 0.9; }
          75%     { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
