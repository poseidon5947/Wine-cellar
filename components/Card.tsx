import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Add overflow-hidden for cards containing tables/images */
  overflow?: boolean;
}

/**
 * Glass card with a quiet static border.
 */
export function Card({ children, className = "", style, overflow }: CardProps) {
  return (
    <div
      className={`glass-card${overflow ? " glass-card-overflow" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
