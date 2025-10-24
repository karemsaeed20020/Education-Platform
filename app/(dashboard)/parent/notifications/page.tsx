'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Trash2, Filter, Bell, Send, MessageCircle, Users } from 'lucide-react';
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

export default function ParentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [messageToAdmin, setMessageToAdmin] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchNotifications();
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

  const sendMessageToAdmin = async () => {
    if (!messageToAdmin.subject || !messageToAdmin.message) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/notifications/parent/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(messageToAdmin)
      });

      if (response.ok) {
        toast.success('تم إرسال الرسالة بنجاح للمشرفين');
        setMessageToAdmin({ subject: '', message: '' });
      } else {
        toast.error('فشل في إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('فشل في إرسال الرسالة');
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
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

  const getNotificationType = (type: string) => {
    const types: { [key: string]: string } = {
      'child_exam_result': 'نتيجة ابن',
      'child_attendance': 'حضور ابن',
      'parent_announcement': 'إعلان',
      'parent_message': 'رسالة',
      'admin_message': 'رسالة مشرف',
      'system_alert': 'تنبيه نظام'
    };
    return types[type] || type;
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
          <h1 className="text-3xl font-bold text-gray-900">إشعارات ولي الأمر</h1>
          <p className="text-gray-600 mt-2">إشعارات عن أبنائك ورسائلك</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Send Message to Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            إرسال رسالة للمشرفين
          </CardTitle>
          <CardDescription>
            يمكنك إرسال استفساراتك أو مشاكلك المتعلقة بأبنائك للمشرفين
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="موضوع الرسالة"
            value={messageToAdmin.subject}
            onChange={(e) => setMessageToAdmin(prev => ({ ...prev, subject: e.target.value }))}
          />
          <Textarea
            placeholder="نص الرسالة"
            rows={4}
            value={messageToAdmin.message}
            onChange={(e) => setMessageToAdmin(prev => ({ ...prev, message: e.target.value }))}
          />
          <Button onClick={sendMessageToAdmin} className="w-full">
            <Send className="h-4 w-4 ml-2" />
            إرسال للمشرفين
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية الإشعارات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الإشعارات</SelectItem>
                <SelectItem value="unread">غير مقروء فقط</SelectItem>
                <SelectItem value="read">مقروء فقط</SelectItem>
              </SelectContent>
            </Select>
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
                <p className="text-gray-500">لم تستلم أي إشعارات حتى الآن</p>
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
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          {getNotificationType(notification.type)}
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
                    
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification._id)}
                        className="h-8 w-8 p-0 ml-4"
                        title="وضع علامة مقروء"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
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