'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { GraduationCap, Users, Target, Star, BookOpen, Award } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "خبرة متخصصة",
      description: "أكثر من 10 سنوات في تدريس اللغة العربية لطلاب الثانوية العامة"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "نتائج مضمونة",
      description: "نسبة نجاح 95% لطلابنا في امتحانات الثانوية العامة"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "منهج مكثف",
      description: "شرح مبسط يشمل كل أجزاء المنهج مع التركيز على النقاط الحرجة"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "تميز محلي",
      description: "فهم عميق لطبيعة امتحانات محافظة الغربية وطنطا"
    }
  ];

  const stats = [
    { number: "500+", label: "طالب نجحوا معنا" },
    { number: "95%", label: "نسبة النجاح" },
    { number: "10+", label: "سنوات خبرة" },
    { number: "100%", label: "رضا أولياء الأمور" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-20">
      <Navbar />
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            السيد الأبي
          </h1>
          <p className="text-xl md:text-2xl text-blue-600 font-semibold mb-4">
            لتعليم اللغة العربية - طنطا
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            مؤسسة تعليمية رائدة في تدريس اللغة العربية لطلاب المرحلة الثانوية في طنطا ومحافظة الغربية، 
            نعمل برؤية واضحة لتمكين الطلاب من إتقان لغتهم الأم وتحقيق التفوق الأكاديمي.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">رسالتنا</h2>
              <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <p>
                  تمكين طلاب الثانوية العامة في طنطا والغربية من إتقان اللغة العربية 
                  بكل ثقة وتميز، من خلال:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span>تبسيط قواعد النحو والصرف بشكل عملي</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span>تحسين مهارات القراءة والتحليل الأدبي</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span>تطوير قدرات التعبير الكتابي والإملاء</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span>تحضير مكثف لامتحانات الثانوية العامة</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">رؤيتنا</h3>
              <p className="text-lg leading-relaxed">
                أن نكون المرجع الأول في طنطا لتعليم اللغة العربية، 
                وأن نساهم في تخريج جيل متمكن من لغته، معتز بهويته، 
                قادر على تحقيق التفوق في الثانوية العامة والنجاح في مسيرته الأكاديمية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">لماذا تختار السيد الأبي؟</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Approach */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">منهجيتنا في التدريس</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">التأسيس المتين</h3>
              <p className="text-gray-600">
                بناء أساس قوي في النحو والصرف من خلال شرح مبسط وأمثلة عملية
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">تعليم تفاعلي</h3>
              <p className="text-gray-600">
                حصص تفاعلية تشجع على المشاركة والمناقشة وتطبيق المعلومة
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">توجيه مكثف</h3>
              <p className="text-gray-600">
                تدريب مركز على نماذج الامتحانات وأساليب الإجابة المميزة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">انطلق نحو التفوق في اللغة العربية</h2>
          <p className="text-xl mb-8 opacity-90">
            انضم إلى عائلة السيد الأبي وابدأ رحلتك towards إتقان اللغة العربية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300">
              سجل الآن
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300">
              تعرف أكثر
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}