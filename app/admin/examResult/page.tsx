/* eslint-disable @typescript-eslint/no-explicit-any */
// app/grades/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Users, Award, Clock, Eye, Download, Search, User, Calendar, Mail, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { api } from '@/redux/slices/authSlice';

interface Exam {
  _id: string;
  title: string;
  description: string;
  grade: string;
  category: string;
  examType: string;
  duration: number;
  totalMarks: number;
  isPublished: boolean;
  questions: any[];
  createdAt: string;
  teacher: {
    username: string;
    email: string;
  };
}

interface ExamResult {
  _id: string;
  student: {
    _id: string;
    username: string;
    email: string;
    phone?: string;
  };
  exam: {
    _id: string;
    title: string;
    totalMarks: number;
  };
  totalScore: number;
  obtainedScore: number;
  percentage: number;
  submittedAt: string;
  timeSpent: number;
}

interface Statistics {
  totalExams: number;
  totalSubmissions: number;
  averagePercentage: number;
  passRate: number;
  topPerformer: {
    student: string;
    percentage: number;
    exam: string;
  };
}

// 🔹 دوال API للدرجات باستخدام axios
const gradesApi = {
  // جلب الاختبارات
  getExams: async () => {
    const response = await api.get('/api/exams/teacher');
    return response.data;
  },

  // جلب جميع النتائج
  getAllResults: async () => {
    const response = await api.get('/api/exams/results/all');
    return response.data;
  },

  // جلب نتائج اختبار محدد
  getExamResults: async (examId: string) => {
    const response = await api.get(`/api/exams/${examId}/results`);
    return response.data;
  }
};

