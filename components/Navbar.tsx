// 'use client';

// import {
//   BookOpen,
//   Menu,
//   X,
//   LogIn,
//   UserPlus,
//   User,
//   LogOut,
// } from "lucide-react";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useRouter } from "next/navigation";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { RootState } from "@/redux/store";
// import { getProfile, logoutUser } from "@/redux/slices/authSlice";

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const dispatch = useDispatch<any>();
//   const router = useRouter();
//   const { user } = useSelector((state: RootState) => state.auth);

//   useEffect(() => {
//   if (!user) {
//     dispatch(getProfile());
//   }
// }, [dispatch, user]);
//   const handleLogout = async () => {
//     await dispatch(logoutUser());
//     router.push("/login");
//   };

//   return (
//     <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
//       <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center space-x-3 space-x-reverse">
//             <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
//               <BookOpen className="w-6 h-6 text-white" />
//             </div>
//             <Link href="/">
//               <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 السيد الابي
//               </span>
//               <p className="text-sm text-gray-600 -mt-1">لتعليم اللغة العربية</p>
//             </Link>
//           </div>

//           {/* Desktop Menu */}
//           <div className="hidden md:flex items-center space-x-6 space-x-reverse">
//             <Link href="/" className="nav-link">الرئيسية</Link>
//             <a href="#about" className="nav-link">من نحن</a>
//             <a href="#courses" className="nav-link">الكورسات</a>
//             <a href="#methodology" className="nav-link">منهجيتنا</a>
//             <Link href="/faq" className="nav-link">الأسئلة الشائعة</Link>

//             {/* Auth Section */}
//             {!user ? (
//               <>
//                 <Link
//                   href="/login"
//                   className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium"
//                 >
//                   <LogIn className="w-4 h-4" />
//                   تسجيل الدخول
//                 </Link>
//                 <Link
//                   href="/register"
//                   className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
//                 >
//                   <UserPlus className="w-4 h-4" />
//                   إنشاء حساب
//                 </Link>
//               </>
//             ) : (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Avatar className="cursor-pointer w-11 h-11">
//                     <AvatarImage src={user?.avatar} alt={user?.username} />
//                     <AvatarFallback className="bg-blue-600 text-white font-bold">
//                       {user?.username?.charAt(0)?.toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent
//                   align="end"
//                   side="bottom"
//                   sideOffset={6}
//                   position="popper"
//                   className="w-48 rounded-xl shadow-lg border border-gray-200 bg-white"
//                 >
//                   <DropdownMenuItem asChild>
//                     <Link href="/profile" className="flex items-center gap-2">
//                       <User className="w-4 h-4" /> الملف الشخصي
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     onClick={handleLogout}
//                     className="flex items-center gap-2 text-red-600 focus:text-red-600"
//                   >
//                     <LogOut className="w-4 h-4" /> تسجيل الخروج
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="text-gray-700 hover:text-blue-600 p-2"
//             >
//               {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
//             <div className="px-2 pt-2 pb-3 space-y-1">
//               <a href="#home" className="mobile-link">الرئيسية</a>
//               <a href="#about" className="mobile-link">من نحن</a>
//               <a href="#courses" className="mobile-link">الكورسات</a>
//               <a href="#methodology" className="mobile-link">منهجيتنا</a>

//               {!user ? (
//                 <>
//                   <Link href="/login" className="mobile-link flex gap-2">
//                     <LogIn className="w-4 h-4" /> تسجيل الدخول
//                   </Link>
//                   <Link
//                     href="/register"
//                     className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 justify-center"
//                   >
//                     <UserPlus className="w-4 h-4" /> إنشاء حساب
//                   </Link>
//                 </>
//               ) : (
//                 <>
//                   <Link href="/profile" className="mobile-link flex gap-2">
//                     <User className="w-4 h-4" /> الملف الشخصي
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-2 text-red-600 px-3 py-3 rounded-lg hover:bg-red-50 transition-all duration-300"
//                   >
//                     <LogOut className="w-4 h-4" /> تسجيل الخروج
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// };

// export default Navbar;
// 'use client';

// import {
//   BookOpen,
//   Menu,
//   X,
//   LogIn,
//   UserPlus,
//   User,
//   LogOut,
// } from "lucide-react";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useRouter } from "next/navigation";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { RootState } from "@/redux/store";
// import { getProfile, logoutUser } from "@/redux/slices/authSlice";

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const dispatch = useDispatch<any>();
//   const router = useRouter();
//   const { user } = useSelector((state: RootState) => state.auth);

//   useEffect(() => {
//   if (!user) {
//     dispatch(getProfile());
//   }
// }, [dispatch, user]);
//   const handleLogout = async () => {
//     await dispatch(logoutUser());
//     router.push("/login");
//   };

