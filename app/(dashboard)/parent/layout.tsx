'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Sidebar from '@/components/parents/Sidebar';
import Navbar from '@/components/admin/Navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // مغلق افتراضيًا على الجوال
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  // اكتشاف حجم الشاشة
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      // على الديسكتوب، افتح السايدبار افتراضيًا
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
      
      // على الجوال، تأكد من إغلاق السايدبار
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    // التحقق أول مرة
    checkScreenSize();

    // الاستماع لتغييرات حجم الشاشة
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [sidebarOpen]);

  // إغلاق السايدبار عند النقر على الـ overlay
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // إغلاق السايدبار تلقائيًا عند تغيير المسار على الجوال
  React.useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile]); // يمكنك إضافة المسار الحالي هنا إذا أردت

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
      
      {/* Sidebar Overlay - يظهر فقط على الجوال وعند فتح السايدبار */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}
      
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <main
        className={`transition-all duration-300 ease-in-out min-h-screen ${
          sidebarOpen && !isMobile 
            ? 'lg:mr-[280px]' 
            : 'mr-0'
        } pt-16 bg-gray-50`}
      >
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>           
    </div>
  );
}