import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Users, MessageSquare, Calendar, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  id: number;
  name: string;
  age: number;
  condition: string;
  lastSession: string;
  appointmentCount?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  avatarUrl?: string | null;
}

const PatientList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'needs-attention'>('all');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ patients: Record<string, unknown>[] }>(API_ENDPOINTS.DOCTOR.PATIENTS);

      const mappedPatients: Patient[] = response.patients.map((p: Record<string, unknown>) => ({
        id: Number(p.id),
        name: String(p.full_name),
        age: p.date_of_birth ? new Date().getFullYear() - new Date(String(p.date_of_birth)).getFullYear() : 0,
        condition: (p.record && typeof p.record === 'object' && 'diagnosis' in p.record ? String(p.record.diagnosis) : null) || 'Not diagnosed',
        lastSession: p.last_activity ? String(p.last_activity) : new Date().toISOString(),
        appointmentCount: p.appointment_count ? Number(p.appointment_count) : 0,
        riskLevel: p.risk_level ? String(p.risk_level) as 'low' | 'medium' | 'high' : 'low',
        avatarUrl: p.avatar_url ? String(p.avatar_url) : null
      }));

      setPatients(mappedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Không thể tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />Cao</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-600 gap-1"><AlertCircle className="w-3 h-3" />Trung bình</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1">Thấp</Badge>;
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = patient.name.toLowerCase().includes(searchLower) ||
      patient.condition.toLowerCase().includes(searchLower);

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && patient.appointmentCount && patient.appointmentCount > 0;
    if (filterStatus === 'needs-attention') return matchesSearch && patient.riskLevel === 'high';
    return matchesSearch;
  });

  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.appointmentCount && p.appointmentCount > 0).length;
  const highRiskPatients = patients.filter(p => p.riskLevel === 'high').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải danh sách bệnh nhân...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-foreground">Danh sách bệnh nhân</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và theo dõi tiến trình điều trị của bệnh nhân
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Tổng bệnh nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Đang theo dõi</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              Đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activePatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Có lịch hẹn</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Cần chú ý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{highRiskPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Rủi ro cao</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Bệnh nhân của tôi</CardTitle>
              <CardDescription className="mt-1">
                {filteredPatients.length} bệnh nhân được hiển thị
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, chẩn đoán..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              Tất cả
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
              className="gap-1"
            >
              <Activity className="w-3 h-3" />
              Hoạt động
            </Button>
            <Button
              variant={filterStatus === 'needs-attention' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('needs-attention')}
              className="gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              Cần chú ý
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPatients.length > 0 ? (
            <div className="grid gap-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow border-l-4" style={{
                  borderLeftColor: patient.riskLevel === 'high' ? '#ef4444' : patient.riskLevel === 'medium' ? '#eab308' : '#22c55e'
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {patient.avatarUrl ? (
                          <img
                            src={patient.avatarUrl}
                            alt={patient.name}
                            className="w-14 h-14 rounded-full object-cover shadow-lg"
                            onError={(e) => {
                              // Fallback to gradient if image fails to load
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                          style={{ display: patient.avatarUrl ? 'none' : 'flex' }}
                        >
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{patient.name}</h3>
                            {getRiskBadge(patient.riskLevel || 'low')}
                            <Badge variant="outline">{patient.age} tuổi</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              <span>Diagnosis: <span className="text-foreground font-medium">{patient.condition}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Hoạt động gần nhất: {new Date(patient.lastSession).toLocaleDateString('vi-VN')}</span>
                            </div>
                            {patient.appointmentCount !== undefined && (
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                <span>Số lịch hẹn: <span className="text-foreground font-medium">{patient.appointmentCount}</span></span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => navigate(`/doctor/patients/${patient.id}`)}>
                          Xem hồ sơ
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/doctor/chat/${patient.id}`)}>
                          <MessageSquare className="w-3 h-3" />
                          Nhắn tin
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-lg font-medium text-muted-foreground mb-2">Không tìm thấy bệnh nhân</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Bệnh nhân sẽ xuất hiện sau khi đặt lịch hẹn với bạn'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;
