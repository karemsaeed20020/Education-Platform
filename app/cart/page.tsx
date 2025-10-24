// app/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface CartItem {
  _id: string;
  course: {
    _id: string;
    title: string;
    shortDescription: string;
    price: number;
    discountPrice?: number;
    thumbnail: string;
    instructor: {
      username: string;
      profilePicture?: string;
    };
    totalVideos: number;
    totalDuration: number;
  };
  addedAt: string;
}

interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/my-cart', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCart(data.data.cart);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('فشل في تحميل سلة التسوق');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (courseId: string) => {
    setUpdating(courseId);
    try {
      const response = await fetch(`http://localhost:5000/api/cart/remove/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCart(data.data.cart);
          toast.success('تم إزالة الكورس من السلة');
        }
      } else {
        toast.error('فشل في إزالة الكورس من السلة');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('حدث خطأ في إزالة الكورس من السلة');
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!confirm('هل أنت متأكد من تفريغ سلة التسوق؟')) return;

    try {
      const response = await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCart(data.data.cart);
          toast.success('تم تفريغ سلة التسوق');
        }
      } else {
        toast.error('فشل في تفريغ سلة التسوق');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('حدث خطأ في تفريغ سلة التسوق');
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error('سلة التسوق فارغة');
      return;
    }
    router.push('/checkout');
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0 دقيقة';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div>
            <Navbar />
        </div>
        
      <div className="container mx-auto px-4 mt-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                العودة للكورسات
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">سلة التسوق</h1>
              <p className="text-gray-600 mt-2">راجع مشترياتك وأكمل عملية الشراء</p>
            </div>
          </div>
          
          {cartItems.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              تفريغ السلة
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">سلة التسوق فارغة</h2>
              <p className="text-gray-600 mb-6">لم تقم بإضافة أي كورسات إلى سلة التسوق بعد</p>
              <Link href="/courses">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <ShoppingCart className="h-4 w-4 ml-2" />
                  تصفح الكورسات
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    الكورسات المضافة ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div key={item._id} className="p-6">
                        <div className="flex gap-4">
                          <img
                            src={item.course.thumbnail}
                            alt={item.course.title}
                            className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <Link 
                                href={`/courses/${item.course._id}`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                <h3 className="font-semibold text-lg line-clamp-2">
                                  {item.course.title}
                                </h3>
                              </Link>
                              
                              <div className="text-right ml-4">
                                {item.course.discountPrice ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-green-600">
                                      {item.course.discountPrice} ج.م
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      {item.course.price} ج.م
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">
                                    {item.course.price} ج.م
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {item.course.shortDescription}
                            </p>
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-4">
                                <span>المدرس: {item.course.instructor.username}</span>
                                <span>{item.course.totalVideos} درس</span>
                                <span>{formatDuration(item.course.totalDuration)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.course._id)}
                            disabled={updating === item.course._id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {updating === item.course._id ? (
                              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 ml-2" />
                            )}
                            {updating === item.course._id ? 'جاري الإزالة...' : 'إزالة'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>عدد الكورسات:</span>
                      <span>{cartItems.length}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>المبلغ الإجمالي:</span>
                      <span>{totalAmount} ج.م</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>المجموع النهائي:</span>
                      <span className="text-green-600">{totalAmount} ج.م</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    <CreditCard className="h-4 w-4 ml-2" />
                    إتمام الشراء
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    🔒 عملية دفع آمنة ومشفرة
                  </div>
                </CardContent>
              </Card>

              {/* Security Features */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>ضمان استرداد الأموال خلال 30 يوم</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>دعم فني متواصل 24/7</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>وصول مدى الحياة للكورسات</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}