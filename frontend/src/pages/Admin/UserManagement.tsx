import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Users, Search, Filter, Crown, MoreVertical, Mail, Phone, Edit, Trash2, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  subscription_plan: string;
  subscription_status: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Dialog State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    role: '',
    subscription_plan: '',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (roleFilter !== 'all') queryParams.append('role', roleFilter);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);

      const queryString = queryParams.toString();
      const url = queryString ? `${API_ENDPOINTS.ADMIN.USERS}?${queryString}` : API_ENDPOINTS.ADMIN.USERS;

      const response = await apiClient.get<{ users: User[] }>(url);
      setUsers(response.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name,
      role: user.role,
      subscription_plan: user.subscription_plan,
      is_active: user.is_active
    });
    setIsEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await apiClient.put(API_ENDPOINTS.ADMIN.USER(editingUser.id), editForm);
      toast.success('Cập nhật người dùng thành công');
      setIsEditOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Cập nhật thất bại');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) return;

    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.USER(userId));
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Xóa thất bại');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.subscription_plan === planFilter;

    return matchesSearch && matchesPlan;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-600">Admin</Badge>;
      case 'doctor': return <Badge className="bg-blue-600">Bác sĩ</Badge>;
      default: return <Badge variant="secondary">Người dùng</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Quản lý người dùng
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý tài khoản người dùng và bác sĩ trong hệ thống
          </p>
        </div>
        <Button className="gap-2" onClick={() => toast.info('Chức năng thêm người dùng đang phát triển')}>
          <Users className="w-4 h-4" />
          Thêm người dùng mới
        </Button>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>Tìm kiếm và lọc người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
                <SelectItem value="doctor">Bác sĩ</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Plan Filter */}
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[180px]">
                <Crown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Gói dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả gói</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="family">Family</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Gói dịch vụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hoạt động gần nhất</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Đang tải...</TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Không tìm thấy người dùng</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            <span className="text-sm font-medium">
                              {user.full_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.subscription_plan !== 'free' && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                          <Badge variant="outline" className="capitalize">
                            {user.subscription_plan}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.is_active ? 'default' : 'secondary'}
                        >
                          {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho {editingUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Họ tên</Label>
              <Input
                id="name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Vai trò</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Người dùng</SelectItem>
                  <SelectItem value="doctor">Bác sĩ</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan" className="text-right">Gói dịch vụ</Label>
              <Select
                value={editForm.subscription_plan}
                onValueChange={(value) => setEditForm({ ...editForm, subscription_plan: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn gói" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Trạng thái</Label>
              <div className="flex items-center gap-2 col-span-3">
                <Button
                  type="button"
                  variant={editForm.is_active ? "default" : "outline"}
                  onClick={() => setEditForm({ ...editForm, is_active: true })}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" /> Hoạt động
                </Button>
                <Button
                  type="button"
                  variant={!editForm.is_active ? "destructive" : "outline"}
                  onClick={() => setEditForm({ ...editForm, is_active: false })}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" /> Khóa
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdateUser}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
