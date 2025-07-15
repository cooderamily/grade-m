import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// 在开发环境中设置 Cloudflare 平台
if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 兼容性配置
  images: {
    unoptimized: true,
  },
  experimental: {
    runtime: "experimental-edge",
  },
};

export default nextConfig;
