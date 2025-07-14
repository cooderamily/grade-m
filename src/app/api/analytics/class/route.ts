import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subject = searchParams.get('subject');

    if (!classId) {
      return NextResponse.json(
        { error: '缺少班级ID参数' },
        { status: 400 }
      );
    }

    // 获取班级基本信息
    const classInfo = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
      include: { 
        students: true 
      }
    });

    if (!classInfo) {
      return NextResponse.json(
        { error: '班级不存在' },
        { status: 404 }
      );
    }

    // 获取班级成绩数据
    const classScores = await prisma.score.findMany({
      where: {
        student: {
          classId: parseInt(classId)
        },
        ...(subject && { subject: subject })
      },
      include: {
        student: true,
        exam: true
      },
      orderBy: {
        exam: {
          date: 'desc'
        }
      }
    });

    // 按考试和科目分组计算平均分
    const examSubjectAverages: Record<string, Record<string, number>> = {};
    const scoreDistribution: Record<string, number[]> = {};

    // 获取所有考试和科目组合
    const examSubjectCombos = new Set();
    for (const score of classScores) {
      const key = `${score.examId}-${score.subject}`;
      examSubjectCombos.add(key);
    }

    // 计算每个考试-科目组合的统计数据
    for (const combo of Array.from(examSubjectCombos)) {
      const [examId, subjectKey] = (combo as string).split('-');
      const scores = classScores.filter(s => 
        s.examId === parseInt(examId) && s.subject === subjectKey
      );

      if (scores.length > 0) {
        // 计算平均分
        const average = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
        
        if (!examSubjectAverages[examId]) {
          examSubjectAverages[examId] = {};
        }
        examSubjectAverages[examId][subjectKey] = Math.round(average * 100) / 100;

        // 成绩分布（分数区间）
        const distributionKey = `${examId}-${subjectKey}`;
        const scoreRanges = [0, 0, 0, 0, 0]; // 0-59, 60-69, 70-79, 80-89, 90-100
        
        for (const score of scores) {
          if (score.score < 60) scoreRanges[0]++;
          else if (score.score < 70) scoreRanges[1]++;
          else if (score.score < 80) scoreRanges[2]++;
          else if (score.score < 90) scoreRanges[3]++;
          else scoreRanges[4]++;
        }
        
        scoreDistribution[distributionKey] = scoreRanges;
      }
    }

    // 计算整体统计
    const subjects = ['CHINESE', 'MATH', 'ENGLISH'];
    const subjectStats: Record<string, any> = {};
    
    for (const subj of subjects) {
      const subjectScores = classScores.filter(s => s.subject === subj);
      if (subjectScores.length > 0) {
        const scores = subjectScores.map(s => s.score);
        const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);
        
        subjectStats[subj] = {
          average: Math.round(average * 100) / 100,
          highest,
          lowest,
          count: scores.length
        };
      }
    }

    // 获取考试信息
    const examIds = Array.from(new Set(classScores.map(s => s.examId)));
    const exams = await prisma.exam.findMany({
      where: {
        id: { in: examIds }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({
      classInfo,
      examSubjectAverages,
      scoreDistribution,
      subjectStats,
      exams,
      totalStudents: classInfo.students.length,
      totalScores: classScores.length
    });

  } catch (error) {
    console.error('获取班级分析数据失败:', error);
    return NextResponse.json(
      { error: '获取班级分析数据失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 