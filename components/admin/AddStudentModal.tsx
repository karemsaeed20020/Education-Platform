/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { X, User, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

// ✅ Validation schema
const studentSchema = z
  .object({
    username: z.string().min(3, 'اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل'),
    email: z.string().email('يرجى إدخال بريد إلكتروني صالح'),
    phone: z.string().regex(/^01[0125]\d{8}$/, 'رقم الهاتف غير صالح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'),
    confirmPassword: z.string(),
    grade: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

type StudentForm = z.infer<typeof studentSchema>;

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onStudentAdded }) => {
  const form = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      grade: 'غير محدد',
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  const onSubmit = async (data: StudentForm) => {
    try {
      console.log('📝 Adding new student:', { username: data.username, email: data.email });
      
      const response = await api.post('/api/users/students', data);

      console.log('✅ Student added successfully:', response.data);

      if (response.data.success || response.status === 201) {
        toast.success('✅ تم إضافة الطالب بنجاح');
        
        // ✅ Refresh the students list immediately
        onStudentAdded();
        
        // Reset form
        reset();
        
        // Close modal
        onClose();
      } else {
        throw new Error(response.data.message || 'فشل إضافة الطالب');
      }
    } catch (err: any) {
      console.error('❌ Add student error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء إضافة الطالب';
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* ✅ Centered modal with RTL */}
      <DialogContent
        dir="rtl"
        className="sm:max-w-[550px] rounded-2xl relative flex flex-col justify-center items-center top-1/2 left-1/2 
        -translate-x-1/2 -translate-y-1/2 fixed bg-white shadow-xl"
      >
        {/* Close button (top-left for RTL) */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-3 left-3 text-gray-500 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>

        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-lg font-bold text-gray-900">
            <User className="w-5 h-5 text-blue-600" /> إضافة طالب جديد
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            املأ البيانات لإضافة طالب جديد إلى النظام
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2 w-full">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="font-medium text-gray-700">اسم المستخدم *</Label>
            <Input 
              id="username" 
              {...register('username')} 
              placeholder="أدخل اسم المستخدم" 
              disabled={isSubmitting}
            />
            {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="font-medium text-gray-700">البريد الإلكتروني *</Label>
            <Input 
              id="email" 
              type="email" 
              {...register('email')} 
              placeholder="أدخل البريد الإلكتروني" 
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="font-medium text-gray-700">رقم الهاتف *</Label>
            <Input 
              id="phone" 
              {...register('phone')} 
              placeholder="مثال: 01012345678" 
              disabled={isSubmitting}
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            <p className="text-xs text-gray-500">يجب أن يبدأ الرقم بـ 010، 011، 012، أو 015</p>
          </div>

          {/* Grade */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="grade" className="font-medium text-gray-700">الصف الدراسي</Label>
            <Select 
              defaultValue="غير محدد" 
              onValueChange={(val) => setValue('grade', val)}
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

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="font-medium text-gray-700">كلمة المرور *</Label>
            <Input 
              id="password" 
              type="password" 
              {...register('password')} 
              placeholder="أدخل كلمة المرور" 
              disabled={isSubmitting}
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword" className="font-medium text-gray-700">تأكيد كلمة المرور *</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              {...register('confirmPassword')} 
              placeholder="أعد إدخال كلمة المرور" 
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <DialogFooter className="flex gap-3 pt-6">
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> جاري الإضافة...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" /> إضافة الطالب
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;