import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// 标记为动态路由
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context?: any) {
  const prisma = getDatabase(context);
  
  try {
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
    
    return NextResponse.json(classes);
  } catch (error) {
    console.error('获取班级列表失败:', error);
    return NextResponse.json(
      { error: '获取班级列表失败' },
      { status: 500 }
    );
  } finally {
    if (context?.env?.DB) {
      // D1 connections are automatically managed
    } else {
      await prisma.$disconnect();
    }
  }
}

export async function POST(request: Request) {
  const prisma = getDatabase();
  
  try {
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
    return NextResponse.json(newClass);
  } catch (error) {
    console.error('创建班级失败:', error);
    return NextResponse.json(
      { error: '创建班级失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  const prisma = getDatabase();
  
  try {
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
    
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('更新班级失败:', error);
    return NextResponse.json(
      { error: '更新班级失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  const prisma = getDatabase();
  
  try {
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
    
    return NextResponse.json({ message: '班级删除成功' });
  } catch (error) {
    console.error('删除班级失败:', error);
    return NextResponse.json(
      { error: '删除班级失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