export default function GradesPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [examFilter, setExamFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchExams();
    fetchAllResults();
  }, []);

  const fetchExams = async () => {
    try {
      // ✅ استخدام axios API بدلاً من fetch
      const data = await gradesApi.getExams();
      
      if (data.status === 'success') {
        setExams(data.data.exams);
      }
    } catch (error: any) {
      console.error('Error fetching exams:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل الاختبارات';
      toast.error(errorMessage);
    }
  };

  const fetchAllResults = async () => {
    try {
      // ✅ استخدام axios API بدلاً من fetch
      const data = await gradesApi.getAllResults();
      
      if (data.status === 'success') {
        setResults(data.data.results);
        calculateStatistics(data.data.results);
      } else {
        // Fallback: fetch results for each exam individually
        await fetchResultsForAllExams();
      }
    } catch (error: any) {
      console.error('Error fetching results:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل النتائج';
      toast.error(errorMessage);
      await fetchResultsForAllExams();
    } finally {
      setLoading(false);
    }
  };

  const fetchResultsForAllExams = async () => {
    const allResults: ExamResult[] = [];
    
    for (const exam of exams) {
      try {
        // ✅ استخدام axios API بدلاً من fetch
        const data = await gradesApi.getExamResults(exam._id);
        
        if (data.status === 'success') {
          allResults.push(...data.data.results);
        }
      } catch (error: any) {
        console.error(`Error fetching results for exam ${exam._id}:`, error);
      }
    }
    
    setResults(allResults);
    calculateStatistics(allResults);
  };

  const calculateStatistics = (resultsData: ExamResult[]) => {
    if (resultsData.length === 0) {
      setStatistics({
        totalExams: exams.length,
        totalSubmissions: 0,
        averagePercentage: 0,
        passRate: 0,
        topPerformer: { student: 'لا يوجد', percentage: 0, exam: 'لا يوجد' }
      });
      return;
    }

    const totalSubmissions = resultsData.length;
    const averagePercentage = resultsData.reduce((sum, result) => sum + result.percentage, 0) / totalSubmissions;
    const passRate = (resultsData.filter(result => result.percentage >= 50).length / totalSubmissions) * 100;
    
    const topPerformer = resultsData.reduce((top, current) => 
      current.percentage > top.percentage ? current : top
    );

    setStatistics({
      totalExams: exams.length,
      totalSubmissions,
      averagePercentage,
      passRate,
      topPerformer: {
        student: topPerformer.student.username,
        percentage: topPerformer.percentage,
        exam: topPerformer.exam.title
      }
    });
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'quiz': { label: 'اختبار سريع', variant: 'secondary' as const },
      'midterm': { label: 'منتصف الفصل', variant: 'default' as const },
      'final': { label: 'نهاية الفصل', variant: 'destructive' as const },
      'practice': { label: 'تدريبي', variant: 'outline' as const }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  const exportToCSV = () => {
    if (results.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }

    try {
      const headers = ['الطالب', 'البريد الإلكتروني', 'الاختبار', 'الدرجة المحصلة', 'الدرجة الكاملة', 'النسبة المئوية', 'التقدير', 'تاريخ التقديم', 'الوقت المستغرق'];
      const csvData = results.map(result => [
        result.student.username,
        result.student.email,
        result.exam.title,
        result.obtainedScore.toString(),
        result.totalScore.toString(),
        `${result.percentage.toFixed(1)}%`,
        getGradeText(result.percentage),
        new Date(result.submittedAt).toLocaleDateString('ar-EG'),
        `${Math.floor(result.timeSpent / 60)}:${(result.timeSpent % 60).toString().padStart(2, '0')}`
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `جميع_النتائج_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('تم تصدير النتائج بنجاح');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('حدث خطأ أثناء تصدير النتائج');
    }
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExam = examFilter === 'all' || result.exam._id === examFilter;
    
    // Get exam details for additional filtering
    const exam = exams.find(e => e._id === result.exam._id);
    const matchesGrade = gradeFilter === 'all' || (exam && exam.grade === gradeFilter);
    const matchesType = typeFilter === 'all' || (exam && exam.examType === typeFilter);
    
    return matchesSearch && matchesExam && matchesGrade && matchesType;
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل النتائج...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الدرجات</h1>
          <p className="text-gray-600 mt-2">عرض جميع نتائج الطلاب في الاختبارات</p>
        </div>
        <Button onClick={exportToCSV} disabled={results.length === 0}>
          <Download className="h-4 w-4 ml-2" />
          تصدير جميع النتائج
        </Button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الاختبارات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalExams}</div>
              <p className="text-xs text-muted-foreground">اختبار منشور</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي التقديمات</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">تقديم اختبار</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط النتائج</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averagePercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">نسبة مئوية</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.passRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">نسبة النجاح</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performer */}
      {statistics && statistics.topPerformer.percentage > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800">أعلى أداء</h3>
                <p className="text-blue-600 mt-1">
                  {statistics.topPerformer.student} - {statistics.topPerformer.percentage.toFixed(1)}%
                </p>
                <p className="text-blue-500 text-sm">في اختبار: {statistics.topPerformer.exam}</p>
              </div>
              <Award className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث في الطلاب أو الاختبارات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={examFilter} onValueChange={setExamFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الاختبارات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الاختبارات</SelectItem>
                  {exams.map(exam => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصفوف</SelectItem>
                  <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                  <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
                  <SelectItem value="كلاهما">كلاهما</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="quiz">اختبار سريع</SelectItem>
                  <SelectItem value="midterm">منتصف الفصل</SelectItem>
                  <SelectItem value="final">نهاية الفصل</SelectItem>
                  <SelectItem value="practice">تدريبي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>نتائج الطلاب</CardTitle>
          <CardDescription>
            قائمة بجميع نتائج الطلاب في الاختبارات ({filteredResults.length} نتيجة)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg text-center">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-bold">الطالب</TableHead>
                  <TableHead className="text-right font-bold">الاختبار</TableHead>
                  <TableHead className="text-right font-bold">نوع الاختبار</TableHead>
                  <TableHead className="text-right font-bold">الصف</TableHead>
                  <TableHead className="text-right font-bold">الدرجة</TableHead>
                  <TableHead className="text-right font-bold">النسبة</TableHead>
                  <TableHead className="text-right font-bold">التقدير</TableHead>
                  <TableHead className="text-right font-bold">تاريخ التقديم</TableHead>
                  {/* <TableHead className="text-right font-bold">الوقت</TableHead> */}
                  <TableHead className="text-right font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => {
                  const exam = exams.find(e => e._id === result.exam._id);
                  return (
                    <TableRow key={result._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3 justify-end">
                          <div className="text-right">
                            <div className="font-medium">{result.student.username}</div>
                            <div className="text-sm text-gray-500">{result.student.email}</div>
                          </div>
                          {/* <User className="h-8 w-8 text-gray-400" /> */}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-right">
                        {result.exam.title}
                      </TableCell>
                      <TableCell>
                        {exam && getTypeBadge(exam.examType)}
                      </TableCell>
                      <TableCell className="text-right">
                        {exam?.grade || 'غير محدد'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Award className="h-4 w-4 text-yellow-500" />
                          {result.obtainedScore} / {result.totalScore}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getGradeColor(result.percentage)}>
                          {result.percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={result.percentage >= 50 ? 'default' : 'destructive'}>
                          {getGradeText(result.percentage)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {new Date(result.submittedAt).toLocaleDateString('ar-EG')}
                        </div>
                      </TableCell>
                      {/* <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/student/exams/${result.exam._id}/result`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 ml-2" />
                              التفاصيل
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">
                {results.length === 0 
                  ? 'لم يقم أي طالب بتقديم الاختبارات بعد' 
                  : 'لم يتم العثور على نتائج تطابق معايير البحث'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}