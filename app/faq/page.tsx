"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FAQPage() {
  const faqs = [
    {
      question: "من هو المعلم؟",
      answer:
        "معلم لغة عربية متخصص في المرحلة الثانوية، بخبرة طويلة في تدريس النحو والأدب والبلاغة.",
    },
    {
      question: "هل الدروس فردية أم جماعية؟",
      answer:
        "يوجد دروس فردية عبر الإنترنت أو مجموعات صغيرة لزيادة التفاعل بين الطلاب.",
    },
    {
      question: "كيف يمكنني حضور الدروس؟",
      answer:
        "من خلال تسجيل الدخول إلى المنصة واختيار رابط الحصة المباشرة أو تحميل التسجيل لاحقاً.",
    },
    {
      question: "ما طرق الدفع المتاحة؟",
      answer:
        "يمكن الدفع عبر فودافون كاش أو التحويل البنكي أو البطاقات البنكية.",
    },
    {
      question: "كيف أتابع مستوى ابني؟",
      answer:
        "يوجد لوحة تحكم خاصة لولي الأمر لعرض الحضور والواجبات ونتائج الاختبارات.",
    },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
    >
      {/* ✅ Navbar */}
      <Navbar />

      {/* ✅ FAQ Section with fixed spacing from Navbar */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20"
      >
        <div className="text-center mb-14">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            الأسئلة الشائعة
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-3 text-lg text-gray-600"
          >
            كل ما تحتاج معرفته حول المنصة والدروس.
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
              className="mb-4 last:mb-0"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-gray-200 rounded-xl px-4"
                >
                  <AccordionTrigger className="text-lg font-medium text-right hover:text-blue-600 transition-colors duration-300">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent
                    className="text-gray-700 text-right leading-relaxed pb-4 
                               transition-all duration-500 ease-in-out data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
                  >
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
      <Footer />
    </div>
  );
}
