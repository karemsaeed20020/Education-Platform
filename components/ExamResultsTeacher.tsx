// components/ExamResultsTeacher.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Award, User, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExamResult {
  _id: string;
  student: {
    _id: string;
    username: string;
    email: string;
  };
  totalScore: number;
  obtainedScore: number;
  percentage: number;
  submittedAt: string;
  results: {
    questionId: string;
    isCorrect: boolean;
    obtainedMarks: number;
    marks: number;
  }[];
}

interface Statistics {
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
  questionStats: {
    questionId: string;
    questionText: string;
    correctCount: number;
    totalAttempts: number;
    accuracy: number;
  }[];
}

export default function ExamResultsTeacher({ examId }: { examId: string }) {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    fetchStatistics();
  }, [examId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/exams/${examId}/results`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('فشل في جلب النتائج');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setResults(data.data.results);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('فشل في تحميل النتائج');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/exams/${examId}/statistics`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setStatistics(data.data.statistics);
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['الطالب', 'البريد الإلكتروني', 'الدرجة المحصلة', 'الدرجة الكاملة', 'النسبة المئوية', 'التقدير', 'تاريخ التقديم'];
    const csvData = results.map(result => [
      result.student.username,
      result.student.email,
      result.obtainedScore.toString(),
      result.totalScore.toString(),
      `${result.percentage.toFixed(1)}%`,
      result.percentage >= 50 ? 'ناجح' : 'راسب',
      new Date(result.submittedAt).toLocaleDateString('ar-EG')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `نتائج_الاختبار_${examId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل النتائج...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات الاختبار</CardTitle>
            <CardDescription>نظرة عامة على أداء الطلاب</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{statistics.totalSubmissions}</div>
                <div className="text-sm text-gray-600">عدد الطلاب</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{statistics.averageScore.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">المتوسط</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mx-auto mb-2">↑</div>
                <div className="text-2xl font-bold text-yellow-600">{statistics.highestScore.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">أعلى درجة</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mx-auto mb-2">↓</div>
                <div className="text-2xl font-bold text-red-600">{statistics.lowestScore.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">أقل درجة</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-xl font-bold text-green-800">{statistics.passCount}</div>
                <div className="text-sm text-green-700">ناجح</div>
              </div>
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <div className="text-xl font-bold text-red-800">{statistics.failCount}</div>
                <div className="text-sm text-red-700">راسب</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>نتائج الطلاب</CardTitle>
              <CardDescription>قائمة بجميع نتائج الطلاب في هذا الاختبار</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 ml-2" />
              تصدير النتائج
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الطالب</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدرجة المحصلة</TableHead>
                <TableHead>النسبة المئوية</TableHead>
                <TableHead>التقدير</TableHead>
                <TableHead>تاريخ التقديم</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result._id}>
                  <TableCell className="font-medium">{result.student.username}</TableCell>
                  <TableCell>{result.student.email}</TableCell>
                  <TableCell>
                    {result.obtainedScore} / {result.totalScore}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getGradeColor(result.percentage)}>
                      {result.percentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={result.percentage >= 50 ? 'default' : 'destructive'}>
                      {result.percentage >= 50 ? 'ناجح' : 'راسب'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(result.submittedAt).toLocaleDateString('ar-EG')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 ml-2" />
                      التفاصيل
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {results.length === 0 && (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">لم يقم أي طالب بتقديم هذا الاختبار بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}