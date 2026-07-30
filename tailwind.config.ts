import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#f5f0e8",
        cellar: "#8b1a1a",
        "cellar-light": "#b22222",
        "cellar-dark": "#5c0f0f",
        cork: "#c8a56a",
        "cork-light": "#e0c48a",
        slateleaf: "#61756a",
        gold: "#d4af37",
        "gold-light": "#f0d060",
        "gold-dim": "#9a7c22",
        obsidian: "#0d0a0b",
        "deep-wine": "#1a0a0d",
        "mid-wine": "#2d0f14",
        "surface": "#1e1219",
        "surface-2": "#281620",
        "surface-3": "#341c2a",
        muted: "#8a7080",
        "muted-light": "#b09aa8"
      },
      boxShadow: {
        soft: "0 16px 50px -30px rgb(25 23 21 / 0.35)",
        glow: "0 0 20px rgba(139, 26, 26, 0.4), 0 0 60px rgba(139, 26, 26, 0.2)",
        "gold-glow": "0 0 15px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)",
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        card: "0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)"
      },
      backgroundImage: {
        "radial-cellar": "radial-gradient(ellipse at top, #2d0f14 0%, #0d0a0b 70%)",
        "gold-gradient": "linear-gradient(135deg, #d4af37 0%, #f0d060 50%, #c8a56a 100%)",
        "cellar-gradient": "linear-gradient(135deg, #8b1a1a 0%, #b22222 50%, #5c0f0f 100%)",
        "glass-card": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "shine": "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)"
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "serif"]
      },
      animation: {
        "float-slow": "floatSlow 8s ease-in-out infinite",
        "float-medium": "floatMedium 6s ease-in-out infinite",
        "float-fast": "floatFast 4s ease-in-out infinite",
        "pulse-gold": "pulseGold 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "spin-slow": "spin 20s linear infinite"
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "33%": { transform: "translateY(-30px) translateX(15px)" },
          "66%": { transform: "translateY(-15px) translateX(-10px)" }
        },
        floatMedium: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" }
        },
        floatFast: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-12px) scale(1.05)" }
        },
        pulseGold: {
          "0%, 100%": { opacity: "0.6", boxShadow: "0 0 10px rgba(212,175,55,0.2)" },
          "50%": { opacity: "1", boxShadow: "0 0 25px rgba(212,175,55,0.5)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};

export default config;
