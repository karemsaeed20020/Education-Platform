// 'use client'
// import React, { useState, useEffect } from 'react';
// import { 
//   BookOpen, 
//   Users, 
//   Award, 
//   Clock, 
//   Star,
//   Play,
//   CheckCircle,
//   ArrowRight,
//   GraduationCap,
//   BookText,
//   PenTool,
//   Library,
//   School,
//   Trophy,
//   MapPin,
//   Calendar,
//   FileText,
//   Target,
//   BarChart3,
//   Shield,
//   BookMarked,
//   Notebook,
//   TestTube,
//   Quote,
//   ChevronLeft,
//   ChevronRight
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import Navbar from '@/components/Navbar';

// export default function ArabicTeacherPlatform() {
//   const [activeTestimonial, setActiveTestimonial] = useState(0);
//   const [currentSlide, setCurrentSlide] = useState(0);

//   const heroSlides = [
//     {
//       image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&h=1080&fit=crop&crop=center",
//       title: "الأستاذ السيد الابي",
//       subtitle: "مدرس اللغة العربية للمرحلة الثانوية",
//       description: "خبرة 20 عاماً في تدريس المنهج المصري وتحضير طلاب الثانوية العامة",
//       badge: "مدرس أول لغة عربية"
//     },
//     {
//       image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop&crop=center",
//       title: "المرجع الأول في اللغة العربية",
//       subtitle: "لطلاب الثانوية العامة في مصر",
//       description: "نسبة نجاح 98% في امتحانات الثانوية العامة",
//       badge: "معتمد من وزارة التربية والتعليم"
//     },
//     {
//       image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop&crop=center",
//       title: "تعليم العربية بأسلوب عصري",
//       subtitle: "دمج الأصالة بالمعاصرة",
//       description: "منهجية مبتكرة تجعل تعلم العربية ممتعاً وسهلاً",
//       badge: "أساليب تدريس مبتكرة"
//     }
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveTestimonial((prev) => (prev + 1) % successStories.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
//     }, 6000);
//     return () => clearInterval(interval);
//   }, []);

//   const nextTestimonial = () => {
//     setActiveTestimonial((prev) => (prev + 1) % successStories.length);
//   };

//   const prevTestimonial = () => {
//     setActiveTestimonial((prev) => (prev - 1 + successStories.length) % successStories.length);
//   };

//   // New Sections Data
//   const teachingMethodology = [
//     {
//       icon: <BookText className="w-10 h-10" />,
//       title: "شرح المنهج بالكامل",
//       description: "شرح مفصل لكل فصول المنهج المقرر من الصف الأول إلى الثالث الثانوي"
//     },
//     {
//       icon: <Notebook className="w-10 h-10" />,
//       title: "تحليل النصوص الأدبية",
//       description: "تحليل شامل للنصوص المقررة مع التركيز على الأسئلة المتوقعة في الامتحانات"
//     },
//     {
//       icon: <PenTool className="w-10 h-10" />,
//       title: "التدريب على التعبير",
//       description: "تمارين مكثفة على التعبير والإملاء والقواعد النحوية"
//     },
//     {
//       icon: <TestTube className="w-10 h-10" />,
//       title: "امتحانات تجريبية",
//       description: "نماذج امتحانات مشابهة لامتحانات الثانوية العامة مع التصحيح"
//     }
//   ];

//   const gradeLevels = [
//     {
//       grade: "الصف الأول الثانوي",
//       subjects: ["النصوص الشعرية", "النثر الفني", "القواعد النحوية", "التعبير الوظيفي", "المطالعة"],
//       image: "https://images.unsplash.com/photo-1588072432836-100b94bfb23a?w=400&h=250&fit=crop",
//       duration: "عام دراسي كامل",
//       price: "3000 جنيه"
//     },
//     {
//       grade: "الصف الثاني الثانوي",
//       subjects: ["الأدب الجاهلي", "النحو والصرف", "البلاغة العربية", "النصوص المقررة", "التعبير الإبداعي"],
//       image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop",
//       duration: "عام دراسي كامل",
//       price: "3500 جنيه"
//     },
//     {
//       grade: "الصف الثالث الثانوي",
//       subjects: ["مراجعة شاملة", "امتحانات سنوات سابقة", "تحليل النصوص", "القواعد المتقدمة", "التدريب على الامتحانات"],
//       image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
//       duration: "عام دراسي كامل",
//       price: "4000 جنيه"
//     }
//   ];

//   const examPreparation = [
//     {
//       title: "المراجعات النهائية",
//       count: "30+",
//       description: "جلسات مراجعة شاملة قبل الامتحانات",
//       icon: <BookMarked className="w-6 h-6" />
//     },
//     {
//       title: "نماذج الامتحانات",
//       count: "50+",
//       description: "نماذج مشابهة لامتحانات الثانوية العامة",
//       icon: <FileText className="w-6 h-6" />
//     },
//     {
//       title: "حلول الأسئلة",
//       count: "15 عام",
//       description: "حلول مفصلة لامتحانات السنوات السابقة",
//       icon: <Target className="w-6 h-6" />
//     },
//     {
//       title: "نسبة النجاح",
//       count: "98%",
//       description: "نسبة النجاح في امتحانات الثانوية العامة",
//       icon: <Trophy className="w-6 h-6" />
//     }
//   ];

//   // Success Stories Slider Data
//   const successStories = [
//     {
//       name: "محمد أحمد",
//       score: "98%",
//       year: "2023",
//       story: "حصلت على أعلى درجة في اللغة العربية بفضل منهجية الأستاذ السيد في الشرح. الشرح الواضح والمبسط جعل المادة سهلة وممتعة",
//       image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
//       school: "مدرسة النصر الثانوية"
//     },
//     {
//       name: "ياسمين علي",
//       score: "96%",
//       year: "2023",
//       story: "الشرح الواضح للنصوص الأدبية ساعدني في فهمها بسهولة. الأستاذ السيد يملك طريقة رائعة في تبسيط المعلومات المعقدة",
//       image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
//       school: "مدرسة القاهرة الجديدة"
//     },
//     {
//       name: "أحمد محمود",
//       score: "95%",
//       year: "2022",
//       story: "التمارين المستمرة على القواعد النحوية كانت السبب في تفوقي. المنهجية المتبعة ساعدتني في فهم القواعد بشكل عملي",
//       image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
//       school: "مدرسة مصر الجديدة"
//     },
//     {
//       name: "فاطمة حسن",
//       score: "97%",
//       year: "2023",
//       story: "الدروس المسجلة كانت منقذة لي في أوقات المراجعة. استطاعت مراجعة الدروس في أي وقت ومن أي مكان",
//       image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
//       school: "مدرسة المعادي الثانوية"
//     }
//   ];

//   const features = [
//     {
//       icon: <Users className="w-7 h-7" />,
//       title: "فصول مباشرة تفاعلية",
//       description: "حصص مباشرة مع الأستاذ السيد مع إمكانية التفاعل والمناقشة"
//     },
//     {
//       icon: <Clock className="w-7 h-7" />,
//       title: "مراجعات مسجلة",
//       description: "جميع الحصص مسجلة يمكن مشاهدتها في أي وقت للمراجعة"
//     },
//     {
//       icon: <Shield className="w-7 h-7" />,
//       title: "متابعة فردية",
//       description: "متابعة شخصية لكل طالب وتقييم مستمر للأداء"
//     },
//     {
//       icon: <BarChart3 className="w-7 h-7" />,
//       title: "تقييم مستمر",
//       description: "اختبارات دورية لمتابعة التقدم وتحسين الأداء"
//     }
//   ];

//   const stats = [
//     { number: "1,500+", label: "طالب متخرج" },
//     { number: "20", label: "سنة خبرة" },
//     { number: "98%", label: "نسبة النجاح" },
//     { number: "50+", label: "مدرسة" }
//   ];

//   return (
//     <div className="min-h-screen bg-white" dir="rtl">
//       <Navbar />

//       {/* Fixed Hero Section */}
//       <section className="pt-16 min-h-screen flex items-center justify-center relative bg-slate-900">
//         <div className="absolute inset-0 z-0">
//           {heroSlides.map((slide, index) => (
//             <div
//               key={index}
//               className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
//                 index === currentSlide ? 'opacity-100' : 'opacity-0'
//               }`}
//             >
//               <img 
//                 src={slide.image}
//                 alt={slide.title}
//                 className="w-full h-full object-cover"
//               />
//               <div className="absolute inset-0 bg-slate-900/70"></div>
//             </div>
//           ))}
//         </div>

//         <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center space-y-8">
//             {/* Badge */}
//             <div className="inline-block bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-2">
//               {heroSlides[currentSlide].badge}
//             </div>
            
//             {/* Main Title */}
//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
//               {heroSlides[currentSlide].title}
//             </h1>
            
//             {/* Subtitle */}
//             <h2 className="text-xl md:text-2xl text-green-200 font-medium">
//               {heroSlides[currentSlide].subtitle}
//             </h2>
            
//             {/* Description */}
//             <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
//               {heroSlides[currentSlide].description}
//             </p>
            
//             {/* CTA Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
//               <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base">
//                 <BookOpen className="ml-2 w-5 h-5" />
//                 ابدأ التعلم الآن
//               </Button>
//               <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-3 text-base">
//                 <Play className="ml-2 w-5 h-5" />
//                 شاهد فيديو تعريفي
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Slide Indicators */}
//         <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
//           <div className="flex space-x-2 space-x-reverse">
//             {heroSlides.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => setCurrentSlide(index)}
//                 className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                   index === currentSlide
//                     ? 'bg-green-500 w-6'
//                     : 'bg-white/50 hover:bg-white/75'
//                 }`}
//               />
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Teaching Methodology Section */}
//       <section className="py-16 bg-white">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-slate-800 mb-3">طريقة التدريس</h2>
//             <p className="text-slate-600 max-w-2xl mx-auto">
//               نتبع منهجية علمية مدروسة لضمان أفضل النتائج لطلاب الثانوية العامة
//             </p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {teachingMethodology.map((item, index) => (
//               <Card key={index} className="text-center border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
//                 <CardHeader className="pb-3">
//                   <div className="bg-green-50 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 text-green-600">
//                     {item.icon}
//                   </div>
//                   <CardTitle className="text-lg text-slate-800">{item.title}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-slate-600 text-sm">{item.description}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Grade Levels Section */}
//       <section className="py-16 bg-slate-50">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-slate-800 mb-3">المستويات الدراسية</h2>
//             <p className="text-slate-600">شرح متكامل لجميع صفوف المرحلة الثانوية</p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {gradeLevels.map((level, index) => (
//               <Card key={index} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
//                 <img src={level.image} alt={level.grade} className="w-full h-40 object-cover" />
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-xl text-slate-800">{level.grade}</CardTitle>
//                   <CardDescription>{level.duration}</CardDescription>
//                 </CardHeader>
//                 <CardContent className="pt-0">
//                   <ul className="space-y-2 mb-4">
//                     {level.subjects.slice(0, 3).map((subject, idx) => (
//                       <li key={idx} className="flex items-center text-slate-600 text-sm">
//                         <CheckCircle className="w-3 h-3 text-green-500 ml-2" />
//                         {subject}
//                       </li>
//                     ))}
//                     {level.subjects.length > 3 && (
//                       <li className="text-green-600 text-sm">+ المزيد...</li>
//                     )}
//                   </ul>
//                   <div className="flex items-center justify-between">
//                     <span className="text-xl font-bold text-green-600">{level.price}</span>
//                     <Button size="sm" className="bg-green-600 hover:bg-green-700">
//                       سجل الآن
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Exam Preparation Section */}
//       <section className="py-16 bg-white">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-slate-800 mb-3">التحضير للامتحانات</h2>
//             <p className="text-slate-600">استعداد كامل لامتحانات الثانوية العامة</p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             {examPreparation.map((item, index) => (
//               <Card key={index} className="text-center border border-slate-200 shadow-sm">
//                 <CardHeader className="pb-3">
//                   <div className="bg-green-50 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 text-green-600">
//                     {item.icon}
//                   </div>
//                   <CardTitle className="text-2xl text-green-600">{item.count}</CardTitle>
//                   <CardTitle className="text-base text-slate-800">{item.title}</CardTitle>
//                 </CardHeader>
//                 <CardContent className="pt-0">
//                   <p className="text-slate-600 text-sm">{item.description}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Success Stories Slider Section */}
//       <section className="py-16 bg-slate-800 text-white">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <Quote className="w-8 h-8 text-green-400 mx-auto mb-3" />
//             <h2 className="text-3xl font-bold mb-3">قصص النجاح</h2>
//             <p className="text-slate-300">طلابنا يتحدثون عن تجربتهم مع الأستاذ السيد</p>
//           </div>
          
