import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// 标记为动态路由
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('studentId');
    const subject = request.nextUrl.searchParams.get('subject');

    if (!studentId) {
      return NextResponse.json(
        { error: '缺少学生ID参数' },
        { status: 400 }
      );
    }

    // 获取学生基本信息
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      include: { class: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: '学生不存在' },
        { status: 404 }
      );
    }

    // 获取学生成绩历史
    const scoreHistory = await prisma.score.findMany({
      where: {
        studentId: parseInt(studentId),
        ...(subject && { subject: subject })
      },
      include: {
        exam: true
      },
      orderBy: {
        exam: {
          date: 'asc'
        }
      }
    });

    // 计算排名（按班级）
    const rankings = [];
    for (const score of scoreHistory) {
      // 获取同班级同考试同科目的所有成绩
      const classScores = await prisma.score.findMany({
        where: {
          examId: score.examId,
          subject: score.subject,
          student: {
            classId: student.classId
          }
        },
        orderBy: {
          score: 'desc'
        }
      });

      const rank = classScores.findIndex(s => s.id === score.id) + 1;
      rankings.push({
        examId: score.examId,
        subject: score.subject,
        rank,
        totalStudents: classScores.length
      });
    }

    // 计算科目平均分
    const subjectAverages: Record<string, number> = {};
    const subjects = ['CHINESE', 'MATH', 'ENGLISH'];
    
    for (const subj of subjects) {
      const subjectScores = scoreHistory.filter(s => s.subject === subj);
      if (subjectScores.length > 0) {
        const average = subjectScores.reduce((sum, s) => sum + s.score, 0) / subjectScores.length;
        subjectAverages[subj] = Math.round(average * 100) / 100;
      }
    }

    return NextResponse.json({
      student,
      scoreHistory,
      rankings,
      subjectAverages,
      totalExams: scoreHistory.length > 0 ? 
        Array.from(new Set(scoreHistory.map(s => s.examId))).length : 0
    });

  } catch (error) {
    console.error('获取学生分析数据失败:', error);
    return NextResponse.json(
      { error: '获取学生分析数据失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 