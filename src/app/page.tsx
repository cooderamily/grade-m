import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, FileText, Upload, TrendingUp, Users, BarChart3, PieChart, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <main className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12 py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            学生成绩管理系统
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            现代化的成绩管理平台，支持智能录入、批量导入、数据分析和可视化报表
          </p>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* 成绩录入 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-card to-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">成绩录入</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">手动录入学生考试成绩，支持实时成绩分析和排名计算</p>
              <Link href="/scores/add">
                <Button className="w-full group-hover:bg-primary/90 transition-colors">
                  开始录入
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Excel导入 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-card to-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <Upload className="w-5 h-5 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Excel导入</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">批量导入Excel表格，自动解析并统计班级成绩数据</p>
              <Link href="/scores/import">
                <Button variant="secondary" className="w-full group-hover:bg-secondary/80 transition-colors">
                  导入数据
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 学生分析 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-card to-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">学生分析</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">个人成绩趋势分析，历次考试成绩对比和排名变化</p>
              <Link href="/analysis/student">
                <Button variant="outline" className="w-full group-hover:bg-accent transition-colors">
                  查看分析
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 班级分析 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-card to-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">班级分析</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">班级整体成绩分析，平均分变化和成绩分布统计</p>
              <Link href="/analysis/class">
                <Button variant="outline" className="w-full group-hover:bg-accent transition-colors">
                  班级报表
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 数据管理 */}
          {/* <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-card to-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <CardTitle className="text-lg">数据管理</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">管理学生信息、班级设置和考试安排等基础数据</p>
              <Link href="/management">
                <Button variant="outline" className="w-full group-hover:bg-accent transition-colors">
                  数据管理
                </Button>
              </Link>
            </CardContent>
          </Card> */}
        </div>
      </main>
    </div>
  );
}
