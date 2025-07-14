import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    let students;
    if (classId) {
      // 根据班级ID查询学生
      students = await prisma.student.findMany({
        where: {
          classId: parseInt(classId)
        },
        include: {
          class: true
        },
        orderBy: {
          name: 'asc'
        }
      });
    } else {
      // 查询所有学生
      students = await prisma.student.findMany({
        include: {
          class: true
        },
        orderBy: {
          name: 'asc'
        }
      });
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error('获取学生数据失败:', error);
    return NextResponse.json(
      { error: '获取学生数据失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  const { name, classId } = await request.json();
  const newStudent = await prisma.student.create({
    data: {
      name,
      classId,
    },
  });
  return NextResponse.json(newStudent);
}
