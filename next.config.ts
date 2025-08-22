import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features for better compatibility
  experimental: {
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: ['antd', '@ant-design/icons'],
  },

  // Webpack configuration to resolve module issues
  webpack: (config, { dev, isServer }) => {
    // Fix for module resolution issues in development
    if (dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Suppress specific warnings from third-party libraries
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Error: Can't resolve 'next-flight-client-entry-loader'/,
    ];

    return config;
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Suppress specific console warnings in development
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;
