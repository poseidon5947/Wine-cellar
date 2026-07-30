import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.WINE_CELLAR_DESKTOP_BUILD === "1" ? "standalone" : undefined
};

export default nextConfig;
