/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, TrendingUp, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

interface AttendanceRecord {
  _id: string;
  student: {
    _id: string;
    username: string;
    grade: string;
  };
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
  recordedAt: string;
}

interface Child {
  _id: string;
  username: string;
  grade: string;
}

export default function ParentAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth() + 1 + ''
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear() + ''
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
    fetchChildren();
  }, [selectedChild, selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/api/parent/children/attendance');

      if (response.data.status === 'success') {
        setAttendance(response.data.data.attendance);
      } else {
        throw new Error('فشل في جلب بيانات الحضور');
      }
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل بيانات الحضور';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await api.get('/api/parent/dashboard');

      if (response.data.status === 'success') {
        setChildren(response.data.data.parent.children);
      }
    } catch (error: any) {
      console.error('Error fetching children:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل بيانات الأبناء';
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'present': 'حاضر',
      'absent': 'غائب',
      'late': 'متأخر',
      'excused': 'معذور'
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variantMap: { [key: string]: "default" | "destructive" | "secondary" | "outline" } = {
      'present': 'default',
      'absent': 'destructive',
      'late': 'secondary',
      'excused': 'outline'
    };
    return variantMap[status] || 'outline';
  };

  // تصفية البيانات حسب الابن والشهر والسنة
  const filteredAttendance = attendance.filter(record => {
    const matchesChild = selectedChild === 'all' || record.student._id === selectedChild;
    
    const recordDate = new Date(record.date);
    const matchesMonth = recordDate.getMonth() + 1 === parseInt(selectedMonth);
    const matchesYear = recordDate.getFullYear() === parseInt(selectedYear);
    
    return matchesChild && matchesMonth && matchesYear;
  });

  // حساب الإحصائيات
  const statistics = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(r => r.status === 'present').length,
    absent: filteredAttendance.filter(r => r.status === 'absent').length,
    late: filteredAttendance.filter(r => r.status === 'late').length,
    excused: filteredAttendance.filter(r => r.status === 'excused').length,
    attendanceRate: filteredAttendance.length > 0 ? 
      Math.round((filteredAttendance.filter(r => r.status === 'present').length / filteredAttendance.length) * 100) : 0
  };

  // توليد قائمة الأشهر والسنوات
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1) + '',
    label: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][i]
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => ({
    value: (currentYear - i) + '',
    label: (currentYear - i) + ''
  }));

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الحضور...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">متابعة الحضور</h1>
          <p className="text-gray-600 mt-2">عرض حضور الأبناء في الحصص</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-48">
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأبناء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأبناء</SelectItem>
                  {children.map(child => (
                    <SelectItem key={child._id} value={child._id}>
                      {child.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="الشهر" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="السنة" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأيام</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">يوم مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أيام الحضور</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.present}</div>
            <p className="text-xs text-muted-foreground">يوم حاضر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أيام الغياب</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.absent}</div>
            <p className="text-xs text-muted-foreground">يوم غائب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أيام التأخر</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.late}</div>
            <p className="text-xs text-muted-foreground">يوم متأخر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة الحضور</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">معدل الحضور</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الحضور</CardTitle>
          <CardDescription>
            تفاصيل حضور الأبناء في الحصص ({filteredAttendance.length} يوم)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-bold">الابن</TableHead>
                  <TableHead className="text-right font-bold">التاريخ</TableHead>
                  <TableHead className="text-right font-bold">الحالة</TableHead>
                  <TableHead className="text-right font-bold">ملاحظات</TableHead>
                  <TableHead className="text-right font-bold">وقت التسجيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3 justify-end">
                        <div className="text-right">
                          <div className="font-medium">{record.student.username}</div>
                          <div className="text-sm text-gray-500">{record.student.grade}</div>
                        </div>
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(record.date).toLocaleDateString('ar-EG')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(record.status)} className="flex items-center gap-1 w-20 justify-center">
                        {getStatusIcon(record.status)}
                        {getStatusText(record.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {record.notes || <span className="text-gray-400">لا توجد ملاحظات</span>}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {new Date(record.recordedAt).toLocaleString('ar-EG')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAttendance.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سجلات حضور</h3>
              <p className="text-gray-500">لم يتم تسجيل أي حضور في الفترة المحددة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}