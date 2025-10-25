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
  Eye
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

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

  const downloadFile = (homeworkId: string, fileIndex: number, fileName: string) => {
    try {
      // افتح الرابط مباشرة - سيتم التحميل تلقائياً
      window.open(
        `http://localhost:5000/api/homework/${homeworkId}/download/${fileIndex}`,
        '_blank'
      );
      toast.success('تم بدء التحميل');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('حدث خطأ أثناء تحميل الملف');
    }
  };

  // Alternative download using api
  const downloadFileWithApi = async (homeworkId: string, fileIndex: number, fileName: string) => {
    try {
      const response = await api.get(`/api/homework/${homeworkId}/download/${fileIndex}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تحميل الملف بنجاح');
    } catch (error: any) {
      console.error('Download error:', error);
      const message = error.response?.data?.message || 'حدث خطأ أثناء تحميل الملف';
      toast.error(message);
    }
  };

  const filteredHomeworks = homeworks.filter(hw => {
    const matchesSearch = hw.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || hw.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الواجبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">واجباتي</h1>
          <p className="text-gray-600 mt-2">واجبات مادة اللغة العربية</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث في الواجبات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">جميع الصفوف</option>
                <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Homework Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الواجبات النشطة</CardTitle>
          <CardDescription>
            جميع الواجبات المنشورة لمادتك حسب صفّك الدراسي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-right font-bold border-l p-3">عنوان الواجب</th>
                  <th className="text-right font-bold border-l p-3">الصف</th>
                  <th className="text-right font-bold border-l p-3">موعد التسليم</th>
                  <th className="text-right font-bold border-l p-3">المعلم</th>
                  <th className="text-right font-bold border-l p-3">الملفات</th>
                  <th className="text-right font-bold p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredHomeworks.map((homework) => (
                  <tr key={homework._id} className="hover:bg-gray-50 border-b">
                    <td className="font-medium text-right border-l p-3">
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
                    <td className="text-right border-l p-3">
                      {homework.grade}
                    </td>
                    <td className="text-right border-l p-3">
                      {new Date(homework.dueDate).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="text-right border-l p-3">
                      {homework.teacher?.username || 'معلم اللغة العربية'}
                    </td>
                    <td className="text-right border-l p-3">
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
                    <td className="text-right p-3">
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
            {filteredHomeworks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {homeworks.length === 0 
                  ? 'لا توجد واجبات نشطة حالياً' 
                  : 'لم يتم العثور على واجبات تطابق معايير البحث'
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}