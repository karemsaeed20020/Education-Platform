// app/loading.tsx
'use client';

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function Loading() {
  return (
    // ADD dir="rtl" to the root container
    <div 
      dir="rtl"
      className="min-h-screen bg-white flex items-center justify-center p-4"
    >
      <div className="flex flex-col items-center text-center">
        {/* Logo */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-emerald-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* FIXED TEXT - Added proper Arabic font classes */}
        <motion.h1 
          className="text-2xl font-bold text-gray-800 mb-4"
          // Ensure proper Arabic rendering
          style={{ 
            fontFamily: 'Tahoma, Arial, sans-serif',
            lineHeight: '1.5'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          جاري التحميل...
        </motion.h1>

        {/* Loading Dots */}
        <div className="flex space-x-2 rtl:space-x-reverse">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 bg-emerald-600 rounded-full"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}