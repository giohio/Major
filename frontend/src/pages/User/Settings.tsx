import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Lock, Palette, Accessibility, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/services/api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import { toast } from 'sonner';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    weeklyReports: false,

    // Privacy
    shareDataForResearch: false,
    anonymousAnalytics: true,
    showOnlineStatus: true,

    // Appearance
    theme: 'light',
    language: 'vi',
    fontSize: 'medium',

    // Accessibility
    highContrast: false,
    reduceMotion: false,
    screenReader: false
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<typeof settings>(API_ENDPOINTS.USERS.SETTINGS);
      setSettings(data);
    } catch (error: unknown) {
      console.error('Failed to load settings:', error);
      toast.error('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await apiClient.put(API_ENDPOINTS.USERS.SETTINGS, newSettings);
      toast.success('Cài đặt đã được lưu');
    } catch (error: unknown) {
      console.error('Failed to save settings:', error);
      toast.error('Không thể lưu cài đặt');
    }
  };

  const handleToggle = (key: string) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key as keyof typeof settings]
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSelect = (key: string, value: string) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Đang tải cài đặt...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cài Đặt</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý tài khoản, thông báo và tùy chỉnh ứng dụng
        </p>
      </div>

      {/* Notifications Section */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Bell size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Thông Báo</h2>
            <p className="text-sm text-muted-foreground">
              Quản lý cách bạn nhận thông báo
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="email-notif">Email thông báo</Label>
              <p className="text-sm text-muted-foreground">
                Nhận thông báo qua email về buổi tư vấn và tin nhắn mới
              </p>
            </div>
            <Switch
              id="email-notif"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="push-notif">Thông báo đẩy</Label>
              <p className="text-sm text-muted-foreground">
                Nhận thông báo đẩy trên thiết bị của bạn
              </p>
            </div>
            <Switch
              id="push-notif"
              checked={settings.pushNotifications}
              onCheckedChange={() => handleToggle('pushNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="session-remind">Nhắc nhở buổi tư vấn</Label>
              <p className="text-sm text-muted-foreground">
                Nhận nhắc nhở 30 phút trước buổi tư vấn
              </p>
            </div>
            <Switch
              id="session-remind"
              checked={settings.sessionReminders}
              onCheckedChange={() => handleToggle('sessionReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="weekly-report">Báo cáo hàng tuần</Label>
              <p className="text-sm text-muted-foreground">
                Nhận tóm tắt tiến trình hàng tuần qua email
              </p>
            </div>
            <Switch
              id="weekly-report"
              checked={settings.weeklyReports}
              onCheckedChange={() => handleToggle('weeklyReports')}
            />
          </div>
        </div>
      </Card>

      {/* Privacy Section */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <Lock size={20} className="text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Quyền Riêng Tư</h2>
            <p className="text-sm text-muted-foreground">
              Kiểm soát dữ liệu và quyền riêng tư của bạn
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="share-data">Chia sẻ dữ liệu nghiên cứu</Label>
              <p className="text-sm text-muted-foreground">
                Cho phép dữ liệu ẩn danh được sử dụng cho nghiên cứu y khoa
              </p>
            </div>
            <Switch
              id="share-data"
              checked={settings.shareDataForResearch}
              onCheckedChange={() => handleToggle('shareDataForResearch')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="analytics">Phân tích ẩn danh</Label>
              <p className="text-sm text-muted-foreground">
                Gửi dữ liệu sử dụng ẩn danh để cải thiện ứng dụng
              </p>
            </div>
            <Switch
              id="analytics"
              checked={settings.anonymousAnalytics}
              onCheckedChange={() => handleToggle('anonymousAnalytics')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="online-status">Hiển thị trạng thái online</Label>
              <p className="text-sm text-muted-foreground">
                Cho phép bác sĩ thấy khi bạn đang online
              </p>
            </div>
            <Switch
              id="online-status"
              checked={settings.showOnlineStatus}
              onCheckedChange={() => handleToggle('showOnlineStatus')}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            Xem chính sách bảo mật
          </Button>
          <Button variant="outline" size="sm">
            Tải xuống dữ liệu của tôi
          </Button>
        </div>
      </Card>

      {/* Appearance Section */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <Palette size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Giao Diện</h2>
            <p className="text-sm text-muted-foreground">
              Tùy chỉnh giao diện ứng dụng
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Chủ đề</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={settings.theme === 'light' ? 'default' : 'outline'}
                onClick={() => handleSelect('theme', 'light')}
                className="w-full"
              >
                ☀️ Sáng
              </Button>
              <Button
                variant={settings.theme === 'dark' ? 'default' : 'outline'}
                onClick={() => handleSelect('theme', 'dark')}
                className="w-full"
              >
                🌙 Tối
              </Button>
              <Button
                variant={settings.theme === 'auto' ? 'default' : 'outline'}
                onClick={() => handleSelect('theme', 'auto')}
                className="w-full"
              >
                ⚙️ Tự động
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Ngôn ngữ</Label>
            <Select value={settings.language} onValueChange={(value: string) => handleSelect('language', value)}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cỡ chữ</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={settings.fontSize === 'small' ? 'default' : 'outline'}
                onClick={() => handleSelect('fontSize', 'small')}
                className="w-full"
              >
                Nhỏ
              </Button>
              <Button
                variant={settings.fontSize === 'medium' ? 'default' : 'outline'}
                onClick={() => handleSelect('fontSize', 'medium')}
                className="w-full"
              >
                Trung bình
              </Button>
              <Button
                variant={settings.fontSize === 'large' ? 'default' : 'outline'}
                onClick={() => handleSelect('fontSize', 'large')}
                className="w-full"
              >
                Lớn
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Accessibility Section */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
            <Accessibility size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Trợ Năng</h2>
            <p className="text-sm text-muted-foreground">
              Cài đặt cho người dùng có nhu cầu đặc biệt
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="high-contrast">Độ tương phản cao</Label>
              <p className="text-sm text-muted-foreground">
                Tăng độ tương phản màu sắc để dễ đọc hơn
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={() => handleToggle('highContrast')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="reduce-motion">Giảm chuyển động</Label>
              <p className="text-sm text-muted-foreground">
                Giảm hiệu ứng chuyển động và hoạt ảnh
              </p>
            </div>
            <Switch
              id="reduce-motion"
              checked={settings.reduceMotion}
              onCheckedChange={() => handleToggle('reduceMotion')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="screen-reader">Hỗ trợ đọc màn hình</Label>
              <p className="text-sm text-muted-foreground">
                Tối ưu hóa cho phần mềm đọc màn hình
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={settings.screenReader}
              onCheckedChange={() => handleToggle('screenReader')}
            />
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-destructive">Vùng Nguy Hiểm</h2>
            <p className="text-sm text-muted-foreground">
              Các hành động không thể hoàn tác
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
            Xóa lịch sử chat
          </Button>
          <Button variant="outline" size="sm" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
            Hủy kích hoạt tài khoản
          </Button>
          <Button variant="destructive" size="sm" className="w-full">
            Xóa tài khoản vĩnh viễn
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
