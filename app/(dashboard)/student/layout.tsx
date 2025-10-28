'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Sidebar from '@/components/students/Sidebar';
import Navbar from '@/components/admin/Navbar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // On mobile, close sidebar by default
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Check initially
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Prevent body scroll when sidebar is open on mobile
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

  // Close sidebar when clicking on overlay
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

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
        // user={user} 
      />
      
      {/* Sidebar Overlay - Only show on mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}
      
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      {/* Main Content */}
      <main
        className={`transition-all duration-300 ease-in-out min-h-screen ${
          sidebarOpen && !isMobile ? 'lg:mr-80' : 'mr-0'
        } pt-16 bg-gray-50`}
      >
        <div className="p-4 lg:p-6 w-full">
          {children}
        </div>
      </main>           
    </div>
  );
}