/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { Mail, User, MessageSquare, CheckCircle2, Loader2, AlertCircle, Send, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  replied: boolean;
  createdAt: string;
}

interface ReplyData {
  subject: string;
  message: string;
}

const ContactMessagesPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replying, setReplying] = useState<string | null>(null);
  const [replyData, setReplyData] = useState<ReplyData>({
    subject: 'رد على استفسارك',
    message: ''
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  // ✅ تحميل الرسائل
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`فشل تحميل الرسائل: ${res.status}`);
      }

      const data = await res.json();
      setContacts(data.data || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'حدث خطأ أثناء تحميل الرسائل');
      toast.error('فشل تحميل رسائل التواصل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // ✅ فتح نموذج الرد
  const openReplyForm = (contact: Contact) => {
    setReplying(contact._id);
    setReplyData({
      subject: `رد على استفسارك - ${contact.name}`,
      message: `عزيزي/عزيزتي ${contact.name},\n\nشكراً لتواصلك معنا.\n\nبخصوص استفسارك:\n"${contact.message}"\n\n`
    });
  };

  // ✅ إغلاق نموذج الرد
  const closeReplyForm = () => {
    setReplying(null);
    setReplyData({
      subject: 'رد على استفسارك',
      message: ''
    });
  };

  // ✅ إرسال الرد
  const handleSendReply = async (contactId: string, contactEmail: string) => {
    if (!replyData.message.trim()) {
      toast.error('يرجى كتابة رسالة الرد');
      return;
    }

    try {
      setReplying(contactId + '-sending');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          contactId,
          to: contactEmail,
          subject: replyData.subject,
          message: replyData.message
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `فشل في إرسال الرد: ${response.status}`);
      }

      // تحديث حالة الرسالة إلى "تم الرد"
      setContacts(prev => prev.map(contact =>
        contact._id === contactId
          ? { ...contact, replied: true }
          : contact
      ));

      toast.success('تم إرسال الرد بنجاح ✅');
      closeReplyForm();

    } catch (err: any) {
      console.error('Reply error:', err);
      toast.error(err.message || 'حدث خطأ أثناء إرسال الرد');
    } finally {
      setReplying(null);
    }
  };

  // ✅ حذف رسالة مع تنبيه
  const handleDeleteMessage = async (contactId: string) => {
    const confirmed = window.confirm('هل أنت متأكد من حذف هذه الرسالة؟');
    if (!confirmed) return;

    try {
      setDeleting(contactId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/${contactId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `فشل في حذف الرسالة: ${response.status}`);
      }

      // إزالة الرسالة من القائمة
      setContacts(prev => prev.filter(contact => contact._id !== contactId));
      toast.success('تم حذف الرسالة بنجاح ✅');

    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message || 'حدث خطأ أثناء حذف الرسالة');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <Mail className="w-6 h-6 text-blue-600" />
        رسائل التواصل
      </h1>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{contacts.length}</div>
            <div className="text-sm text-blue-600">إجمالي الرسائل</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {contacts.filter(c => c.replied).length}
            </div>
            <div className="text-sm text-green-600">تم الرد عليها</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">
              {contacts.filter(c => !c.replied).length}
            </div>
            <div className="text-sm text-orange-600">بحاجة للرد</div>
          </CardContent>
        </Card>
      </div>

      {/* تحميل */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
          <span className="mr-2 text-gray-600">جاري تحميل الرسائل...</span>
        </div>
      )}

      {/* خطأ */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* لا توجد رسائل */}
      {!loading && !error && contacts.length === 0 && (
        <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg">لا توجد رسائل تواصل حالياً</p>
        </div>
      )}

      {/* عرض الرسائل */}
      <div className="grid gap-4 md:grid-cols-2">
        {contacts.map((msg) => (
          <Card
            key={msg._id}
            className={`transition-all border ${
              msg.replied 
                ? 'border-green-400 bg-green-50' 
                : 'border-orange-300 bg-orange-50'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-blue-500" />
                  {msg.name}
                </CardTitle>
                {!msg.replied && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50 text-xs"
                    onClick={() => handleDeleteMessage(msg._id)}
                    disabled={deleting === msg._id}
                  >
                    {deleting === msg._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    حذف
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-500">{msg.email}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-400 mt-1" />
                <p className="text-gray-700 leading-relaxed break-words">{msg.message}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(msg.createdAt).toLocaleString('ar-EG')}</span>
                {msg.replied ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" /> تم الرد
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() => openReplyForm(msg)}
                  >
                    الرد
                  </Button>
                )}
              </div>

              {/* نموذج الرد */}
              {replying === msg._id && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">إرسال رد</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={closeReplyForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الموضوع
                      </label>
                      <input
                        type="text"
                        value={replyData.subject}
                        onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        نص الرد
                      </label>
                      <textarea
                        value={replyData.message}
                        onChange={(e) => setReplyData(prev => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        placeholder="اكتب رسالة الرد هنا..."
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSendReply(msg._id, msg.email)}
                        disabled={replying === msg._id + '-sending'}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {replying === msg._id + '-sending' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {replying === msg._id + '-sending' ? 'جاري الإرسال...' : 'إرسال الرد'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={closeReplyForm}
                        disabled={replying === msg._id + '-sending'}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContactMessagesPage;