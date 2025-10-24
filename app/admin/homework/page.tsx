'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  MoreVertical,
  Send,
  Archive
} from 'lucide-react';
import { EditHomeworkDialog } from '@/components/edit-homework-dialog';
import { DeleteConfirmModal } from '@/components/delete-confirm-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast, { Toaster } from 'react-hot-toast';

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

export default function HomeworkManagementPage() {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    grade: 'الصف الثاني الثانوي',
    dueDate: '',
    textContent: ''
  });

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const fetchHomeworks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/homework/teacher', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 'success') {
        setHomeworks(data.data.homeworks);
      }
    } catch (error) {
      console.error('Error fetching homeworks:', error);
      toast.error('حدث خطأ في تحميل الواجبات');
    } finally {
      setLoading(false);
    }
  };

  const createHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newHomework.title);
      formData.append('description', newHomework.description);
      formData.append('grade', newHomework.grade);
      formData.append('dueDate', newHomework.dueDate);
      formData.append('textContent', newHomework.textContent);

      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:5000/api/homework', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        toast.success('تم إنشاء الواجب بنجاح');
        setIsCreateDialogOpen(false);
        setNewHomework({ 
          title: '', 
          description: '', 
          grade: 'الصف الثاني الثانوي', 
          dueDate: '',
          textContent: '' 
        });
        setFiles([]);
        fetchHomeworks();
      } else {
        const error = await response.json();
        toast.error(error.message || 'حدث خطأ أثناء إنشاء الواجب');
      }
    } catch (error) {
      console.error('Error creating homework:', error);
      toast.error('حدث خطأ أثناء إنشاء الواجب');
    }
  };

  const handleEdit = (homework: Homework) => {
    setSelectedHomework(homework);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (homework: Homework) => {
    setSelectedHomework(homework);
    setIsDeleteModalOpen(true);
  };

  const deleteHomework = async () => {
    if (!selectedHomework) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/homework/${selectedHomework._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('تم حذف الواجب بنجاح');
        setIsDeleteModalOpen(false);
        setSelectedHomework(null);
        fetchHomeworks();
      } else {
        const error = await response.json();
        toast.error(error.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting homework:', error);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setDeleteLoading(false);
    }
  };

  const publishHomework = async (homework: Homework) => {
    try {
      const response = await fetch(`http://localhost:5000/api/homework/${homework._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'active'
        })
      });

      if (response.ok) {
        toast.success('تم نشر الواجب للطلاب بنجاح');
        fetchHomeworks();
      } else {
        const error = await response.json();
        toast.error(error.message || 'حدث خطأ أثناء نشر الواجب');
      }
    } catch (error) {
      console.error('Error publishing homework:', error);
      toast.error('حدث خطأ أثناء نشر الواجب');
    }
  };

  const unpublishHomework = async (homework: Homework) => {
    try {
      const response = await fetch(`http://localhost:5000/api/homework/${homework._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'archived'
        })
      });

      if (response.ok) {
        toast.success('تم إخفاء الواجب عن الطلاب بنجاح');
        fetchHomeworks();
      } else {
        const error = await response.json();
        toast.error(error.message || 'حدث خطأ أثناء إخفاء الواجب');
      }
    } catch (error) {
      console.error('Error unpublishing homework:', error);
      toast.error('حدث خطأ أثناء إخفاء الواجب');
    }
  };

  // Updated download function using proxy
 // In your React component