//           <div className="relative">
//             {/* Slider Container */}
//             <div className="relative overflow-hidden rounded-2xl bg-slate-700/50 backdrop-blur-sm">
//               <div className="transition-transform duration-500 ease-in-out">
//                 <div className="p-8 md:p-12">
//                   <div className="flex flex-col md:flex-row items-center gap-8">
//                     {/* Student Image */}
//                     <div className="flex-shrink-0">
//                       <img 
//                         src={successStories[activeTestimonial].image} 
//                         alt={successStories[activeTestimonial].name}
//                         className="w-24 h-24 rounded-full object-cover border-4 border-green-400 shadow-lg"
//                       />
//                     </div>
                    
//                     {/* Testimonial Content */}
//                     <div className="flex-1 text-center md:text-right">
//                       <div className="mb-4">
//                         <div className="text-4xl font-bold text-green-400 mb-2">
//                           {successStories[activeTestimonial].score}
//                         </div>
//                         <h3 className="text-xl font-bold mb-1">{successStories[activeTestimonial].name}</h3>
//                         <p className="text-slate-300 text-sm">
//                           {successStories[activeTestimonial].school} - {successStories[activeTestimonial].year}
//                         </p>
//                       </div>
                      
//                       <blockquote className="text-lg leading-relaxed mb-6 max-w-3xl mx-auto">
//                         "{successStories[activeTestimonial].story}"
//                       </blockquote>
                      
