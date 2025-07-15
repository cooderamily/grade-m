/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 兼容性配置
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
