/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, User, Award, Calendar, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

interface Child {
  _id: string;
  username: string;
  email: string;
  grade: string;
  avatar: string;
}

interface ExamResult {
  _id: string;
  exam: {
    _id: string;
    title: string;
    examType: string;
    category: string;
    totalMarks: number;
  } | null; // ✅ جعل exam يمكن أن يكون null
  student: {
    _id: string;
    username: string;
    grade: string;
  };
  obtainedScore: number;
  percentage: number;
  submittedAt: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
}

interface MonthlyProgress {
  year: number;
  month: number;
  monthName: string;
  examCount: number;
  averageScore: number;
  exams: any[];
}

export default function ChildDetailsPage() {
  const params = useParams();
  const childId = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [progress, setProgress] = useState<MonthlyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchChildData();
      fetchChildResults();
      fetchChildAttendance();
      fetchChildProgress();
    }
  }, [childId]);

  const fetchChildData = async () => {
    try {
      const response = await api.get('/api/parent/dashboard');

      if (response.data.status === 'success') {
        const childData = response.data.data.parent.children.find((c: Child) => c._id === childId);
        setChild(childData);
      }
    } catch (error: any) {
      console.error('Error fetching child data:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل بيانات الابن';
      toast.error(errorMessage);
    }
  };

  const fetchChildResults = async () => {
    try {
      const response = await api.get('/api/parent/children/results');

      if (response.data.status === 'success') {
        // ✅ تصفية النتائج التي تحتوي على exam و student
        const childResults = (response.data.data.results || []).filter((result: ExamResult) => 
          result.student && result.student._id === childId && result.exam // ✅ التأكد من وجود exam
        );
        setResults(childResults);
      }
    } catch (error: any) {
      console.error('Error fetching child results:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل نتائج الابن';
      toast.error(errorMessage);
    }
  };

  const fetchChildAttendance = async () => {
    try {
      const response = await api.get('/api/parent/children/attendance');

      if (response.data.status === 'success') {
        const childAttendance = (response.data.data.attendance || []).filter((record: any) => 
          record.student && record.student._id === childId
        );
        setAttendance(childAttendance);
      }
    } catch (error: any) {
      console.error('Error fetching child attendance:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل بيانات الحضور';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildProgress = async () => {
    try {
      const response = await api.get(`/api/parent/child/${childId}/progress`, {
        params: { months: 6 }
      });

      if (response.data.status === 'success') {
        setProgress(response.data.data.monthlyProgress || []);
      }
    } catch (error: any) {
      console.error('Error fetching child progress:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل بيانات التقدم';
      toast.error(errorMessage);
    }
  };

  const exportReport = async () => {
    try {
      const response = await api.get(`/api/parent/child/${childId}/report/export`, {
        responseType: 'blob' // Important for file downloads
      });

      if (response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تقرير-${child?.username || 'طالب'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('تم تحميل التقرير بنجاح');
      }
    } catch (error: any) {
      console.error('Error exporting report:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تصدير التقرير';
      toast.error(errorMessage);
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

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'present': 'حاضر',
      'absent': 'غائب',
      'late': 'متأخر',
      'excused': 'معذور'
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variantMap: { [key: string]: "default" | "destructive" | "secondary" | "outline" } = {
      'present': 'default',
      'absent': 'destructive',
      'late': 'secondary',
      'excused': 'outline'
    };
    return variantMap[status] || 'outline';
  };

  // ✅ دالة آمنة للحصول على عنوان الاختبار
  const getExamTitle = (result: ExamResult) => {
    return result.exam?.title || 'اختبار محذوف';
  };

  // ✅ دالة آمنة للحصول على الدرجة الكاملة
  const getTotalMarks = (result: ExamResult) => {
    return result.exam?.totalMarks || result.obtainedScore;
  };

  // ✅ دالة آمنة للحصول على نوع الاختبار
  const getExamType = (result: ExamResult) => {
    return result.exam?.examType || 'unknown';
  };

  // ✅ دالة آمنة للحصول على مادة الاختبار
  const getExamCategory = (result: ExamResult) => {
    return result.exam?.category || 'غير محدد';
  };

  // حساب الإحصائيات
  const statistics = {
    totalExams: results.length,
    averageScore: results.length > 0 ? 
      results.reduce((sum, result) => sum + result.percentage, 0) / results.length : 0,
    bestScore: results.length > 0 ? Math.max(...results.map(r => r.percentage)) : 0,
    totalAttendance: attendance.length,
    presentDays: attendance.filter(a => a.status === 'present').length,
    attendanceRate: attendance.length > 0 ? 
      Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">الابن غير موجود</h3>
          <p className="text-gray-500">تعذر العثور على بيانات الابن</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{child.username}</h1>
            <p className="text-gray-600">{child.grade} - {child.email}</p>
          </div>
        </div>
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 ml-2" />
          تصدير التقرير
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الاختبارات</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalExams}</div>
            <p className="text-xs text-muted-foreground">اختبار مقدم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الدرجات</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">نسبة مئوية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة الحضور</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">من {statistics.totalAttendance} يوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أعلى درجة</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.bestScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">أفضل أداء</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="results" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">النتائج</TabsTrigger>
          <TabsTrigger value="attendance">الحضور</TabsTrigger>
          <TabsTrigger value="progress">التقدم</TabsTrigger>
        </TabsList>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>نتائج الاختبارات</CardTitle>
              <CardDescription>
                جميع نتائج {child.username} في الاختبارات ({results.length} اختبار)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-right font-bold">الاختبار</TableHead>
                      <TableHead className="text-right font-bold">الدرجة</TableHead>
                      <TableHead className="text-right font-bold">النسبة</TableHead>
                      <TableHead className="text-right font-bold">التقدير</TableHead>
                      <TableHead className="text-right font-bold">تاريخ التقديم</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-right">
                          {/* ✅ استخدام الدالة الآمنة */}
                          {getExamTitle(result)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Award className="h-4 w-4 text-yellow-500" />
                            {/* ✅ استخدام الدالة الآمنة */}
                            {result.obtainedScore} / {getTotalMarks(result)}
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {results.length === 0 && (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-500">لم يقم {child.username} بتقديم أي اختبارات بعد</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>سجل الحضور</CardTitle>
              <CardDescription>
                حضور {child.username} في الحصص ({attendance.length} يوم)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-right font-bold">التاريخ</TableHead>
                      <TableHead className="text-right font-bold">الحالة</TableHead>
                      <TableHead className="text-right font-bold">ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record._id} className="hover:bg-gray-50">
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(record.date).toLocaleDateString('ar-EG')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(record.status)}>
                            {getStatusText(record.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {record.notes || <span className="text-gray-400">لا توجد ملاحظات</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {attendance.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سجلات حضور</h3>
                  <p className="text-gray-500">لم يتم تسجيل أي حضور لـ {child.username}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التقدم الأكاديمي</CardTitle>
              <CardDescription>
                تطور أداء {child.username} خلال آخر 6 أشهر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {progress.map((month) => (
                  <div key={`${month.year}-${month.month}`} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{month.monthName} {month.year}</h4>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {month.examCount} اختبار
                        </Badge>
                        <Badge variant="outline" className={getGradeColor(month.averageScore)}>
                          متوسط: {month.averageScore}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {month.exams.map((exam, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span className="text-sm">{exam.title || 'اختبار غير معروف'}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getGradeColor(exam.score)}>
                              {exam.score}%
                            </Badge>
                            <span className="text-xs text-gray-500">{exam.category || 'غير محدد'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {progress.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات تقدم</h3>
                  <p className="text-gray-500">لا توجد بيانات كافية لعرض التقدم الأكاديمي</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}