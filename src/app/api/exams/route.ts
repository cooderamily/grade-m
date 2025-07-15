import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: {
        date: 'desc'
      }
    });
    return NextResponse.json(exams);
  } catch (error) {
    console.error('获取考试数据失败:', error);
    return NextResponse.json(
      { error: '获取考试数据失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const { name, date } = await request.json();
    
    if (!name || name.trim() === '' || !date) {
      return NextResponse.json(
        { error: '考试名称和日期不能为空' },
        { status: 400 }
      );
    }

    const newExam = await prisma.exam.create({
      data: {
        name: name.trim(),
        date: new Date(date),
      },
    });
    return NextResponse.json(newExam);
  } catch (error) {
    console.error('创建考试失败:', error);
    return NextResponse.json(
      { error: '创建考试失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, date } = await request.json();
    
    if (!id || !name || name.trim() === '' || !date) {
      return NextResponse.json(
        { error: '考试ID、名称和日期不能为空' },
        { status: 400 }
      );
    }

    const updatedExam = await prisma.exam.update({
      where: { id: parseInt(id) },
      data: { 
        name: name.trim(),
        date: new Date(date)
      }
    });
    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error('更新考试失败:', error);
    return NextResponse.json(
      { error: '更新考试失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '考试ID不能为空' },
        { status: 400 }
      );
    }

    // 检查考试是否有成绩记录
    const examWithScores = await prisma.exam.findUnique({
      where: { id: parseInt(id) },
      include: { scores: true }
    });

    if (examWithScores && examWithScores.scores.length > 0) {
      return NextResponse.json(
        { error: '不能删除有成绩记录的考试，请先删除相关成绩' },
        { status: 400 }
      );
    }

    await prisma.exam.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ message: '考试删除成功' });
  } catch (error) {
    console.error('删除考试失败:', error);
    return NextResponse.json(
      { error: '删除考试失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
