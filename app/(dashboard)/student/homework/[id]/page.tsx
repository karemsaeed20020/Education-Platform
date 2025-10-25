'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { api } from '@/redux/slices/authSlice';

interface Homework {
  _id: string;
  title: string;
  description: string;
  grade: string;
  dueDate: string;
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
  };
  createdAt: string;
}

export default function HomeworkDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchHomeworkDetails(params.id as string);
    }
  }, [params.id]);

  const fetchHomeworkDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/homework/${id}`);
      const data = response.data;
      
      if (data.status === 'success') {
        setHomework(data.data.homework);
      } else {
        toast.error('لا يمكن الوصول إلى هذا الواجب');
        router.push('/student/homework');
      }
    } catch (error) {
      console.error('Error fetching homework details:', error);
      toast.error('حدث خطأ في تحميل تفاصيل الواجب');
      router.push('/student/homework');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (homeworkId: string, fileIndex: number, fileName: string) => {
    try {
      // Use api instance for download
      const response = await api.get(
        `/api/homework/${homeworkId}/download/${fileIndex}`,
        {
          responseType: 'blob', // Important for file downloads
        }
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تحميل الملف بنجاح');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('حدث خطأ أثناء تحميل الملف');
    }
  };

  // Alternative download method that opens in new tab (similar to your original approach)
  const downloadFileAlternative = (homeworkId: string, fileIndex: number, fileName: string) => {
    try {
      // Get the full URL from the api instance
      const downloadUrl = `${api.defaults.baseURL}/api/homework/${homeworkId}/download/${fileIndex}`;
      window.open(downloadUrl, '_blank');
      toast.success('تم بدء التحميل');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('حدث خطأ أثناء تحميل الملف');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل تفاصيل الواجب...</p>
        </div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">لم يتم العثور على الواجب المطلوب</p>
            <Button onClick={() => router.push('/student/homework')} className="mt-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة إلى قائمة الواجبات
            </Button>
          </CardContent>
        </Card>
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
      
      <div className="flex items-center gap-4">
        <Button onClick={() => router.push('/student/homework')} variant="outline">
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{homework.title}</h1>
          <p className="text-gray-600 mt-1">واجب مادة اللغة العربية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>وصف الواجب</CardTitle>
            <CardDescription>{homework.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {homework.content.text && (
              <div className="prose max-w-none">
                <h3 className="font-semibold mb-2">المحتوى النصي:</h3>
                <p className="whitespace-pre-wrap">{homework.content.text}</p>
              </div>
            )}
            
            {homework.content.files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">الملفات المرفقة:</h3>
                <div className="space-y-2">
                  {homework.content.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">{file.originalName}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(homework._id, index, file.originalName)}
                        // Or use the alternative method:
                        // onClick={() => downloadFileAlternative(homework._id, index, file.originalName)}
                      >
                        <Download className="h-3 w-3 ml-1" />
                        تحميل
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الواجب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">الصف الدراسي</Label>
              <p className="font-medium">{homework.grade}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">المعلم</Label>
              <p className="font-medium">{homework.teacher?.username || 'معلم اللغة العربية'}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">موعد التسليم</Label>
              <p className="font-medium">
                {new Date(homework.dueDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">تاريخ النشر</Label>
              <p className="font-medium">
                {new Date(homework.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">الحالة</Label>
              <Badge variant="default" className="bg-green-100 text-green-800">
                نشط
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}