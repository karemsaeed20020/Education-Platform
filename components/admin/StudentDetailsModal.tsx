/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Loader2
} from 'lucide-react';
import { Student } from '@/types';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  student: Student | null;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  student,
}) => {
  const [loading, setLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);

  // Fetch student details when modal opens
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!student) return;
      
      setLoading(true);
      try {
        const response = await api.get(`/api/users/students/${student._id}`);
        
        if (response.data.status === 'success') {
          setStudentDetails(response.data.data.student);
        } else {
          throw new Error(response.data.message || 'فشل في تحميل بيانات الطالب');
        }
      } catch (err: any) {
        console.error('Error fetching student details:', err);
        const errorMessage = err.response?.data?.message || err.message || 'فشل في تحميل بيانات الطالب';
        // Note: We're not showing toast here to avoid interrupting the user experience
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && student) {
      fetchStudentDetails();
    } else {
      setStudentDetails(null);
    }
  }, [isOpen, student]);

  const handleEdit = () => {
    if (studentDetails) {
      onEdit(studentDetails);
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen || !student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[75vh] rounded-2xl bg-white overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  تفاصيل الطالب
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm">
                  المعلومات الكاملة للطالب
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={loading || !studentDetails}
              className="flex items-center gap-2 h-9"
            >
              <Edit className="w-3 h-3" />
              تعديل
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="mr-2 text-gray-600 text-sm">جاري تحميل البيانات...</span>
            </div>
          ) : studentDetails ? (
            <>
              {/* Student Basic Info */}
              <Card className="border-blue-100 bg-blue-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">
                      {studentDetails.username}
                    </h3>
                    <Badge
                      variant={studentDetails.isActive ? "default" : "destructive"}
                      className="flex items-center gap-1 text-xs"
                    >
                      {studentDetails.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          نشط
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          غير نشط
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {/* Email */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600">البريد الإلكتروني</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {studentDetails.email}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600">رقم الهاتف</p>
                        <p className="text-sm font-medium text-gray-900">
                          {studentDetails.phone}
                        </p>
                      </div>
                    </div>

                    {/* Grade */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600">الصف الدراسي</p>
                        <p className="text-sm font-medium text-gray-900">
                          {studentDetails.grade || 'غير محدد'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">معلومات إضافية</h4>
                
                {/* Registration Date */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-3 h-3 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600">تاريخ التسجيل</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(studentDetails.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600">نوع الحساب</p>
                    <p className="text-sm font-medium text-gray-900">
                      {studentDetails.role === 'student' ? 'طالب' : studentDetails.role}
                    </p>
                  </div>
                </div>

                {/* Account Status */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3 h-3 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600">حالة الحساب</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={studentDetails.isActive ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {studentDetails.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {studentDetails.isActive ? 'يمكنه الوصول للمنصة' : 'لا يمكنه الوصول للمنصة'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student ID */}
              <Card className="border-gray-200">
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">معرف الطالب</p>
                    <p className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded truncate">
                      {studentDetails._id}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <XCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm">فشل في تحميل بيانات الطالب</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-3 flex-shrink-0">
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full h-9 text-sm"
            disabled={loading}
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModal;