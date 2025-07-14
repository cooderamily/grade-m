"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function ImportScoreForm() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setJsonData(null);
      setImportResult(null);
    }
  };

  const handleFileUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          
          // 验证和转换数据格式
          const processedData = json.map((row: any) => {
            // 支持多种列名格式，确保所有数据都转换为字符串
            const studentName = String(row['学生姓名'] || row['姓名'] || row['学生'] || row['studentName'] || row['name'] || '').trim();
            const className = String(row['班级'] || row['班级名称'] || row['className'] || row['class'] || '').trim();
            const examName = String(row['考试名称'] || row['考试'] || row['examName'] || row['exam'] || '').trim();
            const subject = String(row['科目'] || row['学科'] || row['subject'] || '').trim();
            const score = row['成绩'] || row['分数'] || row['score'];
            const examDate = row['考试日期'] || row['日期'] || row['examDate'] || row['date'];

            return {
              studentName: studentName || null,
              className: className || null,
              examName: examName || null,
              subject: subject || null,
              score,
              examDate
            };
          });

          setJsonData(processedData);
          console.log('解析的数据:', processedData);
                 } catch (error) {
           console.error('文件解析失败:', error);
           toast({
             title: "文件解析失败",
             description: "请检查Excel文件格式是否正确",
             variant: "destructive",
           });
         }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleImportToDatabase = async () => {
    if (!jsonData) {
      toast({
        title: "请先上传文件",
        description: "请先上传并解析Excel文件",
        variant: "destructive",
      });
      return;
    }

    // 验证数据完整性
    const invalidRows = jsonData.filter(row => 
      !row.studentName || !row.className || !row.examName || !row.subject || row.score === undefined
    );

    if (invalidRows.length > 0) {
      toast({
        title: "数据不完整",
        description: `发现 ${invalidRows.length} 行数据不完整，请检查Excel文件格式。要求列名：学生姓名、班级、考试名称、科目、成绩`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/scores/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scores: jsonData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setImportResult(result.results);
        
        if (result.results.failed === 0) {
          toast({
            title: "🎉 批量导入成功！",
            description: `共导入 ${result.results.success} 条成绩记录`,
          });
        } else {
          toast({
            title: "导入完成",
            description: `成功 ${result.results.success} 条，失败 ${result.results.failed} 条`,
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "导入失败",
          description: errorData.error || '未知错误',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('导入失败:', error);
      toast({
        title: "网络错误",
        description: "网络连接失败，请重试",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Excel成绩导入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="excel-file">选择Excel文件</Label>
            <Input 
              id="excel-file"
              type="file" 
              onChange={handleFileChange} 
              accept=".xlsx, .xls" 
            />
            <p className="text-sm text-muted-foreground">
              支持 .xlsx 和 .xls 格式文件
            </p>
          </div>

          <Button 
            onClick={handleFileUpload} 
            disabled={!file}
            className="w-full"
          >
            解析文件
          </Button>

          {jsonData && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-green-800 mb-2">✅ 文件解析成功</h3>
                <p className="text-green-700">共解析 {jsonData.length} 条记录</p>
              </div>

              <Button 
                onClick={handleImportToDatabase}
                disabled={isUploading}
                className="w-full"
                variant="default"
              >
                {isUploading ? '导入中...' : '导入到数据库'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excel格式说明 */}
      <Card>
        <CardHeader>
          <CardTitle>Excel文件格式要求</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">请确保Excel文件包含以下列：</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm">必需列</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• 学生姓名 (或 姓名/学生/studentName)</li>
                  <li>• 班级 (或 班级名称/className)</li>
                  <li>• 考试名称 (或 考试/examName)</li>
                  <li>• 科目 (语文/数学/英语)</li>
                  <li>• 成绩 (0-100的数字)</li>
                </ul>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm">可选列</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• 考试日期 (或 日期/examDate)</li>
                </ul>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 提示：如果班级、学生或考试不存在，系统会自动创建。重复的成绩记录会被更新。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 导入结果 */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle>导入结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                  <p className="text-sm text-green-800">成功导入</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                  <p className="text-sm text-red-800">导入失败</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-800">错误详情：</h4>
                  <div className="max-h-40 overflow-y-auto bg-red-50 p-3 rounded-lg">
                    {importResult.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700">{error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 预览数据 */}
      {jsonData && (
        <Card>
          <CardHeader>
            <CardTitle>数据预览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="max-h-60 overflow-y-auto">
                <pre className="bg-gray-100 p-4 rounded-md text-sm">
                  {JSON.stringify(jsonData.slice(0, 5), null, 2)}
                </pre>
              </div>
              {jsonData.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">
                  显示前5条记录，共 {jsonData.length} 条
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
