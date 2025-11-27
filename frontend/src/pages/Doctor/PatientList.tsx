import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Search, Filter, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  condition: string;
  severity: 'high' | 'medium' | 'low';
  lastSession: string;
  progress: 'improving' | 'stable' | 'declining';
  nextAppointment?: string;
}

const PatientList = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ patients: any[] }>(API_ENDPOINTS.DOCTOR.PATIENTS);

        const mappedPatients: Patient[] = response.patients.map((p: any) => ({
          id: p.id,
          name: p.full_name,
          age: p.date_of_birth ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear() : 0,
          gender: 'N/A',
          condition: p.record?.diagnosis || 'Chưa có chẩn đoán',
          severity: 'medium',
          lastSession: p.last_activity || new Date().toISOString(),
          progress: 'stable',
          nextAppointment: undefined
        }));

        setPatients(mappedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.condition.toLowerCase().includes(searchLower)
    );
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">Cao</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">Trung bình</Badge>;
      case 'low':
        return <Badge variant="secondary">Thấp</Badge>;
      default:
        return null;
    }
  };

  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getProgressText = (progress: string) => {
    switch (progress) {
      case 'improving':
        return 'Cải thiện';
      case 'declining':
        return 'Xấu đi';
      case 'stable':
        return 'Ổn định';
      default:
        return '';
    }
  };

  const totalPatients = patients.length;
  const highSeverity = patients.filter(p => p.severity === 'high').length;
  const improving = patients.filter(p => p.progress === 'improving').length;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Đang tải danh sách bệnh nhân...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Danh Sách Bệnh Nhân</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và theo dõi tiến trình điều trị
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Tổng Bệnh Nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Đang điều trị</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Đang Cải Thiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{improving}</div>
            <p className="text-xs text-green-600 mt-1">Tiến triển tốt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              Mức Độ Cao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highSeverity}</div>
            <p className="text-xs text-red-600 mt-1">Cần chú ý</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Bệnh Nhân Của Tôi</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 md:flex-initial md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, tình trạng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Tình trạng</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>Tiến triển</TableHead>
                  <TableHead>Buổi cuối</TableHead>
                  <TableHead>Lịch hẹn</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {patient.age} tuổi • {patient.gender}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.condition}</Badge>
                      </TableCell>
                      <TableCell>{getSeverityBadge(patient.severity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getProgressIcon(patient.progress)}
                          <span className="text-sm">{getProgressText(patient.progress)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(patient.lastSession).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {patient.nextAppointment ? (
                          <span className="text-blue-600">
                            {new Date(patient.nextAppointment).toLocaleDateString('vi-VN')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Chưa đặt</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Không tìm thấy bệnh nhân phù hợp
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

export default PatientList;
