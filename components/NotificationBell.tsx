// // components/NotificationBell.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Bell, Check, Trash2, Eye } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { toast } from 'sonner';
// import Link from 'next/link';

// interface Notification {
//   _id: string;
//   title: string;
//   message: string;
//   type: string;
//   isRead: boolean;
//   priority: string;
//   actionUrl?: string;
//   createdAt: string;
// }

// export default function NotificationBell() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchNotifications();
//     // Poll for new notifications every 30 seconds
//     const interval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/notifications?limit=10', {
//         credentials: 'include'
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         if (data.status === 'success') {
//           setNotifications(data.data.notifications);
//           setUnreadCount(data.data.unreadCount);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//     }
//   };

//   const markAsRead = async (notificationId: string) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
//         method: 'PATCH',
//         credentials: 'include'
//       });

//       if (response.ok) {
//         setNotifications(prev => 
//           prev.map(notif => 
//             notif._id === notificationId ? { ...notif, isRead: true } : notif
//           )
//         );
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }
//     } catch (error) {
//       console.error('Error marking notification as read:', error);
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/notifications/read-all', {
//         method: 'PATCH',
//         credentials: 'include'
//       });

//       if (response.ok) {
//         setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
//         setUnreadCount(0);
//         toast.success('تم وضع علامة مقروء على جميع الإشعارات');
//       }
//     } catch (error) {
//       console.error('Error marking all as read:', error);
//       toast.error('فشل في تحديث الإشعارات');
//     }
//   };

//   const deleteNotification = async (notificationId: string) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
//         method: 'DELETE',
//         credentials: 'include'
//       });

//       if (response.ok) {
//         setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
//         toast.success('تم حذف الإشعار');
//       }
//     } catch (error) {
//       console.error('Error deleting notification:', error);
//       toast.error('فشل في حذف الإشعار');
//     }
//   };

//   const getTypeIcon = (type: string) => {
//     switch (type) {
//       case 'exam_submitted': return '📝';
//       case 'exam_created': return '🆕';
//       case 'student_registered': return '👤';
//       case 'system_alert': return '⚠️';
//       case 'grade_updated': return '📊';
//       case 'deadline_approaching': return '⏰';
//       default: return '🔔';
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
//     if (diffInHours < 1) {
//       return 'الآن';
//     } else if (diffInHours < 24) {
//       return `منذ ${diffInHours} ساعة`;
//     } else {
//       return date.toLocaleDateString('ar-EG');
//     }
//   };

//   return (
//     <div className="relative">
//       <Button
//         variant="ghost"
//         size="icon"
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative"
//       >
//         <Bell className="h-5 w-5" />
//         {unreadCount > 0 && (
//           <Badge 
//             variant="destructive" 
//             className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
//           >
//             {unreadCount > 9 ? '9+' : unreadCount}
//           </Badge>
//         )}
//       </Button>

//       {isOpen && (
//         <Card className="absolute right-0 top-12 w-80 sm:w-96 z-50 shadow-lg border-2">
//           <CardHeader className="pb-3">
//             <div className="flex items-center justify-between">
//               <CardTitle className="text-lg">الإشعارات</CardTitle>
//               <div className="flex gap-2">
//                 {unreadCount > 0 && (
//                   <Button variant="outline" size="sm" onClick={markAllAsRead}>
//                     <Check className="h-4 w-4 ml-2" />
//                     تعيين الكل كمقروء
//                   </Button>
//                 )}
//                 <Link href="/admin/notifications">
//                   <Button variant="outline" size="sm">
//                     <Eye className="h-4 w-4 ml-2" />
//                     عرض الكل
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//             <CardDescription>
//               {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'لا توجد إشعارات جديدة'}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="p-0">
//             <ScrollArea className="h-80">
//               {notifications.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
//                   <p>لا توجد إشعارات</p>
//                 </div>
//               ) : (
//                 <div className="space-y-2 p-2">
//                   {notifications.map((notification) => (
//                     <div
//                       key={notification._id}
//                       className={`p-3 rounded-lg border ${
//                         notification.isRead 
//                           ? 'bg-white' 
//                           : 'bg-blue-50 border-blue-200'
//                       }`}
//                     >
//                       <div className="flex items-start gap-3">
//                         <div className="text-lg flex-shrink-0">
//                           {getTypeIcon(notification.type)}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 mb-1">
//                             <p className={`text-sm font-medium ${
//                               notification.isRead ? 'text-gray-700' : 'text-gray-900'
//                             }`}>
//                               {notification.title}
//                             </p>
//                           </div>
//                           <p className="text-sm text-gray-600 mb-2 line-clamp-2">
//                             {notification.message}
//                           </p>
//                           <div className="flex items-center justify-between">
//                             <span className="text-xs text-gray-500">
//                               {formatDate(notification.createdAt)}
//                             </span>
//                             <div className="flex gap-1">
//                               {!notification.isRead && (
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => markAsRead(notification._id)}
//                                   className="h-6 w-6 p-0"
//                                 >
//                                   <Check className="h-3 w-3" />
//                                 </Button>
//                               )}
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => deleteNotification(notification._id)}
//                                 className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
//                               >
//                                 <Trash2 className="h-3 w-3" />
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </ScrollArea>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }