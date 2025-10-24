    'use client';

    import React from 'react';
    import {
    Home,
    Calendar,
    User,
    Globe,
    Video,
    UserCircle,
    Bell,
    BookMarked,
    PhoneCall,
    } from 'lucide-react';
    import Link from 'next/link';
    import { usePathname } from 'next/navigation';
    import { useSelector } from 'react-redux';
    import { RootState } from '@/redux/store';

    interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    }

    const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen }) => {
    const pathname = usePathname();
    const { user } = useSelector((state: RootState) => state.auth);

    const menuItems = [
        // { 
        // icon: Home, 
        // label: 'الرئيسية', 
        // href: '/parent', 
        // active: pathname === '/parent/' 
        // },
        { 
        icon: BookMarked, 
        label: 'الحضور', 
        href: '/parent/attendance', 
        active: pathname === '/parent/attendance' 
        },
        { 
        icon: Calendar, 
        label: 'النتائج', 
        href: '/parent/results', 
        active: pathname === '/parent/results' 
        },
        { 
        icon: Bell, 
        label: 'التقارير', 
        href: '/parent/reports', 
        active: pathname === '/parent/reports' 
        },
        // { 
        // icon: UserCircle, 
        // label: 'الملف الشخصي', 
        // href: '/parent/profile', 
        // active: pathname === '/parent/profile' 
        // },
        { 
        icon: PhoneCall, 
        label: 'المحادثات', 
        href: '/parent/chats', 
        active: pathname === '/parent/chats' 
        },
    ];

    return (
        <aside
        className={`fixed right-0 top-16 h-full bg-white shadow-lg border-l border-gray-200 transition-transform duration-300 ease-in-out z-40 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '280px' }}
        >
        <div className="h-full flex flex-col">
            {/* Profile Card */}
            <div className="flex-1 px-4 py-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
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
                    <h3 className="font-semibold text-gray-900">{user?.username || 'اسم المستخدم'}</h3>
                    <div className="flex items-center gap-1 mt-1">
                    
                    </div>
                </div>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="space-y-1">
                {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        item.active
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    >
                    <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </div>
                    </Link>
                );
                })}
            </nav>
            </div>

            {/* Upgrade Card */}
            
        </div>
        </aside>
    );
    };

    export default Sidebar;