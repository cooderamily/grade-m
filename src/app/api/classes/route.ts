import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        students: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(classes);
  } catch (error) {
    console.error('获取班级数据失败:', error);
    return NextResponse.json(
      { error: '获取班级数据失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
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
  try {
    const { id, name } = await request.json();
    
    if (!id || !name || name.trim() === '') {
      return NextResponse.json(
        { error: '班级ID和名称不能为空' },
        { status: 400 }
      );
    }

    const updatedClass = await prisma.class.update({
      where: { id: parseInt(id) },
      data: { name: name.trim() },
      include: {
        students: true
      }
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '班级ID不能为空' },
        { status: 400 }
      );
    }

    // 检查班级是否有学生
    const classWithStudents = await prisma.class.findUnique({
      where: { id: parseInt(id) },
      include: { students: true }
    });

    if (classWithStudents && classWithStudents.students.length > 0) {
      return NextResponse.json(
        { error: '不能删除含有学生的班级，请先删除班级内的学生' },
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
