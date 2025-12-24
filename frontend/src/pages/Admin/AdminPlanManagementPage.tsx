// ===========================================
// ADMIN PLAN MANAGEMENT PAGE
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// TODO: Import useAuth from your auth context
const useAuth = () => ({ token: localStorage.getItem('token') });

interface Plan {
  id: number;
  name: string;
  description: string;
  user_type: string;
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
  subscriber_count?: number;
  total_revenue?: number;
}

interface PlanStats {
  total_plans: number;
  subscribers: {
    active: number;
    expired: number;
    cancelled: number;
    total: number;
  };
  revenue: {
    total: number;
    by_plan: Record<string, number>;
  };
  subscribers_by_plan: Record<string, number>;
  recent_subscriptions: number;
}

export default function AdminPlanManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  
  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/plans?include_inactive=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPlans(data.plans);
    } catch (err) {
      toast.error('Không thể tải danh sách gói');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/plans/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, [token]);
  
  useEffect(() => {
    fetchPlans();
    fetchStatistics();
  }, [fetchPlans, fetchStatistics]);
  
  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Bạn có chắc muốn xóa gói này?')) return;
    
    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Đã xóa gói thành công');
        fetchPlans();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Không thể xóa gói');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
      console.error(err);
    }
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý gói dịch vụ</h1>
        <Button onClick={() => toast.info('Feature under development')}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo gói mới
        </Button>
      </div>
      
      {/* Statistics */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tổng người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.subscribers.total}</div>
              <p className="text-sm text-gray-600">
                {stats.subscribers.active} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Doanh thu tổng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPrice(stats.revenue.total)}</div>
              <p className="text-sm text-gray-600">Tất cả thời gian</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Đăng ký mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.recent_subscriptions}</div>
              <p className="text-sm text-gray-600">30 ngày qua</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tổng gói</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_plans}</div>
              <p className="text-sm text-gray-600">Active</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Plans List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Danh sách gói</h2>
        
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <Badge variant={plan.user_type === 'doctor' ? 'default' : 'secondary'}>
                      {plan.user_type === 'doctor' ? 'Bác sĩ' : 'Người dùng'}
                    </Badge>
                    <Badge variant={plan.is_active ? 'default' : 'destructive'}>
                      {plan.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Giá tháng</div>
                      <div className="text-lg font-semibold">{formatPrice(plan.price_monthly)}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Giá năm</div>
                      <div className="text-lg font-semibold">{formatPrice(plan.price_yearly)}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Số người đăng ký</div>
                      <div className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {plan.subscriber_count || 0}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
