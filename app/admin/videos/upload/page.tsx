/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Video, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { api } from '@/redux/slices/authSlice';

interface FormData {
  title: string;
  description: string;
  grade: string;
  chapter: string;
  tags: string;
}

export default function UploadVideoPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    grade: '',
    chapter: '',
    tags: ''
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024 * 1024) {
        toast.error('حجم الفيديو يجب أن يكون أقل من 2GB');
        return;
      }
      
      if (!file.type.startsWith('video/')) {
        toast.error('يرجى اختيار ملف فيديو صحيح (MP4, MOV, AVI, etc.)');
        return;
      }
      
      setVideoFile(file);
      toast.success(`تم اختيار الملف: ${file.name}`);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error('يرجى اختيار ملف فيديو');
      return;
    }

    if (!formData.title || !formData.description || !formData.grade || !formData.chapter) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const fileSizeMB = videoFile.size / (1024 * 1024);
    
    console.log('🚀 Starting upload...', {
      fileSize: fileSizeMB.toFixed(2) + 'MB',
      title: formData.title,
      grade: formData.grade,
      chapter: formData.chapter
    });

    setUploading(true);
    setUploadProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      const submitData = new FormData();
      submitData.append('video', videoFile);
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('grade', formData.grade);
      submitData.append('chapter', formData.chapter);
      
      if (formData.tags) {
        submitData.append('tags', formData.tags.trim());
      }

      // Simulate progress for large files (fallback)
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 1500);

      console.log('📤 Sending request to /api/videos/upload-mega');

      const response = await api.post('/api/videos/upload-mega', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📊 Upload progress: ${percentCompleted}%`);
            setUploadProgress(percentCompleted);
          }
        },
        timeout: 600000, // 10 minutes timeout for large files
      });

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setUploadProgress(100);

      console.log('✅ Upload response:', response.data);

      // Check for success in different response formats
      const isSuccess = response.data.status === 'success' || 
                       response.data.success === true ||
                       response.status === 200 || 
                       response.status === 201;

      if (isSuccess) {
        const message = response.data.message || 'تم رفع الفيديو بنجاح';
        toast.success(message);
        
        console.log('✅ Video uploaded successfully, resetting form...');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          grade: '',
          chapter: '',
          tags: ''
        });
        setVideoFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('video-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Redirect to videos list after 2 seconds
        console.log('🔄 Redirecting to /admin/videos in 2 seconds...');
        setTimeout(() => {
          router.push('/admin/videos');
        }, 2000);
        
      } else {
        console.error('❌ Upload failed:', response.data);
        toast.error(response.data.message || 'فشل في رفع الفيديو');
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      
      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setUploadProgress(0);
      
      // Handle different error types
      if (error.code === 'ECONNABORTED') {
        toast.error('انتهت مهلة الرفع. الملف كبير جداً أو الاتصال بطيء');
      } else if (error.response?.status === 401) {
        toast.error('غير مصرح. يرجى تسجيل الدخول');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else if (error.response?.status === 413) {
        toast.error('حجم الملف كبير جداً. الحد الأقصى 2GB');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'بيانات غير صالحة');
      } else if (error.response?.status === 500) {
        toast.error('خطأ في السيرفر. حاول مرة أخرى');
      } else {
        const message = error.response?.data?.message || 
                       error.message || 
                       'فشل في رفع الفيديو. تأكد من اتصال السيرفر';
        toast.error(message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">رفع فيديو جديد</h1>
          <p className="text-gray-600 mt-2">رفع فيديو تعليمي لمادة اللغة العربية عبر Mega.nz</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              رفع فيديو جديد
            </CardTitle>
            <CardDescription>
              املأ المعلومات أدناه لرفع فيديو تعليمي جديد. سيتم الرفع إلى Mega.nz لدعم الملفات الكبيرة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ملف الفيديو */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملف الفيديو *
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  videoFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label htmlFor="video-file" className={`cursor-pointer block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {videoFile ? (
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    ) : (
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    )}
                    <p className="text-sm text-gray-600">
                      {videoFile ? videoFile.name : 'انقر لاختيار ملف فيديو'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4, MOV, AVI, MKV - الحد الأقصى 2GB
                    </p>
                    {videoFile && (
                      <p className="text-xs text-green-600 mt-1">
                        حجم الملف: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                  </label>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>جاري الرفع إلى Mega.nz...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      قد تستغرق العملية عدة دقائق للملفات الكبيرة... لا تغلق الصفحة
                    </p>
                  </div>
                )}
              </div>

              {/* العنوان */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الفيديو *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="أدخل عنوان الفيديو"
                  required
                  disabled={uploading}
                />
              </div>

              {/* الوصف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الفيديو *
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="أدخل وصفاً للفيديو"
                  rows={4}
                  required
                  disabled={uploading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* الصف */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصف *
                  </label>
                  <Select 
                    value={formData.grade} 
                    onValueChange={(value) => handleSelectChange('grade', value)}
                    disabled={uploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                      <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* الفصل */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفصل الدراسي *
                  </label>
                  <Select 
                    value={formData.chapter} 
                    onValueChange={(value) => handleSelectChange('chapter', value)}
                    disabled={uploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفصل" />
                    </SelectTrigger>
                    <SelectContent>
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
              </div>

              {/* الوسوم */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوسوم (اختياري)
                </label>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="أدخل الوسوم مفصولة بفاصلة"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">مثال: نحو, صرف, قواعد</p>
              </div>

              {/* معلومات الرفع */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">معلومات الرفع</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• سيتم الرفع إلى Mega.nz لدعم الملفات الكبيرة</li>
                      <li>• الحد الأقصى لحجم الملف: 2GB</li>
                      <li>• قد تستغرق عملية الرفع عدة دقائق</li>
                      <li>• لا تغلق الصفحة أثناء الرفع</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* زر الرفع */}
              <Button 
                type="submit" 
                disabled={uploading || !videoFile}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الرفع... ({uploadProgress}%)
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 ml-2" />
                    رفع الفيديو إلى Mega.nz
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}