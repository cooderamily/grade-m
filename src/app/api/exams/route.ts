import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

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
  const { name, date } = await request.json();
  const newExam = await prisma.exam.create({
    data: {
      name,
      date,
    },
  });
  return NextResponse.json(newExam);
}
