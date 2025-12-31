/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用静态导出，后期可直接用 Capacitor 打包成 App
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
