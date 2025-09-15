/** @type {import('next').NextConfig} */
const baseConfig = { 
  reactStrictMode: true,
  // Improve development experience
  ...(process.env.NODE_ENV === 'development' && {
    // Development file watching tweaks
    webpack: (config: any, { dev, isServer }: any) => {
      if (dev && !isServer) {
        // Watch for changes in content directory
        config.watchOptions = {
          ...config.watchOptions,
          ignored: /node_modules/,
          aggregateTimeout: 300,
          poll: 1000,
        };
      }
      return config;
    },
  }),
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default baseConfig;
