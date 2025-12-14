import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Search, Filter, Shield, User, Database, Key, AlertCircle } from 'lucide-react';

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  userRole: 'admin' | 'doctor' | 'user';
  action: string;
  category: 'auth' | 'user' | 'data' | 'system' | 'security';
  severity: 'info' | 'warning' | 'critical';
  details: string;
  ipAddress: string;
}

const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const logs: AuditLog[] = [
    {
      id: 1,
      timestamp: '2024-01-20 14:35:22',
      user: 'admin@system.com',
      userRole: 'admin',
      action: 'Phê duyệt bác sĩ',
      category: 'user',
      severity: 'info',
      details: 'Phê duyệt hồ sơ bác sĩ Dr. Trần Thị B',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2024-01-20 14:30:15',
      user: 'system',
      userRole: 'admin',
      action: 'Cảnh báo bảo mật',
      category: 'security',
      severity: 'critical',
      details: 'Phát hiện nhiều lần đăng nhập thất bại từ IP 45.123.45.67',
      ipAddress: '45.123.45.67'
    },
    {
      id: 3,
      timestamp: '2024-01-20 14:20:08',
      user: 'nguyenvana@email.com',
      userRole: 'user',
      action: 'Đăng nhập',
      category: 'auth',
      severity: 'info',
      details: 'Đăng nhập thành công',
      ipAddress: '192.168.1.105'
    },
    {
      id: 4,
      timestamp: '2024-01-20 14:15:42',
      user: 'admin@system.com',
      userRole: 'admin',
      action: 'Cập nhật cấu hình',
      category: 'system',
      severity: 'warning',
      details: 'Thay đổi cấu hình AI model timeout từ 30s -> 60s',
      ipAddress: '192.168.1.100'
    },
    {
      id: 5,
      timestamp: '2024-01-20 14:10:33',
      user: 'drtranthib@email.com',
      userRole: 'doctor',
      action: 'Truy cập dữ liệu',
      category: 'data',
      severity: 'info',
      details: 'Xem hồ sơ bệnh nhân #123',
      ipAddress: '192.168.1.110'
    },
    {
      id: 6,
      timestamp: '2024-01-20 14:05:18',
      user: 'system',
      userRole: 'admin',
      action: 'Backup dữ liệu',
      category: 'data',
      severity: 'info',
      details: 'Backup database thành công (2.3GB)',
      ipAddress: 'localhost'
    },
    {
      id: 7,
      timestamp: '2024-01-20 13:58:45',
      user: 'admin@system.com',
      userRole: 'admin',
      action: 'Xóa người dùng',
      category: 'user',
      severity: 'warning',
      details: 'Xóa tài khoản vi phạm chính sách: spam@email.com',
      ipAddress: '192.168.1.100'
    },
    {
      id: 8,
      timestamp: '2024-01-20 13:50:12',
      user: 'system',
      userRole: 'admin',
      action: 'Cảnh báo hệ thống',
      category: 'system',
      severity: 'critical',
      details: 'CPU usage vượt 90% trong 5 phút',
      ipAddress: 'localhost'
    }
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Nghiêm trọng</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-600">Cảnh báo</Badge>;
      case 'info':
        return <Badge variant="secondary">Thông tin</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <Key className="w-4 h-4 text-blue-600" />;
      case 'user':
        return <User className="w-4 h-4 text-green-600" />;
      case 'data':
        return <Database className="w-4 h-4 text-purple-600" />;
      case 'system':
        return <Shield className="w-4 h-4 text-orange-600" />;
      case 'security':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'auth':
        return 'Xác thực';
      case 'user':
        return 'Người dùng';
      case 'data':
        return 'Dữ liệu';
      case 'system':
        return 'Hệ thống';
      case 'security':
        return 'Bảo mật';
      default:
        return category;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'doctor':
        return <Badge className="bg-blue-600">Bác sĩ</Badge>;
      case 'user':
        return <Badge variant="outline">Người dùng</Badge>;
      default:
        return null;
    }
  };

  const stats = [
    {
      label: 'Tổng Logs Hôm Nay',
      value: logs.length,
      icon: Database,
      color: 'text-blue-600'
    },
    {
      label: 'Cảnh Báo Nghiêm Trọng',
      value: logs.filter(l => l.severity === 'critical').length,
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      label: 'Cảnh Báo',
      value: logs.filter(l => l.severity === 'warning').length,
      icon: Shield,
      color: 'text-yellow-600'
    },
    {
      label: 'Hành Động Admin',
      value: logs.filter(l => l.userRole === 'admin').length,
      icon: User,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Nhật ký hoạt động và bảo mật hệ thống
          </p>
        </div>
        <Button className="gap-2">
          <Database className="w-4 h-4" />
          Xuất logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật Ký Hệ Thống</CardTitle>
          <CardDescription>Theo dõi tất cả hoạt động trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo người dùng, hành động..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="auth">Xác thực</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
                <SelectItem value="data">Dữ liệu</SelectItem>
                <SelectItem value="system">Hệ thống</SelectItem>
                <SelectItem value="security">Bảo mật</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="critical">Nghiêm trọng</SelectItem>
                <SelectItem value="warning">Cảnh báo</SelectItem>
                <SelectItem value="info">Thông tin</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {log.timestamp}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{log.user}</span>
                          {getRoleBadge(log.userRole)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getCategoryIcon(log.category)}
                          {getCategoryName(log.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Không tìm thấy logs phù hợp
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

export default AuditLogs;
