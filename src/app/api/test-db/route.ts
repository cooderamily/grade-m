import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// Edge Runtime 配置
export const runtime = 'edge';

// 标准的 Cloudflare Pages Functions 签名
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/test-db - 开始测试数据库连接');
    
    // 尝试获取数据库连接
    const prisma = getDatabase();
    
    console.log('数据库连接成功，尝试查询');
    
    // 简单测试查询
    const classCount = await prisma.class.count();
    const studentCount = await prisma.student.count();
    
    console.log('查询成功，返回结果');
    
    return NextResponse.json({
      success: true,
      data: {
        classCount,
        studentCount,
        timestamp: new Date().toISOString(),
        environment: 'production'
      }
    });
    
  } catch (error) {
    console.error('数据库测试失败:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}