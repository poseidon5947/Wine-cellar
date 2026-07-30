import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Add overflow-hidden for cards containing tables/images */
  overflow?: boolean;
}

/**
 * Glass card with animated travelling border-light effect.
 * The `.border-beam-glow` span provides the blurred outer bloom layer
 * that sits behind the crisp ::after beam ring.
 */
export function Card({ children, className = "", style, overflow }: CardProps) {
  return (
    <div
      className={`glass-card${overflow ? " glass-card-overflow" : ""} ${className}`}
      style={style}
    >
      {/* blurred outer glow bloom — tracks the same conic angle as ::after */}
      <span className="border-beam-glow" aria-hidden="true" />
      {children}
    </div>
  );
}
