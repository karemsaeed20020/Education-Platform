/* eslint-disable @typescript-eslint/no-explicit-any */
// app/student/exams/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Clock, Award, FileText, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  marks: number;
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  instructions: string;
  questions: Question[];
}

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

export default function StudentExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/exams/${examId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('فشل في تحميل الاختبار');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setExam(data.data.exam);
        setTimeLeft(data.data.exam.duration * 60); // Convert to seconds
        
        // Initialize empty answers object
        const initialAnswers: Record<string, number> = {};
        data.data.exam.questions.forEach((question: Question) => {
          initialAnswers[question._id] = -1; // -1 means not answered
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
      toast.error('فشل في تحميل الاختبار');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  useEffect(() => {
  checkExamAccess();
  fetchExam();
}, [examId]);

const checkExamAccess = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/exams/${examId}/can-take`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.data.canTake) {
        toast.error(data.data.reason || 'لا يمكنك الوصول إلى هذا الاختبار');
        router.push('/student/exams');
        return;
      }
    }
  } catch (error) {
    console.error('Error checking exam access:', error);
  }
};

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    if (!confirm('هل أنت متأكد من تقديم الإجابات؟ لا يمكنك تعديلها بعد الإرسال.')) {
      return;
    }
    
    // Check if all questions are answered
    const unanswered = Object.values(answers).filter(answer => answer === -1).length;
    if (unanswered > 0 && !confirm(`لديك ${unanswered} أسئلة لم تتم الإجابة عليها. هل تريد المتابعة؟`)) {
      return;
    }
    
    await submitAnswers();
  };

  const handleAutoSubmit = async () => {
    toast.error('انتهى الوقت، يتم تقديم الإجابات تلقائياً');
    await submitAnswers();
  };

  // const submitAnswers = async () => {
  //   setIsSubmitting(true);
  //   try {
  //     // Filter out unanswered questions (-1 values)
  //     const submittedAnswers = Object.fromEntries(
  //       Object.entries(answers).filter(([_, answer]) => answer !== -1)
  //     );

  //     const response = await fetch(`http://localhost:5000/api/exams/${examId}/submit`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include',
  //       body: JSON.stringify({ answers: submittedAnswers })
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.message || 'فشل في تقديم الإجابات');
  //     }

  //     if (response.ok) {
  //       setResult(data.data.result);
  //       toast.success('تم تقديم الإجابات بنجاح');
  //     }
  //   } catch (error: any) {
  //     console.error('Error submitting answers:', error);
  //     toast.error(error.message || 'فشل في تقديم الإجابات');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const submitAnswers = async () => {
  setIsSubmitting(true);
  try {
    const submittedAnswers = Object.fromEntries(
      Object.entries(answers).filter(([_, answer]) => answer !== -1)
    );

    const response = await fetch(`http://localhost:5000/api/exams/${examId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ answers: submittedAnswers })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل في تقديم الإجابات');
    }

    if (response.ok) {
      setResult(data.data.result);
      toast.success('تم تقديم الإجابات بنجاح');
      
      // Refresh the exams list to update completion status
      setTimeout(() => {
        window.dispatchEvent(new Event('examsUpdated'));
      }, 1000);
    }
  } catch (error: any) {
    console.error('Error submitting answers:', error);
    toast.error(error.message || 'فشل في تقديم الإجابات');
  } finally {
    setIsSubmitting(false);
  }
};

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < (exam?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الاختبار...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">الاختبار غير موجود</h3>
          <p className="text-gray-500">تعذر العثور على الاختبار المطلوب</p>
          <Button onClick={() => router.push('/student/exams')} className="mt-4">
            العودة إلى قائمة الاختبارات
          </Button>
        </div>
      </div>
    );
  }

  if (result) {
    return <ExamResultView result={result} exam={exam} />;
  }

  const currentQ = exam.questions[currentQuestion];
  const answeredCount = Object.values(answers).filter(answer => answer !== -1).length;
  const totalQuestions = exam.questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Exam Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center gap-2 justify-end">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="text-xl font-bold text-red-600">{formatTime(timeLeft)}</span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {answeredCount}/{totalQuestions} تم الإجابة
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {exam.instructions && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">تعليمات الاختبار:</h4>
                <p className="text-yellow-700 whitespace-pre-line">{exam.instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Questions Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">أسئلة الاختبار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-2 gap-2">
                {exam.questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentQuestion === index ? "default" : "outline"}
                    size="sm"
                    className={`h-10 ${
                      answers[exam.questions[index]._id] !== -1 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : ''
                    }`}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>تم الإجابة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                  <span>لم يتم الإجابة</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  سؤال {currentQuestion + 1} من {totalQuestions}
                </CardTitle>
                <Badge variant="secondary">{currentQ.marks} درجة</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-lg font-medium">
                  {currentQ.questionText}
                </div>

                <RadioGroup
                  value={answers[currentQ._id]?.toString() || ''}
                  onValueChange={(value) => handleAnswerChange(currentQ._id, parseInt(value))}
                  className="space-y-3"
                >
                  {currentQ.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem 
                        value={optionIndex.toString()} 
                        id={`${currentQ._id}-${optionIndex}`} 
                      />
                      <Label
                        htmlFor={`${currentQ._id}-${optionIndex}`}
                        className="flex-1 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + optionIndex)}:
                        </span>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    variant="outline"
                  >
                    السؤال السابق
                  </Button>
                  
                  {currentQuestion < totalQuestions - 1 ? (
                    <Button onClick={nextQuestion}>
                      السؤال التالي
                      <ArrowRight className="h-4 w-4 mr-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || timeLeft <= 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          جاري التصحيح...
                        </>
                      ) : (
                        'إنهاء الاختبار'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button for Mobile */}
        <div className="lg:hidden flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || timeLeft <= 0}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                جاري التصحيح...
              </>
            ) : (
              'إنهاء الاختبار'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Result Display Component
function ExamResultView({ result, exam }: { result: ExamResult; exam: Exam }) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Result Summary */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-green-800">
              تم تقديم الاختبار بنجاح
            </CardTitle>
            <CardDescription className="text-center text-green-700">
              {new Date(result.submittedAt).toLocaleString('ar-EG')}
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            className="flex-1"
          >
            {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          </Button>
          <Button
            onClick={() => router.push('/student/exams')}
            className="flex-1"
          >
            العودة إلى الاختبارات
          </Button>
        </div>

        {/* Detailed Results */}
        {showDetails && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل النتيجة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.results.map((questionResult, index) => (
                    <Card
                      key={questionResult.questionId}
                      className={`border-l-4 ${
                        questionResult.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-lg">
                              سؤال {index + 1}: {questionResult.questionText}
                            </p>
                            
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
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
                                  <span className="font-medium">
                                    {String.fromCharCode(65 + optIndex)}:
                                  </span> {option}
                                  {optIndex === questionResult.correctAnswer && (
                                    <CheckCircle className="h-4 w-4 text-green-600 inline mr-2" />
                                  )}
                                  {optIndex === questionResult.studentAnswer && !questionResult.isCorrect && (
                                    <XCircle className="h-4 w-4 text-red-600 inline mr-2" />
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                              <div>
                                <span className="font-medium">إجابتك:</span>{' '}
                                {String.fromCharCode(65 + questionResult.studentAnswer)}
                              </div>
                              <div>
                                <span className="font-medium">الإجابة الصحيحة:</span>{' '}
                                {String.fromCharCode(65 + questionResult.correctAnswer)}
                              </div>
                              <div>
                                <span className="font-medium">الدرجة:</span>{' '}
                                {questionResult.obtainedMarks}/{questionResult.marks}
                              </div>
                              <div className={`font-medium ${
                                questionResult.isCorrect ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {questionResult.isCorrect ? 'صحيح' : 'خاطئ'}
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
        )}
      </div>
    </div>
  );
}