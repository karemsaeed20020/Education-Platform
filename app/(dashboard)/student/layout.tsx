'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Sidebar from '@/components/students/Sidebar';
import Navbar from '@/components/admin/Navbar';



export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

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
        user={user} 
      />
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}
      
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        // user={user} 
      />
      
      <main
        className={`transition-all duration-300 ease-in-out min-h-screen ${
          sidebarOpen ? 'lg:mr-[280px]' : 'mr-0'
        } pt-16 bg-gray-50`}
      >
        {children}
      </main>           
    </div>
  );
}   