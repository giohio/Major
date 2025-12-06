import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { AlertCircle, AlertTriangle, TrendingDown, Clock, CheckCircle } from 'lucide-react';

interface DoctorAlert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  patientName: string;
  patientId: number;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'high' | 'medium';
}

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';

// ... imports

const Alerts = () => {
  const [alerts, setAlerts] = useState<DoctorAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const mapAlertType = (type: string): 'critical' | 'warning' | 'info' => {
    switch (type) {
      case 'risk_assessment':
      case 'suicide_risk':
      case 'self_harm':
        return 'critical';
      case 'anxiety_spike':
      case 'depression_spike':
      case 'missed_session':
        return 'warning';
      default:
        return 'info';
    }
  };

  const mapSeverity = (severity: string): 'high' | 'medium' => {
    return severity === 'high' || severity === 'critical' ? 'high' : 'medium';
  };

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await apiClient.get<{ alerts: Record<string, unknown>[] }>(API_ENDPOINTS.DOCTOR.ALERTS);

      const mappedAlerts: DoctorAlert[] = response.alerts.map((alert: Record<string, unknown>) => ({
        id: Number(alert.id),
        type: mapAlertType(String(alert.alert_type)),
        patientName: alert.patient_name ? String(alert.patient_name) : 'Unknown Patient',
        patientId: Number(alert.user_id),
        message: String(alert.message),
        timestamp: String(alert.created_at),
        read: Boolean(alert.is_resolved),
        severity: mapSeverity(String(alert.severity))
      }));

      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      toast.error('Không thể tải cảnh báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.read).length;
  const warningCount = alerts.filter(a => a.type === 'warning' && !a.read).length;
  const unreadCount = alerts.filter(a => !a.read).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <TrendingDown className="w-5 h-5" />;
    }
  };

  const getAlertVariant = (type: string): 'default' | 'destructive' => {
    return type === 'critical' ? 'destructive' : 'default';
  };

  const getSeverityBadge = (severity: string) => {
    return severity === 'high'
      ? <Badge variant="destructive">Cao</Badge>
      : <Badge className="bg-yellow-600">Trung bình</Badge>;
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cảnh Báo Bệnh Nhân</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi các vấn đề cần chú ý từ bệnh nhân
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {unreadCount} mới
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Nghiêm Trọng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Cần xử lý ngay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Cảnh Báo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Cần theo dõi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Đã Xử Lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.read).length}</div>
            <p className="text-xs text-green-600 mt-1">Đã đọc</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Đang tải cảnh báo...</div>
        ) : (
          alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={getAlertVariant(alert.type)}
              className={`relative ${!alert.read ? 'border-l-4' : 'opacity-60'}`}
            >
              <div className="flex items-start gap-4">
                {getAlertIcon(alert.type)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{alert.patientName}</span>
                        {getSeverityBadge(alert.severity)}
                        {!alert.read && (
                          <Badge variant="secondary" className="text-xs">Mới</Badge>
                        )}
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        {alert.message}
                      </AlertDescription>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm">
                      Xem hồ sơ
                    </Button>
                    <Button variant="outline" size="sm">
                      Liên hệ
                    </Button>
                    {!alert.read && (
                      <Button variant="ghost" size="sm">
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Alert>
          ))
        )}
      </div>

      {!loading && alerts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Không có cảnh báo nào. Tất cả bệnh nhân đều ổn định!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Alerts;