//                       <div className="flex justify-center md:justify-start">
//                         {[...Array(5)].map((_, i) => (
//                           <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Navigation Arrows */}
//             <button
//               onClick={prevTestimonial}
//               className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 
//                        text-white p-3 rounded-full shadow-lg transition-all duration-200 z-10"
//             >
//               <ChevronLeft className="w-5 h-5" />
//             </button>
            
//             <button
//               onClick={nextTestimonial}
//               className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 
//                        text-white p-3 rounded-full shadow-lg transition-all duration-200 z-10"
//             >
//               <ChevronRight className="w-5 h-5" />
//             </button>

//             {/* Dots Indicator */}
//             <div className="flex justify-center mt-6 space-x-2 space-x-reverse">
//               {successStories.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setActiveTestimonial(index)}
//                   className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                     index === activeTestimonial 
//                       ? 'bg-green-500 w-6' 
//                       : 'bg-slate-400 hover:bg-slate-300'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-16 bg-white">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-slate-800 mb-3">مميزات المنصة</h2>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {features.map((feature, index) => (
//               <div key={index} className="flex items-start space-x-3 space-x-reverse p-4 bg-slate-50 rounded-lg">
//                 <div className="bg-green-100 p-2 rounded-lg text-green-600 flex-shrink-0">
//                   {feature.icon}
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-slate-800 mb-1">{feature.title}</h3>
//                   <p className="text-slate-600 text-sm">{feature.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Final CTA Section */}
//       <section className="py-16 bg-green-600">
//         <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
//           <GraduationCap className="w-12 h-12 text-white mx-auto mb-4" />
//           <h2 className="text-3xl font-bold text-white mb-3">
//             ابدأ رحلتك نحو التفوق في الثانوية العامة
//           </h2>
//           <p className="text-green-100 mb-6">
//             انضم إلى آلاف الطلاب الذين حققوا أحلامهم بفضل منهجية الأستاذ السيد
//           </p>
          