//   return (
//     <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
//       <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center space-x-3 space-x-reverse">
//             <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
//               <BookOpen className="w-6 h-6 text-white" />
//             </div>
//             <Link href="/">
//               <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 السيد الابي
//               </span>
//               <p className="text-sm text-gray-600 -mt-1">لتعليم اللغة العربية</p>
//             </Link>
//           </div>

//           {/* Desktop Menu */}
//           <div className="hidden md:flex items-center space-x-6 space-x-reverse">
//             <Link href="/" className="nav-link">الرئيسية</Link>
//             <a href="#about" className="nav-link">من نحن</a>
//             <a href="#courses" className="nav-link">الكورسات</a>
//             <a href="#methodology" className="nav-link">منهجيتنا</a>
//             <Link href="/faq" className="nav-link">الأسئلة الشائعة</Link>

//             {/* Auth Section */}
//             {!user ? (
//               <>
//                 <Link
//                   href="/login"
//                   className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium"
//                 >
//                   <LogIn className="w-4 h-4" />
//                   تسجيل الدخول
//                 </Link>
//                 <Link
//                   href="/register"
//                   className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
//                 >
//                   <UserPlus className="w-4 h-4" />
//                   إنشاء حساب
//                 </Link>
//               </>
//             ) : (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Avatar className="cursor-pointer w-11 h-11">
//                     <AvatarImage src={user?.avatar} alt={user?.username} />
//                     <AvatarFallback className="bg-blue-600 text-white font-bold">
//                       {user?.username?.charAt(0)?.toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent
//                   align="end"
//                   side="bottom"
//                   sideOffset={6}
//                   position="popper"
//                   className="w-48 rounded-xl shadow-lg border border-gray-200 bg-white"
//                 >
//                   <DropdownMenuItem asChild>
//                     <Link href="/profile" className="flex items-center gap-2">
//                       <User className="w-4 h-4" /> الملف الشخصي
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     onClick={handleLogout}
//                     className="flex items-center gap-2 text-red-600 focus:text-red-600"
//                   >
//                     <LogOut className="w-4 h-4" /> تسجيل الخروج
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="text-gray-700 hover:text-blue-600 p-2"
//             >
//               {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
//             <div className="px-2 pt-2 pb-3 space-y-1">
//               <a href="#home" className="mobile-link">الرئيسية</a>
//               <a href="#about" className="mobile-link">من نحن</a>
//               <a href="#courses" className="mobile-link">الكورسات</a>
//               <a href="#methodology" className="mobile-link">منهجيتنا</a>

//               {!user ? (
//                 <>
//                   <Link href="/login" className="mobile-link flex gap-2">
//                     <LogIn className="w-4 h-4" /> تسجيل الدخول
//                   </Link>
//                   <Link
//                     href="/register"
//                     className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 justify-center"
//                   >
//                     <UserPlus className="w-4 h-4" /> إنشاء حساب
//                   </Link>
//                 </>
//               ) : (
//                 <>
//                   <Link href="/profile" className="mobile-link flex gap-2">
//                     <User className="w-4 h-4" /> الملف الشخصي
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-2 text-red-600 px-3 py-3 rounded-lg hover:bg-red-50 transition-all duration-300"
//                   >
//                     <LogOut className="w-4 h-4" /> تسجيل الخروج
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// };

// export default Navbar;

// 'use client';

// import {
//   BookOpen,
//   Menu,
//   X,
//   LogIn,
//   UserPlus,
//   User,
//   LogOut,
//   Bell, // ← أضف هذا الاستيراد
// } from "lucide-react";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useRouter } from "next/navigation";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { RootState } from "@/redux/store";
// import { getProfile, logoutUser } from "@/redux/slices/authSlice";
// import NotificationBell from "@/components/NotificationBell";

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const dispatch = useDispatch<any>();
//   const router = useRouter();
//   const { user } = useSelector((state: RootState) => state.auth);

//   useEffect(() => {
//     if (!user) {
//       dispatch(getProfile());
//     }
//   }, [dispatch, user]);

//   const handleLogout = async () => {
//     await dispatch(logoutUser());
//     router.push("/login");
//   };

//   return (
//     <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
//       <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center space-x-3 space-x-reverse">
//             <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
//               <BookOpen className="w-6 h-6 text-white" />
//             </div>
//             <Link href="/">
//               <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 السيد الابي
//               </span>
//               <p className="text-sm text-gray-600 -mt-1">لتعليم اللغة العربية</p>
//             </Link>
//           </div>

//           {/* Desktop Menu */}
//           <div className="hidden md:flex items-center space-x-4 space-x-reverse">
//             <Link href="/" className="nav-link">الرئيسية</Link>
//             <a href="#about" className="nav-link">من نحن</a>
//             <a href="#courses" className="nav-link">الكورسات</a>
//             <a href="#methodology" className="nav-link">منهجيتنا</a>
//             <Link href="/faq" className="nav-link">الأسئلة الشائعة</Link>

