// app/not-found.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div 
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full text-center">
        {/* Error Code */}
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
            <span className="text-4xl font-bold text-red-500">404</span>
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.h1 
          className="text-3xl font-bold text-gray-800 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          الصفحة غير موجودة!
        </motion.h1>
        
        <motion.p 
          className="text-gray-600 text-lg mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها. 
          قد تكون الرابط غير صحيح أو أن الصفحة تم حذفها.
        </motion.p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              <Home className="w-5 h-5" />
              العودة إلى الرئيسية
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors border border-gray-200 shadow-sm"
            >
              <BookOpen className="w-5 h-5" />
              اتصل بنا
            </Link>
          </motion.div>
        </div>

        {/* Decorative Element */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mt-12 text-gray-300"
        >
          <BookOpen className="w-12 h-12 mx-auto opacity-30" />
        </motion.div>
      </div>
    </div>
  );
}