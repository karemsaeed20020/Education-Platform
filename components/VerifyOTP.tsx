// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { Mail, Check, RotateCcw, Loader, Shield, Clock } from 'lucide-react';
// import { useDispatch } from 'react-redux';
// import { AppDispatch } from '@/redux/store';
// import { verifyOTP } from '@/redux/slices/authSlice';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-hot-toast';

// interface VerifyOTPProps {
//   email: string;
//   onVerifySuccess?: () => void;
//   onBack?: () => void;
//   mode?: 'signup' | 'forgot';
//   onResetPassword?: (email: string, otp: string) => void; // For forgot password flow
// }

// const VerifyOTP: React.FC<VerifyOTPProps> = ({ 
//   email, 
//   onVerifySuccess, 
//   onBack, 
//   mode = 'signup',
//   onResetPassword 
// }) => {
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [countdown, setCountdown] = useState(60);
  
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();

//   // Focus first input on mount
//   useEffect(() => {
//     if (inputRefs.current[0]) {
//       inputRefs.current[0].focus();
//     }
//   }, []);

//   // Countdown timer
//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [countdown]);

//   const handleOTPChange = (index: number, value: string) => {
//     if (/^\d*$/.test(value) && value.length <= 1) {
//       const newOtp = [...otp];
//       newOtp[index] = value;
//       setOtp(newOtp);
//       setError('');

//       if (value && index < 5) {
//         inputRefs.current[index + 1]?.focus();
//       } else if (!value && index > 0) {
//         inputRefs.current[index - 1]?.focus();
//       }
//     }
//   };

//   const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handlePaste = (e: React.ClipboardEvent) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData.getData('text');
//     if (/^\d{6}$/.test(pastedData)) {
//       const newOtp = pastedData.split('');
//       setOtp(newOtp);
//       inputRefs.current[5]?.focus();
//     }
//   };

//   // In your VerifyOTP component - update the handleSubmit function
// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setIsLoading(true);
//   setError('');

//   const otpCode = otp.join('');
//   if (otpCode.length !== 6) {
//     setError('يرجى إدخال رمز التحقق الكامل المكون من 6 أرقام');
//     setIsLoading(false);
//     return;
//   }

//   try {
//     if (mode === 'forgot') {
//       // For forgot password flow, verify OTP first
//       await dispatch(verifyOTP({ email, otp: otpCode })).unwrap();
//       toast.success('تم التحقق بنجاح! 🎉');
      
//       // Store email and OTP for reset password page
//       localStorage.setItem('resetPasswordEmail', email);
//       localStorage.setItem('resetPasswordOTP', otpCode);
      
//       // Redirect to reset password page
//       router.push('/reset-password');
//     } else {
//       // For signup flow, verify OTP normally
//       await dispatch(verifyOTP({ email, otp: otpCode })).unwrap();
//       toast.success('تم التحقق بنجاح! 🎉');
//       onVerifySuccess?.();
//     }
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (err: any) {
//     console.error('OTP Verification Error:', err);
//     setError(err.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
//   } finally {
//     setIsLoading(false);
//   }
// };

//   const handleResend = async () => {
//     if (countdown > 0) return;
    
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });
      
//       if (response.ok) {
//         setCountdown(60);
//         toast.success('تم إعادة إرسال رمز التحقق!');
//         setOtp(['', '', '', '', '', '']);
//         if (inputRefs.current[0]) {
//           inputRefs.current[0].focus();
//         }
//       } else {
//         const errorData = await response.json();
//         toast.error(errorData.message || 'فشل إعادة إرسال الرمز');
//       }
//     } catch (error) {
//       toast.error('حدث خطأ أثناء إعادة الإرسال');
//     }
//   };

//   return (
//     <div className="w-full max-w-md mx-auto">
//       <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
//         <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-l from-emerald-400/10 to-transparent rounded-bl-full"></div>
//         <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-teal-400/10 to-transparent rounded-tr-full"></div>

//         <div className="text-center mb-8 relative z-10">
//           <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
//             <Shield className="w-10 h-10 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-3">
//             {mode === 'signup' ? 'تأكيد الحساب' : 'إعادة تعيين كلمة المرور'}
//           </h1>
//           <p className="text-gray-600 text-lg">
//             أدخل رمز التحقق المرسل إلى <span className="font-semibold text-emerald-600">{email}</span>
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-8 mb-8 relative z-10">
//           <div className="space-y-6">
//             <div className="flex justify-center space-x-3 space-x-reverse">
//               {otp.map((digit, index) => (
//                 <div key={index} className="relative">
//                   <input
//                     ref={(el) => (inputRefs.current[index] = el)}
//                     type="text"
//                     inputMode="numeric"
//                     maxLength={1}
//                     value={digit}
//                     onChange={(e) => handleOTPChange(index, e.target.value)}
//                     onKeyDown={(e) => handleKeyDown(index, e)}
//                     onPaste={handlePaste}
//                     className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white/80 backdrop-blur-sm"
//                     autoFocus={index === 0}
//                   />
//                   {digit && (
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center text-sm font-medium animate-shake">
//                 {error}
//               </div>
//             )}

