'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, BarChart3, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { EditGradeDialog } from '@/components/edit-grade-dialog';
import { DeleteGradeModal } from '@/components/delete-grade-modal';
import toast, { Toaster } from 'react-hot-toast';

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

interface Student {
  _id: string;
  username: string;
  email: string;
  phone: string;
  grade: string;
}

export default function GradesManagementPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [grades, setGrades] = useState<DailyGrade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('الصف الثاني الثانوي');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowGrades, setShowLowGrades] = useState(false);
  const [selectedGradeItem, setSelectedGradeItem] = useState<DailyGrade | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [newGrade, setNewGrade] = useState({
    studentId: '',
    type: 'تسميع',
    topic: '',
    score: '',
    maxScore: '100',
    notes: '',
    category: 'نحوي',
    status: 'مكتمل',
  });

  useEffect(() => {
    fetchGrades();
    fetchStudents();
  }, [selectedGrade, selectedDate]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/daily-grades/class/${selectedGrade}?date=${selectedDate}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setGrades(data.data.grades);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('حدث خطأ في تحميل التقييمات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/students', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        const filteredStudents = data.data.students.filter(
          (student: Student) => student.grade === selectedGrade
        );
        setStudents(filteredStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('حدث خطأ في تحميل قائمة الطلاب');
    }
  };

  const addGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gradeData = {
        ...newGrade,
        score: parseInt(newGrade.score) || 0,
        maxScore: parseInt(newGrade.maxScore) || 100,
        grade: selectedGrade,
        date: selectedDate,
      };

      const response = await fetch('http://localhost:5000/api/daily-grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(gradeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('تم إضافة التقييم بنجاح');
        setIsAddDialogOpen(false);
        setNewGrade({
          studentId: '',
          type: 'تسميع',
          topic: '',
          score: '',
          maxScore: '100',
          notes: '',
          category: 'نحوي',
          status: 'مكتمل',
        });
        fetchGrades();
      }
    } catch (error) {
      console.error('Error adding grade:', error);
      toast.error('حدث خطأ أثناء إضافة التقييم');
    }
  };

  const handleEdit = (grade: DailyGrade) => {
    setSelectedGradeItem(grade);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (grade: DailyGrade) => {
    setSelectedGradeItem(grade);
    setIsDeleteModalOpen(true);
  };

  const deleteGrade = async () => {
    if (!selectedGradeItem) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/daily-grades/${selectedGradeItem._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('تم حذف التقييم بنجاح');
        setIsDeleteModalOpen(false);
        setSelectedGradeItem(null);
        fetchGrades();
      } else {
        const error = await response.json();
        toast.error(error.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewGrade((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getTypeBadge = (type: string) => {
  const typeConfig = {
    تسميع: { label: 'تسميع', variant: 'default' as const },
    اختبار: { label: 'اختبار', variant: 'secondary' as const },
    مشاركة: { label: 'مشاركة', variant: 'outline' as const },
    واجب: { label: 'واجب', variant: 'default' as const }, // Changed from 'success' to 'default'
    أنشطة: { label: 'أنشطة', variant: 'destructive' as const },
  };

  const config = typeConfig[type as keyof typeof typeConfig];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 font-bold';
    if (score >= 75) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600 font-semibold';
  };

  const filteredGrades = grades.filter((g) => {
    const matchesName = g.student.username.toLowerCase().includes(searchTerm.toLowerCase());
    const passesScoreFilter = showLowGrades ? g.score < 50 : true;
    return matchesName && passesScoreFilter;
  });

  const getStatistics = () => {
    const total = grades.length;
    const avg =
      total > 0
        ? Math.round(
            grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / total
          )
        : 0;
    const excellent = grades.filter((g) => (g.score / g.maxScore) * 100 >= 85).length;
    const weak = grades.filter((g) => (g.score / g.maxScore) * 100 < 50).length;

    return { total, avg, excellent, weak };
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل التقييمات...</p>
        </div>
      </div>
    );
  }

  const stats = getStatistics();

  return (
    <div className="p-6 space-y-6">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقييمات اليومية</h1>
          <p className="text-gray-600 mt-2">
            إدارة درجات التسميع والاختبارات اليومية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                الإحصائيات
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إحصائيات اليوم</DialogTitle>
              </DialogHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-sm text-gray-600">عدد التقييمات</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.avg}%</p>
                    <p className="text-sm text-gray-600">متوسط الأداء</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{stats.excellent}</p>
                    <p className="text-sm text-gray-600">طلاب متميزين</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{stats.weak}</p>
                    <p className="text-sm text-gray-600">طلاب بحاجة دعم</p>
                  </div>
                </div>
              </CardContent>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إضافة درجة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة درجة جديدة</DialogTitle>
                <DialogDescription>
                  إضافة درجة يومية للطالب في مادة اللغة العربية
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={addGrade}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>الطالب</Label>
                    <Select
                      value={newGrade.studentId}
                      onValueChange={(v) => handleInputChange('studentId', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الطالب" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.username} - {s.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>نوع التقييم</Label>
                    <Select
                      value={newGrade.type}
                      onValueChange={(v) => handleInputChange('type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
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
                    <Label>التصنيف</Label>
                    <Select
                      value={newGrade.category}
                      onValueChange={(v) => handleInputChange('category', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
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
                    <Label>الموضوع</Label>
                    <Input
                      value={newGrade.topic}
                      onChange={(e) => handleInputChange('topic', e.target.value)}
                      placeholder="أدخل موضوع التقييم"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>الدرجة</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newGrade.score}
                        onChange={(e) => handleInputChange('score', e.target.value)}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>الدرجة الكاملة</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newGrade.maxScore}
                        onChange={(e) => handleInputChange('maxScore', e.target.value)}
                        placeholder="100"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>ملاحظات (اختياري)</Label>
                    <Input
                      value={newGrade.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="ملاحظات إضافية"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">إضافة الدرجة</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid gap-2">
              <Label htmlFor="grade">الصف الدراسي</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                  <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="search">بحث بالاسم</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="ابحث باسم الطالب"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pr-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="low-grades"
                type="checkbox"
                checked={showLowGrades}
                onChange={() => setShowLowGrades(!showLowGrades)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="low-grades" className="text-sm cursor-pointer">
                عرض الدرجات المنخفضة فقط
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>الدرجات اليومية</CardTitle>
          <CardDescription>
            درجات الطلاب ليوم {new Date(selectedDate).toLocaleDateString('ar-EG')}
            {showLowGrades && ' - عرض الدرجات المنخفضة فقط'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredGrades.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">لا توجد درجات</div>
              <p className="text-sm">
                {grades.length === 0 
                  ? 'لم يتم إضافة أي درجات لهذا اليوم' 
                  : 'لا توجد نتائج مطابقة للبحث'
                }
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-right font-bold border-l">الطالب</TableHead>
                    <TableHead className="text-right font-bold border-l">نوع التقييم</TableHead>
                    <TableHead className="text-right font-bold border-l">الموضوع</TableHead>
                    <TableHead className="text-right font-bold border-l">التصنيف</TableHead>
                    <TableHead className="text-center font-bold border-l">الدرجة</TableHead>
                    <TableHead className="text-center font-bold border-l">النسبة</TableHead>
                    <TableHead className="text-right font-bold border-l">ملاحظات</TableHead>
                    <TableHead className="text-right font-bold border-l">التاريخ</TableHead>
                    <TableHead className="text-right font-bold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.map((grade) => (
                    <TableRow key={grade._id} className="hover:bg-gray-50 border-b">
                      <TableCell className="font-medium text-right border-l py-3">
                        {grade.student.username}
                      </TableCell>
                      <TableCell className="border-l py-3">
                        {getTypeBadge(grade.type)}
                      </TableCell>
                      <TableCell className="text-right border-l py-3 max-w-[200px]">
                        <div className="truncate" title={grade.topic}>
                          {grade.topic}
                        </div>
                      </TableCell>
                      <TableCell className="text-right border-l py-3">
                        {grade.category}
                      </TableCell>
                      <TableCell className={`text-center border-l py-3 ${getScoreColor(grade.score)}`}>
                        {grade.score}/{grade.maxScore}
                      </TableCell>
                      <TableCell className={`text-center border-l py-3 ${getScoreColor(grade.score)}`}>
                        {Math.round((grade.score / grade.maxScore) * 100)}%
                      </TableCell>
                      <TableCell className="text-right border-l py-3 max-w-[200px]">
                        <div className="truncate" title={grade.notes || ''}>
                          {grade.notes || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-gray-600 py-3">
                        {new Date(grade.date).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(grade)}>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(grade)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Grade Dialog */}
      <EditGradeDialog
        grade={selectedGradeItem}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onGradeUpdated={fetchGrades}
      />

      {/* Delete Confirmation Modal */}
      <DeleteGradeModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={deleteGrade}
        loading={deleteLoading}
      />
    </div>
  );
}