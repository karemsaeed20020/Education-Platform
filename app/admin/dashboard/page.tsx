/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  Award, 
  TrendingUp, 
  Clock,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  Eye,
  BarChart3,
  RefreshCw,
  UserPlus,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock4
} from 'lucide-react';
import { api } from '@/redux/slices/authSlice'; // Import the api instance
import toast from 'react-hot-toast';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalOrders: number;
  totalRevenue: number;
  newStudentsThisMonth: number;
  growthRate: number;
  
  // إحصائيات الحضور
  presentToday: number;
  absentToday: number;
  attendanceRateToday: number;
  totalTodayAttendance: number;
  
  // إحصائيات الامتحانات
  totalExams: number;
  totalExamAttempts: number;
  averageExamScore: number;
  bestExamScore: number;
}

interface RecentActivity {
  _id: string;
  type: string;
  message: string;
  time: string;
  user: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newStudentsThisMonth: 0,
    growthRate: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRateToday: 0,
    totalTodayAttendance: 0,
    totalExams: 0,
    totalExamAttempts: 0,
    averageExamScore: 0,
    bestExamScore: 0
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      // جلب الإحصائيات الرئيسية
      const statsResponse = await api.get('/api/admin/dashboard/stats');
      
      if (statsResponse.data.status === 'success') {
        setStats(statsResponse.data.data);
      } else {
        toast.error('فشل في تحميل الإحصائيات');
      }

      // جلب الأنشطة الحديثة
      const activitiesResponse = await api.get('/api/admin/dashboard/activities');
      
      if (activitiesResponse.data.status === 'success') {
        setRecentActivities(activitiesResponse.data.data);
      } else {
        toast.error('فشل في تحميل الأنشطة الحديثة');
      }

      toast.success('تم تحديث البيانات بنجاح');

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      const message = error.response?.data?.message || 'حدث خطأ في تحميل بيانات لوحة التحكم';
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // دالة بديلة في حالة عدم وجود الـ endpoints
  const fetchMockData = async () => {
    setRefreshing(true);
    try {
      // بيانات وهمية للاختبار
      const mockStats = {
        totalStudents: 1250,
        activeStudents: 980,
        totalTeachers: 45,
        totalCourses: 28,
        totalOrders: 345,
        totalRevenue: 125000,
        newStudentsThisMonth: 42,
        growthRate: 12,
        presentToday: 850,
        absentToday: 150,
        attendanceRateToday: 85,
        totalTodayAttendance: 1000,
        totalExams: 15,
        totalExamAttempts: 2340,
        averageExamScore: 78,
        bestExamScore: 98
      };

      const mockActivities = [
        {
          _id: '1',
          type: 'exam',
          message: 'طالب أكمل امتحان اللغة العربية',
          time: new Date().toISOString(),
          user: 'أحمد محمد'
        },
        {
          _id: '2',
          type: 'attendance',
          message: 'تسجيل حضور 25 طالب',
          time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          user: 'نظام الحضور'
        },
        {
          _id: '3',
          type: 'purchase',
          message: 'اشتراك جديد في كورس النحو',
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'مريم عبدالله'
        },
        {
          _id: '4',
          type: 'login',
          message: 'تسجيل دخول جديد',
          time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          user: 'خالد إبراهيم'
        }
      ];

      setStats(mockStats);
      setRecentActivities(mockActivities);
      toast.success('تم تحميل البيانات التجريبية بنجاح');

    } catch (error) {
      console.error('Error loading mock data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'exam': return <FileText className="h-4 w-4" />;
      case 'attendance': return <ClipboardCheck className="h-4 w-4" />;
      case 'login': return <Users className="h-4 w-4" />;
      case 'purchase': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'exam': return 'text-blue-600 bg-blue-50';
      case 'attendance': return 'text-green-600 bg-green-50';
      case 'login': return 'text-purple-600 bg-purple-50';
      case 'purchase': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* العنوان وشريط التحديث */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المدير</h1>
          <p className="text-gray-600 mt-1">
            إحصائيات حية عن الطلاب والحضور والامتحانات - آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>
          
          {/* زر للبيانات التجريبية - يمكن إزالته لاحقاً */}
          <button
            onClick={fetchMockData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <BarChart3 className="h-4 w-4" />
            بيانات تجريبية
          </button>
        </div>
      </div>

      {/* شبكة الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* إجمالي الطلاب */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الطلاب</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.totalStudents)}</p>
              <div className="flex items-center gap-1 mt-2">
                <UserPlus className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+{stats.newStudentsThisMonth}</span>
                <span className="text-sm text-gray-500">هذا الشهر</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* الحضور اليوم */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الحضور اليوم</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.attendanceRateToday}%</p>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">{stats.presentToday} حاضر</span>
                <XCircle className="h-4 w-4 text-red-500 ml-2" />
                <span className="text-sm text-red-600">{stats.absentToday} غائب</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <ClipboardCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* أداء الامتحانات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط نتائج الامتحانات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageExamScore}%</p>
              <div className="flex items-center gap-1 mt-2">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-600">أعلى درجة: {stats.bestExamScore}%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* الطلاب النشطين */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">طلاب نشطين</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.activeStudents)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+{stats.growthRate}%</span>
                <span className="text-sm text-gray-500">نمو</span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* الشبكة الثانية - إحصائيات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* إجمالي المعلمين */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المعلمين</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.totalTeachers)}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* إجمالي الامتحانات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الامتحانات المنشورة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.totalExams)}</p>
              <div className="flex items-center gap-1 mt-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600">{stats.totalExamAttempts} محاولة</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* إجمالي الكورسات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الكورسات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.totalCourses)}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* إجمالي الطلبات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الطلبات المكتملة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.totalOrders)}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-gray-600">إيرادات: {formatNumber(stats.totalRevenue)} ج.م</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* الشبكة السفلية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الأنشطة الحديثة */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">آخر الأنشطة</h3>
            <span className="text-sm text-gray-500">آخر 24 ساعة</span>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 8).map((activity) => (
                <div key={activity._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.user}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{formatDate(activity.time)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>لا توجد أنشطة حديثة</p>
              </div>
            )}
          </div>
        </div>

        {/* ملخص سريع */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص الأداء</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">نسبة الحضور الشهرية</span>
              <span className="font-bold text-green-600">{stats.attendanceRateToday}%</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">متوسط نتائج الامتحانات</span>
              <span className="font-bold text-blue-600">{stats.averageExamScore}%</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">طلاب جدد هذا الشهر</span>
              <span className="font-bold text-purple-600">+{stats.newStudentsThisMonth}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">إجمالي محاولات الامتحانات</span>
              <span className="font-bold text-orange-600">{formatNumber(stats.totalExamAttempts)}</span>
            </div>
          </div>

          {/* مؤشرات الأداء */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">مؤشرات الأداء</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{stats.presentToday}</div>
                <div className="text-xs text-green-700">حاضر اليوم</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{stats.absentToday}</div>
                <div className="text-xs text-red-700">غائب اليوم</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{stats.totalExams}</div>
                <div className="text-xs text-blue-700">امتحان منشور</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{stats.activeStudents}</div>
                <div className="text-xs text-purple-700">طالب نشط</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}