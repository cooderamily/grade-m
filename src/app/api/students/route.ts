import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// Edge Runtime 配置
export const runtime = 'edge';
// 标记为动态路由
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const prisma = getDatabase();
  
  try {
    const classId = request.nextUrl.searchParams.get('classId');

    if (classId) {
      // 根据班级获取学生
      const students = await prisma.student.findMany({
        where: { classId: parseInt(classId) },
        include: { class: true }
      });
      return NextResponse.json(students);
    } else {
      // 获取所有学生
      const students = await prisma.student.findMany({
        include: { class: true }
      });
      return NextResponse.json(students);
    }
  } catch (error) {
    console.error('获取学生列表失败:', error);
    return NextResponse.json(
      { error: '获取学生列表失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  const prisma = getDatabase();
  
  try {
    const { name, classId } = await request.json();
    
    if (!name || name.trim() === '' || !classId) {
      return NextResponse.json(
        { error: '学生姓名和班级不能为空' },
        { status: 400 }
      );
    }

    const newStudent = await prisma.student.create({
      data: {
        name: name.trim(),
        classId: parseInt(classId),
      },
      include: {
        class: true
      }
    });
    return NextResponse.json(newStudent);
  } catch (error) {
    console.error('创建学生失败:', error);
    return NextResponse.json(
      { error: '创建学生失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  const prisma = getDatabase();
  
  try {
    const { id, name, classId } = await request.json();
    
    if (!id || !name || name.trim() === '' || !classId) {
      return NextResponse.json(
        { error: '学生ID、姓名和班级不能为空' },
        { status: 400 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { 
        name: name.trim(),
        classId: parseInt(classId)
      },
      include: {
        class: true
      }
    });
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('更新学生失败:', error);
    return NextResponse.json(
      { error: '更新学生失败' },
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
        { error: '学生ID不能为空' },
        { status: 400 }
      );
    }

    // 检查学生是否有成绩记录
    const studentWithScores = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: { scores: true }
    });

    if (studentWithScores && studentWithScores.scores.length > 0) {
      return NextResponse.json(
        { error: '不能删除有成绩记录的学生，请先删除相关成绩' },
        { status: 400 }
      );
    }

    await prisma.student.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ message: '学生删除成功' });
  } catch (error) {
    console.error('删除学生失败:', error);
    return NextResponse.json(
      { error: '删除学生失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
