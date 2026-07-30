"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="icon-btn" title="Log out" aria-label="Log out" onClick={logout}>
      <LogOut size={15} aria-hidden="true" />
    </button>
  );
}
