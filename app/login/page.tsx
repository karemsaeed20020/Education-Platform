"use client";
import Image from "next/image";
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
import { loginSchema } from "@/schema/validation";
import { LoginValues } from "@/types";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import Link from "next/link";

export default function Login() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  // External education image from Unsplash
  const educationImage = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

  // Fallback gradient if image fails to load
  const fallbackGradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'parent') {
        router.push('/parent/results');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  // Add this useEffect to your login component to verify token is working
  useEffect(() => {
    if (user && user.role === 'admin') {
      console.log('✅ Login successful, user:', user);
      console.log('🔐 Token should be automatically included in all API calls');
      
      // Test if we can access admin routes
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);
    }
  }, [user, router]);

  
  function onSubmit(values: LoginValues) {
    dispatch(loginUser(values))
      .unwrap()
      .then(() => {
        // Navigation handled by useEffect
      })
      .catch((error) => {
        console.error('Login failed:', error);
      });
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile: Show image at top */}
      

      {/* Form Section */}
      <div className="flex flex-col justify-center w-full md:w-7/12 p-6 md:p-8 bg-white">
        <motion.div
          className="w-full max-w-lg mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-7 text-center">
            سجّل دخولك إلى حسابك
          </h1>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center mb-4"
            >
              {error}
            </motion.div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 md:space-y-6"
            >
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel dir="rtl">البريد الإلكتروني</FormLabel>
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

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel dir="rtl">كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="أدخل كلمة المرور"
                            type={showPassword ? "text" : "password"}
                            {...field}
                            className="w-full text-right pr-10"
                            dir="rtl"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            dir="ltr"
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

              {/* Forgot Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex justify-start">
                  <Link
                    href="/forget-password"
                    className="text-sm text-blue-600 hover:underline font-medium"
                    dir="rtl"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button
                  type="submit"
                  className="w-full py-6 text-base md:text-sm cursor-pointer"
                  dir="rtl"
                  disabled={loading}
                >
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </motion.div>

              {/* Register Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-6 text-center"
              >
                <p dir="rtl" className="text-sm text-gray-600">
                  ليس لديك حساب؟{" "}
                  <Link href="/register" className="text-blue-600 hover:underline font-medium">
                    سجّل الآن
                  </Link>
                </p>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>

      {/* Desktop: Image */}
      <div 
        className="relative w-5/12 hidden md:block"
        style={{
          background: imageError ? fallbackGradient : 'none'
        }}
      >
        {!imageError ? (
          <Image
            src={'/fonts/02.JPG'} // Use absolute path from public directory
            alt="منصة التعليم الإلكتروني - سجل دخولك إلى عالم المعرفة"
            fill
            className="object-cover"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center p-8">
              <h3 className="text-2xl font-bold mb-4">منصة التعليم الإلكتروني</h3>
              <p className="text-lg">سجل دخولك إلى عالم المعرفة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}