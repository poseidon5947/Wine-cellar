"use client";

import { useEffect, useRef } from "react";

/**
 * Dashboard background — three layered techniques:
 *
 *  1. Deep radial burgundy colour wash (CSS only)
 *  2. Animated SVG wine cellar line art — vault arch, barrel rows, bottle rack
 *  3. Animated grain/noise texture (canvas)
 */
export function DashboardBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Animated grain canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 256;
    canvas.width  = SIZE;
    canvas.height = SIZE;

    let raf: number;
    let frame = 0;

    function drawGrain() {
      const img = ctx!.createImageData(SIZE, SIZE);
      const data = img.data;
      // shift seed each frame so grain animates
      const seed = (frame * 7919) & 0xffff;
      for (let i = 0; i < SIZE * SIZE; i++) {
        // fast pseudo-random
        const x = (i * 1664525 + 1013904223 + seed) & 0xffffffff;
        const v = ((x >>> 16) & 0xff);
        const alpha = v < 60 ? Math.round(v * 0.35) : 0;
        data[i * 4]     = 255;
        data[i * 4 + 1] = 220;
        data[i * 4 + 2] = 180;
        data[i * 4 + 3] = alpha;
      }
      ctx!.putImageData(img, 0, 0);
      frame = (frame + 1) % 60;
      raf = requestAnimationFrame(drawGrain);
    }
    drawGrain();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0, zIndex: -1,
        pointerEvents: "none", overflow: "hidden",
      }}
    >
      {/* ── Layer 1: deep burgundy radial glow ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 50% 42%,
            oklch(18% 0.16 15) 0%,
            oklch(12% 0.12 15) 40%,
            oklch(7%  0.08 15) 75%,
            oklch(5%  0.05 15) 100%
          )
        `,
      }} />

      {/* ── Layer 2: secondary warm amber cast from top ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 55% 35% at 50% 0%,
            oklch(28% 0.10 70 / 0.30) 0%,
            transparent 65%
          )
        `,
      }} />

      {/* ── Layer 3: SVG cellar line art ── */}
      <svg
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          opacity: 0.055,
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Vault arch — main */}
        <path
          d="M 120 900 L 120 480 Q 720 20 1320 480 L 1320 900"
          fill="none" stroke="white" strokeWidth="1.2"
        />
        {/* Vault arch — inner */}
        <path
          d="M 200 900 L 200 520 Q 720 100 1240 520 L 1240 900"
          fill="none" stroke="white" strokeWidth="0.7"
        />
        {/* Vault keystone ribs */}
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((t, i) => {
          // points along the outer arch
          const angle = Math.PI * t;
          const cx = 720, cy = 20, rx = 600, ry = 460;
          const x = cx + rx * Math.cos(Math.PI - angle);
          const y = cy + ry * Math.sin(Math.PI - angle);
          const ox = 720 + 520 * Math.cos(Math.PI - angle);
          const oy = 100 + 420 * Math.sin(Math.PI - angle);
          return (
            <line key={i}
              x1={x} y1={y} x2={ox} y2={oy}
              stroke="white" strokeWidth="0.5"
            />
          );
        })}

        {/* Stone block lines — floor */}
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <g key={row}>
            <line x1={0} y1={820 - row * 28} x2={1440} y2={820 - row * 28}
              stroke="white" strokeWidth="0.4" />
            {Array.from({ length: 14 }).map((_, col) => (
              <line key={col}
                x1={col * 103 + (row % 2 === 0 ? 0 : 52)} y1={820 - row * 28}
                x2={col * 103 + (row % 2 === 0 ? 0 : 52)} y2={820 - (row + 1) * 28}
                stroke="white" strokeWidth="0.3" />
            ))}
          </g>
        ))}

        {/* Left barrel row */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${148 + i * 0}, ${720 + i * 0})`}>
            <ellipse cx={148 + i * 90} cy={750} rx={36} ry={42}
              fill="none" stroke="white" strokeWidth="0.7" />
            <line x1={112 + i * 90} y1={750} x2={184 + i * 90} y2={750}
              stroke="white" strokeWidth="0.4" />
            <line x1={114 + i * 90} y1={735} x2={182 + i * 90} y2={735}
              stroke="white" strokeWidth="0.3" />
            <line x1={114 + i * 90} y1={765} x2={182 + i * 90} y2={765}
              stroke="white" strokeWidth="0.3" />
          </g>
        ))}

        {/* Right barrel row */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <ellipse cx={1290 - i * 90} cy={750} rx={36} ry={42}
              fill="none" stroke="white" strokeWidth="0.7" />
            <line x1={1254 - i * 90} y1={750} x2={1326 - i * 90} y2={750}
              stroke="white" strokeWidth="0.4" />
            <line x1={1256 - i * 90} y1={735} x2={1324 - i * 90} y2={735}
              stroke="white" strokeWidth="0.3" />
            <line x1={1256 - i * 90} y1={765} x2={1324 - i * 90} y2={765}
              stroke="white" strokeWidth="0.3" />
          </g>
        ))}

        {/* Bottle rack — left wall */}
        <rect x={122} y={480} width={80} height={220}
          fill="none" stroke="white" strokeWidth="0.6" />
        {[0,1,2,3,4,5].map((row) => (
          <line key={row} x1={122} y1={480 + row * 37} x2={202} y2={480 + row * 37}
            stroke="white" strokeWidth="0.4" />
        ))}
        {[0,1].map((col) => (
          <line key={col} x1={122 + col * 40} y1={480} x2={122 + col * 40} y2={700}
            stroke="white" strokeWidth="0.3" />
        ))}
        {/* bottles in rack */}
        {[0,1,2,3,4].map((row) => [0,1].map((col) => (
          <ellipse key={`${row}-${col}`}
            cx={142 + col * 40} cy={498 + row * 37} rx={8} ry={14}
            fill="none" stroke="white" strokeWidth="0.5" />
        )))}

        {/* Bottle rack — right wall */}
        <rect x={1238} y={480} width={80} height={220}
          fill="none" stroke="white" strokeWidth="0.6" />
        {[0,1,2,3,4,5].map((row) => (
          <line key={row} x1={1238} y1={480 + row * 37} x2={1318} y2={480 + row * 37}
            stroke="white" strokeWidth="0.4" />
        ))}
        {[0,1].map((col) => (
          <line key={col} x1={1238 + col * 40} y1={480} x2={1238 + col * 40} y2={700}
            stroke="white" strokeWidth="0.3" />
        ))}
        {[0,1,2,3,4].map((row) => [0,1].map((col) => (
          <ellipse key={`${row}-${col}`}
            cx={1258 + col * 40} cy={498 + row * 37} rx={8} ry={14}
            fill="none" stroke="white" strokeWidth="0.5" />
        )))}

        {/* Hanging lantern */}
        <line x1={720} y1={0} x2={720} y2={80} stroke="white" strokeWidth="0.6" />
        <rect x={704} y={80} width={32} height={44} rx={4}
          fill="none" stroke="white" strokeWidth="0.7" />
        <line x1={704} y1={95} x2={736} y2={95} stroke="white" strokeWidth="0.4" />
        <line x1={704} y1={110} x2={736} y2={110} stroke="white" strokeWidth="0.4" />
        <ellipse cx={720} cy={80} rx={10} ry={4}
          fill="none" stroke="white" strokeWidth="0.5" />
        <ellipse cx={720} cy={124} rx={8} ry={3}
          fill="none" stroke="white" strokeWidth="0.4" />

        {/* Candle sconces — left */}
        <line x1={240} y1={400} x2={240} y2={440} stroke="white" strokeWidth="0.6" />
        <rect x={234} y={440} width={12} height={28} rx={2}
          fill="none" stroke="white" strokeWidth="0.5" />
        <path d="M 240 440 Q 244 428 240 418 Q 236 428 240 440"
          fill="none" stroke="white" strokeWidth="0.5" />

        {/* Candle sconces — right */}
        <line x1={1200} y1={400} x2={1200} y2={440} stroke="white" strokeWidth="0.6" />
        <rect x={1194} y={440} width={12} height={28} rx={2}
          fill="none" stroke="white" strokeWidth="0.5" />
        <path d="M 1200 440 Q 1204 428 1200 418 Q 1196 428 1200 440"
          fill="none" stroke="white" strokeWidth="0.5" />

        {/* Centre floor drain / medallion */}
        <circle cx={720} cy={880} r={60} fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx={720} cy={880} r={40} fill="none" stroke="white" strokeWidth="0.4" />
        <circle cx={720} cy={880} r={20} fill="none" stroke="white" strokeWidth="0.4" />
        {[0,30,60,90,120,150].map((deg) => {
          const rad = deg * Math.PI / 180;
          return (
            <line key={deg}
              x1={720 + 20 * Math.cos(rad)} y1={880 + 20 * Math.sin(rad)}
              x2={720 + 60 * Math.cos(rad)} y2={880 + 60 * Math.sin(rad)}
              stroke="white" strokeWidth="0.35" />
          );
        })}
      </svg>

      {/* ── Layer 4: animated grain canvas (tiled) ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          imageRendering: "pixelated",
          opacity: 0.55,
          mixBlendMode: "overlay",
        }}
      />

      {/* ── Layer 5: edge vignette — draws eye to centre ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(
          ellipse 85% 85% at 50% 50%,
          transparent 40%,
          rgba(0,0,0,0.35) 72%,
          rgba(0,0,0,0.70) 100%
        )`,
      }} />

      {/* ── Layer 6: soft light bloom from centre ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(
          ellipse 40% 30% at 50% 46%,
          oklch(22% 0.14 15 / 0.18) 0%,
          transparent 70%
        )`,
        animation: "dashBgBreath 8s ease-in-out infinite",
      }} />

      <style>{`
        @keyframes dashBgBreath {
          0%,100% { opacity: 0.7; transform: scale(1);    }
          50%     { opacity: 1.0; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
