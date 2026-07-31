import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";
import { Wine } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #8b1a1a 0%, #b22222 100%)",
              boxShadow: "0 8px 30px rgba(139,26,26,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
            }}
          >
            <Wine size={30} className="text-white" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "#1a2e28" }}>
            Wine Cellar
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#6a9080" }}>
            Enter your cellar password to continue
          </p>
        </div>

        {/* Card */}
        <div
          className="glass-card p-8"
          style={{
            background: "white",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 0 40px rgba(139,26,26,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"
          }}
        >
          <Suspense fallback={<div className="text-sm" style={{ color: "#6a9080" }}>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "#8aaa9a" }}>
          Secured personal collection management
        </p>
      </div>
    </div>
  );
}
