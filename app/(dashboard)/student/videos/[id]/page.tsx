'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, Share2, ArrowLeft, Play, Download, ExternalLink, Clock, User, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

export default function WatchVideoPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  const fetchVideo = async () => {
    try {
      console.log('🎬 Fetching video details for ID:', params.id);
      const response = await fetch(`http://localhost:5000/api/videos/${params.id}`, {
        credentials: 'include'
      });
      
      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Video data received:', data);
        
        if (data.status === 'success') {
          setVideo(data.data.video);
          
          // Increment view count
          await incrementViews(data.data.video._id);
        }
      } else {
        console.error('❌ Video not found');
        toast.error('الفيديو غير موجود');
        router.push('/student/videos');
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      toast.error('فشل في تحميل الفيديو');
      router.push('/student/videos');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (videoId: string) => {
    try {
      await fetch(`http://localhost:5000/api/videos/${videoId}/view`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const likeVideo = async () => {
    if (!video || isLiking) return;

    try {
      setIsLiking(true);
      const response = await fetch(`http://localhost:5000/api/videos/${video._id}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update like status
        setVideo(prev => prev ? {
          ...prev,
          likes: data.data.likes || []
        } : null);
        
        toast.success(data.message || 'تم تحديث الإعجاب');
      }
    } catch (error) {
      console.error('Error liking video:', error);
      toast.error('فشل في تحديث الإعجاب');
    } finally {
      setIsLiking(false);
    }
  };

  const shareVideo = async () => {
    if (!video) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ رابط الفيديو');
    }
  };

  // ✅ Enhanced download function for both Mega.nz and Cloudinary
  const downloadVideo = async () => {
    if (!video) return;

    try {
      setIsDownloading(true);
      
      if (video.storageType === 'mega') {
        // For Mega.nz, open in new tab with download prompt
        const newWindow = window.open(video.videoUrl, '_blank');
        if (!newWindow) {
          toast.error('تم منع النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع');
        } else {
          toast.success('جاري فتح رابط التحميل من Mega.nz');
        }
      } else {
        // For Cloudinary, create download link
        const link = document.createElement('a');
        link.href = video.videoUrl;
        link.download = `${video.title}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('جاري تحميل الفيديو...');
      }
      
      // Track download in backend
      await trackDownload(video._id);
      
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error('فشل في تحميل الفيديو');
    } finally {
      setIsDownloading(false);
    }
  };

  const trackDownload = async (videoId: string) => {
    try {
      await fetch(`http://localhost:5000/api/videos/${videoId}/download`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الفيديو...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">الفيديو غير موجود</h1>
        <Button onClick={() => router.push('/student/videos')} className="mt-4">
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة للفيديوهات
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/student/videos')}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة للفيديوهات
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مشاهدة الفيديو</h1>
          <p className="text-gray-600">مادة اللغة العربية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              {video.storageType === 'mega' ? (
                // ✅ Mega.nz videos - Enhanced download interface
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8 text-center">
                  <div className="bg-white rounded-full p-6 shadow-lg mb-6">
                    <ExternalLink className="h-16 w-16 text-blue-500" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {video.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-2 max-w-md">
                    هذا الفيديو مخزن على Mega.nz. يمكنك مشاهدته أو تحميله مباشرة.
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(video.duration || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {formatFileSize(video.fileSize || 0)}
                    </span>
                  </div>

                  <div className="flex gap-4 flex-wrap justify-center">
                    <Button 
                      onClick={() => window.open(video.videoUrl, '_blank')}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 px-6"
                    >
                      <ExternalLink className="h-5 w-5 ml-2" />
                      فتح الفيديو على Mega.nz
                    </Button>
                    
                    <Button 
                      onClick={downloadVideo}
                      disabled={isDownloading}
                      variant="outline"
                      size="lg"
                      className="px-6"
                    >
                      <Download className={`h-5 w-5 ml-2 ${isDownloading ? 'animate-bounce' : ''}`} />
                      {isDownloading ? 'جاري التحميل...' : 'تحميل الفيديو'}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-4">
                    سيتم فتح الفيديو في نافذة جديدة. قد تحتاج إلى السماح بالنوافذ المنبثقة.
                  </p>
                </div>
              ) : (
                // ✅ Cloudinary videos - show video player
                <div className="relative">
                  <video
                    controls
                    autoPlay
                    className="w-full aspect-video bg-black rounded-lg"
                    poster={video.thumbnailUrl || undefined}
                    onError={() => {
                      toast.error('فشل في تحميل الفيديو');
                    }}
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    <source src={video.videoUrl} type="video/webm" />
                    <source src={video.videoUrl} type="video/ogg" />
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                  
                  {/* Download button for Cloudinary */}
                  <div className="absolute top-4 left-4">
                    <Button
                      onClick={downloadVideo}
                      disabled={isDownloading}
                      variant="secondary"
                      size="sm"
                      className="bg-black/70 text-white hover:bg-black/90"
                    >
                      <Download className={`h-4 w-4 ml-2 ${isDownloading ? 'animate-bounce' : ''}`} />
                      تحميل
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{video.title}</CardTitle>
                  <CardDescription className="text-base">
                    {video.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={likeVideo}
                    disabled={isLiking}
                    className={`flex items-center gap-2 ${
                      video.likes.length > 0 ? 'text-red-500 border-red-200' : ''
                    }`}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        video.likes.length > 0 ? 'fill-red-500' : ''
                      } ${isLiking ? 'animate-pulse' : ''}`} 
                    />
                    <span>{video.likes.length}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareVideo}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500">الصف:</span>
                  <Badge variant="secondary">
                    {video.grade}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500">الفصل:</span>
                  <Badge variant="secondary">
                    {video.chapter}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500">المدة:</span>
                  <span>{formatDuration(video.duration || 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500">الحجم:</span>
                  <span>{formatFileSize(video.fileSize || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Video Stats and Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                إحصائيات الفيديو
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">المشاهدات</span>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="font-bold text-blue-600 text-lg">{video.views}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700">الإعجابات</span>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-bold text-red-600 text-lg">{video.likes.length}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">التخزين</span>
                <Badge variant={video.storageType === 'mega' ? 'default' : 'secondary'}>
                  {video.storageType === 'mega' ? 'Mega.nz' : 'Cloudinary'}
                </Badge>
              </div>
              
              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    تم الرفع في
                  </span>
                  <span className="font-medium">
                    {new Date(video.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    المرسل
                  </span>
                  <span className="font-medium">{video.uploader.username}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الإجراءات السريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/student/videos')}
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للقائمة
              </Button>
              
              <Button 
                variant="default"
                className="w-full justify-start bg-green-600 hover:bg-green-700"
                onClick={downloadVideo}
                disabled={isDownloading}
              >
                <Download className={`h-4 w-4 ml-2 ${isDownloading ? 'animate-bounce' : ''}`} />
                {isDownloading ? 'جاري التحميل...' : 'تحميل الفيديو'}
              </Button>
              
              {video.storageType === 'mega' && (
                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(video.videoUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 ml-2" />
                  فتح على Mega.nz
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}