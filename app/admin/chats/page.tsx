/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/chat/page.tsx
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
  Search,
  MoreVertical,
  GraduationCap,
  User,
  BookOpen,
  RefreshCw,
  Home,
  Shield
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
import { api } from '@/redux/slices/authSlice'; // ✅ Import api instance

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

export default function AdminChatsPage() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'chats' | 'students' | 'teachers' | 'parents'>('chats');
  const [isTyping, setIsTyping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // التحقق من أن المستخدم مدير
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
  }, [user, router]);

  // Socket initialization
  useEffect(() => {
    if (!user || !token) return;

    console.log('🔌 Initializing socket connection...');
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      auth: {
        token: token
      }
    });

    if (user._id) {
      socketRef.current.emit('join', user._id);
      console.log('✅ Admin joined socket room:', user._id);
    }

    socketRef.current.on('newMessage', (message: Message) => {
      console.log('📨 NEW MESSAGE RECEIVED:', message);
      
      if (selectedUser && 
          (message.sender._id === selectedUser._id || message.receiver._id === selectedUser._id)) {
        console.log('✅ Adding message to current conversation');
        setMessages(prev => [...prev, message]);
        toast.success(`رسالة جديدة من ${message.sender.username}`);
      }
      
      fetchConversations();
    });

    socketRef.current.on('userTyping', (data) => {
      if (data.userId === selectedUser?._id) {
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
  }, [user, token, selectedUser]);

  // تحميل البيانات الأولية
  useEffect(() => {
    if (user && user.role === 'admin') {
      console.log('🎯 Loading initial data for admin...');
      fetchConversations();
      fetchStudents();
      fetchTeachers();
      fetchParents();
    }
  }, [user]);

  // تحديث البيانات عند تغيير القسم النشط
  useEffect(() => {
    if (activeSection === 'chats') {
      fetchConversations();
    } else if (activeSection === 'students') {
      fetchStudents();
    } else if (activeSection === 'teachers') {
      fetchTeachers();
    } else {
      fetchParents();
    }
  }, [activeSection]);

  // عند تغيير المستخدم المحدد، جلب الرسائل
  useEffect(() => {
    if (selectedUser) {
      console.log('🎯 Selected user changed:', selectedUser.username);
      fetchMessages(selectedUser._id);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Fixed: Use api instance
  const fetchConversations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching conversations...');
      
      const response = await api.get('/api/chat/conversations');
      console.log('📡 Conversations response:', response.data);
      
      if (response.data.status === 'success') {
        setConversations(response.data.data?.conversations || []);
        console.log('✅ Conversations loaded:', response.data.data?.conversations?.length);
      } else {
        toast.error('فشل في تحميل المحادثات');
      }
    } catch (error: any) {
      console.error('❌ Error fetching conversations:', error);
      const message = error.response?.data?.message || 'حدث خطأ في تحميل المحادثات';
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Fixed: Use api instance
  const fetchStudents = async () => {
    try {
      console.log('🔄 Fetching students...');
      
      const response = await api.get('/api/chat/users');
      
      if (response.data.status === 'success') {
        const studentsList = response.data.data?.users?.filter((user: User) => user.role === 'student') || [];
        console.log('✅ Students loaded:', studentsList.length);
        setStudents(studentsList);
      } else {
        toast.error('فشل في تحميل قائمة الطلاب');
      }
    } catch (error: any) {
      console.error('❌ Error fetching students:', error);
      const message = error.response?.data?.message || 'حدث خطأ في تحميل قائمة الطلاب';
      toast.error(message);
    }
  };

  // ✅ Fixed: Use api instance
  const fetchTeachers = async () => {
    try {
      console.log('🔄 Fetching teachers...');
      
      const response = await api.get('/api/chat/users');
      
      if (response.data.status === 'success') {
        const teachersList = response.data.data?.users?.filter((user: User) => user.role === 'teacher') || [];
        console.log('✅ Teachers loaded:', teachersList.length);
        setTeachers(teachersList);
      } else {
        toast.error('فشل في تحميل قائمة المعلمين');
      }
    } catch (error: any) {
      console.error('❌ Error fetching teachers:', error);
      const message = error.response?.data?.message || 'حدث خطأ في تحميل قائمة المعلمين';
      toast.error(message);
    }
  };

  // ✅ Fixed: Use api instance
  const fetchParents = async () => {
    try {
      console.log('🔄 Fetching parents...');
      
      const response = await api.get('/api/chat/users');
      
      if (response.data.status === 'success') {
        const parentsList = response.data.data?.users?.filter((user: User) => user.role === 'parent') || [];
        console.log('✅ Parents loaded:', parentsList.length);
        setParents(parentsList);
      } else {
        toast.error('فشل في تحميل قائمة أولياء الأمور');
      }
    } catch (error: any) {
      console.error('❌ Error fetching parents:', error);
      const message = error.response?.data?.message || 'حدث خطأ في تحميل قائمة أولياء الأمور';
      toast.error(message);
    }
  };

  // ✅ Fixed: Use api instance
  const fetchMessages = async (userId: string) => {
    try {
      setMessagesLoading(true);
      console.log(`🔄 Fetching messages for user: ${userId}`);
      
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

  const handleUserClick = (clickedUser: User) => {
    console.log('👆 User clicked:', clickedUser.username);
    setSelectedUser(clickedUser);
  };

  // ✅ Fixed: Use api instance
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) {
      toast.error('الرسالة مطلوبة');
      return;
    }

    try {
      console.log('📤 Sending message to:', selectedUser.username);
      
      const messageData = {
        receiverId: selectedUser._id,
        message: newMessage.trim()
      };

      // إرسال الرسالة عبر Socket
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', messageData);
        console.log('✅ Message sent via socket');
      }

      // إرسال الرسالة إلى API
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
    } else if (activeSection === 'students') {
      fetchStudents();
    } else if (activeSection === 'teachers') {
      fetchTeachers();
    } else {
      fetchParents();
    }
  };

  // ✅ Fixed: Use api instance
  const deleteConversation = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المحادثة؟')) return;

    try {
      const response = await api.delete(`/api/chat/conversations/${userId}`);

      if (response.data.status === 'success') {
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
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      const message = error.response?.data?.message || 'حدث خطأ في حذف المحادثة';
      toast.error(message);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount[user?._id || ''] || 0;
  };

  const getRoleDisplay = (user: User) => {
    switch (user.role) {
      case 'teacher':
        return 'معلم';
      case 'admin':
        return 'مدير';
      case 'student':
        return 'طالب';
      case 'parent':
        return 'ولي أمر';
      default:
        return user.role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'bg-green-100 text-green-600';
      case 'student':
        return 'bg-blue-100 text-blue-600';
      case 'parent':
        return 'bg-orange-100 text-orange-600';
      case 'admin':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher':
        return <User className="h-4 w-4" />;
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      case 'parent':
        return <Home className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherParticipant(conv);
    return otherUser?.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(teacher =>
    teacher.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParents = parents.filter(parent =>
    parent.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">غير مصرح</h1>
          <p className="text-gray-600 mt-2">هذه الصفحة للمديرين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">المحادثات - المدير</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-gray-600">التواصل مع الطلاب والمعلمين وأولياء الأمور في المدرسة</p>
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
                التواصل مع جميع المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث في المحادثات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <div className="flex border-b mb-4">
                <Button
                  variant={activeSection === 'chats' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-none text-xs ${activeSection === 'chats' ? 'border-b-2 border-blue-600' : ''}`}
                  onClick={() => setActiveSection('chats')}
                >
                  المحادثات ({conversations.length})
                </Button>
                <Button
                  variant={activeSection === 'students' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-none text-xs ${activeSection === 'students' ? 'border-b-2 border-blue-600' : ''}`}
                  onClick={() => setActiveSection('students')}
                >
                  <GraduationCap className="h-3 w-3 ml-1" />
                  طلاب ({students.length})
                </Button>
                <Button
                  variant={activeSection === 'teachers' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-none text-xs ${activeSection === 'teachers' ? 'border-b-2 border-blue-600' : ''}`}
                  onClick={() => setActiveSection('teachers')}
                >
                  <User className="h-3 w-3 ml-1" />
                  معلمون ({teachers.length})
                </Button>
                <Button
                  variant={activeSection === 'parents' ? 'default' : 'ghost'}
                  className={`flex-1 rounded-none text-xs ${activeSection === 'parents' ? 'border-b-2 border-blue-600' : ''}`}
                  onClick={() => setActiveSection('parents')}
                >
                  <Home className="h-3 w-3 ml-1" />
                  أولياء ({parents.length})
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                {activeSection === 'chats' ? (
                  <div className="space-y-2">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">
                        <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
                        جاري تحميل المحادثات...
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>لا توجد محادثات</p>
                        <p className="text-sm mt-1">اختر مستخدم لبدء محادثة</p>
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
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleUserClick(otherUser)}
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={otherUser.profilePicture} />
                              <AvatarFallback className={getRoleColor(otherUser.role)}>
                                {getRoleIcon(otherUser.role)}
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
                                    {getRoleDisplay(otherUser)} • {otherUser.grade || 'المدرسة'}
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
                ) : activeSection === 'students' ? (
                  <div className="space-y-2">
                    {filteredStudents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <GraduationCap className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>لا توجد طلاب</p>
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student._id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUser?._id === student._id 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleUserClick(student)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={student.profilePicture} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              <GraduationCap className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{student.username}</h4>
                            <p className="text-xs text-gray-500">طالب • {student.grade}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : activeSection === 'teachers' ? (
                  <div className="space-y-2">
                    {filteredTeachers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>لا توجد معلمين</p>
                      </div>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <div
                          key={teacher._id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUser?._id === teacher._id 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleUserClick(teacher)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={teacher.profilePicture} />
                            <AvatarFallback className="bg-green-100 text-green-600">
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{teacher.username}</h4>
                            <p className="text-xs text-gray-500">معلم • {teacher.grade}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredParents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Home className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>لا توجد أولياء أمور</p>
                      </div>
                    ) : (
                      filteredParents.map((parent) => (
                        <div
                          key={parent._id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUser?._id === parent._id 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleUserClick(parent)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={parent.profilePicture} />
                            <AvatarFallback className="bg-orange-100 text-orange-600">
                              <Home className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{parent.username}</h4>
                            <p className="text-xs text-gray-500">ولي أمر • {parent.grade}</p>
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
                        <AvatarFallback className={getRoleColor(selectedUser.role)}>
                          {getRoleIcon(selectedUser.role)}
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
                      <Badge className={getRoleColor(selectedUser.role)}>
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
                      <div className="text-center py-8 text-gray-500">
                        <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                        <p>جاري تحميل الرسائل...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h4 className="text-lg font-medium mb-2">لا توجد رسائل بعد</h4>
                        <p className="text-sm">ابدأ محادثة مع {getRoleDisplay(selectedUser)} {selectedUser.username}</p>
                        <div className="mt-4 text-sm text-gray-400 space-y-1">
                          <p>• تواصل مع {getRoleDisplay(selectedUser)} للاستفسارات</p>
                          <p>• تبادل المعلومات والملاحظات</p>
                          <p>• متابعة الشؤون الدراسية</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isOwnMessage = message.sender._id === user._id;
                          
                          return (
                            <div
                              key={message._id || `message-${index}`}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`flex gap-3 max-w-xs lg:max-w-md ${
                                isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                              }`}>
                                {!isOwnMessage && (
                                  <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                                    <AvatarImage src={message.sender.profilePicture} />
                                    <AvatarFallback className={`text-xs ${getRoleColor(message.sender.role)}`}>
                                      {getRoleIcon(message.sender.role)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div
                                  className={`rounded-lg px-4 py-2 ${
                                    isOwnMessage
                                      ? 'bg-blue-600 text-white rounded-br-none'
                                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                  }`}
                                >
                                  <p className="text-sm break-words">{message.message}</p>
                                  <p className={`text-xs mt-1 ${
                                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                  }`}>
                                    {formatTime(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                  {getRoleIcon(selectedUser.role)}
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
                        placeholder={`اكتب رسالتك ل${selectedUser.username}...`}
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
                  <MessageCircle className="h-20 w-20 mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium mb-2">مرحباً في محادثات المدير</h3>
                  <p className="text-sm text-center mb-4">اختر محادثة من القائمة لبدء التحدث</p>
                  <div className="text-sm text-gray-400 text-center space-y-1">
                    <p>• تواصل مع الطلاب للاستفسارات العامة</p>
                    <p>• تنسيق مع المعلمين للأنشطة المدرسية</p>
                    <p>• متابعة مع أولياء الأمور للشؤون الدراسية</p>
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