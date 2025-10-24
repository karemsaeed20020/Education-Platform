/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { z } from 'zod';
import { Trash2, AlertTriangle } from 'lucide-react';
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
import { Student } from '@/types';

// ✅ Validation schema (useful for ensuring student object)
const deleteSchema = z.object({
  id: z.string().min(1, 'معرّف الطالب مفقود'),
  username: z.string(),
  email: z.string().email(),
  grade: z.string().optional(),
});

type DeleteForm = z.infer<typeof deleteSchema>;

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (student: DeleteForm) => Promise<void>;
  student: Student | null;
  isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  student,
  isLoading,
}) => {
  const form = useForm<DeleteForm>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      id: student?._id || '',
      username: student?.username || '',
      email: student?.email || '',
      grade: student?.grade || '',
    },
  });

  const handleDelete = async () => {
    if (!student) return;
    try {
      await onConfirm(form.getValues());
      toast.success('✅ تم حذف الطالب بنجاح');
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  if (!isOpen || !student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        dir="rtl"
        className="sm:max-w-[480px] rounded-2xl bg-white p-0 overflow-hidden flex flex-col justify-center items-center text-right"
      >
        <DialogHeader className="w-full px-6 py-5 flex items-center gap-3 border-b border-gray-200">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className='text-center'>
            <DialogTitle className="text-lg font-bold text-gray-900">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-gray-600">
              هل أنت متأكد من رغبتك في حذف هذا الطالب؟
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="w-full px-6 py-5 bg-gray-50 space-y-3 border-b border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-600">اسم الطالب:</span>
            <span className="text-gray-900">{student.username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-600">البريد الإلكتروني:</span>
            <span className="text-gray-900">{student.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-600">الصف الدراسي:</span>
            <span className="text-gray-900">{student.grade || 'غير محدد'}</span>
          </div>
        </div>

        <div className="w-full bg-red-50 border-l-4 border-red-400 px-6 py-4 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 leading-relaxed">
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف بيانات الطالب بشكل دائم.
          </p>
        </div>


        <DialogFooter className="flex w-full gap-3 px-6 py-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                تأكيد الحذف
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
