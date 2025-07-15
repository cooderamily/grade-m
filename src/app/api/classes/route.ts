import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// Edge Runtime 配置
export const runtime = 'edge';
// 标记为动态路由
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let prisma;
  
  try {
    console.log('GET /api/classes - 开始获取班级列表');
    prisma = getDatabase();
    
    const classes = await prisma.class.findMany({
      include: {
        students: true,
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('获取班级列表成功，数量:', classes.length);
    return NextResponse.json(classes);
  } catch (error) {
    console.error('获取班级列表失败:', error);
    return NextResponse.json(
      { error: '获取班级列表失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma && typeof prisma.$disconnect === 'function') {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.warn('数据库断开连接失败:', disconnectError);
      }
    }
  }
}

export async function POST(request: NextRequest) {
  let prisma;
  
  try {
    console.log('POST /api/classes - 开始创建班级');
    prisma = getDatabase();
    
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: '班级名称不能为空' },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
      },
      include: {
        students: true
      }
    });
    
    console.log('创建班级成功:', newClass.name);
    return NextResponse.json(newClass);
  } catch (error) {
    console.error('创建班级失败:', error);
    return NextResponse.json(
      { error: '创建班级失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma && typeof prisma.$disconnect === 'function') {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.warn('数据库断开连接失败:', disconnectError);
      }
    }
  }
}

export async function PUT(request: NextRequest) {
  let prisma;
  
  try {
    console.log('PUT /api/classes - 开始更新班级');
    prisma = getDatabase();
    
    const { id, name } = await request.json();
    
    if (!id || !name || name.trim() === '') {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const updatedClass = await prisma.class.update({
      where: { id: parseInt(id) },
      data: { name: name.trim() },
      include: { students: true }
    });
    
    console.log('更新班级成功:', updatedClass.name);
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('更新班级失败:', error);
    return NextResponse.json(
      { error: '更新班级失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma && typeof prisma.$disconnect === 'function') {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.warn('数据库断开连接失败:', disconnectError);
      }
    }
  }
}

export async function DELETE(request: NextRequest) {
  let prisma;
  
  try {
    console.log('DELETE /api/classes - 开始删除班级');
    prisma = getDatabase();
    
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少班级ID参数' },
        { status: 400 }
      );
    }

    // 检查是否有学生
    const studentsCount = await prisma.student.count({
      where: { classId: parseInt(id) }
    });

    if (studentsCount > 0) {
      return NextResponse.json(
        { error: '该班级还有学生，无法删除' },
        { status: 400 }
      );
    }

    await prisma.class.delete({
      where: { id: parseInt(id) }
    });
    
    console.log('删除班级成功，ID:', id);
    return NextResponse.json({ message: '班级删除成功' });
  } catch (error) {
    console.error('删除班级失败:', error);
    return NextResponse.json(
      { error: '删除班级失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma && typeof prisma.$disconnect === 'function') {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.warn('数据库断开连接失败:', disconnectError);
      }
    }
  }
}