const downloadFile = (homeworkId: string, fileIndex: number, fileName: string) => {
  try {
    // افتح الرابط مباشرة - سيتم التحميل تلقائياً
    window.open(
      `http://localhost:5000/api/homework/${homeworkId}/download/${fileIndex}`,
      '_blank'
    );
    toast.success('تم بدء التحميل');
  } catch (error) {
    console.error('Download error:', error);
    toast.error('حدث خطأ أثناء تحميل الملف');
  }
};
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const filteredHomeworks = homeworks.filter(hw => {
    const matchesSearch = hw.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || hw.grade === gradeFilter;
    const matchesStatus = statusFilter === 'all' || hw.status === statusFilter;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الواجبات...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">إدارة الواجبات</h1>
          <p className="text-gray-600 mt-2">لصفوف الثاني والثالث الثانوي - مادة اللغة العربية</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              واجب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء واجب جديد</DialogTitle>
              <DialogDescription>
                املأ بيانات الواجب الجديد لمادة اللغة العربية
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createHomework}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">عنوان الواجب</Label>
                  <Input
                    id="title"
                    value={newHomework.title}
                    onChange={(e) => setNewHomework({...newHomework, title: e.target.value})}
                    placeholder="أدخل عنوان الواجب"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">وصف الواجب</Label>
                  <Textarea
                    id="description"
                    value={newHomework.description}
                    onChange={(e) => setNewHomework({...newHomework, description: e.target.value})}
                    placeholder="أدخل وصف مفصل للواجب"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="grade">الصف الدراسي</Label>
                    <Select
                      value={newHomework.grade}
                      onValueChange={(value) => setNewHomework({...newHomework, grade: value})}
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
                    <Label htmlFor="dueDate">موعد التسليم</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={newHomework.dueDate}
                      onChange={(e) => setNewHomework({...newHomework, dueDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="textContent">محتوى الواجب (اختياري)</Label>
                  <Textarea
                    id="textContent"
                    value={newHomework.textContent}
                    onChange={(e) => setNewHomework({...newHomework, textContent: e.target.value})}
                    placeholder="يمكنك إضافة محتوى نصي للواجب هنا..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>رفع ملفات (PDF, Word, صور)</Label>
                  <Input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-gray-500">
                    {files.length > 0 ? `${files.length} ملف محدد` : 'لم يتم اختيار أي ملفات'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">إنشاء الواجب</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث في الواجبات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصفوف</SelectItem>
                  <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                  <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'archived')}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">منشور</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Homework Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الواجبات</CardTitle>
          <CardDescription>
            جميع واجبات مادة اللغة العربية للصفين الثاني والثالث الثانوي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-bold border-l w-[200px]">عنوان الواجب</TableHead>
                  <TableHead className="text-right font-bold border-l w-[120px]">الصف</TableHead>
                  <TableHead className="text-right font-bold border-l w-[120px]">موعد التسليم</TableHead>
                  <TableHead className="text-right font-bold border-l w-[100px]">الحالة</TableHead>
                  <TableHead className="text-right font-bold border-l w-[150px]">الملفات</TableHead>
                  <TableHead className="text-right font-bold w-[180px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHomeworks.map((homework) => (
                  <TableRow key={homework._id} className="hover:bg-gray-50 border-b">
                    <TableCell className="font-medium text-right border-l py-3">
                      <div>
                        <div className="font-semibold">{homework.title}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {homework.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right border-l py-3">
                      {homework.grade}
                    </TableCell>
                    <TableCell className="text-right border-l py-3">
                      {new Date(homework.dueDate).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell className="text-right border-l py-3">
                      <Badge 
                        variant={homework.status === 'active' ? 'default' : 'secondary'}
                        className={homework.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }
                      >
                        {homework.status === 'active' ? 'منشور' : 'مؤرشف'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right border-l py-3">
                      {homework.content.files.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {homework.content.files.map((file, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => downloadFile(homework._id, index, file.originalName)}
                            >
                              <Download className="h-3 w-3 ml-1" />
                              {file.originalName.length > 15 
                                ? `${file.originalName.substring(0, 15)}...` 
                                : file.originalName
                              }
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">لا توجد ملفات</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {homework.status === 'archived' ? (
                          <Button
                            size="sm"
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => publishHomework(homework)}
                          >
                            <Send className="h-3 w-3" />
                            نشر
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => unpublishHomework(homework)}
                          >
                            <Archive className="h-3 w-3" />
                            إخفاء
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(homework)}>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(homework)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredHomeworks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                لا توجد واجبات مطابقة للبحث
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Homework Dialog */}
      <EditHomeworkDialog
        homework={selectedHomework}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onHomeworkUpdated={fetchHomeworks}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={deleteHomework}
        title="حذف الواجب"
        description="هل أنت متأكد من رغبتك في حذف هذا الواجب؟ هذا الإجراء لا يمكن التراجع عنه."
        loading={deleteLoading}
      />
    </div>
  );
}