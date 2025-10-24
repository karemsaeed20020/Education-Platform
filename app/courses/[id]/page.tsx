// app/courses/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, Users, BookOpen, ShoppingCart, Star, CheckCircle, Loader2, ArrowLeft, Lock, FileText, Award, Edit, Trash2, MessageCircle, Share, Heart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Video {
  _id: string;
  title: string;
  description: string;
  duration: number;
  isPreview: boolean;
  order: number;
}

interface Chapter {
  _id: string;
  title: string;
  description: string;
  order: number;
  videos: Video[];
}

interface Instructor {
  _id: string;
  username: string;
  profilePicture?: string;
  bio?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  instructor: Instructor;
  subject: string;
  grade: string;
  chapters: Chapter[];
  totalDuration: number;
  totalVideos: number;
  level: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  rating: {
    average: number;
    count: number;
  };
  studentsEnrolled: string[];
  requirements: string[];
  learningOutcomes: string[];
  createdAt: string;
}

interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    isSubmitting: false
  });
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  useEffect(() => {
    if (course && activeTab === 'reviews') {
      fetchReviews();
      fetchUserReview();
    }
  }, [course, activeTab]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCourse(data.data.course);
        } else {
          toast.error('فشل في تحميل الكورس');
        }
      } else {
        toast.error('فشل في تحميل الكورس');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('حدث خطأ في تحميل الكورس');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/course/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setReviews(data.data.reviews);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/my-review/${params.id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserReview(data.data.review);
        if (data.data.review) {
          setReviewForm({
            rating: data.data.review.rating,
            comment: data.data.review.comment,
            isSubmitting: false
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const addToCart = async () => {
    if (!course) return;

    setAddingToCart(true);
    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ courseId: course._id }),
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
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewForm.rating || !reviewForm.comment.trim()) {
      toast.error('الرجاء إدخال التقييم والتعليق');
      return;
    }

    setReviewForm(prev => ({ ...prev, isSubmitting: true }));

    try {
      const url = userReview 
        ? `http://localhost:5000/api/reviews/${userReview._id}`
        : 'http://localhost:5000/api/reviews';
      
      const method = userReview ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: params.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(userReview ? 'تم تحديث التقييم بنجاح' : 'تم إضافة التقييم بنجاح');
        setUserReview(data.data.review);
        fetchReviews();
        fetchCourse();
      } else {
        const error = await response.json();
        toast.error(error.message || 'فشل في إضافة التقييم');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('حدث خطأ في إضافة التقييم');
    } finally {
      setReviewForm(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    if (!confirm('هل أنت متأكد من حذف التقييم؟')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${userReview._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('تم حذف التقييم بنجاح');
        setUserReview(null);
        setReviewForm({ rating: 0, comment: '', isSubmitting: false });
        fetchReviews();
        fetchCourse();
      } else {
        toast.error('فشل في حذف التقييم');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('حدث خطأ في حذف التقييم');
    }
  };

  const handleLike = async () => {
    if (!course) return;

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${course._id}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        toast.success(isLiked ? 'تم إزالة الإعجاب' : 'تم إضافة الإعجاب');
      }
    } catch (error) {
      console.error('Error liking course:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: course?.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ رابط الكورس');
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

  const formatVideoDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            }`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <BookOpen className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">الكورس غير موجود</h1>
            <p className="text-gray-600 mb-6">عذراً، الكورس الذي تبحث عنه غير موجود أو تم إزالته.</p>
            <Link href="/courses">
              <Button>
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة إلى الكورسات
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const price = course.discountPrice || course.price;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                العودة للكورسات
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-sm">
              {course.grade}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {course.subject || 'اللغة العربية'}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {course.level}
            </Badge>
            {course.isFeatured && (
              <Badge className="bg-yellow-500 text-white text-sm">
                <Star className="h-3 w-3 ml-1 fill-current" />
                مميز
              </Badge>
            )}
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">{course.shortDescription}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLike}>
                <Heart className={`h-4 w-4 ml-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                أعجبني
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 ml-2" />
                مشاركة
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span>{course.rating.average.toFixed(1)}</span>
              <span>({course.rating.count} تقييم)</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.studentsEnrolled.length} طالب</span>
            </div>
            <div className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              <span>{course.totalVideos} درس</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.totalDuration)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Preview */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center relative">
                  <div className="text-white text-center p-8">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">كورس تعليمي متكامل</h3>
                    <p className="text-blue-100">اشترك الآن للوصول إلى جميع محتويات هذا الكورس</p>
                  </div>
                  
                  <Badge className="absolute top-4 left-4 bg-white/20 text-white border-none">
                    معاينة
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="curriculum">المحتوى</TabsTrigger>
                <TabsTrigger value="instructor">المدرس</TabsTrigger>
                <TabsTrigger value="reviews">التقييمات</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">وصف الكورس</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </div>

                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      ماذا ستتعلم
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.requirements && course.requirements.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      المتطلبات الأساسية
                    </h3>
                    <ul className="space-y-2">
                      {course.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-700">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {course.tags && course.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">الكلمات المفتاحية</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {course.chapters.map((chapter, chapterIndex) => (
                      <Card key={chapter._id}>
                        <CardHeader className="bg-gray-50">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {chapterIndex + 1}
                              </div>
                              <span>{chapter.title}</span>
                            </div>
                            <Badge variant="outline">
                              {chapter.videos.length} دروس
                            </Badge>
                          </CardTitle>
                          {chapter.description && (
                            <CardDescription>{chapter.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {chapter.videos.map((video, videoIndex) => (
                              <div
                                key={video._id}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    video.isPreview 
                                      ? 'bg-green-100 text-green-600' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    <Play className="w-3 h-3" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">
                                        {video.title}
                                      </span>
                                      {video.isPreview && (
                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                          معاينة مجانية
                                        </Badge>
                                      )}
                                    </div>
                                    {video.description && (
                                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                        {video.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>{formatVideoDuration(video.duration)}</span>
                                  {!video.isPreview && (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="instructor" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={course.instructor.profilePicture} />
                        <AvatarFallback className="text-lg">
                          {course.instructor.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-2">
                          {course.instructor.username}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {course.instructor.bio || 'مدرس محترف في اللغة العربية مع سنوات من الخبرة في تدريس المناهج التعليمية.'}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.studentsEnrolled.length} طالب</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>مدرس معتمد</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{course.rating.average.toFixed(1)} تقييم</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Reviews List */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Review Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          {userReview ? 'تعديل تقييمك' : 'أضف تقييمك'}
                        </CardTitle>
                        <CardDescription>
                          {userReview 
                            ? 'يمكنك تعديل تقييمك للكورس' 
                            : 'شارك تجربتك مع الآخرين وساعدهم في اتخاذ القرار'
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">التقييم</label>
                            {renderStars(reviewForm.rating, true, (rating) => 
                              setReviewForm(prev => ({ ...prev, rating }))
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">التعليق</label>
                            <Textarea
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                              placeholder="شارك تجربتك مع هذا الكورس..."
                              rows={4}
                              required
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              type="submit" 
                              disabled={reviewForm.isSubmitting}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {reviewForm.isSubmitting ? (
                                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                              ) : (
                                <MessageCircle className="h-4 w-4 ml-2" />
                              )}
                              {userReview ? 'تحديث التقييم' : 'إضافة التقييم'}
                            </Button>
                            
                            {userReview && (
                              <Button 
                                type="button"
                                variant="outline"
                                onClick={handleDeleteReview}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف
                              </Button>
                            )}
                          </div>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Reviews List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>تقييمات الطلاب ({reviews.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {reviewsLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          </div>
                        ) : reviews.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p>لا توجد تقييمات حتى الآن</p>
                            <p className="text-sm">كن أول من يقيم هذا الكورس</p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[600px]">
                            <div className="space-y-6">
                              {reviews.map((review) => (
                                <div key={review._id} className="border-b pb-6 last:border-0">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="w-10 h-10">
                                        <AvatarImage src={review.user.profilePicture} />
                                        <AvatarFallback>
                                          {review.user.username.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h4 className="font-semibold">{review.user.username}</h4>
                                        <p className="text-sm text-gray-500">
                                          {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                                        </p>
                                      </div>
                                    </div>
                                    {review.isVerified && (
                                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        ✓ مسجل في الكورس
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="mb-3">
                                    {renderStars(review.rating)}
                                  </div>
                                  
                                  <p className="text-gray-700 leading-relaxed">
                                    {review.comment}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Rating Summary */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>ملخص التقييمات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-6">
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            {course.rating.average.toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {renderStars(course.rating.average)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ({course.rating.count} تقييم)
                          </div>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviews.filter(r => r.rating === star).length;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            
                            return (
                              <div key={star} className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 w-4">{star}</span>
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <Progress value={percentage} className="flex-1" />
                                <span className="text-sm text-gray-500 w-8 text-left">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {/* Course Image */}
                <div className="mb-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Pricing */}
                <div className="flex items-center gap-3 mb-4">
                  {hasDiscount && (
                    <span className="text-2xl font-bold text-gray-900 line-through">
                      {course.price} ر.س
                    </span>
                  )}
                  <span className={`text-3xl font-bold ${hasDiscount ? 'text-green-600' : 'text-gray-900'}`}>
                    {price} ر.س
                  </span>
                  {hasDiscount && (
                    <Badge variant="destructive" className="text-sm">
                      وفر {course.price - price} ر.س
                    </Badge>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button 
                  className="w-full mb-4" 
                  size="lg" 
                  onClick={addToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 ml-2" />
                  )}
                  {addingToCart ? 'جاري الإضافة...' : 'أضف إلى السلة'}
                </Button>

                {/* Course Features */}
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">عدد الدروس:</span>
                    <span className="font-medium">{course.totalVideos} درس</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">المدة الإجمالية:</span>
                    <span className="font-medium">{formatDuration(course.totalDuration)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">المستوى:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">الطلاب المسجلين:</span>
                    <span className="font-medium">{course.studentsEnrolled.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">التقييم:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {course.rating.average.toFixed(1)} ({course.rating.count})
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Guarantee */}
                <div className="text-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 inline ml-1" />
                  ضمان استرداد الأموال خلال 30 يوم
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">دعم فني متكامل</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    فريق الدعم متاح للإجابة على استفساراتك
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    تواصل مع الدعم
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}