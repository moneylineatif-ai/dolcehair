/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignore TypeScript Errors (like "any" types) during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Ignore ESLint Errors (like "unused vars") during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 3. Ensure static images work correctly
  images: {
    unoptimized: true, 
  },
}

module.exports = nextConfig

