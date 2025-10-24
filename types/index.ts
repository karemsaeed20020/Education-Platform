import { loginSchema, registerSchema } from "@/schema/validation";
import {z} from "zod";

export type LoginValues = z.infer<typeof loginSchema>;


// types/index.ts
export type RegisterValues = z.infer<typeof registerSchema>;

export interface User {
  _id?: string;
  username: string;
  email: string;
  phone?: string;
  grade?: string;
  avatar?: string;
  bio?: string;
  role: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface User {
  _id?: string;
  username: string;
  email: string;
  phone?: string;
  grade?: string;
  avatar?: string;
  bio?: string;
  role: string;
  isVerified?: boolean;
  createdAt?: string;
}

// export interface Student {
//   _id: string;
//   username: string;
//   email: string;
//   phone: string;
//   grade: string; // Changed from optional to required
//   role: string;
//   isActive: boolean;
//   createdAt: string;
// }

export interface Student {
  _id: string;
  username: string;
  email: string;
  phone: string;
  grade: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  // Add the missing properties
  fullName?: string; // Make it optional if it might not always be present
  studentId?: string; // Make it optional if it might not always be present
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalStudents: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MenuItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  active: boolean;
}