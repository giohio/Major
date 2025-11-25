import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Search, Star, Clock, DollarSign, CheckCircle, Calendar } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: number;
  available: boolean;
  nextSlot?: string;
  price: number;
  languages: string[];
  verified: boolean;
}

const FindDoctor = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  const doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Nguyễn Văn An',
      specialty: 'Tâm lý lâm sàng',
      rating: 4.8,
      reviews: 127,
      experience: 10,
      available: true,
      nextSlot: 'Hôm nay, 14:00',
      price: 500000,
      languages: ['Tiếng Việt', 'English'],
      verified: true
    },
    {
      id: 2,
      name: 'Dr. Trần Thị Bình',
      specialty: 'Trị liệu CBT',
      rating: 4.9,
      reviews: 203,
      experience: 8,
      available: true,
      nextSlot: 'Ngày mai, 09:00',
      price: 600000,
      languages: ['Tiếng Việt'],
      verified: true
    },
    {
      id: 3,
      name: 'Dr. Lê Văn Cường',
      specialty: 'Tâm lý trẻ em',
      rating: 4.7,
      reviews: 89,
      experience: 12,
      available: false,
      nextSlot: '12/01, 15:00',
      price: 550000,
      languages: ['Tiếng Việt', 'English'],
      verified: true
    },
    {
      id: 4,
      name: 'Dr. Phạm Mai Dung',
      specialty: 'Tâm lý gia đình',
      rating: 4.9,
      reviews: 156,
      experience: 15,
      available: true,
      nextSlot: 'Hôm nay, 16:30',
      price: 700000,
      languages: ['Tiếng Việt', 'English', '中文'],
      verified: true
    },
    {
      id: 5,
      name: 'Dr. Hoàng Minh Đức',
      specialty: 'Tâm lý học tích cực',
      rating: 4.6,
      reviews: 74,
      experience: 6,
      available: true,
      nextSlot: 'Ngày mai, 10:30',
      price: 450000,
      languages: ['Tiếng Việt'],
      verified: false
    }
  ];

  const specialties = [
    'Tâm lý lâm sàng',
    'Trị liệu CBT',
    'Tâm lý trẻ em',
    'Tâm lý gia đình',
    'Tâm lý học tích cực'
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = (doctorId: number) => {
    navigate(`/user/book-appointment/${doctorId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tìm Bác Sĩ</h1>
        <p className="text-muted-foreground mt-1">
          Kết nối với các chuyên gia tâm lý hàng đầu
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên bác sĩ hoặc chuyên môn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn chuyên môn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chuyên môn</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Tìm thấy {filteredDoctors.length} bác sĩ
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {doctor.name}
                    {doctor.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {doctor.specialty}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{doctor.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({doctor.reviews} đánh giá)
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{doctor.experience} năm kinh nghiệm</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>{formatPrice(doctor.price)}/buổi</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {doctor.languages.map((lang, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>

              {doctor.available && doctor.nextSlot && (
                <div className="flex items-center gap-2 pt-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {doctor.nextSlot}
                  </span>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={doctor.available ? 'default' : 'outline'}
                disabled={!doctor.available}
                onClick={() => handleBookAppointment(doctor.id)}
              >
                {doctor.available ? 'Đặt lịch ngay' : 'Không khả dụng'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FindDoctor;
