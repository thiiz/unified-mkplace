import type { NextConfig } from 'next';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**'
      }
    ]
  },
  transpilePackages: ['geist'],
  // Permite requisições cross-origin do cloudflared durante desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['*.trycloudflare.com']
  })
};

let configWithPlugins = baseConfig;

const nextConfig = configWithPlugins;
export default nextConfig;
