/* eslint-disable @typescript-eslint/no-explicit-any */
// app/parent/admin-chat/page.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Send, 
  Search,
  RefreshCw,
  Building,
  Shield,
  AlertCircle,
  Users
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast, { Toaster } from 'react-hot-toast';
import io, { Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { api } from '@/redux/slices/authSlice'; // ✅ Import axios instance

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  profilePicture?: string;
  grade?: string;
  phone?: string;
}

interface Message {
  _id: string;
  sender: User;
  receiver: User;
  message: string;
  messageType: string;
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: Record<string, number>;
  updatedAt: string;
}

export default function ParentAdminChatPage() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // التحقق من أن المستخدم ولي أمر
  useEffect(() => {
    if (user && user.role !== 'parent') {
      router.push('/unauthorized');
      return;
    }
  }, [user, router]);

  // Socket initialization
  useEffect(() => {
    if (!user || !token) return;

    console.log('🔌 Initializing socket connection for parent...');
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      auth: {
        token: token
      }
    });

    if (user._id) {
      socketRef.current.emit('join', user._id);
      console.log('✅ Parent joined socket room:', user._id);
    }

    socketRef.current.on('newMessage', (message: Message) => {
      console.log('📨 New message received:', message);
      
      if (selectedAdmin && 
          (message.sender._id === selectedAdmin._id || message.receiver._id === selectedAdmin._id)) {
        setMessages(prev => [...prev, message]);
        toast.success(`رسالة جديدة من ${message.sender.username}`);
      }
      
      fetchConversations();
    });

    socketRef.current.on('userTyping', (data) => {
      if (data.userId === selectedAdmin?._id) {
        setIsTyping(data.isTyping);
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      toast.error('فشل الاتصال بالخادم');
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected successfully');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket disconnected');
      }
    };
  }, [user, token, selectedAdmin]);

  // تحميل البيانات الأولية
  useEffect(() => {
    if (user && user.role === 'parent') {
      console.log('🎯 Loading initial data for parent...');
      fetchConversations();
      fetchAdmins();
    }
  }, [user]);

  // عند تغيير الإداري المحدد، جلب الرسائل
  useEffect(() => {
    if (selectedAdmin) {
      console.log('🎯 Selected admin changed, fetching messages...');
      fetchMessages(selectedAdmin._id);
    } else {
      setMessages([]);
    }
  }, [selectedAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Fixed: Use api instance for conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching parent conversations...');
      
      // Try multiple endpoints
      const endpoints = [
        '/api/chat/parent/conversations',
        '/api/chat/conversations'
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          response = await api.get(endpoint);
          console.log(`✅ Success with endpoint: ${endpoint}`, response.data);
          break;
        } catch (err: any) {
          lastError = err;
          console.log(`❌ Failed with endpoint: ${endpoint}`, err.response?.data);
          continue;
        }
      }

      if (!response) {
        throw new Error(lastError?.response?.data?.message || 'لا يمكن تحميل المحادثات');
      }

      if (response.data.status === 'success') {
        const allConversations = response.data.data?.conversations || [];
        
        // Filter to show only conversations with admins
        const adminConversations = allConversations.filter((conv: Conversation) => 
          conv.participants.some(p => p._id !== user?._id && p.role === 'admin')
        );
        
        setConversations(adminConversations);
        console.log('✅ Admin conversations loaded:', adminConversations.length);
      } else {
        throw new Error(response.data.message || 'فشل في تحميل المحادثات');
      }
    } catch (error: any) {
      console.error('❌ Error fetching conversations:', error);
      const message = error.response?.data?.message || error.message || 'حدث خطأ في تحميل المحادثات';
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Fixed: Use api instance for admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching admins...');
      
      // Try multiple endpoints
      const endpoints = [
        '/api/chat/parent/admins',
        '/api/chat/users',
        '/api/users/admins'
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          response = await api.get(endpoint);
          console.log(`✅ Success with endpoint: ${endpoint}`, response.data);
          break;
        } catch (err: any) {
          lastError = err;
          console.log(`❌ Failed with endpoint: ${endpoint}`, err.response?.data);
          continue;
        }
      }

      if (!response) {
        throw new Error(lastError?.response?.data?.message || 'لا يمكن تحميل قائمة الإدارة');
      }

      let adminsList: User[] = [];

      if (response.data.status === 'success') {
        // Extract admins from different response structures
        if (response.data.data?.admins) {
          adminsList = response.data.data.admins;
        } else if (response.data.data?.users) {
          adminsList = response.data.data.users.filter((user: User) => user.role === 'admin');
        } else if (response.data.admins) {
          adminsList = response.data.admins;
        } else if (Array.isArray(response.data.data)) {
          adminsList = response.data.data.filter((user: User) => user.role === 'admin');
        }
        
        console.log('✅ Admins loaded:', adminsList.length);
        setAdmins(adminsList);
        
        // Auto-select first admin
        if (adminsList.length > 0 && !selectedAdmin) {
          console.log('🚀 Auto-selecting first admin:', adminsList[0].username);
          setSelectedAdmin(adminsList[0]);
        } else if (adminsList.length === 0) {
          console.log('⚠️ No admins found!');
          toast.error('لا توجد إدارة متاحة للدردشة حالياً');
        }
      } else {
        throw new Error(response.data.message || 'فشل في تحميل قائمة الإدارة');
      }
    } catch (error: any) {
      console.error('❌ Error fetching admins:', error);
      const message = error.response?.data?.message || error.message || 'حدث خطأ في تحميل قائمة الإدارة';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed: Use api instance for messages
  const fetchMessages = async (userId: string) => {
    try {
      setMessagesLoading(true);
      console.log(`🔄 Fetching messages for admin: ${userId}`);
      
      const response = await api.get(`/api/chat/conversations/${userId}`);
      console.log('📡 Messages response:', response.data);
      
      if (response.data.status === 'success') {
        const msgs = response.data.data?.messages || [];
        console.log(`✅ Loaded ${msgs.length} messages`);
        setMessages(msgs);
      } else {
        console.warn('⚠️ No messages data found');
        setMessages([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching messages:', error);
      const message = error.response?.data?.message || 'حدث خطأ في تحميل الرسائل';
      toast.error(message);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleAdminClick = (admin: User) => {
    console.log('👆 Admin clicked:', admin.username);
    setSelectedAdmin(admin);
  };

  // ✅ Fixed: Use api instance for sending messages
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedAdmin) {
      console.log('❌ Cannot send message - missing data');
      toast.error('الرسالة مطلوبة');
      return;
    }

    try {
      console.log('📤 Sending message to admin:', selectedAdmin.username);

      const messageData = {
        receiverId: selectedAdmin._id,
        message: newMessage.trim()
      };

      // إرسال عبر Socket
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', messageData);
        console.log('✅ Message sent via socket');
      }

      // إرسال إلى API
      const response = await api.post('/api/chat/messages', messageData);
      console.log('📡 Send message response:', response.data);

      if (response.data.status === 'success') {
        if (response.data.data && response.data.data.message) {
          setMessages(prev => [...prev, response.data.data.message]);
        }
        
        setNewMessage('');
        fetchConversations();
        toast.success('تم إرسال الرسالة');
      } else {
        toast.error(response.data.message || 'حدث خطأ في إرسال الرسالة');
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      const message = error.response?.data?.message || 'حدث خطأ في إرسال الرسالة';
      toast.error(message);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socketRef.current && selectedAdmin) {
      socketRef.current.emit('typing', {
        receiverId: selectedAdmin._id,
        isTyping
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      handleTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (e.target.value.trim()) {
      handleTyping(true);
    } else {
      handleTyping(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations();
    fetchAdmins();
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount[user?._id || ''] || 0;
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '--:--';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'تاريخ غير معروف';
    }
  };

  const quickMessages = [
    "أريد الاستفسار عن مستوى ابني/ابنتي",
    "هل يمكنني تحديد موعد لمقابلة؟",
    "لدي استفسار بخصوص الرسوم الدراسية",
    "أريد التبليغ عن غياب ابني/ابنتي",
    "استفسار بخصوص الأنشطة المدرسية",
    "مشكلة في النظام الإلكتروني"
  ];

  const handleQuickMessage = (message: string) => {
    setNewMessage(message);
  };

  if (!user || user.role !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">غير مصرح</h1>
          <p className="text-gray-600 mt-2">هذه الصفحة لأولياء الأمور فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <Building className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">التواصل مع الإدارة</h1>
              <p className="text-gray-600 mt-1">
                تواصل مباشر مع إدارة المدرسة
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full border-purple-200 hover:bg-purple-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-full shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600">الإداريون: {admins.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">المحادثات: {conversations.length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* الإداريون */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                  <Users className="h-4 w-4 text-purple-600" />
                  الإداريون
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {admins.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">لا يوجد إداريون</p>
                  </div>
                ) : (
                  admins.map((admin) => (
                    <div
                      key={admin._id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                        selectedAdmin?._id === admin._id 
                          ? 'bg-purple-50 border-purple-300 shadow-md' 
                          : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-sm'
                      }`}
                      onClick={() => handleAdminClick(admin)}
                    >
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={admin.profilePicture} />
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          <Shield className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">{admin.username}</h4>
                        <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* المحادثات السابقة */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  المحادثات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">لا توجد محادثات</p>
                    </div>
                  ) : (
                    conversations.map((conversation) => {
                      const adminUser = getOtherParticipant(conversation);
                      if (!adminUser) return null;

                      return (
                        <div
                          key={conversation._id}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                            selectedAdmin?._id === adminUser._id 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => handleAdminClick(adminUser)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={adminUser.profilePicture} />
                            <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                              <Shield className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-xs text-gray-800 truncate">
                                {adminUser.username}
                              </h5>
                              <span className="text-xs text-gray-500">
                                {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ''}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {conversation.lastMessage?.message || 'بدء محادثة جديدة'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <Card className="lg:col-span-3 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0 h-[600px] flex flex-col">
              {selectedAdmin ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-white shadow-lg">
                        <AvatarImage src={selectedAdmin.profilePicture} />
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                          <Shield className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{selectedAdmin.username}</h3>
                        <p className="text-sm text-gray-600">{selectedAdmin.email}</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-600 text-sm py-1 px-3 border-0">
                      <Shield className="h-3 w-3 ml-1" />
                      إدارة المدرسة
                    </Badge>
                  </div>

                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-white to-blue-50/30">
                    {messagesLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                        <p>جاري تحميل الرسائل...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <div className="max-w-md mx-auto">
                          <Building className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                          <h4 className="text-xl font-semibold text-gray-700 mb-3">مرحباً في التواصل مع الإدارة</h4>
                          <p className="text-gray-600 mb-6">
                            ابدأ محادثة مع إدارة المدرسة للاستفسارات والشكاوى
                          </p>
                          
                          {/* Quick Messages */}
                          <div className="space-y-3">
                            <p className="text-sm text-gray-500 mb-3">رسائل سريعة:</p>
                            {quickMessages.map((msg, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="w-full justify-start text-right text-sm h-auto py-3 px-4 hover:bg-blue-50 hover:border-blue-200"
                                onClick={() => handleQuickMessage(msg)}
                              >
                                {msg}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message._id}
                            className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md ${message.sender._id === user._id ? 'text-left' : 'text-right'}`}>
                              <div
                                className={`rounded-2xl px-4 py-3 shadow-sm ${
                                  message.sender._id === user._id
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{message.message}</p>
                                <p className={`text-xs mt-2 ${
                                  message.sender._id === user._id
                                    ? 'text-blue-100'
                                    : 'text-gray-500'
                                }`}>
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-6 border-t bg-white rounded-b-lg">
                    <div className="space-y-3">
                      <Textarea
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder="اكتب رسالتك لإدارة المدرسة هنا..."
                        className="min-h-[80px] resize-none rounded-xl border-gray-300 focus:border-blue-500"
                        disabled={messagesLoading}
                      />
                      <div className="flex justify-between items-center">
                        <Button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || messagesLoading}
                          className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-2 shadow-lg"
                        >
                          <Send className="h-4 w-4 ml-2" />
                          إرسال
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                  <div className="max-w-md text-center">
                    <Building className="h-24 w-24 mx-auto mb-6 text-purple-300" />
                    <h3 className="text-2xl font-bold text-gray-700 mb-4">التواصل مع إدارة المدرسة</h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      اختر مديراً من القائمة للبدء في التواصل
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}