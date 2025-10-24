/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Eye, Calendar, Award, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

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
  timeSpent: number;
}

export default function ParentResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [childFilter, setChildFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    fetchResults();
    fetchChildren();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parent/children/results', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('فشل في جلب النتائج');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setResults(data.data.results || []); // ✅ التأكد من أن results ليست undefined
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('فشل في تحميل النتائج');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parent/dashboard', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setChildren(data.data.parent.children || []); // ✅ التأكد من أن children ليست undefined
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
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

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'quiz': { label: 'اختبار سريع', variant: 'secondary' as const },
      'midterm': { label: 'منتصف الفصل', variant: 'default' as const },
      'final': { label: 'نهاية الفصل', variant: 'destructive' as const },
      'practice': { label: 'تدريبي', variant: 'outline' as const }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'نحو': 'النحو',
      'صرف': 'الصرف',
      'بلاغة': 'البلاغة',
      'أدب': 'الأدب',
      'نصوص': 'النصوص',
      'إملاء': 'الإملاء',
      'اختبار_شامل': 'شامل'
    };
    return categories[category] || category;
  };

  // ✅ دالة آمنة للحصول على عنوان الاختبار
  const getExamTitle = (result: ExamResult) => {
    return result.exam?.title || 'اختبار محذوف';
  };

  // ✅ دالة آمنة للحصول على نوع الاختبار
  const getExamType = (result: ExamResult) => {
    return result.exam?.examType || 'unknown';
  };

  // ✅ دالة آمنة للحصول على مادة الاختبار
  const getExamCategory = (result: ExamResult) => {
    return result.exam?.category || 'غير محدد';
  };

  // ✅ دالة آمنة للحصول على الدرجة الكاملة
  const getTotalMarks = (result: ExamResult) => {
    return result.exam?.totalMarks || result.obtainedScore;
  };

//   const exportToPDF = async (childId?: string) => {
//   try {
//     let url = 'http://localhost:5000/api/parent/children/results/export';
//     let params = new URLSearchParams();
    
//     if (childId) {
//       params.append('childId', childId);
//     }
    
//     // إضافة الفلاتر إذا كانت موجودة
//     if (searchTerm) params.append('search', searchTerm);
//     if (childFilter !== 'all') params.append('childFilter', childFilter);
//     if (subjectFilter !== 'all') params.append('subjectFilter', subjectFilter);
//     if (typeFilter !== 'all') params.append('typeFilter', typeFilter);

//     const response = await fetch(`${url}?${params}`, {
//       credentials: 'include'
//     });

//     if (response.ok) {
//       const blob = await response.blob();
      
//       // إنشاء رابط تحميل
//       const downloadUrl = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = downloadUrl;
      
//       // تسمية الملف بناءً على نوع التقرير
//       const filename = childId 
//         ? `تقرير-${children.find(c => c._id === childId)?.username || 'طالب'}.pdf`
//         : `تقرير-جميع-الابناء.pdf`;
      
//       a.download = filename;
//       document.body.appendChild(a);
//       a.click();
      
//       // التنظيف
//       window.URL.revokeObjectURL(downloadUrl);
//       document.body.removeChild(a);
      
//       toast.success('تم تحميل التقرير بنجاح');
//     } else {
//       const errorData = await response.json();
//       toast.error(errorData.message || 'فشل في تصدير التقرير');
//     }
//   } catch (error) {
//     console.error('Error exporting PDF:', error);
//     toast.error('فشل في اتصال الخادم');
//   }
// };
  const filteredResults = results.filter(result => {
    // ✅ تحقق آمن من وجود exam و student
    if (!result.student || !result.exam) {
      return false; // استبعاد النتائج التي تفتقد بيانات أساسية
    }

    const matchesSearch = 
      getExamTitle(result).toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChild = childFilter === 'all' || result.student._id === childFilter;
    const matchesSubject = subjectFilter === 'all' || getExamCategory(result) === subjectFilter;
    const matchesType = typeFilter === 'all' || getExamType(result) === typeFilter;
    
    return matchesSearch && matchesChild && matchesSubject && matchesType;
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
          <h1 className="text-3xl font-bold text-gray-900">جميع النتائج</h1>
          <p className="text-gray-600 mt-2">عرض نتائج جميع الأبناء في الاختبارات</p>
        </div>
        {/* <Button onClick={() => exportToPDF()}>
          <Download className="h-4 w-4 ml-2" />
          تصدير جميع النتائج
        </Button> */}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث في الاختبارات أو الأبناء..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <div className="w-48">
              <Select value={childFilter} onValueChange={setChildFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأبناء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأبناء</SelectItem>
                  {children.map(child => (
                    <SelectItem key={child._id} value={child._id}>
                      {child.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المواد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المواد</SelectItem>
                  <SelectItem value="نحو">النحو</SelectItem>
                  <SelectItem value="صرف">الصرف</SelectItem>
                  <SelectItem value="بلاغة">البلاغة</SelectItem>
                  <SelectItem value="أدب">الأدب</SelectItem>
                  <SelectItem value="نصوص">النصوص</SelectItem>
                  <SelectItem value="إملاء">الإملاء</SelectItem>
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
          <CardTitle>نتائج الاختبارات</CardTitle>
          <CardDescription>
            {filteredResults.length} نتيجة من أصل {results.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table className='text-center'>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-bold">الابن</TableHead>
                  <TableHead className="text-right font-bold">الاختبار</TableHead>
                  <TableHead className="text-right font-bold">المادة</TableHead>
                  <TableHead className="text-right font-bold">نوع الاختبار</TableHead>
                  <TableHead className="text-right font-bold">الدرجة</TableHead>
                  <TableHead className="text-right font-bold">النسبة</TableHead>
                  <TableHead className="text-right font-bold">التقدير</TableHead>
                  <TableHead className="text-right font-bold">تاريخ التقديم</TableHead>
                  <TableHead className="text-right font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3 justify-end">
                        <div className="text-right">
                          <div className="font-medium">{result.student?.username || 'طالب غير معروف'}</div>
                          <div className="text-sm text-gray-500">{result.student?.grade || 'غير محدد'}</div>
                        </div>
                        {/* <User className="h-8 w-8 text-gray-400" /> */}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-right">
                      {getExamTitle(result)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getCategoryName(getExamCategory(result))}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(getExamType(result))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Award className="h-4 w-4 text-yellow-500" />
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
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/parent/child/${result.student?._id || ''}`}>
                          <Button variant="outline" size="sm" disabled={!result.student?._id}>
                            <Eye className="h-4 w-4 ml-2" />
                            التفاصيل
                          </Button>
                        </Link>
                        {/* <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => exportToPDF(result.student?._id)}
                          disabled={!result.student?._id}
                        >
                          <Download className="h-4 w-4 ml-2" />
                          تصدير
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {results.length === 0 ? 'لا توجد نتائج' : 'لا توجد نتائج تطابق البحث'}
              </h3>
              <p className="text-gray-500">
                {results.length === 0 
                  ? 'لم يقم أبناؤك بتقديم أي اختبارات بعد' 
                  : 'جرب تعديل معايير البحث'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}