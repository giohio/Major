// ===========================================
// PRICING PAGE COMPONENT
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// TODO: Import useAuth from your auth context
const useAuth = () => ({ 
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token')
});

interface Plan {
  id: number;
  name: string;
  description: string;
  user_type: string;
  price_monthly: number;
  price_yearly: number;
  chat_limit: number;
  voice_enabled: boolean;
  video_enabled: boolean;
  empathy_layer_enabled: boolean;
  doctor_access: boolean;
  priority_support: boolean;
  is_active: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'vnpay', name: 'VNPay', logo: '/images/vnpay.png', description: 'Thanh toán qua thẻ ATM/Visa/Master' },
  { id: 'momo', name: 'MoMo', logo: '/images/momo.png', description: 'Quét mã QR bằng ví MoMo' },
  { id: 'zalopay', name: 'ZaloPay', logo: '/images/zalopay.png', description: 'Quét mã QR bằng ZaloPay' }
];

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('momo');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const fetchPlans = useCallback(async () => {
    try {
      const userType = user?.role === 'doctor' ? 'doctor' : 'user';
      const response = await fetch(`/api/plans?user_type=${userType}`);
      const data = await response.json();
      setPlans(data.plans);
    } catch (err) {
      toast.error('Không thể tải danh sách gói');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);
  
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);
  
  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua gói');
      navigate('/login');
      return;
    }
    
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };
  
  const handlePurchase = async () => {
    if (!selectedPlan || !token) return;
    
    setProcessing(true);
    
    try {
      const response = await fetch('/api/plans/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          billing_cycle: billingCycle,
          payment_method: selectedPayment
        })
      });
      
      if (!response.ok) {
        throw new Error('Payment creation failed');
      }
      
      const data = await response.json();
      
      // Redirect to payment URL
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
      
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tạo thanh toán');
      console.error(err);
      setProcessing(false);
    }
  };
  
  const getPrice = (plan: Plan) => {
    return billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Chọn gói phù hợp với bạn</h1>
        <p className="text-lg text-gray-600 mb-8">
          Nâng cấp trải nghiệm của bạn với các tính năng cao cấp
        </p>
        
        {/* Billing cycle toggle */}
        <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')} className="mb-8">
          <TabsList>
            <TabsTrigger value="monthly">Thanh toán hàng tháng</TabsTrigger>
            <TabsTrigger value="yearly">
              Thanh toán hàng năm
              <Badge variant="secondary" className="ml-2">Tiết kiệm 17%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isPopular = plan.name === 'Premium';
          const isVIP = plan.name === 'VIP';
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''} ${isVIP ? 'border-purple-500' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">Phổ biến nhất</Badge>
                </div>
              )}
              {isVIP && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                    ⭐ VIP
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <div className="text-4xl font-bold mb-2">
                    {formatPrice(getPrice(plan))}
                  </div>
                  <div className="text-gray-600">
                    / {billingCycle === 'monthly' ? 'tháng' : 'năm'}
                  </div>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    {plan.chat_limit === -1 ? <Check className="text-green-500" /> : <X className="text-gray-400" />}
                    <span className={plan.chat_limit === -1 ? 'font-medium' : ''}>
                      {plan.chat_limit === -1 ? '💬 Chat AI không giới hạn' : `💬 ${plan.chat_limit} tin nhắn/ngày`}
                    </span>
                  </li>
                  
                  <li className="flex items-center gap-2">
                    {plan.video_enabled ? <Check className="text-green-500" /> : <X className="text-gray-400" />}
                    <span className={plan.video_enabled ? 'font-medium' : ''}>
                      🎥 Video call với bác sĩ
                    </span>
                  </li>
                  
                  <li className="flex items-center gap-2">
                    {plan.doctor_access ? <Check className="text-green-500" /> : <X className="text-gray-400" />}
                    <span className={plan.doctor_access ? 'font-medium' : ''}>
                      👨‍⚕️ Đặt lịch tư vấn bác sĩ
                    </span>
                  </li>
                  
                  {isVIP && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="text-green-500" />
                        <span className="font-medium">
                          🎁 2 buổi tư vấn MIỄN PHÍ/tháng
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="text-green-500" />
                        <span className="font-medium">
                          💎 Giảm 20% các buổi tư vấn thêm
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="text-green-500" />
                        <span className="font-medium">
                          👨‍👩‍👧 Tài khoản gia đình (+2 thành viên)
                        </span>
                      </li>
                    </>
                  )}
                  
                  <li className="flex items-center gap-2">
                    {plan.empathy_layer_enabled ? <Check className="text-green-500" /> : <X className="text-gray-400" />}
                    <span className={plan.empathy_layer_enabled ? 'font-medium' : ''}>
                      🧠 AI cảm xúc nâng cao
                    </span>
                  </li>
                  
                  <li className="flex items-center gap-2">
                    {plan.voice_enabled ? <Check className="text-green-500" /> : <X className="text-gray-400" />}
                    <span className={plan.voice_enabled ? 'font-medium' : ''}>
                      🎤 Chat bằng giọng nói
                    </span>
                  </li>
                  
                  <li className="flex items-center gap-2">
                    {plan.priority_support ? <Check className="text-green-500" /> : <X className="text-gray-400" />}
                    <span className={plan.priority_support ? 'font-medium' : ''}>
                      ⚡ Hỗ trợ ưu tiên 24/7
                    </span>
                  </li>
                  
                  <li className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="text-green-500" />
                    <span>🆘 Emergency Hotline</span>
                  </li>
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  className={`w-full ${isPopular ? 'bg-primary' : ''} ${isVIP ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''}`}
                  variant={isPopular || isVIP ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={user?.subscription_plan === plan.name}
                >
                  {user?.subscription_plan === plan.name ? '✓ Gói hiện tại' : plan.name === 'Free' ? 'Sử dụng miễn phí' : 'Nâng cấp ngay'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {/* Payment Method Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Chọn phương thức thanh toán</CardTitle>
              <CardDescription>
                Gói: {selectedPlan.name} - {formatPrice(getPrice(selectedPlan))}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedPayment === method.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <div className="flex items-center gap-4">
                    <img src={method.logo} alt={method.name} className="w-12 h-12 object-contain" />
                    <div>
                      <div className="font-semibold">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)} disabled={processing}>
                Hủy
              </Button>
              <Button onClick={handlePurchase} disabled={processing} className="flex-1">
                {processing ? 'Processing...' : 'Pay'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
