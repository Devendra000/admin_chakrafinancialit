/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    domains: ['admin.chakrafinancialit.me', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.chakrafinancialit.me',
        port: '',
        pathname: '/**'
      }
    ]
  },
}

export default nextConfig