//             {/* Auth Section */}
//             {!user ? (
//               <>
//                 <Link
//                   href="/login"
//                   className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium"
//                 >
//                   <LogIn className="w-4 h-4" />
//                   تسجيل الدخول
//                 </Link>
//                 <Link
//                   href="/register"
//                   className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
//                 >
//                   <UserPlus className="w-4 h-4" />
//                   إنشاء حساب
//                 </Link>
//               </>
//             ) : (
//               <div className="flex items-center space-x-3 space-x-reverse">
//                 {/* Notification Bell - Only show for logged-in users */}
//                 <NotificationBell />
                
//                 {/* User Avatar Dropdown */}
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Avatar className="cursor-pointer w-11 h-11 border-2 border-gray-200 hover:border-blue-500 transition-colors">
//                       <AvatarImage src={user?.avatar} alt={user?.username} />
//                       <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
//                         {user?.username?.charAt(0)?.toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent
//                     align="end"
//                     className="w-48 rounded-xl shadow-lg border border-gray-200 bg-white"
//                   >
//                     <DropdownMenuItem asChild>
//                       <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
//                         <User className="w-4 h-4" /> 
//                         <span>الملف الشخصي</span>
//                       </Link>
//                     </DropdownMenuItem>
                    
//                     {/* Show admin links for teachers/admins */}
//                     {(user?.role === 'teacher' || user?.role === 'admin') && (
//                       <>
//                         <DropdownMenuItem asChild>
//                           <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
//                             <BookOpen className="w-4 h-4" />
//                             <span>لوحة التحكم</span>
//                           </Link>
//                         </DropdownMenuItem>
//                         <DropdownMenuItem asChild>
//                           <Link href="/admin/notifications" className="flex items-center gap-2 cursor-pointer">
//                             <Bell className="w-4 h-4" />
//                             <span>جميع الإشعارات</span>
//                           </Link>
//                         </DropdownMenuItem>
//                       </>
//                     )}
                    
//                     <DropdownMenuItem
//                       onClick={handleLogout}
//                       className="flex items-center gap-2 text-red-600 cursor-pointer"
//                     >
//                       <LogOut className="w-4 h-4" /> 
//                       <span>تسجيل الخروج</span>
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="md:hidden flex items-center space-x-2 space-x-reverse">
//             {/* Show notification bell in mobile for logged-in users */}
//             {user && (
//               <div className="mr-2">
//                 <NotificationBell />
//               </div>
//             )}
            
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="text-gray-700 hover:text-blue-600 p-2"
//             >
//               {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
//             <div className="px-2 pt-2 pb-3 space-y-1">
//               <Link href="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
//               <a href="#about" className="mobile-link">من نحن</a>
//               <a href="#courses" className="mobile-link">الكورسات</a>
//               <a href="#methodology" className="mobile-link">منهجيتنا</a>

//               {!user ? (
//                 <>
//                   <Link 
//                     href="/login" 
//                     className="mobile-link flex gap-2"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <LogIn className="w-4 h-4" /> تسجيل الدخول
//                   </Link>
//                   <Link
//                     href="/register"
//                     className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 justify-center"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <UserPlus className="w-4 h-4" /> إنشاء حساب
//                   </Link>
//                 </>
//               ) : (
//                 <>
//                   {/* Mobile notification link */}
//                   <Link 
//                     href="/admin/notifications" 
//                     className="mobile-link flex gap-2"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <Bell className="w-4 h-4" /> الإشعارات
//                   </Link>
                  
//                   {/* Show dashboard link for teachers/admins */}
//                   {(user?.role === 'teacher' || user?.role === 'admin') && (
//                     <Link 
//                       href="/dashboard" 
//                       className="mobile-link flex gap-2"
//                       onClick={() => setIsMenuOpen(false)}
//                     >
//                       <BookOpen className="w-4 h-4" /> لوحة التحكم
//                     </Link>
//                   )}
                  
//                   <Link 
//                     href="/profile" 
//                     className="mobile-link flex gap-2"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <User className="w-4 h-4" /> الملف الشخصي
//                   </Link>
//                   <button
//                     onClick={() => {
//                       handleLogout();
//                       setIsMenuOpen(false);
//                     }}
//                     className="w-full flex items-center gap-2 text-red-600 px-3 py-3 rounded-lg hover:bg-red-50 transition-all duration-300"
//                   >
//                     <LogOut className="w-4 h-4" /> تسجيل الخروج
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// };

// export default Navbar;
'use client';

