'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, FileText, Download, Edit, Trash2, Star, BookOpen, Megaphone, Lightbulb, RefreshCw } from 'lucide-react';

interface EducationalContent {
  _id: string;
  title: string;
  description: string;
  type: string;
  fileType: string;
  category: string;
  grade: string;
  content: string;
  isImportant: boolean;
  files: Array<{
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
  }>;
  createdAt: string;
}

export default function EducationalContentPage() {
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'ملف_دراسي',
    fileType: 'pdf',
    category: 'نحو',
    grade: 'الصف الثاني الثانوي',
    content: '',
    isImportant: 'false'
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/educational-content/teacher', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 'success') {
        setContents(data.data.contents);
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newContent.title);
      formData.append('description', newContent.description);
      formData.append('type', newContent.type);
      formData.append('fileType', newContent.fileType);
      formData.append('category', newContent.category);
      formData.append('grade', newContent.grade);
      formData.append('content', newContent.content);
      formData.append('isImportant', newContent.isImportant);

      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:5000/api/educational-content', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setNewContent({
          title: '',
          description: '',
          type: 'ملف_دراسي',
          fileType: 'pdf',
          category: 'نحو',
          grade: 'الصف الثاني الثانوي',
          content: '',
          isImportant: 'false'
        });
        setFiles([]);
        fetchContents();
      }
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/educational-content/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchContents();
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const downloadFile = async (contentId: string, fileIndex: number) => {
    try {
      window.open(`http://localhost:5000/api/educational-content/${contentId}/download/${fileIndex}`, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'ملف_دراسي': FileText,
      'مرجع_إضافي': BookOpen,
      'ملاحظة_عامة': FileText,
      'تنبيه_مهم': Megaphone,
      'توجيه_دراسي': Lightbulb,
      'تحديث_منهج': RefreshCw
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getTypeBadge = (type: string) => {
  const typeConfig = {
    'ملف_دراسي': { label: 'ملف دراسي', variant: 'default' as const },
    'مرجع_إضافي': { label: 'مرجع إضافي', variant: 'secondary' as const },
    'ملاحظة_عامة': { label: 'ملاحظة عامة', variant: 'outline' as const },
    'تنبيه_مهم': { label: 'تنبيه مهم', variant: 'destructive' as const },
    'توجيه_دراسي': { label: 'توجيه دراسي', variant: 'default' as const }, // Changed from 'success' to 'default'
    'تحديث_منهج': { label: 'تحديث منهج', variant: 'default' as const }
  };
  
  const config = typeConfig[type as keyof typeof typeConfig];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || content.type === typeFilter;
    const matchesGrade = gradeFilter === 'all' || content.grade === gradeFilter;
    return matchesSearch && matchesType && matchesGrade;
  });

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المحتوى التعليمي</h1>
          <p className="text-gray-600 mt-2">رفع الملفات الدراسية، الاختبارات، والملاحظات</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              محتوى جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة محتوى تعليمي جديد</DialogTitle>
              <DialogDescription>
                املأ بيانات المحتوى التعليمي الجديد
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createContent}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">عنوان المحتوى</Label>
                  <Input
                    id="title"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                    placeholder="أدخل عنوان المحتوى"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">وصف المحتوى</Label>
                  <Textarea
                    id="description"
                    value={newContent.description}
                    onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                    placeholder="أدخل وصف المحتوى"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">نوع المحتوى</Label>
                    <Select
                      value={newContent.type}
                      onValueChange={(value) => setNewContent({...newContent, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ملف_دراسي">ملف دراسي</SelectItem>
                        <SelectItem value="مرجع_إضافي">مرجع إضافي</SelectItem>
                        <SelectItem value="ملاحظة_عامة">ملاحظة عامة</SelectItem>
                        <SelectItem value="تنبيه_مهم">تنبيه مهم</SelectItem>
                        <SelectItem value="توجيه_دراسي">توجيه دراسي</SelectItem>
                        <SelectItem value="تحديث_منهج">تحديث منهج</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="grade">الصف الدراسي</Label>
                    <Select
                      value={newContent.grade}
                      onValueChange={(value) => setNewContent({...newContent, grade: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
                        <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
                        <SelectItem value="كلاهما">كلاهما</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fileType">نوع الملف</Label>
                    <Select
                      value={newContent.fileType}
                      onValueChange={(value) => setNewContent({...newContent, fileType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الملف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="word">Word</SelectItem>
                        <SelectItem value="powerpoint">PowerPoint</SelectItem>
                        <SelectItem value="text">نص</SelectItem>
                        <SelectItem value="none">لا يوجد ملف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">التصنيف</Label>
                    <Select
                      value={newContent.category}
                      onValueChange={(value) => setNewContent({...newContent, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="نحو">نحو</SelectItem>
                        <SelectItem value="صرف">صرف</SelectItem>
                        <SelectItem value="بلاغة">بلاغة</SelectItem>
                        <SelectItem value="أدب">أدب</SelectItem>
                        <SelectItem value="نصوص">نصوص</SelectItem>
                        <SelectItem value="إملاء">إملاء</SelectItem>
                        <SelectItem value="كتاب">كتاب</SelectItem>
                        <SelectItem value="ورقة_عمل">ورقة عمل</SelectItem>
                        <SelectItem value="اختبار">اختبار</SelectItem>
                        <SelectItem value="عام">عام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">المحتوى النصي</Label>
                  <Textarea
                    id="content"
                    value={newContent.content}
                    onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                    placeholder="أدخل المحتوى النصي هنا..."
                    rows={4}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>رفع ملفات</Label>
                  <Input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                  />
                  <p className="text-sm text-gray-500">
                    {files.length > 0 ? `${files.length} ملف محدد` : 'لم يتم اختيار أي ملفات'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="important"
                    type="checkbox"
                    checked={newContent.isImportant === 'true'}
                    onChange={(e) => setNewContent({...newContent, isImportant: e.target.checked.toString()})}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="important" className="flex items-center gap-2 cursor-pointer">
                    <Star className="h-4 w-4 text-yellow-500" />
                   标记 كمحتوى مهم
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">إضافة المحتوى</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث في المحتوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="ملف_دراسي">ملف دراسي</SelectItem>
                  <SelectItem value="مرجع_إضافي">مرجع إضافي</SelectItem>
                  <SelectItem value="ملاحظة_عامة">ملاحظة عامة</SelectItem>
                  <SelectItem value="تنبيه_مهم">تنبيه مهم</SelectItem>
                  <SelectItem value="توجيه_دراسي">توجيه دراسي</SelectItem>
                  <SelectItem value="تحديث_منهج">تحديث منهج</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="كلاهما">كلاهما</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المحتوى التعليمي</CardTitle>
          <CardDescription>
            جميع الملفات الدراسية، الملاحظات، والتنبيهات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-bold border-l w-[250px]">العنوان</TableHead>
                  <TableHead className="text-right font-bold border-l w-[120px]">النوع</TableHead>
                  <TableHead className="text-right font-bold border-l w-[100px]">الصف</TableHead>
                  <TableHead className="text-right font-bold border-l w-[120px]">التصنيف</TableHead>
                  <TableHead className="text-right font-bold border-l w-[150px]">الملفات</TableHead>
                  <TableHead className="text-right font-bold w-[120px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContents.map((content) => {
                  const Icon = getTypeIcon(content.type);
                  return (
                    <TableRow key={content._id} className="hover:bg-gray-50 border-b">
                      <TableCell className="font-medium text-right border-l py-3">
                        <div className="flex items-center gap-2 justify-end">
                          {content.isImportant && <Star className="h-4 w-4 text-yellow-500" />}
                          <Icon className="h-4 w-4 text-blue-500" />
                          {content.title}
                        </div>
                      </TableCell>
                      <TableCell className="border-l py-3">
                        {getTypeBadge(content.type)}
                      </TableCell>
                      <TableCell className="text-right border-l py-3">
                        {content.grade}
                      </TableCell>
                      <TableCell className="text-right border-l py-3">
                        {content.category}
                      </TableCell>
                      <TableCell className="text-right border-l py-3">
                        {content.files.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {content.files.map((file, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => downloadFile(content._id, index)}
                              >
                                <Download className="h-3 w-3 ml-1" />
                                {file.originalName}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">لا توجد ملفات</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteContent(content._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}