'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

interface DailyGrade {
  _id: string;
  student: {
    _id: string;
    username: string;
    email: string;
    phone: string;
  };
  date: string;
  type: string;
  topic: string;
  score: number;
  maxScore: number;
  notes?: string;
  category: string;
  status: string;
}

interface EditGradeDialogProps {
  grade: DailyGrade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGradeUpdated: () => void;
}

export function EditGradeDialog({ grade, open, onOpenChange, onGradeUpdated }: EditGradeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'تسميع',
    topic: '',
    score: '',
    maxScore: '100',
    notes: '',
    category: 'نحوي',
    status: 'مكتمل'
  });

  useEffect(() => {
    if (grade) {
      setFormData({
        type: grade.type,
        topic: grade.topic,
        score: grade.score.toString(),
        maxScore: grade.maxScore.toString(),
        notes: grade.notes || '',
        category: grade.category,
        status: grade.status
      });
    }
  }, [grade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grade) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/daily-grades/${grade._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: parseInt(formData.score) || 0,
          notes: formData.notes,
          status: formData.status
        })
      });

      if (response.ok) {
        toast.success('تم تحديث التقييم بنجاح');
        onOpenChange(false);
        onGradeUpdated();
      } else {
        const error = await response.json();
        toast.error(error.message || 'حدث خطأ أثناء التحديث');
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      toast.error('حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل التقييم</DialogTitle>
          <DialogDescription>
            تعديل بيانات التقييم للطالب {grade?.student.username}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>الطالب</Label>
              <Input
                value={grade?.student.username || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label>نوع التقييم</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleInputChange('type', v)}
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="تسميع">تسميع</SelectItem>
                  <SelectItem value="اختبار">اختبار</SelectItem>
                  <SelectItem value="مشاركة">مشاركة</SelectItem>
                  <SelectItem value="واجب">واجب</SelectItem>
                  <SelectItem value="أنشطة">أنشطة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>الموضوع</Label>
              <Input
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>الدرجة</Label>
                <Input
                  type="number"
                  min="0"
                  max={formData.maxScore}
                  value={formData.score}
                  onChange={(e) => handleInputChange('score', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>الدرجة الكاملة</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxScore}
                  onChange={(e) => handleInputChange('maxScore', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>التصنيف</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => handleInputChange('category', v)}
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نحوي">نحوي</SelectItem>
                  <SelectItem value="صرفي">صرفي</SelectItem>
                  <SelectItem value="بلاغة">بلاغة</SelectItem>
                  <SelectItem value="أدب">أدب</SelectItem>
                  <SelectItem value="نصوص">نصوص</SelectItem>
                  <SelectItem value="إملاء">إملاء</SelectItem>
                  <SelectItem value="قراءة">قراءة</SelectItem>
                  <SelectItem value="كتابة">كتابة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleInputChange('status', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="مكتمل">مكتمل</SelectItem>
                  <SelectItem value="ناقص">ناقص</SelectItem>
                  <SelectItem value="متأخر">متأخر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>ملاحظات</Label>
              <Input
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="ملاحظات إضافية"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}