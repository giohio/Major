import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Crown, CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react';

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  activeUsers: number;
  revenue: number;
  color: string;
}

interface Subscription {
  id: number;
  userName: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}

const SubscriptionManagement = () => {
  const plans: SubscriptionPlan[] = [
    {
      id: 1,
      name: 'Free',
      price: 0,
      duration: 'monthly',
      features: ['Chat AI cơ bản', 'Bài tập tâm lý', 'Ghi nhật ký'],
      activeUsers: 892,
      revenue: 0,
      color: 'bg-gray-600'
    },
    {
      id: 2,
      name: 'Premium',
      price: 299000,
      duration: 'monthly',
      features: ['Tất cả tính năng Free', 'Tư vấn bác sĩ (5 buổi/tháng)', 'Phân tích AI nâng cao', 'Ưu tiên hỗ trợ'],
      activeUsers: 342,
      revenue: 102258000,
      color: 'bg-yellow-600'
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 999000,
      duration: 'monthly',
      features: ['Tất cả tính năng Premium', 'Tư vấn không giới hạn', 'Kế hoạch điều trị cá nhân', 'Hỗ trợ 24/7', 'API tích hợp'],
      activeUsers: 45,
      revenue: 44955000,
      color: 'bg-purple-600'
    }
  ];

  const recentSubscriptions: Subscription[] = [
    {
      id: 1,
      userName: 'Nguyễn Văn A',
      plan: 'Premium',
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      status: 'active',
      autoRenew: true
    },
    {
      id: 2,
      userName: 'Trần Thị B',
      plan: 'Enterprise',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'active',
      autoRenew: true
    },
    {
      id: 3,
      userName: 'Lê Văn C',
      plan: 'Premium',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      status: 'active',
      autoRenew: false
    },
    {
      id: 4,
      userName: 'Phạm Thị D',
      plan: 'Premium',
      startDate: '2023-12-20',
      endDate: '2024-01-20',
      status: 'expired',
      autoRenew: false
    }
  ];

  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);
  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.activeUsers, 0);
  const paidSubscribers = plans.filter(p => p.price > 0).reduce((sum, plan) => sum + plan.activeUsers, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Hoạt động</Badge>;
      case 'expired':
        return <Badge variant="secondary">Hết hạn</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản Lý Gói Đăng Ký</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý các gói dịch vụ và doanh thu
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Doanh Thu Tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +15% so tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Tổng Người Đăng Ký
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground mt-1">Tất cả gói</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-600" />
              Gói Trả Phí
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidSubscribers}</div>
            <p className="text-xs text-muted-foreground mt-1">Premium + Enterprise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-600" />
              Tỷ Lệ Chuyển Đổi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((paidSubscribers / totalSubscribers) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-green-600 mt-1">+3% so tháng trước</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${plan.color}`} />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {plan.price > 0 && <Crown className={`w-5 h-5 ${plan.color.replace('bg-', 'text-')}`} />}
                  {plan.name}
                </CardTitle>
                <Badge variant="outline">{plan.duration === 'monthly' ? 'Tháng' : 'Năm'}</Badge>
              </div>
              <CardDescription className="text-2xl font-bold mt-2">
                {formatPrice(plan.price)}
                {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/tháng</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Tính năng:</div>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Người dùng:</span>
                  <span className="font-medium">{plan.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Doanh thu:</span>
                  <span className="font-medium">{formatPrice(plan.revenue)}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Chỉnh sửa gói
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Subscriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Đăng Ký Gần Đây</CardTitle>
              <CardDescription>Các giao dịch đăng ký mới nhất</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSubscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{sub.userName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Crown className="w-3 h-3" />
                        {sub.plan}
                      </Badge>
                      {sub.autoRenew && <span className="text-xs">• Tự động gia hạn</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(sub.startDate).toLocaleDateString('vi-VN')} - {new Date(sub.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  {getStatusBadge(sub.status)}
                  <Button variant="ghost" size="sm">
                    Chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
