"use client";

import { useEffect, useRef } from "react";

/**
 * Background for /bottles/new and /bottles/[id] pages.
 *
 * Theme: Vineyard at dusk — deep purple twilight sky, floating vine
 * tendrils, drifting pollen particles, aurora colour bands.
 *
 * Layers:
 *  1. Deep purple-to-black radial colour wash
 *  2. Aurora/nebula bands — slow drifting gradients
 *  3. Animated SVG vine tendrils
 *  4. Canvas floating pollen/spore particles
 *  5. Edge vignette
 */
export function BottleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    /* Pollen motes — slightly larger, slow drift, warm amber-purple tones */
    type Spore = {
      x: number; y: number; r: number;
      vx: number; vy: number;
      a: number; da: number;
      hue: number;
    };

    const spores: Spore[] = Array.from({ length: 70 }, () => ({
      x:   Math.random() * w,
      y:   Math.random() * h,
      r:   1.0 + Math.random() * 3.5,
      vx:  (Math.random() - 0.5) * 0.3,
      vy:  -(0.06 + Math.random() * 0.25),
      a:   0.1 + Math.random() * 0.55,
      da:  (Math.random() - 0.5) * 0.003,
      hue: 270 + Math.random() * 80,   /* purple → gold range */
    }));

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of spores) {
        s.x += s.vx; s.y += s.vy;
        s.a   = Math.max(0.04, Math.min(0.65, s.a + s.da));
        if (s.a <= 0.04 || s.a >= 0.65) s.da *= -1;
        if (s.y < -6)  { s.y = h + 6; s.x = Math.random() * w; }
        if (s.x < -6)  s.x = w + 6;
        if (s.x > w+6) s.x = -6;

        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        g.addColorStop(0,   `hsla(${s.hue},80%,70%,${s.a})`);
        g.addColorStop(0.4, `hsla(${s.hue},60%,55%,${s.a * 0.3})`);
        g.addColorStop(1,   `hsla(${s.hue},40%,40%,0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: -1,
      pointerEvents: "none", overflow: "hidden",
    }}>

      {/* ── Layer 1: deep purple-burgundy base ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 90% 70% at 60% 35%,
            oklch(16% 0.18 295) 0%,
            oklch(11% 0.14 20)  45%,
            oklch(6%  0.08 15)  80%,
            oklch(4%  0.04 15) 100%
          )
        `,
      }} />

      {/* ── Layer 2: aurora band — top left drift ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 70% 40% at 20% 25%,
            oklch(28% 0.22 290 / 0.35) 0%,
            transparent 60%
          )
        `,
        animation: "bottleBgAurora1 14s ease-in-out infinite alternate",
      }} />

      {/* ── Layer 3: aurora band — right side warm glow ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 50% 55% at 85% 60%,
            oklch(22% 0.16 50 / 0.28) 0%,
            transparent 65%
          )
        `,
        animation: "bottleBgAurora2 18s ease-in-out infinite alternate",
      }} />

      {/* ── Layer 4: subtle amber gleam at horizon ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 80% 25% at 50% 48%,
            oklch(30% 0.14 60 / 0.12) 0%,
            transparent 70%
          )
        `,
        animation: "bottleBgAurora3 11s ease-in-out infinite alternate",
      }} />

      {/* ── Layer 5: SVG vine tendrils ── */}
      <svg
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          opacity: 0.07,
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Main left vine climbing from bottom-left */}
        <path
          d="M 60 900 C 80 750, 40 620, 90 500 C 140 380, 60 280, 120 180 C 180 80, 140 40, 180 0"
          fill="none" stroke="white" strokeWidth="1.2"
          className="vine-sway"
          style={{ transformOrigin: "60px 900px", animation: "vineSway1 12s ease-in-out infinite" }}
        />
        {/* Branch left-1 */}
        <path d="M 90 500 C 130 470, 180 430, 220 400"
          fill="none" stroke="white" strokeWidth="0.7" />
        {/* Branch left-2 */}
        <path d="M 80 650 C 130 620, 190 580, 240 560"
          fill="none" stroke="white" strokeWidth="0.6" />
        {/* Branch left-3 */}
        <path d="M 100 750 C 160 720, 230 700, 290 690"
          fill="none" stroke="white" strokeWidth="0.5" />

        {/* Leaf clusters — left */}
        {[
          [220, 400], [170, 460], [240, 560], [200, 620],
          [290, 690], [260, 740],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx},${cy})`}>
            <ellipse rx={14} ry={8} transform={`rotate(${-30 + i * 15})`}
              fill="none" stroke="white" strokeWidth="0.5" />
            <ellipse rx={10} ry={6} transform={`translate(12,0) rotate(${20 + i * 10})`}
              fill="none" stroke="white" strokeWidth="0.4" />
          </g>
        ))}

        {/* Grape clusters — left */}
        {[[180, 440], [255, 575]].map(([cx, cy], ci) => (
          <g key={ci} transform={`translate(${cx},${cy})`}>
            {[0,1,2,3,4,5,6].map((j) => {
              const row = Math.floor(j / 3);
              const col = j % 3;
              return (
                <circle key={j}
                  cx={col * 10 - 10} cy={row * 10}
                  r={4.5}
                  fill="none" stroke="white" strokeWidth="0.5" />
              );
            })}
            <circle cx={5} cy={30} r={4.5} fill="none" stroke="white" strokeWidth="0.5" />
          </g>
        ))}

        {/* Main right vine */}
        <path
          d="M 1380 900 C 1360 740, 1400 600, 1350 480 C 1300 360, 1380 260, 1320 150 C 1260 40, 1300 20, 1260 0"
          fill="none" stroke="white" strokeWidth="1.2"
          style={{ transformOrigin: "1380px 900px", animation: "vineSway2 15s ease-in-out infinite" }}
        />
        {/* Branch right-1 */}
        <path d="M 1350 480 C 1310 450, 1260 420, 1220 400"
          fill="none" stroke="white" strokeWidth="0.7" />
        {/* Branch right-2 */}
        <path d="M 1360 640 C 1300 615, 1240 590, 1190 580"
          fill="none" stroke="white" strokeWidth="0.6" />
        {/* Branch right-3 */}
        <path d="M 1370 780 C 1300 755, 1230 740, 1160 730"
          fill="none" stroke="white" strokeWidth="0.5" />

        {/* Leaf clusters — right */}
        {[
          [1220, 400], [1270, 450], [1190, 580], [1240, 630],
          [1160, 730], [1200, 770],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx},${cy})`}>
            <ellipse rx={14} ry={8} transform={`rotate(${30 - i * 15})`}
              fill="none" stroke="white" strokeWidth="0.5" />
            <ellipse rx={10} ry={6} transform={`translate(-12,0) rotate(${-20 - i * 10})`}
              fill="none" stroke="white" strokeWidth="0.4" />
          </g>
        ))}

        {/* Grape clusters — right */}
        {[[1235, 420], [1200, 600]].map(([cx, cy], ci) => (
          <g key={ci} transform={`translate(${cx},${cy})`}>
            {[0,1,2,3,4,5,6].map((j) => {
              const row = Math.floor(j / 3);
              const col = j % 3;
              return (
                <circle key={j}
                  cx={col * 10 - 10} cy={row * 10}
                  r={4.5}
                  fill="none" stroke="white" strokeWidth="0.5" />
              );
            })}
            <circle cx={5} cy={30} r={4.5} fill="none" stroke="white" strokeWidth="0.5" />
          </g>
        ))}

        {/* Horizon vine row — subtle ground line */}
        <path d="M 0 860 Q 360 840, 720 855 Q 1080 870, 1440 850"
          fill="none" stroke="white" strokeWidth="0.4" />
        {/* Small ground vine shoots */}
        {[120, 280, 480, 680, 900, 1100, 1300].map((x, i) => (
          <path key={i}
            d={`M ${x} 860 C ${x + 20} 820, ${x - 10} 780, ${x + 30} 750`}
            fill="none" stroke="white" strokeWidth="0.4" />
        ))}

        {/* Stars / distant moon */}
        <circle cx={720} cy={60} r={18} fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx={720} cy={60} r={12} fill="none" stroke="white" strokeWidth="0.3" />
        {/* star ring */}
        {[0,45,90,135,180,225,270,315].map((deg, i) => {
          const r2 = deg * Math.PI / 180;
          return (
            <circle key={i}
              cx={720 + 30 * Math.cos(r2)} cy={60 + 30 * Math.sin(r2)}
              r={1.2} fill="white" opacity="0.7" />
          );
        })}
        {/* random small stars */}
        {[
          [200,40],[380,20],[550,55],[900,30],[1050,15],[1220,45],[1380,25],
          [300,80],[650,25],[850,70],[1150,50],[150,65],
        ].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={1.0 + Math.random()} fill="white" opacity="0.5" />
        ))}
      </svg>

      {/* ── Layer 6: pollen canvas ── */}
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        mixBlendMode: "screen",
      }} />

      {/* ── Layer 7: edge vignette ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(
          ellipse 90% 90% at 50% 50%,
          transparent 35%,
          rgba(0,0,0,0.40) 68%,
          rgba(0,0,0,0.78) 100%
        )`,
      }} />

      {/* ── Layer 8: bottom fog ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: `linear-gradient(to top,
          oklch(5% 0.06 15 / 0.88) 0%,
          oklch(5% 0.06 15 / 0.35) 45%,
          transparent 100%
        )`,
      }} />

      <style>{`
        @keyframes bottleBgAurora1 {
          from { transform: translateX(-4%) translateY(-3%) scale(1);   }
          to   { transform: translateX(4%)  translateY(5%)  scale(1.1); }
        }
        @keyframes bottleBgAurora2 {
          from { transform: translateX(3%)  translateY(4%)  scale(1.05); }
          to   { transform: translateX(-5%) translateY(-2%) scale(0.95); }
        }
        @keyframes bottleBgAurora3 {
          from { opacity: 0.6; transform: translateY(0px);   }
          to   { opacity: 1.0; transform: translateY(-15px); }
        }
        @keyframes vineSway1 {
          0%,100% { transform: rotate(-1.5deg); }
          50%     { transform: rotate(1.5deg);  }
        }
        @keyframes vineSway2 {
          0%,100% { transform: rotate(1.5deg);  }
          50%     { transform: rotate(-1.5deg); }
        }
      `}</style>
    </div>
  );
}
