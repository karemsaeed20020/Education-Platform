'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, BookOpen } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { sendVerificationOTP } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import VerifyOTP from '@/components/VerifyOTP';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const result = await dispatch(sendVerificationOTP(email));
    if (sendVerificationOTP.fulfilled.match(result)) {
      setStep('otp');
    }
  };

  const handleOTPVerified = () => {
    // This will be called after successful OTP verification
    // The VerifyOTP component will handle the redirect automatically
    console.log('OTP verified successfully');
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <VerifyOTP
          email={email}
          mode="forgot"
          onVerifySuccess={handleOTPVerified}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden"
      dir="rtl"
    >
      {/* Subtle Background Elements (light, low opacity) */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-40"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-indigo-100 rounded-full blur-2xl opacity-40"></div>
      <div className="absolute top-1/2 left-20 w-24 h-24 bg-cyan-100 rounded-full blur-2xl opacity-40"></div>

      {/* Arabic Background Text - Very light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-20 right-20 text-9xl font-bold text-gray-300 rotate-12 select-none">العربية</div>
        <div className="absolute top-40 left-20 text-7xl font-bold text-gray-300 -rotate-12 select-none">تعلم</div>
        <div className="absolute bottom-32 right-16 text-8xl font-bold text-gray-300 rotate-6 select-none">قراءة</div>
        <div className="absolute bottom-20 left-24 text-6xl font-bold text-gray-300 -rotate-6 select-none">كتابة</div>
      </div>

      <motion.div 
        className="w-full max-w-6xl flex items-center justify-between gap-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Right Side - Branding */}
        <motion.div 
          className="flex-1 hidden lg:block space-y-8"
          variants={itemVariants}
        >
          <motion.div 
            className="flex items-center space-x-4 space-x-reverse"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-800 text-right">
                منصة تعلم العربية
              </h1>
              <p className="text-gray-600 text-lg text-right">للمعلمين والطلاب</p>
            </div>
            <motion.div 
              className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center transform -rotate-3 shadow-lg"
              whileHover={{ 
                scale: 1.1,
                rotate: -6,
                transition: { type: "spring", stiffness: 400 }
              }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>

          <motion.div 
            className="space-y-6 text-right"
            variants={itemVariants}
          >
            <h2 className="text-5xl font-bold text-gray-800 leading-tight">
              التحقق من الحساب
              <br />
              <span className="text-blue-600">
                بأمان تام
              </span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق المكون من 6 أرقام
            </p>
          </motion.div>
        </motion.div>

        {/* Left Side - Form */}
        <motion.div 
          className="w-full lg:w-[420px]"
          variants={formVariants}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center transform -rotate-3 shadow-lg"
                whileHover={{ 
                  scale: 1.1,
                  rotate: -6,
                  transition: { type: "spring", stiffness: 400 }
                }}
              >
                <Mail className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">إرسال رمز التحقق</h1>
              <p className="text-gray-600 text-lg">
                أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق
              </p>
            </motion.div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="space-y-3">
                <label className="text-base font-semibold text-gray-700 block text-right">
                  عنوان البريد الإلكتروني
                </label>
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.02 }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 px-5 pl-14 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-base text-left"
                    placeholder="example@email.com"
                    dir="ltr"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                </motion.div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || !email}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                whileHover={{ 
                  scale: loading ? 1 : 1.02,
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <motion.div 
                    className="flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin ml-3"></div>
                    جاري الإرسال...
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:-translate-x-1 transition-transform rotate-180" />
                    إرسال رمز التحقق
                  </motion.div>
                )}
              </motion.button>
            </motion.form>

            <motion.div 
              className="flex items-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-6 text-gray-500 font-medium">أو</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </motion.div>

            <motion.button
              onClick={() => router.push("/login")}
              className="w-full h-14 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
              whileHover={{ 
                scale: 1.02,
                backgroundColor: "#f9fafb"
              }}
              whileTap={{ scale: 0.98 }}
            >
              العودة إلى تسجيل الدخول
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;