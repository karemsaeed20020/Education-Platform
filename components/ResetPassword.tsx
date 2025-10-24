/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, ArrowRight, BookOpen } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { resetPasswordAfterOTP } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ResetPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('resetPasswordEmail');
    const storedOtp = localStorage.getItem('resetPasswordOTP');

    if (storedEmail && storedOtp) {
      setEmail(storedEmail);
      setOtp(storedOtp);
      console.log('Retrieved reset data:', { email: storedEmail, otp: storedOtp.substring(0, 3) + '***' });
    } else {
      toast.error('انتهت جلسة العمل، يرجى المحاولة مرة أخرى');
      router.push('/forgot-password');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('كلمة المرور وتأكيد كلمة المرور غير متطابقين');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون至少 6 أحرف');
      return;
    }

    if (!email || !otp) {
      toast.error('بيانات غير مكتملة، يرجى المحاولة مرة أخرى');
      router.push('/forgot-password');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending reset password request:', { 
        email, 
        otp: otp.substring(0, 3) + '***',
        passwordLength: formData.newPassword.length 
      });

      const result = await dispatch(resetPasswordAfterOTP({
        email,
        otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })).unwrap();
      
      console.log('Reset password successful:', result);
      
      localStorage.removeItem('resetPasswordOTP');
      localStorage.removeItem('resetPasswordEmail');
      
      toast.success('تم إعادة تعيين كلمة المرور بنجاح!');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Password reset failed:', error);
      
      if (error.includes('رمز التحقق غير صحيح')) {
        toast.error('رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى');
        router.push('/forgot-password');
      } else if (error.includes('منتهي الصلاحية')) {
        toast.error('رمز التحقق منتهي الصلاحية، يرجى طلب رمز جديد');
        router.push('/forgot-password');
      } else {
        toast.error(error || 'فشل في إعادة تعيين كلمة المرور');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBack = () => {
    router.push('/forgot-password');
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-6xl flex items-center justify-between gap-12">
        {/* Right Side - Branding */}
        <div className="flex-1 hidden lg:block space-y-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 text-right">
                منصة تعلم العربية
              </h1>
              <p className="text-gray-600 text-lg text-right">للمعلمين والطلاب</p>
            </div>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-6 text-right">
            <h2 className="text-5xl font-bold text-gray-800 leading-tight">
              بداية جديدة
              <br />
              <span className="text-blue-600">
                بكلمة مرور آمنة
              </span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              اختر كلمة مرور قوية لحسابك لحماية بياناتك وتعزيز الأمان
            </p>
            <div className="space-y-3 text-right">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">كلمة مرور قوية تحتوي على 6 أحرف على الأقل</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">مزيج من الأحرف والأرقام والرموز</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">تأكيد كلمة المرور للتأكد من صحتها</span>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side - Form */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">تعيين كلمة مرور جديدة</h1>
              <p className="text-gray-600">
                اختر كلمة مرور قوية لحسابك
              </p>
              {email && (
                <p className="text-sm text-blue-600 mt-2 bg-blue-50 px-3 py-1 rounded-full inline-block">
                  {email}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block text-right">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full h-12 px-4 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-right"
                    placeholder="كلمة المرور الجديدة"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 text-right">يجب أن تكون كلمة المرور 6 أحرف على الأقل</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block text-right">
                  تأكيد كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-12 px-4 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-right"
                    placeholder="تأكيد كلمة المرور الجديدة"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.newPassword || !formData.confirmPassword}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group mt-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التعيين...
                  </>
                ) : (
                  <>
                    تعيين كلمة المرور
                    <ArrowRight className="w-5 h-5 transform rotate-180" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 font-medium text-sm">أو</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              onClick={handleBack}
              className="w-full h-12 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              العودة للخلف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;