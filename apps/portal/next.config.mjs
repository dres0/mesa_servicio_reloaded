/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@mesa-servicio/shared'],
  async rewrites() {
    return [
      {
        // En dev, proxea /api/* a Azure Functions corriendo en :7071
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7071/api'}/:path*`,
      },
    ]
  },
}

export default nextConfig
