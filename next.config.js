/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/get-messages',
        destination: '/api/get-messages',
      },
      {
        source: '/api/chat',
        destination: '/api/chat',
      },
      {
        source: '/api/create-chat',
        destination: '/api/create-chat',
      },
      // Add other API rewrites if needed
    ];
  },
  experimental: {
    runtime: 'nodejs',
  },
};

module.exports = nextConfig;
