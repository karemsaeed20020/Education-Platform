/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/parents/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Mail, Phone, Link, Search, User, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Parent {
  _id: string;
  username: string;
  email: string;
  phone: string;
  children: Array<{
    _id: string;
    username: string;
    email: string;
    grade: string;
  }>;
  createdAt: string;
}

interface Student {
  _id: string;
  username: string;
  email: string;
  grade: string;
}

export default function AdminParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '123456',
    confirmPassword: '123456',
    children: [] as string[]
  });

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/parents', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('فشل في جلب بيانات أولياء الأمور');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setParents(data.data.parents);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      toast.error('فشل في تحميل بيانات أولياء الأمور');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/students', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setStudents(data.data.students);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/parents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          confirmPassword: formData.password // Ensure they match
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في إنشاء حساب ولي الأمر');
      }

      if (response.ok) {
        toast.success(`تم إنشاء الحساب بنجاح! كلمة المرور: ${formData.password}`);
        setCreateDialogOpen(false);
        setFormData({
          username: '',
          email: '',
          phone: '',
          password: '123456',
          confirmPassword: '123456',
          children: []
        });
        fetchParents(); // Refresh list
      }
    } catch (error: any) {
      console.error('Error creating parent:', error);
      toast.error(error.message || 'فشل في إنشاء حساب ولي الأمر');
    }
  };

  const handleLinkStudent = async (studentId: string) => {
    if (!selectedParent) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/parents/${selectedParent._id}/link-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ studentId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في ربط الطالب');
      }

      if (response.ok) {
        toast.success('تم ربط الطالب بولي الأمر بنجاح');
        setLinkDialogOpen(false);
        setSelectedParent(null);
        fetchParents(); // Refresh list
      }
    } catch (error: any) {
      console.error('Error linking student:', error);
      toast.error(error.message || 'فشل في ربط الطالب');
    }
  };

  const handleUnlinkStudent = async (parentId: string, studentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/parents/${parentId}/unlink-student/${studentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في فصل الطالب');
      }

      if (response.ok) {
        toast.success('تم فصل الطالب عن ولي الأمر بنجاح');
        fetchParents(); // Refresh list
      }
    } catch (error: any) {
      console.error('Error unlinking student:', error);
      toast.error(error.message || 'فشل في فصل الطالب');
    }
  };

  const handleResetPassword = async (parentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/parents/${parentId}/reset-password`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في إعادة تعيين كلمة المرور');
      }

      if (response.ok) {
        toast.success('تم إعادة تعيين كلمة المرور بنجاح');
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'فشل في إعادة تعيين كلمة المرور');
    }
  };

  const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const filteredParents = parents.filter(parent =>
    parent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات أولياء الأمور...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة أولياء الأمور</h1>
          <p className="text-gray-600 mt-2">إنشاء وإدارة حسابات أولياء الأمور وربطهم بالأبناء</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 ml-2" />
              إنشاء ولي أمر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>إنشاء حساب ولي أمر جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات ولي الأمر - سيتم عرض كلمة المرور لك بعد الإنشاء
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateParent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم المستخدم</label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="اسم ولي الأمر"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الهاتف</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="01012345678"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({
                      ...formData, 
                      password: e.target.value,
                      confirmPassword: e.target.value
                    })}
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const randomPass = generateRandomPassword();
                      setFormData({
                        ...formData, 
                        password: randomPass,
                        confirmPassword: randomPass
                      });
                      toast.success(`تم إنشاء كلمة مرور: ${randomPass}`);
                    }}
                  >
                    توليد عشوائي
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  كلمة المرور الحالية: <strong>{formData.password}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ربط الأبناء (اختياري)</label>
                <Select onValueChange={(value) => {
                  if (value && !formData.children.includes(value)) {
                    setFormData({
                      ...formData,
                      children: [...formData.children, value]
                    });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطالب لإضافته" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student._id} value={student._id}>
                        {student.username} - {student.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Selected children */}
                {formData.children.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.children.map(childId => {
                      const student = students.find(s => s._id === childId);
                      return student ? (
                        <Badge key={childId} variant="secondary" className="flex items-center gap-1">
                          {student.username}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              children: formData.children.filter(id => id !== childId)
                            })}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit">
                  إنشاء الحساب
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث في أولياء الأمور بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parents Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة أولياء الأمور</CardTitle>
          <CardDescription>
            {filteredParents.length} ولي أمر في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-bold">ولي الأمر</TableHead>
                  <TableHead className="text-right font-bold">معلومات التواصل</TableHead>
                  <TableHead className="text-right font-bold">الأبناء</TableHead>
                  <TableHead className="text-right font-bold">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-right font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParents.map((parent) => (
                  <TableRow key={parent._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3 justify-end">
                        <div className="text-right">
                          <div className="font-medium">{parent.username}</div>
                        </div>
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2 justify-end">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{parent.email}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{parent.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {parent.children.length > 0 ? (
                          parent.children.map(child => (
                            <Badge 
                              key={child._id} 
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <User className="h-3 w-3" />
                              {child.username}
                              <span className="text-xs text-gray-500">({child.grade})</span>
                              <button
                                onClick={() => handleUnlinkStudent(parent._id, child._id)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-500">
                            لا يوجد أبناء
                          </Badge>
                        )}
                      </div>
                      {parent.children.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {parent.children.length} ابن
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm">
                        {new Date(parent.createdAt).toLocaleDateString('ar-EG')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(parent.createdAt).toLocaleTimeString('ar-EG')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        {/* Link Student Button */}
                        <Dialog open={linkDialogOpen && selectedParent?._id === parent._id} onOpenChange={(open) => {
                          if (!open) {
                            setLinkDialogOpen(false);
                            setSelectedParent(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedParent(parent);
                                setLinkDialogOpen(true);
                              }}
                            >
                              <Link className="h-4 w-4 ml-2" />
                              ربط ابن
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                              <DialogTitle>ربط ابن جديد</DialogTitle>
                              <DialogDescription>
                                اختر الطالب لربطه بولي الأمر {parent.username}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              {students
                                .filter(student => !parent.children.some(child => child._id === student._id))
                                .map(student => (
                                  <div key={student._id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="text-right">
                                      <div className="font-medium">{student.username}</div>
                                      <div className="text-sm text-gray-500">{student.grade} - {student.email}</div>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handleLinkStudent(student._id)}
                                    >
                                      <Link className="h-4 w-4 ml-2" />
                                      ربط
                                    </Button>
                                  </div>
                                ))}
                              
                              {students.filter(student => !parent.children.some(child => child._id === student._id)).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                  <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                  <p>لا توجد طلاب متاحين للربط</p>
                                  <p className="text-sm">جميع الطلاب مرتبطين بالفعل</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Reset Password Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(parent._id)}
                        >
                          <RefreshCw className="h-4 w-4 ml-2" />
                          إعادة تعيين
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredParents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'لا توجد نتائج' : 'لا يوجد أولياء أمور'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'لم نعثر على أي ولي أمر يطابق بحثك' 
                  : 'لم يتم إنشاء أي حساب ولي أمر بعد'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  className="mt-4"
                >
                  <UserPlus className="h-4 w-4 ml-2" />
                  إنشاء أول ولي أمر
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}