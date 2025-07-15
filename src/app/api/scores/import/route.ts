import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// Edge Runtime 配置
export const runtime = 'edge';

export async function POST(request: NextRequest, context?: any) {
  const prisma = getDatabase(context);
  
  try {
    const body = await request.json();
    const { scores } = body;

    if (!scores || !Array.isArray(scores)) {
      return NextResponse.json(
        { error: '缺少成绩数据或格式错误' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // 批量处理成绩数据
    for (let i = 0; i < scores.length; i++) {
      const scoreData = scores[i];
      
      try {
        // 确保所有文本字段都是字符串类型
        const studentName = String(scoreData.studentName || '').trim();
        const className = String(scoreData.className || '').trim();
        const examName = String(scoreData.examName || '').trim();
        const subjectInput = String(scoreData.subject || '').trim();

        // 验证必要字段
        if (!studentName || !className || !examName || !subjectInput || scoreData.score === undefined) {
          results.failed++;
          results.errors.push(`第${i + 1}行: 缺少必要字段`);
          continue;
        }

        // 验证分数范围
        const score = parseFloat(scoreData.score);
        if (isNaN(score) || score < 0 || score > 100) {
          results.failed++;
          results.errors.push(`第${i + 1}行: 分数应在0-100之间`);
          continue;
        }

        // 验证科目
        const validSubjects = ['CHINESE', 'MATH', 'ENGLISH', '语文', '数学', '英语'];
        let subject: string;
        
        if (subjectInput === '语文' || subjectInput === 'CHINESE') {
          subject = 'CHINESE';
        } else if (subjectInput === '数学' || subjectInput === 'MATH') {
          subject = 'MATH';
        } else if (subjectInput === '英语' || subjectInput === 'ENGLISH') {
          subject = 'ENGLISH';
        } else {
          results.failed++;
          results.errors.push(`第${i + 1}行: 无效的科目 "${subjectInput}"`);
          continue;
        }

        // 查找或创建班级
        let classRecord = await prisma.class.findFirst({
          where: { name: className }
        });

        if (!classRecord) {
          classRecord = await prisma.class.create({
            data: { name: className }
          });
        }

        // 查找或创建学生
        let student = await prisma.student.findFirst({
          where: {
            name: studentName,
            classId: classRecord.id
          }
        });

        if (!student) {
          student = await prisma.student.create({
            data: {
              name: studentName,
              classId: classRecord.id
            }
          });
        }

        // 查找或创建考试
        let exam = await prisma.exam.findFirst({
          where: { name: examName }
        });

        if (!exam) {
          // 如果没有提供考试日期，使用当前日期
          const examDate = scoreData.examDate ? new Date(scoreData.examDate) : new Date();
          exam = await prisma.exam.create({
            data: {
              name: examName,
              date: examDate
            }
          });
        }

        // 检查是否已存在该成绩记录
        const existingScore = await prisma.score.findFirst({
          where: {
            studentId: student.id,
            examId: exam.id,
            subject: subject
          }
        });

        if (existingScore) {
          // 更新现有记录
          await prisma.score.update({
            where: { id: existingScore.id },
            data: { score: score }
          });
        } else {
          // 创建新记录
          await prisma.score.create({
            data: {
              studentId: student.id,
              examId: exam.id,
              subject: subject,
              score: score
            }
          });
        }

        results.success++;

      } catch (error) {
        console.error(`处理第${i + 1}行数据失败:`, error);
        results.failed++;
        results.errors.push(`第${i + 1}行: 处理失败 - ${error}`);
      }
    }

    return NextResponse.json({
      message: '批量导入完成',
      results
    });

  } catch (error) {
    console.error('批量导入失败:', error);
    return NextResponse.json(
      { error: '批量导入失败' },
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