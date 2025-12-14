import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { UserCheck, Search, Star, FileText, CheckCircle, XCircle, Clock, Mail, Phone } from 'lucide-react';

const DoctorManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const doctors = [
    {
      id: 1,
      name: 'BS. Nguyễn Văn A',
      email: 'bsnguyenvana@email.com',
      phone: '0901234567',
      specialty: 'Tâm lý lâm sàng',
      license: 'BS12345',
      experience: '10 năm',
      patients: 48,
      rating: 4.8,
      status: 'approved',
      joinedDate: '10/01/2024'
    },
    {
      id: 2,
      name: 'BS. Trần Thị B',
      email: 'bstranthib@email.com',
      phone: '0912345678',
      specialty: 'Tâm lý trị liệu',
      license: 'BS67890',
      experience: '8 năm',
      patients: 35,
      rating: 4.9,
      status: 'pending',
      joinedDate: '15/02/2024'
    },
    {
      id: 3,
      name: 'BS. Lê Văn C',
      email: 'bslevanc@email.com',
      phone: '0923456789',
      specialty: 'Tâm thần học',
      license: 'BS24680',
      experience: '15 năm',
      patients: 62,
      rating: 4.7,
      status: 'approved',
      joinedDate: '05/01/2024'
    },
    {
      id: 4,
      name: 'BS. Phạm Thị D',
      email: 'bsphamthid@email.com',
      phone: '0934567890',
      specialty: 'Tâm lý học phát triển',
      license: 'BS13579',
      experience: '6 năm',
      patients: 28,
      rating: 4.6,
      status: 'rejected',
      joinedDate: '20/02/2024'
    }
  ];

  const stats = [
    { label: 'Tổng bác sĩ', value: '56', change: '+3 mới', color: 'text-blue-600' },
    { label: 'Đã phê duyệt', value: '48', change: '85.7%', color: 'text-green-600' },
    { label: 'Chờ duyệt', value: '5', change: 'Cần xử lý', color: 'text-yellow-600' },
    { label: 'Từ chối', value: '3', change: '5.4%', color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCheck className="w-8 h-8" />
            Quản lý bác sĩ
          </h1>
          <p className="text-muted-foreground mt-2">
            Phê duyệt và quản lý bác sĩ trong hệ thống
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.color}`}>{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Doctors List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bác sĩ</CardTitle>
          <CardDescription>Quản lý và phê duyệt hồ sơ bác sĩ</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bác sĩ theo tên, chuyên khoa, giấy phép..."
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
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Chuyên khoa</TableHead>
                  <TableHead>Giấy phép</TableHead>
                  <TableHead>Kinh nghiệm</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Tham gia: {doctor.joinedDate}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3" />
                          {doctor.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {doctor.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.specialty}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{doctor.license}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{doctor.experience}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{doctor.patients}</span>
                        <span className="text-xs text-muted-foreground">bệnh nhân</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{doctor.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          doctor.status === 'approved' ? 'default' :
                          doctor.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {doctor.status === 'approved' && (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Đã duyệt
                          </>
                        )}
                        {doctor.status === 'pending' && (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Chờ duyệt
                          </>
                        )}
                        {doctor.status === 'rejected' && (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Từ chối
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {doctor.status === 'pending' && (
                          <>
                            <Button size="sm" variant="default" className="h-8">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Duyệt
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8">
                              <XCircle className="w-3 h-3 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        {doctor.status !== 'pending' && (
                          <Button size="sm" variant="outline" className="h-8">
                            Xem chi tiết
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị <strong>1-4</strong> trong <strong>56</strong> bác sĩ
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button variant="outline" size="sm">
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorManagement;
