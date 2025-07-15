import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime 配置
export const runtime = 'edge';

export async function GET(request: NextRequest, context?: any) {
  try {
    // 检查运行环境
    const isCloudflare = typeof globalThis.process === 'undefined' || globalThis.process.env.CLOUDFLARE_PAGES === '1';
    
    // 调试信息
    const debugInfo = {
      environment: {
        isCloudflare,
        runtime: typeof globalThis.process !== 'undefined' ? globalThis.process.env.NEXT_RUNTIME : 'edge',
        nodeEnv: typeof globalThis.process !== 'undefined' ? globalThis.process.env.NODE_ENV : 'unknown',
      },
      context: {
        hasContext: !!context,
        contextType: typeof context,
        hasEnv: !!(context?.env),
        hasDB: !!(context?.env?.DB),
        envKeys: context?.env ? Object.keys(context.env) : [],
      },
      // 尝试不同的参数访问方式
      alternativeAccess: {
        // 检查是否有其他方式访问环境
        globalEnv: typeof globalThis !== 'undefined' ? (globalThis as any).env : null,
        processEnv: typeof globalThis.process !== 'undefined' ? !!globalThis.process.env : false,
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}