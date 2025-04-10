/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'hrszgibuxhsvtdreujqw.supabase.co',
        pathname: '**',
      },
    ],
  },
  experimental: {
    turboDrive: true,
  },
  distDir: '.next',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig 