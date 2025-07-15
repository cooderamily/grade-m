import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

declare global {
  var __db__: PrismaClient | undefined;
}

// Cloudflare Workers 环境下的 Prisma 客户端
export function createD1PrismaClient(d1: any) {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ 
    adapter,
    log: ['error'],
  });
}

// 获取数据库实例的辅助函数
export function getDatabase(context?: any) {
  // 在 Cloudflare Workers/Edge Runtime 环境中
  if (context?.env?.DB) {
    return createD1PrismaClient(context.env.DB);
  }
  
  // 检查是否在 Edge Runtime 中运行但没有 D1 绑定
  if ((globalThis as any).EdgeRuntime !== undefined || process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('D1 database binding not available in Edge Runtime');
  }
  
  // 本地开发环境
  if (process.env.NODE_ENV !== 'production') {
    if (!globalThis.__db__) {
      globalThis.__db__ = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return globalThis.__db__;
  }
  
  // 生产环境构建时的占位符
  return new PrismaClient({
    log: ['error'],
  });
} 