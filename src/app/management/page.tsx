"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  GraduationCap, 
  FileText,
  ArrowLeft,
  Calendar,
  BarChart3
} from "lucide-react";

interface Class {
  id: number;
  name: string;
  students: Student[];
}

interface Student {
  id: number;
  name: string;
  classId: number;
  class?: {
    id: number;
    name: string;
  };
}

interface Exam {
  id: number;
  name: string;
  date: string;
}

interface Score {
  id: number;
  studentId: number;
  examId: number;
  subject: string;
  score: number;
  student: {
    id: number;
    name: string;
    class: {
      id: number;
      name: string;
    };
  };
  exam: {
    id: number;
    name: string;
    date: string;
  };
}

export default function ManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'classes' | 'students' | 'exams' | 'scores'>('classes');
  
  // 数据状态
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  
  // 编辑状态
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  
  // 表单状态
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('');
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newScoreStudent, setNewScoreStudent] = useState('');
  const [newScoreExam, setNewScoreExam] = useState('');
  const [newScoreSubject, setNewScoreSubject] = useState('');
  const [newScoreValue, setNewScoreValue] = useState('');
  
  // 过滤状态
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);

  // 加载数据
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadClasses(),
        loadStudents(),
        loadExams(),
        loadScores()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('加载班级数据失败:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
    }
  };

  const loadExams = async () => {
    try {
      const response = await fetch('/api/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error('加载考试数据失败:', error);
    }
  };

  const loadScores = async () => {
    try {
      const response = await fetch('/api/scores');
      if (response.ok) {
        const data = await response.json();
        setScores(data);
      }
    } catch (error) {
      console.error('加载成绩数据失败:', error);
    }
  };

  // 成绩管理
  const createScore = async () => {
    if (!newScoreStudent || !newScoreExam || !newScoreSubject || !newScoreValue) {
      toast({
        title: "错误",
        description: "请填写所有字段",
        variant: "destructive",
      });
      return;
    }

    const score = parseFloat(newScoreValue);
    if (isNaN(score) || score < 0 || score > 100) {
      toast({
        title: "错误",
        description: "请输入有效的成绩（0-100）",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(newScoreStudent),
          examId: parseInt(newScoreExam),
          subject: newScoreSubject,
          score: score
        }),
      });

      if (response.ok) {
        await loadScores();
        setNewScoreStudent('');
        setNewScoreExam('');
        setNewScoreSubject('');
        setNewScoreValue('');
        toast({
          title: "成功",
          description: "成绩记录创建成功",
        });
      } else {
        const error = await response.json();
        toast({
          title: "错误",
          description: error.error || "创建成绩记录失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('创建成绩记录失败:', error);
      toast({
        title: "错误",
        description: "创建成绩记录失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScore = async (scoreData: Score) => {
    setLoading(true);
    try {
      const response = await fetch('/api/scores', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      if (response.ok) {
        await loadScores();
        setEditingScore(null);
        toast({
          title: "成功",
          description: "成绩记录更新成功",
        });
      } else {
        const error = await response.json();
        toast({
          title: "错误",
          description: error.error || "更新成绩记录失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('更新成绩记录失败:', error);
      toast({
        title: "错误",
        description: "更新成绩记录失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteScore = async (id: number) => {
    if (!confirm('确定要删除这条成绩记录吗？')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/scores?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadScores();
        toast({
          title: "成功",
          description: "成绩记录删除成功",
        });
      } else {
        const error = await response.json();
        toast({
          title: "错误",
          description: error.error || "删除成绩记录失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('删除成绩记录失败:', error);
      toast({
        title: "错误",
        description: "删除成绩记录失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 班级管理
  const createClass = async () => {
    if (!newClassName.trim()) {
      toast({
        title: "错误",
        description: "请输入班级名称",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName }),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "班级创建成功",
        });
        setNewClassName('');
        loadClasses();
      } else {
        const error = await response.json();
        toast({
          title: "创建失败",
          description: error.error || "未知错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('创建班级失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      });
    }
  };

  const updateClass = async (classData: Class) => {
    try {
      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "班级更新成功",
        });
        setEditingClass(null);
        loadClasses();
      } else {
        const error = await response.json();
        toast({
          title: "更新失败",
          description: error.error || "未知错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('更新班级失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      });
    }
  };

  const deleteClass = async (id: number) => {
    if (!confirm('确定要删除这个班级吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/classes?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "班级删除成功",
        });
        loadClasses();
        loadStudents(); // 重新加载学生数据
      } else {
        const error = await response.json();
        toast({
          title: "删除失败",
          description: error.error || "未知错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('删除班级失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      });
    }
  };

  // 学生管理
  const createStudent = async () => {
    if (!newStudentName.trim() || !newStudentClass) {
      toast({
        title: "错误",
        description: "请填写学生姓名和选择班级",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newStudentName,
          classId: parseInt(newStudentClass)
        }),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "学生创建成功",
        });
        setNewStudentName('');
        setNewStudentClass('');
        loadStudents();
        loadClasses(); // 重新加载班级数据以更新学生计数
      } else {
        const error = await response.json();
        toast({
          title: "创建失败",
          description: error.error || "未知错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('创建学生失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      });
    }
  };

  const updateStudent = async (studentData: Student) => {
    try {
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "学生信息更新成功",
        });
        setEditingStudent(null);
        loadStudents();
        loadClasses();
      } else {
        const error = await response.json();
        toast({
          title: "更新失败",
          description: error.error || "未知错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('更新学生失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      });
    }
  };

  const deleteStudent = async (id: number) => {
    if (!confirm('确定要删除这个学生吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "学生删除成功",
        });
        loadStudents();
        loadClasses();
      } else {
        const error = await response.json();
        toast({
          title: "删除失败",
          description: error.error || "未知错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('删除学生失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      });
    }
  };

  // 考试管理
  const createExam = async () => {
    if (!newExamName.trim() || !newExamDate) {
      toast({
        title: "错误",
        description: "请填写考试名称和日期",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newExamName,
          date: newExamDate
        }),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "考试创建成功",
        });
        setNewExamName('');
        setNewExamDate('');
        loadExams();
      } else {
        const error = await response.json();
        toast({
          title: "创建失败",
          description: error.error || "未知错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('创建考试失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      });
    }
  };

  const updateExam = async (examData: Exam) => {
    try {
      const response = await fetch('/api/exams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "考试信息更新成功",
        });
        setEditingExam(null);
        loadExams();
      } else {
        const error = await response.json();
        toast({
          title: "更新失败",
          description: error.error || "未知错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('更新考试失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      });
    }
  };

  const deleteExam = async (id: number) => {
    if (!confirm('确定要删除这个考试吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/exams?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "考试删除成功",
        });
        loadExams();
      } else {
        const error = await response.json();
        toast({
          title: "删除失败",
          description: error.error || "未知错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('删除考试失败:', error);
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      });
    }
  };

  const renderClassManagement = () => (
    <div className="space-y-6">
      {/* 创建班级 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            创建新班级
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="class-name">班级名称</Label>
              <Input
                id="class-name"
                placeholder="请输入班级名称"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createClass()}
              />
            </div>
            <Button onClick={createClass} className="self-end">
              创建班级
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 班级列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            班级管理 ({classes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">加载中...</div>
          ) : classes.length > 0 ? (
            <div className="grid gap-4">
              {classes.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  {editingClass?.id === classItem.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingClass.name}
                        onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && updateClass(editingClass)}
                      />
                      <Button size="sm" onClick={() => updateClass(editingClass)}>
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingClass(null)}>
                        取消
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-semibold">{classItem.name}</p>
                        <p className="text-sm text-gray-600">{classItem.students.length} 名学生</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingClass(classItem)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteClass(classItem.id)}
                          disabled={classItem.students.length > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无班级数据，请创建第一个班级
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentManagement = () => (
    <div className="space-y-6">
      {/* 创建学生 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            添加新学生
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="student-name">学生姓名</Label>
              <Input
                id="student-name"
                placeholder="请输入学生姓名"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="student-class">选择班级</Label>
              <Select value={newStudentClass} onValueChange={setNewStudentClass}>
                <SelectTrigger id="student-class">
                  <SelectValue placeholder="选择班级" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id.toString()}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createStudent} className="self-end">
              添加学生
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 学生列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            学生管理 ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">加载中...</div>
          ) : students.length > 0 ? (
            <div className="grid gap-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  {editingStudent?.id === student.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingStudent.name}
                        onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                        placeholder="学生姓名"
                      />
                      <Select 
                        value={editingStudent.classId.toString()} 
                        onValueChange={(value) => setEditingStudent({ ...editingStudent, classId: parseInt(value) })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.id.toString()}>
                              {classItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => updateStudent(editingStudent)}>
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingStudent(null)}>
                        取消
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.class?.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingStudent(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteStudent(student.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无学生数据，请先创建班级后添加学生
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderExamManagement = () => (
    <div className="space-y-6">
      {/* 创建考试 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            创建新考试
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="exam-name">考试名称</Label>
              <Input
                id="exam-name"
                placeholder="请输入考试名称"
                value={newExamName}
                onChange={(e) => setNewExamName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="exam-date">考试日期</Label>
              <Input
                id="exam-date"
                type="date"
                value={newExamDate}
                onChange={(e) => setNewExamDate(e.target.value)}
              />
            </div>
            <Button onClick={createExam} className="self-end">
              创建考试
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 考试列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            考试管理 ({exams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">加载中...</div>
          ) : exams.length > 0 ? (
            <div className="grid gap-4">
              {exams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                  {editingExam?.id === exam.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingExam.name}
                        onChange={(e) => setEditingExam({ ...editingExam, name: e.target.value })}
                        placeholder="考试名称"
                      />
                      <Input
                        type="date"
                        value={editingExam.date.split('T')[0]}
                        onChange={(e) => setEditingExam({ ...editingExam, date: e.target.value })}
                      />
                      <Button size="sm" onClick={() => updateExam(editingExam)}>
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingExam(null)}>
                        取消
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-semibold">{exam.name}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(exam.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedExamId(exam.id);
                            setActiveTab('scores');
                          }}
                          title="查看该考试的成绩"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingExam(exam)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteExam(exam.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无考试数据，请创建第一个考试
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderScoreManagement = () => {
    // 根据选中的考试过滤成绩
    const filteredScores = selectedExamId 
      ? scores.filter(score => score.examId === selectedExamId)
      : scores;

    const selectedExam = selectedExamId 
      ? exams.find(exam => exam.id === selectedExamId)
      : null;

    return (
      <div className="space-y-6">
        {/* 考试选择和返回 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedExamId && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedExamId(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回全部成绩
                  </Button>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedExam ? `${selectedExam.name} - 成绩管理` : '成绩管理'}
                  </h3>
                  {selectedExam && (
                    <p className="text-sm text-gray-600">考试日期：{selectedExam.date}</p>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                共 {filteredScores.length} 条记录
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 成绩列表 */}
        <Card>
          <CardHeader>
            <CardTitle>成绩记录</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredScores.length > 0 ? (
            <div className="space-y-4">
              {filteredScores.map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  {editingScore?.id === score.id ? (
                    <div className="flex items-center gap-4 flex-1">
                      <Select 
                        value={editingScore.studentId.toString()} 
                        onValueChange={(value) => setEditingScore({
                          ...editingScore,
                          studentId: parseInt(value)
                        })}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.name} ({student.class?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={editingScore.examId.toString()} 
                        onValueChange={(value) => setEditingScore({
                          ...editingScore,
                          examId: parseInt(value)
                        })}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((exam) => (
                            <SelectItem key={exam.id} value={exam.id.toString()}>
                              {exam.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                                             <Select 
                         value={editingScore.subject} 
                         onValueChange={(value) => setEditingScore({
                           ...editingScore,
                           subject: value
                         })}
                       >
                         <SelectTrigger className="w-[100px]">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="语文">语文</SelectItem>
                           <SelectItem value="数学">数学</SelectItem>
                           <SelectItem value="英语">英语</SelectItem>
                           {/* <SelectItem value="物理">物理</SelectItem>
                           <SelectItem value="化学">化学</SelectItem>
                           <SelectItem value="生物">生物</SelectItem>
                           <SelectItem value="政治">政治</SelectItem>
                           <SelectItem value="历史">历史</SelectItem>
                           <SelectItem value="地理">地理</SelectItem> */}
                         </SelectContent>
                       </Select>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editingScore.score}
                        onChange={(e) => setEditingScore({
                          ...editingScore,
                          score: parseFloat(e.target.value) || 0
                        })}
                        className="w-[100px]"
                      />
                      <Button size="sm" onClick={() => updateScore(editingScore)}>
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingScore(null)}>
                        取消
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-4 gap-4 flex-1">
                        <div>
                          <p className="font-semibold">{score.student.name}</p>
                          <p className="text-sm text-gray-600">{score.student.class.name}</p>
                        </div>
                        <div>
                          <p className="font-semibold">{score.exam.name}</p>
                          <p className="text-sm text-gray-600">{score.exam.date}</p>
                        </div>
                        <div>
                          <p className="font-semibold">{score.subject}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{score.score}分</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingScore(score)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteScore(score.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无成绩数据，请添加第一条成绩记录
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto p-6">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4 justify-between">
          <h1 className="text-3xl font-bold">数据管理</h1>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="mb-6">
          <div className="flex gap-2 border-b">
            {[
              { key: 'classes', label: '班级管理', icon: GraduationCap },
              { key: 'students', label: '学生管理', icon: Users },
              { key: 'exams', label: '考试管理', icon: FileText },
              { key: 'scores', label: '成绩管理', icon: BarChart3 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 标签页内容 */}
        <div>
          {activeTab === 'classes' && renderClassManagement()}
          {activeTab === 'students' && renderStudentManagement()}
          {activeTab === 'exams' && renderExamManagement()}
          {activeTab === 'scores' && renderScoreManagement()}
        </div>
      </div>
    </div>
  );
} 