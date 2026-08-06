import type { CSSProperties, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  overflow?: boolean;
}

/**
 * Kept as a compatibility wrapper for dashboard KPI cards.
 * The cards are intentionally static so highlights do not move around them.
 */
export function TiltCard({ children, className = "", style, overflow }: TiltCardProps) {
  return (
    <div
      className={`glass-card${overflow ? " glass-card-overflow" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