//           <div className="flex flex-col sm:flex-row gap-3 justify-center">
//             <Button size="lg" className="bg-white text-green-600 hover:bg-slate-100 px-6">
//               سجل في الكورس الآن
//             </Button>
//             <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-6">
//               <Calendar className="ml-2 w-4 h-4" />
//               احجز جلسة استشارية
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-slate-900 text-white py-12">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             <div className="md:col-span-2">
//               <div className="flex items-center space-x-3 space-x-reverse mb-4">
//                 <School className="w-8 h-8 text-green-400" />
//                 <span className="text-xl font-bold">الأستاذ السيد الابي</span>
//               </div>
//               <p className="text-slate-400 mb-4 text-sm">
//                 متخصص في تدريس اللغة العربية للمرحلة الثانوية وفق المنهج المصري
//               </p>
//               <div className="flex items-center text-slate-400 text-sm">
//                 <MapPin className="w-4 h-4 ml-2" />
//                 <span>القاهرة، مصر</span>
//               </div>
//             </div>
            
//             <div>
//               <h4 className="font-bold mb-3 text-sm">روابط سريعة</h4>
//               <ul className="space-y-2 text-sm">
//                 <li><a href="#" className="text-slate-400 hover:text-white transition-colors">المستويات الدراسية</a></li>
//                 <li><a href="#" className="text-slate-400 hover:text-white transition-colors">طريقة التدريس</a></li>
//                 <li><a href="#" className="text-slate-400 hover:text-white transition-colors">التحضير للامتحانات</a></li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-bold mb-3 text-sm">التواصل</h4>
//               <ul className="space-y-2 text-slate-400 text-sm">
//                 <li>الهاتف: 0123456789</li>
//                 <li>البريد: info@alsayed.com</li>
//                 <li>الواتساب: 0123456789</li>
//               </ul>
//             </div>
//           </div>
          
