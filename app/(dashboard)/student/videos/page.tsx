/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Play, Heart, Filter, Search, Download, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
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
  storageType?: string;
}

export default function StudentVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    grade: 'الكل',
    chapter: 'الكل'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVideos();
  }, [filters]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params: any = {};
      if (filters.grade && filters.grade !== 'الكل') params.grade = filters.grade;
      if (filters.chapter && filters.chapter !== 'الكل') params.chapter = filters.chapter;

      console.log('🔄 Fetching videos...');
      const response = await api.get('/api/videos', { params });
      
      console.log('✅ Videos fetched:', response.data.data.videos);
      if (response.data.status === 'success') {
        setVideos(response.data.data.videos);
      } else {
        console.error('❌ Failed to fetch videos:', response.data);
        toast.error('فشل في تحميل الفيديوهات');
      }
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      const message = error.response?.data?.message || 'فشل في تحميل الفيديوهات';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const likeVideo = async (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await api.post(`/api/videos/${videoId}/like`);

      if (response.data.status === 'success') {
        // Update like status locally
        setVideos(prev => prev.map(video => {
          if (video._id === videoId) {
            const hasLiked = video.likes.length > 0;
            return {
              ...video,
              likes: hasLiked ? [] : ['user-id']
            };
          }
          return video;
        }));
        
        if (response.data.data.liked) {
          toast.success('تم إضافة الإعجاب');
        } else {
          toast.success('تم إزالة الإعجاب');
        }
      }
    } catch (error: any) {
      console.error('Error liking video:', error);
      const message = error.response?.data?.message || 'فشل في تحديث الإعجاب';
      toast.error(message);
    }
  };

  // ✅ Handle video click - ALWAYS navigate to watch page for both Mega and Cloudinary
  const handleVideoClick = (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/student/videos/${videoId}`);
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

  // Filter videos based on search
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">الفيديوهات التعليمية</h1>
          <p className="text-gray-600 mt-2">مشاهدة فيديوهات اللغة العربية</p>
        </div>
        <Button onClick={fetchVideos} variant="outline">
          تحديث القائمة
        </Button>
      </div>

      {/* Filters and Search */}
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

            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في الفيديوهات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          عرض {filteredVideos.length} من أصل {videos.length} فيديو
        </p>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فيديوهات</h3>
            <p className="text-gray-500">
              {videos.length === 0 
                ? 'لم يتم رفع أي فيديوهات حتى الآن' 
                : 'لم يتم العثور على فيديوهات تطابق معايير البحث'
              }
            </p>
          </div>
        ) : (
          filteredVideos.map((video) => (
            <Card 
              key={video._id} 
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={(e) => handleVideoClick(video._id, e)}
            >
              {/* Thumbnail with Play Button */}
              <div className="relative aspect-video bg-gray-200 group">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // ✅ Default thumbnail for Mega.nz videos
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Play className="h-12 w-12 text-blue-400 mb-2" />
                    <p className="text-blue-600 text-sm font-medium">فيديو تعليمي</p>
                    {video.storageType === 'mega' && (
                      <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700">
                        Mega.nz
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="h-8 w-8 text-gray-800 fill-current" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    {formatDuration(video.duration || 0)}
                  </Badge>
                </div>

                {/* ✅ Storage Type Badge */}
                {video.storageType === 'mega' && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-blue-500 text-white border-blue-600">
                      Mega.nz
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="mb-2">
                    {video.grade}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                    onClick={(e) => likeVideo(video._id, e)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${video.likes.length > 0 ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {video.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {video.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {video.likes.length}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {video.chapter}
                  </Badge>
                </div>

                {/* ✅ File Info */}
                <div className="mt-2 text-xs text-gray-400 flex justify-between">
                  <span>{formatFileSize(video.fileSize)}</span>
                  <span>تم الرفع: {new Date(video.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>

                {/* ✅ Action Buttons */}
                <div className="mt-3 flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/student/videos/${video._id}`);
                    }}
                  >
                    <Play className="h-4 w-4 ml-2" />
                    مشاهدة
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // For Mega.nz, open download link in new tab
                      if (video.storageType === 'mega') {
                        window.open(video.videoUrl, '_blank');
                      } else {
                        // For Cloudinary, trigger download
                        const link = document.createElement('a');
                        link.href = video.videoUrl;
                        link.download = video.title + '.mp4';
                        link.click();
                      }
                    }}
                  >
                    <Download className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}