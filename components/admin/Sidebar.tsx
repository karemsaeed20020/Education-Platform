'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  User,
  Video,
  FileText,
  Mail,
  ClipboardList,
  FileBarChart,
  Award,
  UserCircle,
  Bell,
  BookMarked,
  GraduationCap,
  School,
  UserCog,
  BookCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
// import { User as UserType } from '@/types'; // ✅ your User type

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  // user: UserType; // ✅ Add this line
}
// حفظ الحالة في localStorage
const useAdminStatus = () => {
  const [adminStatus, setAdminStatus] = useState<'online' | 'offline' | 'away'>('online');

  useEffect(() => {
    const savedStatus = localStorage.getItem('adminStatus') as 'online' | 'offline' | 'away';
    if (savedStatus) {
      setAdminStatus(savedStatus);
    }
  }, []);

  const updateAdminStatus = (status: 'online' | 'offline' | 'away') => {
    setAdminStatus(status);
    localStorage.setItem('adminStatus', status);
    window.dispatchEvent(new Event('adminStatusChanged'));
  };

  return { adminStatus, updateAdminStatus };
};

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isOnline, setIsOnline] = useState(true);
  const { adminStatus, updateAdminStatus } = useAdminStatus();

  // اكتشاف حالة الاتصال بالإنترنت
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      updateAdminStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateAdminStatus]);

  // تغيير حالة الإدمن يدويًا
  const toggleAdminStatus = () => {
    if (adminStatus === 'online') {
      updateAdminStatus('away');
    } else if (adminStatus === 'away') {
      updateAdminStatus('online');
    } else if (adminStatus === 'offline' && isOnline) {
      updateAdminStatus('online');
    }
  };

  // إغلاق السايدبار عند النقر على أي رابط (على الجوال فقط)
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // تجميع عناصر القائمة في مجموعات
  const menuGroups = [
    {
      title: 'الرئيسية',
      items: [
        { 
          icon: Home, 
          label: 'لوحة التحكم', 
          href: '/admin/dashboard', 
          active: pathname === '/admin/dashboard' 
        }
      ]
    },
    {
      title: 'إدارة المحتوى',
      items: [
        { 
          icon: BookOpen, 
          label: 'الكورسات', 
          href: '/admin/courses', 
          active: pathname === '/admin/courses' 
        },
        { 
          icon: Video, 
          label: 'الفيديوهات', 
          href: '/admin/videos', 
          active: pathname === '/admin/videos' 
        },
        { 
          icon: BookMarked, 
          label: 'الامتحانات', 
          href: '/admin/exams', 
          active: pathname === '/admin/exams' 
        },
        { 
          icon: GraduationCap, 
          label: 'نتائج الامتحانات', 
          href: '/admin/examResult', 
          active: pathname === '/admin/examResult' 
        },
      ]
    },
    {
      title: 'إدارة المستخدمين',
      items: [
        { 
          icon: Users, 
          label: 'الطلاب', 
          href: '/admin/students', 
          active: pathname === '/admin/students' 
        },
        { 
          icon: UserCog, 
          label: 'إدارة أولياء الأمور', 
          href: '/admin/parents', 
          active: pathname === '/admin/parents' 
        },
        
      ]
    },
    {
      title: 'المتابعة والتقارير',
      items: [
        { 
          icon: ClipboardList, 
          label: 'الحضور والغياب', 
          href: '/admin/attendance', 
          active: pathname === '/admin/attendance' 
        },
        { 
          icon: FileBarChart, 
          label: 'تقارير الحضور', 
          href: '/admin/attendance-report', 
          active: pathname === '/admin/attendance-report' 
        },
        { 
          icon: Award, 
          label: 'الدرجات والتقييم', 
          href: '/admin/grades', 
          active: pathname === '/admin/grades' 
        },
        // { 
        //   icon: BarChart3, 
        //   label: 'التقارير الإحصائية', 
        //   href: '/admin/reports', 
        //   active: pathname === '/admin/reports' 
        // },
      ]
    },
    {
      title: 'التواصل والإشعارات',
      items: [
        { 
          icon: Mail, 
          label: 'رسائل التواصل', 
          href: '/admin/contact', 
          active: pathname === '/admin/contact' 
        },
        { 
          icon: Bell, 
          label: 'الإشعارات', 
          href: '/admin/notifications', 
          active: pathname === '/admin/notifications' 
        },
        { 
          icon: MessageSquare, 
          label: 'الدردشة', 
          href: '/admin/chats', 
          active: pathname === '/admin/chats' 
        },
      ]
    },
    {
      title: 'الإعدادات',
      items: [
        { 
          icon: UserCircle, 
          label: 'الملف الشخصي', 
          href: '/admin/profile', 
          active: pathname === '/admin/profile' 
        },
        { 
          icon: Settings, 
          label: 'إعدادات النظام', 
          href: '/admin/settings', 
          active: pathname === '/admin/settings' 
        }
      ]
    }
  ];

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

  const getStatusTextColor = () => {
    switch (adminStatus) {
      case 'online': return 'text-green-700';
      case 'away': return 'text-yellow-700';
      case 'offline': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  const getStatusBgColor = () => {
    switch (adminStatus) {
      case 'online': return 'bg-green-50';
      case 'away': return 'bg-yellow-50';
      case 'offline': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <aside
      className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg border-l border-gray-200 transition-all duration-300 ease-in-out z-40 ${
        sidebarOpen ? 'translate-x-0 w-64' : 'translate-x-full lg:translate-x-0 lg:w-0'
      }`}
    >
      <div className={`h-full flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'
      }`}>
        {/* Profile Card */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {user?.username || 'مدير النظام'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className={`w-3 h-3 rounded-full ${getStatusColor()} cursor-pointer border border-white shadow-sm`}
                  onClick={toggleAdminStatus}
                  title="انقر لتغيير الحالة"
                />
                <span className="text-xs text-gray-600">{getStatusText()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Menu Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-2">
                {/* Group Title */}
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  {group.title}
                </h4>
                
                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={`${groupIndex}-${itemIndex}`}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          item.active
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-2 p-2 rounded-lg ${getStatusBgColor()} ${getStatusTextColor()}`}>
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            <span className="text-xs font-medium">
              {getStatusText()} - {isOnline ? 'الاتصال نشط' : 'الاتصال مقطوع'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;