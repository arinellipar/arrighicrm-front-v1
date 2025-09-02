import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configurações para melhorar o tratamento de erros em produção
  experimental: {
    // Melhor handling de erros em produção
    serverComponentsExternalPackages: [],
  },
  // Configurações de produção para evitar erros de hidratação
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // Configurações de build para melhor debugging
  productionBrowserSourceMaps: false,
  // Configurações de runtime para evitar erros
  swcMinify: true,
};

export default nextConfig;
