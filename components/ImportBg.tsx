"use client";

import { useEffect, useRef } from "react";

/**
 * Import page background — Data Flow theme
 *
 * Theme: Digital wine ledger — data streaming into the cellar.
 * Deep teal-to-black with:
 *  1. Deep teal/emerald radial colour wash
 *  2. Animated circuit-board SVG line art
 *  3. Canvas: falling data streams (matrix-style, wine characters)
 *  4. Horizontal scan-line sweep
 *  5. Edge vignette + bottom fog
 */
export function ImportBg() {
  const matrixRef = useRef<HTMLCanvasElement>(null);
  const scanRef   = useRef<HTMLDivElement>(null);

  /* ── Matrix rain canvas ── */
  useEffect(() => {
    const canvas = matrixRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth, h = window.innerHeight;
    canvas.width  = w;
    canvas.height = h;
    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      cols = Math.floor(w / fontSize);
      drops = Array(cols).fill(1);
    };
    window.addEventListener("resize", onResize);

    const fontSize = 14;
    /* Wine-themed character set: digits + wine words */
    const chars = "0123456789ABCDEF♦◆▪▸→↑↓⬡⬢◈⬔▲△ABCDEFabcdef";
    const wineTerms = ["WINE","CELLAR","BOTTLE","VINTAGE","ROUGE","BLANC","CRU","AOC"];
    let cols   = Math.floor(w / fontSize);
    let drops: number[] = Array(cols).fill(1);

    /* Per-column metadata */
    const speeds   = Array.from({ length: cols }, () => 0.3 + Math.random() * 0.7);
    const alphas   = Array.from({ length: cols }, () => 0.04 + Math.random() * 0.10);
    const isWord   = Array.from({ length: cols }, () => Math.random() < 0.08);

    let raf: number;
    let frame = 0;

    function draw() {
      /* Dark translucent fill — creates trail fade */
      ctx!.fillStyle = "rgba(0, 12, 10, 0.18)";
      ctx!.fillRect(0, 0, w, h);

      for (let i = 0; i < cols; i++) {
        const y = drops[i] * fontSize;

        /* Head character — brightest */
        ctx!.font = `${fontSize}px monospace`;
        ctx!.fillStyle = `rgba(80, 230, 160, ${alphas[i] * 6})`;
        const headChar = chars[Math.floor(Math.random() * chars.length)];
        ctx!.fillText(headChar, i * fontSize, y);

        /* Occasional wine-term column */
        if (isWord[i] && y > 40 && y < h - 60) {
          const term = wineTerms[i % wineTerms.length];
          ctx!.font = `bold ${fontSize - 1}px monospace`;
          ctx!.fillStyle = `rgba(160, 255, 200, ${alphas[i] * 4})`;
          ctx!.fillText(term[Math.floor(drops[i]) % term.length] || term[0], i * fontSize, y);
        }

        /* Trail — dimmer */
        const trailChar = chars[Math.floor(Math.random() * chars.length)];
        ctx!.font = `${fontSize}px monospace`;
        ctx!.fillStyle = `rgba(30, 160, 100, ${alphas[i] * 2.5})`;
        ctx!.fillText(trailChar, i * fontSize, y - fontSize);

        /* Advance drop */
        drops[i] += speeds[i];
        if (drops[i] * fontSize > h && Math.random() > 0.975) {
          drops[i] = 0;
          isWord[i] = Math.random() < 0.08;
        }
      }
      frame++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: -1,
      pointerEvents: "none", overflow: "hidden",
    }}>

      {/* ── Layer 1: deep teal-black radial base ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 85% 65% at 50% 40%,
            oklch(16% 0.12 175) 0%,
            oklch(10% 0.08 175) 40%,
            oklch(6%  0.05 170) 75%,
            oklch(4%  0.03 165) 100%
          )
        `,
      }} />

      {/* ── Layer 2: emerald glow pulse centre ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 45% 35% at 50% 44%,
            oklch(20% 0.16 160 / 0.22) 0%,
            transparent 65%
          )
        `,
        animation: "importGlowPulse 6s ease-in-out infinite",
      }} />

      {/* ── Layer 3: circuit-board SVG ── */}
      <svg
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          opacity: 0.06,
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Horizontal main bus lines */}
        {[120, 220, 340, 460, 580, 700, 780, 860, 980].map((y, i) => (
          <line key={i} x1={0} y1={y} x2={1440} y2={y}
            stroke="white" strokeWidth={i % 3 === 0 ? 0.7 : 0.35} />
        ))}

        {/* Vertical main bus lines */}
        {[80, 200, 360, 520, 720, 920, 1080, 1240, 1360].map((x, i) => (
          <line key={i} x1={x} y1={0} x2={x} y2={900}
            stroke="white" strokeWidth={i % 3 === 0 ? 0.7 : 0.35} />
        ))}

        {/* Circuit traces — horizontal segments with 90° bends */}
        {[
          "M 0 180 H 180 V 340 H 360 V 220 H 520",
          "M 1440 460 H 1240 V 580 H 1080 V 700 H 920",
          "M 0 700 H 200 V 580 H 360 V 460 H 520 V 340 H 720",
          "M 720 0 V 120 H 920 V 220 H 1080 V 340 H 1240 V 460",
          "M 360 900 V 780 H 520 V 700 H 720 V 580 H 920 V 460",
          "M 0 460 H 120 V 340 H 200 V 220 H 360",
          "M 1440 220 H 1360 V 340 H 1240 V 460 H 1080",
        ].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="white" strokeWidth="0.8" />
        ))}

        {/* IC chip squares */}
        {[
          [160, 300],[500, 200],[700, 540],[1080, 300],[920, 680],
          [280, 680],[1280, 460],[440, 420],[840, 180],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <rect x={-24} y={-18} width={48} height={36} rx={3}
              fill="none" stroke="white" strokeWidth="0.7" />
            {/* pins left */}
            {[-9, 0, 9].map((py, j) => (
              <line key={j} x1={-32} y1={py} x2={-24} y2={py}
                stroke="white" strokeWidth="0.5" />
            ))}
            {/* pins right */}
            {[-9, 0, 9].map((py, j) => (
              <line key={j} x1={24} y1={py} x2={32} y2={py}
                stroke="white" strokeWidth="0.5" />
            ))}
            {/* inner detail */}
            <rect x={-14} y={-10} width={28} height={20} rx={2}
              fill="none" stroke="white" strokeWidth="0.4" />
          </g>
        ))}

        {/* Solder joints / nodes — circles at intersections */}
        {[
          [180,340],[360,220],[520,340],[720,460],[920,340],[1080,460],[1240,580],
          [200,580],[360,460],[520,700],[720,580],[920,700],
          [80,220],[200,340],[360,580],[720,340],[1080,580],[1360,340],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5}
            fill="none" stroke="white" strokeWidth="0.6" />
        ))}

        {/* Data flow arrows along traces */}
        {[
          [260,180,1],[440,340,-1],[820,700,1],[1160,460,-1],
          [400,580,1],[640,460,-1],
        ].map(([x, y, dir], i) => (
          <polygon key={i}
            points={`${x},${y} ${x + dir * 8},${y - 5} ${x + dir * 8},${y + 5}`}
            fill="white" opacity="0.8" />
        ))}

        {/* Corner decorative elements */}
        <rect x={10} y={10} width={60} height={60} rx={4}
          fill="none" stroke="white" strokeWidth="0.5" />
        <rect x={20} y={20} width={40} height={40} rx={2}
          fill="none" stroke="white" strokeWidth="0.35" />
        <rect x={1370} y={10} width={60} height={60} rx={4}
          fill="none" stroke="white" strokeWidth="0.5" />
        <rect x={1380} y={20} width={40} height={40} rx={2}
          fill="none" stroke="white" strokeWidth="0.35" />
        <rect x={10} y={830} width={60} height={60} rx={4}
          fill="none" stroke="white" strokeWidth="0.5" />
        <rect x={1370} y={830} width={60} height={60} rx={4}
          fill="none" stroke="white" strokeWidth="0.5" />
      </svg>

      {/* ── Layer 4: matrix rain canvas ── */}
      <canvas ref={matrixRef} style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        opacity: 0.55,
        mixBlendMode: "screen",
      }} />

      {/* ── Layer 5: horizontal scan-line sweep ── */}
      <div ref={scanRef} style={{
        position: "absolute", left: 0, right: 0,
        height: "2px",
        background: "linear-gradient(90deg, transparent 5%, rgba(80,230,160,0.6) 40%, rgba(160,255,210,0.9) 50%, rgba(80,230,160,0.6) 60%, transparent 95%)",
        boxShadow: "0 0 18px rgba(80,230,160,0.4), 0 0 40px rgba(80,230,160,0.15)",
        animation: "importScanLine 8s linear infinite",
        zIndex: 3,
      }} />

      {/* ── Layer 6: teal-emerald side glows ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 20% 80% at 0% 50%,
            oklch(22% 0.18 165 / 0.20) 0%, transparent 70%
          ),
          radial-gradient(ellipse 20% 80% at 100% 50%,
            oklch(22% 0.18 165 / 0.20) 0%, transparent 70%
          )
        `,
        animation: "importSideGlow 10s ease-in-out infinite alternate",
      }} />

      {/* ── Layer 7: edge vignette ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(
          ellipse 92% 92% at 50% 50%,
          transparent 32%,
          rgba(0,0,0,0.42) 68%,
          rgba(0,0,0,0.80) 100%
        )`,
      }} />

      {/* ── Layer 8: bottom fog ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "28%",
        background: `linear-gradient(to top,
          oklch(5% 0.06 170 / 0.88) 0%,
          oklch(5% 0.06 170 / 0.30) 45%,
          transparent 100%
        )`,
      }} />

      <style>{`
        @keyframes importGlowPulse {
          0%,100% { opacity: 0.7; transform: scale(1);    }
          50%     { opacity: 1.0; transform: scale(1.12); }
        }
        @keyframes importScanLine {
          0%   { top: -4px;          opacity: 0;   }
          3%   { opacity: 1;                        }
          97%  { opacity: 1;                        }
          100% { top: calc(100% + 4px); opacity: 0; }
        }
        @keyframes importSideGlow {
          from { opacity: 0.6; }
          to   { opacity: 1.0; }
        }
      `}</style>
    </div>
  );
}
