"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
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

interface Class {
  id: number;
  name: string;
  students: any[];
}

interface ClassAnalyticsData {
  classInfo: Class;
  examSubjectAverages: Record<string, Record<string, number>>;
  scoreDistribution: Record<string, number[]>;
  subjectStats: Record<string, any>;
  exams: any[];
  totalStudents: number;
  totalScores: number;
}

const subjectLabels = {
  'CHINESE': '语文',
  'MATH': '数学',
  'ENGLISH': '英语'
};

const scoreRangeLabels = ['0-59', '60-69', '70-79', '80-89', '90-100'];

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

export default function ClassAnalysisPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [analyticsData, setAnalyticsData] = useState<ClassAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载班级列表
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('加载班级列表失败:', error);
    }
  };

  const loadClassAnalytics = async (classId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/class?classId=${classId}`);
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

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    if (classId) {
      loadClassAnalytics(classId);
    } else {
      setAnalyticsData(null);
    }
  };

  // 准备平均分趋势数据
  const prepareAveragesTrendData = () => {
    if (!analyticsData) return [];

    const trendData = [];
    const { examSubjectAverages, exams } = analyticsData;

    for (const exam of exams) {
      const examId = exam.id.toString();
      if (examSubjectAverages[examId]) {
        trendData.push({
          examName: exam.name,
          examDate: exam.date,
          ...examSubjectAverages[examId]
        });
      }
    }

    return trendData.sort((a, b) => 
      new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    );
  };

  // 准备成绩分布数据
  const prepareDistributionData = () => {
    if (!analyticsData) return [];

    const distributionData = [];
    const { scoreDistribution, exams } = analyticsData;

    // 选择最近的考试进行分布展示
    if (exams.length > 0) {
      const latestExam = exams[0];
      const subjects = ['CHINESE', 'MATH', 'ENGLISH'];

      for (let i = 0; i < scoreRangeLabels.length; i++) {
        const rangeData: any = { range: scoreRangeLabels[i] };
        
        for (const subject of subjects) {
          const key = `${latestExam.id}-${subject}`;
          if (scoreDistribution[key]) {
            rangeData[subject] = scoreDistribution[key][i];
          }
        }
        
        distributionData.push(rangeData);
      }
    }

    return distributionData;
  };

  const averagesTrendData = prepareAveragesTrendData();
  const distributionData = prepareDistributionData();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">班级成绩分析</h1>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>
        
        <div className="w-full max-w-md">
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger>
              <SelectValue placeholder="选择班级" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name} ({cls.students.length}人)
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
          {/* 班级基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>班级信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">班级名称</p>
                  <p className="font-semibold">{analyticsData.classInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">学生人数</p>
                  <p className="font-semibold">{analyticsData.totalStudents} 人</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">考试次数</p>
                  <p className="font-semibold">{analyticsData.exams.length} 次</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">成绩记录</p>
                  <p className="font-semibold">{analyticsData.totalScores} 条</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 科目整体统计 */}
          <Card>
            <CardHeader>
              <CardTitle>科目整体统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analyticsData.subjectStats).map(([subject, stats]) => (
                  <div key={subject} className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">
                      {subjectLabels[subject as keyof typeof subjectLabels]}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">平均分:</span>
                        <span className="font-semibold text-blue-600">{stats.average}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">最高分:</span>
                        <span className="font-semibold text-green-600">{stats.highest}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">最低分:</span>
                        <span className="font-semibold text-red-600">{stats.lowest}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">记录数:</span>
                        <span className="font-semibold">{stats.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 图表区域 - 左右布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 平均分趋势图 */}
            <Card>
              <CardHeader>
                <CardTitle>班级平均分趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart
                    accessibilityLayer
                    data={averagesTrendData}
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

            {/* 成绩分布图 */}
            {distributionData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>最近考试成绩分布</CardTitle>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart
                    accessibilityLayer
                    data={distributionData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="range"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="CHINESE"
                      fill="var(--color-CHINESE)"
                      radius={4}
                      label={{ fontSize: 12, fill: 'var(--color-CHINESE)' }}
                    />
                    <Bar
                      dataKey="MATH"
                      fill="var(--color-MATH)"
                      radius={4}
                      label={{ fontSize: 12, fill: 'var(--color-MATH)' }}
                    />
                    <Bar
                      dataKey="ENGLISH"
                      fill="var(--color-ENGLISH)"
                      radius={4}
                      label={{ fontSize: 12, fill: 'var(--color-ENGLISH)' }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            )}
          </div>

          {/* 考试历史 */}
          <Card>
            <CardHeader>
              <CardTitle>考试历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData.exams.map((exam) => (
                  <div key={exam.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{exam.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(exam.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {analyticsData.examSubjectAverages[exam.id.toString()] && (
                        <div className="space-y-1">
                          {Object.entries(analyticsData.examSubjectAverages[exam.id.toString()]).map(([subject, avg]) => (
                            <div key={subject} className="text-sm">
                              <span className="text-gray-600">
                                {subjectLabels[subject as keyof typeof subjectLabels]}:
                              </span>
                              <span className="ml-1 font-semibold">{avg}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedClass && !loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              请选择一个班级查看详细的成绩分析
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 