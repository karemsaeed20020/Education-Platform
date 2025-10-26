/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect } from 'react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { CheckCircle2, User, Mail, Phone, BookOpen, Loader2 } from 'lucide-react';
import { Student } from '@/types';
import { api } from '@/redux/slices/authSlice';

// ✅ Validation schema
const editStudentSchema = z.object({
  username: z.string().min(2, 'يجب إدخال اسم صحيح'),
  email: z.string().email('يجب إدخال بريد إلكتروني صالح'),
  phone: z
    .string()
    .regex(/^01[0125]\d{8}$/, 'يجب إدخال رقم هاتف مصري صحيح'),
  grade: z.string().optional(),
  isActive: z.boolean(),
});

type EditStudentForm = z.infer<typeof editStudentSchema>;

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: () => void;
  student: Student | null;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  onStudentUpdated,
  student,
}) => {
  const form = useForm<EditStudentForm>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      username: '',
      email: '',
      phone: '',
      grade: 'غير محدد',
      isActive: true,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting }
  } = form;

  // ✅ Fetch student data when modal opens using API instance
  useEffect(() => {
    const fetchData = async () => {
      if (!student) return;
      try {
        console.log('🔄 Fetching student data for:', student._id);
        
        const response = await api.get(`/api/users/students/${student._id}`);
        
        console.log('✅ Student data loaded:', response.data);
        
        const studentData = response.data.data?.student || response.data.student;
        
        reset({
          username: studentData.username || '',
          email: studentData.email || '',
          phone: studentData.phone || '',
          grade: studentData.grade || 'غير محدد',
          isActive: studentData.isActive !== undefined ? studentData.isActive : true,
        });
      } catch (err: any) {
        console.error('❌ Failed to load student data:', err);
        const errorMessage = err.response?.data?.message || err.message || 'فشل تحميل بيانات الطالب';
        toast.error(errorMessage);
      }
    };

    if (isOpen && student) {
      fetchData();
    }
  }, [isOpen, student, reset]);

  // ✅ Submit handler using API instance
  const onSubmit = async (values: EditStudentForm) => {
    if (!student) return;
    
    try {
      console.log('📝 Updating student:', student._id, values);
      
      const response = await api.patch(`/api/users/students/${student._id}`, values);

      console.log('✅ Student updated:', response.data);

      toast.success('✅ تم تحديث بيانات الطالب بنجاح');
      
      // ✅ Refresh the students list immediately
      onStudentUpdated();
      
      // Close modal
      onClose();
      
    } catch (err: any) {
      console.error('❌ Update error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء تحديث بيانات الطالب';
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  if (!isOpen || !student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        dir="rtl"
        className="sm:max-w-[600px] rounded-2xl bg-white overflow-hidden text-right"
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">تعديل بيانات الطالب</DialogTitle>
              <DialogDescription className="text-gray-600">
                تعديل بيانات الطالب: {student.username}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-1">
              <User className="w-4 h-4 text-gray-400" /> اسم المستخدم
            </Label>
            <Input 
              id="username" 
              {...register('username')} 
              placeholder="أدخل اسم المستخدم" 
              disabled={isSubmitting}
            />
            {errors.username && (
              <p className="text-red-600 text-sm">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1">
              <Mail className="w-4 h-4 text-gray-400" /> البريد الإلكتروني
            </Label>
            <Input 
              id="email" 
              type="email" 
              {...register('email')} 
              placeholder="أدخل البريد الإلكتروني" 
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-gray-400" /> رقم الهاتف
            </Label>
            <Input 
              id="phone" 
              {...register('phone')} 
              placeholder="مثال: 01012345678" 
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Grade */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-gray-400" /> الصف الدراسي
            </Label>
            <Select
              onValueChange={(val) => setValue('grade', val)}
              value={getValues('grade')}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الصف الدراسي" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="غير محدد">غير محدد</SelectItem>
                <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <Label className="text-gray-700">حالة الحساب</Label>
            <button
              type="button"
              onClick={() => setValue('isActive', !getValues('isActive'))}
              disabled={isSubmitting}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                getValues('isActive') ? 'bg-green-500' : 'bg-gray-300'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  getValues('isActive') ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <DialogFooter className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentModal;