"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

interface Student {
  id: number;
  name: string;
  class: {
    id: number;
    name: string;
  };
}

interface AnalyticsData {
  student: Student;
  scoreHistory: any[];
  rankings: any[];
  subjectAverages: Record<string, number>;
  totalExams: number;
}

const subjectLabels = {
  'CHINESE': '语文',
  'MATH': '数学',
  'ENGLISH': '英语'
};

// 图表配置
const chartConfig = {
  CHINESE: {
    label: "语文",
    color: "hsl(var(--chart-1))",
  },
  MATH: {
    label: "数学", 
    color: "hsl(var(--chart-2))",
  },
  ENGLISH: {
    label: "英语",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function StudentAnalysisPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载学生列表
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('加载学生列表失败:', error);
    }
  };

  const loadStudentAnalytics = async (studentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/student?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        toast({
          title: "加载失败",
          description: "加载分析数据失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('加载分析数据失败:', error);
      toast({
        title: "网络错误",
        description: "网络连接失败，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudent(studentId);
    if (studentId) {
      loadStudentAnalytics(studentId);
    } else {
      setAnalyticsData(null);
    }
  };

  // 准备图表数据
  const prepareChartData = () => {
    if (!analyticsData) return [];

    const data = [];
    const examMap = new Map();
    
    // 按考试分组
    for (const score of analyticsData.scoreHistory) {
      const examKey = score.examId;
      if (!examMap.has(examKey)) {
        examMap.set(examKey, {
          examName: score.exam.name,
          examDate: score.exam.date,
          CHINESE: null,
          MATH: null,
          ENGLISH: null
        });
      }
      examMap.get(examKey)[score.subject] = score.score;
    }

    // 转换为数组并排序
    return Array.from(examMap.values()).sort((a, b) => 
      new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    );
  };

  // 准备排名数据
  const prepareRankingData = () => {
    if (!analyticsData) return [];

    const rankingMap = new Map();
    
    for (const ranking of analyticsData.rankings) {
      const exam = analyticsData.scoreHistory.find(s => 
        s.examId === ranking.examId && s.subject === ranking.subject
      );
      
      if (exam) {
        const examKey = exam.examId;
        if (!rankingMap.has(examKey)) {
          rankingMap.set(examKey, {
            examName: exam.exam.name,
            examDate: exam.exam.date,
            CHINESE: null,
            MATH: null,
            ENGLISH: null
          });
        }
        rankingMap.get(examKey)[ranking.subject] = ranking.rank;
      }
    }

    return Array.from(rankingMap.values()).sort((a, b) => 
      new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    );
  };

  const chartData = prepareChartData();
  const rankingData = prepareRankingData();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">学生成绩分析</h1>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>
        
        <div className="w-full max-w-md">
          <Select value={selectedStudent} onValueChange={handleStudentChange}>
            <SelectTrigger>
              <SelectValue placeholder="选择学生" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name} - {student.class.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">加载分析数据中...</div>
          </CardContent>
        </Card>
      )}

      {analyticsData && (
        <div className="space-y-6">
          {/* 学生基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>学生信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">姓名</p>
                  <p className="font-semibold">{analyticsData.student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">班级</p>
                  <p className="font-semibold">{analyticsData.student.class.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">参与考试</p>
                  <p className="font-semibold">{analyticsData.totalExams} 次</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">成绩记录</p>
                  <p className="font-semibold">{analyticsData.scoreHistory.length} 条</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 科目平均分 */}
          <Card>
            <CardHeader>
              <CardTitle>科目平均分</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analyticsData.subjectAverages).map(([subject, average]) => (
                  <div key={subject} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{subjectLabels[subject as keyof typeof subjectLabels]}</p>
                    <p className="text-2xl font-bold text-blue-600">{average}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 图表区域 - 左右布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 成绩趋势图 */}
            <Card>
              <CardHeader>
                <CardTitle>成绩趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="examName"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line
                      dataKey="CHINESE"
                      type="monotone"
                      stroke="var(--color-CHINESE)"
                      strokeWidth={2}
                      dot={false}
                      label={{ fontSize: 12, fill: 'var(--color-CHINESE)' }}
                    />
                    <Line
                      dataKey="MATH"
                      type="monotone"
                      stroke="var(--color-MATH)"
                      strokeWidth={2}
                      dot={false}
                      label={{ fontSize: 12, fill: 'var(--color-MATH)' }}
                    />
                    <Line
                      dataKey="ENGLISH"
                      type="monotone"
                      stroke="var(--color-ENGLISH)"
                      strokeWidth={2}
                      dot={false}
                      label={{ fontSize: 12, fill: 'var(--color-ENGLISH)' }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* 排名变化图 */}
            <Card>
              <CardHeader>
                <CardTitle>班级排名变化</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart
                    accessibilityLayer
                    data={rankingData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="examName"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                      reversed
                      domain={[1, 'dataMax']}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line
                      dataKey="CHINESE"
                      type="monotone"
                      stroke="var(--color-CHINESE)"
                      strokeWidth={2}
                      dot={false}
                      label={{ fontSize: 12, fill: 'var(--color-CHINESE)' }}
                    />
                    <Line
                      dataKey="MATH"
                      type="monotone"
                      stroke="var(--color-MATH)"
                      strokeWidth={2}
                      dot={false}
                      label={{ fontSize: 12, fill: 'var(--color-MATH)' }}
                    />
                    <Line
                      dataKey="ENGLISH"
                      type="monotone"
                      stroke="var(--color-ENGLISH)"
                      strokeWidth={2}
                      dot={false}
                      label={{ fontSize: 12, fill: 'var(--color-ENGLISH)' }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!selectedStudent && !loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              请选择一个学生查看详细的成绩分析
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 