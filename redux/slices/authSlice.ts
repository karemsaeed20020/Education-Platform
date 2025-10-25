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
  lastLogin?: string;
}

interface OTPData {
  email: string;
  otp: string;
  mode: 'signup' | 'forgot' | null;
}

interface AuthState {
  loading: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
  otpData: OTPData | null;
}

const initialState: AuthState = {
  loading: false,
  user: null,
  token: null,
  error: null,
  otpData: null,
};

// In your authSlice.ts - update the api instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Important for cookies
  timeout: 10000, // Add timeout
});

// Add this after creating the api instance in authSlice.ts

// ✅ Add request interceptor to include token in all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (redux-persist)
    if (typeof window !== 'undefined') {
      try {
        const persistedState = localStorage.getItem('persist:root');
        if (persistedState) {
          const parsedState = JSON.parse(persistedState);
          const authState = JSON.parse(parsedState.auth);
          const token = authState.token;
          
          if (token && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 Token added to request:', config.url);
          }
        }
      } catch (error) {
        console.log('❌ Error reading token from storage');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
    { rejectWithValue }
  ) => {
    try {
      console.log('📧 Registering new student:', { username, email });
      
      const res = await api.post(
        '/api/auth/register',
        { username, email, phone, password, confirmPassword }
      );
      
      toast.success("تم إنشاء حساب الطالب بنجاح! ✅");
      
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "حدث خطأ ما أثناء إنشاء الحساب";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ✅ Login User - UPDATED to auto-load profile
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const res = await api.post('/api/auth/login', { 
        email, 
        password 
      });

      console.log('✅ Login response:', {
        hasToken: !!res.data.token,
        tokenPreview: res.data.token ? res.data.token.substring(0, 20) + '...' : 'No token'
      });

      toast.success("تم تسجيل الدخول ✅");

      // ✅ Auto-load profile after login
      if (res.data.token) {
        console.log('🔐 Auto-loading profile after login...');
        // Small delay to ensure token is stored
        setTimeout(() => {
          dispatch(getProfile());
        }, 500);
      }

      return {
        token: res.data.token,
        user: res.data.data?.user
      };
    } catch (err: any) {
      console.error('❌ Login error:', err.response?.data);
      const message = err.response?.data?.message || "فشل تسجيل الدخول";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ✅ Logout - Clears token from Redux
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/logout');
      toast.success("تم تسجيل الخروج 👋");
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || "Logout failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// In your authSlice.ts - update getProfile and other protected calls
// ✅ Get User Profile - FIXED with manual fetch
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get token from Redux state
      const state = getState() as any;
      const token = state.auth.token;
      
      console.log('🔐 Profile request - Token:', token ? 'Present' : 'Missing');

      if (!token) {
        throw new Error('No token available');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data.user;
      
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "فشل تحميل الملف الشخصي";
      return rejectWithValue(message);
    }
  }
);

// ✅ Update Profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await api.patch(
        '/api/users/profile',
        formData,
        {
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
      const res = await api.post('/api/auth/send-otp', { email });
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
      
      const res = await api.post('/api/auth/verify-otp', { email, otp });
      
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
      const res = await api.patch(
        '/api/auth/reset-password',
        { email, currentPassword, newPassword, confirmPassword }
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

// ✅ Reset password AFTER OTP
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
      
      const res = await api.post(
        '/api/auth/reset-password-after-otp',
        { email, otp, newPassword, confirmPassword }
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
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.otpData = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
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
        state.token = action.payload.token;
        state.user = action.payload.user || action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.token = null;
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
        state.token = null;
        state.error = null;
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
      })
      .addCase(resetPasswordAfterOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export { api };

export const { setUser, setToken, clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;