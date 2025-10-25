/* eslint-disable @typescript-eslint/no-explicit-any */
// app/student/exams/[id]/result/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, FileText, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { api } from '@/redux/slices/authSlice'; // Import the api instance

interface ExamResult {
  _id: string;
  totalScore: number;
  obtainedScore: number;
  percentage: number;
  results: {
    questionId: string;
    questionText: string;
    studentAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    marks: number;
    obtainedMarks: number;
    options: string[];
  }[];
  submittedAt: string;
}

interface Exam {
  _id: string;
  title: string;
  description: string;
}

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  
  const [result, setResult] = useState<ExamResult | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [examId]);

  const fetchResult = async () => {
    try {
      // First, get the exam details
      const examResponse = await api.get(`/api/exams/${examId}`);
      
      if (examResponse.data.status === 'success') {
        setExam(examResponse.data.data.exam);
      }

      // Then, get the results for this exam
      const resultsResponse = await api.get(`/api/exams/${examId}/results`);
      
      if (resultsResponse.data.status === 'success' && resultsResponse.data.data.results.length > 0) {
        // Get the latest result
        const latestResult = resultsResponse.data.data.results[0];
        setResult(latestResult);
      } else {
        toast.error('لا توجد نتائج لهذا الاختبار');
      }
    } catch (error: any) {
      console.error('Error fetching result:', error);
      const errorMessage = error.response?.data?.message || 'فشل في تحميل النتيجة';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeText = (percentage: number) => {
    if (percentage >= 90) return 'ممتاز';
    if (percentage >= 80) return 'جيد جداً';
    if (percentage >= 70) return 'جيد';
    if (percentage >= 50) return 'مقبول';
    return 'راسب';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل النتيجة...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتيجة</h3>
          <p className="text-gray-500">لم تقم بتقديم هذا الاختبار بعد</p>
          <Button 
            onClick={() => router.push(`/student/exams/${examId}`)}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة إلى الاختبار
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">نتيجة الاختبار</h1>
            {exam && (
              <p className="text-gray-600 mt-1">{exam.title}</p>
            )}
          </div>
          <Button
            onClick={() => router.push('/student/exams')}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للاختبارات
          </Button>
        </div>

        {/* Result Summary */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-green-800">
              نتيجة الاختبار
            </CardTitle>
            <CardDescription className="text-center text-green-700">
              تم التقديم في {new Date(result.submittedAt).toLocaleString('ar-EG')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <Award className="h-8 w-8 text-blue-600 mx-auto" />
                <div className="text-2xl font-bold text-blue-600">{result.obtainedScore}</div>
                <div className="text-sm text-gray-600">الدرجة المحصلة</div>
              </div>
              <div className="space-y-2">
                <FileText className="h-8 w-8 text-gray-600 mx-auto" />
                <div className="text-2xl font-bold text-gray-700">{result.totalScore}</div>
                <div className="text-sm text-gray-600">الدرجة الكاملة</div>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-8 flex items-center justify-center mx-auto">
                  <span className="text-2xl">%</span>
                </div>
                <div className={`text-2xl font-bold ${getGradeColor(result.percentage)}`}>
                  {result.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">النسبة المئوية</div>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                <div className="text-2xl font-bold text-green-600">
                  {getGradeText(result.percentage)}
                </div>
                <div className="text-sm text-gray-600">التقدير</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الإجابات</CardTitle>
            <CardDescription>
              عرض الإجابات الصحيحة والخاطئة مع التصحيح
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {result.results.map((questionResult, index) => (
                <Card
                  key={questionResult.questionId}
                  className={`border-l-4 ${
                    questionResult.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <p className="font-medium text-lg">
                            سؤال {index + 1}: {questionResult.questionText}
                          </p>
                          <Badge variant="secondary">
                            {questionResult.obtainedMarks}/{questionResult.marks} درجة
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {questionResult.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded border-2 ${
                                optIndex === questionResult.correctAnswer
                                  ? 'bg-green-100 border-green-500 text-green-800'
                                  : optIndex === questionResult.studentAnswer
                                  ? 'bg-red-100 border-red-500 text-red-800'
                                  : 'bg-gray-100 border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>
                                  <span className="font-medium">
                                    {String.fromCharCode(65 + optIndex)}:
                                  </span> {option}
                                </span>
                                <div className="flex gap-1">
                                  {optIndex === questionResult.correctAnswer && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                  {optIndex === questionResult.studentAnswer && !questionResult.isCorrect && (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="font-medium">إجابتك:</span>{' '}
                            <span className={questionResult.isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {String.fromCharCode(65 + questionResult.studentAnswer)}
                              {!questionResult.isCorrect && ' (خاطئة)'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">الإجابة الصحيحة:</span>{' '}
                            <span className="text-green-600">
                              {String.fromCharCode(65 + questionResult.correctAnswer)}
                            </span>
                          </div>
                          <div className={`font-medium ${
                            questionResult.isCorrect ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {questionResult.isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}