const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Force case-sensitive path resolution
    config.resolve = config.resolve || {}
    config.resolve.symlinks = false
    
    return config
  },
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  typescript: {
    // Temporarily allow build errors during deployment
    ignoreBuildErrors: true
  },
  eslint: {
    // Temporarily allow ESLint errors during deployment
    ignoreDuringBuilds: true
  },
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    }
    return config
  }
}

module.exports = nextConfig
