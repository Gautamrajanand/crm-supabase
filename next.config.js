/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  experimental: {
    optimizeFonts: false,
  },
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
}

module.exports = nextConfig
