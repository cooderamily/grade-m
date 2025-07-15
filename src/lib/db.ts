import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { getCloudflareBinding, getEnvironmentInfo } from './cloudflare-env';

declare global {
  var __db__: PrismaClient | undefined;
}

// Cloudflare Workers 环境下的 Prisma 客户端
export function createD1PrismaClient(d1: any) {
  console.log('创建 D1 Prisma 客户端');
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ 
    adapter,
    log: ['error'],
  });
}

// 获取数据库实例的辅助函数
export function getDatabase() {
  console.log('getDatabase: 开始获取数据库连接');
  
  const envInfo = getEnvironmentInfo();
  console.log('环境信息:', envInfo);
  
  // 在 Cloudflare 环境中，尝试获取 D1 绑定
  const d1Binding = getCloudflareBinding('DB');
  if (d1Binding) {
    console.log('使用 D1 数据库连接');
    try {
      return createD1PrismaClient(d1Binding);
    } catch (error) {
      console.error('创建 D1 客户端失败:', error);
      throw new Error(`D1 client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // 本地开发环境
  if (envInfo.hasProcess && envInfo.nodeEnv !== 'production') {
    console.log('使用本地开发环境数据库连接');
    if (!globalThis.__db__) {
      globalThis.__db__ = new PrismaClient({
        log: envInfo.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return globalThis.__db__;
  }
  
  // 无法获取数据库连接
  const errorMessage = `无法获取数据库连接。环境信息: ${JSON.stringify(envInfo)}`;
  console.error(errorMessage);
  throw new Error(errorMessage);
} 