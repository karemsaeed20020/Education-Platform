/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Plus, Search, FileText, Edit, Trash2, Eye, Clock, Award, Copy, X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/redux/slices/authSlice';

interface Question {
  _id?: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  grade: string;
  category: string;
  examType: string;
  duration: number;
  totalMarks: number;
  instructions: string;
  isPublished: boolean;
  tags: string[];
  questions: Question[];
  createdAt: string;
  teacher: {
    username: string;
  };
}

// 🔹 دوال API للاختبارات باستخدام axios
const examsApi = {
  // جلب الاختبارات
  getExams: async () => {
    const response = await api.get('/api/exams/teacher');
    return response.data;
  },

  // إنشاء اختبار جديد
  createExam: async (examData: any) => {
    const response = await api.post('/api/exams', examData);
    return response.data;
  },

  // تحديث أسئلة الاختبار
  updateExam: async (examId: string, updateData: any) => {
    const response = await api.put(`/api/exams/${examId}`, updateData);
    return response.data;
  },

  // حذف اختبار
  deleteExam: async (examId: string) => {
    const response = await api.delete(`/api/exams/${examId}`);
    return response.data;
  },

  // نشر/إلغاء نشر الاختبار
  publishExam: async (examId: string, publish: boolean) => {
    const response = await api.put(`/api/exams/${examId}`, {
      isPublished: publish.toString()
    });
    return response.data;
  }
};

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isQuestionsDialogOpen, setIsQuestionsDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    grade: 'الصف الثاني الثانوي',
    category: 'اختبار_شامل',
    examType: 'practice',
    duration: '60',
    totalMarks: '100',
    instructions: '',
    isPublished: 'false',
    tags: ''
  });

  const [newQuestion, setNewQuestion] = useState<Question>({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      
      // ✅ استخدام axios API بدلاً من fetch
      const data = await examsApi.getExams();
      
      if (data.status === 'success') {
        setExams(data.data.exams);
      }
    } catch (error: any) {
      console.error('Error fetching exams:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل الاختبارات';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Calculate total marks from questions
      const calculatedTotalMarks = currentQuestions.reduce((total, question) => total + question.marks, 0);

      const examData = {
        ...newExam,
        totalMarks: calculatedTotalMarks.toString(),
        questions: currentQuestions
      };

      // ✅ استخدام axios API بدلاً من fetch
      const data = await examsApi.createExam(examData);

      if (data.status === 'success') {
        toast.success('تم إنشاء الاختبار بنجاح');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchExams();
      } else {
        throw new Error(data.message || 'فشل في إنشاء الاختبار');
      }
    } catch (error: any) {
      console.error('Error creating exam:', error);
      const errorMessage = error.response?.data?.message || 'فشل في إنشاء الاختبار';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateExamQuestions = async (examId: string) => {
    setSaving(true);
    try {
      // ✅ استخدام axios API بدلاً من fetch
      const data = await examsApi.updateExam(examId, {
        questions: currentQuestions
      });

      if (data.status === 'success') {
        toast.success('تم تحديث أسئلة الاختبار بنجاح');
        setIsQuestionsDialogOpen(false);
        fetchExams();
      } else {
        throw new Error(data.message || 'فشل في تحديث الأسئلة');
      }
    } catch (error: any) {
      console.error('Error updating exam questions:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحديث الأسئلة';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const publishExam = async (examId: string, publish: boolean) => {
    try {
      // ✅ استخدام axios API بدلاً من fetch
      const data = await examsApi.publishExam(examId, publish);

      if (data.status === 'success') {
        toast.success(publish ? 'تم نشر الاختبار بنجاح' : 'تم إلغاء نشر الاختبار');
        fetchExams();
      } else {
        throw new Error(data.message || 'فشل في تحديث حالة النشر');
      }
    } catch (error: any) {
      console.error('Error publishing exam:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحديث حالة النشر';
      toast.error(errorMessage);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      toast.error('يرجى إدخال نص السؤال');
      return;
    }
    
    const emptyOptions = newQuestion.options.filter(opt => !opt.trim());
    if (emptyOptions.length > 0) {
      toast.error('يرجى ملء جميع الخيارات');
      return;
    }

    // Generate a temporary ID for the question
    const questionWithId = {
      ...newQuestion,
      _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setCurrentQuestions([...currentQuestions, questionWithId]);
    
    // Reset form
    setNewQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    });

    toast.success('تم إضافة السؤال بنجاح');
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...currentQuestions];
    updatedQuestions.splice(index, 1);
    setCurrentQuestions(updatedQuestions);
    toast.success('تم حذف السؤال');
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const deleteExam = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return;
    
    try {
      // ✅ استخدام axios API بدلاً من fetch
      const data = await examsApi.deleteExam(id);

      if (data.status === 'success') {
        toast.success('تم حذف الاختبار بنجاح');
        fetchExams();
      } else {
        throw new Error(data.message || 'فشل في حذف الاختبار');
      }
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      const errorMessage = error.response?.data?.message || 'فشل في حذف الاختبار';
      toast.error(errorMessage);
    }
  };

  const viewExam = (exam: Exam) => {
    setSelectedExam(exam);
    setIsViewDialogOpen(true);
  };

  const manageQuestions = (exam: Exam) => {
    setSelectedExam(exam);
    setCurrentQuestions(exam.questions || []);
    setIsQuestionsDialogOpen(true);
  };

  const resetForm = () => {
    setNewExam({
      title: '',
      description: '',
      grade: 'الصف الثاني الثانوي',
      category: 'اختبار_شامل',
      examType: 'practice',
      duration: '60',
      totalMarks: '100',
      instructions: '',
      isPublished: 'false',
      tags: ''
    });
    setCurrentQuestions([]);
    setNewQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    });
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'quiz': { label: 'اختبار سريع', variant: 'secondary' as const },
      'midterm': { label: 'منتصف الفصل', variant: 'default' as const },
      'final': { label: 'نهاية الفصل', variant: 'destructive' as const },
      'practice': { label: 'تدريبي', variant: 'outline' as const }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      'نحو': { label: 'نحو', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'صرف': { label: 'صرف', className: 'bg-green-100 text-green-800 border-green-200' },
      'بلاغة': { label: 'بلاغة', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'أدب': { label: 'أدب', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'نصوص': { label: 'نصوص', className: 'bg-red-100 text-red-800 border-red-200' },
      'إملاء': { label: 'إملاء', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      'اختبار_شامل': { label: 'شامل', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || exam.grade === gradeFilter;
    const matchesType = typeFilter === 'all' || exam.examType === typeFilter;
    return matchesSearch && matchesGrade && matchesType;
  });

  const totalMarks = currentQuestions.reduce((total, question) => total + question.marks, 0);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الاختبارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الاختبارات</h1>
          <p className="text-gray-600 mt-2">إنشاء وإدارة الاختبارات متعددة الخيارات</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              اختبار جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء اختبار جديد</DialogTitle>
              <DialogDescription>
                أضف أسئلة متعددة الخيارات للاختبار
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createExam}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">عنوان الاختبار *</Label>
                  <Input
                    id="title"
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                    placeholder="أدخل عنوان الاختبار"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">وصف الاختبار</Label>
                  <Textarea
                    id="description"
                    value={newExam.description}
                    onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                    placeholder="أدخل وصفاً مختصراً للاختبار"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="grade">الصف الدراسي *</Label>
                    <Select
                      value={newExam.grade}
                      onValueChange={(value) => setNewExam({...newExam, grade: value})}
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

                  <div className="grid gap-2">
                    <Label htmlFor="examType">نوع الاختبار *</Label>
                    <Select
                      value={newExam.examType}
                      onValueChange={(value) => setNewExam({...newExam, examType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">اختبار سريع</SelectItem>
                        <SelectItem value="midterm">منتصف الفصل</SelectItem>
                        <SelectItem value="final">نهاية الفصل</SelectItem>
                        <SelectItem value="practice">تدريبي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">التصنيف *</Label>
                    <Select
                      value={newExam.category}
                      onValueChange={(value) => setNewExam({...newExam, category: value})}
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
                        <SelectItem value="اختبار_شامل">شامل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">المدة (دقائق) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newExam.duration}
                      onChange={(e) => setNewExam({...newExam, duration: e.target.value})}
                      placeholder="60"
                      min="1"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="totalMarks">الدرجة الكاملة</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      value={totalMarks}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-sm text-gray-500">تحسب تلقائياً من مجموع درجات الأسئلة</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="instructions">تعليمات الاختبار</Label>
                  <Textarea
                    id="instructions"
                    value={newExam.instructions}
                    onChange={(e) => setNewExam({...newExam, instructions: e.target.value})}
                    placeholder="أدخل تعليمات الاختبار..."
                    rows={2}
                  />
                </div>

                {/* Questions Section */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg">أسئلة الاختبار *</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {currentQuestions.length} سؤال
                      </span>
                      <span className="text-sm font-medium">
                        المجموع: {totalMarks} درجة
                      </span>
                    </div>
                  </div>

                  {/* Add Question Form */}
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-base">إضافة سؤال جديد</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label>نص السؤال *</Label>
                        <Textarea
                          value={newQuestion.questionText}
                          onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                          placeholder="أدخل نص السؤال..."
                          rows={2}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>الخيارات *</Label>
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="w-6 text-center font-medium">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`الخيار ${String.fromCharCode(65 + index)}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>الإجابة الصحيحة *</Label>
                          <Select
                            value={newQuestion.correctAnswer.toString()}
                            onValueChange={(value) => setNewQuestion({...newQuestion, correctAnswer: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الإجابة الصحيحة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">أ</SelectItem>
                              <SelectItem value="1">ب</SelectItem>
                              <SelectItem value="2">ج</SelectItem>
                              <SelectItem value="3">د</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>الدرجة *</Label>
                          <Input
                            type="number"
                            value={newQuestion.marks}
                            onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value) || 1})}
                            min="1"
                          />
                        </div>
                      </div>

                      <Button type="button" onClick={addQuestion} className="w-full">
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة السؤال
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Questions List */}
                  {currentQuestions.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {currentQuestions.map((question, index) => (
                        <Card key={question._id || index} className="relative">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="font-medium">
                                  {index + 1}. {question.questionText}
                                </p>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`p-2 rounded ${
                                        optIndex === question.correctAnswer
                                          ? 'bg-green-100 border border-green-200'
                                          : 'bg-gray-100'
                                      }`}
                                    >
                                      <span className="font-medium">
                                        {String.fromCharCode(65 + optIndex)}:
                                      </span> {option}
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                  الإجابة الصحيحة: {String.fromCharCode(65 + question.correctAnswer)} | 
                                  الدرجة: {question.marks}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p>لم يتم إضافة أي أسئلة بعد</p>
                      <p className="text-sm text-gray-400 mt-1">أضف أسئلة لإنشاء الاختبار</p>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tags">الكلمات المفتاحية (اختياري)</Label>
                  <Input
                    id="tags"
                    value={newExam.tags}
                    onChange={(e) => setNewExam({...newExam, tags: e.target.value})}
                    placeholder="كلمة1, كلمة2, كلمة3"
                  />
                  <p className="text-sm text-gray-500">افصل بين الكلمات بفواصل</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="published"
                    type="checkbox"
                    checked={newExam.isPublished === 'true'}
                    onChange={(e) => setNewExam({...newExam, isPublished: e.target.checked.toString()})}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="published" className="cursor-pointer">
                    نشر الاختبار للطلاب
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={currentQuestions.length === 0 || saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      إنشاء الاختبار ({currentQuestions.length} سؤال)
                    </>
                  )}
                </Button>
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
                  placeholder="ابحث في الاختبارات..."
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
                  <SelectItem value="كلاهما">كلاهما</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="quiz">اختبار سريع</SelectItem>
                  <SelectItem value="midterm">منتصف الفصل</SelectItem>
                  <SelectItem value="final">نهاية الفصل</SelectItem>
                  <SelectItem value="practice">تدريبي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الاختبارات</CardTitle>
          <CardDescription>
            جميع الاختبارات متعددة الخيارات التي قمت بإنشائها ({exams.length} اختبار)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExams.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد اختبارات</h3>
              <p className="text-gray-500 mb-4">ابدأ بإنشاء اختبارك الأول</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إنشاء اختبار جديد
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-right font-bold border-l w-[250px]">عنوان الاختبار</TableHead>
                    <TableHead className="text-right font-bold border-l w-[100px]">الصف</TableHead>
                    <TableHead className="text-right font-bold border-l w-[120px]">النوع</TableHead>
                    <TableHead className="text-right font-bold border-l w-[100px]">التصنيف</TableHead>
                    <TableHead className="text-right font-bold border-l w-[100px]">الأسئلة</TableHead>
                    <TableHead className="text-right font-bold border-l w-[100px]">المدة</TableHead>
                    <TableHead className="text-right font-bold border-l w-[100px]">الدرجة</TableHead>
                    <TableHead className="text-right font-bold w-[250px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam._id} className="hover:bg-gray-50 border-b">
                      <TableCell className="font-medium text-right border-l py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div className="text-right">
                            <div className="font-medium">{exam.title}</div>
                            {exam.description && (
                              <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                {exam.description}
                              </div>
                            )}
                          </div>
                          {exam.isPublished && (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              منشور
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right border-l py-3">
                        {exam.grade}
                      </TableCell>
                      <TableCell className="border-l py-3">
                        {getTypeBadge(exam.examType)}
                      </TableCell>
                      <TableCell className="border-l py-3">
                        {getCategoryBadge(exam.category)}
                      </TableCell>
                      <TableCell className="text-right border-l py-3">
                        {exam.questions?.length || 0} سؤال
                      </TableCell>
                      <TableCell className="text-right border-l py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3 text-gray-500" />
                          {exam.duration} د
                        </div>
                      </TableCell>
                      <TableCell className="text-right border-l py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Award className="h-3 w-3 text-yellow-500" />
                          {exam.totalMarks}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewExam(exam)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => manageQuestions(exam)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={exam.isPublished ? "outline" : "default"} 
                            size="sm"
                            onClick={() => publishExam(exam._id, !exam.isPublished)}
                          >
                            {exam.isPublished ? 'إلغاء النشر' : 'نشر'}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteExam(exam._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Exam Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedExam?.title}</DialogTitle>
            <DialogDescription>
              معاينة محتوى الاختبار
            </DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">الصف:</span> {selectedExam.grade}
                </div>
                <div>
                  <span className="font-medium">النوع:</span> {getTypeBadge(selectedExam.examType)}
                </div>
                <div>
                  <span className="font-medium">المدة:</span> {selectedExam.duration} دقيقة
                </div>
                <div>
                  <span className="font-medium">الدرجة:</span> {selectedExam.totalMarks}
                </div>
              </div>

              {selectedExam.description && (
                <div>
                  <h4 className="font-medium mb-2">وصف الاختبار:</h4>
                  <p className="text-gray-700">{selectedExam.description}</p>
                </div>
              )}

              {selectedExam.instructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">تعليمات الاختبار:</h4>
                  <p className="text-yellow-700 whitespace-pre-line">{selectedExam.instructions}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-4">أسئلة الاختبار ({selectedExam.questions?.length || 0} سؤال):</h4>
                <div className="space-y-4">
                  {selectedExam.questions?.map((question, index) => (
                    <Card key={question._id || index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-medium flex-1">
                            {index + 1}. {question.questionText}
                          </p>
                          <Badge variant="outline">{question.marks} درجة</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded border ${
                                optIndex === question.correctAnswer
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <span className="font-medium">
                                {String.fromCharCode(65 + optIndex)}:
                              </span> {option}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedExam.tags && selectedExam.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">الكلمات المفتاحية:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExam.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Questions Dialog */}
      <Dialog open={isQuestionsDialogOpen} onOpenChange={setIsQuestionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إدارة أسئلة الاختبار</DialogTitle>
            <DialogDescription>
              إضافة وتعديل أسئلة الاختبار: {selectedExam?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add Question Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">إضافة سؤال جديد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>نص السؤال *</Label>
                  <Textarea
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                    placeholder="أدخل نص السؤال..."
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>الخيارات *</Label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 text-center font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`الخيار ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>الإجابة الصحيحة *</Label>
                    <Select
                      value={newQuestion.correctAnswer.toString()}
                      onValueChange={(value) => setNewQuestion({...newQuestion, correctAnswer: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الإجابة الصحيحة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">أ</SelectItem>
                        <SelectItem value="1">ب</SelectItem>
                        <SelectItem value="2">ج</SelectItem>
                        <SelectItem value="3">د</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>الدرجة *</Label>
                    <Input
                      type="number"
                      value={newQuestion.marks}
                      onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value) || 1})}
                      min="1"
                    />
                  </div>
                </div>

                <Button type="button" onClick={addQuestion} className="w-full">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة السؤال
                </Button>
              </CardContent>
            </Card>

            {/* Questions List */}
            {currentQuestions.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">أسئلة الاختبار ({currentQuestions.length} سؤال)</h4>
                  <div className="text-sm font-medium">
                    المجموع: {currentQuestions.reduce((total, q) => total + q.marks, 0)} درجة
                  </div>
                </div>
                {currentQuestions.map((question, index) => (
                  <Card key={question._id || index} className="relative">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium">
                            {index + 1}. {question.questionText}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded ${
                                  optIndex === question.correctAnswer
                                    ? 'bg-green-100 border border-green-200'
                                    : 'bg-gray-100'
                                }`}
                              >
                                <span className="font-medium">
                                  {String.fromCharCode(65 + optIndex)}:
                                </span> {option}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            الإجابة الصحيحة: {String.fromCharCode(65 + question.correctAnswer)} | 
                            الدرجة: {question.marks}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>لم يتم إضافة أي أسئلة بعد</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => selectedExam && updateExamQuestions(selectedExam._id)}
              disabled={saving || currentQuestions.length === 0}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}