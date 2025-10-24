'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Trash2, Filter, Bell, Send, Users, User, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  priority: string;
  sender: {
    _id: string;
    username: string;
    role: string;
  };
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  grade?: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [messageToStudents, setMessageToStudents] = useState({
    recipientType: 'all',
    specificStudent: '',
    specificGrade: '',
    title: '',
    message: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchNotifications();
    fetchStudents();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setNotifications(data.data.notifications);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('فشل في تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/students', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setStudents(data.data.students);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        toast.success('تم وضع علامة مقروء');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('فشل في تحديث الإشعار');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        toast.success('تم وضع علامة مقروء على جميع الإشعارات');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('فشل في تحديث الإشعارات');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        toast.success('تم حذف الإشعار');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('فشل في حذف الإشعار');
    }
  };

  const sendMessageToStudents = async () => {
    if (!messageToStudents.title || !messageToStudents.message) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/notifications/admin/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(messageToStudents)
      });

      if (response.ok) {
        toast.success('تم إرسال الإشعار بنجاح');
        setMessageToStudents({
          recipientType: 'all',
          specificStudent: '',
          specificGrade: '',
          title: '',
          message: '',
          priority: 'medium'
        });
      } else {
        toast.error('فشل في إرسال الإشعار');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('فشل في إرسال الإشعار');
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread' && notif.isRead) return false;
    if (filter === 'read' && !notif.isRead) return false;
    if (typeFilter !== 'all' && notif.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'support_request': return '🆘';
      case 'problem_report': return '⚠️';
      case 'exam_submitted': return '📝';
      case 'student_registered': return '👤';
      default: return '🔔';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'support_request': return 'طلب دعم';
      case 'problem_report': return 'تبليغ مشكلة';
      case 'exam_submitted': return 'تقديم اختبار';
      case 'student_registered': return 'طالب جديد';
      default: return 'إشعار';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الإشعارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الإشعارات</h1>
          <p className="text-gray-600 mt-2">إدارة جميع إشعارات النظام</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 ml-2" />
              تعيين الكل كمقروء
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
                <div className="text-sm text-gray-600">إجمالي الإشعارات</div>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
                <div className="text-sm text-gray-600">غير مقروء</div>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {notifications.length - unreadCount}
                </div>
                <div className="text-sm text-gray-600">مقروء</div>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.type === 'support_request').length}
                </div>
                <div className="text-sm text-gray-600">طلبات دعم</div>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Message to Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            إرسال إشعار للطلاب
          </CardTitle>
          <CardDescription>
            أرسل إشعارات للطلاب حسب الصف أو طالب معين أو جميع الطلاب
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              value={messageToStudents.recipientType} 
              onValueChange={(value) => setMessageToStudents(prev => ({ ...prev, recipientType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="نوع المستلم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الطلاب</SelectItem>
                <SelectItem value="grade">طلاب صف معين</SelectItem>
                <SelectItem value="student">طالب معين</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={messageToStudents.priority} 
              onValueChange={(value) => setMessageToStudents(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="أولوية الإشعار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="high">عالٍ</SelectItem>
                <SelectItem value="urgent">عاجل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {messageToStudents.recipientType === 'grade' && (
            <Select 
              value={messageToStudents.specificGrade} 
              onValueChange={(value) => setMessageToStudents(prev => ({ ...prev, specificGrade: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الصف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الصف الأول">الصف الأول</SelectItem>
                <SelectItem value="الصف الثاني">الصف الثاني</SelectItem>
                <SelectItem value="الصف الثالث">الصف الثالث</SelectItem>
                <SelectItem value="الصف الرابع">الصف الرابع</SelectItem>
                <SelectItem value="الصف الخامس">الصف الخامس</SelectItem>
                <SelectItem value="الصف السادس">الصف السادس</SelectItem>
              </SelectContent>
            </Select>
          )}

          {messageToStudents.recipientType === 'student' && (
            <Select 
              value={messageToStudents.specificStudent} 
              onValueChange={(value) => setMessageToStudents(prev => ({ ...prev, specificStudent: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الطالب" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student._id} value={student._id}>
                    {student.username} - {student.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Input
            placeholder="عنوان الإشعار"
            value={messageToStudents.title}
            onChange={(e) => setMessageToStudents(prev => ({ ...prev, title: e.target.value }))}
          />
          <Textarea
            placeholder="نص الإشعار"
            rows={4}
            value={messageToStudents.message}
            onChange={(e) => setMessageToStudents(prev => ({ ...prev, message: e.target.value }))}
          />
          <Button onClick={sendMessageToStudents} className="w-full">
            <Send className="h-4 w-4 ml-2" />
            إرسال الإشعار
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-48">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="حالة الإشعار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الإشعارات</SelectItem>
                  <SelectItem value="unread">غير مقروء فقط</SelectItem>
                  <SelectItem value="read">مقروء فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الإشعار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="support_request">طلبات دعم</SelectItem>
                  <SelectItem value="problem_report">تبليغ مشاكل</SelectItem>
                  <SelectItem value="exam_submitted">تقديم اختبارات</SelectItem>
                  <SelectItem value="student_registered">طلاب جدد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>الإشعارات الواردة</CardTitle>
          <CardDescription>
            {filteredNotifications.length} إشعار
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
                <p className="text-gray-500">لم يتم استلام أي إشعارات حتى الآن</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    notification.isRead
                      ? 'bg-white border-gray-200'
                      : 'bg-blue-50 border-blue-300 shadow-sm'
                  } hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{getTypeIcon(notification.type)}</span>
                        <h3 className={`font-semibold ${
                          notification.isRead ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority === 'urgent' ? 'عاجل' :
                           notification.priority === 'high' ? 'عالٍ' :
                           notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                        <Badge variant="secondary">
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            جديد
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>من: {notification.sender?.username || 'النظام'}</span>
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification._id)}
                          className="h-8 w-8 p-0"
                          title="وضع علامة مقروء"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification._id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        title="حذف الإشعار"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}