'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Check, RotateCcw, Loader, Shield, Clock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { verifyOTP } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Get email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('forgotPasswordEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      router.push('/forgot-password');
    }
  }, [router]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOTPChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else if (!value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('يرجى إدخال رمز التحقق الكامل المكون من 6 أرقام');
      setIsLoading(false);
      return;
    }

    try {
      await dispatch(verifyOTP({ email, otp: otpCode })).unwrap();
      
      // ✅ Store email + OTP for next step (temporary)
      localStorage.setItem('forgotPasswordEmail', email);
      localStorage.setItem('verifiedOTP', otpCode);

      toast.success('تم التحقق بنجاح! 🎉');
      setTimeout(() => {
        router.push('/reset-password'); // 👈 NEW route
      }, 1500);
    } catch (err) {
      setError('رمز التحقق غير صحيح أو منتهي الصلاحية');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setCountdown(60);
        toast.success('تم إعادة إرسال رمز التحقق!');
        setOtp(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'فشل إعادة إرسال الرمز');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إعادة الإرسال');
    }
  };

  const handleBack = () => {
    localStorage.removeItem('forgotPasswordEmail');
    router.push('/forgot-password');
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-emerald-600 mb-4">تم التحقق بنجاح!</h1>
            <p className="text-gray-600 mb-6 text-lg">تم التحقق من بريدك الإلكتروني بنجاح</p>
            <div className="animate-pulse">
              <Loader className="w-8 h-8 text-emerald-500 mx-auto animate-spin" />
              <p className="text-gray-500 mt-2">جاري التوجيه...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-r from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-20 w-24 h-24 bg-gradient-to-r from-cyan-300/20 to-emerald-300/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-l from-emerald-400/10 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-teal-400/10 to-transparent rounded-tr-full"></div>

          <div className="text-center mb-8 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">التحقق من الهوية</h1>
            <p className="text-gray-600 text-lg">
              أدخل رمز التحقق المرسل إلى <span className="font-semibold text-emerald-600">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 mb-8 relative z-10">
            <div className="space-y-6">
              <div className="flex justify-center space-x-3 space-x-reverse">
                {otp.map((digit, index) => (
                  <div key={index} className="relative">
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      autoFocus={index === 0}
                    />
                    {digit && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {countdown > 0 ? `صالح لمدة ${countdown} ثانية` : 'منتهي الصلاحية'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className={`text-sm font-semibold transition-all duration-300 ${
                    countdown > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-emerald-600 hover:text-emerald-700 hover:underline'
                  }`}
                >
                  {countdown > 0 ? 'إعادة الإرسال' : 'إعادة إرسال الرمز'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  جاري التحقق...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>التحقق من الرمز</span>
                  <Shield className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="flex justify-center relative z-10">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300"
            >
              <RotateCcw className="w-4 h-4 ml-1" />
              العودة
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>رمز التحقق صالح لمدة 10 دقائق فقط</p>
          <p className="mt-1">© 2024 منصة تعلم العربية - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;