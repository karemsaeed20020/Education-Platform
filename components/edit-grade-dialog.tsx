/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

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

    // Validate score
    const score = parseInt(formData.score) || 0;
    const maxScore = parseInt(formData.maxScore) || 100;
    
    if (score < 0) {
      toast.error('الدرجة يجب أن تكون أكبر من أو تساوي صفر');
      return;
    }
    
    if (score > maxScore) {
      toast.error('الدرجة لا يمكن أن تكون أكبر من الدرجة الكاملة');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/api/daily-grades/${grade._id}`, {
        score: score,
        maxScore: maxScore,
        notes: formData.notes,
        status: formData.status
      });

      if (response.data.success) {
        toast.success('تم تحديث التقييم بنجاح');
        onOpenChange(false);
        onGradeUpdated();
      } else {
        throw new Error(response.data.message || 'حدث خطأ أثناء التحديث');
      }
    } catch (error: any) {
      console.error('Error updating grade:', error);
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء التحديث';
      toast.error(errorMessage);
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

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  const calculatePercentage = () => {
    const score = parseInt(formData.score) || 0;
    const maxScore = parseInt(formData.maxScore) || 100;
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Percentage Display */}
            <div className="grid gap-2">
              <Label>النسبة المئوية</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={`${calculatePercentage()}%`}
                  disabled
                  className="bg-gray-50"
                />
                <div className={`w-16 text-center text-sm font-medium ${
                  calculatePercentage() >= 90 ? 'text-green-600' :
                  calculatePercentage() >= 80 ? 'text-blue-600' :
                  calculatePercentage() >= 70 ? 'text-yellow-600' :
                  calculatePercentage() >= 50 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {calculatePercentage() >= 90 ? 'ممتاز' :
                   calculatePercentage() >= 80 ? 'جيد جداً' :
                   calculatePercentage() >= 70 ? 'جيد' :
                   calculatePercentage() >= 50 ? 'مقبول' : 'ضعيف'}
                </div>
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
                disabled={loading}
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
                disabled={loading}
              />
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