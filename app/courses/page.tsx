// app/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Clock, Users, Star, ShoppingCart, Search, Filter, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';

interface Course {
  _id: string;
  title: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  instructor: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  grade: string;
  level: string;
  totalDuration: number;
  totalVideos: number;
  studentsEnrolled: string[];
  rating: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  createdAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    grade: 'all',
    level: 'all',
    search: ''
  });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.grade && filters.grade !== 'all') queryParams.append('grade', filters.grade);
      if (filters.level && filters.level !== 'all') queryParams.append('level', filters.level);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`http://localhost:5000/api/courses?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Courses API Response:', data); // Debug log
        if (data.status === 'success') {
          setCourses(data.data.courses || []);
        } else {
          toast.error('فشل في تحميل الكورسات');
        }
      } else {
        toast.error('فشل في تحميل الكورسات');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('حدث خطأ في تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(courseId);
    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          toast.success('تم إضافة الكورس إلى السلة بنجاح');
        } else {
          toast.error(data.message || 'فشل في إضافة الكورس إلى السلة');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'فشل في إضافة الكورس إلى السلة');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ في إضافة الكورس إلى السلة');
    } finally {
      setAddingToCart(null);
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

  // Debug: Log courses data
  useEffect(() => {
    if (courses.length > 0) {
      console.log('Courses loaded:', courses);
    }
  }, [courses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="text-center mb-8 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Filters Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Courses Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8">
      <Navbar />
      <div className="container mx-auto px-4 mt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            دورات اللغة العربية
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعة واسعة من الدورات التعليمية المقدمة من أفضل المدرسين
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="ابحث عن دورة..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pr-10 border-gray-300 focus:border-blue-500"
                />
              </div>
              <Select value={filters.grade} onValueChange={(value) => setFilters({ ...filters, grade: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="جميع الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصفوف</SelectItem>
                  <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                  <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.level} onValueChange={(value) => setFilters({ ...filters, level: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="جميع المستويات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="متقدم">متقدم</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setFilters({ grade: 'all', level: 'all', search: '' })}
                className="flex items-center gap-2 border-gray-300 hover:border-blue-500"
              >
                <Filter className="h-4 w-4" />
                إعادة التعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        {courses.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              عرض <span className="font-semibold text-blue-600">{courses.length}</span> كورس
              {filters.search && (
                <span> لـ<span className="font-semibold">{filters.search}</span></span>
              )}
            </p>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                <BookOpen className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filters.search || filters.grade !== 'all' || filters.level !== 'all' 
                    ? 'لا توجد دورات مطابقة لبحثك' 
                    : 'لا توجد دورات متاحة حالياً'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {filters.search || filters.grade !== 'all' || filters.level !== 'all' 
                    ? 'جرب البحث باستخدام كلمات أخرى أو إعادة تعيين الفلاتر' 
                    : 'سيتم إضافة دورات جديدة قريباً'
                  }
                </p>
                {(filters.search || filters.grade !== 'all' || filters.level !== 'all') && (
                  <Button 
                    onClick={() => setFilters({ grade: 'all', level: 'all', search: '' })}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    عرض جميع الكورسات
                  </Button>
                )}
              </div>
            </div>
          ) : (
            courses.map((course) => (
              <Link key={course._id} href={`/courses/${course._id}`} className="block">
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer bg-white">
                  <CardHeader className="p-0 relative overflow-hidden">
                    <div className="relative">
                      <img
                        src={course.thumbnail || '/api/placeholder/400/240'}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=240&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-t-lg" />
                      
                      {/* Featured Badge */}
                      {course.isFeatured && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                          ⭐ مميز
                        </Badge>
                      )}
                      
                      {/* Info Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                        <Badge variant="secondary" className="bg-black/80 text-white backdrop-blur-sm">
                          {course.grade}
                        </Badge>
                        <Badge variant="secondary" className="bg-black/80 text-white backdrop-blur-sm">
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    {/* Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="font-semibold text-yellow-700">{course.rating?.average?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-500 text-xs">({course.rating?.count || 0})</span>
                        </div>
                      </div>
                    </div>

                    {/* Course Title */}
                    <CardTitle className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors min-h-[56px]">
                      {course.title}
                    </CardTitle>

                    {/* Short Description */}
                    <CardDescription className="line-clamp-2 mb-4 min-h-[40px] text-gray-600">
                      {course.shortDescription}
                    </CardDescription>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          <span>{course.totalVideos || 0} درس</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(course.totalDuration || 0)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{(course.studentsEnrolled?.length || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Instructor & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-gray-200">
                          <AvatarImage src={course.instructor?.profilePicture} />
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                            {course.instructor?.username?.charAt(0) || 'م'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600 font-medium">
                          {course.instructor?.username || 'مدرس'}
                        </span>
                      </div>
                      <div className="text-right">
                        {course.discountPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600">
                              {course.discountPrice} ر.س
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {course.price} ر.س
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            {course.price} ر.س
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                      onClick={(e) => addToCart(course._id, e)}
                      disabled={addingToCart === course._id}
                    >
                      {addingToCart === course._id ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري الإضافة...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 ml-2" />
                          أضف إلى السلة
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}