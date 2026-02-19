import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  X, 
  Sparkles, 
  Users, 
  Zap, 
  Shield, 
  MessageSquare, 
  Video,
  Heart,
  Clock,
  Phone
} from 'lucide-react';
import { apiClient } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Plan {
  id: number;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  chat_limit: number;
  voice_enabled: boolean;
  video_enabled: boolean;
  empathy_layer_enabled: boolean;
  doctor_access: boolean;
  priority_support: boolean;
}

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [subscribing, setSubscribing] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await apiClient.get<{ plans: Plan[] }>('/plans?user_type=user');
      console.log('Plans API response:', response);
      
      if (response.plans && response.plans.length > 0) {
        console.log('Plans loaded from API:', response.plans.map(p => ({ id: p.id, name: p.name })));
        setPlans(response.plans);
      } else {
        // Fallback to default plans if API returns empty
        console.warn('No plans from API, using fallback');
        const fallbackPlans = getDefaultPlans();
        console.log('Using fallback plans:', fallbackPlans.map(p => ({ id: p.id, name: p.name })));
        setPlans(fallbackPlans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Không thể tải danh sách gói dịch vụ từ server');
      // Use fallback plans on error
      const fallbackPlans = getDefaultPlans();
      console.log('Error - using fallback plans:', fallbackPlans.map(p => ({ id: p.id, name: p.name })));
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPlans = (): Plan[] => {
    return [
      {
        id: 9,
        name: 'Free',
        description: 'Gói miễn phí - Trải nghiệm AI chatbot cơ bản',
        price_monthly: 0,
        price_yearly: 0,
        chat_limit: 10,
        voice_enabled: false,
        video_enabled: false,
        empathy_layer_enabled: false,
        doctor_access: false,
        priority_support: false,
      },
      {
        id: 10,
        name: 'Premium',
        description: 'Gói cao cấp - Truy cập đầy đủ tính năng AI và bác sĩ',
        price_monthly: 149000,
        price_yearly: 1490000,
        chat_limit: -1,
        voice_enabled: true,
        video_enabled: true,
        empathy_layer_enabled: true,
        doctor_access: true,
        priority_support: true,
      },
      {
        id: 11,
        name: 'VIP',
        description: 'Gói VIP - Tư vấn không giới hạn với ưu đãi đặc biệt',
        price_monthly: 499000,
        price_yearly: 4990000,
        chat_limit: -1,
        voice_enabled: true,
        video_enabled: true,
        empathy_layer_enabled: true,
        doctor_access: true,
        priority_support: true,
      },
    ];
  };

  const handleSubscribe = async (plan: Plan) => {
    console.log('handleSubscribe called with plan:', plan);
    
    if (!user) {
      console.log('User not logged in, redirecting to login');
      toast.info('Vui lòng đăng nhập để đăng ký gói dịch vụ');
      navigate('/login');
      return;
    }

    // Check if free plan
    if (plan.price_monthly === 0) {
      console.log('Free plan selected, no payment needed');
      toast.info('Gói miễn phí không cần thanh toán');
      return;
    }

    try {
      setSubscribing(plan.id);
      
      const requestData = {
        plan_id: plan.id,
        billing_cycle: billingCycle,
        payment_method: 'vnpay'
      };
      console.log('Subscribing with data:', requestData);
      
      const response = await apiClient.post<{
        payment: { id: number };
        payment_url: string;
      }>('/plans/subscribe', requestData);

      console.log('Subscribe API response:', response);
      
      toast.success('Đang chuyển đến trang thanh toán...');
      
      // Redirect to payment page
      // If payment_url is relative, navigate within app
      // If it's full URL (VNPay), redirect externally
      if (response.payment_url.startsWith('http')) {
        console.log('Redirecting to external payment URL:', response.payment_url);
        window.location.href = response.payment_url;
      } else {
        console.log('Navigating to internal payment URL:', response.payment_url);
        navigate(response.payment_url);
      }
    } catch (error) {
      console.error('Subscribe error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo thanh toán';
      toast.error('Lỗi: ' + errorMessage);
    } finally {
      setSubscribing(null);
    }
  };

  const getPrice = (plan: Plan) => {
    return billingCycle === 'monthly' 
      ? parseFloat(plan.price_monthly.toString())
      : parseFloat(plan.price_yearly.toString());
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('free') || name.includes('dùng thử')) return Sparkles;
    if (name.includes('premium') || name.includes('cá nhân')) return Zap;
    if (name.includes('vip') || name.includes('gia đình')) return Users;
    return Heart;
  };

  const getPlanFeatures = (plan: Plan) => {
    const features = [];
    
    if (plan.chat_limit === -1) {
      features.push({ text: 'Trò chuyện không giới hạn', icon: MessageSquare, included: true });
    } else if (plan.chat_limit > 0) {
      features.push({ text: `${plan.chat_limit} cuộc trò chuyện/ngày`, icon: MessageSquare, included: true });
    }
    
    features.push({ text: 'Tư vấn qua voice call', icon: Phone, included: plan.voice_enabled });
    features.push({ text: 'Tư vấn qua video call', icon: Video, included: plan.video_enabled });
    features.push({ text: 'Theo dõi cảm xúc chi tiết', icon: Heart, included: plan.empathy_layer_enabled });
    features.push({ text: 'Kết nối bác sĩ tâm lý', icon: Users, included: plan.doctor_access });
    features.push({ text: 'Hỗ trợ ưu tiên 24/7', icon: Clock, included: plan.priority_support });
    
    return features;
  };

  const isCurrentPlan = (plan: Plan) => {
    return user?.subscription_plan?.toLowerCase() === plan.name.toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering plans:', plans.length, 'plans');

  // Always show something even if no plans
  if (plans.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy gói dịch vụ</h2>
          <p className="text-muted-foreground mb-4">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
          <Button onClick={fetchPlans}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-7xl">{/* Header */}
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900 dark:text-teal-300">
            <Sparkles className="w-3 h-3 mr-1" />
            Gói dịch vụ
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Chọn gói phù hợp với bạn
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trải nghiệm chăm sóc sức khỏe tâm thần với công nghệ AI tiên tiến. Hủy bất cứ lúc nào.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')} className="w-auto">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="monthly" className="text-base">Theo tháng</TabsTrigger>
              <TabsTrigger value="yearly" className="text-base">
                Theo năm
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Tiết kiệm 17%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const features = getPlanFeatures(plan);
            const isPopular = plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('cá nhân');
            const isCurrent = isCurrentPlan(plan);
            const price = getPrice(plan);

            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  isPopular 
                    ? 'border-2 border-teal-500 shadow-xl scale-105' 
                    : 'hover:scale-105'
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Phổ biến nhất
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-br-lg">
                    Gói hiện tại
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-6">
                  <div className="mb-8">
                    {price === 0 ? (
                      <div className="text-4xl font-bold">Miễn phí</div>
                    ) : (
                      <>
                        <div className="text-5xl font-bold mb-2">
                          {price.toLocaleString('vi-VN')}₫
                        </div>
                        <div className="text-muted-foreground">
                          /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Chỉ {(price / 12).toLocaleString('vi-VN')}₫/tháng
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 text-left">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        <span className={feature.included ? 'text-foreground' : 'text-muted-foreground line-through'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full h-12 text-base font-semibold"
                    variant={isPopular ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleSubscribe(plan)}
                    disabled={subscribing === plan.id || isCurrent}
                  >
                    {subscribing === plan.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : isCurrent ? (
                      'Gói hiện tại'
                    ) : price === 0 ? (
                      'Dùng thử miễn phí'
                    ) : (
                      'Chọn gói này'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">So sánh tính năng</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Tính năng</th>
                    {plans.map(plan => (
                      <th key={plan.id} className="text-center p-4 font-semibold">{plan.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-4">Số lượng chat</td>
                    {plans.map(plan => (
                      <td key={plan.id} className="text-center p-4">
                        {plan.chat_limit === -1 ? 'Không giới hạn' : `${plan.chat_limit}/ngày`}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="p-4">Voice call</td>
                    {plans.map(plan => (
                      <td key={plan.id} className="text-center p-4">
                        {plan.voice_enabled ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4">Video call</td>
                    {plans.map(plan => (
                      <td key={plan.id} className="text-center p-4">
                        {plan.video_enabled ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="p-4">Theo dõi cảm xúc</td>
                    {plans.map(plan => (
                      <td key={plan.id} className="text-center p-4">
                        {plan.empathy_layer_enabled ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4">Kết nối bác sĩ</td>
                    {plans.map(plan => (
                      <td key={plan.id} className="text-center p-4">
                        {plan.doctor_access ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="p-4">Hỗ trợ ưu tiên</td>
                    {plans.map(plan => (
                      <td key={plan.id} className="text-center p-4">
                        {plan.priority_support ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Câu hỏi thường gặp</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  Thanh toán như thế nào?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept credit cards, domestic ATM cards, e-wallets (Momo, ZaloPay) and bank transfer via VNPay.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-teal-600" />
                  Có thể đổi gói không?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. The difference will be applied to the next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <X className="w-5 h-5 text-teal-600" />
                  Hủy dịch vụ có mất phí không?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Không, bạn có thể hủy bất cứ lúc nào mà không mất phí. Dịch vụ sẽ còn hiệu lực đến hết chu kỳ thanh toán.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  Is my information secure?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tuyệt đối. Chúng tôi sử dụng mã hóa AES-256 và tuân thủ GDPR, HIPAA. Không chia sẻ dữ liệu với bên thứ ba.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-teal-500 to-blue-500 text-white border-none">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Vẫn chưa chắc chắn?</h2>
            <p className="text-xl mb-6 opacity-90">
              Contact our support team for assistance in choosing the most suitable plan
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => navigate('/contact')}>
                <MessageSquare className="w-5 h-5 mr-2" />
                Liên hệ tư vấn
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-teal-600 hover:bg-gray-100" onClick={() => navigate('/chat')}>
                <Sparkles className="w-5 h-5 mr-2" />
                Dùng thử ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