//           <div className="border-t border-slate-800 pt-8 mt-8 text-center">
//             <p className="text-slate-400 text-sm">
//               © 2024 منصة الأستاذ السيد الابي. جميع الحقوق محفوظة.
//             </p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Menu,
  X,
  LogIn,
  UserPlus,
  User,
  LogOut,
  Users,
  Award,
  Clock,
  Star,
  Play,
  CheckCircle,
  GraduationCap,
  BookText,
  PenTool,
  Notebook,
  TestTube,
  Quote,
  ChevronLeft,
  ChevronRight,
  School,
  MapPin,
  Calendar,
  FileText,
  Target,
  Trophy,
  BookMarked,
  Shield,
  BarChart3,
  Phone,
  Mail,
  MessageCircle,
  Download,
  Video,
  Headphones,
  Lightbulb,
  TrendingUp,
  Users2,
  BookOpenCheck,
  Zap,
  CheckCircle2,
  Brain,
  LineChart,
  Sparkles,
  BookmarkCheck,
  ClipboardCheck,
  MessageSquare,
  FileQuestion
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Mock user state for demo
const mockUser = null;

export default function ArabicTeacherPlatform() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState(mockUser);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&h=1080&fit=crop&crop=center",
      title: "الأستاذ السيد الابي",
      subtitle: "مدرس اللغة العربية للمرحلة الثانوية",
      description: "خبرة 10 عاماً في تدريس المنهج المصري وتحضير طلاب الثانوية العامة",
      badge: "مدرس أول لغة عربية"
    },
    {
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop&crop=center",
      title: "المرجع الأول في اللغة العربية",
      subtitle: "لطلاب الثانوية العامة في مصر",
      description: "نسبة نجاح 98% في امتحانات الثانوية العامة",
      badge: "معتمد من وزارة التربية والتعليم"
    },
    {
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop&crop=center",
      title: "تعليم العربية بأسلوب عصري",
      subtitle: "دمج الأصالة بالمعاصرة",
      description: "منهجية مبتكرة تجعل تعلم العربية ممتعاً وسهلاً",
      badge: "أساليب تدريس مبتكرة"
    }
  ];

  const teachingMethodology = [
    {
      icon: <BookText className="w-10 h-10" />,
      title: "شرح المنهج بالكامل",
      description: "شرح مفصل لكل فصول المنهج المقرر من الصف الأول إلى الثالث الثانوي"
    },
    {
      icon: <Notebook className="w-10 h-10" />,
      title: "تحليل النصوص الأدبية",
      description: "تحليل شامل للنصوص المقررة مع التركيز على الأسئلة المتوقعة في الامتحانات"
    },
    {
      icon: <PenTool className="w-10 h-10" />,
      title: "التدريب على التعبير",
      description: "تمارين مكثفة على التعبير والإملاء والقواعد النحوية"
    },
    {
      icon: <TestTube className="w-10 h-10" />,
      title: "امتحانات تجريبية",
      description: "نماذج امتحانات مشابهة لامتحانات الثانوية العامة مع التصحيح"
    }
  ];

  const gradeLevels = [
    {
      grade: "الصف الثاني الثانوي",
      subjects: ["الأدب الجاهلي", "النحو والصرف", "البلاغة العربية", "النصوص المقررة", "التعبير الإبداعي"],
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop",
      duration: "عام دراسي كامل",
      price: "3500 جنيه",
      lessons: "130 درس"
    },
    {
      grade: "الصف الثالث الثانوي",
      subjects: ["مراجعة شاملة", "امتحانات سنوات سابقة", "تحليل النصوص", "القواعد المتقدمة", "التدريب على الامتحانات"],
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      duration: "عام دراسي كامل",
      price: "4000 جنيه",
      lessons: "150 درس"
    }
  ];

  const examPreparation = [
    {
      title: "المراجعات النهائية",
      count: "30+",
      description: "جلسات مراجعة شاملة قبل الامتحانات",
      icon: <BookMarked className="w-6 h-6" />
    },
    {
      title: "نماذج الامتحانات",
      count: "50+",
      description: "نماذج مشابهة لامتحانات الثانوية العامة",
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: "حلول الأسئلة",
      count: "15 عام",
      description: "حلول مفصلة لامتحانات السنوات السابقة",
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "نسبة النجاح",
      count: "98%",
      description: "نسبة النجاح في امتحانات الثانوية العامة",
      icon: <Trophy className="w-6 h-6" />
    }
  ];

  const successStories = [
    {
      name: "محمد أحمد",
      score: "98%",
      year: "2023",
      story: "حصلت على أعلى درجة في اللغة العربية بفضل منهجية الأستاذ السيد في الشرح. الشرح الواضح والمبسط جعل المادة سهلة وممتعة",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      school: "مدرسة النصر الثانوية"
    },
    {
      name: "ياسمين علي",
      score: "96%",
      year: "2023",
      story: "الشرح الواضح للنصوص الأدبية ساعدني في فهمها بسهولة. الأستاذ السيد يملك طريقة رائعة في تبسيط المعلومات المعقدة",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      school: "مدرسة القاهرة الجديدة"
    },
    {
      name: "أحمد محمود",
      score: "95%",
      year: "2022",
      story: "التمارين المستمرة على القواعد النحوية كانت السبب في تفوقي. المنهجية المتبعة ساعدتني في فهم القواعد بشكل عملي",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      school: "مدرسة مصر الجديدة"
    },
    {
      name: "فاطمة حسن",
      score: "97%",
      year: "2023",
      story: "الدروس المسجلة كانت منقذة لي في أوقات المراجعة. استطاعت مراجعة الدروس في أي وقت ومن أي مكان",
      image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
      school: "مدرسة المعادي الثانوية"
    }
  ];

  const features = [
    {
      icon: <Video className="w-7 h-7" />,
      title: "فصول مباشرة تفاعلية",
      description: "حصص مباشرة مع الأستاذ السيد مع إمكانية التفاعل والمناقشة"
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: "مراجعات مسجلة",
      description: "جميع الحصص مسجلة يمكن مشاهدتها في أي وقت للمراجعة"
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "متابعة فردية",
      description: "متابعة شخصية لكل طالب وتقييم مستمر للأداء"
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "تقييم مستمر",
      description: "اختبارات دورية لمتابعة التقدم وتحسين الأداء"
    }
  ];

  const platformFeatures = [
    {
      icon: <Download className="w-8 h-8" />,
      title: "مواد تعليمية قابلة للتحميل",
      description: "تحميل جميع الملازم والمذكرات بصيغة PDF"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "دعم فني متواصل",
      description: "فريق دعم متاح 24/7 للإجابة على استفساراتك"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "نصائح وإرشادات",
      description: "نصائح قيمة لتحسين مستواك الدراسي"
    },
    {
      icon: <Users2 className="w-8 h-8" />,
      title: "مجموعات دراسية",
      description: "انضم إلى مجموعات دراسية مع زملائك"
    }
  ];

  const stats = [
    { number: "1,500+", label: "طالب متخرج", icon: <Users className="w-6 h-6" /> },
    { number: "10", label: "سنة خبرة", icon: <Award className="w-6 h-6" /> },
    { number: "98%", label: "نسبة النجاح", icon: <TrendingUp className="w-6 h-6" /> },
  ];

  const whyChooseUs = [
    {
      title: "خبرة طويلة",
      description: "أكثر من 20 عاماً في تدريس اللغة العربية",
      icon: <Award className="w-8 h-8" />
    },
    {
      title: "نتائج مضمونة",
      description: "نسبة نجاح 98% في الثانوية العامة",
      icon: <Trophy className="w-8 h-8" />
    },
    {
      title: "منهج شامل",
      description: "تغطية كاملة لجميع أجزاء المنهج المقرر",
      icon: <BookOpenCheck className="w-8 h-8" />
    },
    {
      title: "دعم مستمر",
      description: "متابعة ودعم الطلاب طوال العام الدراسي",
      icon: <Headphones className="w-8 h-8" />
    }
  ];

  const learningPath = [
    {
      step: "01",
      title: "التسجيل والاشتراك",
      description: "اختر المستوى الدراسي المناسب وسجل بسهولة"
    },
    {
      step: "02",
      title: "الحصص التفاعلية",
      description: "احضر الحصص المباشرة أو شاهد التسجيلات"
    },
    {
      step: "03",
      title: "التدريب والممارسة",
      description: "حل التمارين والامتحانات التجريبية"
    },
    {
      step: "04",
      title: "التفوق والنجاح",
      description: "حقق أحلامك في الثانوية العامة"
    }
  ];

  const studyMaterials = [
    {
      icon: <BookmarkCheck className="w-8 h-8" />,
      title: "ملازم شاملة",
      description: "ملازم مرتبة ومنسقة لكل المنهج",
      count: "25+"
    },
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: "أوراق عمل",
      description: "تمارين عملية لتثبيت المعلومات",
      count: "100+"
    },
    {
      icon: <FileQuestion className="w-8 h-8" />,
      title: "بنك أسئلة",
      description: "آلاف الأسئلة مع الحلول النموذجية",
      count: "500+"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "خرائط ذهنية",
      description: "خرائط مفاهيمية لتسهيل الحفظ",
      count: "30+"
    }
  ];

  const interactiveLearning = [
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: "جلسات أسئلة وأجوبة",
      description: "جلسات مباشرة للإجابة على جميع استفساراتك"
    },
    {
      icon: <Users2 className="w-12 h-12" />,
      title: "مجموعات نقاش",
      description: "تفاعل مع زملائك وتبادل الخبرات"
    },
    {
      icon: <LineChart className="w-12 h-12" />,
      title: "تقارير تقدم مفصلة",
      description: "تابع مستواك وتطورك بشكل دوري"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % successStories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % successStories.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="pt-20 min-h-screen flex items-center justify-center relative bg-slate-900">
        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/75"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
              {heroSlides[currentSlide].badge}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {heroSlides[currentSlide].title}
            </h1>
            
            <h2 className="text-xl md:text-2xl text-blue-200 font-medium">
              {heroSlides[currentSlide].subtitle}
            </h2>
            
            <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
              {heroSlides[currentSlide].description}
            </p>
            
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-base font-medium shadow-lg hover:shadow-xl transition-all">
                <BookOpen className="w-5 h-5" />
                ابدأ التعلم الآن
              </button>
              <button className="flex items-center gap-2 border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-xl text-base font-medium transition-all">
                <Play className="w-5 h-5" />
                شاهد فيديو تعريفي
              </button>
            </div> */}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-blue-600 w-8'
                    : 'bg-white/50 w-2 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3 text-white">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">لماذا تختارنا؟</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              نقدم تجربة تعليمية متميزة تجمع بين الخبرة الطويلة والأساليب الحديثة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Methodology Section */}
      <section id="methodology" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">طريقة التدريس</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              نتبع منهجية علمية مدروسة لضمان أفضل النتائج لطلاب الثانوية العامة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachingMethodology.map((item, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all text-center h-full flex flex-col">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm flex-grow">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">خطوات النجاح</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              رحلتك التعليمية معنا في أربع خطوات بسيطة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningPath.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-center h-full flex flex-col">
                <div className="bg-blue-600 text-white text-2xl font-bold w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm flex-grow">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grade Levels Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">المستويات الدراسية</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              شرح متكامل لجميع صفوف المرحلة الثانوية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {gradeLevels.map((level, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all">
                <img src={level.image} alt={level.grade} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{level.grade}</h3>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {level.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      {level.lessons}
                    </span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {level.subjects.slice(0, 3).map((subject, idx) => (
                      <li key={idx} className="flex items-center text-slate-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" />
                        {subject}
                      </li>
                    ))}
                    {level.subjects.length > 3 && (
                      <li className="text-blue-600 text-sm font-medium">+ {level.subjects.length - 3} مواضيع أخرى</li>
                    )}
                  </ul>
                  {/* <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-2xl font-bold text-blue-600">{level.price}</span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all font-medium">
                      سجل الآن
                    </button>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Materials Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">المواد التعليمية</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              مكتبة شاملة من المواد التعليمية المتنوعة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studyMaterials.map((material, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-center h-full flex flex-col">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {material.icon}
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{material.count}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{material.title}</h3>
                <p className="text-slate-600 text-sm flex-grow">{material.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Preparation Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">التحضير للامتحانات</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              استعداد كامل لامتحانات الثانوية العامة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {examPreparation.map((item, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all text-center h-full flex flex-col">
                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-600">
                  {item.icon}
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{item.count}</div>
                <h3 className="text-base font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm flex-grow">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Learning Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">التعلم التفاعلي</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              تفاعل مباشر ومتابعة شخصية لكل طالب
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {interactiveLearning.map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-center h-full flex flex-col">
                <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                <p className="text-slate-600 flex-grow">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">مميزات المنصة</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              تجربة تعليمية متكاملة مع أفضل الأدوات والمزايا
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all h-full">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">خدمات إضافية</h2>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              مزايا حصرية لطلابنا لضمان أفضل تجربة تعليمية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center hover:bg-white/20 transition-all h-full flex flex-col">
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-blue-100 text-sm flex-grow">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Slider Section */}
      <section className="py-20 bg-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Quote className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">قصص النجاح</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              طلابنا يتحدثون عن تجربتهم مع الأستاذ السيد
            </p>
          </div>
          
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl bg-slate-700/50 backdrop-blur-sm">
              <div className="transition-transform duration-500 ease-in-out">
                <div className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <img 
                        src={successStories[activeTestimonial].image} 
                        alt={successStories[activeTestimonial].name}
                        className="w-28 h-28 rounded-full object-cover border-4 border-blue-400 shadow-lg"
                      />
                    </div>
                    
                    <div className="flex-1 text-center md:text-right">
                      <div className="mb-4">
                        <div className="text-4xl font-bold text-blue-400 mb-2">
                          {successStories[activeTestimonial].score}
                        </div>
                        <h3 className="text-xl font-bold mb-1">{successStories[activeTestimonial].name}</h3>
                        <p className="text-slate-300 text-sm">
                          {successStories[activeTestimonial].school} - {successStories[activeTestimonial].year}
                        </p>
                      </div>
                      
                      <blockquote className="text-lg leading-relaxed mb-6 max-w-3xl mx-auto">
                        {successStories[activeTestimonial].story}
                      </blockquote>
                      
                      <div className="flex justify-center md:justify-start">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-blue-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex justify-center mt-6 gap-2">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeTestimonial 
                      ? 'bg-blue-500 w-8' 
                      : 'bg-slate-400 w-2 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <GraduationCap className="w-14 h-14 text-white mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ابدأ رحلتك نحو التفوق في الثانوية العامة
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            انضم إلى آلاف الطلاب الذين حققوا أحلامهم بفضل منهجية الأستاذ السيد
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center gap-2 bg-white text-blue-600 hover:bg-slate-50 px-8 py-3 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all">
              <Zap className="w-5 h-5" />
              سجل في الكورس الآن
            </button>
            <button className="flex items-center gap-2 border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-xl font-medium text-lg transition-all">
              <Calendar className="w-5 h-5" />
              احجز جلسة استشارية
            </button>
          </div>
        </div>
      </section>

      

      <Footer />
    </div>
  );
}