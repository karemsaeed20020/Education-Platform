'use client';

import React from 'react';
import {
  Calendar,
  User,
  Bell,
  BookMarked,
  PhoneCall,
  Video,
  UserCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { 
      icon: BookMarked, 
      label: 'الامتحانات', 
      href: '/student/exams', 
      active: pathname === '/student/exams' 
    },
    { 
      icon: Calendar, 
      label: 'الواجبات المنزلية', 
      href: '/student/homework', 
      active: pathname === '/student/homework' 
    },
    { 
      icon: Bell, 
      label: 'الإشعارات', 
      href: '/student/notifications', 
      active: pathname === '/student/notifications' 
    },
    { 
      icon: UserCircle, 
      label: 'الملف الشخصي', 
      href: '/student/profile', 
      active: pathname === '/student/profile' 
    },
    { 
      icon: Video, 
      label: 'الفيديوهات', 
      href: '/student/videos', 
      active: pathname === '/student/videos' 
    },
    { 
      icon: PhoneCall, 
      label: 'المحادثات', 
      href: '/student/chats', 
      active: pathname === '/student/chats' 
    },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when clicking links
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-16 h-full bg-white shadow-xl border-l border-gray-200 transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } w-80`}
      >
        {/* Mobile Header - Only show on mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">قائمة الطالب</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content Area - Adjusted for navbar height */}
        <div className="h-full flex flex-col overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {/* Profile Card */}
          <div className="px-6 py-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.username || 'الطالب'}</h3>
                  <p className="text-xs text-gray-500 mt-1">طالب</p>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 pb-6">
            <div className="space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.active
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-500 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;