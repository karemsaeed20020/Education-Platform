// app/error.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error:', error);
  }, [error]);

  return (
    <div 
      dir="rtl"
      className="overflow-y-hidden min-h-[100dvh] bg-gradient-to-br from-rose-50 to-red-50 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full text-center">
        {/* Error Indicator */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            delay: 0.2
          }}
          className="mb-6"
        >
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl font-bold text-red-600">خطأ</span>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.h1 
          className="text-3xl font-bold text-gray-800 mb-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          حدث خطأ غير متوقع!
        </motion.h1>
        
        <motion.p 
          className="text-gray-600 text-lg mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          نعتذر عن هذا inconvenience.
        </motion.p>
        
        <motion.p 
          className="text-gray-500 text-sm mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'فريق الدعم يعمل على حل المشكلة.'
          }
        </motion.p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Try Again Button */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => {
                reset();
                // Optional: Add analytics tracking
                // trackErrorRecovery(pathname);
              }}
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl shadow-sm"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              حاول مرة أخرى
            </Button>
          </motion.div>
          
          {/* Home Button */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl border-gray-200 shadow-sm"
            >
              <Home className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </motion.div>
        </div>

        {/* Support Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <p className="text-gray-600 text-sm">
            هل تستمر المشكلة؟{' '}
            <a 
              href="/contact" 
              className="text-emerald-600 hover:text-emerald-700 font-medium underline"
            >
              اتصل بدعم الفني
            </a>
          </p>
        </motion.div>

        {/* Decorative Element */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="mt-12 text-red-200"
        >
          <BookOpen className="w-12 h-12 mx-auto opacity-30" />
        </motion.div>
      </div>
    </div>
  );
}