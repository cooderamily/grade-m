import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

declare global {
  var __db__: PrismaClient | undefined;
}

function createPrismaClient() {
  // 在 Cloudflare Workers 环境中
  if (typeof process === 'undefined' || !process.env.NODE_ENV) {
    // 这里需要从 context 获取 D1 绑定
    // 在实际使用时会通过参数传入
    throw new Error('D1 database binding not available');
  }

  // 在本地开发环境中使用 SQLite
  if (process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL?.startsWith('file:')) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  // 生产环境使用原始连接字符串
  return new PrismaClient({
    log: ['error'],
  });
}

// Cloudflare Workers 环境下的 Prisma 客户端
export function createD1PrismaClient(d1: any) {
  const adapter = new PrismaD1(d1);
  // @ts-ignore - Prisma adapter types
  return new PrismaClient({ 
    adapter,
    log: ['error'],
  });
}

// 获取数据库实例的辅助函数
export function getDatabase(context?: any) {
  // 在 Cloudflare Workers 环境中
  if (context?.env?.DB) {
    return createD1PrismaClient(context.env.DB);
  }
  
  // 本地开发环境
  return db;
}

// 全局 Prisma 客户端（用于本地开发）
export const db = globalThis.__db__ ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__db__ = db;
} 