/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { updateProfile, getProfile, resetPassword } from '@/redux/slices/authSlice';
import { User, Shield, Eye, EyeOff, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// ----------------- ZOD SCHEMAS -----------------
const profileSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون على الأقل 3 أحرف'),
  phone: z.string().min(10, 'رقم الهاتف غير صالح'),
  bio: z.string().max(500, 'السيرة الذاتية يجب ألا تتجاوز 500 حرف'),
  avatar: z.any().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'كلمة المرور الحالية يجب أن تكون على الأقل 6 أحرف'),
  newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون على الأقل 6 أحرف'),
  confirmPassword: z.string().min(6, 'يجب تأكيد كلمة المرور الجديدة'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  role: string;
  createdAt: string;
}

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  // ----------------- REACT HOOK FORM -----------------
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPass,
    handleSubmit: handlePasswordSubmitForm,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const avatarFile = watch('avatar');

  // ----------------- Avatar Preview -----------------
  useEffect(() => {
    if (avatarFile?.[0]) {
      const file = avatarFile[0];
      const reader = new FileReader();
      reader.onloadend = () => setPreviewAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [avatarFile]);

  // ----------------- FETCH PROFILE -----------------
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        await dispatch(getProfile()).unwrap();
        // Use type assertion since we know currentUser exists here
        setProfile(currentUser as UserProfile);
        setValue('username', currentUser.username || '');
        setValue('phone', currentUser.phone || '');
        setValue('bio', currentUser.bio || '');
      } catch (err) {
        toast.error('فشل في تحميل الملف الشخصي');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, dispatch, router, setValue]);

  // ----------------- PROFILE SUBMIT -----------------
  const onSubmitProfile = async (formData: ProfileFormData) => {
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('username', formData.username);
      payload.append('phone', formData.phone);
      payload.append('bio', formData.bio);
      if (formData.avatar?.[0]) {
        payload.append('avatar', formData.avatar[0]);
      }

      await dispatch(updateProfile(payload)).unwrap();
      await dispatch(getProfile()).unwrap(); // refresh navbar & sidebar
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (err: any) {
      toast.error('فشل في تحديث الملف الشخصي');
    } finally {
      setSaving(false);
    }
  };

  // ----------------- PASSWORD SUBMIT -----------------
  const onSubmitPassword = async (formData: PasswordFormData) => {
    setSaving(true);
    try {
      // Safe check for email instead of using non-null assertion
      if (!currentUser?.email) {
        toast.error('البريد الإلكتروني غير متوفر');
        return;
      }

      await dispatch(resetPassword({
        email: currentUser.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })).unwrap();
      
      toast.success('تم تغيير كلمة المرور بنجاح');
      resetPasswordForm();
    } catch (err: any) {
      toast.error('فشل في تغيير كلمة المرور');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري تحميل الملف الشخصي...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-red-600">فشل في تحميل الملف الشخصي</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">الملف الشخصي والإعدادات</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <Card className="lg:col-span-1">
            <CardContent className="space-y-2">
              <button
                className={`w-full flex items-center gap-2 p-2 rounded ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="w-5 h-5" /> الملف الشخصي
              </button>
              <button
                className={`w-full flex items-center gap-2 p-2 rounded ${activeTab === 'password' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('password')}
              >
                <Shield className="w-5 h-5" /> كلمة المرور
              </button>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الشخصية</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={previewAvatar || profile.avatar || '/default-avatar.png'}
                          alt="avatar"
                          className="w-24 h-24 rounded-full border object-cover"
                        />
                        <label className="absolute bottom-0 right-0 bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                          <Camera className="w-4 h-4 text-white" />
                          <input 
                            type="file" 
                            {...register('avatar')} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <Label className="mb-1">اسم المستخدم</Label>
                      <Input {...register('username')} />
                      {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>}
                    </div>

                    <div className="flex flex-col">
                      <Label className="mb-1">رقم الهاتف</Label>
                      <Input {...register('phone')} />
                      {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
                    </div>

                    <div className="flex flex-col">
                      <Label className="mb-1">السيرة الذاتية</Label>
                      <Textarea {...register('bio')} rows={4} />
                      {errors.bio && <p className="text-red-600 text-sm mt-1">{errors.bio.message}</p>}
                    </div>

                    <Button type="submit" disabled={saving}>
                      {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'password' && (
              <Card>
                <CardHeader>
                  <CardTitle>تغيير كلمة المرور</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmitForm(onSubmitPassword)} className="space-y-5">
                    <div className="flex flex-col relative">
                      <Label className="mb-1">كلمة المرور الحالية</Label>
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        {...registerPass('currentPassword')} 
                      />
                      <span
                        className="absolute left-2 top-9 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                      </span>
                      {passwordErrors.currentPassword && (
                        <p className="text-red-600 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="flex flex-col relative">
                      <Label className="mb-1">كلمة المرور الجديدة</Label>
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        {...registerPass('newPassword')} 
                      />
                      <span
                        className="absolute left-2 top-9 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                      </span>
                      {passwordErrors.newPassword && (
                        <p className="text-red-600 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="flex flex-col relative">
                      <Label className="mb-1">تأكيد كلمة المرور</Label>
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        {...registerPass('confirmPassword')} 
                      />
                      <span
                        className="absolute left-2 top-9 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                      </span>
                      {passwordErrors.confirmPassword && (
                        <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={saving}>
                      {saving ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;