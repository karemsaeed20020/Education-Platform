/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getProfile, updateProfile } from "@/redux/slices/authSlice";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  X,
  Upload,
  Loader,
  Edit3,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface SafeUser {
  username: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
}

const getSafeUser = (user: any): SafeUser => ({
  username: user?.username || "مستخدم جديد",
  email: user?.email || "غير محدد",
  phone: user?.phone || "غير محدد",
  avatar: user?.avatar || "",
  bio: user?.bio || "",
});

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, error } = useSelector((state: RootState) => state.auth);

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ username: "", phone: "", bio: "" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const safeUser = getSafeUser(user);
      setFormData({
        username: safeUser.username,
        phone: safeUser.phone,
        bio: safeUser.bio,
      });
    }
  }, [user]);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleSave = async () => {
  if (!formData.username.trim()) {
    setLocalError("اسم المستخدم مطلوب");
    return;
  }
  if (password && password !== confirmPassword) {
    setLocalError("كلمات المرور غير متطابقة");
    return;
  }

  setSaveLoading(true);
  try {
    const payload = new FormData();
    payload.append("username", formData.username);
    payload.append("phone", formData.phone);
    payload.append("bio", formData.bio);

    if (imageFile) payload.append("avatar", imageFile);

    if (password) {
      payload.append("password", password);
      payload.append("confirmPassword", confirmPassword); // ✅ الحل هنا
    }

    await dispatch(updateProfile(payload)).unwrap();
    setSuccessMessage("✅ تم تحديث الملف الشخصي بنجاح");
    setIsEdit(false);
    setPassword("");
    setConfirmPassword("");
    setImageFile(null);
    setPreviewUrl(null);
    dispatch(getProfile());
  } catch (err: any) {
    setLocalError(err.message || "فشل في تحديث الملف الشخصي");
  } finally {
    setSaveLoading(false);
  }
};


  const safeUser = getSafeUser(user);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Alerts */}
      {(successMessage || error || localError) && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-96 max-w-[90vw]">
          {successMessage && (
            <Alert className="bg-green-50 border-green-200 text-green-800 shadow-lg">
              <AlertDescription className="flex items-center gap-2 justify-center">
                <Save className="w-4 h-4" /> {successMessage}
              </AlertDescription>
            </Alert>
          )}
          {(error || localError) && (
            <Alert className="bg-red-50 border-red-200 text-red-800 shadow-lg">
              <AlertDescription className="flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4" /> {localError || error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Hero */}
      <section
        className="relative h-96 bg-center bg-cover"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop")`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </section>

      {/* Layout */}
      <main className="max-w-6xl mx-auto px-4 -mt-28 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <aside className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
          <div className="relative group">
            {isEdit ? (
              <label className="cursor-pointer block">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg rounded-full overflow-hidden">
                  <AvatarImage
                    src={previewUrl || safeUser.avatar || "/default-avatar.png"}
                    alt={formData.username}
                  />
                  <AvatarFallback className="bg-blue-200 text-blue-700 text-2xl font-bold">
                    {formData.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] && setImageFile(e.target.files[0])
                  }
                />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-white" />
                </div>
              </label>
            ) : (
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src={safeUser.avatar || "/default-avatar.png"}
                  alt={safeUser.username}
                />
                <AvatarFallback className="bg-blue-200 text-blue-700 text-2xl font-bold">
                  {safeUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <h2 className="mt-4 text-xl font-bold text-gray-800">
            {safeUser.username}
          </h2>
          <p className="text-gray-500 text-sm">{safeUser.email}</p>
        </aside>

        {/* Main Form */}
        <section className="md:col-span-2 bg-white rounded-2xl shadow p-8">
          <h3 className="text-lg font-bold mb-6 text-gray-800">الملف الشخصي</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <Label className="text-right mb-2 block">اسم المستخدم</Label>
              {isEdit ? (
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="text-right"
                />
              ) : (
                <div className="p-3 rounded-lg bg-gray-50 border text-right">
                  {safeUser.username}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label className="text-right mb-2 block">رقم الهاتف</Label>
              {isEdit ? (
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="text-right"
                />
              ) : (
                <div className="p-3 rounded-lg bg-gray-50 border text-right">
                  {safeUser.phone}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <Label className="text-right mb-2 block">نبذة عنك</Label>
            {isEdit ? (
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full p-3 rounded-lg border bg-gray-50 text-right resize-none"
                rows={4}
              />
            ) : (
              <div className="p-3 rounded-lg bg-gray-50 border text-right min-h-[100px]">
                {safeUser.bio || "لم تقم بإضافة نبذة بعد"}
              </div>
            )}
          </div>

          {/* Passwords */}
          {isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label className="text-right mb-2 block">كلمة المرور الجديدة</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-right"
                />
              </div>
              <div>
                <Label className="text-right mb-2 block">تأكيد كلمة المرور</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-right"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            {isEdit ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEdit(false)}
                  disabled={saveLoading}
                >
                  <X className="w-4 h-4 ml-1" /> إلغاء
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saveLoading ? (
                    <>
                      <Loader className="w-4 h-4 ml-1 animate-spin" /> جاري الحفظ
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-1" /> حفظ
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEdit(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit3 className="w-4 h-4 ml-1" /> تعديل الملف الشخصي
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
