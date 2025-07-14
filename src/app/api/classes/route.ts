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
  const { name } = await request.json();
  const newClass = await prisma.class.create({
    data: {
      name,
    },
  });
  return NextResponse.json(newClass);
}
