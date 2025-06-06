/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

module.exports = nextConfig
