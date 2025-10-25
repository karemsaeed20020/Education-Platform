/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ExamResultsTeacher.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Award, User, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

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
      const response = await api.get(`/api/exams/${examId}/results`);
      
      if (response.data.status === 'success') {
        setResults(response.data.data.results);
      } else {
        throw new Error('فشل في جلب النتائج');
      }
    } catch (error: any) {
      console.error('Error fetching results:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل النتائج';
      toast.error(errorMessage);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get(`/api/exams/${examId}/statistics`);
      
      if (response.data.status === 'success') {
        setStatistics(response.data.data.statistics);
      }
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل الإحصائيات';
      // Don't show toast for statistics error as it's not critical
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (results.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }

    try {
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
      
      toast.success('تم تصدير النتائج بنجاح');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('فشل في تصدير النتائج');
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeText = (percentage: number) => {
    if (percentage >= 90) return 'ممتاز';
    if (percentage >= 80) return 'جيد جداً';
    if (percentage >= 70) return 'جيد';
    if (percentage >= 50) return 'مقبول';
    return 'راسب';
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
                <div className="text-xs text-green-600">
                  ({((statistics.passCount / statistics.totalSubmissions) * 100).toFixed(1)}%)
                </div>
              </div>
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <div className="text-xl font-bold text-red-800">{statistics.failCount}</div>
                <div className="text-sm text-red-700">راسب</div>
                <div className="text-xs text-red-600">
                  ({((statistics.failCount / statistics.totalSubmissions) * 100).toFixed(1)}%)
                </div>
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
              <CardDescription>
                قائمة بجميع نتائج الطلاب في هذا الاختبار ({results.length} طالب)
              </CardDescription>
            </div>
            <Button 
              onClick={exportToCSV} 
              variant="outline"
              disabled={results.length === 0}
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير النتائج
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الطالب</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الدرجة المحصلة</TableHead>
                <TableHead className="text-right">النسبة المئوية</TableHead>
                <TableHead className="text-right">التقدير</TableHead>
                <TableHead className="text-right">تاريخ التقديم</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result._id}>
                  <TableCell className="font-medium text-right">{result.student.username}</TableCell>
                  <TableCell className="text-right">{result.student.email}</TableCell>
                  <TableCell className="text-right">
                    {result.obtainedScore} / {result.totalScore}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={getGradeColor(result.percentage)}>
                      {result.percentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={result.percentage >= 50 ? 'default' : 'destructive'}>
                      {getGradeText(result.percentage)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(result.submittedAt).toLocaleDateString('ar-EG')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
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

      {/* Question Statistics */}
      {statistics?.questionStats && statistics.questionStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات الأسئلة</CardTitle>
            <CardDescription>أداء الطلاب في كل سؤال</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.questionStats.map((questionStat, index) => (
                <div key={questionStat.questionId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      سؤال {index + 1}: {questionStat.questionText}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-600">
                      <span>الإجابات الصحيحة: {questionStat.correctCount}</span>
                      <span>إجمالي المحاولات: {questionStat.totalAttempts}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={questionStat.accuracy >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    دقة: {questionStat.accuracy.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}