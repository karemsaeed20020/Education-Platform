'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Sidebar from '@/components/admin/Sidebar';
import Navbar from '@/components/admin/Navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // مفتوح افتراضيًا
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  // اكتشاف حجم الشاشة
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // على الجوال، أغلق السايدبار افتراضيًا
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // على الديسكتوب، افتح السايدبار افتراضيًا
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      <Navbar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        user={user}
      />
      
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      {/* المحتوى الرئيسي - ينتشر ليملأ الشاشة كاملة عند إغلاق السايدبار */}
      <main className={`min-h-screen pt-16 transition-all duration-300 ${
        sidebarOpen && !isMobile ? 'mr-64' : 'mr-0'
      }`}>
        <div className="p-4 lg:p-6 w-full">
          {children}
        </div>
      </main>           
    </div>
  );
}