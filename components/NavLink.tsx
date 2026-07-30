"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  icon,
  label
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();

  /* exact match for "/", prefix match for everything else */
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`nav-link${isActive ? " nav-link-active" : ""}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
