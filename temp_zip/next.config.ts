import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ['@prisma/client', 'prisma'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/.prisma/client/*.node']
  }
};

export default nextConfig;