//             <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
//               <div className="flex items-center text-gray-600">
//                 <Clock className="w-4 h-4 mr-2" />
//                 <span className="text-sm font-medium">
//                   {countdown > 0 ? `صالح لمدة ${countdown} ثانية` : 'منتهي الصلاحية'}
//                 </span>
//               </div>
//               <button
//                 type="button"
//                 onClick={handleResend}
//                 disabled={countdown > 0}
//                 className={`text-sm font-semibold transition-all duration-300 ${
//                   countdown > 0
//                     ? 'text-gray-400 cursor-not-allowed'
//                     : 'text-emerald-600 hover:text-emerald-700 hover:underline'
//                 }`}
//               >
//                 {countdown > 0 ? 'إعادة الإرسال' : 'إعادة إرسال الرمز'}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading || otp.join('').length !== 6}
//             className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
//           >
//             {isLoading ? (
//               <div className="flex items-center justify-center">
//                 <Loader className="w-5 h-5 mr-2 animate-spin" />
//                 {mode === 'forgot' ? 'جاري التحقق...' : 'جاري التحقق...'}
//               </div>
//             ) : (
//               <div className="flex items-center justify-center">
//                 <span>{mode === 'signup' ? 'تأكيد الحساب' : 'التحقق والمتابعة'}</span>
//                 <Shield className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
//               </div>
//             )}
//           </button>
//         </form>

//         {onBack && (
//           <div className="flex justify-center relative z-10">
//             <button
//               type="button"
//               onClick={onBack}
//               className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300"
//             >
//               <RotateCcw className="w-4 h-4 ml-1" />
//               العودة
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="mt-6 text-center text-xs text-gray-500">
//         <p>رمز التحقق صالح لمدة 10 دقائق فقط</p>
//         <p className="mt-1">© 2024 منصة تعلم العربية - جميع الحقوق محفوظة</p>
//       </div>
//     </div>
//   );
// };

// export default VerifyOTP;
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Check, RotateCcw, Loader, Shield, Clock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { verifyOTP } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface VerifyOTPProps {
  email: string;
  onVerifySuccess?: () => void;
  onBack?: () => void;
  mode?: 'signup' | 'forgot';
  onResetPassword?: (email: string, otp: string) => void;
}

const VerifyOTP: React.FC<VerifyOTPProps> = ({ 
  email, 
  onVerifySuccess, 
  onBack, 
  mode = 'signup',
  onResetPassword 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

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

  // Fixed ref callback function - returns void
  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const handleOTPChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Move to next input if value entered, move to previous if backspace on empty
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
      if (mode === 'forgot') {
        await dispatch(verifyOTP({ email, otp: otpCode })).unwrap();
        toast.success('تم التحقق بنجاح! 🎉');
        
        localStorage.setItem('resetPasswordEmail', email);
        localStorage.setItem('resetPasswordOTP', otpCode);
        
        router.push('/reset-password');
      } else {
        await dispatch(verifyOTP({ email, otp: otpCode })).unwrap();
        toast.success('تم التحقق بنجاح! 🎉');
        onVerifySuccess?.();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      setError(err.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
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

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {mode === 'signup' ? 'تأكيد الحساب' : 'إعادة تعيين كلمة المرور'}
          </h1>
          <p className="text-gray-600">
            أدخل رمز التحقق المرسل إلى <span className="font-semibold text-blue-600">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* OTP Inputs - Left to Right */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <div key={index} className="relative">
                  <input
                    ref={setInputRef(index)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                    autoFocus={index === 0}
                  />
                  {digit && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-center text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 ml-2" />
                <span className="text-sm font-medium">
                  {countdown > 0 ? `صالح لمدة ${countdown} ثانية` : 'منتهي الصلاحية'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0}
                className={`text-sm font-semibold transition-all duration-200 ${
                  countdown > 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {countdown > 0 ? 'إعادة الإرسال' : 'إعادة إرسال الرمز'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {mode === 'forgot' ? 'جاري التحقق...' : 'جاري التحقق...'}
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'تأكيد الحساب' : 'التحقق والمتابعة'}</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {onBack && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              العودة
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>رمز التحقق صالح لمدة 10 دقائق فقط</p>
        <p className="mt-1">© 2024 منصة تعلم العربية - جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
};

export default VerifyOTP;