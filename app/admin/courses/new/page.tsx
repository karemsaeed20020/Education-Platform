/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/courses/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Upload, Video, BookOpen, X, Clock, Loader2 } from 'lucide-react';
import { VideoSelectionModal } from '@/components/VideoSelectionModal';
import { toast } from 'react-hot-toast';
import { api } from '@/redux/slices/authSlice';

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  videos: CourseVideo[];
}

interface CourseVideo {
  id: string;
  title: string;
  videoId: string;
  duration: number;
  order: number;
  isPreview: boolean;
}

interface ApiVideo {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  grade: string;
  chapter: string;
}

// 🔹 دوال API لإنشاء الكورسات باستخدام axios
const coursesApi = {
  // إنشاء كورس جديد
  createCourse: async (formData: FormData) => {
    const response = await api.post('/api/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [outcomeInput, setOutcomeInput] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedChapterForVideos, setSelectedChapterForVideos] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    discountPrice: '',
    grade: '',
    subject: 'اللغة العربية',
    level: 'مبتدئ',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5MB');
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const addRequirement = () => {
    if (requirementInput.trim() && !requirements.includes(requirementInput.trim())) {
      setRequirements(prev => [...prev, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (reqToRemove: string) => {
    setRequirements(prev => prev.filter(req => req !== reqToRemove));
  };

  const addLearningOutcome = () => {
    if (outcomeInput.trim() && !learningOutcomes.includes(outcomeInput.trim())) {
      setLearningOutcomes(prev => [...prev, outcomeInput.trim()]);
      setOutcomeInput('');
    }
  };

  const removeLearningOutcome = (outcomeToRemove: string) => {
    setLearningOutcomes(prev => prev.filter(outcome => outcome !== outcomeToRemove));
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: `الفصل ${chapters.length + 1}`,
      description: '',
      order: chapters.length + 1,
      videos: []
    };
    setChapters(prev => [...prev, newChapter]);
  };

  const updateChapter = (chapterId: string, field: string, value: string) => {
    setChapters(prev => prev.map(chapter => 
      chapter.id === chapterId ? { ...chapter, [field]: value } : chapter
    ));
  };

  const removeChapter = (chapterId: string) => {
    setChapters(prev => prev.filter(chapter => chapter.id !== chapterId));
  };

  const openVideoModal = (chapterId: string) => {
    setSelectedChapterForVideos(chapterId);
    setShowVideoModal(true);
  };

  const handleVideoSelect = (video: ApiVideo) => {
    if (!selectedChapterForVideos) return;

    const newCourseVideo: CourseVideo = {
      id: Date.now().toString(),
      title: video.title,
      videoId: video._id,
      duration: video.duration,
      order: chapters.find(c => c.id === selectedChapterForVideos)?.videos.length || 0,
      isPreview: false
    };

    setChapters(prev => prev.map(chapter => 
      chapter.id === selectedChapterForVideos 
        ? { ...chapter, videos: [...chapter.videos, newCourseVideo] }
        : chapter
    ));
  };

  const removeVideoFromChapter = (chapterId: string, videoId: string) => {
    setChapters(prev => prev.map(chapter => 
      chapter.id === chapterId 
        ? { ...chapter, videos: chapter.videos.filter(v => v.id !== videoId) }
        : chapter
    ));
  };

  const getSelectedVideoIds = () => {
    return chapters.flatMap(chapter => chapter.videos.map(video => video.videoId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.title || !formData.shortDescription || !formData.description || !formData.price || !formData.grade) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      setLoading(false);
      return;
    }

    if (!thumbnail) {
      toast.error('يرجى اختيار صورة للكورس');
      setLoading(false);
      return;
    }

    if (chapters.length === 0) {
      toast.error('يرجى إضافة فصل واحد على الأقل');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Append basic form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append arrays
      formDataToSend.append('tags', JSON.stringify(tags));
      formDataToSend.append('requirements', JSON.stringify(requirements));
      formDataToSend.append('learningOutcomes', JSON.stringify(learningOutcomes));
      formDataToSend.append('chapters', JSON.stringify(
        chapters.map(chapter => ({
          title: chapter.title,
          description: chapter.description,
          order: chapter.order,
          videos: chapter.videos.map(video => ({
            video: video.videoId,
            title: video.title,
            duration: video.duration,
            order: video.order,
            isPreview: video.isPreview
          }))
        }))
      ));

      // Append thumbnail
      formDataToSend.append('thumbnail', thumbnail);

      // ✅ استخدام axios API بدلاً من fetch
      const result = await coursesApi.createCourse(formDataToSend);

      if (result.status === 'success') {
        toast.success('تم إنشاء الكورس بنجاح!');
        router.push('/admin/courses');
      } else {
        throw new Error(result.message || 'حدث خطأ في إنشاء الكورس');
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ في إنشاء الكورس';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">إنشاء كورس جديد</h1>
        <p className="text-gray-600 mt-2">أضف كورس جديد لطلابك</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات أساسية</CardTitle>
                <CardDescription>المعلومات الأساسية عن الكورس</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الكورس *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="أدخل عنوان الكورس"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">وصف مختصر *</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="وصف مختصر يظهر في بطاقة الكورس"
                    maxLength={200}
                    required
                  />
                  <p className="text-sm text-gray-500">{formData.shortDescription.length}/200</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف مفصل *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="وصف مفصل عن الكورس ومحتواه"
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">السعر (ر.س) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">سعر الخصم (ر.س)</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      value={formData.discountPrice}
                      onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">الصف *</Label>
                    <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                        <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">المادة *</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المادة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="اللغة العربية">اللغة العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">المستوى *</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستوى" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                        <SelectItem value="متوسط">متوسط</SelectItem>
                        <SelectItem value="متقدم">متقدم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags Card */}
            <Card>
              <CardHeader>
                <CardTitle>الكلمات المفتاحية</CardTitle>
                <CardDescription>أضف كلمات مفتاحية تساعد في البحث</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="أضف كلمة مفتاحية"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Learning Outcomes */}
            <Card>
              <CardHeader>
                <CardTitle>متطلبات ومخرجات التعلم</CardTitle>
                <CardDescription>حدد متطلبات الكورس وما سيتعلمه الطالب</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>المتطلبات الأساسية</Label>
                  <div className="flex gap-2">
                    <Input
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      placeholder="أضف متطلب أساسي"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement();
                        }
                      }}
                    />
                    <Button type="button" onClick={addRequirement}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {requirements.map((req, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{req}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement(req)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>مخرجات التعلم</Label>
                  <div className="flex gap-2">
                    <Input
                      value={outcomeInput}
                      onChange={(e) => setOutcomeInput(e.target.value)}
                      placeholder="أضف مخرج تعلم"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addLearningOutcome();
                        }
                      }}
                    />
                    <Button type="button" onClick={addLearningOutcome}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{outcome}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLearningOutcome(outcome)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chapters & Videos Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>الفصول والدروس</CardTitle>
                    <CardDescription>نظم الفصول والدروس الخاصة بالكورس</CardDescription>
                  </div>
                  <Button type="button" onClick={addChapter}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة فصل
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {chapters.map((chapter, chapterIndex) => (
                      <Card key={chapter.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">الفصل {chapterIndex + 1}</CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChapter(chapter.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>عنوان الفصل</Label>
                            <Input
                              value={chapter.title}
                              onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                              placeholder="عنوان الفصل"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>وصف الفصل</Label>
                            <Textarea
                              value={chapter.description}
                              onChange={(e) => updateChapter(chapter.id, 'description', e.target.value)}
                              placeholder="وصف مختصر للفصل"
                            />
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>دروس الفصل</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openVideoModal(chapter.id)}
                              >
                                <Video className="w-4 h-4 ml-2" />
                                إضافة فيديو
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {chapter.videos.map((video, videoIndex) => (
                                <div
                                  key={video.id}
                                  className="flex items-center justify-between p-3 border rounded"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <Video className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm truncate">
                                          {video.title}
                                        </span>
                                        {video.isPreview && (
                                          <Badge variant="secondary" className="text-xs">معاينة</Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{Math.round(video.duration / 60)} دقيقة</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVideoFromChapter(chapter.id, video.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>

                            {chapter.videos.length === 0 && (
                              <div className="text-center py-4 border-2 border-dashed rounded-lg">
                                <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">لا توجد فيديوهات مضافة</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {chapters.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد فصول مضافة</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2"
                          onClick={addChapter}
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          إضافة أول فصل
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail Upload */}
            <Card>
              <CardHeader>
                <CardTitle>صورة الكورس</CardTitle>
                <CardDescription>الصورة الرئيسية للكورس</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 left-2"
                        onClick={() => {
                          setThumbnail(null);
                          setThumbnailPreview('');
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="thumbnail"
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">انقر لرفع صورة</p>
                      <p className="text-sm text-gray-500">JPG, PNG, Max 5MB</p>
                    </label>
                  )}
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>الإجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    'إنشاء الكورس'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  إلغاء
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>معاينة سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>الفصول: {chapters.length}</p>
                  <p>الدروس: {chapters.reduce((total, chapter) => total + chapter.videos.length, 0)}</p>
                  <p>الكلمات المفتاحية: {tags.length}</p>
                  <p>المتطلبات: {requirements.length}</p>
                  <p>مخرجات التعلم: {learningOutcomes.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Video Selection Modal */}
      <VideoSelectionModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onSelect={handleVideoSelect}
        selectedVideos={getSelectedVideoIds()}
      />
    </div>
  );
}