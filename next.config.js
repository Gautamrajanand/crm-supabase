/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
}

module.exports = nextConfig
