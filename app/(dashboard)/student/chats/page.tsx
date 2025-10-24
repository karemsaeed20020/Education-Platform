'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Search,
  MoreVertical,
  GraduationCap,
  User,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast, { Toaster } from 'react-hot-toast';
import io, { Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  profilePicture?: string;
  grade?: string;
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

export default function StudentChatsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'chats' | 'teachers'>('teachers');
  const [isTyping, setIsTyping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Debug logs
  useEffect(() => {
    console.log('🔍 User:', user);
    console.log('🔍 Teachers:', teachers);
    console.log('🔍 Selected User:', selectedUser);
    console.log('🔍 Messages:', messages);
    console.log('🔍 Conversations:', conversations);
  }, [user, teachers, selectedUser, messages, conversations]);

  // التحقق من أن المستخدم طالب
  useEffect(() => {
    if (user && user.role !== 'student') {
      router.push('/unauthorized');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    // تهيئة Socket connection
    socketRef.current = io('http://localhost:5000', {
      withCredentials: true
    });

    // انضمام المستخدم إلى الغرفة
    if (user._id) {
      socketRef.current.emit('join', user._id);
      console.log('✅ Joined socket room:', user._id);
    }

    // استماع للرسائل الجديدة
    socketRef.current.on('newMessage', (message: Message) => {
      console.log('📨 New message received:', message);
      
      // إذا كانت الرسالة موجهة للمستخدم الحالي أو من المستخدم المحدد
      if (message.receiver._id === user._id || message.sender._id === selectedUser?._id) {
        setMessages(prev => [...prev, message]);
      }
      
      // تحديث قائمة المحادثات
      fetchConversations();
    });

    // استماع لحالة الكتابة
    socketRef.current.on('userTyping', (data) => {
      console.log('⌨️ Typing status:', data);
      if (data.userId === selectedUser?._id) {
        setIsTyping(data.isTyping);
      }
    });

    // استماع لأخطاء الاتصال
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
  }, [user, selectedUser]);

  // تحميل البيانات الأولية
  useEffect(() => {
    if (user && user.role === 'student') {
      console.log('🎯 Loading initial data...');
      fetchConversations();
      fetchTeachers();
    }
  }, [user]);

  // تحديث البيانات عند تغيير القسم النشط
  useEffect(() => {
    if (activeSection === 'chats') {
      fetchConversations();
    } else {
      fetchTeachers();
    }
  }, [activeSection]);

  // عند تغيير المستخدم المحدد، جلب الرسائل
  useEffect(() => {
    if (selectedUser) {
      console.log('🎯 Selected user changed, fetching messages...');
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching conversations...');
      
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost:5000/api/chat/conversations?t=${timestamp}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('📡 Conversations response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conversations data:', data);
        
        if (data.data && data.data.conversations) {
          setConversations(data.data.conversations);
        } else {
          console.warn('⚠️ No conversations data found');
          setConversations([]);
        }
      } else {
        console.error('❌ Failed to fetch conversations');
        toast.error('فشل في تحميل المحادثات');
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      toast.error('حدث خطأ في تحميل المحادثات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching teachers...');
      
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost:5000/api/chat/users?t=${timestamp}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('📡 Teachers response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Teachers API response:', data);
        
        if (data.data && data.data.users) {
          // تصفية المعلمين والإداريين فقط
          const teachersAndAdmins = data.data.users.filter((user: User) => 
            user.role === 'teacher' || user.role === 'admin'
          );
          console.log('👥 Filtered teachers/admins:', teachersAndAdmins);
          setTeachers(teachersAndAdmins);
          
          // إذا لم يكن هناك مستخدم محدد، اختيار أول معلم تلقائياً
          if (teachersAndAdmins.length > 0 && !selectedUser) {
            console.log('🚀 Auto-selecting first teacher from:', teachersAndAdmins);
            const firstTeacher = teachersAndAdmins[0];
            setSelectedUser(firstTeacher);
          }
        } else {
          console.error('❌ No users data in response');
          setTeachers([]);
        }
      } else {
        console.error('❌ Failed to fetch teachers');
        toast.error('فشل في تحميل قائمة المعلمين');
      }
    } catch (error) {
      console.error('❌ Error fetching teachers:', error);
      toast.error('حدث خطأ في تحميل قائمة المعلمين');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      setMessagesLoading(true);
      console.log(`🔄 Fetching messages for user: ${userId}`);
      
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost:5000/api/chat/conversations/${userId}?t=${timestamp}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('📡 Messages response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Messages data:', data);
        
        if (data.data && data.data.messages) {
          setMessages(data.data.messages);
          console.log(`✅ Loaded ${data.data.messages.length} messages`);
        } else {
          console.warn('⚠️ No messages data found');
          setMessages([]);
        }
      } else {
        console.error('❌ Failed to fetch messages');
        toast.error('فشل في تحميل الرسائل');
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      toast.error('حدث خطأ في تحميل الرسائل');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    console.log('👆 User clicked:', user);
    setSelectedUser(user);
    // سيتم تفعيل useEffect تلقائياً لجلب الرسائل
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) {
      console.log('❌ Cannot send message - missing data');
      return;
    }

    try {
      console.log('📤 Sending message:', newMessage, 'to:', selectedUser._id);

      const messageData = {
        receiverId: selectedUser._id,
        message: newMessage.trim()
      };

      // إرسال الرسالة عبر Socket للتواصل الفوري
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', messageData);
        console.log('✅ Message sent via socket');
      }

      // إرسال الرسالة إلى API للحفظ في قاعدة البيانات
      const response = await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(messageData)
      });

      console.log('📡 Send message response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message saved to database:', data);
        
        // إضافة الرسالة إلى القائمة مباشرة
        if (data.data && data.data.message) {
          setMessages(prev => [...prev, data.data.message]);
        }
        
        setNewMessage('');
        fetchConversations(); // تحديث قائمة المحادثات
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save message:', errorData);
        toast.error(errorData.message || 'حدث خطأ في إرسال الرسالة');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('حدث خطأ في إرسال الرسالة');
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socketRef.current && selectedUser) {
      socketRef.current.emit('typing', {
        receiverId: selectedUser._id,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // إرسال حالة الكتابة
    if (e.target.value.trim()) {
      handleTyping(true);
    } else {
      handleTyping(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (activeSection === 'chats') {
      fetchConversations();
    } else {
      fetchTeachers();
    }
  };

  const deleteConversation = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المحادثة؟')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/chat/conversations/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('تم حذف المحادثة بنجاح');
        setConversations(prev => prev.filter(conv => 
          !conv.participants.some(p => p._id === userId)
        ));
        if (selectedUser?._id === userId) {
          setSelectedUser(null);
          setMessages([]);
        }
      } else {
        toast.error('حدث خطأ في حذف المحادثة');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('حدث خطأ في حذف المحادثة');
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount[user?._id || ''] || 0;
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherParticipant(conv);
    return otherUser?.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredTeachers = teachers.filter(teacher =>
    teacher.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDisplay = (user: User) => {
    switch (user.role) {
      case 'teacher':
        return 'معلم';
      case 'admin':
        return 'مدير';
      case 'student':
        return 'طالب';
      default:
        return user.role;
    }
  };

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">غير مصرح</h1>
          <p className="text-gray-600 mt-2">هذه الصفحة للطلاب فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">المحادثات - الطالب</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="ml-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {/* <p className="text-gray-600">
            التواصل مع معلمي وإداريي الصف {user.grade}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            <p>المستخدم: {user.username} | الصف: {user.grade} | الدور: {getRoleDisplay(user)}</p>
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                المحادثات
              </CardTitle>
              <CardDescription>
                التواصل مع معلميك ومديريك
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث في المحادثات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* Tabs */}
              <div className="flex border-b mb-4">
                <Button
                  variant={activeSection === 'chats' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-none ${activeSection === 'chats' ? 'border-b-2 border-blue-600' : ''}`}
                  onClick={() => setActiveSection('chats')}
                >
                  المحادثات ({conversations.length})
                </Button>
                <Button
                  variant={activeSection === 'teachers' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-none ${activeSection === 'teachers' ? 'border-b-2 border-blue-600' : ''}`}
                  onClick={() => setActiveSection('teachers')}
                >
                  <Users className="h-4 w-4 ml-1" />
                  المتاحون ({teachers.length})
                </Button>
              </div>

              {/* Conversations/Teachers List */}
              <ScrollArea className="h-[500px]">
                {activeSection === 'chats' ? (
                  <div className="space-y-2">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">جاري تحميل المحادثات...</div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>لا توجد محادثات</p>
                        <p className="text-sm mt-1">اختر معلماً أو مديراً لبدء محادثة</p>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => {
                        const otherUser = getOtherParticipant(conversation);
                        const unreadCount = getUnreadCount(conversation);
                        
                        if (!otherUser) return null;

                        return (
                          <div
                            key={conversation._id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedUser?._id === otherUser._id 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                            onClick={() => handleUserClick(otherUser)}
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={otherUser.profilePicture} />
                              <AvatarFallback className={
                                otherUser.role === 'teacher' 
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-purple-100 text-purple-600'
                              }>
                                {otherUser.role === 'teacher' ? (
                                  <User className="h-5 w-5" />
                                ) : (
                                  <BookOpen className="h-5 w-5" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm truncate">
                                  {otherUser.username}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-gray-500 truncate">
                                    {conversation.lastMessage?.message || 'بدء محادثة جديدة'}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {getRoleDisplay(otherUser)}
                                  </p>
                                </div>
                                {unreadCount > 0 && (
                                  <Badge variant="destructive" className="h-5 min-w-5 text-xs flex items-center justify-center">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">جاري تحميل المعلمين...</div>
                    ) : filteredTeachers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>لا توجد معلمين أو مديرين</p>
                        <p className="text-sm mt-1">سيظهرون هنا عندما يتوفرون</p>
                      </div>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <div
                          key={teacher._id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUser?._id === teacher._id 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                          onClick={() => handleUserClick(teacher)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={teacher.profilePicture} />
                            <AvatarFallback className={
                              teacher.role === 'teacher' 
                                ? 'bg-green-100 text-green-600'
                                : 'bg-purple-100 text-purple-600'
                            }>
                              {teacher.role === 'teacher' ? (
                                <User className="h-5 w-5" />
                              ) : (
                                <BookOpen className="h-5 w-5" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">{teacher.username}</h4>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                {getRoleDisplay(teacher)} • {teacher.grade || 'المدرسة'}
                              </p>
                              {teacher.role === 'admin' && (
                                <Badge variant="secondary" className="text-xs">
                                  مدير
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3">
            <CardContent className="p-0">
              {selectedUser ? (
                <div className="flex flex-col h-[600px]">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedUser.profilePicture} />
                        <AvatarFallback className={
                          selectedUser.role === 'teacher' 
                            ? 'bg-green-100 text-green-600'
                            : 'bg-purple-100 text-purple-600'
                        }>
                          {selectedUser.role === 'teacher' ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <BookOpen className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedUser.username}</h3>
                        <p className="text-sm text-gray-500">
                          {getRoleDisplay(selectedUser)} • {selectedUser.grade || 'المدرسة'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        selectedUser.role === 'teacher' ? 'default' : 'secondary'
                      }>
                        {getRoleDisplay(selectedUser)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => deleteConversation(selectedUser._id)}
                            className="text-red-600"
                          >
                            حذف المحادثة
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="text-center py-8 text-gray-500">جاري تحميل الرسائل...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h4 className="text-lg font-medium mb-2">لا توجد رسائل بعد</h4>
                        <p className="text-sm">ابدأ محادثة مع {getRoleDisplay(selectedUser)} {selectedUser.username}</p>
                        <div className="mt-4 text-sm text-gray-400 space-y-1">
                          <p>يمكنك:</p>
                          <p>• سؤال عن الدروس والواجبات</p>
                          <p>• الاستفسار عن النقاط غير الواضحة</p>
                          <p>• طلب مساعدة في المواد الدراسية</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Date Separator */}
                        <div className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {messages.length > 0 && formatDate(messages[0].createdAt)}
                          </Badge>
                        </div>

                        {/* Messages */}
                        {messages.map((message) => (
                          <div
                            key={message._id}
                            className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="flex gap-2 max-w-xs lg:max-w-md">
                              {message.sender._id !== user?._id && (
                                <Avatar className="h-8 w-8 mt-1">
                                  <AvatarImage src={message.sender.profilePicture} />
                                  <AvatarFallback className="text-xs bg-green-100">
                                    <User className="h-3 w-3" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  message.sender._id === user?._id
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <p className={`text-xs mt-1 ${
                                  message.sender._id === user?._id
                                    ? 'text-blue-100'
                                    : 'text-gray-500'
                                }`}>
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="flex gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                  <User className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder={`اكتب رسالتك ل${getRoleDisplay(selectedUser)} هنا...`}
                        className="flex-1"
                        disabled={messagesLoading}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || messagesLoading}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        إرسال
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
                  <GraduationCap className="h-20 w-20 mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium mb-2">مرحباً في محادثات الطالب</h3>
                  <p className="text-sm text-center mb-4">اختر معلماً أو مديراً من القائمة لبدء المحادثة</p>
                  <div className="text-sm text-gray-400 text-center space-y-1">
                    <p>• اسأل عن الدروس والواجبات</p>
                    <p>• استفسر عن النقاط غير الواضحة</p>
                    <p>• احصل على مساعدة في المواد الدراسية</p>
                    <p>• تواصل مع الإدارة للاستفسارات العامة</p>
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