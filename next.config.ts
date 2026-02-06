import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Augmentation des limites de compilation
  experimental: {
    // Limite mémoire pour le build (en Mo)
    workerThreads: true,
    cpus: 4,
  },

  // Configuration des images
  images: {
    // Domaines autorisés pour les images externes
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Taille maximale des images (en pixels)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Formats d'image optimisés
    formats: ["image/avif", "image/webp"],
  },

  // Désactiver les indicateurs de développement en production
  devIndicators: false,

  // Optimisations de production
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  // Configuration des headers de sécurité
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },

  // Timeout pour les pages statiques (en secondes)
  staticPageGenerationTimeout: 120,

  // Configuration webpack personnalisée
  webpack: (config, { isServer }) => {
    // Augmenter la limite de taille des assets
    config.performance = {
      ...config.performance,
      maxAssetSize: 1024 * 1024, // 1 MB
      maxEntrypointSize: 1024 * 1024, // 1 MB
    };
    return config;
  },
};

export default nextConfig;
