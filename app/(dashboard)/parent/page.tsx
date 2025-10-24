// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/redux/store';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Users, 
//   GraduationCap, 
//   BookOpen, 
//   BarChart3, 
//   Calendar,
//   MessageCircle,
//   Eye,
//   TrendingUp,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   User
// } from 'lucide-react';

// export default function ParentDashboard() {
//   const { user } = useSelector((state: RootState) => state.auth);
//   const [studentData, setStudentData] = useState(null);
//   const [attendanceData, setAttendanceData] = useState(null);
//   const [gradesData, setGradesData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // جلب بيانات الطالب المرتبط
//     fetchStudentData();
//   }, []);

//   const fetchStudentData = async () => {
//     try {
//       // هنا ستقوم بجلب بيانات الطالب المرتبط بـ studentId
//       // باستخدام APIs موجودة
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching student data:', error);
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-lg text-gray-600">جاري تحميل البيانات...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex items-center gap-3 mb-2">
//             <Users className="h-8 w-8 text-blue-600" />
//             <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم ولي الأمر</h1>
//           </div>
//           <p className="text-gray-600">
//             متابعة أداء الطالب والتحصيل الدراسي
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* معلومات الطالب */}
//           <Card className="lg:col-span-1">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <User className="h-5 w-5" />
//                 معلومات الطالب
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
//                   <User className="h-8 w-8 text-blue-600" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">اسم الطالب</h3>
//                   <p className="text-sm text-gray-500">الصف: الثاني الثانوي</p>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center p-3 bg-green-50 rounded-lg">
//                   <p className="text-2xl font-bold text-green-600">94%</p>
//                   <p className="text-xs text-green-600">نسبة الحضور</p>
//                 </div>
//                 <div className="text-center p-3 bg-blue-50 rounded-lg">
//                   <p className="text-2xl font-bold text-blue-600">85%</p>
//                   <p className="text-xs text-blue-600">المعدل التراكمي</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* الإحصائيات الرئيسية */}
//           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-sm font-medium">الحضور اليوم</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex items-center gap-2">
//                   <Badge variant="default" className="bg-green-100 text-green-800">
//                     <CheckCircle className="h-3 w-3 ml-1" />
//                     حاضر
//                   </Badge>
//                   <span className="text-sm text-gray-500">الساعة 8:15 صباحاً</span>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-sm font-medium">آخر درجة</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex items-center justify-between">
//                   <span className="text-lg font-bold text-blue-600">92%</span>
//                   <span className="text-sm text-gray-500">اختبار اللغة العربية</span>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-sm font-medium">الواجبات القادمة</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm">رياضيات - صفحة 45</span>
//                     <Badge variant="outline" className="text-xs">
//                       غداً
//                     </Badge>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-sm font-medium">الامتحانات</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm">امتحان الفصل الأول</span>
//                     <Badge variant="secondary" className="text-xs">
//                       5 أيام
//                     </Badge>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* تقرير سريع */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <BarChart3 className="h-5 w-5" />
//                 تقرير الحضور الشهري
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex justify-between">
//                   <span>الأيام الحاضرة</span>
//                   <span className="font-semibold">22 يوم</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>الأيام الغائبة</span>
//                   <span className="font-semibold text-red-600">2 يوم</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>نسبة الحضور</span>
//                   <span className="font-semibold text-green-600">92%</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <GraduationCap className="h-5 w-5" />
//                 التقييم الدراسي
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex justify-between">
//                   <span>اللغة العربية</span>
//                   <span className="font-semibold">92%</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>الرياضيات</span>
//                   <span className="font-semibold">88%</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>المعدل العام</span>
//                   <span className="font-semibold text-blue-600">85%</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }