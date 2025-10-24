'use client';
import Image from "next/image";
// import Login1 from "@/public/Register.png";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schema/validation";
import { RegisterValues } from "@/types";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import { registerUser, clearAuth } from "@/redux/slices/authSlice";
import VerifyOTP from "@/components/VerifyOTP";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

export default function Register() {
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      grade: "غير محدد",
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Clear any existing auth state when component mounts
  useEffect(() => {
    dispatch(clearAuth());
  }, [dispatch]);

  const onSubmit = async (values: RegisterValues) => {
    setLoading(true);
    try {
      // Clear auth state before registration
      dispatch(clearAuth());
      
      // This will now ONLY register the user without auto-login
      await dispatch(registerUser(values)).unwrap();
      
      // Set the email for OTP verification
      setRegistrationEmail(values.email);
      
      // Show OTP verification component
      setShowOTP(true);
      
      // Clear the form
      form.reset();
      
    } catch (error) {
      // Error already handled in thunk
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };


   const handleVerifySuccess = () => {
    // After successful OTP verification, redirect to login page
    toast.success("تم التحقق من حسابك بنجاح! يمكنك الآن تسجيل الدخول.");
    router.push('/login');
  };
  const handleBackFromOTP = () => {
    setShowOTP(false);
    // Optionally clear any stored data
    localStorage.removeItem('registrationEmail');
  };

  // If showing OTP verification, render ONLY the VerifyOTP component
  if (showOTP) {
    return (
      <VerifyOTP 
        email={registrationEmail} 
        onVerifySuccess={handleVerifySuccess}
        onBack={handleBackFromOTP}
        mode="signup"
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Desktop: Show image on LEFT side */}
      <div className="relative w-5/12 hidden md:block">
        <Image
          src='/Register.png'
          alt="صورة التسجيل"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Mobile: Show image at top */}
      <div className="relative w-full h-48 md:hidden">
        <Image
          src='/Register.png'
          alt="صورة التسجيل"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Form Section */}
      <div className="flex flex-col justify-center w-full md:w-7/12 p-6 md:p-8 bg-white">
        {/* Animated Form Container */}
        <motion.div
          className="w-full max-w-lg mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-7 text-center">
            أنشئ حسابك الجديد
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
              {/* Username Field - Animated */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel dir="rtl" className="mb-1 md:mb-2">
                        اسم المستخدم
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل اسم المستخدم"
                          {...field}
                          className="w-full text-right"
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage dir="rtl" />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Email Field - Animated */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel dir="rtl" className="mb-1 md:mb-2">
                        البريد الإلكتروني
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل بريدك الإلكتروني"
                          type="email"
                          {...field}
                          className="w-full text-right"
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage dir="rtl" />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Phone Field - Animated */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel dir="rtl" className="mb-1 md:mb-2">
                        رقم الهاتف
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل رقم الهاتف المصري"
                          type="tel"
                          {...field}
                          className="w-full text-right"
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage dir="rtl" />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Grade Field - Animated */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel dir="rtl" className="mb-1 md:mb-2">
                        الصف الدراسي
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                        <FormControl>
                          <SelectTrigger className="w-full text-right">
                            <SelectValue placeholder="اختر الصف الدراسي" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="الصف الأول الثانوي">الصف الأول الثانوي</SelectItem>
                          <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                          <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
                          <SelectItem value="غير محدد">غير محدد</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage dir="rtl" />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Password Field - Animated */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel dir="rtl" className="mb-1 md:mb-2">
                        كلمة المرور
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="أدخل كلمة المرور"
                            type={showPassword ? "text" : "password"}
                            {...field}
                            className="w-full text-right pr-3"
                            dir="rtl"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="cursor-pointer absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage dir="rtl" />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Confirm Password Field - Animated */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel dir="rtl" className="mb-1 md:mb-2">
                        تأكيد كلمة المرور
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="أعد إدخال كلمة المرور"
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            className="w-full text-right pr-3"
                            dir="rtl"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="cursor-pointer absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage dir="rtl" />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Submit Button - Animated */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button
                  type="submit"
                  className="w-full py-6 text-base md:text-sm cursor-pointer"
                  dir="rtl"
                  disabled={loading}
                >
                  {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
                </Button>
              </motion.div>

              {/* OR Divider - Animated */}
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex items-center my-4 md:my-6"
              >
                <div className="flex-grow border-t border-gray-300"></div>
                <span dir="rtl" className="px-3 md:px-4 text-gray-500 text-sm font-medium">
                  أو
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </motion.div> */}

              {/* Sign up with Google - Animated */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Button
                  variant="outline"
                  className="w-full flex justify-center items-center py-6 text-base md:text-sm cursor-pointer"
                  dir="rtl"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 ml-2 md:ml-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    <span>سجّل باستخدام جوجل</span>
                  </div>
                </Button>
              </motion.div> */}

              {/* Login Link - Animated */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mt-6 text-center"
              >
                <p dir="rtl" className="text-sm text-gray-600">
                  هل لديك حساب؟{" "}
                  <Link href="/login" className="text-blue-600 hover:underline font-medium">
                    سجّل دخولك
                  </Link>
                </p>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}