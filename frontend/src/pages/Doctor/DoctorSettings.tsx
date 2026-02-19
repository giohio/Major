import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Save, User, Briefcase, DollarSign, Languages, BookOpen } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';

interface DoctorProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  license_number: string;
  specialization: string;
  years_of_experience: number;
  bio?: string;
  consultation_fee: number;
  languages: string;
  is_available: boolean;
  is_verified: boolean;
  education?: string;
  certifications?: string;
}

export default function DoctorSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    specialization: '',
    years_of_experience: 0,
    consultation_fee: 0,
    languages: '',
    is_available: true,
    education: '',
    certifications: '',
    avatar_url: ''
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<DoctorProfile>('/doctors/profile');
      setProfile(response);
      
      // Populate form data
      setFormData({
        full_name: response.full_name || '',
        phone: response.phone || '',
        bio: response.bio || '',
        specialization: response.specialization || '',
        years_of_experience: response.years_of_experience || 0,
        consultation_fee: response.consultation_fee || 0,
        languages: response.languages || '',
        is_available: response.is_available ?? true,
        education: response.education || '',
        certifications: response.certifications || '',
        avatar_url: response.avatar_url || ''
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải thông tin hồ sơ';
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validate consultation fee
      if (formData.consultation_fee < 0) {
        toast({
          title: 'Lỗi',
          description: 'Giá tư vấn phải là số dương',
          variant: 'destructive'
        });
        return;
      }
      
      await apiClient.put('/doctors/profile', formData);
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật hồ sơ thành công'
      });
      
      // Refresh profile
      await refreshUser(); // Refresh user in AuthContext
      await fetchProfile();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ';
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSave = async () => {
    // Save current formData to profile
    await apiClient.put('/doctors/profile', formData);
    // Refresh user to get latest avatar
    await refreshUser();
    // Refresh profile data
    await fetchProfile();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cài đặt hồ sơ</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin cá nhân và cài đặt tư vấn của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </CardTitle>
            <CardDescription>
              Cập nhật thông tin cơ bản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>Ảnh đại diện</Label>
              <AvatarUpload
                currentAvatar={formData.avatar_url || ''}
                onAvatarChange={(newAvatar) => {
                  // Update formData to include avatar in form submission
                  setFormData({ ...formData, avatar_url: newAvatar });
                }}
                userName={profile?.full_name || 'Doctor'}
                userType="doctor"
                onSave={handleAvatarSave}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ và tên *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email không thể thay đổi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Thông tin chuyên môn
            </CardTitle>
            <CardDescription>
              Cập nhật thông tin chuyên môn và kinh nghiệm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Chuyên khoa *</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="VD: Tâm lý lâm sàng, Tâm thần học..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Số năm kinh nghiệm *</Label>
                <Input
                  id="years_of_experience"
                  type="number"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Giới thiệu bản thân</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Giới thiệu ngắn gọn về bản thân, chuyên môn và kinh nghiệm làm việc..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Học vấn</Label>
              <Textarea
                id="education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="e.g. Master's Degree in Psychology - National University of Hanoi..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Chứng chỉ</Label>
              <Textarea
                id="certifications"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="VD: Chứng chỉ CBT, DBT..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Consultation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cài đặt tư vấn
            </CardTitle>
            <CardDescription>
              Quản lý giá và ngôn ngữ tư vấn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consultation_fee">
                Giá tư vấn (VND) *
              </Label>
              <Input
                id="consultation_fee"
                type="number"
                min="0"
                step="1000"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
                required
              />
              <p className="text-sm text-muted-foreground">
                Giá hiện tại: {formatCurrency(formData.consultation_fee)}
              </p>
              <p className="text-xs text-muted-foreground">
                💡 Đề xuất: 200k-350k (bác sĩ thường), 350k-500k (chuyên khoa), 500k-1M (chuyên gia)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages" className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Ngôn ngữ hỗ trợ
              </Label>
              <Input
                id="languages"
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                placeholder="VD: Tiếng Việt, English, 日本語"
              />
              <p className="text-xs text-muted-foreground">
                Cách nhau bởi dấu phẩy
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="is_available" className="font-medium">
                  Trạng thái hoạt động
                </Label>
                <p className="text-sm text-muted-foreground">
                  Cho phép bệnh nhân đặt lịch với bạn
                </p>
              </div>
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Trạng thái tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Số giấy phép hành nghề:</span>
                <span className="font-medium">{profile.license_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Trạng thái xác minh:</span>
                <span className={`font-medium ${profile.is_verified ? 'text-green-600' : 'text-orange-600'}`}>
                  {profile.is_verified ? '✓ Đã xác minh' : '⏳ Chờ xác minh'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={fetchProfile}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
