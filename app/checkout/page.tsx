// app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Smartphone, 
  Upload, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Loader2,
  Receipt
} from 'lucide-react';
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
    };
    totalVideos: number;
    totalDuration: number;
  };
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalAmount: number;
}

interface Order {
  _id: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentInstructions: any;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vodafone_cash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [receiptImage, setReceiptImage] = useState('');
  const [transactionId, setTransactionId] = useState('');

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

  const createOrder = async () => {
    if (!phoneNumber) {
      toast.error('رقم الهاتف مطلوب');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('http://localhost:5000/api/checkout/create-cash-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentMethod,
          phoneNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOrder(data.data.order);
        toast.success('تم إنشاء الطلب بنجاح');
      } else {
        toast.error(data.message || 'فشل في إنشاء الطلب');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('حدث خطأ في إنشاء الطلب');
    } finally {
      setProcessing(false);
    }
  };

  const confirmPayment = async () => {
    if (!receiptImage) {
      toast.error('صورة الإيصال مطلوبة');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:5000/api/checkout/confirm-payment/${order?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          receiptImage,
          transactionId
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم إرسال الإيصال بنجاح، جاري المراجعة');
        router.push('/orders');
      } else {
        toast.error(data.message || 'فشل في تأكيد الدفع');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('حدث خطأ في تأكيد الدفع');
    } finally {
      setProcessing(false);
    }
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
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Navbar />
        <div className="container mx-auto px-4 mt-16">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <CreditCard className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">سلة التسوق فارغة</h2>
              <p className="text-gray-600 mb-6">لم تقم بإضافة أي كورسات للشراء</p>
              <Link href="/courses">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  تصفح الكورسات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Navbar />
      <div className="container mx-auto px-4 mt-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              العودة للسلة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إتمام الشراء</h1>
            <p className="text-gray-600 mt-2">أكمل عملية الشراء باستخدام الدفع النقدي</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {!order ? (
              <>
                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      اختر طريقة الدفع
                    </CardTitle>
                    <CardDescription>
                      اختر طريقة الدفع النقدي المناسبة لك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
                        <RadioGroupItem value="vodafone_cash" id="vodafone_cash" />
                        <Label htmlFor="vodafone_cash" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-semibold">Vodafone Cash</div>
                              <div className="text-sm text-gray-600">الدفع عبر فودافون كاش</div>
                            </div>
                            <Badge variant="secondary">شائع</Badge>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
                        <RadioGroupItem value="mobinil_cash" id="mobinil_cash" />
                        <Label htmlFor="mobinil_cash" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-semibold">MobiNil Cash</div>
                              <div className="text-sm text-gray-600">الدفع عبر موبينيل كاش</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم هاتفك</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="أدخل رقم هاتفك مثال: 01012345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                      <p className="text-sm text-gray-600">
                        سنرسل لك تأكيد الطلب على هذا الرقم
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>ملخص الطلب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item._id} className="flex items-center gap-4">
                          <img
                            src={item.course.thumbnail}
                            alt={item.course.title}
                            className="w-16 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.course.title}</h4>
                            <p className="text-gray-600 text-xs">
                              {item.course.instructor.username}
                            </p>
                          </div>
                          <div className="text-right">
                            {item.course.discountPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-green-600">
                                  {item.course.discountPrice} ج.م
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {item.course.price} ج.م
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-gray-900">
                                {item.course.price} ج.م
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>المجموع:</span>
                        <span>{totalAmount} ج.م</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>الإجمالي النهائي:</span>
                        <span className="text-green-600">{totalAmount} ج.م</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Create Order Button */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={createOrder}
                  disabled={processing || !phoneNumber}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4 ml-2" />
                  )}
                  {processing ? 'جاري إنشاء الطلب...' : 'إنشاء الطلب والدفع'}
                </Button>
              </>
            ) : (
              /* Payment Instructions */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    تم إنشاء الطلب بنجاح
                  </CardTitle>
                  <CardDescription>
                    يرجى اتباع التعليمات التالية لإتمام عملية الدفع
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Details */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">رقم الطلب: #{order._id.slice(-8)}</div>
                        <div className="text-sm text-gray-600">
                          المبلغ: <strong>{order.totalAmount} ج.م</strong>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        بانتظار الدفع
                      </Badge>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      تعليمات الدفع عبر {order.paymentInstructions.name}
                    </h3>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-center mb-4">
                        <div className="text-lg font-bold text-blue-900">
                          {order.paymentInstructions.phoneNumber}
                        </div>
                        <div className="text-sm text-blue-700">
                          {order.paymentInstructions.accountName}
                        </div>
                        <div className="text-2xl font-bold text-green-600 mt-2">
                          {order.totalAmount} ج.م
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.paymentInstructions.instructions.map((instruction, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-sm">{instruction}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Upload Receipt */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      رفع إيصال الدفع
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="transactionId">رقم العملية (اختياري)</Label>
                        <Input
                          id="transactionId"
                          placeholder="أدخل رقم العملية من الإيصال"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="receiptImage">صورة الإيصال *</Label>
                        <Textarea
                          id="receiptImage"
                          placeholder="الصق رابط صورة الإيصال هنا (يمكنك استخدام أي خدمة رفع صور مثل imgur)"
                          value={receiptImage}
                          onChange={(e) => setReceiptImage(e.target.value)}
                          rows={3}
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          يرجى رفع صورة واضحة لإيصال الدفع لتسريع عملية المراجعة
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Payment Button */}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    onClick={confirmPayment}
                    disabled={processing || !receiptImage}
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Receipt className="h-4 w-4 ml-2" />
                    )}
                    {processing ? 'جاري التأكيد...' : 'تأكيد رفع الإيصال'}
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline ml-1" />
                    مدة المراجعة: ٢٤ ساعة كحد أقصى
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
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

                {/* Security Features */}
                <div className="pt-4 border-t">
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}