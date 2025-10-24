// app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

interface OrderItem {
  course: {
    _id: string;
    title: string;
    thumbnail: string;
    instructor: {
      username: string;
    };
  };
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'under_review' | 'completed' | 'rejected' | 'failed';
  status: 'pending_payment' | 'under_review' | 'completed' | 'cancelled';
  transactionReference?: string;
  paymentProof?: {
    transactionId?: string;
    submittedAt: string;
  };
  adminNotes?: string;
  createdAt: string;
  completedAt?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/checkout/my-orders', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setOrders(data.data.orders);
        }
      } else {
        toast.error('فشل في تحميل الطلبات');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('حدث خطأ في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (order: Order) => {
    // تعريف جميع الحالات الممكنة مع قيم افتراضية آمنة
    const statusConfig = {
      pending_payment: {
        label: 'بانتظار الدفع',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      under_review: {
        label: 'قيد المراجعة',
        color: 'bg-blue-100 text-blue-800',
        icon: AlertCircle
      },
      completed: {
        label: 'مكتمل',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      cancelled: {
        label: 'ملغي',
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      },
      // حالات افتراضية للتعامل مع أي قيمة غير متوقعة
      default: {
        label: order.status || 'غير معروف',
        color: 'bg-gray-100 text-gray-800',
        icon: AlertCircle
      }
    };

    // الحصول على التكوين أو استخدام الافتراضي
    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.default;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      vodafone_cash: 'فودافون كاش',
      mobinil_cash: 'موبينيل كاش'
    };
    return methods[method] || method;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'تاريخ غير معروف';
    }
  };

  const getTotalCourses = (order: Order) => {
    return order.items?.length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Navbar />
        <div className="container mx-auto px-4 mt-16">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="mr-2">جاري تحميل الطلبات...</span>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                العودة للكورسات
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">طلباتي</h1>
              <p className="text-gray-600 mt-2">تابع حالة طلباتك وتاريخ الشراء</p>
            </div>
          </div>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">لا توجد طلبات</h2>
              <p className="text-gray-600 mb-6">لم تقم بأي عمليات شراء حتى الآن</p>
              <Link href="/courses">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  تصفح الكورسات
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">
                              طلب رقم: #{order._id.slice(-8).toUpperCase()}
                            </h3>
                            {getStatusBadge(order)}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {order.totalAmount} ج.م
                        </div>
                        <div className="text-sm text-gray-600">
                          {getPaymentMethodText(order.paymentMethod)}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <img
                            src={item.course?.thumbnail || '/default-course.jpg'}
                            alt={item.course?.title}
                            className="w-12 h-9 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {item.course?.title || 'كورس غير معروف'}
                            </h4>
                            <p className="text-gray-600 text-xs">
                              {item.course?.instructor?.username || 'مدرس غير معروف'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{item.price} ج.م</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        {getTotalCourses(order)} كورس • الإجمالي: {order.totalAmount} ج.م
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {order.status === 'completed' && order.items?.[0]?.course?._id && (
                          <Link href={`/courses/${order.items[0].course._id}`}>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Eye className="h-4 w-4 ml-2" />
                              مشاهدة الكورس
                            </Button>
                          </Link>
                        )}
                        
                        {order.paymentProof?.transactionId && (
                          <Badge variant="outline" className="text-xs">
                            رقم العملية: {order.paymentProof.transactionId}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {order.adminNotes && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-sm text-yellow-800">
                          <strong>ملاحظات الإدارة:</strong> {order.adminNotes}
                        </div>
                      </div>
                    )}

                    {/* Pending Payment Instructions */}
                    {order.status === 'pending_payment' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <strong>ملاحظة:</strong> لم يتم استلام تأكيد الدفع بعد. 
                          <Link href="/checkout" className="underline mr-2">
                            اضغط هنا لإكمال الدفع
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Statistics */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                  <div className="text-sm text-gray-600">إجمالي الطلبات</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">طلبات مكتملة</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'pending_payment' || o.status === 'under_review').length}
                  </div>
                  <div className="text-sm text-gray-600">قيد المعالجة</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {orders.filter(o => o.status === 'cancelled').length}
                  </div>
                  <div className="text-sm text-gray-600">طلبات ملغاة</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}