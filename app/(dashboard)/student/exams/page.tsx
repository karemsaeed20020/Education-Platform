"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Clock, Award, Eye, Play, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { api } from '@/redux/slices/authSlice'; // Import the api instance

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
  teacher: {
    username: string;
  };
  createdAt: string;
  isCompleted?: boolean;
}

interface ExamResult {
  _id: string;
  exam: {
    _id: string;
    title: string;
  };
  totalScore: number;
  obtainedScore: number;
  percentage: number;
  submittedAt: string;
}

type ExamStatus = ExamResult | boolean;

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchExams();
    fetchResults();
  }, []);

  useEffect(() => {
    const handleExamsUpdate = () => {
      fetchExams();
      fetchResults();
    };

    window.addEventListener('examsUpdated', handleExamsUpdate);
    
    return () => {
      window.removeEventListener('examsUpdated', handleExamsUpdate);
    };
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get("/api/exams/published");
      
      if (response.data.status === "success") {
        setExams(response.data.data.exams);
      } else {
        throw new Error("فشل في جلب الاختبارات");
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("فشل في تحميل الاختبارات");
    }
  };

  const fetchResults = async () => {
    try {
      const response = await api.get("/api/exams/results");
      
      if (response.data.status === "success") {
        setResults(response.data.data.results || []);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      quiz: { label: "اختبار سريع", variant: "secondary" as const },
      midterm: { label: "منتصف الفصل", variant: "default" as const },
      final: { label: "نهاية الفصل", variant: "destructive" as const },
      practice: { label: "تدريبي", variant: "outline" as const },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      نحو: { label: "نحو", variant: "default" as const },
      صرف: { label: "صرف", variant: "secondary" as const },
      بلاغة: { label: "بلاغة", variant: "outline" as const },
      أدب: { label: "أدب", variant: "default" as const },
      نصوص: { label: "نصوص", variant: "destructive" as const },
      إملاء: { label: "إملاء", variant: "default" as const },
      اختبار_شامل: { label: "شامل", variant: "secondary" as const },
    };

    const config = categoryConfig[category as keyof typeof categoryConfig] || { label: category, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getResultForExam = (examId: string): ExamResult | undefined => {
    return results.find((result) => result.exam._id === examId);
  };

  const isExamDisabled = (exam: Exam): boolean => {
    return !!exam.isCompleted || !!getResultForExam(exam._id);
  };

  const getExamStatus = (exam: Exam): ExamStatus => {
    const result = getResultForExam(exam._id);
    if (result) return result;
    if (exam.isCompleted) return true;
    return false;
  };

  // Helper function to safely access result properties
  const getResultPercentage = (status: ExamStatus): number | undefined => {
    return (status as ExamResult)?.percentage;
  };

  const getResultSubmittedAt = (status: ExamStatus): string | undefined => {
    return (status as ExamResult)?.submittedAt;
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === "all" || exam.grade === gradeFilter;
    const matchesType = typeFilter === "all" || exam.examType === typeFilter;
    return matchesSearch && matchesGrade && matchesType;
  });

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الاختبارات المتاحة</h1>
        <p className="text-gray-600 mt-2">اختر اختباراً لبدء الحل</p>
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
                  <SelectItem value="الصف الثاني الثانوي">
                    الصف الثاني الثانوي
                  </SelectItem>
                  <SelectItem value="الصف الثالث الثانوي">
                    الصف الثالث الثانوي
                  </SelectItem>
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

      {/* Exams List */}
      <div className="grid gap-6">
        {filteredExams.map((exam) => {
          const result = getResultForExam(exam._id);
          const isDisabled = isExamDisabled(exam);
          const examStatus = getExamStatus(exam);
          const percentage = getResultPercentage(examStatus);
          const submittedAt = getResultSubmittedAt(examStatus);

          return (
            <Card 
              key={exam._id} 
              className={`relative ${isDisabled ? 'opacity-75 bg-gray-50 border-gray-200' : ''}`}
            >
              {isDisabled && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg z-10"></div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      {exam.title}
                    </CardTitle>
                    {isDisabled && (
                      percentage !== undefined && percentage >= 50 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )
                    )}
                  </div>
                  <div className="flex gap-2">
                    {getTypeBadge(exam.examType)}
                    {getCategoryBadge(exam.category)}
                    {isDisabled && (
                      <Badge variant="secondary" className="bg-gray-500">
                        مكتمل
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>{exam.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{exam.duration} دقيقة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span>{exam.totalMarks} درجة</span>
                  </div>
                  <div>
                    <span className="text-gray-600">المعلم:</span>{" "}
                    {exam.teacher.username}
                  </div>
                  <div>
                    <span className="text-gray-600">الصف:</span> {exam.grade}
                  </div>
                </div>

                {exam.instructions && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {exam.instructions}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    {examStatus ? (
                      <div className="flex items-center gap-4">
                        {percentage !== undefined && (
                          <Badge
                            variant={
                              percentage >= 50 ? "default" : "destructive"
                            }
                          >
                            {percentage.toFixed(1)}%
                          </Badge>
                        )}
                        {submittedAt && (
                          <span className="text-sm text-gray-600">
                            تم التقديم في{" "}
                            {new Date(submittedAt).toLocaleDateString(
                              "ar-EG"
                            )}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline">لم يتم البدء</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isDisabled ? (
                      <>
                        <Link href={`/student/exams/${exam._id}/result`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 ml-2" />
                            عرض النتيجة
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" disabled>
                          <CheckCircle className="h-4 w-4 ml-2" />
                          تم الإنتهاء
                        </Button>
                      </>
                    ) : (
                      <Link href={`/student/exams/${exam._id}`}>
                        <Button size="sm">
                          <Play className="h-4 w-4 ml-2" />
                          بدء الاختبار
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد اختبارات متاحة
            </h3>
            <p className="text-gray-500">لا توجد اختبارات منشورة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}