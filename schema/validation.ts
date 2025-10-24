import {z} from "zod";

export const loginSchema = z.object({
  email: z.string().email("الرجاء إدخال بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

// schema/validation.ts

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
      .max(30, "اسم المستخدم طويل جداً"),
    email: z.string().email("البريد الإلكتروني غير صالح"),
    phone: z.string()
    .regex(/^01[0-2,5][0-9]{8}$/, "رقم الهاتف يجب أن يكون مصريًا صحيحًا"),
    grade: z.enum([
    "الصف الثاني الثانوي", 
    "الصف الثالث الثانوي",
    "غير محدد"
  ]).optional(),
  studentId: z.string().optional(),
    password: z
      .string()
      .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      .max(100, "كلمة المرور طويلة جداً"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });



export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
    .max(50, "اسم المستخدم طويل جداً")
    .optional(),
  phone: z
    .string()
    .regex(/^01[0-25][0-9]{8}$/, "رقم الهاتف يجب أن يكون مصريًا صحيحًا")
    .optional(),
  bio: z
    .string()
    .max(500, "السيرة الذاتية لا يجب أن تتجاوز 500 حرف")
    .optional(),
  avatar: z
    .string()
    .url("رابط الصورة غير صالح")
    .optional(),
});