import type { NextConfig } from "next";

// Proxy backend API in both dev and prod when frontend calls "/api/..."
// Set API_PROXY_TARGET in the deployment (e.g., https://<backend>/api)
const API_PROXY_TARGET = process.env.API_PROXY_TARGET;

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    if (API_PROXY_TARGET) {
      return {
        beforeFiles: [],
        afterFiles: [
          {
            source: "/api/:path*",
            destination: `${API_PROXY_TARGET}/:path*`,
          },
        ],
        fallback: [],
      };
    }
    return { beforeFiles: [], afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
