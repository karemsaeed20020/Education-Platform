// app/admin/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Eye, Trash2, Plus, Play, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Course {
  _id: string;
  title: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  grade: string;
  level: string;
  totalVideos: number;
  totalDuration: number;
  studentsEnrolled: string[];
  rating: {
    average: number;
    count: number;
  };
  isPublished: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses/instructor/my-courses', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCourses(data.data.courses || []);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('فشل في تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكورس؟')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('تم حذف الكورس بنجاح');
        fetchCourses(); // Refresh the list
      } else {
        toast.error('فشل في حذف الكورس');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('فشل في حذف الكورس');
    }
  };

  const publishCourse = async (courseId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/publish`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('تم نشر الكورس بنجاح');
        fetchCourses(); // Refresh the list
      } else {
        toast.error('فشل في نشر الكورس');
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error('فشل في نشر الكورس');
    }
  };

  const getStatusBadge = (course: Course) => {
    const status = course.status || (course.isPublished ? 'published' : 'draft');
    
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">منشور</Badge>;
      case 'draft':
        return <Badge variant="outline" className="border-gray-300 text-gray-600">مسودة</Badge>;
      case 'archived':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">مؤرشف</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0 دقيقة';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الكورسات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الكورسات</h1>
          <p className="text-gray-600 mt-2">إدارة وعرض جميع الكورسات الخاصة بك</p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            إنشاء كورس جديد
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">قائمة الكورسات</CardTitle>
          <CardDescription>
            لديك {courses.length} كورس{courses.length !== 1 ? 'ات' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-semibold text-gray-700 w-[300px] text-right">الكورس</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[120px] text-center">الصف</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[100px] text-center">الحالة</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[100px] text-center">الطلاب</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[100px] text-center">الدروس</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[130px] text-center">المدة</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[130px] text-center">السعر</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[80px] text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course._id} className="border-b hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{course.title}</div>
                          <div className="text-sm text-gray-500 truncate mt-1">
                            {course.shortDescription}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <Badge variant="outline" className="font-normal border-gray-300">
                        {course.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {getStatusBadge(course)}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <div className="flex items-center justify-center gap-1 text-gray-700">
                        <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="font-medium">{course.studentsEnrolled.length}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <div className="flex items-center justify-center gap-1 text-gray-700">
                        <Play className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="font-medium">{course.totalVideos}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <span className="text-sm text-gray-600 font-medium">
                        {formatDuration(course.totalDuration)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <div className="font-medium">
                        {course.discountPrice ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-green-600 font-semibold">{course.discountPrice} ر.س</span>
                            <span className="text-xs text-gray-500 line-through">
                              {course.price} ر.س
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-900">{course.price} ر.س</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => router.push(`/courses/${course._id}`)}
                            className="cursor-pointer"
                          >
                            <Eye className="w-4 h-4 ml-2" />
                            معاينة
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/courses/${course._id}/edit`)}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          {!course.isPublished && (
                            <DropdownMenuItem
                              onClick={() => publishCourse(course._id)}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 ml-2" />
                              نشر
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer focus:text-red-600"
                            onClick={() => deleteCourse(course._id)}
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {courses.length === 0 && (
            <div className="text-center py-16 border-t">
              <div className="text-gray-300 text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد كورسات</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                لم يتم إنشاء أي كورسات حتى الآن. ابدأ بإنشاء أول كورس لك.
              </p>
              <Link href="/admin/courses/new">
                <Button size="lg">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء أول كورس
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}