/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
  _id?: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: string;
  isVerified?: boolean;
}

interface OTPData {
  email: string;
  otp: string;
  mode: 'signup' | 'forgot' | null;
}

interface AuthState {
  loading: boolean;
  user: User | null;
  error: string | null;
  otpData: OTPData | null;
}

const initialState: AuthState = {
  loading: false,
  user: null,
  error: null,
  otpData: null,
};

// دالة مساعدة لحفظ بيانات OTP في sessionStorage
const saveOTPToStorage = (otpData: OTPData) => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('otpData', JSON.stringify(otpData));
      console.log('OTP data saved to sessionStorage:', { 
        email: otpData.email, 
        otp: otpData.otp.substring(0, 3) + '***',
        mode: otpData.mode 
      });
    } catch (error) {
      console.error('Error saving OTP to sessionStorage:', error);
    }
  }
};

// دالة مساعدة لتحميل بيانات OTP من sessionStorage
const loadOTPFromStorage = (): OTPData | null => {
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('otpData');
      if (stored) {
        const otpData = JSON.parse(stored);
        console.log('OTP data loaded from sessionStorage:', { 
          email: otpData.email, 
          otp: otpData.otp.substring(0, 3) + '***',
          mode: otpData.mode 
        });
        return otpData;
      }
    } catch (error) {
      console.error('Error loading OTP from sessionStorage:', error);
    }
  }
  return null;
};

// دالة مساعدة لمسح بيانات OTP من sessionStorage
const clearOTPFromStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('otpData');
      console.log('OTP data cleared from sessionStorage');
    } catch (error) {
      console.error('Error clearing OTP from sessionStorage:', error);
    }
  }
};

// ✅ Register with email verification
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    {
      username,
      email,
      phone,
      password,
      confirmPassword,
    }: {
      username: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
    },
    { rejectWithValue , dispatch}
  ) => {
    try {
      console.log('📧 Registering new student:', { username, email });
      
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        { username, email, phone, password, confirmPassword },
        { withCredentials: true }
      );
      
      toast.success("تم إنشاء حساب الطالب بنجاح! ✅");
      
      // Auto-login after successful registration
      // await dispatch(loginUser({ email, password })).unwrap();
      
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "حدث خطأ ما أثناء إنشاء الحساب";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
  
);

// ✅ Login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      
      toast.success("تم تسجيل الدخول ✅");
      
      // Fetch full profile to populate Redux
      await dispatch(getProfile());
      
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل تسجيل الدخول";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ✅ Logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      toast.success("تم تسجيل الخروج 👋");
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || "Logout failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ✅ Get Profile
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        { withCredentials: true }
      );
      return res.data.data.user;
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل تحميل الملف الشخصي";
      return rejectWithValue(message);
    }
  }
);

// ✅ Update Profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      if (!res.data.success) {
        return rejectWithValue(res.data.message);
      }
      
      toast.success(res.data.message || "تم تحديث الملف الشخصي بنجاح ✅");
      return res.data.data.user;
    } catch (err: any) {
      const message = err.response?.data?.message || 
                     err.response?.data?.error || 
                     err.message ||
                     "فشل تحديث الملف الشخصي";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ✅ Send OTP for verification
export const sendVerificationOTP = createAsyncThunk(
  "auth/sendVerificationOTP",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني 📩");
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل إرسال رمز التحقق";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ✅ Verify OTP
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      console.log('Verifying OTP:', { email, otp });
      
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      
      toast.success("تم التحقق بنجاح ✅");
      return res.data;
    } catch (err: any) {
      console.error('OTP verification error:', err.response?.data);
      const message = err.response?.data?.message || "رمز التحقق غير صحيح";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ✅ Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { email, currentPassword, newPassword, confirmPassword }: {
      email: string;
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        { email, currentPassword, newPassword, confirmPassword },
        { withCredentials: true }
      );
      toast.success("تم تغيير كلمة المرور بنجاح! ✅");
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل تغيير كلمة المرور";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ✅ Reset password AFTER OTP (forgot password flow)
export const resetPasswordAfterOTP = createAsyncThunk(
  "auth/resetPasswordAfterOTP",
  async (
    { email, otp, newPassword, confirmPassword }: {
      email: string;
      otp: string;
      newPassword: string;
      confirmPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('Sending reset password request:', { 
        email, 
        otp: otp.substring(0, 3) + '***',
        passwordLength: newPassword.length 
      });
      
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password-after-otp`,
        { email, otp, newPassword, confirmPassword },
        { withCredentials: true }
      );
      
      toast.success("تم تغيير كلمة المرور بنجاح! ✅");
      return res.data;
    } catch (err: any) {
      console.error('Reset password error:', err.response?.data);
      const message = err.response?.data?.message || "فشل تغيير كلمة المرور";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    ...initialState,
    // تحميل البيانات من sessionStorage عند التهيئة
    otpData: loadOTPFromStorage()
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.error = null;
      state.otpData = null;
      clearOTPFromStorage();
    },
    clearError: (state) => {
      state.error = null;
    },
    // حفظ بيانات OTP في Redux و sessionStorage
    setOTPData: (state, action: PayloadAction<OTPData>) => {
      state.otpData = action.payload;
      saveOTPToStorage(action.payload);
    },
    // مسح بيانات OTP من Redux و sessionStorage
    clearOTPData: (state) => {
      state.otpData = null;
      clearOTPFromStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // state.user = action.payload?.data?.user || action.payload?.user || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both response structures
        state.user = action.payload?.data?.user || action.payload?.user || action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
      })

      // 🔹 Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
        state.otpData = null;
        clearOTPFromStorage();
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Send OTP
      .addCase(sendVerificationOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendVerificationOTP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendVerificationOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Reset Password After OTP
      .addCase(resetPasswordAfterOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordAfterOTP.fulfilled, (state) => {
        state.loading = false;
        state.otpData = null;
        clearOTPFromStorage();
      })
      .addCase(resetPasswordAfterOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearAuth, clearError, setOTPData, clearOTPData } = authSlice.actions;
export default authSlice.reducer;