import {
  BookOpen,
  Menu,
  X,
  LogIn,
  UserPlus,
  User,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Home,
  BookText,
  Users,
  Settings,
  Phone
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RootState, AppDispatch } from "@/redux/store";
import { logoutUser, getProfile } from "@/redux/slices/authSlice";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    if (!user) {
      // Try to get user profile if no user in state but might be logged in
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setIsMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'parent':
        return '/parent/dashboard';
      case 'student':
        return '/student/videos';
      default:
        return '/dashboard';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return "لوحة التحكم";
    switch (user.role) {
      case 'admin':
        return 'لوحة الأدمن';
      case 'parent':
        return 'لوحة ولي الأمر';
      case 'student':
        return 'لوحة الطالب';
      default:
        return 'لوحة التحكم';
    }
  };

  const getRoleIcon = () => {
    if (!user) return <User className="w-4 h-4" />;
    switch (user.role) {
      case 'admin':
        return <Settings className="w-4 h-4" />;
      case 'parent':
        return <Users className="w-4 h-4" />;
      case 'student':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/courses", label: "الكورسات", icon: BookText },
    { href: "/about", label: "من نحن", icon: Users },
    { href: "/faq", label: "الأسئلة الشائعة", icon: BookOpen },
    { href: "/contact", label: "اتصل بنا", icon: Phone },
  ];

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white/90 backdrop-blur-sm shadow-md'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-5 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <Link href="/" className="group">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                السيد الابي
              </span>
              <p className="text-xs text-gray-500 -mt-1 group-hover:text-gray-600 transition-colors duration-300">
                لتعليم اللغة العربية
              </p>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 space-x-reverse">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 border border-blue-100 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-3 space-x-reverse">
            {!user ? (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                  >
                    <LogIn className="w-4 h-4" />
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
                    <UserPlus className="w-4 h-4" />
                    إنشاء حساب
                  </Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                        {getRoleIcon()}
                        {user.role}
                      </p>
                    </div>
                    <Avatar className="w-10 h-10 border-2 border-blue-100 shadow-sm">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                        {user.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64 rounded-2xl shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md p-2"
                >
                  <DropdownMenuLabel className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                          {user.username?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-right">
                        <p className="font-semibold text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500 capitalize flex items-center gap-1 justify-end">
                          {getRoleIcon()}
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <div className="p-1">
                    <DropdownMenuItem asChild className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                      <Link href={getDashboardLink()} className="w-full">
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">{getDashboardLabel()}</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                      <Link href="/profile" className="w-full">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">الملف الشخصي</span>
                      </Link>
                    </DropdownMenuItem>

                    {user.role === 'student' && (
                      <>
                        <DropdownMenuSeparator className="my-1" />
                        <div className="px-3 py-2">
                          <p className="text-xs font-medium text-gray-500 mb-2">الطالب</p>
                          <DropdownMenuItem asChild className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                            <Link href="/student/courses" className="w-full text-sm">
                              <BookText className="w-4 h-4 text-green-600" />
                              <span className="text-gray-700">كورساتي</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                            <Link href="/student/progress" className="w-full text-sm">
                              <GraduationCap className="w-4 h-4 text-orange-600" />
                              <span className="text-gray-700">تقدمي</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                            <Link href="/student/exams" className="w-full text-sm">
                              <BookOpen className="w-4 h-4 text-purple-600" />
                              <span className="text-gray-700">اختباراتي</span>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </>
                    )}
                  </div>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-red-50 transition-colors duration-200 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 animate-in slide-in-from-top duration-300">
            <div className="px-2 pt-2 pb-4 space-y-1">
              {/* Mobile Navigation Links */}
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 border border-blue-100'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                {!user ? (
                  <>
                    <Link 
                      href="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <LogIn className="w-4 h-4" />
                      تسجيل الدخول
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium mx-2 mt-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      إنشاء حساب
                    </Link>
                  </>
                ) : (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                            {user.username?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-right">
                          <p className="font-semibold text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500 capitalize flex items-center gap-1 justify-end">
                            {getRoleIcon()}
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Links */}
                    <Link 
                      href={getDashboardLink()} 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {getDashboardLabel()}
                    </Link>

                    <Link 
                      href="/profile" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      الملف الشخصي
                    </Link>

                    {/* Student Specific Links */}
                    {user.role === 'student' && (
                      <div className="pl-4 space-y-1">
                        <Link 
                          href="/student/courses" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <BookText className="w-4 h-4" />
                          كورساتي
                        </Link>
                        <Link 
                          href="/student/progress" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-orange-600 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <GraduationCap className="w-4 h-4" />
                          تقدمي
                        </Link>
                        <Link 
                          href="/student/exams" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-purple-600 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <BookOpen className="w-4 h-4" />
                          اختباراتي
                        </Link>
                      </div>
                    )}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200 mt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;