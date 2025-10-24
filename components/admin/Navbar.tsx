'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { logoutUser } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Menu, X, Bell, User, ChevronDown, LogOut, GraduationCap, Settings } from 'lucide-react';
import { User as UserType } from '@/types';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: UserType;
}
// استخدام نفس الـ hook للحالة مع تحديث تلقائي
const useAdminStatus = () => {
  const [adminStatus, setAdminStatus] = useState<'online' | 'offline' | 'away'>('online');

  useEffect(() => {
    // تحميل الحالة من localStorage
    const savedStatus = localStorage.getItem('adminStatus') as 'online' | 'offline' | 'away';
    if (savedStatus) {
      setAdminStatus(savedStatus);
    }

    // الاستماع لتغييرات الحالة
    const handleStatusChange = () => {
      const newStatus = localStorage.getItem('adminStatus') as 'online' | 'offline' | 'away';
      if (newStatus) {
        setAdminStatus(newStatus);
      }
    };

    // الاستماع للأحداث المخصصة وتغييرات localStorage
    window.addEventListener('adminStatusChanged', handleStatusChange);
    window.addEventListener('storage', handleStatusChange);

    return () => {
      window.removeEventListener('adminStatusChanged', handleStatusChange);
      window.removeEventListener('storage', handleStatusChange);
    };
  }, []);

  return adminStatus;
};

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const adminStatus = useAdminStatus();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // اكتشاف حالة الاتصال
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  // إغلاق الدروبداون عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getStatusColor = () => {
    switch (adminStatus) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (adminStatus) {
      case 'online': return 'متصل';
      case 'away': return 'غير متاح';
      case 'offline': return 'غير متصل';
      default: return 'غير معروف';
    }
  };

  const getStatusBgColor = () => {
    switch (adminStatus) {
      case 'online': return 'bg-green-100 text-green-800 border border-green-200';
      case 'away': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'offline': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getConnectionText = () => {
    return isOnline ? 'اتصال نشط' : 'اتصال مقطوع';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* الجزء الأيسر - زر القائمة والشعار */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">السيد الابي</span>
            </div>
          </div>

          {/* الجزء الأيمن - المستخدم والإشعارات */}
          <div className="flex items-center gap-3">
            {/* حالة الإدمن */}
            {/* <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusBgColor()}`}>
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
              <span className="text-xs font-medium">
                {getStatusText()}
              </span>
            </div> */}

          

            {/* ملف المستخدم */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="hidden md:block text-right">
                  <span className="text-gray-700 font-medium block text-sm">
                    {user?.username || 'المستخدم'}
                  </span>
                  <span className="text-gray-500 text-xs block">
                    {user?.role === 'admin' ? 'مدير النظام' : 'مستخدم'}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* معلومات المستخدم */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">{user?.email}</p>
                    {/* <div className="flex items-center gap-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                      <span className="text-xs text-gray-500">
                        {getStatusText()} • {getConnectionText()}
                      </span>
                    </div> */}
                  </div>

                  {/* عناصر القائمة */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        router.push('/admin/profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      الملف الشخصي
                      <User className="h-4 w-4" />
                    </button>
                    
                    {/* <button
                      onClick={() => {
                        router.push('/admin/settings');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      الإعدادات
                      <Settings className="h-4 w-4" />
                    </button> */}
                  </div>

                  {/* تسجيل الخروج */}
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center justify-between transition-colors"
                    >
                      تسجيل الخروج
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;