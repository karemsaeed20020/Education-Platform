/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Play, Edit, Trash2, Plus, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  fileSize: number;
  grade: string;
  chapter: string;
  views: number;
  likes: string[];
  createdAt: string;
  uploader: {
    _id: string;
    username: string;
  };
  storageType: string;
  fileName: string;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    grade: 'الكل',
    chapter: 'الكل'
  });

  // Fetch videos function using api
  const fetchVideos = async () => {
    try {
      setRefreshing(true);
      
      // Build query parameters
      const params: any = {};
      if (filters.grade && filters.grade !== 'الكل') {
        params.grade = filters.grade;
      }
      if (filters.chapter && filters.chapter !== 'الكل') {
        params.chapter = filters.chapter;
      }

      console.log('🔄 Fetching videos with params:', params);

      const response = await api.get('/api/videos', { params });
      
      console.log('📊 Response status:', response.status);
      console.log('✅ Videos data received:', response.data);
      
      if (response.data.status === 'success') {
        setVideos(response.data.data.videos || []);
        toast.success(`تم تحميل ${response.data.data.videos?.length || 0} فيديو`);
      } else {
        console.error('❌ API error:', response.data);
        toast.error(response.data.message || 'فشل في تحميل الفيديوهات');
      }
    } catch (error: any) {
      console.error('🚨 Network error:', error);
      
      if (error.response?.status === 401) {
        toast.error('غير مصرح. يرجى تسجيل الدخول');
        window.location.href = '/login';
      } else {
        const message = error.response?.data?.message || 'خطأ في الشبكة. تأكد من اتصال السيرفر';
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchVideos();
  }, []);

  // Refresh when filters change
  useEffect(() => {
    if (!loading) {
      fetchVideos();
    }
  }, [filters]);

  const deleteVideo = async (videoId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;

    try {
      const response = await api.delete(`/api/videos/${videoId}`);

      if (response.data.status === 'success') {
        toast.success('تم حذف الفيديو بنجاح');
        fetchVideos(); // Reload the list
      } else {
        toast.error(response.data.message || 'فشل في حذف الفيديو');
      }
    } catch (error: any) {
      console.error('Error deleting video:', error);
      const message = error.response?.data?.message || 'فشل في حذف الفيديو';
      toast.error(message);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الفيديوهات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الفيديوهات</h1>
          <p className="text-gray-600 mt-2">إدارة الفيديوهات التعليمية للغة العربية</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={fetchVideos}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Link href="/admin/videos/upload">
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              رفع فيديو جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">التصفية:</span>
            </div>
            <div className="w-48">
              <Select 
                value={filters.grade} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, grade: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="جميع الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع الصفوف</SelectItem>
                  <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                  <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select 
                value={filters.chapter} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, chapter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفصول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع الفصول</SelectItem>
                  <SelectItem value="النحو">النحو</SelectItem>
                  <SelectItem value="الصرف">الصرف</SelectItem>
                  <SelectItem value="الأدب">الأدب</SelectItem>
                  <SelectItem value="البلاغة">البلاغة</SelectItem>
                  <SelectItem value="النصوص">النصوص</SelectItem>
                  <SelectItem value="التعبير">التعبير</SelectItem>
                  <SelectItem value="الإملاء">الإملاء</SelectItem>
                  <SelectItem value="القواعد">القواعد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-500">
              {videos.length} فيديو
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فيديوهات</h3>
            <p className="text-gray-500 mb-4">لم يتم رفع أي فيديوهات حتى الآن</p>
            <Link href="/admin/videos/upload">
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                رفع أول فيديو
              </Button>
            </Link>
          </div>
        ) : (
          videos.map((video) => (
            <Card key={video._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-200">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
                    <div className="text-center">
                      <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <span className="text-xs text-gray-500">لا يوجد صورة مصغرة</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-blue-600 text-white">
                    {video.storageType === 'mega' ? 'Mega' : 'Cloud'}
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    {formatDuration(video.duration || 0)}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="mb-2">
                    {video.grade}
                  </Badge>
                  <div className="flex gap-1">
                    <Link href={`/admin/videos/edit/${video._id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteVideo(video._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                  {video.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
                  {video.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {video.views}
                    </span>
                    <span>❤️ {video.likes?.length || 0}</span>
                  </div>
                  <Badge variant="secondary">
                    {video.chapter}
                  </Badge>
                </div>

                <div className="mt-3 flex justify-between text-xs text-gray-400">
                  <span>{formatFileSize(video.fileSize || 0)}</span>
                  <span>{formatDate(video.createdAt)}</span>
                </div>

                {/* Uploader Info */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    تم الرفع بواسطة: <span className="font-medium">{video.uploader?.username || 'غير معروف'}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}