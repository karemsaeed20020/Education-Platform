/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, FileText, BarChart3, Calendar, User, Award, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

interface Child {
  _id: string;
  username: string;
  grade: string;
}

interface Exam {
  _id: string;
  title: string;
  totalMarks: number;
}

interface Result {
  _id: string;
  exam: Exam | null;
  obtainedScore: number;
  percentage: number;
  submittedAt: string;
}

interface Attendance {
  _id: string;
  date: string;
  status: 'present' | 'absent';
}

interface ReportData {
  student: string;
  period: {
    start: string;
    end: string;
  };
  results: Result[];
  attendance: Attendance[];
  statistics: {
    totalExams: number;
    averageScore: number;
    totalAttendance: number;
    presentDays: number;
    attendanceRate: number;
    bestScore: number;
    improvement: number;
  };
}

export default function ParentReportsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
    // تعيين التواريخ الافتراضية (آخر 30 يوم)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await api.get('/api/parent/dashboard');

      if (response.data.status === 'success') {
        setChildren(response.data.data.parent.children);
        if (response.data.data.parent.children.length > 0) {
          setSelectedChild(response.data.data.parent.children[0]._id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching children:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل بيانات الأبناء';
      toast.error(errorMessage);
    }
  };

  const generateReport = async () => {
    if (!selectedChild) {
      toast.error('يرجى اختيار الابن');
      return;
    }

    setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(
        `/api/parent/child/${selectedChild}/report`,
        { params }
      );

      if (response.data.status === 'success') {
        setReportData(response.data.data);
        toast.success('تم إنشاء التقرير بنجاح');
      } else {
        throw new Error('فشل في إنشاء التقرير');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      const errorMessage = error.response?.data?.message || 'فشل في إنشاء التقرير';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    if (!selectedChild) {
      toast.error('يرجى اختيار الابن');
      return;
    }

    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(
        `/api/parent/child/${selectedChild}/report/export`,
        { 
          params,
          responseType: 'blob' // Important for file downloads
        }
      );

      if (response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تقرير-${children.find(c => c._id === selectedChild)?.username || 'طالب'}.pdf`;
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

  const getExamTitle = (result: Result) => {
    return result.exam?.title || 'اختبار غير معروف';
  };

  const getTotalMarks = (result: Result) => {
    return result.exam?.totalMarks || 0;
  };

  const selectedChildInfo = children.find(child => child._id === selectedChild);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير الشاملة</h1>
          <p className="text-gray-600 mt-2">إنشاء وتحميل تقارير أداء الأبناء</p>
        </div>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle>إنشاء تقرير</CardTitle>
          <CardDescription>
            اختر الابن والفترة الزمنية لإنشاء تقرير مفصل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">اختر الابن</label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الابن" />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child._id} value={child._id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {child.username}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">من تاريخ</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">إلى تاريخ</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateReport} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 ml-2" />
                    إنشاء التقرير
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportData && selectedChildInfo && (
        <>
          {/* Report Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-blue-800">تقرير أداء الطالب</h2>
                  <p className="text-blue-600">
                    {selectedChildInfo.username} - {selectedChildInfo.grade}
                  </p>
                  <p className="text-blue-500 text-sm">
                    الفترة من {new Date(reportData.period.start).toLocaleDateString('ar-EG')} 
                    إلى {new Date(reportData.period.end).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <Button onClick={exportReport}>
                  <Download className="h-4 w-4 ml-2" />
                  تحميل PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الاختبارات</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.statistics.totalExams}</div>
                <p className="text-xs text-muted-foreground">اختبار</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط الدرجات</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.statistics.averageScore.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">نسبة مئوية</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">نسبة الحضور</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.statistics.attendanceRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">من {reportData.statistics.totalAttendance} يوم</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">أعلى درجة</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.statistics.bestScore.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">أفضل أداء</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle>النتائج الحديثة</CardTitle>
              <CardDescription>
                آخر {Math.min(reportData.results.length, 5)} اختبارات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.results.slice(0, 5).map((result, index) => (
                  <div key={result._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{getExamTitle(result)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(result.submittedAt).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getGradeColor(result.percentage)}>
                        {result.percentage.toFixed(1)}%
                      </Badge>
                      <Badge variant={result.percentage >= 50 ? 'default' : 'destructive'}>
                        {getGradeText(result.percentage)}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        {result.obtainedScore}/{getTotalMarks(result)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص الحضور</CardTitle>
              <CardDescription>
                {reportData.statistics.presentDays} يوم حاضر من أصل {reportData.statistics.totalAttendance} يوم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">أيام الحضور</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600">{reportData.statistics.presentDays}</span>
                    <span className="text-gray-500">يوم</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">أيام الغياب</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600">
                      {reportData.statistics.totalAttendance - reportData.statistics.presentDays}
                    </span>
                    <span className="text-gray-500">يوم</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${reportData.statistics.attendanceRate}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  نسبة الحضور: {reportData.statistics.attendanceRate.toFixed(1)}%
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!reportData && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تقارير</h3>
            <p className="text-gray-500 mb-4">اختر الابن والفترة الزمنية لإنشاء تقرير مفصل</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}