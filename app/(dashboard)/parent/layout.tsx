'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Sidebar from '@/components/parents/Sidebar';
import Navabr from '@/components/admin/Navbar';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  // اكتشاف حجم الشاشة
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // On desktop, open sidebar by default
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // منع التمرير عندما يكون السايدبار مفتوحًا على الجوال
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, isMobile]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      <Navabr 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      {/* Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 ${
        sidebarOpen && !isMobile ? 'lg:mr-80' : 'mr-0'
      } pt-16`}>
        <div className="p-4 lg:p-6 w-full">
          {children}
        </div>
      </main>           
    </div>
  );
}