"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  overflow?: boolean;
}

/**
 * Wraps a Card with:
 *  - 3D perspective tilt toward the cursor (rotateX / rotateY)
 *  - Mouse-tracked radial spotlight that moves with the pointer
 *  - Subtle lift + brightness boost on hover
 */
export function TiltCard({ children, className = "", style, overflow }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number>(0);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;   // px from left edge
      const y = e.clientY - rect.top;    // px from top edge
      const cx = rect.width  / 2;
      const cy = rect.height / 2;

      // max tilt ±10 degrees
      const rotY =  ((x - cx) / cx) * 10;
      const rotX = -((y - cy) / cy) * 10;

      el.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;

      // move spotlight
      if (spotRef.current) {
        spotRef.current.style.left = `${x}px`;
        spotRef.current.style.top  = `${y}px`;
        spotRef.current.style.opacity = "1";
      }
    });
  }

  function onMouseLeave() {
    cancelAnimationFrame(frameRef.current);
    const el = ref.current;
    if (el) el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    if (spotRef.current) spotRef.current.style.opacity = "0";
  }

  return (
    <div
      ref={ref}
      className={`glass-card tilt-card${overflow ? " glass-card-overflow" : ""} ${className}`}
      style={{
        ...style,
        willChange: "transform",
        transformStyle: "preserve-3d",
        transition: "transform 0.1s ease-out, box-shadow 0.3s ease",
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* border beam bloom */}
      <span className="border-beam-glow" aria-hidden="true" />

      {/* Mouse-tracked spotlight */}
      <span
        ref={spotRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          pointerEvents: "none",
          zIndex: 3,
          width: "240px",
          height: "240px",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(139,26,26,0.06) 40%, transparent 70%)",
          opacity: 0,
          transition: "opacity 0.25s ease",
          mixBlendMode: "screen",
        }}
      />

      {children}
    </div>
  );
}
