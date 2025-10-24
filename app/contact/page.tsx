/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  CheckCircle,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import Navbar from '@/components/Navbar'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast, { Toaster } from 'react-hot-toast'

// ✅ Validation schema with Zod
const contactSchema = z.object({
  name: z.string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(50, 'الاسم يجب ألا يتجاوز 50 حرفاً')
    .regex(/^[\p{Letter}\s]+$/u, 'الاسم يجب أن يحتوي على أحرف فقط'),
  
  email: z.string()
    .email('البريد الإلكتروني غير صحيح')
    .min(5, 'البريد الإلكتروني قصير جداً')
    .max(100, 'البريد الإلكتروني طويل جداً'),
  
  phone: z.string()
    .regex(/^01[0-2|5]{1}[0-9]{8}$/, 'رقم الهاتف المصري غير صحيح')
    .min(11, 'رقم الهاتف يجب أن يكون 11 رقماً')
    .max(11, 'رقم الهاتف يجب أن يكون 11 رقماً'),
  
  message: z.string()
    .min(10, 'الرسالة يجب أن تكون على الأقل 10 أحرف')
    .max(1000, 'الرسالة يجب ألا تتجاوز 1000 حرف')
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: ''
    }
  })

  // track message for character count
  const messageValue = watch('message', '')

  // ✅ send to backend
  const onSubmit = async (data: ContactFormData) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "خطأ غير متوقع")

      toast.success(result.message || "تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريباً.")
      reset()
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.")
    }
  }

  // Contact info cards
  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "البريد الإلكتروني",
      content: "info@alsayed-platform.com",
      description: "راسلنا على مدار الساعة"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "الهاتف",
      content: "01224641106",
      description: "من الأحد إلى الخميس"
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" dir="rtl">
      <Toaster position="top-center" />

      <Navbar />

      {/* Header Section */}
      <motion.section 
        className="py-16 text-center pt-24"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            تواصل معنا
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            نحن هنا لمساعدتك في رحلتك التعليمية. تواصل معنا لأي استفسار أو للحصول على استشارة مجانية.
          </p>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* variants={itemVariants}  */}
          {/* Contact Information */}
          <motion.div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl h-full">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  معلومات التواصل
                </h2>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-4 space-x-reverse p-4 rounded-2xl bg-gradient-to-l from-blue-50 to-purple-50 hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                        {React.cloneElement(item.icon, { className: "w-6 h-6 text-white" })}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 text-base">{item.title}</h3>
                        <p className="text-base text-blue-600 font-medium">{item.content}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Stats */}
                <motion.div 
                  className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                      <span className="text-sm font-semibold text-green-600">استجابة سريعة</span>
                    </div>
                    <p className="text-xs text-gray-600">متوسط وقت الاستجابة: أقل من 4 ساعات</p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
            {/* variants={formVariants} */}
          {/* Contact Form */}
          <motion.div  className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">أرسل رسالة</h2>
                <p className="text-gray-600 mb-6 text-base">املأ النموذج أدناه وسنعاود الاتصال بك قريبًا</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Name */}
                    <motion.div>
                      <Label htmlFor="name" className="mb-2 block">الاسم الكامل *</Label>
                      <Input id="name" {...register('name')} placeholder="أدخل اسمك الكامل" />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </motion.div>

                    {/* Email */}
                    <motion.div>
                      <Label htmlFor="email" className="mb-2 block">البريد الإلكتروني *</Label>
                      <Input id="email" type="email" {...register('email')} placeholder="example@email.com" />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </motion.div>
                  </div>

                  {/* Phone */}
                  <motion.div>
                    <Label htmlFor="phone" className="mb-2 block">رقم الهاتف *</Label>
                    <Input id="phone" type="tel" {...register('phone')} placeholder="01XXXXXXXXX" />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </motion.div>

                  {/* Message */}
                  <motion.div>
                    <Label htmlFor="message" className="mb-2 block">الرسالة *</Label>
                    <Textarea id="message" rows={6} {...register('message')} placeholder="اكتب رسالتك هنا..." />
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                    <p className="text-gray-500 text-xs mt-1">{messageValue.length}/1000 حرف</p>
                  </motion.div>

                  {/* Submit */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
