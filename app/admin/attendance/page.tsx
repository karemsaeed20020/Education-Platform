'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { Calendar, Users, CheckCircle, XCircle, Clock, Save, BarChart3, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Student {
  _id: string;
  username: string;
  email: string;
  phone: string;
  grade: string;
}

interface AttendanceRecord {
  _id?: string;
  status: string;
  notes?: string;
  recordedAt?: string;
}

interface ClassAttendance {
  student: Student;
  attendance: AttendanceRecord | null;
  status: string;
}

const AttendancePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('الصف الثالث الثانوي');
  const [students, setStudents] = useState<ClassAttendance[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<ClassAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const grades = ['الصف الثاني الثانوي', 'الصف الثالث الثانوي'];

  useEffect(() => {
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      router.push('/');
      return;
    }
    fetchDailyAttendance();
  }, [selectedDate, selectedGrade]);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(item =>
        item.student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.student.phone?.includes(searchTerm)
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchDailyAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/daily?date=${selectedDate}&grade=${selectedGrade}`,
        {
          credentials: 'include',
        }
      );
      
      const data = await response.json();
      if (response.ok) {
        setStudents(data.data.attendance);
        setFilteredStudents(data.data.attendance); // Initialize filtered students
      } else {
        toast.error(data.message || 'فشل في تحميل بيانات الحضور');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setStudents(prev => prev.map(student => 
      student.student._id === studentId 
        ? { 
            ...student, 
            status: newStatus,
            attendance: student.attendance ? { ...student.attendance, status: newStatus } : null
          }
        : student
    ));

    // Update filtered students as well
    setFilteredStudents(prev => prev.map(student => 
      student.student._id === studentId 
        ? { 
            ...student, 
            status: newStatus,
            attendance: student.attendance ? { ...student.attendance, status: newStatus } : null
          }
        : student
    ));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const attendanceData = students.map(student => ({
        studentId: student.student._id,
        status: student.status,
        notes: student.attendance?.notes || ''
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/daily`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            students: attendanceData,
            grade: selectedGrade,
            date: selectedDate
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('تم حفظ الحضور بنجاح');
        fetchDailyAttendance(); // تحديث البيانات
      } else {
        toast.error(data.message || 'فشل في حفظ الحضور');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      case 'late': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'حاضر';
      case 'absent': return 'غائب';
      case 'late': return 'متأخر';
      default: return 'لم يسجل';
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // إحصائيات - تعتمد على البيانات المصفاة أثناء البحث
  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    late: students.filter(s => s.status === 'late').length,
    notRecorded: students.filter(s => s.status === 'not-recorded').length,
    filteredTotal: filteredStudents.length,
    filteredPresent: filteredStudents.filter(s => s.status === 'present').length,
    filteredAbsent: filteredStudents.filter(s => s.status === 'absent').length,
    filteredLate: filteredStudents.filter(s => s.status === 'late').length
  };

  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
  const filteredAttendanceRate = stats.filteredTotal > 0 ? Math.round((stats.filteredPresent / stats.filteredTotal) * 100) : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الحضور اليومي</h1>
          <p className="text-gray-600 mt-1">مادة اللغة العربية - {formatDate(selectedDate)}</p>
        </div>
        
        <button
          onClick={handleSaveAttendance}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'جاري الحفظ...' : 'حفظ الحضور'}
        </button>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate(-1)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
            اليوم السابق
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline ml-1" />
                التاريخ
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="w-4 h-4 inline ml-1" />
                الصف الدراسي
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => navigateDate(1)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            اليوم التالي
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ابحث عن طالب بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600">
            عرض <span className="font-semibold">{stats.filteredTotal}</span> من أصل{' '}
            <span className="font-semibold">{stats.total}</span> طالب
            {stats.filteredTotal !== stats.total && (
              <span className="text-blue-600 mr-2"> (نتائج البحث)</span>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {searchTerm ? stats.filteredTotal : stats.total}
          </div>
          <div className="text-sm text-gray-600">
            {searchTerm ? 'الطلاب المطابقين' : 'إجمالي الطلاب'}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-700">
            {searchTerm ? stats.filteredPresent : stats.present}
          </div>
          <div className="text-sm text-green-600">حاضر</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-700">
            {searchTerm ? stats.filteredAbsent : stats.absent}
          </div>
          <div className="text-sm text-red-600">غائب</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700">
            {searchTerm ? stats.filteredLate : stats.late}
          </div>
          <div className="text-sm text-yellow-600">متأخر</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">
            {searchTerm ? filteredAttendanceRate : attendanceRate}%
          </div>
          <div className="text-sm text-blue-600">نسبة الحضور</div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">لم يتم العثور على نتائج</p>
                    <p className="text-sm mt-2">لا توجد نتائج تطابق بحثك: {searchTerm}</p>
                    <button
                      onClick={handleClearSearch}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      عرض جميع الطلاب
                    </button>
                  </>
                ) : (
                  <p className="text-lg">لا توجد بيانات للعرض</p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم الطالب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة الحالية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تغيير الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ملاحظات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((item) => (
                    <tr key={item.student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {item.student.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.student.username}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.student.grade}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(item.student._id, 'present')}
                            className={`p-2 rounded-lg border ${
                              item.status === 'present' 
                                ? 'bg-green-100 text-green-700 border-green-300' 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-green-50'
                            }`}
                            title="حاضر"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.student._id, 'absent')}
                            className={`p-2 rounded-lg border ${
                              item.status === 'absent' 
                                ? 'bg-red-100 text-red-700 border-red-300' 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-red-50'
                            }`}
                            title="غائب"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.student._id, 'late')}
                            className={`p-2 rounded-lg border ${
                              item.status === 'late' 
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-300' 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-yellow-50'
                            }`}
                            title="متأخر"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="ملاحظات..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue={item.attendance?.notes || ''}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;