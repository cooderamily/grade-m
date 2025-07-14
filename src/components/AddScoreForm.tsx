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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: number;
  name: string;
  classId: number;
  class?: {
    id: number;
    name: string;
  };
}

interface Class {
  id: number;
  name: string;
}

interface Exam {
  id: number;
  name: string;
  date: string;
}

interface AnalyticsData {
  student: Student;
  scoreHistory: any[];
  rankings: any[];
  subjectAverages: Record<string, number>;
  totalExams: number;
}

const subjects = [
  { value: 'CHINESE', label: '语文' },
  { value: 'MATH', label: '数学' },
  { value: 'ENGLISH', label: '英语' }
];

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

export default function AddScoreForm() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [score, setScore] = useState('');

  // 加载基础数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 当班级改变时加载学生
  useEffect(() => {
    if (selectedClass) {
      loadStudentsByClass(parseInt(selectedClass));
    } else {
      setStudents([]);
      setSelectedStudent('');
    }
  }, [selectedClass]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [classesRes, examsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/exams')
      ]);
      
      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      }
      
      if (examsRes.ok) {
        const examsData = await examsRes.json();
        setExams(examsData);
      }
    } catch (error) {
      console.error('加载基础数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsByClass = async (classId: number) => {
    try {
      const response = await fetch(`/api/students?classId=${classId}`);
      if (response.ok) {
        const studentsData = await response.json();
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
    }
  };

  const loadStudentAnalytics = async (studentId: string) => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch(`/api/analytics/student?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('加载分析数据失败');
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('加载分析数据失败:', error);
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedExam || !selectedSubject || !score) {
      toast({
        title: "信息不完整",
        description: "请填写完整信息",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(score) < 0 || parseFloat(score) > 100) {
      toast({
        title: "分数无效",
        description: "成绩应在0-100之间",
        variant: "destructive",
      });
      return;
    }

    setSubmitLoading(true);
    
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(selectedStudent),
          examId: parseInt(selectedExam),
          subject: selectedSubject,
          score: parseFloat(score),
        }),
      });

      if (response.ok) {
        toast({
          title: "录入成功！",
          description: "成绩已成功录入系统",
        });
        // 重置表单
        setScore('');
        setSelectedSubject('');
        // 加载该学生的成绩分析
        await loadStudentAnalytics(selectedStudent);
      } else {
        const errorData = await response.json();
        toast({
          title: "录入失败",
          description: errorData.error || '未知错误',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('提交失败:', error);
      toast({
        title: "网络错误",
        description: "网络连接失败，请重试",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧：录入表单 */}
      <Card>
        <CardHeader>
          <CardTitle>成绩录入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 班级选择 */}
            <div className="space-y-2">
              <Label htmlFor="class-select">班级</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger id="class-select">
                  <SelectValue placeholder="选择班级" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 学生选择 */}
            <div className="space-y-2">
              <Label htmlFor="student-select">学生</Label>
              <Select 
                value={selectedStudent} 
                onValueChange={setSelectedStudent}
                disabled={!selectedClass}
                
              >
                <SelectTrigger id="student-select">
                  <SelectValue placeholder={selectedClass ? "选择学生" : "请先选择班级"} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 考试选择 */}
            <div className="space-y-2">
              <Label htmlFor="exam-select">考试</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger id="exam-select">
                  <SelectValue placeholder="选择考试" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      {exam.name} ({new Date(exam.date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 科目选择 */}
            <div className="space-y-2">
              <Label htmlFor="subject-select">科目</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject-select">
                  <SelectValue placeholder="选择科目" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 分数输入 */}
            <div className="space-y-2">
              <Label htmlFor="score-input">分数</Label>
              <Input
                id="score-input"
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="请输入分数"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={submitLoading || !selectedStudent || !selectedExam || !selectedSubject || !score}
            >
              {submitLoading ? '录入中...' : '录入成绩'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 右侧：成绩分析 */}
      <div className="space-y-6">
        {analyticsLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">加载分析数据中...</div>
            </CardContent>
          </Card>
        )}

        {analyticsData && (
          <>
            {/* 学生基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>学生信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">姓名</p>
                    <p className="font-semibold">{analyticsData.student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">班级</p>
                    <p className="font-semibold">{analyticsData.student.class?.name}</p>
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
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(analyticsData.subjectAverages).map(([subject, average]) => (
                    <div key={subject} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{subjectLabels[subject as keyof typeof subjectLabels]}</p>
                      <p className="text-2xl font-bold text-blue-600">{average}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 成绩趋势图 */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>成绩趋势</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="w-full h-[200px]">
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
            )}

            {/* 排名变化图 */}
            {rankingData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>班级排名变化</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="w-full h-[200px]"> 
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
            )}
          </>
        )}

        {!analyticsData && !analyticsLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                录入成绩后将显示该学生的成绩分析
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
