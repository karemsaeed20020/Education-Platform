/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  Download,
  Eye,
  Filter,
  Calendar,
  User,
  File
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { api } from '@/redux/slices/authSlice';

interface Homework {
  _id: string;
  title: string;
  description: string;
  grade: string;
  dueDate: string;
  type: 'text' | 'file' | 'mixed';
  status: 'active' | 'archived';
  content: {
    text?: string;
    files: Array<{
      originalName: string;
      path: string;
      size: number;
      mimetype: string;
    }>;
  };
  teacher: {
    username: string;
    email: string;
  };
  createdAt: string;
}

export default function StudentHomeworkPage() {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchStudentHomeworks();
  }, []);

  const fetchStudentHomeworks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/homework/student');
      
      if (response.data.status === 'success') {
        setHomeworks(response.data.data.homeworks);
        toast.success(`تم تحميل ${response.data.data.homeworks.length} واجب`);
      } else {
        toast.error('فشل في تحميل الواجبات');
      }
    } catch (error: any) {
      console.error('Error fetching homeworks:', error);
      const message = error.response?.data?.message || 'حدث خطأ في تحميل الواجبات';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (homeworkId: string, fileIndex: number, fileName: string) => {
    try {
      const response = await api.get(
        `/api/homework/${homeworkId}/download/${fileIndex}`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تحميل الملف بنجاح');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('حدث خطأ أثناء تحميل الملف');
    }
  };

  const filteredHomeworks = homeworks.filter(hw => {
    const matchesSearch = hw.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || hw.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الواجبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">واجباتي</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">واجبات مادة اللغة العربية</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث في الواجبات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-full"
                />
              </div>
            </div>
            
            {/* Filter Button for Mobile */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                تصفية
              </Button>
            </div>

            {/* Grade Filter - Desktop */}
            <div className="hidden lg:block w-48">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">جميع الصفوف</option>
                <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Dropdown */}
          {isFilterOpen && (
            <div className="lg:hidden mt-4 p-4 border-t border-gray-200">
              <Label htmlFor="mobile-grade-filter" className="text-sm font-medium mb-2 block">
                الصف الدراسي
              </Label>
              <select
                id="mobile-grade-filter"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">جميع الصفوف</option>
                <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Homework List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الواجبات النشطة</CardTitle>
          <CardDescription>
            جميع الواجبات المنشورة لمادتك حسب صفّك الدراسي
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-right font-bold border-l p-4">عنوان الواجب</th>
                  <th className="text-right font-bold border-l p-4">الصف</th>
                  <th className="text-right font-bold border-l p-4">موعد التسليم</th>
                  <th className="text-right font-bold border-l p-4">المعلم</th>
                  <th className="text-right font-bold border-l p-4">الملفات</th>
                  <th className="text-right font-bold p-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredHomeworks.map((homework) => (
                  <tr key={homework._id} className="hover:bg-gray-50 border-b">
                    <td className="font-medium text-right border-l p-4">
                      <div>
                        <div className="font-semibold">{homework.title}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {homework.description}
                        </div>
                        {homework.content.text && (
                          <div className="text-sm text-blue-600 mt-1 line-clamp-2">
                            {homework.content.text.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right border-l p-4">
                      {homework.grade}
                    </td>
                    <td className="text-right border-l p-4">
                      {new Date(homework.dueDate).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="text-right border-l p-4">
                      {homework.teacher?.username || 'معلم اللغة العربية'}
                    </td>
                    <td className="text-right border-l p-4">
                      {homework.content.files.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {homework.content.files.map((file, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => downloadFile(homework._id, index, file.originalName)}
                            >
                              <Download className="h-3 w-3 ml-1" />
                              {file.originalName.length > 15 
                                ? `${file.originalName.substring(0, 15)}...` 
                                : file.originalName
                              }
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">لا توجد ملفات</span>
                      )}
                    </td>
                    <td className="text-right p-4">
                      <Link href={`/student/homework/${homework._id}`}>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          عرض التفاصيل
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredHomeworks.map((homework) => (
              <Card key={homework._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {homework.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {homework.description}
                      </p>
                      {homework.content.text && (
                        <p className="text-blue-600 text-sm mt-1 line-clamp-2">
                          {homework.content.text.substring(0, 80)}...
                        </p>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">موعد التسليم:</span>
                      </div>
                      <div className="text-gray-900 text-left">
                        {new Date(homework.dueDate).toLocaleDateString('ar-EG')}
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">المعلم:</span>
                      </div>
                      <div className="text-gray-900 text-left">
                        {homework.teacher?.username || 'معلم اللغة العربية'}
                      </div>

                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">الصف:</span>
                      </div>
                      <div className="text-gray-900 text-left">
                        {homework.grade}
                      </div>
                    </div>

                    {/* Files Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">الملفات:</span>
                      </div>
                      {homework.content.files.length > 0 ? (
                        <div className="space-y-2">
                          {homework.content.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                              <span className="text-xs text-gray-600 flex-1 truncate ml-2">
                                {file.originalName}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => downloadFile(homework._id, index, file.originalName)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">لا توجد ملفات</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                      <Link href={`/student/homework/${homework._id}`} className="w-full">
                        <Button className="w-full flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          عرض التفاصيل
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredHomeworks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              {homeworks.length === 0 
                ? 'لا توجد واجبات نشطة حالياً' 
                : 'لم يتم العثور على واجبات تطابق معايير البحث'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}