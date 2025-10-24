"use client";
import Image from "next/image";
import Login1 from "@/public/login.png";
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
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }else if (user.role === 'parent') {
      router.push('/parent/');
    } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

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
      <div className="relative w-full h-48 md:hidden">
        <Image
          src={Login1}
          alt="صورة تسجيل الدخول"
          fill
          className="object-cover"
          priority
        />
      </div>

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

              {/* OR Divider */}
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center my-4 md:my-6"
              >
                <div className="flex-grow border-t border-gray-300"></div>
                <span dir="rtl" className="px-3 md:px-4 text-gray-500 text-sm font-medium">
                  أو
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </motion.div> */}

              {/* Google Login
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  className="w-full flex justify-center items-center py-6 text-base md:text-sm cursor-pointer"
                  dir="rtl"
                  type="button"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 ml-2 md:ml-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    <span>سجّل الدخول باستخدام جوجل</span>
                  </div>
                </Button>
              </motion.div> */}

              {/* Register Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-6 text-center"
              >
                <p dir="rtl" className="text-sm text-gray-600">
                  ليس لديك حساب؟{" "}
                  <a href="/register" className="text-blue-600 hover:underline font-medium">
                    سجّل الآن
                  </a>
                </p>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>

      {/* Desktop: Image */}
      <div className="relative w-5/12 hidden md:block">
        <Image
          src={Login1}
          alt="صورة تسجيل الدخول"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}