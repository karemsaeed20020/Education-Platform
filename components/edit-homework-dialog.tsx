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
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/redux/slices/authSlice';

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
  const [fetchingData, setFetchingData] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: 'الصف الثاني الثانوي',
    dueDate: '',
    textContent: '',
    status: 'active' as 'active' | 'archived'
  });

  // ✅ Fetch homework data when modal opens
  useEffect(() => {
    const fetchHomeworkData = async () => {
      if (!homework || !open) return;
      
      try {
        setFetchingData(true);
        console.log('🔄 Fetching homework data for edit:', homework._id);
        
        const response = await api.get(`/api/homework/${homework._id}`);
        console.log('📡 Homework data response:', response.data);
        
        if (response.data.status === 'success') {
          const hwData = response.data.data.homework;
          
          // Format date for datetime-local input
          const formattedDate = hwData.dueDate 
            ? new Date(hwData.dueDate).toISOString().slice(0, 16)
            : '';
          
          setFormData({
            title: hwData.title || '',
            description: hwData.description || '',
            grade: hwData.grade || 'الصف الثاني الثانوي',
            dueDate: formattedDate,
            textContent: hwData.content?.text || '',
            status: hwData.status || 'active'
          });
          
          console.log('✅ Homework data loaded for editing');
        } else {
          throw new Error(response.data.message || 'فشل تحميل بيانات الواجب');
        }
      } catch (error: any) {
        console.error('❌ Error fetching homework data:', error);
        const message = error.response?.data?.message || error.message || 'حدث خطأ في تحميل بيانات الواجب';
        toast.error(message);
      } finally {
        setFetchingData(false);
      }
    };

    if (open && homework) {
      fetchHomeworkData();
    }
  }, [homework, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homework) return;

    setLoading(true);
    try {
      console.log('📝 Updating homework:', homework._id, formData);
      
      const response = await api.put(`/api/homework/${homework._id}`, {
        title: formData.title,
        description: formData.description,
        grade: formData.grade,
        dueDate: formData.dueDate,
        textContent: formData.textContent,
        status: formData.status
      });

      console.log('📡 Update response:', response.data);

      if (response.data.status === 'success' || response.data.success) {
        toast.success('✅ تم تحديث الواجب بنجاح');
        onOpenChange(false);
        onHomeworkUpdated();
      } else {
        throw new Error(response.data.message || 'حدث خطأ أثناء التحديث');
      }
    } catch (error: any) {
      console.error('❌ Error updating homework:', error);
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء التحديث';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !fetchingData) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل الواجب</DialogTitle>
          <DialogDescription>
            قم بتعديل بيانات الواجب لمادة اللغة العربية
          </DialogDescription>
        </DialogHeader>

        {fetchingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="mr-3 text-gray-600">جاري تحميل البيانات...</span>
          </div>
        ) : (
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
                    type="datetime-local"
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

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading || fetchingData}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={loading || fetchingData}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}