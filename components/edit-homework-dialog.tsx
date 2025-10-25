/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

interface Homework {
  _id: string;
  title: string;
  description: string;
  grade: string;
  dueDate: string;
  type: 'text' | 'file' | 'mixed';
  status: 'active' | 'archived';
  content: {
    text?: string;
    files: Array<{
      originalName: string;
      path: string;
      size: number;
      mimetype: string;
    }>;
  };
  createdAt: string;
}

interface EditHomeworkDialogProps {
  homework: Homework | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHomeworkUpdated: () => void;
}

export function EditHomeworkDialog({ homework, open, onOpenChange, onHomeworkUpdated }: EditHomeworkDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: 'الصف الثاني الثانوي',
    dueDate: '',
    textContent: '',
    status: 'active' as 'active' | 'archived'
  });

  useEffect(() => {
    if (homework) {
      setFormData({
        title: homework.title,
        description: homework.description,
        grade: homework.grade,
        dueDate: homework.dueDate.split('T')[0],
        textContent: homework.content.text || '',
        status: homework.status
      });
    }
  }, [homework]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homework) return;

    setLoading(true);
    try {
      const response = await api.put(`/api/homework/${homework._id}`, {
        title: formData.title,
        description: formData.description,
        grade: formData.grade,
        dueDate: formData.dueDate,
        textContent: formData.textContent,
        status: formData.status
      });

      if (response.data.success) {
        toast.success('تم تحديث الواجب بنجاح');
        onOpenChange(false);
        onHomeworkUpdated();
      } else {
        throw new Error(response.data.message || 'حدث خطأ أثناء التحديث');
      }
    } catch (error: any) {
      console.error('Error updating homework:', error);
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء التحديث';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>تعديل الواجب</DialogTitle>
          <DialogDescription>
            قم بتعديل بيانات الواجب لمادة اللغة العربية
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">عنوان الواجب</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="أدخل عنوان الواجب"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">وصف الواجب</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="أدخل وصف مفصل للواجب"
                rows={3}
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-grade">الصف الدراسي</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData({...formData, grade: value})}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                    <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dueDate">موعد التسليم</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-textContent">محتوى الواجب</Label>
              <Textarea
                id="edit-textContent"
                value={formData.textContent}
                onChange={(e) => setFormData({...formData, textContent: e.target.value})}
                placeholder="محتوى الواجب النصي..."
                rows={3}
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <Label htmlFor="homework-status" className="cursor-pointer">
                حالة النشر للطلاب
              </Label>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${formData.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                  {formData.status === 'active' ? 'منشور' : 'مؤرشف'}
                </span>
                <Switch
                  id="homework-status"
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, status: checked ? 'active' : 'archived'})
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}