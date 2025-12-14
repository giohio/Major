import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, CreditCard, Calendar as CalendarIcon, Heart, Clock } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

const Profile = () => {
  const { profile, subscription, stats, loading, loadProfile, loadSubscription, loadStats, updateProfile } = useUser();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    loadProfile();
    loadSubscription();
    loadStats();
  }, [loadProfile, loadSubscription, loadStats]);

  useEffect(() => {
    if (profile) {
      let formattedDob = '';
      if (profile.date_of_birth) {
        try {
          const date = new Date(profile.date_of_birth);
          if (!isNaN(date.getTime())) {
            formattedDob = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Invalid date format:', profile.date_of_birth);
        }
      }

      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        date_of_birth: formattedDob,
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Mật khẩu mới không khớp!');
      return;
    }
    // TODO: Implement change password API
    toast.success('Đổi mật khẩu thành công!');
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  }

  const user = {
    name: profile?.full_name || 'User',
    email: profile?.email || '',
    phone: profile?.phone || '',
    avatar: profile?.avatar_url || null,
    plan: subscription?.subscription_plan || 'Free',
    planExpiry: subscription?.subscription_end_date || '',
    joinedDate: profile?.created_at || new Date().toISOString(),
    sessionsCompleted: stats?.total_chat_sessions || 0,
    moodScore: 7.5
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Avatar */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-1 mt-1 text-xs font-medium text-primary">
                <CreditCard size={14} />
                {user.plan} Plan
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                <CalendarIcon size={20} className="text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">{user.sessionsCompleted}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-2">
                <Heart size={20} className="text-secondary" />
              </div>
              <div className="text-xl font-bold text-foreground">{user.moodScore}/10</div>
              <div className="text-xs text-muted-foreground">Mood Score</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-2">
                <Clock size={20} className="text-accent" />
              </div>
              <div className="text-xl font-bold text-foreground">{Math.floor((new Date().getTime() - new Date(user.joinedDate).getTime()) / (1000 * 60 * 60 * 24))}</div>
              <div className="text-xs text-muted-foreground">Days Active</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={18} />
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={18} />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard size={18} />
            Gói dịch vụ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Thông tin cá nhân</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Nhập họ tên đầy đủ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0901234567"
                  />
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="dob">Ngày sinh</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formData.date_of_birth && "text-muted-foreground"
                        )}
                      >
                        {formData.date_of_birth ? (
                          format(new Date(formData.date_of_birth), "dd/MM/yyyy")
                        ) : (
                          <span>Chọn ngày sinh</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date_of_birth ? new Date(formData.date_of_birth) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Adjust for timezone offset to prevent date shifting
                            const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                            setFormData({ ...formData, date_of_birth: offsetDate.toISOString().split('T')[0] });
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  if (profile) {
                    let formattedDob = '';
                    if (profile.date_of_birth) {
                      try {
                        const date = new Date(profile.date_of_birth);
                        if (!isNaN(date.getTime())) {
                          formattedDob = date.toISOString().split('T')[0];
                        }
                      } catch (e) {
                        console.error('Invalid date format:', profile.date_of_birth);
                      }
                    }
                    setFormData({
                      full_name: profile.full_name || '',
                      phone: profile.phone || '',
                      email: profile.email || '',
                      date_of_birth: formattedDob,
                      address: profile.address || ''
                    });
                  }
                }}>Hủy</Button>
                <Button type="submit" onClick={handleUpdateProfile}>Lưu thay đổi</Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Đổi mật khẩu</h2>
            <form className="space-y-4" onSubmit={handleChangePassword}>
              <div className="space-y-2">
                <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setPasswordData({ current_password: '', new_password: '', confirm_password: '' })}>Hủy</Button>
                <Button type="submit">Cập nhật mật khẩu</Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Xác thực hai yếu tố</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tăng cường bảo mật tài khoản bằng xác thực hai yếu tố
            </p>
            <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  📱
                </div>
                <div>
                  <h4 className="font-medium">Xác thực qua SMS</h4>
                  <p className="text-sm text-muted-foreground">Nhận mã xác thực qua tin nhắn</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Kích hoạt</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{user.plan} Plan</h3>
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-600 mt-2">
                  Active
                </span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">99,000₫</div>
                <div className="text-sm text-muted-foreground">/tháng</div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Gia hạn vào: <strong>{user.planExpiry}</strong>
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">✓</div>
                Trò chuyện không giới hạn
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">✓</div>
                Tư vấn qua voice call
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">✓</div>
                Theo dõi cảm xúc chi tiết
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">✓</div>
                Hỗ trợ ưu tiên 24/7
              </li>
            </ul>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">Nâng cấp gói</Button>
              <Button variant="ghost" className="flex-1">Hủy gói</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
