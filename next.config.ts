import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid Next.js DevTools indicator drag bug:
  // "releasePointerCapture: No active pointer with the given id is found"
  devIndicators: false,
};

export default nextConfig;
