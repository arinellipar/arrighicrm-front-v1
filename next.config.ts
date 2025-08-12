import type { NextConfig } from "next";

// Proxy backend API in both dev and prod when frontend calls "/api/..."
// Set API_PROXY_TARGET in the deployment (e.g., https://<backend>/api)
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET || "http://localhost:5000/api";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/:path*`,
      },
    ];
  },
};

export default nextConfig;
