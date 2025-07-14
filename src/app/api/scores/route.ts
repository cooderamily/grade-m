import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const scores = await prisma.score.findMany({
      include: {
        student: {
          include: {
            class: true
          }
        },
        exam: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(scores);
  } catch (error) {
    console.error('获取成绩数据失败:', error);
    return NextResponse.json(
      { error: '获取成绩数据失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, examId, subject, score } = body;

    // 验证输入数据
    if (!studentId || !examId || !subject || score === undefined) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }

    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: '成绩必须在0-100之间' },
        { status: 400 }
      );
    }

    // 检查是否已存在该学生该考试该科目的成绩
    const existingScore = await prisma.score.findFirst({
      where: {
        studentId: parseInt(studentId),
        examId: parseInt(examId),
        subject: subject
      }
    });

    if (existingScore) {
      return NextResponse.json(
        { error: '该学生在此考试的该科目成绩已存在，请修改而非重复录入' },
        { status: 409 }
      );
    }

    // 创建新成绩记录
    const newScore = await prisma.score.create({
      data: {
        studentId: parseInt(studentId),
        examId: parseInt(examId),
        subject: subject,
        score: parseFloat(score)
      },
      include: {
        student: {
          include: {
            class: true
          }
        },
        exam: true
      }
    });

    return NextResponse.json(newScore, { status: 201 });

  } catch (error) {
    console.error('创建成绩记录失败:', error);
    return NextResponse.json(
      { error: '创建成绩记录失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
