import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Clock, Award, DollarSign, Languages, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { apiClient, API_ENDPOINTS } from '@/services/api';
import { toast } from 'sonner';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviews: number;
  price: number;
  available: boolean;
  nextSlot: string;
  languages: string[];
  avatar_url?: string;
  verified: boolean;
  bio?: string;
}

const FindDoctor: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Advanced filters
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('rating');

  // Get unique specialties and languages
  const specialties = ['all', ...new Set(doctors.map(d => d.specialty))];
  const allLanguages = ['all', ...new Set(doctors.flatMap(d => d.languages || []))];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get<{ doctors: Doctor[] }>(API_ENDPOINTS.DOCTOR.LIST);
      setDoctors(response.doctors || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast.error('Không thể tải danh sách bác sĩ');
      setLoading(false);
    }
  };

  const applyFilters = React.useCallback(() => {
    let filtered = [...doctors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Specialty filter
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }

    // Price range filter
    filtered = filtered.filter(doctor =>
      doctor.price >= priceRange[0] && doctor.price <= priceRange[1]
    );

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(doctor => doctor.rating >= minRating);
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(doctor =>
        doctor.languages && doctor.languages.includes(selectedLanguage)
      );
    }

    // Availability filter
    if (availableOnly) {
      filtered = filtered.filter(doctor => doctor.available);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecialty, priceRange, minRating, selectedLanguage, availableOnly, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setPriceRange([0, 1000000]);
    setMinRating(0);
    setSelectedLanguage('all');
    setAvailableOnly(false);
    setSortBy('rating');
  };

  const handleBookAppointment = (doctorId: number) => {
    navigate(`/user/book-appointment/${doctorId}`);
  };

  const handleViewProfile = (doctorId: number) => {
    navigate(`/user/doctors/${doctorId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading doctors list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tìm Bác Sĩ</h1>
        <p className="text-muted-foreground">
          Tìm kiếm và đặt lịch với các chuyên gia tâm lý hàng đầu
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên bác sĩ hoặc chuyên môn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-6 text-lg"
          />
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Bộ Lọc Nâng Cao</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Đặt lại
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Specialty */}
            <div>
              <label className="text-sm font-medium mb-2 block">Chuyên môn</label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty === 'all' ? 'Tất cả' : specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div>
              <label className="text-sm font-medium mb-2 block">Ngôn ngữ</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang === 'all' ? 'Tất cả' : lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Đánh giá tối thiểu: {minRating > 0 ? `${minRating}★` : 'Tất cả'}
              </label>
              <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Tất cả</SelectItem>
                  <SelectItem value="3">3★ trở lên</SelectItem>
                  <SelectItem value="4">4★ trở lên</SelectItem>
                  <SelectItem value="4.5">4.5★ trở lên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sắp xếp</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                  <SelectItem value="experience">Kinh nghiệm nhiều nhất</SelectItem>
                  <SelectItem value="price-low">Giá thấp đến cao</SelectItem>
                  <SelectItem value="price-high">Giá cao đến thấp</SelectItem>
                  <SelectItem value="reviews">Nhiều đánh giá nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">
              Khoảng giá: {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
            </label>
            <Slider
              min={0}
              max={1000000}
              step={50000}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mt-2"
            />
          </div>

          {/* Available Only Checkbox */}
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Show only available doctors</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-muted-foreground">
          Tìm thấy <span className="font-semibold text-foreground">{filteredDoctors.length}</span> bác sĩ
        </p>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={doctor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {doctor.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{doctor.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {doctor.specialty}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold">{doctor.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({doctor.reviews} đánh giá)
                </span>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{doctor.experience} năm kinh nghiệm</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 text-sm font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>{doctor.price.toLocaleString()}đ / buổi</span>
              </div>

              {/* Languages */}
              {doctor.languages && doctor.languages.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {doctor.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm">
                  {doctor.available ? `Khả dụng • ${doctor.nextSlot}` : 'Không khả dụng'}
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleViewProfile(doctor.id)}
              >
                Xem hồ sơ
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleBookAppointment(doctor.id)}
                disabled={!doctor.available}
              >
                Đặt lịch
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm</p>
          <Button variant="outline" onClick={resetFilters}>
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
};

export default FindDoctor;
