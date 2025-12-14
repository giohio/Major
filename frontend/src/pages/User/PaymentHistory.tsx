import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Search, Download, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';
import type { Payment } from '../../types/api.types';

const PaymentHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ payments: Payment[] }>(`${API_ENDPOINTS.PAYMENT.HISTORY}?per_page=50`);
      setPayments(response.payments || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchQuery.toLowerCase();
    return (
      payment.description?.toLowerCase().includes(searchLower) ||
      payment.payment_method.toLowerCase().includes(searchLower)
    );
  });

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const successPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Thành công</Badge>;
      case 'pending':
        return <Badge variant="secondary">Đang xử lý</Badge>;
      case 'failed':
        return <Badge variant="destructive">Thất bại</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lịch Sử Thanh Toán</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý các giao dịch và hóa đơn của bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Chi Tiêu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalSpent)}</div>
            <p className="text-xs text-muted-foreground mt-1">Từ {successPayments} giao dịch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Giao Dịch Thành Công
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successPayments}</div>
            <p className="text-xs text-green-600 mt-1">Đã hoàn tất</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang Xử Lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-yellow-600 mt-1">Chờ xác nhận</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Giao Dịch</CardTitle>
          <CardDescription>Chi tiết các khoản thanh toán của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mô tả, bác sĩ, phương thức..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {new Date(payment.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.description || `Thanh toán #${payment.id}`}</div>
                          <div className="text-xs text-muted-foreground">
                            {payment.billing_cycle === 'yearly' ? 'Gói năm' : 'Gói tháng'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          {payment.payment_method.toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          {getStatusBadge(payment.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'completed' && (
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Hóa đơn
                          </Button>
                        )}
                        {payment.status === 'pending' && (
                          <Button variant="ghost" size="sm">
                            Kiểm tra
                          </Button>
                        )}
                        {payment.status === 'failed' && (
                          <Button variant="ghost" size="sm">
                            Thử lại
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Không tìm thấy kết quả phù hợp
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
